const API_BASE = "https://multick.dev";
const app = document.getElementById("app");

let timerInterval = null;

async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiKey"], (result) => {
      resolve({ apiKey: result.apiKey || null });
    });
  });
}

function saveConfig(apiKey) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ apiKey }, resolve);
  });
}

async function api(path, options = {}) {
  const config = await getConfig();
  if (!config.apiKey) throw new Error("No API key");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${h}:${pad(m)}:${pad(s)}`;
}

function renderSetup(error) {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  app.innerHTML = `
    <div class="setup">
      <p>Enter your Multick API key to connect. You can find it in Settings.</p>
      <label>API Key</label>
      <input type="text" id="apiKeyInput" placeholder="tt_..." />
      ${error ? `<div class="error">${error}</div>` : ""}
      <button class="btn btn-primary" id="saveBtn">Connect</button>
    </div>
  `;
  document.getElementById("saveBtn").addEventListener("click", async () => {
    const apiKey = document.getElementById("apiKeyInput").value.trim();
    if (!apiKey) return;
    await saveConfig(apiKey);
    renderLoading();
    loadApp();
  });
}

function renderLoading() {
  app.innerHTML = `<div class="loading">Loading...</div>`;
}

function renderError(msg) {
  app.innerHTML = `
    <div class="error">${msg}</div>
    <div style="padding: 0 16px 16px">
      <button class="btn btn-outline" id="retryBtn">Retry</button>
    </div>
  `;
  document.getElementById("retryBtn").addEventListener("click", () => {
    renderLoading();
    loadApp();
  });
}

function startTimerDisplay(startAt) {
  if (timerInterval) clearInterval(timerInterval);
  const startTime = new Date(startAt).getTime();
  const timeEl = document.getElementById("timerDisplay");
  function update() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (timeEl) timeEl.textContent = formatTime(elapsed);
  }
  update();
  timerInterval = setInterval(update, 1000);
}

function renderApp(projects, current) {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  let html = "";

  if (current) {
    html += `
      <div class="running">
        <div class="project-name">
          <span class="dot" style="background:${current.projectColor}"></span>
          ${escapeHtml(current.projectName)}
        </div>
        <div class="time" id="timerDisplay">0:00:00</div>
        <button class="btn btn-danger" id="stopBtn" style="margin-top:12px">Stop Timer</button>
      </div>
    `;
  }

  if (projects.length === 0) {
    html += `<div class="empty">No projects yet. Create one in the app.</div>`;
  } else {
    html += `<div class="projects">`;
    for (const p of projects) {
      const isRunning = current && current.projectId === p.id;
      html += `
        <div class="project-item">
          <div class="project-info">
            <span class="project-dot" style="background:${p.color}"></span>
            <span>${escapeHtml(p.name)}</span>
          </div>
          <button class="play-btn" data-id="${p.id}" ${isRunning || current ? "disabled" : ""}>
            ${isRunning ? "■" : "▶"}
          </button>
        </div>
      `;
    }
    html += `</div>`;
  }

  html += `
    <div class="footer">
      <button id="disconnectBtn">Disconnect</button>
    </div>
  `;

  app.innerHTML = html;

  if (current) {
    startTimerDisplay(current.startAt);
    document.getElementById("stopBtn").addEventListener("click", async () => {
      document.getElementById("stopBtn").disabled = true;
      document.getElementById("stopBtn").textContent = "Stopping...";
      try {
        await api("/api/timer/stop", { method: "POST" });
      } catch {}
      loadApp();
    });
  }

  document.querySelectorAll(".play-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await api("/api/timer/start", {
          method: "POST",
          body: JSON.stringify({ projectId: btn.dataset.id }),
        });
      } catch (e) {
        renderError(e.message);
        return;
      }
      loadApp();
    });
  });

  document.getElementById("disconnectBtn").addEventListener("click", async () => {
    await saveConfig(null);
    renderSetup();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadApp() {
  const config = await getConfig();
  if (!config.apiKey) {
    renderSetup();
    return;
  }

  try {
    const [projects, current] = await Promise.all([
      api("/api/projects"),
      api("/api/timer/current"),
    ]);
    renderApp(projects, current);
  } catch (e) {
    if (e.message === "No API key" || e.message === "Unauthorized") {
      renderSetup("Invalid API key. Check your key in Settings.");
    } else {
      renderError(e.message);
    }
  }
}

loadApp();
