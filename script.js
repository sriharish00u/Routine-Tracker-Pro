console.log("script.js loaded");

const routines = [
  { name: "Sleep", note: false },
  { name: "Wake Up", note: false },
  { name: "Brush Teeth", note: false },
  { name: "Exercise", note: true, noteLabel: "What type of exercise?" },
  { name: "Book Reading", note: true, noteLabel: "What book did you read?" },
  { name: "Breakfast", note: true, noteLabel: "What did you eat?" },
  { name: "Study", note: true, noteLabel: "What subject/topic?" },
  { name: "Lunch", note: true, noteLabel: "What did you eat?" },
  { name: "Chill Time", note: true, noteLabel: "What did you do?" },
  { name: "Dinner", note: true, noteLabel: "What did you eat?" },
  { name: "Meditation", note: true, noteLabel: "Type of meditation?" }
];

let logs = {};
let currentUser = null;

function initialize() {
  const todayDate = document.getElementById("todayDate");
  if (todayDate) {
    todayDate.innerText = new Date().toISOString().split("T")[0];
  }
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
}

window.onload = initialize;

function loadUserData() {
  try {
    logs = JSON.parse(localStorage.getItem(`routineLogs_${currentUser}`) || "{}");
  } catch (e) {
    logs = {};
  }
}

function saveUserData() {
  try {
    localStorage.setItem(`routineLogs_${currentUser}`, JSON.stringify(logs));
  } catch (e) {
    //
  }
}

function login() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("loginError");
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    loginError.textContent = "Username and password are required";
    loginError.style.display = "block";
    return;
  }
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username] && users[username].password === password) {
    currentUser = username;
    transitionToRoutine();
    loadUserData();
    renderRoutines();
  } else {
    loginError.textContent = "Invalid username or password";
    loginError.style.display = "block";
  }
}

function register() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("loginError");
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    loginError.textContent = "Username and password are required";
    loginError.style.display = "block";
    return;
  }
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[username]) {
    loginError.textContent = "Username already exists";
    loginError.style.display = "block";
    return;
  }
  users[username] = { password };
  localStorage.setItem("users", JSON.stringify(users));
  currentUser = username;
  transitionToRoutine();
  loadUserData();
  renderRoutines();
}

function guestLogin() {
  currentUser = "guest";
  transitionToRoutine();
  loadUserData();
  renderRoutines();
}

function logout() {
  if (!confirm("Are you sure you want to logout?")) return;
  currentUser = null;
  logs = {};
  const routineContainer = document.getElementById("routineContainer");
  const loginContainer = document.getElementById("loginContainer");
  routineContainer.classList.add("hidden");
  setTimeout(() => {
    routineContainer.style.display = "none";
    loginContainer.style.display = "block";
    loginContainer.classList.remove("hidden");
    loginContainer.style.removeProperty("display");
    routineContainer.style.removeProperty("display");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").style.display = "none";
  }, 300);
}

