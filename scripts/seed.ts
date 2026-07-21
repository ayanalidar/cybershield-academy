import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function seed() {
  // --- Hash passwords ---
  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Users ---
  const admin = await db.user.upsert({
    where: { email: 'alex@cybershield.academy' },
    update: { passwordHash },
    create: {
      email: 'alex@cybershield.academy',
      name: 'Alex Chen',
      role: 'admin',
      passwordHash,
      bio: 'Platform administrator and cybersecurity expert.',
    },
  });
  console.log('Admin user:', admin.id, admin.email);

  const instructor = await db.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Sarah Mitchell',
      role: 'instructor',
      passwordHash,
      bio: 'Senior penetration tester and course instructor.',
    },
  });
  console.log('Instructor user:', instructor.id, instructor.email);

  // --- Courses ---
  const course1 = await db.course.upsert({
    where: { id: 'demo-course' },
    update: {
      durationHours: 24,
      rating: 4.7,
      studentCount: 128,
    },
    create: {
      id: 'demo-course',
      title: 'Network Security Fundamentals',
      description:
        'Comprehensive network security training covering the OSI model, TCP/IP, scanning, cryptography, firewalls, web app security, and incident response.',
      category: 'cybersecurity',
      difficulty: 'intermediate',
      durationHours: 24,
      rating: 4.7,
      studentCount: 128,
      isPublished: true,
    },
  });
  console.log('Course 1:', course1.id, course1.title);

  const course2 = await db.course.upsert({
    where: { id: 'course-webapp-sec' },
    update: {},
    create: {
      id: 'course-webapp-sec',
      title: 'Web Application Security',
      description:
        'Master the OWASP Top 10 vulnerabilities. Learn to identify, exploit, and remediate SQL injection, XSS, CSRF, SSRF, and modern web application threats.',
      category: 'web-security',
      difficulty: 'advanced',
      durationHours: 32,
      rating: 4.9,
      studentCount: 85,
      isPublished: true,
    },
  });
  console.log('Course 2:', course2.id, course2.title);

  const course3 = await db.course.upsert({
    where: { id: 'course-cloud-sec' },
    update: {},
    create: {
      id: 'course-cloud-sec',
      title: 'Cloud Security Fundamentals',
      description:
        'Learn to secure cloud infrastructure across AWS, Azure, and GCP. Covers IAM, network security, data protection, compliance, and cloud-native threat detection.',
      category: 'cloud-security',
      difficulty: 'beginner',
      durationHours: 18,
      rating: 4.5,
      studentCount: 210,
      isPublished: true,
    },
  });
  console.log('Course 3:', course3.id, course3.title);

  // --- Modules for Course 1 (Network Security Fundamentals) ---
  const c1Modules = [
    {
      id: 'demo-course-0',
      title: 'Network Fundamentals',
      content:
        'Network fundamentals cover the OSI model and TCP/IP protocol suite. Understanding IP addressing, subnetting, routing, and switching is critical for any cybersecurity professional. The OSI model provides a conceptual framework for understanding how data flows across networks.',
      orderIndex: 0,
      isPublished: true,
      durationMinutes: 45,
    },
    {
      id: 'demo-course-1',
      title: 'TCP/IP Deep Dive',
      content:
        'The TCP/IP protocol stack is the backbone of modern networking. This module covers the four layers in detail. We examine the TCP three-way handshake (SYN, SYN-ACK, ACK), sequence numbers, windowing, and flow control mechanisms that ensure reliable data delivery.',
      orderIndex: 1,
      isPublished: true,
      durationMinutes: 50,
    },
    {
      id: 'demo-course-2',
      title: 'Network Scanning',
      content:
        'Network scanning is a critical reconnaissance technique in penetration testing. Tools like Nmap, Masscan, and Zmap allow security professionals to discover hosts, open ports, running services, and operating system fingerprints on target networks.',
      orderIndex: 2,
      isPublished: true,
      durationMinutes: 40,
    },
    {
      id: 'demo-course-3',
      title: 'Cryptography Basics',
      content:
        'Cryptography provides the mathematical foundations for information security. This module covers symmetric encryption (AES, ChaCha20), asymmetric encryption (RSA, ECC), hash functions (SHA-256, bcrypt), digital signatures, and PKI infrastructure.',
      orderIndex: 3,
      isPublished: true,
      durationMinutes: 55,
    },
    {
      id: 'demo-course-4',
      title: 'Firewall Configuration',
      content:
        'Firewalls are the first line of network defense. This module covers iptables, nftables, and cloud-native firewall rules. Students learn to write effective rules for ingress and egress filtering, stateful packet inspection, and NAT configuration.',
      orderIndex: 4,
      isPublished: true,
      durationMinutes: 35,
    },
    {
      id: 'demo-course-5',
      title: 'Web Application Security',
      content:
        'Web application security focuses on the OWASP Top 10 vulnerabilities including SQL injection, cross-site scripting (XSS), cross-site request forgery (CSRF), and server-side request forgery (SSRF).',
      orderIndex: 5,
      isPublished: true,
      durationMinutes: 45,
    },
    {
      id: 'demo-course-6',
      title: 'Incident Response',
      content:
        'Incident response follows the NIST framework covering preparation, detection and analysis, containment, eradication, recovery, and post-incident activity. This module covers SIEM tools, alert triage, and playbook automation.',
      orderIndex: 6,
      isPublished: true,
      durationMinutes: 40,
    },
    {
      id: 'demo-course-7',
      title: 'Capstone Challenge',
      content:
        'The capstone challenge combines all learned skills in a simulated enterprise environment. Students perform a full security assessment including reconnaissance, vulnerability scanning, exploitation, and reporting.',
      orderIndex: 7,
      isPublished: true,
      durationMinutes: 60,
    },
  ];

  for (const m of c1Modules) {
    await db.module.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        courseId: course1.id,
        title: m.title,
        content: m.content,
        isPublished: m.isPublished,
        orderIndex: m.orderIndex,
        durationMinutes: m.durationMinutes,
      },
    });
  }
  console.log('Course 1 modules created');

  // --- Quizzes for Course 1 ---

  // Quiz 1: Network Fundamentals
  const quiz1 = await db.quiz.upsert({
    where: { id: 'quiz-demo-course-0' },
    update: {},
    create: {
      id: 'quiz-demo-course-0',
      moduleId: 'demo-course-0',
      title: 'Network Fundamentals Quiz',
      timeLimitSec: 300,
      passingScore: 0.7,
    },
  });

  const quiz1Questions = [
    {
      id: 'q1-nf-1',
      quizId: quiz1.id,
      questionText: 'How many layers does the OSI model have?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['4 layers', '5 layers', '7 layers', '10 layers']),
      correctAnswer: '7 layers',
      explanation: 'The OSI (Open Systems Interconnection) model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.',
      points: 1,
      orderIndex: 0,
    },
    {
      id: 'q1-nf-2',
      quizId: quiz1.id,
      questionText: 'Which OSI layer is responsible for routing packets between networks?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer']),
      correctAnswer: 'Network Layer',
      explanation: 'The Network Layer (Layer 3) handles logical addressing and routing, determining the best path for data to travel across interconnected networks.',
      points: 1,
      orderIndex: 1,
    },
    {
      id: 'q1-nf-3',
      quizId: quiz1.id,
      questionText: 'What is the maximum length of a standard IPv4 address in dotted-decimal notation?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['8 characters', '15 characters', '32 characters', '64 characters']),
      correctAnswer: '15 characters',
      explanation: 'An IPv4 address in dotted-decimal notation (e.g., 192.168.1.1) has a maximum length of 15 characters (three groups of 3 digits + 3 dots).',
      points: 1,
      orderIndex: 2,
    },
    {
      id: 'q1-nf-4',
      quizId: quiz1.id,
      questionText: 'Which protocol operates at the Data Link Layer of the OSI model?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['IP', 'TCP', 'ARP', 'HTTP']),
      correctAnswer: 'ARP',
      explanation: 'ARP (Address Resolution Protocol) operates at Layer 2 (Data Link Layer) to map IP addresses to MAC addresses on a local network.',
      points: 1,
      orderIndex: 3,
    },
  ];

  for (const q of quiz1Questions) {
    await db.quizQuestion.upsert({
      where: { id: q.id },
      update: {},
      create: q,
    });
  }

  // Quiz 2: TCP/IP Deep Dive
  const quiz2 = await db.quiz.upsert({
    where: { id: 'quiz-demo-course-1' },
    update: {},
    create: {
      id: 'quiz-demo-course-1',
      moduleId: 'demo-course-1',
      title: 'TCP/IP Deep Dive Quiz',
      timeLimitSec: 300,
      passingScore: 0.7,
    },
  });

  const quiz2Questions = [
    {
      id: 'q2-tcp-1',
      quizId: quiz2.id,
      questionText: 'What are the three packets exchanged during a TCP three-way handshake?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, SYN, SYN-ACK', 'SYN, FIN, RST']),
      correctAnswer: 'SYN, SYN-ACK, ACK',
      explanation: 'The TCP three-way handshake consists of: SYN (client initiates), SYN-ACK (server acknowledges and syncs), ACK (client acknowledges the server).',
      points: 1,
      orderIndex: 0,
    },
    {
      id: 'q2-tcp-2',
      quizId: quiz2.id,
      questionText: 'Which protocol provides reliable, connection-oriented data delivery?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['UDP', 'TCP', 'ICMP', 'ARP']),
      correctAnswer: 'TCP',
      explanation: 'TCP (Transmission Control Protocol) provides reliable, connection-oriented delivery with features like sequencing, acknowledgments, and retransmission.',
      points: 1,
      orderIndex: 1,
    },
    {
      id: 'q2-tcp-3',
      quizId: quiz2.id,
      questionText: 'What is the default port number for HTTPS?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['80', '443', '8080', '8443']),
      correctAnswer: '443',
      explanation: 'HTTPS (HTTP over TLS/SSL) uses port 443 by default. HTTP uses port 80.',
      points: 1,
      orderIndex: 2,
    },
    {
      id: 'q2-tcp-4',
      quizId: quiz2.id,
      questionText: 'What mechanism does TCP use to control the rate of data transmission?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['Routing', 'Windowing', 'Fragmentation', 'NAT']),
      correctAnswer: 'Windowing',
      explanation: 'TCP uses a sliding window mechanism to control the flow of data. The window size determines how many bytes can be sent before requiring an acknowledgment.',
      points: 1,
      orderIndex: 3,
    },
  ];

  for (const q of quiz2Questions) {
    await db.quizQuestion.upsert({
      where: { id: q.id },
      update: {},
      create: q,
    });
  }

  // Quiz 3: Network Scanning
  const quiz3 = await db.quiz.upsert({
    where: { id: 'quiz-demo-course-2' },
    update: {},
    create: {
      id: 'quiz-demo-course-2',
      moduleId: 'demo-course-2',
      title: 'Network Scanning Quiz',
      timeLimitSec: 300,
      passingScore: 0.7,
    },
  });

  const quiz3Questions = [
    {
      id: 'q3-scan-1',
      quizId: quiz3.id,
      questionText: 'Which Nmap flag is used to perform a SYN (stealth) scan?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['-sS', '-sT', '-sU', '-sA']),
      correctAnswer: '-sS',
      explanation: 'The -sS flag performs a SYN scan (half-open scan), which sends SYN packets and analyzes responses without completing the TCP handshake.',
      points: 1,
      orderIndex: 0,
    },
    {
      id: 'q3-scan-2',
      quizId: quiz3.id,
      questionText: 'What does an open port indicate during a network scan?',
      questionType: 'multiple_choice',
      options: JSON.stringify([
        'The port is filtered by a firewall',
        'An application is actively accepting connections on that port',
        'The host is powered off',
        'The network interface is down',
      ]),
      correctAnswer: 'An application is actively accepting connections on that port',
      explanation: 'An open port means an application (service) is listening and ready to accept connections on that port. This is critical information for security assessments.',
      points: 1,
      orderIndex: 1,
    },
    {
      id: 'q3-scan-3',
      quizId: quiz3.id,
      questionText: 'Which scanning technique sends packets with no flags set (NULL scan)?',
      questionType: 'multiple_choice',
      options: JSON.stringify(['Xmas scan', 'FIN scan', 'NULL scan', 'ACK scan']),
      correctAnswer: 'NULL scan',
      explanation: 'A NULL scan (-sN) sends TCP packets with no flags set. According to RFC 793, closed ports should respond with RST while open ports should not respond.',
      points: 1,
      orderIndex: 2,
    },
    {
      id: 'q3-scan-4',
      quizId: quiz3.id,
      questionText: 'What is the primary purpose of OS fingerprinting in network scanning?',
      questionType: 'multiple_choice',
      options: JSON.stringify([
        'To install software on the target',
        'To identify the operating system running on a host',
        'To encrypt network traffic',
        'To block incoming connections',
      ]),
      correctAnswer: 'To identify the operating system running on a host',
      explanation: 'OS fingerprinting uses responses to specially crafted packets to determine the operating system of a target host, which helps identify OS-specific vulnerabilities.',
      points: 1,
      orderIndex: 3,
    },
  ];

  for (const q of quiz3Questions) {
    await db.quizQuestion.upsert({
      where: { id: q.id },
      update: {},
      create: q,
    });
  }

  console.log('Quizzes and questions created');

  // --- Enrollments ---
  await db.enrollment.upsert({
    where: { id: `enr-${admin.id}-${course1.id}` },
    update: {},
    create: {
      id: `enr-${admin.id}-${course1.id}`,
      userId: admin.id,
      courseId: course1.id,
      status: 'active',
      currentModuleId: 'demo-course-2',
      overallProgress: 0.5,
    },
  });

  // --- Notifications ---
  const notificationsData = [
    {
      userId: admin.id,
      title: 'Welcome to CyberShield Academy',
      message: 'Start your cybersecurity journey with our Network Security Fundamentals course.',
      type: 'info',
    },
    {
      userId: admin.id,
      title: 'New Course Available',
      message: 'Web Application Security and Cloud Security Fundamentals courses are now live!',
      type: 'info',
    },
    {
      userId: instructor.id,
      title: 'Instructor Account Activated',
      message: 'Your instructor account has been set up. You can now manage courses and review student progress.',
      type: 'success',
    },
  ];

  for (const n of notificationsData) {
    await db.notification.create({ data: n });
  }

  console.log('Enrollments and notifications created');
  console.log('Seed complete');
}

seed().catch(console.error).finally(() => process.exit(0));