export const MAX_INSTRUCTION_LENGTH = 4_000;

export type ControlAction = "task_start" | "brain_instruct" | "terminal_spawn";

export type ControlMessage = {
  type: ControlAction;
  instruction: string;
  requestId: string;
  t: number;
};

export function createControlMessage(
  type: ControlAction,
  rawInstruction: string,
  rawRequestId: string,
  at = Date.now(),
): ControlMessage | null {
  const instruction = rawInstruction.trim().slice(0, MAX_INSTRUCTION_LENGTH);
  const requestId = rawRequestId.trim().slice(0, 120);
  if (!instruction || !requestId) return null;
  return { type, instruction, requestId, t: at };
}

export function shouldOpenRealtime(isDemo: boolean, configured: boolean): boolean {
  return configured && !isDemo;
}

export function isPrivateRealtimeRoom(isDemo: boolean): boolean {
  return !isDemo;
}

export function isMatchingControlResult(
  pendingRequestId: string | null,
  resultRequestId: string,
): boolean {
  return pendingRequestId !== null && pendingRequestId === resultRequestId;
}