function transitionToRoutine() {
  const loginContainer = document.getElementById("loginContainer");
  const routineContainer = document.getElementById("routineContainer");
  loginContainer.classList.add("hidden");
  setTimeout(() => {
    loginContainer.style.display = "none";
    routineContainer.style.display = "block";
    routineContainer.classList.remove("hidden");
    loginContainer.style.removeProperty("display");
    routineContainer.style.removeProperty("display");
  }, 300);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function calculateDuration(start, end) {
  if (!start || !end) return "";
  const today = new Date().toISOString().split("T")[0];
  const startDate = new Date(`${today} ${start}`);
  const endDate = new Date(`${today} ${end}`);
  const diff = (endDate - startDate) / 1000 / 60;
  return diff > 0 ? `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}m` : "";
}

function sanitizeNote(note) {
  return note.replace(/[,;\n]/g, "").slice(0, 200);
}

function getStatusInfo(start, end) {
  if (start && end) return { icon: "✅", class: "completed", text: "Completed" };
  if (start && !end) return { icon: "🕒", class: "in-progress", text: "In Progress" };
  return { icon: "", class: "not-started", text: "Not Started" };
}

function renderRoutines() {
  if (!currentUser) return;
  const container = document.getElementById("routinesContainer");
  container.innerHTML = "";
  routines.forEach((r, index) => {
    const card = document.createElement("div");
    card.classList.add("routine-card", "fade-in");
    const log = logs[r.name] || {};
    const start = log.startTime || "";
    const end = log.endTime || "";
    const duration = calculateDuration(start, end);
    const status = getStatusInfo(start, end);
    card.classList.add(status.class);
    let noteInput = "";
    if (r.note) {
      noteInput = `<div class="routine-note">
        <textarea 
          id="note-${index}" 
          placeholder="${r.noteLabel || 'Notes'}"
          onchange="saveNote(${index}, this.value)"
          >${log.note ? log.note : ""}</textarea>
      </div>`;
    }
    card.innerHTML = `
      <div class="routine-name">
        <span class="routine-status">${status.icon}</span>
        ${r.name}
      </div>
      <div class="routine-times">
        <span>Start: ${start || "Not started"}</span>
        <span>End: ${end || "Not ended"}</span>
      </div>
      <div class="routine-duration">Duration: ${duration || "0h 0m"}</div>
      ${noteInput}
      <div class="routine-actions">
        ${start ? "" : `<button onclick="startRoutine(${index})">
          <svg class="icon" viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>
          Start
        </button>`}
        ${start && !end ? `<button onclick="endRoutine(${index})">
          <svg class="icon" viewBox="0 0 24 24"><path d="M18,18H6V6H18V18Z"/></svg>
          End
        </button>` : ""}
        <button onclick="resetEntry(${index})" ${(!start && !end) ? "disabled" : ""}>
          <svg class="icon" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7,9L10,12L7,15V13H5V11H7V9M17,9V11H15V13H17V15L14,12L17,9Z"/></svg>
          Reset
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.startRoutine = function(index) {
  const r = routines[index].name;
  if (!logs[r]) logs[r] = {};
  logs[r].startTime = formatTime(new Date());
  logs[r].endTime = "";
  saveUserData();
  renderRoutines();
};

window.endRoutine = function(index) {
  const r = routines[index].name;
  if (!logs[r] || !logs[r].startTime) return;
  logs[r].endTime = formatTime(new Date());
  saveUserData();
  renderRoutines();
};

window.resetEntry = function(index) {
  const r = routines[index].name;
  logs[r] = {};
  saveUserData();
  renderRoutines();
};

window.saveNote = function(index, note) {
  const r = routines[index].name;
  if (!logs[r]) logs[r] = {};
  logs[r].note = sanitizeNote(note);
  saveUserData();
};

window.toggleTheme = function() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
};

window.resetLogs = function() {
  if (!confirm("Reset all logs for today?")) return;
  logs = {};
  saveUserData();
  renderRoutines();
};

window.exportTodayCSV = function () {
  let rows = [["Routine", "Start Time", "End Time", "Duration", "Note"]];
  routines.forEach((r) => {
    const log = logs[r.name] || {};
    rows.push([
      r.name,
      log.startTime || "",
      log.endTime || "",
      calculateDuration(log.startTime, log.endTime),
      log.note || ""
    ]);
  });

  // Build HTML
  let table = '<table border="1" style="border-collapse:collapse;"><thead><tr>';
  for (let header of rows[0]) table += `<th>${header}</th>`;
  table += "</tr></thead><tbody>";
  for (let i = 1; i < rows.length; i++) {
    table += "<tr>";
    for (let cell of rows[i]) table += `<td>${cell}</td>`;
    table += "</tr>";
  }
  table += "</tbody></table>";

  // Open table in a new window/tab
  const win = window.open("", "_blank");
  win.document.write("<html><head><title>Routine Export</title></head><body>");
  win.document.write("<h2>Today's Routine Log</h2>");
  win.document.write(table);
  win.document.write("</body></html>");
  win.document.close();
};
