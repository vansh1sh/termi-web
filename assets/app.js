/* ============================================================
 * Termi — client-side communication layer
 * Connects to the mobile-connector app over WebSocket, receives
 * messages/commands, and renders them live in the status panel.
 * The endpoint is fully configurable (ws://host:PORT).
 * ============================================================ */
(function () {
  "use strict";

  // ---- DOM ----
  const el = {
    url: document.getElementById("ws-url"),
    connect: document.getElementById("btn-connect"),
    disconnect: document.getElementById("btn-disconnect"),
    dot: document.getElementById("dot"),
    statusText: document.getElementById("status-text"),
    panel: document.getElementById("panel"),
    form: document.getElementById("send-form"),
    input: document.getElementById("send-input"),
    send: document.getElementById("btn-send"),
    clear: document.getElementById("btn-clear"),
    statMsgs: document.getElementById("stat-msgs"),
    statLatency: document.getElementById("stat-latency"),
    statState: document.getElementById("stat-state"),
  };

  // ---- State ----
  let socket = null;
  let msgCount = 0;
  let manualClose = false;
  let reconnectTimer = null;
  let reconnectDelay = 1000;          // backoff base, grows to MAX
  const RECONNECT_MAX = 15000;
  let pingSentAt = 0;
  let pingTimer = null;

  // Persist the last-used endpoint so a reload keeps it.
  const SAVED_URL = "termi.wsUrl";
  try {
    const saved = localStorage.getItem(SAVED_URL);
    if (saved) el.url.value = saved;
  } catch (_) { /* storage may be unavailable */ }

  // ---- Rendering ----
  function timestamp() {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  }

  function render(body, kind) {
    const atBottom =
      el.panel.scrollHeight - el.panel.scrollTop - el.panel.clientHeight < 40;

    const row = document.createElement("div");
    row.className = "msg msg--" + (kind || "sys");

    const t = document.createElement("span");
    t.className = "msg__time";
    t.textContent = timestamp();

    const b = document.createElement("span");
    b.className = "msg__body";
    b.textContent = body;

    row.appendChild(t);
    row.appendChild(b);
    el.panel.appendChild(row);

    // keep the log from growing unbounded
    while (el.panel.childNodes.length > 500) {
      el.panel.removeChild(el.panel.firstChild);
    }

    if (atBottom) el.panel.scrollTop = el.panel.scrollHeight;

    if (kind === "in" || kind === "out") {
      msgCount += 1;
      el.statMsgs.textContent = msgCount;
    }
  }

  function setStatus(state, label) {
    el.dot.className = "dot dot--" + state;
    el.statusText.textContent = label;
    el.statState.textContent =
      state === "on" ? "online" : state === "connecting" ? "connecting" : "offline";
  }

  function setConnectedUI(connected) {
    el.connect.disabled = connected;
    el.disconnect.disabled = !connected;
    el.input.disabled = !connected;
    el.send.disabled = !connected;
    el.url.disabled = connected;
  }

  // ---- Incoming message normalization ----
  // The connector may send plain text or JSON. Try to surface something useful.
  function describeIncoming(data) {
    if (typeof data !== "string") {
      return "[binary frame · " + (data.size || data.byteLength || 0) + " bytes]";
    }
    try {
      const obj = JSON.parse(data);
      if (obj && typeof obj === "object") {
        // Answer to our latency ping
        if (obj.type === "pong" || obj.pong) {
          if (pingSentAt) {
            el.statLatency.textContent = (Date.now() - pingSentAt) + " ms";
            pingSentAt = 0;
          }
          return null; // don't clutter the log with pongs
        }
        const label = obj.type || obj.command || obj.event || "message";
        const payload =
          obj.message != null ? obj.message :
          obj.data != null ? obj.data :
          obj.payload != null ? obj.payload : data;
        return "[" + label + "] " +
          (typeof payload === "string" ? payload : JSON.stringify(payload));
      }
    } catch (_) { /* not JSON — fall through to raw text */ }
    return data;
  }

  // ---- Latency ping (best-effort; connector may ignore) ----
  function startPing() {
    stopPing();
    pingTimer = setInterval(function () {
      if (socket && socket.readyState === WebSocket.OPEN) {
        pingSentAt = Date.now();
        try { socket.send(JSON.stringify({ type: "ping", t: pingSentAt })); }
        catch (_) { /* ignore */ }
      }
    }, 10000);
  }
  function stopPing() {
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  }

  // ---- Connection lifecycle ----
  function connect() {
    const url = el.url.value.trim();
    if (!/^wss?:\/\/.+/i.test(url)) {
      render("Invalid endpoint. Use ws://host:PORT or wss://host:PORT", "err");
      return;
    }
    try { localStorage.setItem(SAVED_URL, url); } catch (_) {}

    manualClose = false;
    clearTimeout(reconnectTimer);
    setStatus("connecting", "Connecting to " + url + " …");
    setConnectedUI(false);
    el.connect.disabled = true;

    try {
      socket = new WebSocket(url);
    } catch (err) {
      render("Could not open socket: " + err.message, "err");
      setStatus("error", "Connection failed");
      scheduleReconnect();
      return;
    }

    socket.onopen = function () {
      reconnectDelay = 1000;
      setStatus("on", "Connected");
      setConnectedUI(true);
      render("Connected to " + url, "sys");
      el.input.focus();
      startPing();
    };

    socket.onmessage = function (evt) {
      const line = describeIncoming(evt.data);
      if (line !== null) render(line, "in");
    };

    socket.onerror = function () {
      setStatus("error", "Connection error");
      render("Socket error — check that the mobile-connector app is running.", "err");
    };

    socket.onclose = function (evt) {
      stopPing();
      setConnectedUI(false);
      el.statLatency.textContent = "—";
      if (manualClose) {
        setStatus("off", "Disconnected");
        render("Disconnected.", "sys");
      } else {
        setStatus("error", "Connection lost");
        render(
          "Connection closed" +
            (evt.code ? " (code " + evt.code + ")" : "") +
            ". Reconnecting…",
          "err"
        );
        scheduleReconnect();
      }
    };
  }

  function scheduleReconnect() {
    if (manualClose) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.7, RECONNECT_MAX);
  }

  function disconnect() {
    manualClose = true;
    clearTimeout(reconnectTimer);
    stopPing();
    if (socket) {
      try { socket.close(1000, "client disconnect"); } catch (_) {}
      socket = null;
    }
    setStatus("off", "Disconnected");
    setConnectedUI(false);
  }

  function sendCommand(text) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      render("Not connected — cannot send.", "err");
      return;
    }
    // Send as a small JSON envelope; connector can also read raw text.
    let frame;
    try {
      frame = JSON.stringify({ type: "command", command: text, t: Date.now() });
    } catch (_) {
      frame = text;
    }
    try {
      socket.send(frame);
      render(text, "out");
    } catch (err) {
      render("Send failed: " + err.message, "err");
    }
  }

  // ---- Wire up events ----
  el.connect.addEventListener("click", connect);
  el.disconnect.addEventListener("click", disconnect);

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = el.input.value.trim();
    if (!text) return;
    sendCommand(text);
    el.input.value = "";
  });

  el.clear.addEventListener("click", function () {
    el.panel.innerHTML = "";
    msgCount = 0;
    el.statMsgs.textContent = "0";
    render("Log cleared.", "sys");
  });

  // Allow ?ws=ws://host:port to prefill from a link/QR code.
  const q = new URLSearchParams(location.search).get("ws");
  if (q) el.url.value = q;

  setStatus("off", "Disconnected");
})();
