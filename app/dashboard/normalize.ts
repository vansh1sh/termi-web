// Defensive parsers for untrusted realtime payloads. Anything that can broadcast
// to the room could send a malformed message; these turn arbitrary JSON into safe,
// fully-typed shapes (or null) so the dashboard can never crash on bad input.

export type BrainTest = { name: string; passed: boolean };
export type BrainTerminal = {
  id?: string;
  title: string;
  progress: string;
  instruction?: string;
  model?: string;
  supervising?: boolean;
  complete?: boolean;
  blocker?: string;
  tests?: BrainTest[];
  tokens?: number;
};
export type BrainActivity = {
  feature: string;
  headline: string;
  state: "running" | "ok" | "failed";
  startedAt: number;
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
  invokes?: number;
  runningCalls: number;
  activity: BrainActivity[];
};
export type Presence = {
  terminalCount: number;
  activeTitle: string;
  cwd: string;
  afkRunning: boolean;
  provider: string;
  taskPhase: "idle" | "preparing" | "running";
  at: number;
};
export type ControlResult = {
  requestId: string;
  action: string;
  ok: boolean;
  message: string;
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
  if (v.id != null && str(v.id)) t.id = clamp(str(v.id));
  if (v.instruction != null) t.instruction = clamp(str(v.instruction));
  if (v.model != null && str(v.model)) t.model = clamp(str(v.model));
  if (v.supervising != null) t.supervising = bool(v.supervising);
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

const MAX_ACTIVITY = 12;

function normalizeActivity(v: unknown): BrainActivity[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, MAX_ACTIVITY).filter(isObj).map((item) => {
    const state = item.state === "running" || item.state === "failed" ? item.state : "ok";
    return {
      feature: clamp(str(item.feature, "Brain")),
      headline: clamp(str(item.headline, "Working")),
      state,
      startedAt: Math.max(0, int(item.startedAt)),
    };
  });
}

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
    runningCalls: Math.max(0, int(p.runningCalls)),
    activity: normalizeActivity(p.activity),
  };
  const tokens = num(p.tokens);
  if (tokens != null) b.tokens = Math.trunc(tokens);
  const cost = num(p.costUSD);
  if (cost != null) b.costUSD = cost;
  if (p.summary != null && str(p.summary)) b.summary = clamp(str(p.summary));
  const invokes = num(p.invokes);
  if (invokes != null) b.invokes = Math.trunc(invokes);
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
    taskPhase: p.taskPhase === "preparing" || p.taskPhase === "running"
      ? p.taskPhase
      : bool(p.afkRunning) ? "running" : "idle",
    at,
  };
}

/** Returns a safe acknowledgement for a control request, or null when it cannot be matched. */
export function normalizeControlResult(p: unknown): ControlResult | null {
  if (!isObj(p)) return null;
  const requestId = clamp(str(p.requestId)).slice(0, 120);
  const action = clamp(str(p.action)).slice(0, 80);
  if (!requestId || !action) return null;
  const ok = bool(p.ok);
  return {
    requestId,
    action,
    ok,
    message: clamp(str(p.message, ok ? "Accepted." : "Request rejected.")),
  };
}
