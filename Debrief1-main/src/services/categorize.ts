import { ClassificationResult, NoteCategory } from '../types';

// ─── Keyword maps ────────────────────────────────────────────────────────────

const ACTION_PATTERNS = [
  /\b(will|should|must|need to|needs to|have to|has to|going to|gonna|please|assign|todo|to-do|task|follow.?up|action item|deadline|due|by [a-z]+ \d+|before [a-z]+|by end of|asap|urgent|schedule|implement|build|create|fix|update|deploy|send|review|prepare|write|test|complete|finish|ship|deliver)\b/i,
  /\b([a-z]+ (will|should|is going to|needs to|must))\b/i,
  /\b(responsible|owner|assignee|assigned to)\b/i,
];

const DECISION_PATTERNS = [
  /\b(decided|decision|agreed|agreement|consensus|resolved|conclude|conclusion|approved|approval|chosen|chose|selected|select|voted|unanimous|mandate|policy|going with|we('ll| will) use|confirmed|finalized|settled)\b/i,
  /\b(we (decided|agreed|chose|selected|resolved|concluded|approved))\b/i,
];

const PROBLEM_PATTERNS = [
  /\b(bug|issue|problem|error|failure|crash|broken|not working|down|outage|incident|blocker|blocked|regression|defect|vulnerability|leak|latency|slow|performance|degraded|critical|severity|p0|p1|exception|timeout|fail(ing|ed)?|incident)\b/i,
  /\b(production (issue|problem|bug|error|outage|incident))\b/i,
];

const DISCUSSION_PATTERNS = [
  /\b(discuss|discussed|conversation|consider|considering|thinking|debate|explored|explore|should we|what if|idea|suggestion|proposal|proposed|brainstorm|feedback|opinion|perspective|thoughts|wondering|question|maybe|perhaps|option|alternative|trade-?off)\b/i,
  /\?$/,
];

// ─── Priority detection ──────────────────────────────────────────────────────

function detectPriority(text: string): 'high' | 'medium' | 'low' | undefined {
  if (/\b(urgent|critical|asap|immediately|high priority|blocker|p0|emergency)\b/i.test(text)) return 'high';
  if (/\b(medium|moderate|normal priority|p2)\b/i.test(text)) return 'medium';
  if (/\b(low priority|nice to have|eventually|someday|p3|minor)\b/i.test(text)) return 'low';
  return undefined;
}

// ─── Assignee extraction ─────────────────────────────────────────────────────

function extractAssignee(text: string): string | undefined {
  // Match "Name will..." or "assign to Name" patterns
  const patterns = [
    /\b([A-Z][a-z]+ [A-Z][a-z]+) (?:will|should|needs to|must|is going to)\b/,
    /\b(?:assign(?:ed)? to|owner:|responsible:)\s*([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i,
    /\b([A-Z][a-z]+) (?:will|must|should) (?:handle|fix|implement|build|review|complete)\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return undefined;
}

// ─── Due date extraction ─────────────────────────────────────────────────────

function extractDueDate(text: string): string | undefined {
  const patterns = [
    /\bby ([A-Z][a-z]+ \d{1,2}(?:st|nd|rd|th)?)\b/i,
    /\bdue (?:on |by )?([A-Z][a-z]+ \d{1,2}(?:st|nd|rd|th)?)\b/i,
    /\b(next [A-Z][a-z]+|this [A-Z][a-z]+|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|tomorrow|end of week|EOW|EOD)\b/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return undefined;
}

// ─── Title generation ────────────────────────────────────────────────────────

function generateTitle(text: string, category: NoteCategory): string {
  // Use first sentence up to ~60 chars
  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  if (firstSentence.length <= 60) return firstSentence;

  // Trim at word boundary
  const truncated = firstSentence.slice(0, 57);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

// ─── Score-based classifier ──────────────────────────────────────────────────

function scoreText(text: string, patterns: RegExp[]): number {
  return patterns.reduce((score, p) => {
    const matches = text.match(new RegExp(p.source, 'gi'));
    return score + (matches ? matches.length : 0);
  }, 0);
}

// ─── Main categorize function ────────────────────────────────────────────────

export function categorizeNote(content: string): ClassificationResult {
  const scores: Record<NoteCategory, number> = {
    action: scoreText(content, ACTION_PATTERNS),
    decision: scoreText(content, DECISION_PATTERNS),
    problem: scoreText(content, PROBLEM_PATTERNS),
    discussion: scoreText(content, DISCUSSION_PATTERNS),
  };

  // Find winner; default to discussion
  let category: NoteCategory = 'discussion';
  let maxScore = 0;

  for (const [cat, score] of Object.entries(scores) as [NoteCategory, number][]) {
    if (score > maxScore) {
      maxScore = score;
      category = cat;
    }
  }

  const title = generateTitle(content, category);
  const priority = category === 'action' || category === 'problem' ? detectPriority(content) : undefined;
  const assignee = category === 'action' ? extractAssignee(content) : undefined;
  const dueDate = category === 'action' ? extractDueDate(content) : undefined;

  return {
    category,
    title,
    priority,
    assignee,
    dueDate,
  };
}
