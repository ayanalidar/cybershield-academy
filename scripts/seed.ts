import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CyberShield Academy...');

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

  // ── Users ──
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const alex = await db.user.create({
    data: {
      email: 'alex@cybershield.academy',
      name: 'Alex Chen',
      passwordHash,
      role: 'student',
      xp: 1450,
      level: 6,
      streakDays: 7,
      bio: 'Aspiring cybersecurity professional',
    },
  });

  const sarah = await db.user.create({
    data: {
      email: 'sarah@cybershield.academy',
      name: 'Sarah Kim',
      passwordHash,
      role: 'student',
      xp: 8750,
      level: 11,
      streakDays: 15,
    },
  });

  const james = await db.user.create({
    data: {
      email: 'james@cybershield.academy',
      name: 'James Rodriguez',
      passwordHash,
      role: 'student',
      xp: 7200,
      level: 10,
      streakDays: 12,
    },
  });

  const admin = await db.user.create({
    data: {
      email: 'admin@cybershield.academy',
      name: 'Admin',
      passwordHash,
      role: 'admin',
      xp: 99999,
      level: 15,
    },
  });

  // ── Courses ──
  const course1 = await db.course.create({
    data: {
      id: 'c1',
      title: 'Network Security Fundamentals',
      description: 'Master TCP/IP, firewalls, IDS/IPS, and network scanning with hands-on labs.',
      category: 'networking',
      difficulty: 'intermediate',
      durationHours: 24,
      rating: 4.8,
      studentCount: 1247,
    },
  });

  const course2 = await db.course.create({
    data: {
      id: 'c2',
      title: 'Web Application Security',
      description: 'Deep dive into OWASP Top 10, XSS, SQLi, CSRF, and modern web exploits.',
      category: 'web',
      difficulty: 'advanced',
      durationHours: 18,
      rating: 4.9,
      studentCount: 834,
    },
  });

  const course3 = await db.course.create({
    data: {
      id: 'c3',
      title: 'Ethical Hacking & Penetration Testing',
      description: 'Learn reconnaissance, exploitation, post-exploitation, and report writing.',
      category: 'pentesting',
      difficulty: 'advanced',
      durationHours: 40,
      rating: 4.7,
      studentCount: 2103,
    },
  });

  // ── Modules for course1 ──
  const moduleData = [
    { title: 'Network Fundamentals', orderIndex: 0, content: '# Network Fundamentals\n\n## OSI Model\nThe OSI (Open Systems Interconnection) model is a conceptual framework...' },
    { title: 'TCP/IP Deep Dive', orderIndex: 1, content: '# TCP/IP Protocol Suite\n\n## TCP Three-Way Handshake\n1. SYN\n2. SYN-ACK\n3. ACK...' },
    { title: 'Network Scanning', orderIndex: 2, content: '# Network Scanning\n\n## Nmap\nNmap is the most popular network scanner...' },
    { title: 'Cryptography Basics', orderIndex: 3, content: '# Cryptography\n\n## Symmetric vs Asymmetric\n...' },
    { title: 'Firewall Configuration', orderIndex: 4, content: '# Firewall Configuration\n\n## iptables\n...' },
    { title: 'Web App Security', orderIndex: 5, content: '# Web Application Security\n...' },
    { title: 'Incident Response', orderIndex: 6, content: '# Incident Response\n...' },
    { title: 'Capstone Challenge', orderIndex: 7, content: '# Capstone\n...' },
  ];

  const modules = [];
  for (const m of moduleData) {
    const mod = await db.module.create({
      data: {
        courseId: course1.id,
        title: m.title,
        content: m.content,
        orderIndex: m.orderIndex,
        durationMinutes: 30,
        isPublished: true,
      },
    });
    modules.push(mod);
  }

  // ── Quiz for course1 ──
  const quiz = await db.quiz.create({
    data: {
      moduleId: modules[3].id,
      title: 'Cryptography Fundamentals Quiz',
      timeLimitSec: 300,
      passingScore: 0.7,
    },
  });

  const quizQs = [
    { questionText: 'What layer of the OSI model does a firewall primarily operate at?', options: JSON.stringify(['Layer 2', 'Layer 3 (Network)', 'Layer 4', 'Layer 7']), correctAnswer: '1', explanation: 'Firewalls primarily operate at Layer 3.' },
    { questionText: 'Which tool is used for network scanning?', options: JSON.stringify(['Wireshark', 'Nmap', 'Metasploit', 'Burp Suite']), correctAnswer: '1', explanation: 'Nmap is the standard network scanning tool.' },
    { questionText: 'What does IDS stand for?', options: JSON.stringify(['Intrusion Detection System', 'Internal Data Security', 'Integrated Defense Shield', 'Intelligent Scanner']), correctAnswer: '0', explanation: 'IDS = Intrusion Detection System.' },
    { questionText: 'Which protocol provides reliable connection-oriented communication?', options: JSON.stringify(['UDP', 'ICMP', 'TCP', 'ARP']), correctAnswer: '2', explanation: 'TCP provides reliable, connection-oriented communication.' },
    { questionText: 'What is a DMZ?', options: JSON.stringify(['Encrypt traffic', 'Wireless access', 'Isolate public services', 'Block all traffic']), correctAnswer: '2', explanation: 'A DMZ isolates public-facing services.' },
  ];

  for (const q of quizQs) {
    await db.quizQuestion.create({
      data: { quizId: quiz.id, ...q, orderIndex: quizQs.indexOf(q) },
    });
  }

  // ── Enrollments ──
  await db.enrollment.create({
    data: {
      userId: alex.id,
      courseId: course1.id,
      status: 'active',
      overallProgress: 0.5,
      currentModuleId: modules[4].id,
    },
  });

  await db.enrollment.create({
    data: {
      userId: alex.id,
      courseId: course3.id,
      status: 'active',
      overallProgress: 0.2,
      currentModuleId: course3.id,
    },
  });

  // ── Badges ──
  const badgesData = [
    { name: 'First Blood', description: 'Complete your first challenge', icon: '🎯', category: 'achievement', rarity: 'common', xpReward: 50 },
    { name: 'Quiz Master', description: 'Score 100% on a quiz', icon: '🧠', category: 'achievement', rarity: 'rare', xpReward: 100 },
    { name: 'Lab Explorer', description: 'Complete a lab session', icon: '🔬', category: 'achievement', rarity: 'common', xpReward: 75 },
    { name: 'Focus Champion', description: 'Maintain 90%+ focus', icon: '👁️', category: 'focus', rarity: 'rare', xpReward: 150 },
    { name: 'CTF Winner', description: 'Capture 5 flags', icon: '🚩', category: 'ctf', rarity: 'epic', xpReward: 200 },
    { name: 'Cipher Master', description: 'Solve 10 crypto challenges', icon: '🔐', category: 'ctf', rarity: 'legendary', xpReward: 500 },
    { name: 'Night Owl', description: 'Study past midnight', icon: '🦉', category: 'streak', rarity: 'common', xpReward: 25 },
    { name: 'Eagle Eye', description: 'Accumulate 2000+ XP', icon: '🦅', category: 'xp', rarity: 'epic', xpReward: 300 },
  ];

  for (const b of badgesData) {
    const badge = await db.badge.create({ data: b });
    if (['First Blood', 'Quiz Master', 'Lab Explorer'].includes(b.name)) {
      await db.userBadge.create({ data: { userId: alex.id, badgeId: badge.id } });
    }
  }

  // ── CTF Challenges ──
  const ctfData = [
    { title: 'Flag Hunter', description: 'Find the hidden flag. Look at the challenge name.', category: 'crypto', difficulty: 'easy', points: 50, flag: 'CYBERSHIELD{h1dd3n_1n_pl41n_s1ght}' },
    { title: "Caesar's Secret", description: 'Decrypt the ROT13 cipher: PloreNerar{e0g3_f1a3_g0_c3a3e}', category: 'crypto', difficulty: 'easy', points: 75, flag: 'CYBERSHIELD{r0t3_s1mpl3_c3s4r}' },
    { title: 'SQL Injection 101', description: 'Exploit a vulnerable login form. Flag in flags table.', category: 'web', difficulty: 'medium', points: 150, flag: 'CYBERSHIELD{sqli_m4st3r_2024}' },
    { title: 'Hash Cracker', description: 'SHA-256: 5e884898da28047... Common password.', category: 'crypto', difficulty: 'medium', points: 200, flag: 'CYBERSHIELD{p4ssw0rd_cr4ck3d}' },
    { title: 'Buffer Overflow', description: 'Exploit gets() in vulnerable C program to call win().', category: 'pwn', difficulty: 'hard', points: 300, flag: 'CYBERSHIELD{buff3r_0v3rfl0w_m4st3r}' },
    { title: 'Forensic Artifact', description: 'Recover deleted file from MFT entry.', category: 'forensics', difficulty: 'hard', points: 350, flag: 'CYBERSHIELD{d1g_d33p_1nt0_th3_b1ts}' },
  ];

  for (const c of ctfData) {
    await db.ctfChallenge.create({ data: c });
  }

  // ── XP Log ──
  await db.xpLog.createMany({
    data: [
      { userId: alex.id, amount: 100, source: 'enrollment', description: 'Enrolled in Network Security' },
      { userId: alex.id, amount: 200, source: 'quiz', description: 'Scored 80% on Cryptography Quiz' },
      { userId: alex.id, amount: 150, source: 'lab', description: 'Completed Firewall Lab' },
      { userId: alex.id, amount: 50, source: 'badge', description: 'First Blood badge' },
      { userId: alex.id, amount: 100, source: 'badge', description: 'Quiz Master badge' },
      { userId: alex.id, amount: 300, source: 'ctf', description: 'Solved SQL Injection 101' },
      { userId: alex.id, amount: 550, source: 'streak', description: '7-day streak bonus' },
    ],
  });

  // ── Notifications ──
  await db.notification.createMany({
    data: [
      { userId: alex.id, title: 'New CTF Challenge', message: 'Buffer Overflow is now live!', type: 'info' },
      { userId: alex.id, title: 'Quiz Score', message: 'You scored 90% on Network Fundamentals!', type: 'success' },
      { userId: alex.id, title: 'Badge Earned', message: 'You earned the Quiz Master badge!', type: 'achievement' },
      { userId: alex.id, title: 'Streak Bonus', message: '7-day streak! +550 XP bonus earned!', type: 'xp' },
    ],
  });

  // ── Performance Metrics ──
  await db.performanceMetrics.create({
    data: {
      userId: alex.id,
      courseId: course1.id,
      quizAccuracy: 0.82,
      comprehensionScore: 0.78,
      averageFocusScore: 0.87,
      labCompletionRate: 0.68,
      interactionCount: 142,
      timeSpentMinutes: 420,
      strengths: 'Network scanning, TCP/IP, cryptography basics',
      weaknesses: 'Cloud security, advanced forensics',
      recommendations: 'Focus on cloud security modules and complete the advanced forensics lab.',
    },
  });

  console.log('✅ Seed complete! Demo credentials: alex@cybershield.academy / demo1234');
  console.log(`   User ID: ${alex.id}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());