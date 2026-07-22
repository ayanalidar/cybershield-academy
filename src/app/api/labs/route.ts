import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const labSpawnSchema = z.object({
  userId: z.string().min(1),
  moduleId: z.string().optional(),
  topic: z.string().min(1),
  objectives: z.array(z.string()).min(1).max(10),
});

const LAB_TOPIC_CONFIGS: Record<string, { image: string; setupCommands: string[]; ports: number[] }> = {
  'network-scanning': {
    image: 'ubuntu:22.04',
    setupCommands: [
      'apt-get update && apt-get install -y nmap net-tools iputils-ping dnsutils > /dev/null 2>&1',
      'echo "Network scanning lab ready. Tools: nmap, ping, nslookup, dig"',
    ],
    ports: [],
  },
  'web-security': {
    image: 'ubuntu:22.04',
    setupCommands: [
      'apt-get update && apt-get install -y curl wget python3 nikto > /dev/null 2>&1',
      'echo "Web security lab ready. Tools: curl, wget, python3, nikto"',
    ],
    ports: [8080],
  },
  'cryptography': {
    image: 'ubuntu:22.04',
    setupCommands: [
      'apt-get update && apt-get install -y openssl python3 > /dev/null 2>&1',
      'echo "Cryptography lab ready. Tools: openssl, python3 with hashlib"',
    ],
    ports: [],
  },
  'malware-analysis': {
    image: 'ubuntu:22.04',
    setupCommands: [
      'apt-get update && apt-get install -y file binutils python3 > /dev/null 2>&1',
      'echo "Malware analysis lab ready. Tools: file, objdump, readelf, strings"',
    ],
    ports: [],
  },
  'firewall-config': {
    image: 'ubuntu:22.04',
    setupCommands: [
      'apt-get update && apt-get install -y iptables net-tools > /dev/null 2>&1',
      'echo "Firewall configuration lab ready. Tools: iptables, netstat"',
    ],
    ports: [],
  },
  'general': {
    image: 'ubuntu:22.04',
    setupCommands: [
      'apt-get update && apt-get install -y curl wget net-tools iputils-ping python3 > /dev/null 2>&1',
      'echo "General cybersecurity lab ready with common tools installed."',
    ],
    ports: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = labSpawnSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid lab spawn request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, moduleId, topic, objectives } = parsed.data;

    const existingActive = await db.labSession.findFirst({
      where: { userId, status: 'running' },
    });

    if (existingActive) {
      return NextResponse.json(
        {
          error: 'Active lab session already exists',
          existingSessionId: existingActive.id,
        },
        { status: 409 }
      );
    }

    const topicKey = Object.keys(LAB_TOPIC_CONFIGS).find((k) =>
      topic.toLowerCase().includes(k)
    ) ?? 'general';
    const config = LAB_TOPIC_CONFIGS[topicKey];

    const containerId = uuidv4();
    const containerName = `csa-lab-${userId.slice(0, 8)}-${Date.now()}`;

    const labObjectives = objectives.map((desc, i) => ({
      id: `obj-${i}`,
      description: desc,
      completed: false,
    }));

    const session = await db.labSession.create({
      data: {
        userId,
        moduleId: moduleId ?? null,
        containerId,
        containerName,
        status: 'starting',
        topic,
        objectives: JSON.stringify(labObjectives),
        objectivesCompleted: JSON.stringify(labObjectives.map((o) => ({ ...o, completed: false }))),
        commandHistory: JSON.stringify([]),
      },
    });

    spawnLabContainer(containerName, config.image, config.setupCommands, config.ports, session.id, userId)
      .then(() => {
        db.labSession.update({
          where: { id: session.id },
          data: { status: 'running' },
        }).catch(console.error);
      })
      .catch((err) => {
        console.error('Lab spawn failed:', err);
        db.labSession.update({
          where: { id: session.id },
          data: { status: 'failed' },
        }).catch(console.error);
      });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        containerId,
        containerName,
        topic,
        status: 'starting',
        objectives: labObjectives,
        terminalPort: 3004,
      },
    });
  } catch (error) {
    console.error('Lab spawn error:', error);
    return NextResponse.json(
      { error: 'Failed to spawn lab environment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const session = await db.labSession.findUnique({ where: { id: sessionId } });
      if (!session) {
        return NextResponse.json({ error: 'Lab session not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        session: {
          ...session,
          objectives: JSON.parse(session.objectives ?? '[]'),
          objectivesCompleted: JSON.parse(session.objectivesCompleted ?? '[]'),
          commandHistory: JSON.parse(session.commandHistory ?? '[]'),
        },
      });
    }

    if (userId) {
      const sessions = await db.labSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 20,
      });
      return NextResponse.json({
        success: true,
        sessions: sessions.map((s) => ({
          id: s.id,
          topic: s.topic,
          status: s.status,
          score: s.score,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
        })),
      });
    }

    return NextResponse.json(
      { error: 'userId or sessionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Lab session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve lab sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = await db.labSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ error: 'Lab session not found' }, { status: 404 });
    }

    await db.labSession.update({
      where: { id: sessionId },
      data: { status: 'terminated', terminatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Lab session terminated' });
  } catch (error) {
    console.error('Lab termination error:', error);
    return NextResponse.json(
      { error: 'Failed to terminate lab session' },
      { status: 500 }
    );
  }
}

async function spawnLabContainer(
  containerName: string,
  image: string,
  setupCommands: string[],
  ports: number[],
  sessionId: string,
  userId: string
): Promise<void> {
  const useRealDocker = process.env.DOCKER_HOST || process.env.DOCKER_URL;

  if (useRealDocker) {
    try {
      const Docker = (await import('dockerode')).default;
      const docker = new Docker({ socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock' });

      const container = await docker.createContainer({
        Image: image,
        name: containerName,
        Hostname: 'cybershield-lab',
        Tty: true,
        OpenStdin: true,
        NetworkDisabled: false,
        HostConfig: {
          NetworkMode: 'cybershield-isolated',
          Memory: 256 * 1024 * 1024,
          NanoCpus: 500_000_000,
          PidsLimit: 64,
          ReadonlyRootfs: false,
          AutoRemove: true,
          PortBindings: Object.fromEntries(ports.map((p) => [`${p}/tcp`, [{ HostPort: `${50000 + Math.floor(Math.random() * 10000)}` }]])),
          SecurityOpt: ['no-new-privileges', 'seccomp=cybershield-default'],
          LogConfig: { Type: 'json-file', Config: { 'max-size': '10m', 'max-file': '3' } },
        },
        User: 'student',
        WorkingDir: '/home/student',
        Env: [
          'TERM=xterm-256color',
          `LAB_SESSION_ID=${sessionId}`,
          `LAB_USER_ID=${userId}`,
        ],
      });

      await container.start();

      const exec = await container.exec({
        Cmd: ['/bin/bash', '-c', setupCommands.join(' && ')],
        AttachStdout: true,
        AttachStderr: true,
      });

      await exec.start({ hijack: true, stdin: false });

      console.log(`[Lab Spawner] Real Docker container started: ${container.id}`);
    } catch (dockerError) {
      console.error(`[Lab Spawner] Docker failed, falling back to simulation:`, dockerError);
      await terminateLabContainer(session.containerName);

      await db.labSession.update({
        where: { id: sessionId },
        data: { status: 'running' },
      });
    }
  } else {
    console.log(`[Lab Spawner] Docker not configured, using simulated container`);
    console.log(`[Lab Spawner] Container: ${containerName} (image: ${image})`);
    console.log(`[Lab Spawner] Session: ${sessionId}, User: ${userId}`);

    for (const cmd of setupCommands) {
      console.log(`[Lab Spawner] Would execute: ${cmd.substring(0, 80)}...`);
    }

    console.log(`[Lab Spawner] Simulated container ${containerName} is now running`);
  }
}

async function terminateLabContainer(containerName: string): Promise<void> {
  const useRealDocker = process.env.DOCKER_HOST || process.env.DOCKER_URL;

  if (useRealDocker) {
    try {
      const Docker = (await import('dockerode')).default;
      const docker = new Docker({ socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock' });
      const container = docker.getContainer(containerName);
      await container.kill();
      await container.remove({ force: true });
      console.log(`[Lab Spawner] Real container terminated: ${containerName}`);
    } catch {
      console.log(`[Lab Spawner] Container ${containerName} not found or already removed`);
    }
  } else {
    console.log(`[Lab Spawner] Simulated container terminated: ${containerName}`);
  }
}