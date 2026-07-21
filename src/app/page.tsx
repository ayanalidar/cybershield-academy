'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Mic, MicOff, Volume2, VolumeX, Send, Terminal as TerminalIcon,
  BarChart3, Award, User, Target, CheckCircle2, Clock, TrendingUp,
  BookOpen, Download, Search, AlertTriangle, Lightbulb, Zap, Activity,
  Lock, Copy, ChevronRight, GraduationCap, Users, Trophy, Flame,
  X, LogOut, Settings, LayoutDashboard, Flag, Crown, Star, Eye,
  EyeOff, Keyboard, MessageSquare, Hexagon,
  Swords, GitBranch, Fingerprint, Globe, Wifi, Database, Bug,
  ChevronDown, ChevronUp, Sparkles, CircleDot, Brain, Bell,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }
interface CourseData { id: string; title: string; description: string; category: string; difficulty: string; moduleCount: number; studentCount: number; durationHours: number; enrolled: boolean; progress?: number; modules?: { title: string; completed: boolean }[] }
interface QuizQ { id: string; question: string; options: string[]; correctIndex: number; explanation: string }
interface CtfChallenge { id: string; title: string; description: string; category: string; difficulty: string; points: number; solveCount: number; solved: boolean; hint?: string; flag: string }
interface LabScenario { id: string; title: string; description: string; difficulty: string; duration: string; category: string; objectives: { id: string; description: string; verificationPattern: string }[]; steps: string[]; hints: string[] }
interface UserData { id: string; name: string; email: string; role: string; xp: number; level: number; streakDays: number }
interface LeaderboardEntry { rank: number; id: string; name: string; xp: number; level: number; title: string; badges: number; ctfSolves: number; streak: number }

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS – all demo data lives here
   ═══════════════════════════════════════════════════════════════════════ */

const LEVEL_TITLES = ['Script Kiddie','Junior Analyst','Security Intern','Threat Scout','Network Guardian','Security Engineer','Cyber Defender','Pen Tester','Security Architect','Incident Commander','Threat Hunter','Red Team Lead','Shield Master','Cyber Sentinel','Grandmaster'];
const LEVEL_XP = [0,100,300,600,1000,1500,2200,3000,4000,5500,7500,10000,13000,17000,22000];
const DEMO_USER: UserData = { id:'demo-001', name:'Alex Chen', email:'alex@cybershield.academy', role:'student', xp:1450, level:6, streakDays:7 };

const WELCOME_MSG: Message = { id:'welcome', role:'assistant', timestamp:new Date().toISOString(), content:"# Welcome to CyberShield Academy\n\nI'm **Prof. Shield**, your AI cybersecurity instructor. I can help you with:\n\n- **Network Security** — TCP/IP, firewalls, IDS/IPS, scanning\n- **Web Security** — OWASP Top 10, XSS, SQLi, CSRF\n- **Cryptography** — Symmetric/asymmetric, hashing, PKI\n- **Penetration Testing** — Recon, exploitation, post-exploitation\n- **Digital Forensics** — Disk, memory, network forensics\n\nWhat would you like to learn about today?" };

const DEMO_COURSES: CourseData[] = [
  { id:'c1', title:'Network Security Fundamentals', description:'Master TCP/IP, firewalls, IDS/IPS, and network scanning with hands-on labs covering real-world scenarios.', category:'networking', difficulty:'intermediate', moduleCount:8, studentCount:1247, durationHours:24, enrolled:true, progress:50, modules:[{title:'Network Fundamentals',completed:true},{title:'TCP/IP Deep Dive',completed:true},{title:'Network Scanning',completed:true},{title:'Cryptography Basics',completed:true},{title:'Firewall Configuration',completed:false},{title:'Intrusion Detection',completed:false},{title:'VPN & Tunneling',completed:false},{title:'Web App Security',completed:false},{title:'Capstone Challenge',completed:false}] },
  { id:'c2', title:'Web Application Security', description:'Deep dive into OWASP Top 10, XSS, SQLi, CSRF, SSRF, and modern web exploits with practical labs.', category:'web', difficulty:'advanced', moduleCount:6, studentCount:834, durationHours:18, enrolled:false },
  { id:'c3', title:'Ethical Hacking & Pen Testing', description:'Full pentest methodology: reconnaissance, exploitation, post-exploitation, pivoting, and report writing.', category:'pentesting', difficulty:'advanced', moduleCount:7, studentCount:2103, durationHours:40, enrolled:true, progress:20 },
  { id:'c4', title:'Digital Forensics & IR', description:'Master disk forensics, memory analysis, network forensics, malware forensics, and IR playbooks.', category:'forensics', difficulty:'intermediate', moduleCount:7, studentCount:567, durationHours:28, enrolled:false },
  { id:'c5', title:'Cloud Security Architecture', description:'Secure AWS, Azure, GCP environments. IAM policies, encryption, network security, and compliance.', category:'cloud', difficulty:'advanced', moduleCount:6, studentCount:423, durationHours:32, enrolled:false },
  { id:'c6', title:'Malware Analysis & Reverse Eng', description:'Static & dynamic analysis, disassembly, debugging, packers, and automated malware classification.', category:'malware', difficulty:'advanced', moduleCount:5, studentCount:312, durationHours:36, enrolled:false },
  { id:'c7', title:'Cryptography & PKI', description:'Symmetric/asymmetric ciphers, hashing, digital signatures, TLS, certificates, and key management.', category:'crypto', difficulty:'intermediate', moduleCount:5, studentCount:689, durationHours:20, enrolled:false },
  { id:'c8', title:'Mobile Application Security', description:'iOS/Android security models, app reverse engineering, API security, and mobile pen testing.', category:'mobile', difficulty:'intermediate', moduleCount:4, studentCount:398, durationHours:22, enrolled:false },
];

const DEMO_QUIZZES: Record<string, QuizQ[]> = {
  c1: [
    { id:'q1', question:'What layer of the OSI model does a firewall primarily operate at?', options:['Layer 2 (Data Link)','Layer 3 (Network)','Layer 4 (Transport)','Layer 7 (Application)'], correctIndex:1, explanation:'Firewalls primarily operate at Layer 3 (Network layer), filtering packets based on IP addresses, ports, and protocols.' },
    { id:'q2', question:'Which tool is used for network scanning and service detection?', options:['Wireshark','Nmap','Metasploit','Burp Suite'], correctIndex:1, explanation:'Nmap (Network Mapper) is the standard tool for network scanning and service/version detection.' },
    { id:'q3', question:'What does IDS stand for in cybersecurity?', options:['Intrusion Detection System','Internal Data Security','Integrated Defense Shield','Intelligent Data Scanner'], correctIndex:0, explanation:'IDS = Intrusion Detection System, monitoring network traffic for suspicious activity.' },
    { id:'q4', question:'Which protocol provides reliable connection-oriented communication?', options:['UDP','ICMP','TCP','ARP'], correctIndex:2, explanation:'TCP provides reliable, connection-oriented communication via three-way handshake.' },
    { id:'q5', question:'What is the purpose of a DMZ in network security?', options:['Encrypt all traffic','Provide wireless access','Isolate public-facing services','Block all traffic'], correctIndex:2, explanation:'A DMZ isolates public-facing services (web servers, mail servers) from the internal network.' },
  ],
  c2: [
    { id:'q6', question:'What is the #1 risk in OWASP Top 10 (2021)?', options:['Injection','Broken Access Control','Cryptographic Failures','Security Misconfiguration'], correctIndex:1, explanation:'Broken Access Control moved to #1 in the 2021 OWASP Top 10 edition.' },
    { id:'q7', question:'Which XSS type stores the payload on the server?', options:['Reflected XSS','DOM-based XSS','Stored XSS','Self XSS'], correctIndex:2, explanation:'Stored XSS persists the malicious script on the server (e.g., in a database).' },
    { id:'q8', question:'What header helps prevent XSS attacks?', options:['X-Frame-Options','Content-Security-Policy','Strict-Transport-Security','Access-Control-Allow-Origin'], correctIndex:1, explanation:'Content-Security-Policy (CSP) restricts which sources can load content, mitigating XSS.' },
    { id:'q9', question:'Which HTTP method is most commonly associated with CSRF?', options:['GET','POST','PUT','DELETE'], correctIndex:1, explanation:'CSRF typically exploits state-changing POST requests that include cookies automatically.' },
  ],
  c3: [
    { id:'q10', question:'What is the first phase of penetration testing?', options:['Exploitation','Reconnaissance','Post-exploitation','Reporting'], correctIndex:1, explanation:'Reconnaissance is the first phase, gathering information about the target system.' },
    { id:'q11', question:'Which Nmap flag performs a SYN (half-open) scan?', options:['-sT','-sS','-sU','-sA'], correctIndex:1, explanation:'-sS performs a SYN scan, the default and most popular scan type.' },
    { id:'q12', question:'What does Metasploit payload reverse_tcp do?', options:['Creates a server','Connects back to attacker','Sniffs traffic','Escalates privileges'], correctIndex:1, explanation:'reverse_tcp makes the target connect back to the attacker machine.' },
  ],
};

