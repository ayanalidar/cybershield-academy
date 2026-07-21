import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function seed() {
  const user = await db.user.upsert({
    where: { email: 'alex@cybershield.academy' },
    update: {},
    create: { email: 'alex@cybershield.academy', name: 'Alex Chen', role: 'student' },
  });
  console.log('User:', user.id);
  const course = await db.course.upsert({
    where: { id: 'demo-course' },
    update: {},
    create: {
      id: 'demo-course',
      title: 'Network Security Fundamentals',
      description: 'Comprehensive network security training.',
      category: 'cybersecurity',
      difficulty: 'intermediate',
    },
  });
  const modules = [
    { title: 'Network Fundamentals', content: 'Network fundamentals cover the OSI model and TCP/IP protocol suite. Understanding IP addressing, subnetting, routing, and switching is critical for any cybersecurity professional. The OSI model provides a conceptual framework for understanding how data flows across networks.', orderIndex: 0 },
    { title: 'TCP/IP Deep Dive', content: 'The TCP/IP protocol stack is the backbone of modern networking. This module covers the four layers in detail. We examine the TCP three-way handshake (SYN, SYN-ACK, ACK), sequence numbers, windowing, and flow control mechanisms that ensure reliable data delivery.', orderIndex: 1 },
    { title: 'Network Scanning', content: 'Network scanning is a critical reconnaissance technique in penetration testing. Tools like Nmap, Masscan, and Zmap allow security professionals to discover hosts, open ports, running services, and operating system fingerprints on target networks.', orderIndex: 2 },
    { title: 'Cryptography Basics', content: 'Cryptography provides the mathematical foundations for information security. This module covers symmetric encryption (AES, ChaCha20), asymmetric encryption (RSA, ECC), hash functions (SHA-256, bcrypt), digital signatures, and PKI infrastructure.', orderIndex: 3 },
    { title: 'Firewall Configuration', content: 'Firewalls are the first line of network defense. This module covers iptables, nftables, and cloud-native firewall rules. Students learn to write effective rules for ingress and egress filtering, stateful packet inspection, and NAT configuration.', orderIndex: 4 },
    { title: 'Web Application Security', content: 'Web application security focuses on the OWASP Top 10 vulnerabilities including SQL injection, cross-site scripting (XSS), cross-site request forgery (CSRF), and server-side request forgery (SSRF).', orderIndex: 5 },
    { title: 'Incident Response', content: 'Incident response follows the NIST framework covering preparation, detection and analysis, containment, eradication, recovery, and post-incident activity. This module covers SIEM tools, alert triage, and playbook automation.', orderIndex: 6 },
    { title: 'Capstone Challenge', content: 'The capstone challenge combines all learned skills in a simulated enterprise environment. Students perform a full security assessment including reconnaissance, vulnerability scanning, exploitation, and reporting.', orderIndex: 7 },
  ];
  for (const m of modules) {
    await db.module.upsert({
      where: { id: `${course.id}-${m.orderIndex}` },
      update: {},
      create: { id: `${course.id}-${m.orderIndex}`, courseId: course.id, title: m.title, content: m.content, isPublished: true, orderIndex: m.orderIndex, durationMinutes: 30 },
    });
  }
  await db.enrollment.upsert({
    where: { id: `enr-${user.id}-${course.id}` },
    update: {},
    create: { id: `enr-${user.id}-${course.id}`, userId: user.id, courseId: course.id, status: 'active', currentModuleId: `${course.id}-2`, overallProgress: 0.5 },
  });
  console.log('Seed complete');
}
seed().catch(console.error).finally(() => process.exit(0));
