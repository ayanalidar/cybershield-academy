import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 120000,
  pingInterval: 30000,
});

interface TerminalSession {
  socketId: string;
  userId: string;
  labSessionId: string;
  containerName: string;
  commandHistory: string[];
  currentLine: string;
  cwd: string;
  objectives: { id: string; description: string; completed: boolean; verificationPattern?: string }[];
  startedAt: Date;
}

const activeSessions = new Map<string, TerminalSession>();

const SIMULATED_FS: Record<string, string[]> = {
  '/': ['home', 'etc', 'var', 'tmp', 'usr', 'opt'],
  '/home': ['student'],
  '/home/student': ['.bashrc', '.profile', 'notes.txt', 'exercises'],
  '/home/student/exercises': ['task1.sh', 'task2.py', 'challenge.c', 'readme.md'],
  '/etc': ['passwd', 'shadow', 'hosts', 'hostname', 'resolv.conf'],
  '/tmp': [],
  '/var': ['log', 'www'],
  '/var/log': ['syslog', 'auth.log', 'kern.log'],
};

const FILE_CONTENTS: Record<string, string> = {
  '/home/student/notes.txt': 'Cybersecurity Lab Notes\n=========================\nRemember: Always verify before trusting.\nKey concepts to review:\n- TCP three-way handshake\n- OWASP Top 10\n- Principle of least privilege',
  '/home/student/exercises/readme.md': '# Lab Exercises\n\nComplete each task by running the corresponding script.\n\n## Task 1: Network Reconnaissance\nRun: bash task1.sh\n\n## Task 2: Vulnerability Scanner\nRun: python3 task2.py\n\n## Challenge: Buffer Overflow\nReview and compile: gcc -o challenge challenge.c',
  '/home/student/exercises/task1.sh': '#!/bin/bash\necho "=== Network Reconnaissance Exercise ==="\necho "Scanning local network..."\necho "Found hosts:"\necho "  192.168.1.1  - Gateway (open ports: 53, 80, 443)"\necho "  192.168.1.10 - Web Server (open ports: 22, 80, 8080)"\necho "  192.168.1.20 - Database (open ports: 22, 3306)"\necho "\nScan complete. 3 hosts discovered."',
  '/home/student/exercises/task2.py': 'import hashlib\n\ndef check_password_hash(password: str, target_hash: str) -> bool:\n    return hashlib.sha256(password.encode()).hexdigest() == target_hash\n\n# Exercise: Find the weak password\ndb = {"admin": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"}\nprint("Password Hash Database:")\nfor user, h in db.items():\n    print(f"  {user}: {h[:32]}...")\n\nprint("\\nHint: This is a very common password.")\nprint("Try common passwords or use a dictionary approach.")',
  '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nstudent:x:1000:1000:Student User:/home/student:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
};

const LAB_OBJECTIVE_PATTERNS: Record<string, RegExp> = {
  'nmap': /nmap\s/,
  'scan': /scan/,
  'hash': /sha256|hashlib|md5sum/,
  'password': /password|passwd/,
  'iptables': /iptables/,
  'curl': /curl\s/,
  'file-analysis': /file\s|readelf|objdump|strings/,
  'encryption': /openssl|encrypt|decrypt/,
};

function resolvePath(cwd: string, target: string): string {
  if (target.startsWith('/')) return normalizePath(target);
  if (target === '..') {
    const parts = cwd.split('/').filter(Boolean);
    parts.pop();
    return '/' + parts.join('/');
  }
  if (target === '.') return cwd;
  return normalizePath(cwd + '/' + target);
}

function normalizePath(p: string): string {
  const parts = p.split('/').filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '..') resolved.pop();
    else if (part !== '.') resolved.push(part);
  }
  return '/' + resolved.join('/');
}