const DEMO_CTF: CtfChallenge[] = [
  { id:'ctf1', title:'Flag Hunter', description:'The flag is hidden in plain sight. Sometimes the simplest answer is the right one.\n\nThink about common flag formats.', category:'crypto', difficulty:'easy', points:50, solveCount:342, solved:false, hint:'Flag format: CYBERSHIELD{...}. The most obvious answer.', flag:'CYBERSHIELD{h1dd3n_1n_pl41n_s1ght}' },
  { id:'ctf2', title:"Caesar's Secret", description:'A Roman general left this encrypted message:\n`PloreNerar{e0g3_f1a3_g0_c3a3e}`\n\nThe shift value is 13 (ROT13).', category:'crypto', difficulty:'easy', points:75, solveCount:256, solved:false, hint:'ROT13: shift each letter by 13. A becomes N.', flag:'CYBERSHIELD{r0t3_s1mpl3_c3s4r}' },
  { id:'ctf3', title:'Hash Cracker', description:'Crack this SHA-256 hash:\n`5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`\n\nMost common password ever.', category:'crypto', difficulty:'easy', points:100, solveCount:189, solved:false, hint:'8 characters, starts with p.', flag:'CYBERSHIELD{password}' },
  { id:'ctf4', title:'XOR Cipher', description:'Intercepted message. Key: 0x42\nEncrypted (hex): 1a0e1a3f4e084f0f4e3c1a4f084e0b1a3f', category:'crypto', difficulty:'medium', points:150, solveCount:98, solved:false, hint:'bytes([b ^ 0x42 for b in bytes.fromhex(hex_str)]).decode()', flag:'CYBERSHIELD{x0r_m4st3r_k3y}' },
  { id:'ctf5', title:'RSA Basics', description:'RSA parameters: n=3233, e=17, c=2790\nFactor n to find the private key.', category:'crypto', difficulty:'medium', points:200, solveCount:67, solved:false, hint:'Factor 3233 with primes under 100. n=p*q.', flag:'CYBERSHIELD{rs4_f4ct0r1ng_101}' },
  { id:'ctf6', title:'AES ECB Penguin', description:'Image encrypted with AES-ECB shows recognizable patterns.\nFlag is the weakness name in leet speak.', category:'crypto', difficulty:'hard', points:300, solveCount:34, solved:false, hint:'ECB weakness: lack of diffusion.', flag:'CYBERSHIELD{3cb_l4cks_d1ffus10n}' },
  { id:'ctf7', title:'SQL Injection 101', description:'Vulnerable login form.\n`SELECT * FROM users WHERE username=\'[input]\'`', category:'web', difficulty:'easy', points:100, solveCount:128, solved:false, hint:'Try: admin\' OR \'1\'=\'1\' --', flag:'CYBERSHIELD{sqli_m4st3r_2024}' },
  { id:'ctf8', title:'XSS Reflection', description:'Search page reflects input without escaping. Flag in admin cookie.\nURL: /search?q=YOUR_PAYLOAD', category:'web', difficulty:'medium', points:150, solveCount:87, solved:false, hint:'<script>document.cookie</script>', flag:'CYBERSHIELD{r3fl3ct3d_xss_ftw}' },
  { id:'ctf9', title:'Broken JWT', description:'Intercepted JWT with algorithm "none".\nForge a token with admin role.', category:'web', difficulty:'medium', points:200, solveCount:56, solved:false, hint:'"none" algorithm allows unsigned tokens.', flag:'CYBERSHIELD{jwt_n0n3_4lg0}' },
  { id:'ctf10', title:'SSRF to Internal', description:'Image proxy: /api/fetch?url=TARGET\nInternal admin: http://127.0.0.1:8080/admin', category:'web', difficulty:'hard', points:300, solveCount:29, solved:false, hint:'Try http://127.0.0.1:8080/admin', flag:'CYBERSHIELD{ssrf_t0_1nt3rn4l}' },
  { id:'ctf11', title:'Buffer Overflow Basic', description:'Vulnerable C: `gets(buf);` in 64-byte buffer.\nOverflow to call win().', category:'pwn', difficulty:'medium', points:200, solveCount:45, solved:false, hint:'64 bytes padding + win() address.', flag:'CYBERSHIELD{buff3r_0v3rfl0w_m4st3r}' },
  { id:'ctf12', title:'Format String Bug', description:'`printf(buf);` — exploit to leak "secret" global.', category:'pwn', difficulty:'hard', points:350, solveCount:18, solved:false, hint:'%x to leak stack, %p.%p.%p.%p to find pointer.', flag:'CYBERSHIELD{f0rm4t_str1ng_pwn3d}' },
  { id:'ctf13', title:'ROP Chain', description:'NX enabled, ASLR disabled. Build ROP chain.\nBinary: ./rop_challenge (64-bit ELF)', category:'pwn', difficulty:'insane', points:500, solveCount:8, solved:false, hint:'pop rdi; ret gadget, "/bin/sh" addr, system@plt.', flag:'CYBERSHIELD{r0p_ch41n_g0d}' },
  { id:'ctf14', title:'Heap Overflow', description:'Use-after-free / double-free in malloc/free. Get shell.\nBinary: ./heap_challenge', category:'pwn', difficulty:'insane', points:500, solveCount:5, solved:false, hint:'tcache poisoning. Free, overwrite fd pointer.', flag:'CYBERSHIELD{h34p_3xpl01t_pr0}' },
  { id:'ctf15', title:'Forensic Artifact', description:'Disk image. Find deleted file in MFT entry "secret.txt".\nTools: mmls, fls, icat', category:'forensics', difficulty:'medium', points:200, solveCount:42, solved:false, hint:'fls -r -p image.dd', flag:'CYBERSHIELD{d1g_d33p_1nt0_th3_b1ts}' },
  { id:'ctf16', title:'PCAP Analysis', description:'DNS exfiltration detected in network capture.\nFilter for unusual DNS queries.', category:'forensics', difficulty:'medium', points:175, solveCount:38, solved:false, hint:'dns.qry.name contains "exfil". Flag in subdomain hex.', flag:'CYBERSHIELD{dns_3xf1l_tr4c3d}' },
  { id:'ctf17', title:'Memory Forensics', description:'Memory dump from compromised machine.\nFind injected code with Volatility3.', category:'forensics', difficulty:'hard', points:350, solveCount:15, solved:false, hint:'vol -f memdump.raw windows.malfind', flag:'CYBERSHIELD{m3m_f0r3ns1cs_w1n}' },
  { id:'ctf18', title:'Steganography', description:'Image hides message via LSB steganography.\nDownload: challenge.png', category:'forensics', difficulty:'easy', points:125, solveCount:76, solved:false, hint:'steghide extract -sf challenge.png', flag:'CYBERSHIELD{lsb_h1dd3n_msg}' },
  { id:'ctf19', title:'Digital Footprint', description:'Username: @shadow_h4cker_2024\nCorrelate info across platforms. Flag: real name.', category:'osint', difficulty:'easy', points:75, solveCount:112, solved:false, hint:'Search Twitter, GitHub, Reddit for overlaps.', flag:'CYBERSHIELD{jane_doe_osint}' },
  { id:'ctf20', title:'Metadata Extract', description:'Photo EXIF has GPS coordinates.\nFlag: 6-digit latitude*1000.', category:'osint', difficulty:'easy', points:100, solveCount:94, solved:false, hint:'exiftool. Look for GPSLatitude field.', flag:'CYBERSHIELD{407123}' },
  { id:'ctf21', title:'Wayback Machine', description:'Website taken down. Use Wayback Machine for deleted page.\nURL: http://old-site.example.com/secret-page', category:'osint', difficulty:'medium', points:150, solveCount:63, solved:false, hint:'web.archive.org, check 2023 snapshots.', flag:'CYBERSHIELD{w4yb4ck_t1m3_m4ch1n3}' },
];

const DEMO_LABS: LabScenario[] = [
  { id:'lab1', title:'Network Reconnaissance', description:'Discover live hosts and open services on a simulated network segment using ping, nmap, and netstat.', difficulty:'easy', duration:'15 min', category:'networking', objectives:[{id:'o1',description:'Ping scan to discover live hosts',verificationPattern:'ping'},{id:'o2',description:'Perform full port scan with nmap',verificationPattern:'nmap'},{id:'o3',description:'Identify running services and versions',verificationPattern:'nmap.*-sV'}], steps:['Run ping sweep to find live hosts','Use nmap -sV for service detection','Document all open ports and services','Identify potential vulnerabilities'], hints:['Try: ping 192.168.1.1','Use: nmap -sV 192.168.1.10','Look for outdated software versions'] },
  { id:'lab2', title:'Port Scanning with Nmap', description:'Master Nmap scanning techniques including SYN scan, UDP scan, OS detection, and NSE scripts.', difficulty:'easy', duration:'20 min', category:'networking', objectives:[{id:'o4',description:'Perform SYN scan on target',verificationPattern:'nmap.*-sS'},{id:'o5',description:'Detect operating system',verificationPattern:'nmap.*-O'},{id:'o6',description:'Run vulnerability scan scripts',verificationPattern:'nmap.*-sC'}], steps:['Basic SYN scan: nmap -sS target','OS detection: nmap -O target','Script scan: nmap -sC target','Analyze results and identify risks'], hints:['Default nmap is SYN scan','-O enables OS fingerprinting','-sC runs default vulnerability scripts'] },
  { id:'lab3', title:'SQL Injection Lab', description:'Exploit SQL injection vulnerabilities in a simulated web application. Practice UNION-based and blind injection.', difficulty:'medium', duration:'30 min', category:'web', objectives:[{id:'o7',description:'Identify injectable parameter',verificationPattern:'sqlmap|sql'},{id:'o8',description:'Extract database names',verificationPattern:'sqlmap'},{id:'o9',description:'Extract data from target table',verificationPattern:'sqlmap'}], steps:['Identify the vulnerable parameter','Use sqlmap to automate injection','Enumerate databases and tables','Extract sensitive data'], hints:['sqlmap -u "http://target/login.php" --data="username=admin&password=test"','Add --dbs to enumerate databases','-D dbname --tables'] },
  { id:'lab4', title:'Cryptography Tools', description:'Practice using openssl, hashcat, and Python for encryption, hashing, and password cracking.', difficulty:'medium', duration:'25 min', category:'crypto', objectives:[{id:'o10',description:'Generate SHA-256 hash',verificationPattern:'openssl.*dgst'},{id:'o11',description:'Crack a password hash',verificationPattern:'hashcat|john'},{id:'o12',description:'Encrypt/decrypt with AES',verificationPattern:'openssl.*enc'}], steps:['Create hashes with openssl dgst','Crack hashes with hashcat','Encrypt a file with AES-256-CBC','Decrypt the file to verify'], hints:['openssl dgst -sha256 -text','hashcat -m 1400 hash.txt wordlist','openssl enc -aes-256-cbc -salt -in file -out file.enc'] },
  { id:'lab5', title:'XSS Discovery', description:'Find and exploit cross-site scripting vulnerabilities in a simulated web application.', difficulty:'medium', duration:'25 min', category:'web', objectives:[{id:'o13',description:'Identify reflected XSS point',verificationPattern:'curl.*search'},{id:'o14',description:'Craft XSS payload',verificationPattern:'curl|nikto'},{id:'o15',description:'Scan for other web vulns',verificationPattern:'nikto'}], steps:['Use curl to test input reflection','Craft XSS payload','Run nikto for comprehensive scan','Document all findings'], hints:['curl "http://target/search?q=<script>alert(1)</script>"','Try event handlers: onerror, onload','nikto -h http://target'] },
  { id:'lab6', title:'Steganography', description:'Extract hidden messages from images using steganography tools and analyze file metadata.', difficulty:'easy', duration:'20 min', category:'forensics', objectives:[{id:'o16',description:'Extract file metadata',verificationPattern:'exiftool'},{id:'o17',description:'Extract hidden message',verificationPattern:'steghide'},{id:'o18',description:'Analyze file structure',verificationPattern:'binwalk'}], steps:['Examine image metadata with exiftool','Extract hidden data with steghide','Analyze file with binwalk','Recover the flag'], hints:['exiftool challenge.png','steghide extract -sf challenge.png','binwalk -e suspicious_file'] },
  { id:'lab7', title:'PCAP Analysis', description:'Analyze network capture files to detect suspicious activity and data exfiltration.', difficulty:'medium', duration:'30 min', category:'forensics', objectives:[{id:'o19',description:'Examine capture file type',verificationPattern:'file.*pcap'},{id:'o20',description:'Analyze web server logs',verificationPattern:'cat.*log'},{id:'o21',description:'Investigate auth failures',verificationPattern:'cat.*auth'}], steps:['Identify capture file type','Examine web server access logs','Check authentication logs','Correlate findings to identify attack'], hints:['file captures/network_capture.pcap','cat /var/log/nginx/access.log','cat /var/log/auth.log'] },
  { id:'lab8', title:'Privilege Escalation', description:'Explore Linux privilege escalation: SUID binaries, sudo misconfigs, and cron jobs.', difficulty:'hard', duration:'45 min', category:'pentesting', objectives:[{id:'o22',description:'Check user permissions',verificationPattern:'id|whoami'},{id:'o23',description:'Find SUID binaries',verificationPattern:'find.*suid'},{id:'o24',description:'Check sudo config',verificationPattern:'sudo'},{id:'o25',description:'Check scheduled tasks',verificationPattern:'crontab|cat.*cron'}], steps:['Identify current user context','Search for SUID/SGID binaries','Check sudo -l','Examine cron jobs','Attempt escalation'], hints:['id && whoami','find / -perm -4000 2>/dev/null','sudo -l','cat /etc/crontab'] },
  { id:'lab9', title:'Reverse Engineering', description:'Analyze compiled binary using file, strings, objdump, and gdb.', difficulty:'hard', duration:'40 min', category:'malware', objectives:[{id:'o26',description:'Identify binary file type',verificationPattern:'file.*challenge'},{id:'o27',description:'Extract strings from binary',verificationPattern:'strings'},{id:'o28',description:'Disassemble binary code',verificationPattern:'objdump'},{id:'o29',description:'Analyze in debugger',verificationPattern:'gdb'}], steps:['file command','strings extraction','objdump disassembly','gdb dynamic analysis','Find vulnerability'], hints:['file exercises/challenge.c','strings exercises/challenge.c','objdump -d binary','gdb ./binary'] },
  { id:'lab10', title:'Malware Analysis', description:'Static analysis of suspicious file. Identify indicators of compromise.', difficulty:'hard', duration:'45 min', category:'malware', objectives:[{id:'o30',description:'Classify suspicious file',verificationPattern:'file.*suspicious'},{id:'o31',description:'Extract metadata/embedded files',verificationPattern:'exiftool|binwalk'},{id:'o32',description:'Search for IOCs in logs',verificationPattern:'grep.*log'}], steps:['Classify file type','Extract metadata','Check for embedded files','Analyze log files','Compile IOCs report'], hints:['file captures/disk_image.dd','binwalk -e suspicious_file','grep -i "suspicious" /var/log/auth.log'] },
  { id:'lab11', title:'Cloud Security Recon', description:'Explore cloud security: IAM policies, S3 bucket enumeration, metadata services.', difficulty:'medium', duration:'30 min', category:'cloud', objectives:[{id:'o33',description:'Enumerate cloud infra',verificationPattern:'nmap|curl'},{id:'o34',description:'Test for open storage',verificationPattern:'curl'},{id:'o35',description:'Check network config',verificationPattern:'ifconfig|ip'}], steps:['Identify cloud services','Test for public storage','Review network security groups','Document findings'], hints:['nmap -sV cloud-target','curl http://target.s3.amazonaws.com/','ifconfig'] },
  { id:'lab12', title:'Wireless Security', description:'Wireless security: WPA/WPA2, evil twin detection, WPS vulnerabilities.', difficulty:'medium', duration:'30 min', category:'networking', objectives:[{id:'o36',description:'Analyze wireless interface',verificationPattern:'ifconfig|ip'},{id:'o37',description:'Scan for wireless networks',verificationPattern:'nmap|netstat'},{id:'o38',description:'Review wireless config',verificationPattern:'cat.*config'}], steps:['Identify wireless interfaces','Scan for access points','Analyze security config','Identify vulnerabilities'], hints:['ifconfig or ip a','nmap -sU target','cat /etc/network/interfaces'] },
];

