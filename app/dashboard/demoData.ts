import type { BrainStatus, Presence } from "./normalize";

// Seeded fixtures for the demo session (demo / demo). They make the dashboard
// look alive when no real Termi is connected to the shared demo room. If a real
// Termi IS driving termi:demo, its live broadcasts replace these on arrival.

export const demoPresence: Presence = {
  terminalCount: 4,
  activeTitle: "term-1 · build",
  cwd: "~/kafene",
  afkRunning: true,
  provider: "brain",
  at: Date.now(),
};

export const demoBrain: BrainStatus = {
  type: "brain_status",
  status: "Driving 4 agents — building the 3D coffee app end to end.",
  summary: "3D coffee app: storefront + cart done, scene + content wrapping up. 2/4 terminals complete.",
  isRunning: true,
  pass: 7,
  tokens: 128_400,
  costUSD: 0.19,   // already scaled for display (real reported cost / 10) — labeled "(Appx)"
  terminals: [
    {
      title: "term-1 · web frontend",
      progress: "Wired the menu grid + product detail to the cart store.",
      instruction: "Build the storefront UI (menu, product, cart drawer).",
      complete: false,
      blocker: undefined,
      tokens: 41_200,
      tests: [
        { name: "vite build", passed: true },
        { name: "renders menu", passed: true },
      ],
    },
    {
      title: "term-2 · logic",
      progress: "Zustand cart store + checkout totals done; free-shipping rule wired.",
      instruction: "Own cart/checkout state and mock checkout.",
      complete: true,
      blocker: undefined,
      tokens: 28_900,
      tests: [
        { name: "cart.test.js", passed: true },
        { name: "store.test.js", passed: true },
      ],
    },
    {
      title: "term-3 · 3D scene",
      progress: "Three.js scroll animation running; tuning camera easing.",
      instruction: "Own the WebGL scene (#scene) and scroll interaction.",
      complete: false,
      blocker: undefined,
      tokens: 39_500,
      tests: [{ name: "scene mounts", passed: true }],
    },
    {
      title: "term-4 · content",
      progress: "content.json authored — brand copy, 8 products, checkout strings.",
      instruction: "Author all site data (no code).",
      complete: true,
      blocker: undefined,
      tokens: 18_800,
      tests: [],
    },
  ],
};

// A short scripted console feed so the Monitor isn't empty in the demo.
export const demoFeed: { text: string; kind: "in" | "out" | "sys" }[] = [
  { text: "connected to your terminal room", kind: "sys" },
  { text: "brain · planning goal into 4 workstreams", kind: "in" },
  { text: "term-4 · wrote content.json (8 products)", kind: "in" },
  { text: "term-2 · cart store + checkout totals passing", kind: "in" },
  { text: "term-1 · npm run build → ✓ 0 errors", kind: "in" },
  { text: "term-3 · curl localhost:5173 → 200 OK", kind: "in" },
];