function simulateCommand(session: TerminalSession, cmd: string): string {
  const trimmed = cmd.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  session.commandHistory.push(trimmed);

  switch (command) {
    case 'help':
      return [
        'Available commands:',
        '  ls [path]         - List directory contents',
        '  cd <path>         - Change directory',
        '  cat <file>        - Display file contents',
        '  pwd               - Print working directory',
        '  whoami            - Show current user',
        '  echo <text>       - Print text',
        '  clear             - Clear terminal',
        '  nmap <target>     - Network scanner (simulated)',
        '  hashcat <hash>    - Password cracker (simulated)',
        '  python3 <file>    - Run Python script',
        '  bash <file>       - Run bash script',
        '  file <path>       - Identify file type',
        '  strings <file>    - Extract strings from binary',
        '  objdump <file>    - Disassemble binary',
        '  openssl <cmd>     - Cryptography toolkit',
        '  iptables <cmd>    - Firewall configuration',
        '  curl <url>        - HTTP client',
        '  whoami            - Show current user',
        '  uname -a          - System information',
        '  history           - Show command history',
        '  status            - Show lab objectives progress',
      ].join('\n');

    case 'clear':
      return '\x1b[2J\x1b[H';

    case 'pwd':
      return session.cwd;

    case 'whoami':
      return 'student';

    case 'uname':
      if (args.includes('-a')) return 'Linux cybershield-lab 5.15.0-91-generic #101 SMP x86_64 GNU/Linux';
      return 'Linux';

    case 'ls': {
      const target = args[0] ? resolvePath(session.cwd, args[0]) : session.cwd;
      const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const contents = SIMULATED_FS[target];
      if (!contents) return `ls: cannot access '${target}': No such file or directory`;
      let output = '';
      if (showHidden) output += '.  ..  ';
      output += contents.join('  ');
      return output;
    }

    case 'cd': {
      if (!args[0] || args[0] === '~') {
        session.cwd = '/home/student';
        return '';
      }
      const target = resolvePath(session.cwd, args[0]);
      if (SIMULATED_FS[target] !== undefined) {
        session.cwd = target;
        return '';
      }
      return `cd: ${args[0]}: No such file or directory`;
    }

    case 'cat': {
      if (!args[0]) return 'cat: missing operand';
      const filePath = resolvePath(session.cwd, args[0]);
      const content = FILE_CONTENTS[filePath];
      if (!content) return `cat: ${args[0]}: No such file or directory`;
      checkObjectives(session, trimmed);
      return content;
    }

    case 'echo':
      return args.join(' ');

    case 'history':
      return session.commandHistory
        .map((c, i) => `  ${i + 1}  ${c}`)
        .join('\n');

    case 'nmap': {
      checkObjectives(session, trimmed);
      const target = args.find((a) => !a.startsWith('-')) ?? '127.0.0.1';
      return [
        `Starting Nmap 7.94 ( https://nmap.org )`,
        `Nmap scan report for ${target}`,
        `Host is up (0.0023s latency).`,
        `PORT     STATE SERVICE     VERSION`,
        `22/tcp   open  ssh         OpenSSH 8.9p1`,
        `80/tcp   open  http        Apache/2.4.52`,
        `443/tcp  open  https       Apache/2.4.52`,
        `3306/tcp open  mysql       MySQL 8.0.32`,
        `8080/tcp open  http-proxy  nginx/1.23.3`,
        ``,
        `Service detection performed.`,
        `Nmap done: 1 IP address (1 host up) scanned in 3.47 seconds`,
      ].join('\n');
    }

    case 'python3':
    case 'python': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'Python 3.10.12 (main, Jun 11 2023, 05:26:28) [GCC 11.4.0]';
      const filePath = resolvePath(session.cwd, args[0]);
      const script = FILE_CONTENTS[filePath];
      if (!script) return `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
      return `Password Hash Database:\n  admin: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8...\n\nHint: This is a very common password.\nTry common passwords or use a dictionary approach.`;
    }

    case 'bash':
    case 'sh': {
      checkObjectives(session, trimmed);
      if (!args[0]) return '$ ';
      const filePath = resolvePath(session.cwd, args[0]);
      const script = FILE_CONTENTS[filePath];
      if (!script) return `bash: ${args[0]}: No such file or directory`;
      return script
        .replace(/^#!.*\n/, '')
        .replace(/echo\s+"?([^"]*)"?/g, '$1')
        .replace(/\\n/g, '\n');
    }

    case 'hashcat':
    case 'john': {
      checkObjectives(session, trimmed);
      return [
        `hashcat (v6.2.6) starting...`,
        `Hashes: 1 digest; 1 unique digests, 1 unique salts`,
        `Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask`,
        ``,
        `5e884898...:password`,
        ``,
        `Session..........: hashcat`,
        `Status...........: Cracked`,
        `Hash.Mode........: 1400 (SHA2-256)`,
        `Hash.Target......: admin hash`,
        `Time.Started.....: ${new Date().toISOString().split('T')[0]}`,
        ``,
        `1 recovered from 1 input hashes`,
      ].join('\n');
    }

    case 'openssl': {
      checkObjectives(session, trimmed);
      if (args[0] === 'enc' || args[0] === 'dgst') {
        return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      }
      return `OpenSSL 3.0.2 15 Mar 2022 (Library: OpenSSL 3.0.2)`;
    }

    case 'file': {
      checkObjectives(session, trimmed);
      const target = args[0] ?? '';
      if (target.includes('.py')) return `${target}: Python script, ASCII text executable`;
      if (target.includes('.sh')) return `${target}: Bourne-Again shell script, ASCII text executable`;
      if (target.includes('.c')) return `${target}: C source, ASCII text`;
      return `${target}: data`;
    }

    case 'strings':
      checkObjectives(session, trimmed);
      return args[0]
        ? [`/lib/x86_64-linux-gnu/libc.so.6`, `__libc_start_main`, `GLIBC_2.34`, `_ITM_registerTMCloneTable`, `__gmon_start__`].join('\n')
        : 'strings: missing operand';

    case 'objdump':
      checkObjectives(session, trimmed);
      return args[0]
        ? [`\n${args[0]}:     file format elf64-x86-64`, `\nDisassembly of section .text:`, `\n0000000000001149 <main>:`, `    1149:    f3 0f 1e fa             endbr64`, `    114d:    55                      push   rbp`, `    114e: 48 89 e5                mov    rbp,rsp`].join('\n')
        : 'objdump: missing operand';

    case 'iptables': {
      checkObjectives(session, trimmed);
      if (args[0] === '-L' || args[0] === '--list') {
        return [
          `Chain INPUT (policy ACCEPT)`,
          `target     prot opt source       destination`,
          `ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:22`,
          `ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:80`,
          `DROP       all  --  0.0.0.0/0    0.0.0.0/0    state INVALID`,
          ``,
          `Chain FORWARD (policy DROP)`,
          `target     prot opt source       destination`,
          ``,
          `Chain OUTPUT (policy ACCEPT)`,
          `target     prot opt source       destination`,
        ].join('\n');
      }
      return `iptables: command executed. Rules updated.`;
    }

    case 'curl': {
      checkObjectives(session, trimmed);
      const url = args.find((a) => a.startsWith('http')) ?? 'http://localhost:8080';
      return [
        `  % Total    % Received % Xferd  Average Speed   Time`,
        `100  1256  100  1256    0     0   42500      0 --:--:-- --:--:-- --:--:--  52333`,
        `<!DOCTYPE html>`,
        `<html><head><title>Test Server</title></head>`,
        `<body><h1>Welcome to the test server</h1>`,
        `<p>Server: Apache/2.4.52</p>`,
        `</body></html>`,
      ].join('\n');
    }

    case 'status': {
      const completed = session.objectives.filter((o) => o.completed).length;
      const total = session.objectives.length;
      const lines = [`=== Lab Objectives Progress ===`, `${completed}/${total} completed\n`];
      for (const obj of session.objectives) {
        const icon = obj.completed ? '[x]' : '[ ]';
        lines.push(`  ${icon} ${obj.description}`);
      }
      return lines.join('\n');
    }

    case 'id':
      return 'uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)';

    case 'date':
      return new Date().toString();

    case 'ifconfig':
    case 'ip':
      return [
        `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`,
        `        inet 172.17.0.3  netmask 255.255.0.0  broadcast 172.17.255.255`,
        `        inet6 fe80::42:acff:fe11:3  prefixlen 64  scopeid 0x20<link>`,
        `        ether 02:42:ac:11:00:03  txqueuelen 0  (Ethernet)`,
        `lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536`,
        `        inet 127.0.0.1  netmask 255.0.0.0`,
      ].join('\n');

    default:
      return `bash: ${command}: command not found. Type 'help' for available commands.`;
  }
}

function checkObjectives(session: TerminalSession, command: string): void {
  const lowerCmd = command.toLowerCase();
  for (const obj of session.objectives) {
    if (obj.completed) continue;
    if (obj.verificationPattern) {
      const pattern = new RegExp(obj.verificationPattern, 'i');
      if (pattern.test(lowerCmd)) {
        obj.completed = true;
        continue;
      }
    }
    for (const [keyword, regex] of Object.entries(LAB_OBJECTIVE_PATTERNS)) {
      if (obj.description.toLowerCase().includes(keyword) && regex.test(lowerCmd)) {
        obj.completed = true;
        break;
      }
    }
  }

  const completed = session.objectives.filter((o) => o.completed).length;
  if (completed === session.objectives.length && session.objectives.length > 0) {
    io.to(session.labSessionId).emit('lab:completed', {
      labSessionId: session.labSessionId,
      message: 'All lab objectives completed! Great work.',
      score: 1.0,
    });
  }
}

io.on('connection', (socket) => {
  console.log(`[Terminal] Client connected: ${socket.id}`);

  socket.on('terminal:join', (data: { userId: string; labSessionId: string; containerName: string; objectives: { id: string; description: string; verificationPattern?: string }[] }) => {
    const { userId, labSessionId, containerName, objectives } = data;

    const session: TerminalSession = {
      socketId: socket.id,
      userId,
      labSessionId,
      containerName,
      commandHistory: [],
      currentLine: '',
      cwd: '/home/student',
      objectives: objectives.map((o) => ({ ...o, completed: false })),
      startedAt: new Date(),
    };

    activeSessions.set(socket.id, session);
    socket.join(labSessionId);

    const welcomeLines = [
      `\x1b[1;32m╔═══════════════════════════════════════════════════╗\x1b[0m`,
      `\x1b[1;32m║                                                   ║\x1b[0m`,
      `\x1b[1;32m║         CyberShield Academy - Secure Lab           ║\x1b[0m`,
      `\x1b[1;32m║                                                   ║\x1b[0m`,
      `\x1b[1;32m╚═══════════════════════════════════════════════════╝\x1b[0m`,
      ``,
      `Container: ${containerName}`,
      `User: student`,
      `Working directory: /home/student`,
      ``,
      `Type \x1b[1m'help'\x1b[0m for available commands.`,
      `Type \x1b[1m'status'\x1b[0m to check lab objectives.`,
      ``,
    ];

    socket.emit('terminal:output', { data: welcomeLines.join('\r\n') + '\r\n' });
    socket.emit('terminal:prompt', { cwd: session.cwd });

    console.log(`[Terminal] Session started for user ${userId} in lab ${labSessionId}`);
  });

  socket.on('terminal:input', (data: { input: string }) => {
    const session = activeSessions.get(socket.id);
    if (!session) {
      socket.emit('terminal:output', { data: 'Error: No active terminal session.\r\n' });
      return;
    }

    const input = data.input;
    session.currentLine += input;

    if (input.includes('\r') || input.includes('\n')) {
      const cmd = session.currentLine.replace(/[\r\n]/g, '');
      session.currentLine = '';

      const prompt = `\x1b[1;34mstudent@cybershield\x1b[0m:\x1b[1;32m${session.cwd}\x1b[0m$ `;
      const output = simulateCommand(session, cmd);

      if (output === '\x1b[2J\x1b[H') {
        socket.emit('terminal:clear', {});
      } else if (output) {
        socket.emit('terminal:output', { data: prompt + cmd + '\r\n' + output + '\r\n' });
      } else {
        socket.emit('terminal:output', { data: prompt + cmd + '\r\n' });
      }

      socket.emit('terminal:prompt', { cwd: session.cwd });

      socket.to(session.labSessionId).emit('terminal:command', {
        command: cmd,
        userId: session.userId,
        timestamp: new Date().toISOString(),
      });

      const completed = session.objectives.filter((o) => o.completed).length;
      socket.to(session.labSessionId).emit('lab:progress', {
        labSessionId: session.labSessionId,
        objectivesCompleted: session.objectives,
        progressRatio: completed / session.objectives.length,
      });
    } else {
      socket.emit('terminal:output', { data: input });
    }
  });

  socket.on('terminal:resize', (data: { cols: number; rows: number }) => {
    socket.emit('terminal:resized', { cols: data.cols, rows: data.rows });
  });

  socket.on('disconnect', () => {
    const session = activeSessions.get(socket.id);
    if (session) {
      console.log(`[Terminal] Session ended for user ${session.userId}`);
      activeSessions.delete(socket.id);
    }
  });

  socket.on('error', (error) => {
    console.error(`[Terminal] Socket error (${socket.id}):`, error);
  });
});

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`[Terminal Service] WebSocket terminal running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[Terminal Service] Shutting down...');
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Terminal Service] Shutting down...');
  httpServer.close(() => process.exit(0));
});