const DEMO_BADGES = [
  { name:'First Blood', icon:'🎯', description:'Complete your first challenge', rarity:'common', earned:true, xpReward:50 },
  { name:'Quiz Master', icon:'🧠', description:'Score 100% on a quiz', rarity:'rare', earned:true, xpReward:100 },
  { name:'Lab Explorer', icon:'🔬', description:'Complete a lab session', rarity:'common', earned:true, xpReward:75 },
  { name:'Focus Champion', icon:'👁️', description:'Maintain 90%+ focus for 5 sessions', rarity:'rare', earned:false, xpReward:150 },
  { name:'CTF Winner', icon:'🚩', description:'Capture 5 flags', rarity:'epic', earned:false, xpReward:200 },
  { name:'Cipher Master', icon:'🔐', description:'Solve 10 crypto challenges', rarity:'legendary', earned:false, xpReward:500 },
  { name:'Night Owl', icon:'🦉', description:'Study past midnight', rarity:'common', earned:false, xpReward:25 },
  { name:'Eagle Eye', icon:'🦅', description:'Accumulate 2000+ XP', rarity:'epic', earned:false, xpReward:300 },
  { name:'Unbreakable', icon:'🛡️', description:'Pass 3 quizzes on first attempt', rarity:'rare', earned:false, xpReward:200 },
  { name:'Speed Demon', icon:'⚡', description:'Complete a quiz in under 60s', rarity:'epic', earned:false, xpReward:250 },
  { name:'Network Ninja', icon:'🌐', description:'Complete all network modules', rarity:'rare', earned:false, xpReward:300 },
  { name:'Pentest Pro', icon:'⚔️', description:'Complete 10 lab sessions', rarity:'epic', earned:false, xpReward:400 },
  { name:'Bug Hunter', icon:'🐛', description:'Find 20 vulnerabilities across CTFs', rarity:'legendary', earned:false, xpReward:600 },
  { name:'Streak Legend', icon:'🔥', description:'Maintain a 30-day streak', rarity:'legendary', earned:false, xpReward:500 },
  { name:'Social Engineer', icon:'🎭', description:'Complete OSINT challenges', rarity:'rare', earned:false, xpReward:150 },
];

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank:1, id:'l1', name:'Sarah K.', xp:8750, level:11, title:'Threat Hunter', badges:9, ctfSolves:18, streak:15 },
  { rank:2, id:'l2', name:'James R.', xp:7200, level:10, title:'Incident Commander', badges:8, ctfSolves:14, streak:12 },
  { rank:3, id:'l3', name:'Nina V.', xp:6300, level:10, title:'Incident Commander', badges:6, ctfSolves:11, streak:14 },
  { rank:4, id:'l4', name:'Priya M.', xp:5800, level:9, title:'Security Architect', badges:7, ctfSolves:11, streak:8 },
  { rank:5, id:'l5', name:'Yuki T.', xp:4500, level:8, title:'Pen Tester', badges:5, ctfSolves:8, streak:10 },
  { rank:6, id:'l6', name:'Marco R.', xp:3200, level:7, title:'Cyber Defender', badges:4, ctfSolves:6, streak:9 },
  { rank:7, id:'l7', name:'Lin W.', xp:2800, level:7, title:'Cyber Defender', badges:3, ctfSolves:5, streak:5 },
  { rank:8, id:'l8', name:'Alex C.', xp:1450, level:6, title:'Security Engineer', badges:3, ctfSolves:4, streak:7 },
  { rank:9, id:'l9', name:'Omar H.', xp:2100, level:6, title:'Security Engineer', badges:2, ctfSolves:3, streak:4 },
  { rank:10, id:'l10', name:'Emma T.', xp:1800, level:6, title:'Security Engineer', badges:2, ctfSolves:2, streak:3 },
  { rank:11, id:'l11', name:'Raj P.', xp:1200, level:5, title:'Network Guardian', badges:1, ctfSolves:1, streak:6 },
  { rank:12, id:'l12', name:'New User', xp:100, level:1, title:'Script Kiddie', badges:0, ctfSolves:0, streak:1 },
];

const TABS = [
  { id:'dashboard', label:'Dashboard', icon: LayoutDashboard },
  { id:'courses', label:'Courses', icon: BookOpen },
  { id:'classroom', label:'AI Professor', icon: Brain },
  { id:'quizzes', label:'Quizzes', icon: Target },
  { id:'labs', label:'Lab Terminal', icon: TerminalIcon },
  { id:'ctf', label:'CTF Arena', icon: Flag },
  { id:'gamification', label:'Rank & Badges', icon: Trophy },
  { id:'analytics', label:'Analytics', icon: BarChart3 },
  { id:'certificates', label:'Certificates', icon: Award },
];
const NAV_CATS = [{id:'all',label:'All'},{id:'networking',label:'Networking'},{id:'web',label:'Web'},{id:'pentesting',label:'Pentesting'},{id:'forensics',label:'Forensics'},{id:'cloud',label:'Cloud'},{id:'malware',label:'Malware'},{id:'crypto',label:'Crypto'},{id:'mobile',label:'Mobile'}];
const CTF_CATS = [{id:'all',label:'All'},{id:'crypto',label:'Crypto'},{id:'web',label:'Web'},{id:'pwn',label:'Pwn'},{id:'forensics',label:'Forensics'},{id:'osint',label:'OSINT'}];
const CTF_DIFFS = [{id:'all',label:'All Levels'},{id:'easy',label:'Easy'},{id:'medium',label:'Medium'},{id:'hard',label:'Hard'},{id:'insane',label:'Insane'}];
const CAT_ICONS: Record<string, LucideIcon> = { crypto:Lock, web:Globe, pwn:Bug, forensics:Fingerprint, osint:Search };
const CAT_CLS: Record<string, string> = { crypto:'cat-crypto', web:'cat-web', pwn:'cat-pwn', forensics:'cat-forensics', osint:'cat-osint' };

