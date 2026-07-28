// Defensive parsers for untrusted realtime payloads. Anything that can broadcast
// to the room could send a malformed message; these turn arbitrary JSON into safe,
// fully-typed shapes (or null) so the dashboard can never crash on bad input.

export type BrainTest = { name: string; passed: boolean };
export type BrainTerminal = {
  title: string;
  progress: string;
  instruction?: string;
  complete?: boolean;
  blocker?: string;
  tests?: BrainTest[];
  tokens?: number;
};
export type BrainStatus = {
  type: "brain_status";
  status: string;
  isRunning: boolean;
  pass: number;
  terminals: BrainTerminal[];
  tokens?: number;   // total live tokens across attached terminals
  costUSD?: number;  // rough estimate derived from tokens (labeled ~ in the UI)
  summary?: string;  // richer peek summary when the brain has one
};
export type Presence = {
  terminalCount: number;
  activeTitle: string;
  cwd: string;
  afkRunning: boolean;
  provider: string;
  at: number;
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : fallback;

const bool = (v: unknown): boolean => v === true || v === "true" || v === 1;

const int = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

// Cap collection sizes so a hostile/huge payload can't hang the UI.
const MAX_TERMINALS = 50;
const MAX_TESTS = 100;
const MAX_STR = 2000;

const clamp = (s: string) => (s.length > MAX_STR ? s.slice(0, MAX_STR) + "…" : s);

function normalizeTests(v: unknown): BrainTest[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.slice(0, MAX_TESTS).filter(isObj).map((t) => ({
    name: clamp(str(t.name, "test")),
    passed: bool(t.passed),
  }));
  return out.length ? out : undefined;
}

function normalizeTerminal(v: unknown): BrainTerminal | null {
  if (!isObj(v)) return null;
  const t: BrainTerminal = {
    title: clamp(str(v.title, "terminal")),
    progress: clamp(str(v.progress)),
  };
  if (v.instruction != null) t.instruction = clamp(str(v.instruction));
  if (v.blocker != null && str(v.blocker)) t.blocker = clamp(str(v.blocker));
  if (v.complete != null) t.complete = bool(v.complete);
  const tests = normalizeTests(v.tests);
  if (tests) t.tests = tests;
  if (v.tokens != null) t.tokens = Math.max(0, int(v.tokens));
  return t;
}

// A non-negative finite number, or undefined — for optional numeric fields.
const num = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Returns a safe BrainStatus, or null if the payload isn't usable. */
export function normalizeBrainStatus(p: unknown): BrainStatus | null {
  if (!isObj(p)) return null;
  const terminals = Array.isArray(p.terminals)
    ? p.terminals.slice(0, MAX_TERMINALS).map(normalizeTerminal).filter((t): t is BrainTerminal => t !== null)
    : [];
  const b: BrainStatus = {
    type: "brain_status",
    status: clamp(str(p.status)),
    isRunning: bool(p.isRunning),
    pass: int(p.pass),
    terminals,
  };
  const tokens = num(p.tokens);
  if (tokens != null) b.tokens = Math.trunc(tokens);
  const cost = num(p.costUSD);
  if (cost != null) b.costUSD = cost;
  if (p.summary != null && str(p.summary)) b.summary = clamp(str(p.summary));
  return b;
}

/** Returns a safe Presence stamped with local receive time, or null. */
export function normalizePresence(p: unknown, at: number): Presence | null {
  if (!isObj(p)) return null;
  return {
    terminalCount: Math.max(0, int(p.terminalCount)),
    activeTitle: clamp(str(p.activeTitle, "—")),
    cwd: clamp(str(p.cwd)),
    afkRunning: bool(p.afkRunning),
    provider: clamp(str(p.provider, "brain")),
    at,
  };
}
