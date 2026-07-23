# Termi website

A responsive landing page for **Termi** — a bridge that connects your terminal to
the mobile-connector app — with a live WebSocket status console.

## Structure

```
termi-website/
├── index.html          # Landing page (hero, features, how-it-works, live console)
├── assets/
│   ├── styles.css      # Responsive styling, dark theme
│   └── app.js          # WebSocket communication layer + live status panel
└── README.md
```

## Serve it locally

```bash
cd ~/termi-website
python3 -m http.server 4173
```

Then open http://localhost:4173

## Connecting to the mobile-connector app

1. Start the mobile-connector app so it exposes a WebSocket endpoint.
2. In the **Live status console**, enter the endpoint (default `ws://localhost:8080`)
   and click **Connect**. The port is fully configurable.
3. Incoming messages/commands render live in the panel; you can send commands back.

### Configuring the endpoint

- Type it into the console field (persisted across reloads), **or**
- Deep-link it: `http://localhost:4173/?ws=ws://localhost:9000`

### Message format

The client sends a small JSON envelope and understands both JSON and raw text:

- **Outgoing command:** `{"type":"command","command":"<text>","t":<epochMs>}`
- **Incoming:** raw text, or JSON with any of `type`/`command`/`event` +
  `message`/`data`/`payload`.
- **Latency:** the client periodically sends `{"type":"ping"}`; reply with
  `{"type":"pong"}` to populate the "last ping" stat.

Auto-reconnect with backoff is built in; **Disconnect** stops it.