const notifications = [
  { id:'n1', title:'New CTF Challenges', message:'Heap Overflow & ROP Chain now live!', time:'2m ago', read:false },
  { id:'n2', title:'Quiz Score', message:'Scored 90% on Network Fundamentals!', time:'1h ago', read:false },
  { id:'n3', title:'Badge Earned', message:'Quiz Master badge earned!', time:'3h ago', read:true },
  { id:'n4', title:'New Lab', message:'Reverse Engineering lab available!', time:'5h ago', read:true },
  { id:'n5', title:'Streak Bonus', message:'7-day streak! +550 XP!', time:'1d ago', read:true },
  { id:'n6', title:'Leaderboard', message:'Moved up to rank #8!', time:'2d ago', read:true },
];

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLES — useMemo avoids hydration / setState-in-effect issues
   ═══════════════════════════════════════════════════════════════════════ */

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i, left: `${Math.random()*100}%`, delay: `${Math.random()*10}s`,
      duration: `${10+Math.random()*15}s`, size: `${1+Math.random()*2.5}px`,
      color: ['rgba(0,240,255,0.5)','rgba(191,0,255,0.35)','rgba(57,255,20,0.35)','rgba(255,0,110,0.25)'][i%4],
    })), []);
  return (
    <div className="holo-bg">
      {particles.map(p => (
        <div key={p.id} className="particle particle-glow" style={{ left:p.left, width:p.size, height:p.size, background:p.color, animationDelay:p.delay, animationDuration:p.duration }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3D TILT HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

const onTilt = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--tilt-x', ((e.clientY-r.top)/r.height-0.5)*-8+'deg');
  e.currentTarget.style.setProperty('--tilt-y', ((e.clientX-r.left)/r.width-0.5)*8+'deg');
};
const offTilt = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty('--tilt-x','0deg');
  e.currentTarget.style.setProperty('--tilt-y','0deg');
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════ */

export default function App() {
  /* ── state ── */
  const [tab, setTab] = useState('dashboard');
  const [auth, setAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginMode, setLoginMode] = useState<'login'|'signup'>('login');
  const [lEmail, setLEmail] = useState('');
  const [lPass, setLPass] = useState('');
  const [lName, setLName] = useState('');
  const [lErr, setLErr] = useState('');
  const [lShowP, setLShowP] = useState(false);
  const [user, setUser] = useState<UserData>(DEMO_USER);

  const [msgs, setMsgs] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState(true);
  const mrRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement|null>(null);

  const [qCourse, setQCourse] = useState<string|null>(null);
  const [qQs, setQQs] = useState<QuizQ[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [qAns, setQAns] = useState<Record<string,number>>({});
  const [qDone, setQDone] = useState(false);
  const [qScore, setQScore] = useState(0);
  const [qTime, setQTime] = useState(300);
  const qTimer = useRef<ReturnType<typeof setInterval>|null>(null);

  const [labOut, setLabOut] = useState<string[]>(['\x1b[36m═══════════════════════════════════════════════════\x1b[0m','\x1b[1;33m  CyberShield Academy - Secure Lab Environment\x1b[0m','','  Type \'help\' for commands, \'status\' for objectives.','']);
  const [labIn, setLabIn] = useState('');
  const [labOn, setLabOn] = useState(false);
  const [selLab, setSelLab] = useState<LabScenario|null>(null);
  const [labObj, setLabObj] = useState<{id:string;description:string;completed:boolean}[]>([]);
  const [labList, setLabList] = useState(true);
  const labEnd = useRef<HTMLDivElement>(null);

  const [cFilter, setCFilter] = useState('all');
  const [selCourse, setSelCourse] = useState<CourseData|null>(null);
  const [ctfCat, setCtfCat] = useState('all');
  const [ctfDiff, setCtfDiff] = useState('all');
  const [ctfFlag, setCtfFlag] = useState('');
  const [ctfRes, setCtfRes] = useState<{ok:boolean;msg:string;pts:number}|null>(null);
  const [ctfs, setCtfs] = useState(DEMO_CTF);
  const [selCtf, setSelCtf] = useState<CtfChallenge|null>(null);
  const [ctfHint, setCtfHint] = useState(false);
  const [focus, setFocus] = useState(87);
  const [notifOpen, setNotifOpen] = useState(false);

  /* ── derived ── */
  const lvl = user.level;
  const xp = user.xp;
  const xpN = LEVEL_XP[Math.min(lvl, LEVEL_XP.length-1)]||LEVEL_XP[LEVEL_XP.length-1];
  const xpP = LEVEL_XP[Math.min(lvl-1, LEVEL_XP.length-1)]||0;
  const xpPct = ((xp-xpP)/(xpN-xpP))*100;
  const uRank = DEMO_LEADERBOARD.findIndex(e=>e.id==='l8')+1;
  const filCourses = cFilter==='all'?DEMO_COURSES:DEMO_COURSES.filter(c=>c.category===cFilter);
  const filCtf = ctfs.filter(c=>(ctfCat==='all'||c.category===ctfCat)&&(ctfDiff==='all'||c.difficulty===ctfDiff));
  const totalPts = ctfs.reduce((s,c)=>s+c.points,0);
  const solvedPts = ctfs.filter(c=>c.solved).reduce((s,c)=>s+c.points,0);
  const objDone = labObj.filter(o=>o.completed).length;

  /* ── effects ── */
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:'smooth'});},[msgs,typing]);
  useEffect(()=>{labEnd.current?.scrollIntoView({behavior:'smooth'});},[labOut]);
  useEffect(()=>{if(!qCourse||qDone)return;qTimer.current=setInterval(()=>{setQTime(p=>{if(p<=1){clearInterval(qTimer.current!);return 0;}return p-1;});},1000);return()=>{if(qTimer.current)clearInterval(qTimer.current);};},[qCourse,qDone]);
  useEffect(()=>{if(!auth)return;let fs=Date.now();const onF=()=>{fs=Date.now();setFocus(s=>Math.min(100,s+2));};const onB=()=>{if(Date.now()-fs>5000)setFocus(s=>Math.max(0,s-5));};window.addEventListener('focus',onF);window.addEventListener('blur',onB);return()=>{window.removeEventListener('focus',onF);window.removeEventListener('blur',onB);};},[auth]);

  /* ── handlers ── */
  const doLogin = () => { if(!lEmail||!lPass){setLErr('Please fill in all fields');return;} if(loginMode==='signup'&&!lName){setLErr('Please enter your name');return;} setLErr('');setAuth(true);setShowLogin(false);setUser(loginMode==='signup'?{...DEMO_USER,name:lName,email:lEmail}:DEMO_USER); };
  const doLogout = () => { setAuth(false);setShowLogin(true);setTab('dashboard');setMsgs([WELCOME_MSG]);setSelLab(null);setLabList(true);setLabOn(false); };

  const send = async (text?:string) => {
    const m = text||input; if(!m.trim()) return;
    setMsgs(p=>[...p,{id:`u-${Date.now()}`,role:'user',content:m,timestamp:new Date().toISOString()}]);
    setInput(''); setTyping(true);
    try {
      const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:user.id,sessionId:`s-${Date.now()}`,message:m,history:msgs.slice(-10).map(x=>({role:x.role,content:x.content}))})});
      if(!r.ok) throw 0;
      const rd = r.body?.getReader(); const dec = new TextDecoder(); let full='';
      if(rd){const ai={id:`a-${Date.now()}`,role:'assistant',content:'',timestamp:new Date().toISOString()};setMsgs(p=>[...p,ai]);while(true){const{done,value}=await rd.read();if(done)break;full+=dec.decode(value,{stream:true});setMsgs(p=>p.map(x=>x.id===ai.id?{...x,content:full}:x));}}
      if(voice&&full) try{const c2=m.replace(/[#*`~>[\]()]/g,'').slice(0,1000);const r2=await fetch('/api/voice/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:c2,voice:'jam',speed:1})});if(r2.ok){const b=await r2.blob();const u=URL.createObjectURL(b);const a=new Audio(u);audioRef.current=a;setSpeaking(true);a.onended=()=>{setSpeaking(false);URL.revokeObjectURL(u);};a.play();}}catch{}
    } catch { setMsgs(p=>[...p,{id:`e-${Date.now()}`,role:'assistant',content:"I'm having connectivity issues. Please try again.",timestamp:new Date().toISOString()}]); }
    setTyping(false);
  };

  const stopSpeak = () => { audioRef.current?.pause(); audioRef.current=null; setSpeaking(false); };
  const toggleRec = async () => {
    if(recording){mrRef.current?.stop();setRecording(false);return;}
    try{const s=await navigator.mediaDevices.getUserMedia({audio:true});const mr=new MediaRecorder(s);chunksRef.current=[];
    mr.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data);};
    mr.onstop=async()=>{s.getTracks().forEach(t=>t.stop());const b=new Blob(chunksRef.current,{type:'audio/webm'});const fd=new FormData();fd.append('audio',b,'recording.webm');
    try{const r=await fetch('/api/voice/asr',{method:'POST',body:fd});const d=await r.json();if(d.success&&d.text)send(d.text);}catch{}};
    mrRef.current=mr;mr.start();setRecording(true);}catch{}
  };

  const labCmd = (cmd:string) => {
    const out=[...labOut,`\x1b[32mstudent@cybershield\x1b[0m:\x1b[34m~\x1b[0m$ ${cmd}`];
    let r:string[]=[]; const c=cmd.trim().toLowerCase();
    if(c==='help') r=['Available commands:','  ls, cd, cat, pwd, whoami, id, echo, clear, history','  nmap <target>, curl <url>, dig <domain>','  hashcat <hash>, sqlmap <url>, nikto <url>','  gobuster, hydra, openssl, iptables','  file, strings, objdump, gdb, exiftool, binwalk','  ping, ifconfig, netstat, traceroute, ps aux','  python3, bash, gcc, tree, find, grep, head, tail, wc','  status - show lab objectives'];
    else if(c==='clear'){setLabOut([]);setLabIn('');return;}
    else if(c==='whoami') r=['student'];
    else if(c==='id') r=['uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)'];
    else if(c==='pwd') r=['/home/student'];
    else if(c==='ls') r=['drwxr-xr-x  targets/  exercises/  tools/  captures/','-rw-r--r--  notes.txt','-rwx------  exploit.py'];
    else if(c==='tree') r=['/home/student','├── exercises/','│   ├── task1.sh, task2.py, challenge.c','├── tools/','│   ├── scanner.py, cracker.py','├── targets/','│   ├── vulnerable_app, config.yaml','├── captures/','│   ├── network_capture.pcap','└── notes.txt'];
    else if(c==='ifconfig'||c==='ip a') r=['eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500','        inet 172.17.0.3  netmask 255.255.0.0','        ether 02:42:ac:11:00:03','lo: flags=73<UP,LOOPBACK,RUNNING> mtu 65536','        inet 127.0.0.1  netmask 255.0.0.0'];
    else if(c.startsWith('nmap')){r=[`Starting Nmap 7.94 at ${new Date().toISOString()}`,`Nmap scan report for ${c.split(' ')[1]||'192.168.1.10'}`,'Host is up (0.0034s latency).','PORT     STATE SERVICE       VERSION','22/tcp   open  ssh           OpenSSH 8.9p1','80/tcp   open  http          Apache/2.4.54','443/tcp  open  ssl/https     Apache/2.4.54','3306/tcp open  mysql         MySQL 8.0.32','8080/tcp open  http-proxy    nginx/1.23.3','','Nmap done: 1 IP address scanned in 3.47s'];checkObj(c);}
    else if(c.startsWith('hashcat')||c.startsWith('john')){r=['hashcat (v6.2.6) starting...','','5e884898...:password','','Status: Cracked','Hash.Mode: 1400 (SHA2-256)','','1 recovered from 1 input hashes'];checkObj(c);}
    else if(c.startsWith('sqlmap')){r=['[*] testing connection...','[INFO] parameter appears to be injectable','back-end DBMS: MySQL >= 5.6','[INFO] fetching database names','available databases [3]:','[*] information_schema','[*] app_db','[*] secrets'];checkObj(c);}
    else if(c.startsWith('nikto')){r=['- Nikto v2.5.0','+ Target IP: 192.168.1.10','+ Server: Apache/2.4.52 (Ubuntu)','+ /: X-Content-Type-Options missing','+ /admin/: Directory indexing found','+ /phpinfo.php: PHP info exposed','+ 6 items found'];checkObj(c);}
    else if(c.startsWith('curl')){r=['HTTP/1.1 200 OK','<h1>Welcome to Target Corp Internal Portal</h1>','<p>Server: Apache/2.4.52 (Ubuntu)</p>'];checkObj(c);}
    else if(c.startsWith('openssl')){r=['OpenSSL 3.0.2 15 Mar 2022','e3b0c44298fc1c149afbf4c8996fb924...'];checkObj(c);}
    else if(c.startsWith('iptables -l')||c.startsWith('iptables -L')){r=['Chain INPUT (policy DROP)','ACCEPT     tcp  --  0.0.0.0/0    tcp dpt:22','ACCEPT     tcp  --  0.0.0.0/0    tcp dpt:80','ACCEPT     tcp  --  0.0.0.0/0    tcp dpt:443','DROP       all  --  0.0.0.0/0    ctstate INVALID','','Chain FORWARD (policy DROP)','Chain OUTPUT (policy ACCEPT)'];checkObj(c);}
    else if(c.startsWith('file ')) r=[`${c.split(' ')[1]}: ${c.includes('.py')?'Python script, ASCII':c.includes('.c')?'C source, ASCII':'data'}`];
    else if(c.startsWith('strings ')) r=['/lib/x86_64-linux-gnu/libc.so.6','__libc_start_main','GLIBC_2.34','flag.txt','CYBERSHIELD{'];
    else if(c.startsWith('objdump ')) r=[`${c.split(' ')[1]}: file format elf64-x86-64`,'Disassembly of section .text:','0000000000001149 <main>:','    1149: endbr64','    114d: push   rbp','    1158: call   gets@plt'];
    else if(c.startsWith('gdb ')) r=['GNU gdb (Ubuntu 12.1)','(gdb) disassemble main','   0x1149 <+0>: endbr64','   0x114d <+4>: push   rbp','   0x1158 <+15>: call   gets@plt'];
    else if(c.startsWith('exiftool')) r=['ExifTool Version: 12.50','MIME Type: image/jpeg','Image Width: 1920  Height: 1080','GPS Latitude: 40.7123  Longitude: -74.0060','Author: shadow_h4cker'];checkObj(c);}
    else if(c.startsWith('binwalk')) r=['DECIMAL   HEXADECIMAL   DESCRIPTION','0         0x0           JPEG image data','3021      0xBCD         Zip archive data','15840     0x3DF0        ELF, 64-bit LSB','45056     0xB000        SQLite format 3','N.B.: Embedded files found!'];checkObj(c);}
    else if(c.startsWith('ping ')){const t=c.split(' ')[1]||'8.8.8.8';r=['PING '+t+': 56 bytes','64 bytes: icmp_seq=1 ttl=118 time='+((Math.random()*20+5).toFixed(1))+' ms','3 packets transmitted, 3 received, 0% loss'];}
    else if(c.startsWith('ps ')) r=['USER    PID %CPU  COMMAND','root      1  0.0  /sbin/init','student  100  0.0  -bash','www-data 200  0.1  nginx','mysql    300  0.5  /usr/sbin/mysqld'];
    else if(c==='status'){const comp=labObj.filter(o=>o.completed).length;const tot=labObj.length;r=['=== Lab Objectives: '+comp+'/'+tot+' ('+Math.round(comp/Math.max(tot,1)*100)+'%) ===',...labObj.map(o=>'  '+(o.completed?'[x]':'[ ]')+' '+o.description)];}
    else if(c.startsWith('cat notes')) r=['Cybersecurity Lab Notes','=========================','Session 1: Network Reconnaissance','Session 2: Web App Security','TODO: Complete buffer overflow lab'];
    else if(c.startsWith('cat ')) r=[c.includes('password')?'admin:$2b$12$LJ3m4ys3Lk...':`cat: ${c.split(' ')[1]||'?'}: No such file`];
    else if(c==='') r=[];
    else r=[`bash: ${cmd.split(' ')[0]}: command not found. Type 'help'.`];
    setLabOut(p=>[...out,...r.map(l=>l||''),'']);setLabIn('');
  };

  const checkObj = (cmd:string) => setLabObj(p=>p.map(o=>{if(o.completed)return o;return new RegExp(o.verificationPattern,'i').test(cmd)?{...o,completed:true}:o;}));
  const startLab = (lab:LabScenario) => {setSelLab(lab);setLabObj(lab.objectives.map(o=>({...o,completed:false})));setLabOut(['\x1b[36m═══════════════════════════════════════\x1b[0m',`\x1b[1;33m  Lab: ${lab.title}\x1b[0m`,`  Difficulty: ${lab.difficulty} | Duration: ${lab.duration}`,'',...lab.steps.map((s,i)=>`  \x1b[33mStep ${i+1}:\x1b[0m ${s}`),'','  Type \'help\' for commands, \'status\' for objectives.','']);setLabOn(true);setLabList(false);};
  const startQuiz = (cid:string) => { const qs=DEMO_QUIZZES[cid]; if(!qs)return; setQCourse(cid);setQQs(qs);setQIdx(0);setQAns({});setQDone(false);setQScore(0);setQTime(300); };
  const submitQuiz = () => { if(!qCourse)return; let s=0; qQs.forEach(q=>{if(qAns[q.id]===q.correctIndex)s+=Math.round(100/qQs.length);}); setQScore(s);setQDone(true);if(qTimer.current)clearInterval(qTimer.current); };
  const submitFlag = (cid:string) => { const ch=ctfs.find(c=>c.id===cid);if(!ch||!ctfFlag.trim())return;const ok=ctfFlag.trim()===ch.flag;if(ok){setCtfs(p=>p.map(c=>c.id===cid?{...c,solved:true,solveCount:c.solveCount+1}:c));setUser(u=>({...u,xp:u.xp+ch.points}));}setCtfRes({ok,msg:ok?`Correct! +${ch.points} XP`:'Incorrect flag. Try again!',pts:ok?ch.points:0});setCtfFlag('');setTimeout(()=>setCtfRes(null),4000); };

  /* ═══════════════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════════════ */

  /* ── LOGIN ── */
  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center p-4"><Particles/>
      <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
        <div className="login-card w-full max-w-md p-8">
          <div className="flex justify-center mb-6"><div className="holo-shield p-4 rounded-2xl"><Shield className="w-12 h-12 neon-text"/></div></div>
          <h1 className="text-3xl font-bold text-center mb-2"><span className="text-gradient-holo">CyberShield</span> Academy</h1>
          <p className="text-center text-sm text-[#64748b] mb-8">AI-Powered Cybersecurity Learning Platform</p>
          <div className="space-y-4">
            {loginMode==='signup'&&<div><label className="text-xs text-[#64748b] mb-1 block">Full Name</label><input className="holo-input w-full" placeholder="Enter your name" value={lName} onChange={e=>setLName(e.target.value)}/></div>}
            <div><label className="text-xs text-[#64748b] mb-1 block">Email</label><input className="holo-input w-full" type="email" placeholder="you@cybershield.academy" value={lEmail} onChange={e=>setLEmail(e.target.value)}/></div>
            <div><label className="text-xs text-[#64748b] mb-1 block">Password</label><div className="relative"><input className="holo-input w-full pr-10" type={lShowP?'text':'password'} placeholder="Enter password" value={lPass} onChange={e=>setLPass(e.target.value)}/><button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#00f0ff]" onClick={()=>setLShowP(!lShowP)}>{lShowP?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
            {lErr&&<p className="text-pink-400 text-sm">{lErr}</p>}
            <button className="holo-btn holo-btn-primary w-full" onClick={doLogin}>{loginMode==='login'?'Sign In':'Create Account'}</button>
            <p className="text-center text-sm text-[#64748b]">{loginMode==='login'?"Don't have an account?":"Already have an account?"} <button className="neon-text hover:underline" onClick={()=>{setLoginMode(loginMode==='login'?'signup':'login');setLErr('');}}>{loginMode==='login'?'Sign Up':'Sign In'}</button></p>
            <p className="text-center text-xs text-[#475569]">Demo: alex@cybershield.academy / demo1234</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
  <div className="min-h-screen relative"><Particles/>
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-[rgba(0,240,255,0.08)] px-4 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="holo-shield p-1.5 rounded-lg"><Shield className="w-6 h-6 neon-text"/></div><span className="text-lg font-bold text-gradient-holo hidden sm:block">CyberShield</span></div>
          <nav className="flex items-center gap-1 overflow-x-auto">{TABS.map(t=>(<button key={t.id} className={`holo-tab ${tab===t.id?'holo-tab-active':''}`} onClick={()=>setTab(t.id)}><t.icon size={15}/><span className="ml-1.5 hidden md:inline">{t.label}</span></button>))}</nav>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[rgba(0,240,255,0.05)]" onClick={()=>setNotifOpen(!notifOpen)}>{notifications.some(n=>!n.read)&&<span className="notif-dot absolute top-1 right-1"/>}<Bell size={18} className="text-[#64748b]"/></button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel"><Avatar className="w-7 h-7"><AvatarFallback className="bg-[rgba(0,240,255,0.15)] text-xs neon-text">{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><span className="text-sm font-medium hidden lg:block">{user.name}</span><button className="text-[#64748b] hover:text-pink-400 ml-1" onClick={doLogout}><LogOut size={14}/></button></div>
          </div>
        </div>
      </header>

      {/* ── NOTIFICATIONS ── */}
      <AnimatePresence>{notifOpen&&<motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="fixed top-14 right-4 z-50 w-80 holo-card p-0" style={{maxHeight:'400px'}}>
        <div className="p-4 border-b border-[rgba(0,240,255,0.08)]"><h3 className="font-semibold flex items-center gap-2"><Bell size={16}/>Notifications</h3></div>
        <ScrollArea className="max-h-[340px]">{notifications.map(n=>(<div key={n.id} className={`p-3 border-b border-[rgba(30,41,59,0.3)] hover:bg-[rgba(0,240,255,0.03)] ${!n.read?'bg-[rgba(0,240,255,0.02)]':''}`}><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-[#64748b] mt-0.5">{n.message}</p><p className="text-xs text-[#475569] mt-1">{n.time}</p></div>))}</ScrollArea>
      </motion.div>}</AnimatePresence>

      {/* ── MAIN ── */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 relative z-10">
        <AnimatePresence mode="wait"><motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.25}}>

          {/* ═══════ DASHBOARD ═══════ */}
          {tab==='dashboard'&&(<div className="space-y-6">
            <div><h1 className="text-2xl font-bold">Welcome back, <span className="neon-text">{user.name}</span></h1><p className="text-[#64748b] text-sm mt-1">{LEVEL_TITLES[Math.min(lvl-1,LEVEL_TITLES.length-1)]} · Level {lvl} · {user.streakDays}-day streak <Flame className="inline w-4 h-4 text-orange-400"/></p></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[{icon:Zap,label:'Total XP',value:xp.toLocaleString(),color:'#00f0ff'},{icon:Flag,label:'CTF Solved',value:`${ctfs.filter(c=>c.solved).length}/${ctfs.length}`,color:'#bf00ff'},{icon:Flame,label:'Day Streak',value:String(user.streakDays),color:'#ff6b35'},{icon:Trophy,label:'Global Rank',value:`#${uRank}`,color:'#ffd700'}].map((s,i)=>(
                <div key={i} className="stat-card-3d p-5" style={{'--stat-color':s.color} as React.CSSProperties} onMouseMove={onTilt} onMouseLeave={offTilt}>
                  <div className="flex items-center justify-between mb-3"><s.icon size={20} style={{color:s.color}}/><span className="text-xs text-[#64748b]">{s.label}</span></div>
                  <p className="text-2xl font-bold counter-up" style={{color:s.color}}>{s.value}</p>
                </div>))}
            </div>
            <div className="holo-card p-5"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Level {lvl} → {lvl<15?lvl+1:'MAX'}</span><span className="text-xs text-[#64748b]">{xp.toLocaleString()} / {xpN.toLocaleString()} XP</span></div><div className="holo-progress"><div className="holo-progress-bar" style={{width:`${Math.min(xpPct,100)}%`}}/></div><p className="text-xs text-[#64748b] mt-2">{LEVEL_TITLES[Math.min(lvl-1,LEVEL_TITLES.length-1)]} · {(xpN-xp).toLocaleString()} XP to next level</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="holo-card p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp size={16} className="neon-text"/>Course Progress</h3><div className="space-y-3">{DEMO_COURSES.filter(c=>c.enrolled).map(c=>(<div key={c.id}><div className="flex justify-between text-sm mb-1"><span>{c.title}</span><span className="text-[#00f0ff]">{c.progress}%</span></div><div className="holo-progress h-1.5"><div className="holo-progress-bar" style={{width:`${c.progress||0}%`}}/></div></div>))}</div></div>
              <div className="holo-card p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><Activity size={16} className="text-green-400"/>Recent Activity</h3><div className="space-y-2">{[{icon:CheckCircle2,text:'Completed Network Scanning module',time:'2h ago',color:'#39ff14'},{icon:Flag,text:'Solved SQL Injection 101 (+150 XP)',time:'5h ago',color:'#00f0ff'},{icon:Target,text:'Scored 80% on Cryptography Quiz',time:'1d ago',color:'#bf00ff'},{icon:Flame,text:'7-day streak bonus (+550 XP)',time:'1d ago',color:'#ff6b35'},{icon:GraduationCap,text:'Enrolled in Ethical Hacking',time:'3d ago',color:'#ffd700'}].map((a,i)=>(<div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[rgba(0,240,255,0.03)]"><a.icon size={14} className="mt-0.5" style={{color:a.color}}/><div><p className="text-sm">{a.text}</p><p className="text-xs text-[#475569]">{a.time}</p></div></div>))}</div></div>
            </div>
          </div>)}

          {/* ═══════ COURSES ═══════ */}
          {tab==='courses'&&(<div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl font-bold text-gradient-holo">Course Catalog</h1><div className="flex gap-2 flex-wrap">{NAV_CATS.map(c=>(<button key={c.id} className={`holo-badge ${cFilter===c.id?'holo-badge-cyan':'border-[rgba(100,116,139,0.3)] text-[#64748b]'}`} onClick={()=>setCFilter(c.id)}>{c.label}</button>))}</div></div>
            {!selCourse?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filCourses.map(c=>(
              <div key={c.id} className="holo-card holo-card-3d challenge-card p-5 cursor-pointer" onClick={()=>setSelCourse(c)} onMouseMove={onTilt} onMouseLeave={offTilt}>
                <div className="flex items-center justify-between mb-3"><span className={`holo-badge ctf-difficulty-${c.difficulty==='advanced'?'pink':c.difficulty==='intermediate'?'purple':'green'}`}>{c.difficulty}</span><span className="text-xs text-[#64748b]">{c.durationHours}h</span></div>
                <h3 className="font-semibold mb-2">{c.title}</h3><p className="text-sm text-[#64748b] mb-3 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between text-xs text-[#64748b]"><span><Users size={12} className="inline mr-1"/>{c.studentCount.toLocaleString()} students</span><span><BookOpen size={12} className="inline mr-1"/>{c.moduleCount} modules</span></div>
                {c.enrolled&&c.progress!==undefined&&<div className="mt-3"><div className="flex justify-between text-xs mb-1"><span className="text-[#00f0ff]">Enrolled</span><span>{c.progress}%</span></div><div className="holo-progress h-1.5"><div className="holo-progress-bar" style={{width:`${c.progress}%`}}/></div></div>}
              </div>))}</div>:(
              <div><button className="holo-btn holo-btn-sm mb-4" onClick={()=>setSelCourse(null)}><ChevronLeft size={14}/>Back</button>
              <div className="holo-card p-6"><h2 className="text-xl font-bold mb-2">{selCourse.title}</h2><p className="text-[#64748b] mb-4">{selCourse.description}</p>
              {selCourse.modules&&<div className="space-y-2">{selCourse.modules.map((m,i)=>(<div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(0,240,255,0.03)]">{m.completed?<CheckCircle2 size={18} className="text-green-400"/>:<div className="w-[18px] h-[18px] rounded-full border border-[rgba(100,116,139,0.3)]"/>}<span className={`text-sm ${m.completed?'text-[#64748b]':''}`}>{m.title}</span>{m.completed&&<span className="ml-auto holo-badge holo-badge-green text-xs">Done</span>}</div>))}</div>}
              <div className="mt-4 flex gap-3"><button className="holo-btn holo-btn-primary">Continue Learning</button>{selCourse.id!=='c1'&&DEMO_QUIZZES[selCourse.id]&&<button className="holo-btn" onClick={()=>{setTab('quizzes');startQuiz(selCourse.id);}}>Take Quiz</button>}</div></div></div>)}
          </div>)}

          {/* ═══════ AI PROFESSOR ═══════ */}
          {tab==='classroom'&&(<div className="space-y-4" style={{height:'calc(100vh - 140px)'}}>
            <div className="flex items-center gap-3 mb-2"><div className="holo-shield p-1.5 rounded-lg"><Brain className="w-5 h-5 neon-text-purple"/></div><h1 className="text-xl font-bold">AI Professor <span className="text-sm font-normal text-[#64748b]">· Prof. Shield</span></h1></div>
            <div className="holo-card flex-1 flex flex-col overflow-hidden" style={{minHeight:'400px'}}>
              <ScrollArea className="flex-1 p-4 space-y-4">{msgs.map(m=>(<div key={m.id} className={`chat-msg-enter flex gap-3 ${m.role==='user'?'flex-row-reverse':''}`}><Avatar className="w-8 h-8 shrink-0"><AvatarFallback className={`text-xs ${m.role==='assistant'?'bg-[rgba(191,0,255,0.15)] text-purple-400':'bg-[rgba(0,240,255,0.15)] text-cyan-400'}`}>{m.role==='assistant'?'AI':'ME'}</AvatarFallback></Avatar><div className={`max-w-[75%] ${m.role==='user'?'text-right':''}`}><div className={`inline-block p-3 rounded-2xl text-sm ${m.role==='user'?'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.15)]':'glass-panel border border-[rgba(191,0,255,0.08)]'}`}><p className="whitespace-pre-wrap">{m.content}</p></div></div></div>))}
              {typing&&<div className="flex gap-3"><Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-[rgba(191,0,255,0.15)] text-purple-400">AI</AvatarFallback></Avatar><div className="glass-panel p-3 rounded-2xl"><span className="typing-cursor text-sm text-[#64748b]">Thinking</span></div></div>}
              <div ref={chatEnd}/></ScrollArea>
              <div className="p-3 border-t border-[rgba(0,240,255,0.08)]"><div className="flex items-center gap-2"><div className="flex-1 relative"><input className="holo-input w-full pr-10" placeholder="Ask about cybersecurity..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}/><button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] hover:neon-text" onClick={()=>send()}><Send size={16}/></button></div>
                <button className={`p-2.5 rounded-xl transition-all ${recording?'bg-[rgba(255,0,110,0.2)] border border-pink-400/30':'border border-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.3)]'}`} onClick={toggleRec}>{recording?<div className="voice-waveform"><span/><span/><span/><span/><span/></div>:<Mic size={18} className={voice?'text-[#64748b]':'text-[#475569]'}/>}</button>
                {speaking&&<button className="p-2.5 rounded-xl border border-[rgba(0,240,255,0.3)]" onClick={stopSpeak}><Volume2 size={18} className="neon-text"/></button>}
                <button className={`p-2.5 rounded-xl border ${voice?'border-[rgba(0,240,255,0.3)] text-[#00f0ff]':'border-[rgba(100,116,139,0.2)] text-[#475569]'}`} onClick={()=>setVoice(!voice)}>{voice?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
              </div></div>
            </div>
          </div>)}

          {/* ═══════ QUIZZES ═══════ */}
          {tab==='quizzes'&&(<div className="space-y-6">
            <h1 className="text-2xl font-bold text-gradient-holo">Knowledge Quizzes</h1>
            {!qCourse?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(DEMO_QUIZZES).map(([cid,qs])=>{const co=DEMO_COURSES.find(c=>c.id===cid);if(!co)return null;return(<div key={cid} className="holo-card holo-card-3d p-5 cursor-pointer" onClick={()=>startQuiz(cid)} onMouseMove={onTilt} onMouseLeave={offTilt}><div className="flex items-center gap-2 mb-2"><BookOpen size={16} className="neon-text"/><span className="holo-badge holo-badge-cyan text-xs">{co.category}</span></div><h3 className="font-semibold mb-1">{co.title}</h3><p className="text-sm text-[#64748b] mb-3">{qs.length} questions · 5 min · 70% to pass</p><button className="holo-btn holo-btn-sm w-full">Start Quiz</button></div>);})}</div>:!qDone?(
              <div className="holo-card p-6 max-w-2xl mx-auto"><div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold">{DEMO_COURSES.find(c=>c.id===qCourse)?.title}</h2><div className={`flex items-center gap-2 ${qTime<60?'text-pink-400':''}`}><Clock size={16}/><span className="font-mono">{Math.floor(qTime/60)}:{String(qTime%60).padStart(2,'0')}</span></div></div><div className="holo-progress mb-6"><div className="holo-progress-bar" style={{width:`${((qIdx+1)/qQs.length)*100}%`}}/></div>
              <div className="mb-4"><p className="text-sm text-[#64748b] mb-1">Question {qIdx+1} of {qQs.length}</p><p className="font-medium">{qQs[qIdx].question}</p></div>
              <div className="space-y-2 mb-6">{qQs[qIdx].options.map((opt,i)=>(<button key={i} className={`w-full text-left p-3 rounded-xl border transition-all ${qAns[qQs[qIdx].id]===i?'border-[rgba(0,240,255,0.4)] bg-[rgba(0,240,255,0.08)]':'border-[rgba(30,41,59,0.5)] hover:border-[rgba(0,240,255,0.2)]'}`} onClick={()=>setQAns(p=>({...p,[qQs[qIdx].id]:i}))}><span className="text-sm">{opt}</span></button>))}</div>
              <div className="flex justify-between"><button className="holo-btn holo-btn-sm" disabled={qIdx===0} onClick={()=>setQIdx(p=>p-1)}>Previous</button>{qIdx<qQs.length-1?<button className="holo-btn holo-btn-sm holo-btn-primary" onClick={()=>setQIdx(p=>p+1)}>Next</button>:<button className="holo-btn holo-btn-primary" onClick={submitQuiz}>Submit</button>}</div></div>):(
              <div className="holo-card p-6 max-w-2xl mx-auto text-center"><div className="text-5xl mb-4">{qScore>=70?'🎉':'😐'}</div><h2 className="text-2xl font-bold mb-2">{qScore>=70?'Quiz Passed!':`Score: ${qScore}%`}</h2><p className="text-[#64748b] mb-6">You scored {qScore}% (need 70% to pass)</p>
              <div className="space-y-3 text-left mb-6">{qQs.map(q=>(<div key={q.id} className={`p-3 rounded-xl border ${qAns[q.id]===q.correctIndex?'border-green-400/30 bg-green-400/5':'border-pink-400/30 bg-pink-400/5'}`}><p className="text-sm font-medium">{q.question}</p><p className="text-xs text-[#64748b] mt-1">{q.explanation}</p></div>))}</div>
              <button className="holo-btn" onClick={()=>{setQCourse(null);setTab('dashboard');}}>Back to Dashboard</button></div>)}
          </div>)}

          {/* ═══════ LAB TERMINAL ═══════ */}
          {tab==='labs'&&(<div className="space-y-4" style={{height:'calc(100vh - 140px)'}}>
            <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-xl font-bold text-gradient-cyan">Lab Terminal</h1>{!labList&&<button className="holo-btn holo-btn-sm" onClick={()=>{setLabList(true);setSelLab(null);setLabOn(false);}}><ChevronLeft size={14}/>All Labs</button>}</div>
            {labList?(
              <ScrollArea className="h-[calc(100vh-220px)]"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{DEMO_LABS.map(lab=>(
                <div key={lab.id} className="holo-card holo-card-3d challenge-card p-5 cursor-pointer" onClick={()=>startLab(lab)} onMouseMove={onTilt} onMouseLeave={offTilt}>
                  <div className="flex items-center justify-between mb-3"><span className={`holo-badge ctf-difficulty-${lab.difficulty}`}>{lab.difficulty}</span><span className="text-xs text-[#64748b]"><Clock size={12} className="inline mr-1"/>{lab.duration}</span></div>
                  <h3 className="font-semibold mb-2">{lab.title}</h3><p className="text-sm text-[#64748b] mb-3 line-clamp-2">{lab.description}</p>
                  <div className="text-xs text-[#64748b]"><Target size={12} className="inline mr-1"/>{lab.objectives.length} objectives</div>
                </div>))}</div></ScrollArea>):(
              <div className="flex gap-4 h-[calc(100vh-220px)]">
                <div className="w-72 shrink-0 holo-card p-4 overflow-y-auto hidden lg:block">
                  {selLab&&<><h3 className="font-semibold mb-3 neon-text">{selLab.title}</h3>
                  <div className="flex gap-2 mb-4"><span className={`holo-badge ctf-difficulty-${selLab.difficulty}`}>{selLab.difficulty}</span><span className="holo-badge holo-badge-cyan">{selLab.duration}</span></div>
                  <div className="space-y-3 mb-4">{selLab.steps.map((s,i)=>(<div key={i} className={`lab-step ${i<objDone?'lab-step-completed':i===objDone?'lab-step-active':''}`}><p className="text-xs">{s}</p></div>))}</div>
                  <div className="glow-separator my-4"/><h4 className="text-sm font-semibold mb-2">Objectives ({objDone}/{labObj.length})</h4>
                  <div className="space-y-2">{labObj.map(o=>(<div key={o.id} className={`flex items-start gap-2 text-xs ${o.completed?'text-green-400':''}`}><span>{o.completed?<CheckCircle2 size={14}/>:<div className="w-3.5 h-3.5 rounded-full border border-[rgba(100,116,139,0.3)] mt-0.5"/>}</span><span>{o.description}</span></div>))}</div>
                  {selLab.hints.length>0&&<><div className="glow-separator my-4"/><h4 className="text-sm font-semibold mb-2">Hints</h4><div className="space-y-1">{selLab.hints.map((h,i)=>(<p key={i} className="text-xs text-[#64748b]"><Lightbulb size={10} className="inline mr-1"/>{h}</p>))}</div></>}
                </>}
              </div>
              <div className="flex-1 holo-terminal matrix-bg flex flex-col">
                <div className="holo-terminal-header"><div className="holo-terminal-dot" style={{background:'#ff5f57'}}/><div className="holo-terminal-dot" style={{background:'#febc2e'}}/><div className="holo-terminal-dot" style={{background:'#28c840'}}/><span className="ml-3 text-xs text-[#64748b]">{selLab?selLab.title:'CyberShield Lab'}</span></div>
                <div className="holo-terminal-body flex-1 overflow-y-auto" ref={labEnd as React.RefObject<HTMLDivElement>}>{labOut.map((line,i)=><div key={i} className="whitespace-pre-wrap text-[13px] leading-relaxed" dangerouslySetInnerHTML={{__html:line.replace(/\x1b\[([0-9;]*)m/g,'<span class="ansi-$1">').replace(/<span class="ansi-">/g,'<span>').replace(/<span class="ansi-1;32m">/g,'<span style="color:#39ff14">').replace(/<span class="ansi-1;34m">/g,'<span style="color:#60a5fa">').replace(/<span class="ansi-1;33m">/g,'<span style="color:#fbbf24">').replace(/<span class="ansi-1;36m">/g,'<span style="color:#00f0ff">').replace(/<span class="ansi-2m">/g,'<span style="opacity:0.5">').replace(/<span class="ansi-0m">/g,'</span>')}}/>)}</div>
                <div className="p-3 border-t border-[rgba(0,240,255,0.08)] flex items-center gap-2">
                  <span className="text-xs text-green-400 shrink-0">student@cybershield:~$</span>
                  <input className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-[#e2e8f0] placeholder:text-[#475569]" placeholder={labOn?"Enter command...":"Select a lab first"} value={labIn} onChange={e=>setLabIn(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')labCmd(labIn);}} disabled={!labOn}/>
                </div>
              </div>
            </div>)}
          </div>)}

          {/* ═══════ CTF ARENA ═══════ */}
          {tab==='ctf'&&(<div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl font-bold text-gradient-holo">CTF Arena</h1>
              <div className="flex items-center gap-4 text-sm"><span className="text-[#64748b]">Points: <span className="neon-text font-bold">{solvedPts}/{totalPts}</span></span><span className="text-[#64748b]">Solved: <span className="text-green-400 font-bold">{ctfs.filter(c=>c.solved).length}/{ctfs.length}</span></span></div></div>
            <div className="flex gap-2 flex-wrap">{CTF_CATS.map(c=>(<button key={c.id} className={`holo-badge ${ctfCat===c.id?'holo-badge-cyan':'border-[rgba(100,116,139,0.3)] text-[#64748b]'}`} onClick={()=>setCtfCat(c.id)}>{c.label}</button>))}<select className="holo-input py-1 px-2 text-xs rounded-lg" value={ctfDiff} onChange={e=>setCtfDiff(e.target.value)}>{CTF_DIFFS.map(d=>(<option key={d.id} value={d.id}>{d.label}</option>))}</select></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filCtf.map(c=>{const CI=CAT_ICONS[c.category]||Hexagon;return(
              <div key={c.id} className={`holo-card holo-card-3d challenge-card p-5 cursor-pointer ${c.solved?'opacity-60':''}`} onClick={()=>{setSelCtf(c);setCtfHint(false);setCtfFlag('');}} onMouseMove={onTilt} onMouseLeave={offTilt}>
                <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><CI size={16} className={CAT_CLS[c.category]||''}/><span className={`text-xs ${CAT_CLS[c.category]||''}`}>{c.category}</span></div><span className={`holo-badge ctf-difficulty-${c.difficulty}`}>{c.difficulty}</span></div>
                <h3 className="font-semibold mb-2">{c.title}</h3><p className="text-sm text-[#64748b] mb-3 line-clamp-2">{c.description.split('\n')[0]}</p>
                <div className="flex items-center justify-between"><span className={`text-sm font-bold ${c.solved?'text-green-400':'neon-text'}`}>{c.points} pts</span><span className="text-xs text-[#64748b]"><Users size={12} className="inline mr-1"/>{c.solveCount} solves</span></div>
                {c.solved&&<div className="mt-2"><span className="holo-badge holo-badge-green text-xs"><CheckCircle2 size={12} className="inline mr-1"/>Solved</span></div>}
              </div>)})}</div>
            <Dialog open={!!selCtf} onOpenChange={()=>setSelCtf(null)}>
              {selCtf&&<DialogContent className="max-w-lg glass-panel border-[rgba(0,240,255,0.1)]"><DialogHeader><DialogTitle className="flex items-center gap-2">{selCtf.title}{selCtf.solved&&<CheckCircle2 size={18} className="text-green-400"/>}</DialogTitle><DialogDescription><div className="flex gap-2 mt-2"><span className={`holo-badge ctf-difficulty-${selCtf.difficulty}`}>{selCtf.difficulty}</span><span className="holo-badge holo-badge-cyan">{selCtf.points} pts</span><span className="holo-badge holo-badge-purple">{selCtf.solveCount} solves</span></div></DialogDescription></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="text-sm text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">{selCtf.description}</div>
                  {selCtf.hint&&!selCtf.solved&&<div><button className="holo-btn holo-btn-sm text-xs" onClick={()=>setCtfHint(!ctfHint)}>{ctfHint?<EyeOff size={14} className="inline mr-1"/>Hide Hint:<Lightbulb size={14} className="inline mr-1"/>Show Hint}</button>{ctfHint&&<p className="text-sm mt-2 p-3 rounded-xl bg-[rgba(255,107,53,0.08)] border border-[rgba(255,107,53,0.2)] text-orange-300"><Lightbulb size={14} className="inline mr-1"/>{selCtf.hint}</p>}</div></div>}
                  {selCtf.solved?<div className="text-center py-4"><CheckCircle2 size={40} className="text-green-400 mx-auto mb-2"/><p className="text-green-400 font-semibold">Challenge Solved!</p><p className="text-sm text-[#64748b]">+{selCtf.points} XP earned</p></div>:<div><label className="text-sm text-[#64748b] mb-1 block">Submit Flag</label><div className="flex gap-2"><input className="holo-input flex-1 font-mono text-sm" placeholder="CYBERSHIELD{...}" value={ctfFlag} onChange={e=>setCtfFlag(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')submitFlag(selCtf.id);}}/><button className="holo-btn holo-btn-primary" onClick={()=>submitFlag(selCtf.id)}><Flag size={16} className="inline mr-1"/>Submit</button></div></div>}
                  {ctfRes&&<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`p-3 rounded-xl text-sm font-medium text-center ${ctfRes.ok?'bg-green-400/10 border border-green-400/30 text-green-400':'bg-pink-400/10 border border-pink-400/30 text-pink-400'}`}>{ctfRes.msg}</motion.div>}
                </div></DialogContent>}
            </Dialog>
          </div>)}

          {/* ═══════ RANK & BADGES ═══════ */}
          {tab==='gamification'&&(<div className="space-y-6">
            <h1 className="text-2xl font-bold text-gradient-holo">Rank & Badges</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="holo-card p-6"><div className="flex items-center gap-4 mb-6"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(0,240,255,0.15)] to-[rgba(191,0,255,0.15)] flex items-center justify-center"><Shield className="w-8 h-8 neon-text"/></div><div><h2 className="text-xl font-bold">{user.name}</h2><p className="text-sm neon-text">{LEVEL_TITLES[Math.min(lvl-1,LEVEL_TITLES.length-1)]}</p><p className="text-xs text-[#64748b]">Level {lvl}</p></div></div>
              <div className="holo-progress mb-2"><div className="holo-progress-bar" style={{width:`${Math.min(xpPct,100)}%`}}/></div>
              <div className="flex justify-between text-sm"><span className="text-[#64748b]">{xp.toLocaleString()} XP</span><span className="text-[#64748b]">{(xpN-xp).toLocaleString()} XP to next</span></div>
              <div className="grid grid-cols-3 gap-4 mt-6">{{label:'CTF Solves',value:String(ctfs.filter(c=>c.solved).length),icon:Flag},{label:'Badges',value:String(DEMO_BADGES.filter(b=>b.earned).length),icon:Award},{label:'Streak',value:`${user.streakDays}d`,icon:Flame}}.map((s,i)=>(<div key={i} className="text-center"><s.icon size={18} className="mx-auto mb-1 text-[#64748b]"/><p className="text-lg font-bold">{s.value}</p><p className="text-xs text-[#475569]">{s.label}</p></div>))}</div></div>
              <div className="holo-card p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Award size={18} className="neon-text-purple"/>Badges ({DEMO_BADGES.filter(b=>b.earned).length}/{DEMO_BADGES.length})</h3>
              <div className="grid grid-cols-2 gap-3">{DEMO_BADGES.map(b=>(<div key={b.name} className={`flex items-center gap-3 p-3 rounded-xl border ${b.earned?'border-[rgba(0,240,255,0.1)] bg-[rgba(0,240,255,0.02)]':'border-[rgba(30,41,59,0.3)] opacity-50'}`}><div className={`hex-badge hex-badge-${b.rarity}`}>{b.icon}</div><div><p className="text-sm font-medium">{b.name}</p><p className="text-xs text-[#64748b]">{b.description}</p><p className={`text-xs mt-0.5 ${b.rarity==='legendary'?'text-orange-400':b.rarity==='epic'?'text-purple-400':b.rarity==='rare'?'text-cyan-400':'text-green-400'}`}>{b.rarity} · +{b.xpReward} XP</p></div></div>))}</div></div>
            </div>
            <div className="holo-card p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy size={18} className="text-yellow-400"/>Global Leaderboard</h3>
              <div className="space-y-1">{DEMO_LEADERBOARD.map(e=>(<div key={e.id} className={`leaderboard-row flex items-center gap-4 p-3 rounded-xl ${e.id==='l8'?'bg-[rgba(0,240,255,0.05)]':''}`}><span className={`w-8 text-center font-bold text-sm ${e.rank<=3?`rank-${e.rank}`:'text-[#64748b]'}`}>{e.rank}</span><Avatar className="w-8 h-8"><AvatarFallback className={`text-xs ${e.rank===1?'bg-yellow-400/20 text-yellow-400':e.rank===2?'bg-gray-400/20 text-gray-300':e.rank===3?'bg-orange-400/20 text-orange-400':'bg-[rgba(0,240,255,0.1)] text-[#00f0ff]}`}>{e.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{e.name}</p><p className="text-xs text-[#64748b]">{e.title} · Lvl {e.level}</p></div><div className="text-right"><p className="text-sm font-bold neon-text">{e.xp.toLocaleString()}</p><p className="text-xs text-[#64748b]"><Flag size={10} className="inline mr-0.5"/>{e.ctfSolves} · <Award size={10} className="inline mr-0.5"/>{e.badges}</p></div></div>))}</div></div>
          </div>)}

          {/* ═══════ ANALYTICS ═══════ */}
          {tab==='analytics'&&(<div className="space-y-6">
            <h1 className="text-2xl font-bold text-gradient-holo">Learning Analytics</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[{label:'Focus Score',value:focus+'%',bar:focus,color:'#00f0ff'},{label:'Quiz Accuracy',value:'82%',bar:82,color:'#39ff14'},{label:'Lab Completion',value:'68%',bar:68,color:'#bf00ff'},{label:'Comprehension',value:'78%',bar:78,color:'#ff6b35'}].map((s,i)=>(
                <div key={i} className="stat-card-3d p-4" style={{'--stat-color':s.color} as React.CSSProperties} onMouseMove={onTilt} onMouseLeave={offTilt}>
                  <p className="text-xs text-[#64748b] mb-1">{s.label}</p><p className="text-2xl font-bold" style={{color:s.color}}>{s.value}</p><div className="holo-progress h-1.5 mt-2"><div className="holo-progress-bar" style={{width:`${s.bar}%`,background:`linear-gradient(90deg,${s.color}, ${s.color}88)`}}/></div>
                </div>))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="holo-card p-5"><h3 className="font-semibold mb-4">Weekly Activity</h3><div className="space-y-3">{{[{d:'Mon',v:85},{d:'Tue',v:92},{d:'Wed',v:60},{d:'Thu',v:78},{d:'Fri',v:95},{d:'Sat',v:45},{d:'Sun',v:30}].map(d=>(<div key={d.d} className="flex items-center gap-3"><span className="text-xs text-[#64748b] w-8">{d.d}</span><div className="flex-1 holo-progress h-2"><div className="holo-progress-bar" style={{width:`${d.v}%`,background:d.v>80?'linear-gradient(90deg,#39ff14,#00f0ff)':d.v>50?'linear-gradient(90deg,#00f0ff,#bf00ff)':'linear-gradient(90deg,#ff006e,#ff6b35)'}}/></div><span className="text-xs text-[#64748b] w-8 text-right">{d.v}%</span></div>))}</div></div>
              <div className="holo-card p-5"><h3 className="font-semibold mb-4">Skill Breakdown</h3><div className="space-y-3">{{[{s:'Network Security',v:85},{s:'Cryptography',v:70},{s:'Web Security',v:60},{s:'Forensics',v:40},{s:'Cloud Security',v:25},{s:'Malware Analysis',v:20}].map(s=>(<div key={s.s}><div className="flex justify-between text-sm mb-1"><span>{s.s}</span><span className={s.v>70?'text-green-400':s.v>40?'text-cyan-400':'text-orange-400'}>{s.v}%</span></div><div className="holo-progress h-2"><div className="holo-progress-bar" style={{width:`${s.v}%`}}/></div></div>))}</div></div>
            </div>
            <div className="holo-card p-5"><h3 className="font-semibold mb-4">Performance Insights</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="p-4 rounded-xl border border-green-400/20 bg-green-400/5"><p className="text-xs text-green-400 font-semibold mb-1">Strengths</p><p className="text-sm text-[#cbd5e1]">Network scanning, TCP/IP protocols, cryptography basics, firewall configuration</p></div><div className="p-4 rounded-xl border border-orange-400/20 bg-orange-400/5"><p className="text-xs text-orange-400 font-semibold mb-1">Needs Improvement</p><p className="text-sm text-[#cbd5e1]">Cloud security architecture, advanced forensics, mobile application testing</p></div><div className="p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5"><p className="text-xs neon-text font-semibold mb-1">Recommendations</p><p className="text-sm text-[#cbd5e1]">Focus on cloud security modules and complete the advanced forensics lab.</p></div></div></div>
          </div>)}

          {/* ═══════ CERTIFICATES ═══════ */}
          {tab==='certificates'&&(<div className="space-y-6">
            <h1 className="text-2xl font-bold text-gradient-holo">Certificates</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DEMO_COURSES.filter(c=>c.enrolled&&c.progress&&c.progress>=90).length>0?DEMO_COURSES.filter(c=>c.enrolled&&c.progress&&c.progress>=90).map(c=>(
                <div key={c.id} className="certificate-card p-6"><div className="relative z-10"><div className="flex items-center justify-between mb-4"><div className="holo-shield p-2 rounded-xl"><GraduationCap className="w-6 h-6 neon-text"/></div><span className="holo-badge holo-badge-green">Verified</span></div><h3 className="text-lg font-bold mb-1">{c.title}</h3><div className="space-y-2 text-sm text-[#64748b]"><p>Awarded to: <span className="text-[#e2e8f0]">{user.name}</span></p><p>Date: <span className="text-[#e2e8f0]">July 22, 2026</span></p><p>Cert ID: <span className="neon-text font-mono text-xs">CYB-{user.id.slice(0,8).toUpperCase()}</span></p></div><div className="mt-4 flex gap-2"><button className="holo-btn holo-btn-sm holo-btn-primary"><Download size={14} className="inline mr-1"/>Download PDF</button><button className="holo-btn holo-btn-sm"><Copy size={14} className="inline mr-1"/>Copy Link</button></div></div></div>)):(
              <div className="holo-card p-12 col-span-2 text-center"><Award size={48} className="mx-auto text-[#475569] mb-4"/><h3 className="text-lg font-semibold text-[#64748b]">No Certificates Yet</h3><p className="text-sm text-[#475569] mt-2">Complete a course with 90%+ progress to earn a certificate.</p></div>)}
              {DEMO_COURSES.filter(c=>c.enrolled&&c.progress&&c.progress<90).map(c=>(<div key={c.id} className="certificate-card p-6 opacity-70"><div className="relative z-10"><div className="flex items-center gap-2 mb-4"><GraduationCap size={20} className="text-[#475569]"/><h3 className="text-lg font-semibold text-[#64748b]">{c.title}</h3></div><div className="holo-progress h-2 mb-3"><div className="holo-progress-bar" style={{width:`${c.progress||0}%`}}/></div><p className="text-sm text-[#475569]">{c.progress}% complete — {(100-(c.progress||0))}% more to unlock</p></div></div></div>)}
            </div>
          </div>)}

        </motion.div></AnimatePresence>
      </main>
  </div>
  );
}