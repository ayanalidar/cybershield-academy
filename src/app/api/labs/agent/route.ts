import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const labObjectiveSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  completed: z.boolean(),
});

const labAgentRequestSchema = z.object({
  labTitle: z.string().min(1).max(200),
  labCategory: z.string().min(1).max(100),
  labDifficulty: z.string().min(1).max(50),
  currentObjectives: z.array(labObjectiveSchema).max(20),
  terminalHistory: z.array(z.string().max(500)).max(20),
  userCommand: z.string().max(500).optional(),
  labSteps: z.array(z.string().max(500)).max(50),
  question: z.string().max(2000).optional(),
  userLevel: z.number().int().min(1),
  userXp: z.number().int().min(0),
});

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

const LAB_AGENT_SYSTEM_PROMPT = `You are LabAgent, a dedicated AI lab assistant at CyberShield Academy. You operate INSIDE the lab terminal environment and help students complete hands-on cybersecurity exercises.

YOUR ROLE:
- Analyze the student's terminal commands and output to understand their progress
- Provide concise, actionable guidance (2-4 sentences max)
- Suggest specific commands when the student is stuck
- Celebrate progress and completed objectives
- If the student is advancing quickly, suggest bonus challenges

BEHAVIOR RULES:
- NEVER give the complete solution directly — guide through hints and questions
- Reference specific terminal output when explaining
- Keep responses under 100 words unless explaining a complex concept
- Use code blocks for command suggestions
- If the student asks a question outside the lab scope, briefly answer then redirect to the lab

DIFFICULTY ADAPTATION:
- If the student completed all objectives quickly (under 5 commands per objective), set difficultyAdjustment to "harder" and suggest 1-2 bonusObjectives
- If the student has typed 10+ commands without completing an objective, set difficultyAdjustment to "easier" and provide a more direct hint
- Otherwise, set difficultyAdjustment to "same"

ENCOURAGEMENT:
- Provide encouragement when: first objective completed, all objectives completed, student tries a correct approach
- Keep encouragement brief and genuine`;

// ---------------------------------------------------------------------------
// Response type (runtime shape, may be partially filled)
// ---------------------------------------------------------------------------

