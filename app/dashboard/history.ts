// Pure command-history navigation logic, extracted so it can be unit-tested
// independently of React. The dashboard keeps the same state in refs.

export type HistState = {
  history: string[]; // most-recent last
  idx: number;       // cursor; === history.length means "at the live prompt"
  draft: string;     // stashed live input while browsing history
  value: string;     // what the input should currently show
};

const MAX = 100;

/** Record a sent command; skips consecutive duplicates, caps length, resets cursor. */
export function record(state: HistState, cmd: string): HistState {
  const history = state.history.slice();
  if (history[history.length - 1] !== cmd) history.push(cmd);
  while (history.length > MAX) history.shift();
  return { history, idx: history.length, draft: "", value: "" };
}

/** Arrow up: move toward older commands, stashing the live draft on first step. */
export function up(state: HistState): HistState {
  const { history, idx } = state;
  if (history.length === 0) return state;
  const draft = idx === history.length ? state.value : state.draft;
  const nextIdx = Math.max(0, idx - 1);
  return { ...state, idx: nextIdx, draft, value: history[nextIdx] };
}

/** Arrow down: move toward newer commands; restores the draft at the live prompt. */
export function down(state: HistState): HistState {
  const { history, idx } = state;
  if (idx >= history.length) return state;
  const nextIdx = Math.min(history.length, idx + 1);
  const value = nextIdx === history.length ? state.draft : history[nextIdx];
  return { ...state, idx: nextIdx, value };
}
