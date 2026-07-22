import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
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
  env: Record<string, string>;
  labType: string;
  objectives: { id: string; description: string; completed: boolean; verificationPattern?: string }[];
  startedAt: Date;
}

const activeSessions = new Map<string, TerminalSession>();

const SIMULATED_FS: Record<string, string[]> = {
  '/': ['home', 'etc', 'var', 'tmp', 'usr', 'opt', 'root', 'srv'],
  '/home': ['student', 'admin'],
  '/home/student': ['.bashrc', '.profile', '.ssh', 'notes.txt', 'exercises', 'tools', 'targets', 'captures'],
  '/home/student/.ssh': ['id_rsa', 'id_rsa.pub', 'known_hosts', 'authorized_keys'],
  '/home/student/exercises': ['task1.sh', 'task2.py', 'challenge.c', 'readme.md', 'buffer_overflow.c', 'web_exploit.py'],
  '/home/student/tools': ['scanner.py', 'cracker.py', 'fuzzer.sh', 'exploit.js'],
  '/home/student/targets': ['vulnerable_app', 'docker-compose.yml', 'config.yaml', 'database.sql'],
  '/home/student/captures': ['network_capture.pcap', 'memory_dump.raw', 'disk_image.dd'],
  '/home/admin': ['.bash_history', 'secrets', 'scripts'],
  '/home/admin/secrets': ['passwords.db', 'api_keys.env', 'shadow.bak'],
  '/etc': ['passwd', 'shadow', 'hosts', 'hostname', 'resolv.conf', 'nginx', 'ssh', 'crontab', 'fstab'],
  '/etc/nginx': ['nginx.conf', 'sites-enabled'],
  '/etc/nginx/sites-enabled': ['default', 'vulnerable-app.conf'],
  '/etc/ssh': ['sshd_config', 'ssh_config'],
  '/tmp': ['exploit_test.py', 'output.txt', 'flag_test.txt'],
  '/var': ['log', 'www', 'lib', 'cache'],
  '/var/log': ['syslog', 'auth.log', 'kern.log', 'nginx', 'apache2', 'mysql'],
  '/var/log/nginx': ['access.log', 'error.log'],
  '/var/log/apache2': ['access.log', 'error.log'],
  '/var/www': ['html'],
  '/var/www/html': ['index.html', 'login.php', 'dashboard.php', 'api', 'uploads'],
  '/var/www/html/api': ['endpoint.php', 'search.php', 'fetch.php'],
  '/var/www/html/uploads': ['image.png', 'document.pdf'],
  '/usr': ['bin', 'local', 'share'],
  '/usr/bin': ['nmap', 'hashcat', 'john', 'sqlmap', 'nikto', 'gobuster', 'hydra', 'wireshark'],
  '/root': ['.bashrc', 'rootkit.sh', 'backdoor.py'],
  '/srv': ['ctf-challenges'],
  '/srv/ctf-challenges': ['crypto', 'web', 'pwn', 'forensics', 'osint'],
  '/srv/ctf-challenges/crypto': ['caesar.py', 'rsa_challenge.py', 'xor_decrypt.py'],
  '/srv/ctf-challenges/web': ['sqli.php', 'xss.html', 'jwt_test.py'],
  '/srv/ctf-challenges/pwn': ['vuln.c', 'format_string.c', 'rop_challenge'],
  '/srv/ctf-challenges/forensics': ['evidence.dd', 'suspicious.png', 'traffic.pcap'],
  '/srv/ctf-challenges/osint': ['target_profile.json', 'photo_metadata.jpg'],
};