interface LabAgentResponse {
  guidance: string;
  difficultyAdjustment?: 'easier' | 'harder' | 'same';
  bonusObjectives?: {
    id: string;
    description: string;
    verificationPattern: string;
  }[];
  hint?: string;
  encouragement?: string;
  nextStep?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a user-facing prompt that packages the lab state into a clear
 * structure the LLM can reason over.
 */
function buildUserPrompt(data: z.infer<typeof labAgentRequestSchema>): string {
  const sections: string[] = [];

  // -- Lab context
  sections.push(
    `## Lab Context\n` +
    `- **Title**: ${data.labTitle}\n` +
    `- **Category**: ${data.labCategory}\n` +
    `- **Difficulty**: ${data.labDifficulty}\n` +
    `- **Student Level**: ${data.userLevel} (${data.userXp} XP)\n`
  );

  // -- Objectives & progress
  const completed = data.currentObjectives.filter((o) => o.completed);
  const pending = data.currentObjectives.filter((o) => !o.completed);

  let objSection = `## Objectives (${completed.length}/${data.currentObjectives.length} completed)\n`;
  if (completed.length > 0) {
    objSection += `**Completed:**\n${completed.map((o) => `- [x] ${o.description}`).join('\n')}\n`;
  }
  if (pending.length > 0) {
    objSection += `**Remaining:**\n${pending.map((o) => `- [ ] ${o.description}`).join('\n')}\n`;
  }
  sections.push(objSection);

  // -- Lab steps (reference material)
  if (data.labSteps.length > 0) {
    sections.push(
      `## Reference Lab Steps\n` +
      data.labSteps.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n'
    );
  }

  // -- Terminal history
  if (data.terminalHistory.length > 0) {
    const terminal = data.terminalHistory
      .slice(-20)
      .map((line) => `  ${line}`)
      .join('\n');
    sections.push(`## Recent Terminal Output\n\`\`\`\n${terminal}\n\`\`\`\n`);
  }

  // -- Last user command (highlighted)
  if (data.userCommand) {
    sections.push(`## Last Command Typed\n\`\`\`\n${data.userCommand}\n\`\`\`\n`);
  }

  // -- Explicit question
  if (data.question) {
    sections.push(`## Student's Question\n${data.question}\n`);
  }

  // -- Response format instruction
  sections.push(
    `## Your Response\n` +
    `Respond with a JSON object (and nothing else) with this exact shape:\n` +
    `\`\`\`json\n` +
    `{\n` +
    `  "guidance": "<your main guidance text in markdown>",\n` +
    `  "difficultyAdjustment": "easier" | "harder" | "same",\n` +
    `  "bonusObjectives": [{"id": "bonus-1", "description": "...", "verificationPattern": "regex or text to match in terminal"}],\n` +
    `  "hint": "<incremental hint if student seems stuck, omit if not needed>",\n` +
    `  "encouragement": "<motivational message, omit if not appropriate>",\n` +
    `  "nextStep": "<suggested next command or action, omit if not appropriate>"\n` +
    `}\n` +
    `\`\`\`\n` +
    `IMPORTANT: Return ONLY the JSON object. No markdown fences, no explanation outside the JSON.`
  );

  return sections.join('\n');
}

/**
 * Attempt to parse the LLM's raw text as a JSON LabAgentResponse.
 * Falls back to wrapping the entire text as `guidance` when parsing fails.
 */
function parseAgentResponse(raw: string): LabAgentResponse {
  // Strip any leading/trailing markdown code fences the model might include
  // despite instructions.
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;

    // Validate and extract only the fields we recognise
    const response: LabAgentResponse = {
      guidance: typeof parsed.guidance === 'string' ? parsed.guidance : raw,
    };

    if (
      typeof parsed.difficultyAdjustment === 'string' &&
      ['easier', 'harder', 'same'].includes(parsed.difficultyAdjustment)
    ) {
      response.difficultyAdjustment = parsed.difficultyAdjustment as
        | 'easier'
        | 'harder'
        | 'same';
    }

    if (Array.isArray(parsed.bonusObjectives)) {
      const valid = parsed.bonusObjectives
        .filter(
          (b: Record<string, unknown>) =>
            typeof b.id === 'string' &&
            typeof b.description === 'string' &&
            typeof b.verificationPattern === 'string'
        )
        .map((b: Record<string, unknown>) => ({
          id: b.id as string,
          description: b.description as string,
          verificationPattern: b.verificationPattern as string,
        }));
      if (valid.length > 0) {
        response.bonusObjectives = valid.slice(0, 3);
      }
    }

    if (typeof parsed.hint === 'string' && parsed.hint.length > 0) {
      response.hint = parsed.hint;
    }

    if (typeof parsed.encouragement === 'string' && parsed.encouragement.length > 0) {
      response.encouragement = parsed.encouragement;
    }

    if (typeof parsed.nextStep === 'string' && parsed.nextStep.length > 0) {
      response.nextStep = parsed.nextStep;
    }

    return response;
  } catch {
    // JSON parse failed — treat the whole response as guidance markdown
    return { guidance: raw };
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validate input
    const body = await request.json();
    const parsed = labAgentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request payload',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 2. Dynamically import the LLM SDK
    const sdk = await import('z-ai-web-dev-sdk');
    const llm = new sdk.LLM();

    // 3. Build prompt
    const userPrompt = buildUserPrompt(data);

    // 4. Call LLM (non-streaming so we can parse structured JSON)
    const stream = await llm.chat({
      messages: [
        { role: 'system', content: LAB_AGENT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.6,
      maxTokens: 1024,
    });

    // Collect streamed chunks
    let rawResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content ?? '';
      rawResponse += content;
    }

    // 5. Parse the structured response
    const agentResponse = parseAgentResponse(rawResponse);

    // 6. Return
    return NextResponse.json(agentResponse);
  } catch (error) {
    // Distinguish client errors from unexpected failures
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Malformed JSON in request body' },
        { status: 400 }
      );
    }

    console.error('[LabAgent] Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Lab agent encountered an unexpected error',
        guidance:
          'I ran into an issue processing your request. Try running your last command again or ask me a specific question about the lab.',
      },
      { status: 500 }
    );
  }
}