const FILE_CONTENTS: Record<string, string> = {
  '/home/student/notes.txt': 'Cybersecurity Lab Notes\n=========================\nSession 1: Network Reconnaissance\n- Always verify before trusting\n- TCP three-way handshake: SYN -> SYN-ACK -> ACK\n- OWASP Top 10 vulnerabilities\n- Principle of least privilege\n\nSession 2: Web App Security\n- XSS types: Reflected, Stored, DOM-based\n- SQLi: Union-based, Blind, Time-based\n- CSRF tokens prevent cross-site requests\n- JWT security: never use "none" algorithm\n\nTODO:\n- Complete buffer overflow lab\n- Practice steganography tools\n- Review PCAP analysis techniques',
  '/home/student/exercises/readme.md': '# Lab Exercises\n\n## Network Reconnaissance (Easy)\nRun: bash task1.sh\n\n## Password Cracking (Medium)\nRun: python3 task2.py\n\n## Buffer Overflow (Hard)\nReview and compile: gcc -o challenge challenge.c\nRun: ./challenge\n\n## Web Exploit (Medium)\nRun: python3 web_exploit.py',
  '/home/student/exercises/task1.sh': '#!/bin/bash\necho "=== Network Reconnaissance Exercise ==="\necho "Scanning local network segment..."\necho ""\necho "Discovering hosts on 192.168.1.0/24..."\necho "  192.168.1.1   - Gateway         (open: 53, 80, 443)"\necho "  192.168.1.10  - Web Server      (open: 22, 80, 8080, 8443)"\necho "  192.168.1.20  - Database        (open: 22, 3306, 5432)"\necho "  192.168.1.30  - Mail Server     (open: 22, 25, 143, 587, 993)"\necho "  192.168.1.40  - File Server     (open: 22, 139, 445)"\necho "  192.168.1.50  - Dev Server      (open: 22, 3000, 8080)"\necho ""\necho "Scan complete. 6 hosts discovered, 3 critical vulnerabilities found."',
  '/home/student/exercises/task2.py': 'import hashlib\n\ndef check_password_hash(password: str, target_hash: str) -> bool:\n    return hashlib.sha256(password.encode()).hexdigest() == target_hash\n\nprint("=== Password Hash Cracking Lab ===")\nprint("")\nprint("Target Database:")\ndb = {\n    "admin": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",\n    "root": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",\n    "user1": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",\n}\nfor user, h in db.items():\n    print(f"  {user}: {h[:40]}...")\nprint("")\nprint("Hint: These are very common passwords. Try a dictionary approach.")\nprint("Use hashcat: hashcat -m 1400 hashes.txt rockyou.txt")',
  '/home/student/exercises/challenge.c': '/* Buffer Overflow Challenge */\n#include <stdio.h>\n#include <stdlib.h>\n\nvoid win() {\n    FILE *f = fopen("flag.txt", "r");\n    char flag[64];\n    fgets(flag, 64, f);\n    printf("Flag: %s\\n", flag);\n    fclose(f);\n}\n\nvoid vuln() {\n    char buf[64];\n    printf("Enter your name: ");\n    gets(buf);  // Vulnerable!\n    printf("Hello, %s!\\n", buf);\n}\n\nint main() {\n    vuln();\n    return 0;\n}',
  '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nstudent:x:1000:1000:Student User:/home/student:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nmysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false\nnginx:x:101:101:nginx user:/nonexistent:/usr/sbin/nologin\nadmin:x:1001:1001:Admin User:/home/admin:/bin/bash',
  '/etc/hosts': '127.0.0.1\tlocalhost\n127.0.1.1\tcybershield-lab\n192.168.1.10\tweb.target.local\n192.168.1.20\tdb.target.local\n192.168.1.30\tmail.target.local',
  '/var/www/html/index.html': '<!DOCTYPE html>\n<html><head><title>Target Corp</title></head>\n<body>\n<h1>Welcome to Target Corp</h1>\n<p>Internal portal v2.3.1</p>\n<!-- TODO: Remove debug endpoint /api/debug before production -->\n<!-- TODO: Fix SQL injection in login.php -->\n</body></html>',
  '/var/www/html/login.php': '<?php\n// VULNERABLE LOGIN - DO NOT USE IN PRODUCTION\n$db = new PDO("mysql:host=localhost;dbname=app", "root", "toor");\n$user = $_POST[\'username\'];\n$pass = $_POST[\'password\'];\n// VULNERABLE: Direct string interpolation\n$query = "SELECT * FROM users WHERE username=\'$user\' AND password=\'$pass\'";\n$result = $db->query($query);\nif ($result->rowCount() > 0) { setcookie("auth", "admin_token_" . md5($pass)); header("Location: dashboard.php"); }\n?>',
  '/home/student/.bashrc': '# ~/.bashrc\nexport PS1="\\[\\e[1;32m\\]student@cybershield\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]$ "\nexport PATH="/usr/local/bin:$PATH"\nalias ll="ls -la"\nalias cls="clear"',
  '/home/admin/secrets/passwords.db': 'admin:$2b$12$LJ3m4ys3Lk.6vNK8jHPzKOaW5WCBbFAq/CqWvNBuEQfO8bEqZpOe\nservice_account:svc_pass_2024!@#\ndeploy_key:xK9#mP2$vL7@nQ4\nbackup_user:B4ckup_P@ssw0rd!',
  '/tmp/flag_test.txt': 'CYBERSHIELD{t3mp_f1l3_fl4g}',
  '/srv/ctf-challenges/crypto/caesar.py': 'import sys\ndef rot13(text): result = []\n    for c in text:\n        if c.isalpha(): base = ord("a") if c.islower() else ord("A")\n        result.append(chr((ord(c) - base + 13) % 26 + base))\n        else: result.append(c)\n    return "".join(result)\nif __name__ == "__main__": print(rot13(sys.argv[1]))',
  '/var/log/auth.log': 'Jul 22 10:15:23 sshd[1234]: Failed password for root from 192.168.1.50 port 22 ssh2\nJul 22 10:15:25 sshd[1234]: Failed password for root from 192.168.1.50 port 22 ssh2\nJul 22 10:15:28 sshd[1234]: Failed password for root from 192.168.1.50 port 22 ssh2\nJul 22 10:15:30 sshd[1234]: Failed password for admin from 192.168.1.50 port 22 ssh2\nJul 22 10:20:00 sshd[1235]: Accepted password for student from 10.0.0.1 port 22 ssh2',
  '/var/log/nginx/access.log': '10.0.0.1 - - [22/Jul/2026:10:00:00 +0000] "GET / HTTP/1.1" 200 1256\n192.168.1.50 - - [22/Jul/2026:10:05:00 +0000] "GET /admin HTTP/1.1" 403 128\n192.168.1.50 - - [22/Jul/2026:10:05:02 +0000] "POST /login.php HTTP/1.1" 200 512\n192.168.1.50 - - [22/Jul/2026:10:05:05 +0000] "GET /dashboard.php HTTP/1.1" 200 2048\n192.168.1.50 - - [22/Jul/2026:10:06:00 +0000] "GET /api/fetch?url=http://127.0.0.1:8080/admin HTTP/1.1" 200 4096',
};

const LAB_OBJECTIVE_PATTERNS: Record<string, RegExp> = {
  'nmap': /nmap\s/,
  'scan': /scan/,
  'hash': /sha256|hashlib|md5sum|hashcat|john/,
  'password': /password|passwd/,
  'iptables': /iptables/,
  'curl': /curl\s/,
  'file-analysis': /file\s|readelf|objdump|strings/,
  'encryption': /openssl|encrypt|decrypt/,
  'sql': /sqlmap|sql\s|mysql|sqlite/,
  'web': /curl|nikto|gobuster|dirb/,
  'forensics': /volatility|fls|icat|mmls|exiftool/,
  'exploit': /exploit|payload|shellcode/,
  'osint': /whois|dig|nslookup|theHarvester/,
  'pcap': /tshark|tcpdump|wireshark/,
  'stego': /steghide|stegseek|binwalk/,
  'gdb': /gdb\s/,
  'python': /python3?\s/,
  'bash': /bash\s|\.sh/,
  'dns': /dig|nslookup|dns/,
  'network': /ifconfig|ip\s|netstat|ss\s/,
  'log': /cat\s.*\.log|tail|grep.*log/,
  'vuln': /nikto|sqlmap|nmap.*-sV/,
};

function resolvePath(cwd: string, target: string): string {
  if (target.startsWith('/')) return normalizePath(target);
  if (target === '..') { const parts = cwd.split('/').filter(Boolean); parts.pop(); return '/' + parts.join('/'); }
  if (target === '.') return cwd;
  return normalizePath(cwd + '/' + target);
}

function normalizePath(p: string): string {
  const parts = p.split('/').filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) { if (part === '..') resolved.pop(); else if (part !== '.') resolved.push(part); }
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
        'CyberShield Lab - Available Commands:',
        '',
        '  Navigation & Files:',
        '    ls [path]           List directory contents',
        '    cd <path>           Change directory',
        '    cat <file>          Display file contents',
        '    head/tail <file>    Show beginning/end of file',
        '    grep <pattern> <file> Search in files',
        '    find <path> -name   Search for files',
        '    pwd                 Print working directory',
        '    tree                Show directory tree',
        '    file <path>         Identify file type',
        '    strings <file>      Extract strings from binary',
        '    wc <file>           Count lines/words/chars',
        '',
        '  Network:',
        '    nmap <target>       Network scanner (simulated)',
        '    curl <url>          HTTP client',
        '    dig <domain>        DNS lookup',
        '    whois <domain>      Domain registration info',
        '    ifconfig / ip a     Show network interfaces',
        '    netstat / ss        Show network connections',
        '    ping <host>         Ping a host',
        '    traceroute <host>   Trace packet route',
        '',
        '  Security Tools:',
        '    hashcat <hash>      Password cracker (simulated)',
        '    john <file>         John the Ripper (simulated)',
        '    sqlmap <url>        SQL injection tool (simulated)',
        '    nikto <url>         Web vulnerability scanner',
        '    gobuster <url>      Directory bruteforcer',
        '    hydra <target>      Online password cracker',
        '    openssl <cmd>       Cryptography toolkit',
        '    iptables <cmd>      Firewall configuration',
        '    gdb <binary>        GNU debugger',
        '',
        '  Forensics:',
        '    exiftool <file>     Extract metadata',
        '    binwalk <file>      Analyze firmware/images',
        '    volatility <args>   Memory forensics',
        '    steghide <file>     Steganography tool',
        '',
        '  System:',
        '    whoami / id         Show current user',
        '    uname -a            System information',
        '    ps aux              List processes',
        '    top / htop          Process monitor',
        '    chmod / chown       Change permissions/owner',
        '    history             Show command history',
        '    status              Show lab objectives',
        '    clear               Clear terminal',
        '',
        '  Development:',
        '    python3 <file>      Run Python script',
        '    bash <file>         Run bash script',
        '    gcc <file>          Compile C program',
        '    echo <text>         Print text',
        '    env                 Show environment variables',
      ].join('\n');

    case 'clear': return '\x1b[2J\x1b[H]';
    case 'pwd': return session.cwd;
    case 'whoami': return 'student';
    case 'id': return 'uid=1000(student) gid=1000(student) groups=1000(student),27(sudo),33(www-data)';

    case 'uname':
      if (args.includes('-a')) return 'Linux cybershield-lab 5.15.0-91-generic #101 SMP Ubuntu x86_64 GNU/Linux';
      return 'Linux';

    case 'env':
      return Object.entries(session.env).map(([k, v]) => `${k}=${v}`).join('\n');

    case 'echo':
      return args.join(' ').replace(/["']/g, '');

    case 'history':
      return session.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n');

    case 'date':
      return new Date().toString();

    case 'ps': {
      const procs = [
        'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        'root         1  0.0  0.1 169936 13080 ?        Ss   10:00   0:01 /sbin/init',
        'root        42  0.0  0.1  72284  5536 ?        Ss   10:00   0:00 /usr/sbin/sshd',
        'student    100  0.0  0.2  21468 10892 pts/0    Ss   10:01   0:00 -bash',
        'www-data   200  0.1  0.3 142680 22804 ?        S    10:00   0:02 nginx: worker',
        'mysql      300  0.5  2.1 1256780 172036 ?      Sl   10:00   0:08 /usr/sbin/mysqld',
        'root       400  0.0  0.1  12564  8192 ?        Ss   10:05   0:00 /usr/sbin/cron',
        `student    ${500 + Math.floor(Math.random() * 100)}  0.0  0.0  3736  3412 pts/0    R+   ${new Date().toTimeString().slice(0, 5)}   0:00 ps aux`,
      ];
      return procs.join('\n');
    }

    case 'netstat': case 'ss': {
      const conns = [
        'Active Internet connections (servers and established)',
        'Proto Recv-Q Send-Q Local Address           Foreign Address         State',
        'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN',
        'tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN',
        'tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN',
        'tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN',
        'tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN',
        `tcp        0      0 172.17.0.3:22           10.0.0.1:${40000 + Math.floor(Math.random() * 10000)}  ESTABLISHED`,
        'tcp6       0      0 :::80                   :::*                    LISTEN',
        'udp        0      0 0.0.0.0:53              0.0.0.0:*               ',
      ];
      return conns.join('\n');
    }

    case 'ping': {
      const target = args.find(a => !a.startsWith('-')) ?? '8.8.8.8';
      return [
        `PING ${target} (${target}) 56(84) bytes of data.`,
        `64 bytes from ${target}: icmp_seq=1 ttl=118 time=${(Math.random() * 20 + 5).toFixed(1)} ms`,
        `64 bytes from ${target}: icmp_seq=2 ttl=118 time=${(Math.random() * 20 + 5).toFixed(1)} ms`,
        `64 bytes from ${target}: icmp_seq=3 ttl=118 time=${(Math.random() * 20 + 5).toFixed(1)} ms`,
        `--- ${target} ping statistics ---`,
        '3 packets transmitted, 3 received, 0% packet loss, time 2003ms',
      ].join('\n');
    }

    case 'traceroute': {
      const target = args.find(a => !a.startsWith('-')) ?? '8.8.8.8';
      return [
        `traceroute to ${target}, 30 hops max, 60 byte packets`,
        ` 1  gateway (192.168.1.1)  0.5ms  0.4ms  0.3ms`,
        ` 2  10.0.0.1 (10.0.0.1)  1.2ms  1.1ms  1.3ms`,
        ` 3  isp-router.example.com (72.14.215.85)  5.8ms  5.6ms  5.9ms`,
        ` 4  core-router.example.com (108.170.252.1)  8.2ms  8.1ms  8.3ms`,
        ` 5  ${target} (${target})  ${Math.floor(Math.random() * 5 + 10)}.0ms  ${Math.floor(Math.random() * 5 + 10)}.1ms  ${Math.floor(Math.random() * 5 + 10)}.0ms`,
      ].join('\n');
    }

    case 'ls': {
      const target = args[0] ? resolvePath(session.cwd, args[0]) : session.cwd;
      const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const contents = SIMULATED_FS[target];
      if (!contents) return `ls: cannot access '${target}': No such file or directory`;
      if (showLong) {
        const lines = contents.map(f => {
          const isDir = SIMULATED_FS[target + '/' + f] !== undefined || f.endsWith('/');
          const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
          const size = isDir ? '4096' : String(Math.floor(Math.random() * 5000) + 100);
          const date = 'Jul 22 10:' + String(Math.floor(Math.random() * 60)).padStart(2, '0');
          return `${perm}  1 student student ${size.padStart(6)} ${date} ${f}`;
        });
        return ['total ' + (contents.length * 4 + 8), ...lines].join('\n');
      }
      let output = '';
      if (showHidden) output += '.  ..  ';
      output += contents.join('  ');
      return output;
    }

    case 'tree': {
      const target = args[0] ? resolvePath(session.cwd, args[0]) : session.cwd;
      function treeRecurse(path: string, prefix: string = ''): string[] {
        const items = SIMULATED_FS[path];
        if (!items) return [];
        const lines: string[] = [];
        items.forEach((item, i) => {
          const isLast = i === items.length - 1;
          const connector = isLast ? '`-- ' : '|-- ';
          const childPath = path + '/' + item;
          const isDir = SIMULATED_FS[childPath] !== undefined;
          lines.push(prefix + connector + item + (isDir ? '/' : ''));
          if (isDir && prefix.length < 20) {
            lines.push(...treeRecurse(childPath, prefix + (isLast ? '    ' : '|   ')));
          }
        });
        return lines;
      }
      return [target, ...treeRecurse(target)].join('\n');
    }

    case 'cd': {
      if (!args[0] || args[0] === '~') { session.cwd = '/home/student'; return ''; }
      const target = resolvePath(session.cwd, args[0]);
      if (SIMULATED_FS[target] !== undefined) { session.cwd = target; return ''; }
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

    case 'head': {
      if (!args[0]) return 'head: missing operand';
      const filePath = resolvePath(session.cwd, args[0]);
      const content = FILE_CONTENTS[filePath];
      if (!content) return `head: ${args[0]}: No such file or directory`;
      const n = parseInt(args.find(a => a.startsWith('-n'))?.slice(2) || '5');
      return content.split('\n').slice(0, n).join('\n');
    }

    case 'tail': {
      if (!args[0]) return 'tail: missing operand';
      const filePath = resolvePath(session.cwd, args[0]);
      const content = FILE_CONTENTS[filePath];
      if (!content) return `tail: ${args[0]}: No such file or directory`;
      const n = parseInt(args.find(a => a.startsWith('-n'))?.slice(2) || '5');
      return content.split('\n').slice(-n).join('\n');
    }

    case 'grep': {
      if (args.length < 2) return 'Usage: grep <pattern> <file>';
      const pattern = args[0];
      const filePath = resolvePath(session.cwd, args[1]);
      const content = FILE_CONTENTS[filePath];
      if (!content) return `grep: ${args[1]}: No such file or directory`;
      const matches = content.split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
      return matches.length ? matches.join('\n') : '(no matches found)';
    }

    case 'find': {
      const nameArg = args.indexOf('-name');
      const target = nameArg > 0 ? args[nameArg + 1] : '';
      if (!target) return 'Usage: find <path> -name <pattern>';
      const results: string[] = [];
      function searchDir(path: string) {
        const items = SIMULATED_FS[path];
        if (!items) return;
        for (const item of items) {
          const full = path + '/' + item;
          if (item.includes(target.replace(/\*/g, ''))) results.push(full);
          if (SIMULATED_FS[full]) searchDir(full);
        }
      }
      searchDir('/');
      return results.length ? results.join('\n') : 'No files found.';
    }

    case 'wc': {
      if (!args[0]) return 'wc: missing operand';
      const filePath = resolvePath(session.cwd, args[0]);
      const content = FILE_CONTENTS[filePath];
      if (!content) return `wc: ${args[0]}: No such file or directory`;
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).length;
      const chars = content.length;
      return `  ${lines}  ${words} ${chars} ${args[0]}`;
    }

    case 'chmod': case 'chown':
      checkObjectives(session, trimmed);
      return args.length >= 2 ? `Permissions updated for ${args[args.length - 1]}` : 'Usage: chmod <mode> <file>';

    case 'nmap': {
      checkObjectives(session, trimmed);
      const target = args.find(a => !a.startsWith('-')) ?? '192.168.1.1';
      const hasVuln = args.includes('-sV') || args.includes('-A') || args.includes('-sC');
      const lines = [
        `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}`,
        `Nmap scan report for ${target}`,
        `Host is up (0.0023s latency).`,
        ``,
        `PORT     STATE SERVICE       VERSION`,
        `22/tcp   open  ssh           OpenSSH 8.9p1 Ubuntu 3ubuntu0.6`,
        `80/tcp   open  http          Apache/2.4.52 (Ubuntu)`,
        `443/tcp  open  ssl/https     Apache/2.4.52 (Ubuntu)`,
        `3306/tcp open  mysql         MySQL 8.0.32-0ubuntu0.22.04.2`,
        `8080/tcp open  http-proxy    nginx/1.23.3`,
      ];
      if (hasVuln) {
        lines.push('', '| VULNERABILITIES DETECTED:', '|   CVE-2023-25690  Apache HTTP Server mod_proxy SSRF',
          '|   CVE-2023-22515  Confluence Broken Access Control', '|   CVE-2023-44487  HTTP/2 Rapid Reset Attack',
          `|   OS: Ubuntu 22.04 LTS`, `|   Network Distance: 2 hops`);
      }
      lines.push('', `Nmap done: 1 IP address (1 host up) scanned in ${(Math.random() * 5 + 2).toFixed(2)} seconds`);
      return lines.join('\n');
    }

    case 'curl': {
      checkObjectives(session, trimmed);
      const url = args.find(a => a.startsWith('http')) ?? 'http://localhost:8080';
      return [
        `  % Total    % Received % Xferd  Average Speed   Time`,
        `100  1562  100  1562    0     0   52500      0 --:--:-- --:--:-- --:--:--  52333`,
        `<!DOCTYPE html>`,
        `<html><head><title>Target Corp - Portal</title></head>`,
        `<body>`,
        `<h1>Welcome to Target Corp Internal Portal</h1>`,
        `<p>Server: Apache/2.4.52 (Ubuntu)</p>`,
        `<p>Powered by PHP 8.1.2</p>`,
        `<p>X-Frame-Options: DENY</p>`,
        `</body></html>`,
      ].join('\n');
    }

    case 'dig': case 'nslookup': {
      checkObjectives(session, trimmed);
      const domain = args.find(a => !a.startsWith('-') && a.includes('.')) ?? 'example.com';
      return command === 'dig'
        ? [
          `; <<>> DiG 9.18.18-0ubuntu0.22.04.1-Ubuntu <<>> ${domain}`,
          `;; global options: +cmd`,
          `;; Got answer:`,
          `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: ${Math.floor(Math.random() * 65535)}`,
          `;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1`,
          ``,
          `;; QUESTION SECTION:`,
          `;${domain}.                    IN      A`,
          ``,
          `;; ANSWER SECTION:`,
          `${domain}.             300     IN      A       93.184.216.34`,
          ``,
          `;; Query time: 12 msec`,
          `;; SERVER: 8.8.8.8#53(8.8.8.8)`,
        ].join('\n')
        : [
          `Server:		8.8.8.8`,
          `Address:	8.8.8.8#53`,
          ``,
          `Non-authoritative answer:`,
          `Name:	${domain}`,
          `Address: 93.184.216.34`,
        ].join('\n');
    }

    case 'whois': {
      checkObjectives(session, trimmed);
      const domain = args[0] ?? 'example.com';
      return [
        `Domain Name: ${domain.toUpperCase()}`,
        `Registry Domain ID: ${Math.floor(Math.random() * 999999999)}`,
        `Registrar WHOIS Server: whois.registrar.com`,
        `Registrar URL: http://www.registrar.com`,
        `Updated Date: 2024-01-15T08:30:00Z`,
        `Creation Date: 1995-08-14T04:00:00Z`,
        `Registry Expiry Date: 2025-08-13T04:00:00Z`,
        `Registrar: Example Registrar, Inc.`,
        `Domain Status: clientTransferProhibited`,
        `Name Server: A.IANA-SERVERS.NET`,
        `Name Server: B.IANA-SERVERS.NET`,
        `DNSSEC: unsigned`,
      ].join('\n');
    }

    case 'ifconfig': case 'ip': {
      return [
        `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`,
        `        inet 172.17.0.3  netmask 255.255.0.0  broadcast 172.17.255.255`,
        `        inet6 fe80::42:acff:fe11:3  prefixlen 64  scopeid 0x20<link>`,
        `        ether 02:42:ac:11:00:03  txqueuelen 0  (Ethernet)`,
        `        RX packets ${Math.floor(Math.random() * 100000 + 50000)}  bytes ${(Math.random() * 100000000).toFixed(0)}`,
        `        TX packets ${Math.floor(Math.random() * 50000 + 20000)}  bytes ${(Math.random() * 50000000).toFixed(0)}`,
        ``,
        `lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536`,
        `        inet 127.0.0.1  netmask 255.0.0.0`,
        `        inet6 ::1  prefixlen 128  scopeid 0x10<host>`,
        `        loop  txqueuelen 1000  (Local Loopback)`,
      ].join('\n');
    }

    case 'python3': case 'python': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'Python 3.10.12 (main, Jun 11 2023, 05:26:28) [GCC 11.4.0] on linux';
      const filePath = resolvePath(session.cwd, args[0]);
      const script = FILE_CONTENTS[filePath];
      if (!script) return `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
      if (args[0].includes('task2.py')) {
        return `=== Password Hash Cracking Lab ===\n\nTarget Database:\n  admin: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8...\n  root: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855...\n  user1: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f...\n\nHint: These are very common passwords.`;
      }
      return `[Script output for ${args[0]}]\nExecution completed successfully.`;
    }

    case 'bash': case 'sh': {
      checkObjectives(session, trimmed);
      if (!args[0]) return '$ ';
      const filePath = resolvePath(session.cwd, args[0]);
      const script = FILE_CONTENTS[filePath];
      if (!script) return `bash: ${args[0]}: No such file or directory`;
      if (args[0].includes('task1.sh')) {
        return `=== Network Reconnaissance Exercise ===\nScanning local network segment...\n\nDiscovering hosts on 192.168.1.0/24...\n  192.168.1.1   - Gateway         (open: 53, 80, 443)\n  192.168.1.10  - Web Server      (open: 22, 80, 8080, 8443)\n  192.168.1.20  - Database        (open: 22, 3306, 5432)\n  192.168.1.30  - Mail Server     (open: 22, 25, 143, 587, 993)\n  192.168.1.40  - File Server     (open: 22, 139, 445)\n  192.168.1.50  - Dev Server      (open: 22, 3000, 8080)\n\nScan complete. 6 hosts discovered, 3 critical vulnerabilities found.`;
      }
      return script.replace(/^#!.*\n/, '').replace(/echo\s+"?([^"]*)"?/g, '$1').replace(/\\n/g, '\n');
    }

    case 'gcc': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'gcc: fatal error: no input files';
      return `Compiling ${args[0]}...\nLinking...\nBuild successful. Output: ./a.out`;
    }

    case 'hashcat': case 'john': {
      checkObjectives(session, trimmed);
      return [
        `${command} (v6.2.6) starting...`,
        `Hashes: 1 digest; 1 unique digests, 1 unique salts`,
        `Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask`,
        ``,
        `5e884898...:password`,
        `ef92b778...:password123`,
        ``,
        `Session..........: ${command}`,
        `Status...........: Cracked`,
        `Hash.Mode........: 1400 (SHA2-256)`,
        `Time.Started.....: ${new Date().toISOString().split('T')[0]}`,
        `Time.Estimated...: 0 secs`,
        ``,
        `2 recovered from 2 input hashes`,
        `${Math.floor(Math.random() * 5000 + 1000).toLocaleString()}.00 GH/s estimated`,
      ].join('\n');
    }

    case 'sqlmap': {
      checkObjectives(session, trimmed);
      const target = args.find(a => a.startsWith('http')) ?? 'http://target/login.php';
      return [
        `[*] starting @ ${new Date().toISOString()}`,
        `[INFO] testing connection to the target URL`,
        `[INFO] checking if the target is protected by WAF/IPS`,
        `[INFO] testing if the target URL is stable`,
        `[INFO] testing SQL injection on parameter 'username'`,
        `[INFO] confirming SQL injection on parameter 'username'`,
        `[INFO] parameter 'username' appears to be injectable`,
        `[INFO] fetching database banner`,
        `back-end DBMS: MySQL >= 5.6`,
        `[INFO] fetching database names`,
        `available databases [3]:`,
        `[*] information_schema`,
        `[*] app_db`,
        `[*] secrets`,
        `[INFO] fetching tables from database 'app_db'`,
        `Database: app_db`,
        `[3 tables]`,
        `+------------+`,
        `| users      |`,
        `| flags      |`,
        `| sessions   |`,
        `+------------+`,
        `[INFO] fetching columns for table 'flags'`,
        `+----+-------+`,
        `| id | value |`,
        `+----+-------+`,
        `| 1  | CYBER |`,
        `+----+-------+`,
      ].join('\n');
    }

    case 'nikto': {
      checkObjectives(session, trimmed);
      return [
        `- Nikto v2.5.0`,
        `---------------------------------------------------------------------------`,
        `+ Target IP:          192.168.1.10`,
        `+ Target Hostname:    web.target.local`,
        `+ Target Port:        80`,
        `+ Start Time:         ${new Date().toISOString()}`,
        `---------------------------------------------------------------------------`,
        `+ Server: Apache/2.4.52 (Ubuntu)`,
        `+ /: The X-Content-Type-Options header is not set.`,
        `+ /: The X-XSS-Protection header is not defined.`,
        `+ /login.php: PHP page with login form found.`,
        `+ /api/debug: Admin debug endpoint exposed (403 Forbidden).`,
        `+ /admin/: Directory indexing found.`,
        `+ /phpinfo.php: PHP info page found.`,
        `+ /backups/: Directory indexing found.`,
        `+ OSVDB-3268: /admin/: Directory indexing found.`,
        `+ 7 host(s) tested`,
        `+ End Time: ${new Date().toISOString()} (${Math.floor(Math.random() * 20 + 10)} seconds)`,
        `---------------------------------------------------------------------------`,
        `+ 7 items found`,
      ].join('\n');
    }

    case 'gobuster': case 'dirb': {
      checkObjectives(session, trimmed);
      return [
        `===============================================================`,
        `Gobuster v3.6`,
        `by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)`,
        `===============================================================`,
        `[+] Url:                     http://192.168.1.10`,
        `[+] Method:                  GET`,
        `[+] Threads:                 10`,
        `[+] Wordlist:                /usr/share/wordlists/dirb/common.txt`,
        `===============================================================`,
        `Starting gobuster in directory enumeration mode`,
        `===============================================================`,
        `/(Status: 200) [Size: 1256]`,
        `/admin      (Status: 403) [Size: 277]`,
        `/api        (Status: 301) [Size: 0] [--> /api/]`,
        `/backup     (Status: 301) [Size: 0] [--> /backup/]`,
        `/config     (Status: 403) [Size: 277]`,
        `/dashboard  (Status: 302) [Size: 0] [--> /login.php]`,
        `/images     (Status: 301) [Size: 0] [--> /images/]`,
        `/login.php  (Status: 200) [Size: 892]`,
        `/uploads    (Status: 301) [Size: 0] [--> /uploads/]`,
        `/.git       (Status: 301) [Size: 0] [--> /.git/]`,
        `===============================================================`,
        `Finished`,
        `===============================================================`,
      ].join('\n');
    }

    case 'hydra': {
      checkObjectives(session, trimmed);
      return [
        `Hydra v9.5 (c) 2023 by van Hauser/THC`,
        `[DATA] max 16 tasks per 1 server, overall 16 tasks`,
        `[DATA] attacking ssh://192.168.1.10:22/`,
        `[STATUS] 64.00 tries/min, 64 tries in 00:01h, 256 to do in 00:04h`,
        `[22][ssh] host: 192.168.1.10  login: admin  password: admin123`,
        `[STATUS] attack finished for 192.168.1.10 (valid pair found)`,
        `1 of 1 target successfully completed, 1 valid password found`,
      ].join('\n');
    }

    case 'openssl': {
      checkObjectives(session, trimmed);
      if (args[0] === 'enc' || args[0] === 'dgst') {
        return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      }
      return `OpenSSL 3.0.2 15 Mar 2022 (Library: OpenSSL 3.0.2)\nBuilt with: compiler: gcc -fPIC -pthread -m64`;
    }

    case 'file': {
      checkObjectives(session, trimmed);
      const target = args[0] ?? '';
      if (target.includes('.py')) return `${target}: Python script, ASCII text executable`;
      if (target.includes('.sh')) return `${target}: Bourne-Again shell script, ASCII text executable`;
      if (target.includes('.c')) return `${target}: C source, ASCII text`;
      if (target.includes('.pcap')) return `${target}: pcap capture file (microsecond ts)`;
      if (target.includes('.png') || target.includes('.jpg')) return `${target}: PNG image data, 800 x 600, 8-bit/color RGBA`;
      if (target.includes('.dd')) return `${target}: DOS/MBR boot sector, extended partition table`;
      if (target.includes('.db')) return `${target}: SQLite 3.x database`;
      if (target.includes('.log')) return `${target}: ASCII text`;
      return `${target}: data`;
    }

    case 'strings': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'strings: missing operand';
      return ['/lib/x86_64-linux-gnu/libc.so.6', '__libc_start_main', 'GLIBC_2.34', '_ITM_registerTMCloneTable', '__gmon_start__', 'flag.txt', 'cat', '/bin/sh', 'CYBERSHIELD{'].join('\n');
    }

    case 'objdump': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'objdump: missing operand';
      return [
        `\n${args[0]}:     file format elf64-x86-64`,
        `\nDisassembly of section .text:`,
        `\n0000000000001149 <main>:`,
        `    1149:    f3 0f 1e fa             endbr64`,
        `    114d:    55                      push   rbp`,
        `    114e:    48 89 e5                mov    rbp,rsp`,
        `    1151:    48 8d 3d bc 0e 00 00    lea    rdi,[rip+0xebc]`,
        `    1158:    b8 00 00 00 00          mov    eax,0x0`,
        `    115d:    e8 6e fe ff ff          call   0xf10 <printf@plt>`,
        `    1162:    b8 00 00 00 00          mov    eax,0x0`,
        `    1167:    5d                      pop    rbp`,
        `    1168:    c3                      ret`,
      ].join('\n');
    }

    case 'gdb': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'gdb: no file specified';
      return [
        `GNU gdb (Ubuntu 12.1-0ubuntu1~22.04.2) 12.1`,
        `Reading symbols from ${args[0]}...`,
        `(gdb) disassemble main`,
        `Dump of assembler code for function main:`,
        `   0x0000000000001149 <+0>:     endbr64`,
        `   0x000000000000114d <+4>:     push   rbp`,
        `   0x000000000000114e <+5>:     mov    rbp,rsp`,
        `   0x0000000000001151 <+8>:     lea    rdi,0x2004`,
        `   0x0000000000001158 <+15>:    call   0x10f0 <gets@plt>`,
        `   0x000000000000115d <+20>:    lea    rdi,0x2004`,
        `   0x0000000000001164 <+27>:    call   0x1100 <printf@plt>`,
        `   0x0000000000001169 <+32>:    mov    eax,0x0`,
        `   0x000000000000116e <+37>:    pop    rbp`,
        `   0x000000000000116f <+38>:    ret`,
        `End of assembler dump.`,
      ].join('\n');
    }

    case 'exiftool': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'exiftool: missing operand';
      return [
        `ExifTool Version Number         : 12.50`,
        `File Name                       : ${args[0]}`,
        `File Size                       : 245 kB`,
        `File Type                       : JPEG`,
        `MIME Type                       : image/jpeg`,
        `Image Width                     : 1920`,
        `Image Height                    : 1080`,
        `Bit Depth                       : 8`,
        `Color Components                : 3`,
        `GPS Latitude                    : 40 deg 42' 44.28" N`,
        `GPS Longitude                   : 74 deg 0' 21.72" W`,
        `GPS Position                    : 40.7123 deg N, 74.0060 deg W`,
        `Software                        : Adobe Photoshop 24.0`,
        `Comment                         : Flag location marked`,
        `Author                          : shadow_h4cker`,
      ].join('\n');
    }

    case 'binwalk': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'binwalk: missing operand';
      return [
        `Scan Time:     ${new Date().toISOString().split('T')[1]}`,
        `Signatures:   411`,
        ``,
        `DECIMAL       HEXADECIMAL     DESCRIPTION`,
        `--------------------------------------------------------------------------------`,
        `0             0x0             JPEG image data, JFIF standard 1.01`,
        `3021          0xBCD           Zip archive data, at least v2.0 to extract`,
        `15840         0x3DF0          ELF, 64-bit LSB shared object, x86-64`,
        `28672         0x7000          PNG image, 800 x 600, 8-bit/color RGBA`,
        `45056         0xB000          SQLite format 3 database`,
        `65536         0x10000         Certificate, PEM encoded`,
        ``,
        `N.B.: Embedded files found! Use -e to extract.`,
      ].join('\n');
    }

    case 'volatility': {
      checkObjectives(session, trimmed);
      return [
        `Volatility 3 Framework 2.7.0`,
        `INFO     : volatility3 framework running`,
        `Progress:  100.00               PDB scanning finished`,
        ``,
        `PID     Process         Create Time           PPID    Arguments`,
        `------  --------------  --------------------  ------  -----------`,
        `1       System          2026-07-22 08:00:00   0       ntoskrnl.exe`,
        `412     smss.exe        2026-07-22 08:00:05   328     \\SystemRoot\\System32\\smss.exe`,
        `524     csrss.exe       2026-07-22 08:00:08   412     \\SystemRoot\\System32\\csrss.exe`,
        `632     wininit.exe     2026-07-22 08:00:10   412     \\SystemRoot\\System32\\wininit.exe`,
        `724     services.exe    2026-07-22 08:00:12   632     \\SystemRoot\\System32\\services.exe`,
        `812     lsass.exe       2026-07-22 08:00:14   632     \\SystemRoot\\System32\\lsass.exe`,
        `1924    explorer.exe    2026-07-22 08:01:00   1892    \\Windows\\explorer.exe`,
        `2048    chrome.exe      2026-07-22 08:15:00   1924    "C:\\Program Files\\Chrome\\chrome.exe"`,
        `3072    cmd.exe         2026-07-22 09:30:00   1924    C:\\Windows\\System32\\cmd.exe`,
        `3140    powershell.exe  2026-07-22 09:31:00   3072    C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`,
        ``,
        `!malfind: Found injected code in PID 3140 (powershell.exe)`,
        `  Address: 0x00007ff608400000, Size: 4096 bytes`,
        `  Contains: shellcode payload`,
      ].join('\n');
    }

    case 'steghide': {
      checkObjectives(session, trimmed);
      if (!args[0]) return 'steghide: missing operand';
      return [
        `steghide version 0.5.1`,
        `Enter passphrase:`,
        `extracting embedded data...`,
        `wrote extracted data to "hidden_message.txt".`,
        ``,
        `Contents of hidden_message.txt:`,
        `CYBERSHIELD{lsb_h1dd3n_msg}`,
      ].join('\n');
    }

    case 'iptables': {
      checkObjectives(session, trimmed);
      if (args[0] === '-L' || args[0] === '--list') {
        return [
          `Chain INPUT (policy DROP)`,
          `target     prot opt source       destination`,
          `ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:22`,
          `ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:80`,
          `ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:443`,
          `ACCEPT     icmp --  0.0.0.0/0    0.0.0.0/0`,
          `DROP       all  --  0.0.0.0/0    0.0.0.0/0    state INVALID`,
          `LOG        all  --  0.0.0.0/0    0.0.0.0/0    LOG flags 0 level 4 prefix "FW_DROP: "`,
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

    case 'status': {
      const completed = session.objectives.filter(o => o.completed).length;
      const total = session.objectives.length;
      const lines = [`\x1b[1;36m=== Lab Objectives Progress ===\x1b[0m`, `${completed}/${total} completed (${Math.round(completed / Math.max(total, 1) * 100)}%)\n`];
      for (const obj of session.objectives) {
        const icon = obj.completed ? '\x1b[32m[x]\x1b[0m' : '\x1b[31m[ ]\x1b[0m';
        lines.push(`  ${icon} ${obj.description}`);
      }
      return lines.join('\n');
    }

    default:
      return `bash: ${command}: command not found. Type 'help' for available commands.`;
  }
}

function checkObjectives(session: TerminalSession, command: string): void {
  const lowerCmd = command.toLowerCase();
  for (const obj of session.objectives) {
    if (obj.completed) continue;
    if (obj.verificationPattern) {
      if (new RegExp(obj.verificationPattern, 'i').test(lowerCmd)) { obj.completed = true; continue; }
    }
    for (const [keyword, regex] of Object.entries(LAB_OBJECTIVE_PATTERNS)) {
      if (obj.description.toLowerCase().includes(keyword) && regex.test(lowerCmd)) { obj.completed = true; break; }
    }
  }
  const completed = session.objectives.filter(o => o.completed).length;
  if (completed === session.objectives.length && session.objectives.length > 0) {
    io.to(session.labSessionId).emit('lab:completed', { labSessionId: session.labSessionId, message: 'All lab objectives completed! Great work.', score: 1.0 });
  }
}

io.on('connection', (socket) => {
  console.log(`[Terminal] Client connected: ${socket.id}`);

  socket.on('terminal:join', (data: { userId: string; labSessionId: string; containerName: string; objectives: { id: string; description: string; verificationPattern?: string }[]; labType?: string }) => {
    const { userId, labSessionId, containerName, objectives, labType } = data;
    const session: TerminalSession = {
      socketId: socket.id, userId, labSessionId, containerName,
      commandHistory: [], currentLine: '', cwd: '/home/student',
      env: { TERM: 'xterm-256color', LAB_SESSION_ID: labSessionId, LAB_USER_ID: userId, PATH: '/usr/local/bin:/usr/bin:/bin' },
      labType: labType || 'general',
      objectives: objectives.map(o => ({ ...o, completed: false })),
      startedAt: new Date(),
    };
    activeSessions.set(socket.id, session);
    socket.join(labSessionId);

    const welcomeLines = [
      `\x1b[1;32m  ╔═══════════════════════════════════════════════════════╗\x1b[0m`,
      `\x1b[1;32m  ║                                                       ║\x1b[0m`,
      `\x1b[1;32m  ║     \x1b[1;36mCyberShield Academy\x1b[0m \x1b[1;32m- Secure Lab Environment       ║\x1b[0m`,
      `\x1b[1;32m  ║                                                       ║\x1b[0m`,
      `\x1b[1;32m  ╚═══════════════════════════════════════════════════════╝\x1b[0m`,
      ``,
      `  Container: \x1b[33m${containerName}\x1b[0m`,
      `  User:      \x1b[32mstudent\x1b[0m`,
      `  Lab Type:  \x1b[36m${session.labType}\x1b[0m`,
      `  Working:   /home/student`,
      ``,
      `  Type \x1b[1m'help'\x1b[0m for available commands.`,
      `  Type \x1b[1m'status'\x1b[0m to check lab objectives.`,
      `  Type \x1b[1m'tree'\x1b[0m to explore the filesystem.`,
      ``,
    ];

    socket.emit('terminal:output', { data: welcomeLines.join('\r\n') + '\r\n' });
    socket.emit('terminal:prompt', { cwd: session.cwd });
    console.log(`[Terminal] Session started for user ${userId} in lab ${labSessionId}`);
  });

  socket.on('terminal:input', (data: { input: string }) => {
    const session = activeSessions.get(socket.id);
    if (!session) { socket.emit('terminal:output', { data: 'Error: No active terminal session.\r\n' }); return; }
    const input = data.input;
    session.currentLine += input;
    if (input.includes('\r') || input.includes('\n')) {
      const cmd = session.currentLine.replace(/[\r\n]/g, '');
      session.currentLine = '';
      const prompt = `\x1b[1;32mstudent@cybershield\x1b[0m:\x1b[1;34m${session.cwd}\x1b[0m$ `;
      const output = simulateCommand(session, cmd);
      if (output === '\x1b[2J\x1b[H') { socket.emit('terminal:clear', {}); }
      else if (output) { socket.emit('terminal:output', { data: prompt + cmd + '\r\n' + output + '\r\n' }); }
      else { socket.emit('terminal:output', { data: prompt + cmd + '\r\n' }); }
      socket.emit('terminal:prompt', { cwd: session.cwd });
      socket.to(session.labSessionId).emit('terminal:command', { command: cmd, userId: session.userId, timestamp: new Date().toISOString() });
      const completed = session.objectives.filter(o => o.completed).length;
      socket.to(session.labSessionId).emit('lab:progress', { labSessionId: session.labSessionId, objectivesCompleted: session.objectives, progressRatio: completed / Math.max(session.objectives.length, 1) });
    } else { socket.emit('terminal:output', { data: input }); }
  });

  socket.on('terminal:resize', (data: { cols: number; rows: number }) => { socket.emit('terminal:resized', { cols: data.cols, rows: data.rows }); });

  socket.on('disconnect', () => { const session = activeSessions.get(socket.id); if (session) { console.log(`[Terminal] Session ended for user ${session.userId}`); activeSessions.delete(socket.id); } });
  socket.on('error', (error) => { console.error(`[Terminal] Socket error (${socket.id}):`, error); });
});

const PORT = 3004;
httpServer.listen(PORT, () => { console.log(`[Terminal Service] WebSocket terminal running on port ${PORT}`); });
process.on('SIGTERM', () => { console.log('[Terminal Service] Shutting down...'); httpServer.close(() => process.exit(0)); });
process.on('SIGINT', () => { console.log('[Terminal Service] Shutting down...'); httpServer.close(() => process.exit(0)); });