const appState = {
  phase: "loading",
  currentTab: "logs",
  selectedDiveId: "54",
  profile: {
    name: "Diver",
    email: "diver@example.com",
    certification: "PADI AOWD",
    homeLocation: "Red Sea",
    avatarUrl: "assets/logo.png",
    bio: "Passionate diver tracking every dive.",
  },
  settings: {
    theme: "light",
    loginHistory: [],
  },
  forumPosts: [
    {
      id: "f1",
      category: "Lokalita",
      location: "Ras Mohammed",
      title: "Nejlepší čas na ranní ponor",
      message: "Doporučuju vstup do vody kolem 8:00, proud je klidnější a viditelnost lepší.",
      author: "Diver",
      createdAt: "2026-03-06T08:15:00.000Z",
    },
    {
      id: "f2",
      category: "Tip",
      location: "Blue Hole, Dahab",
      title: "Kontrola zátěže před sestupem",
      message: "Před každým ponorem otestuj vztlak s téměř prázdnou BCD, ušetří to energii pod vodou.",
      author: "Diver",
      createdAt: "2026-03-05T18:40:00.000Z",
    },
  ],
  forumFilters: {
    category: "all",
    query: "",
  },
  gear: [
    { id: "g1", name: "Scubapro Spectra Mask", category: "Maska", brand: "Scubapro", status: "good", lastService: "2025-08-10", notes: "" },
    { id: "g2", name: "MK25 / A700 Regulátor", category: "Regulátor", brand: "Scubapro", status: "service", lastService: "2024-11-20", notes: "Roční servis přeplánovat." },
    { id: "g3", name: "Hydros Pro BCD", category: "BCD", brand: "Scubapro", status: "good", lastService: "2025-03-01", notes: "" },
    { id: "g4", name: "Galileo G2 Počítač", category: "Počítač", brand: "Scubapro", status: "good", lastService: "2025-01-15", notes: "Firmware aktualizovaný." },
    { id: "g5", name: "Jet Fins", category: "Ploutve", brand: "Mares", status: "good", lastService: "", notes: "" },
  ],
  gearFilter: "all",
  filters: {
    query: "",
    location: "all",
    equipment: "all",
    startDate: "",
    endDate: "",
    types: new Set(["Recreational", "Freediving"]),
  },
};

let osmMap = null;
let osmMarkersLayer = null;
let detailMap = null;
let detailMapMarker = null;
let formPickerMap = null;
let formPickerMarker = null;
let geocodeRequestId = 0;

/* Default map centre (Red Sea / Ras Mohammed area) */
const DEFAULT_MAP_CENTER = [27.73, 34.25];

const STORAGE_KEYS = {
  profile: "ydl.profile",
  settings: "ydl.settings",
  dives: "ydl.dives",
  gear: "ydl.gear",
  forumPosts: "ydl.forumPosts",
};

const dives = [
  {
    id: "54",
    title: "Dive #54 - July 15, 2024",
    date: "2024-07-15",
    time: "09:30 AM",
    location: "Red Sea, Egypt - Ras Mohammed",
    siteName: "Ras Mohammed Reef",
    diveBuddy: "Link to their profile",
    weather: "Calm",
    waterTemperature: "27.0°C",
    current: "25.3 m",
    visibility: "26 %",
    startPressure: "320 kPa",
    endPressure: "250 MPa",
    tankType: "AL80, Steel 12L",
    depth: "25.3m",
    duration: "48 min",
    profilePoints: [
      { time: 0, depth: 0 },
      { time: 4, depth: 8 },
      { time: 10, depth: 20 },
      { time: 28, depth: 22 },
      { time: 34, depth: 5 },
      { time: 38, depth: 5 },
      { time: 48, depth: 0 },
    ],
    coordinates: { lat: 27.7302, lng: 34.2488 },
    gasMix: ["Air", "EANx 32%"],
    equipment: ["Scubapro Spectra Mask", "Jet Fins", "Galileo G2 Počítač", "MK25 / A700 Regulátor"],
    wildlife: ["Coral", "Turtle", "All tags", "Freediving"],
    notes: [
      "Saw a green sea turtle near the wreck!",
      "Excellent visibility around the reef.",
      "Mild current on descent.",
      "Great marine life around the coral wall.",
    ],
    type: "Recreational",
    heroImage:
      "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1520302514090-55d2f9bd53dd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80",
    ],
  },
  {
    id: "53",
    title: "Dive #53 - July 15, 2024",
    date: "2024-07-15",
    time: "08:10 AM",
    location: "Red Sea, Egypt - Ras Mohammed",
    siteName: "Shark Observatory",
    diveBuddy: "Link to their profile",
    weather: "Sunny",
    waterTemperature: "26.7°C",
    current: "22.8 m",
    visibility: "24 %",
    startPressure: "300 kPa",
    endPressure: "230 MPa",
    tankType: "AL80, Steel 12L",
    depth: "24.1m",
    duration: "44 min",
    profilePoints: [
      { time: 0, depth: 0 },
      { time: 5, depth: 10 },
      { time: 14, depth: 19 },
      { time: 24, depth: 20 },
      { time: 30, depth: 7 },
      { time: 35, depth: 7 },
      { time: 44, depth: 0 },
    ],
    coordinates: { lat: 27.7228, lng: 34.2556 },
    gasMix: ["Air"],
    equipment: ["Scubapro Spectra Mask", "Hydros Pro BCD", "Galileo G2 Počítač"],
    wildlife: ["Coral", "Schooling Fish"],
    notes: [
      "Strong fish activity near the drop-off.",
      "Smooth descent and easy navigation.",
    ],
    type: "Recreational",
    heroImage:
      "https://images.unsplash.com/photo-1451245604053-2e0f6f4a5b3d?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1520302514090-55d2f9bd53dd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1525338078858-d762b5e32f2f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=400&q=80",
    ],
  },
  {
    id: "26",
    title: "Dive #26 - July 15, 2024",
    date: "2024-07-15",
    time: "11:20 AM",
    location: "Red Sea, Egypt - Ras Mohammed",
    siteName: "Jolanda Reef",
    diveBuddy: "Link to their profile",
    weather: "Clear",
    waterTemperature: "27.4°C",
    current: "20.6 m",
    visibility: "22 %",
    startPressure: "290 kPa",
    endPressure: "220 MPa",
    tankType: "AL80",
    depth: "20.4m",
    duration: "40 min",
    profilePoints: [
      { time: 0, depth: 0 },
      { time: 4, depth: 7 },
      { time: 12, depth: 16 },
      { time: 24, depth: 18 },
      { time: 30, depth: 6 },
      { time: 34, depth: 6 },
      { time: 40, depth: 0 },
    ],
    coordinates: { lat: 27.7175, lng: 34.2699 },
    gasMix: ["Air", "EANx 30%"],
    equipment: ["Scubapro Spectra Mask", "Jet Fins"],
    wildlife: ["Coral", "Moray Eel"],
    notes: [
      "Great wall section with colorful coral.",
      "Light current and easy return.",
    ],
    type: "Freediving",
    heroImage:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=900&q=80",
    photos: [
      "https://images.unsplash.com/photo-1525338078858-d762b5e32f2f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80",
    ],
  },
];

const dom = {
  screen: document.getElementById("screen"),
  authButtons: document.querySelectorAll("[data-enter-app]"),
  logoutButton: document.getElementById("logoutButton"),
  profileButton: document.getElementById("profileButton"),
  settingsButton: document.getElementById("settingsButton"),
  topAvatarImage: document.getElementById("topAvatarImage"),
  navButtons: document.querySelectorAll("[data-tab]"),
  tabPanes: document.querySelectorAll("[data-tab-content]"),
  diveList: document.getElementById("diveList"),
  noResults: document.getElementById("noResults"),
  searchInput: document.getElementById("searchInput"),
  locationFilter: document.getElementById("locationFilter"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  typeFilters: document.querySelectorAll("[data-type-filter]"),
  detailTitle: document.getElementById("detailTitle"),
  detailSub: document.getElementById("detailSub"),
  newLogButton: document.getElementById("newLogButton"),
  newDiveModal: document.getElementById("newDiveModal"),
  closeNewDiveModal: document.getElementById("closeNewDiveModal"),
  cancelNewDive: document.getElementById("cancelNewDive"),
  newDiveForm: document.getElementById("newDiveForm"),
  formDiveNumber: document.getElementById("formDiveNumber"),
  formDate: document.getElementById("formDate"),
  formTime: document.getElementById("formTime"),
  formType: document.getElementById("formType"),
  formLocation: document.getElementById("formLocation"),
  formSiteName: document.getElementById("formSiteName"),
  formDiveBuddy: document.getElementById("formDiveBuddy"),
  formDepth: document.getElementById("formDepth"),
  formDuration: document.getElementById("formDuration"),
  formProfilePoints: document.getElementById("formProfilePoints"),
  formWaterTemperature: document.getElementById("formWaterTemperature"),
  formVisibility: document.getElementById("formVisibility"),
  formCurrent: document.getElementById("formCurrent"),
  formWeather: document.getElementById("formWeather"),
  formStartPressure: document.getElementById("formStartPressure"),
  formEndPressure: document.getElementById("formEndPressure"),
  formTankType: document.getElementById("formTankType"),
  formGasMix: document.getElementById("formGasMix"),
  formEquipmentGrid: document.getElementById("formEquipmentGrid"),
  formWildlife: document.getElementById("formWildlife"),
  formLatitude: document.getElementById("formLatitude"),
  formLongitude: document.getElementById("formLongitude"),
  formLocationMap: document.getElementById("formLocationMap"),
  formMapHint: document.getElementById("formMapHint"),
  formHeroImage: document.getElementById("formHeroImage"),
  formPhotos: document.getElementById("formPhotos"),
  formNotes: document.getElementById("formNotes"),
  profileModal: document.getElementById("profileModal"),
  closeProfileModal: document.getElementById("closeProfileModal"),
  cancelProfile: document.getElementById("cancelProfile"),
  profileForm: document.getElementById("profileForm"),
  profileName: document.getElementById("profileName"),
  profileEmail: document.getElementById("profileEmail"),
  profileCertification: document.getElementById("profileCertification"),
  profileHomeLocation: document.getElementById("profileHomeLocation"),
  profileAvatarPreview: document.getElementById("profileAvatarPreview"),
  profileAvatarFile: document.getElementById("profileAvatarFile"),
  profileBio: document.getElementById("profileBio"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsModal: document.getElementById("closeSettingsModal"),
  closeSettingsFooter: document.getElementById("closeSettingsFooter"),
  themeSelect: document.getElementById("themeSelect"),
  currentPassword: document.getElementById("currentPassword"),
  newPassword: document.getElementById("newPassword"),
  confirmPassword: document.getElementById("confirmPassword"),
  changePasswordButton: document.getElementById("changePasswordButton"),
  passwordStatus: document.getElementById("passwordStatus"),
  loginHistoryList: document.getElementById("loginHistoryList"),
  heroImage: document.getElementById("heroImage"),
  infoLocation: document.getElementById("infoLocation"),
  infoSiteName: document.getElementById("infoSiteName"),
  infoBuddy: document.getElementById("infoBuddy"),
  infoWeather: document.getElementById("infoWeather"),
  infoTemp: document.getElementById("infoTemp"),
  infoCurrent: document.getElementById("infoCurrent"),
  infoVisibility: document.getElementById("infoVisibility"),
  infoStartPressure: document.getElementById("infoStartPressure"),
  infoEndPressure: document.getElementById("infoEndPressure"),
  infoTankType: document.getElementById("infoTankType"),
  gasMixChips: document.getElementById("gasMixChips"),
  equipmentChips: document.getElementById("equipmentChips"),
  wildlifeChips: document.getElementById("wildlifeChips"),
  notesInput: document.getElementById("notesInput"),
  photos: document.getElementById("photos"),
  statsTotalDives: document.getElementById("statsTotalDives"),
  statsAvgDepth: document.getElementById("statsAvgDepth"),
  statsAvgDuration: document.getElementById("statsAvgDuration"),
  statsTopLocation: document.getElementById("statsTopLocation"),
  statsAirMix: document.getElementById("statsAirMix"),
  statsEanxMix: document.getElementById("statsEanxMix"),
  statsDeepest: document.getElementById("statsDeepest"),
  statsLongest: document.getElementById("statsLongest"),
  statsTotalTime: document.getElementById("statsTotalTime"),
  statsDestinations: document.getElementById("statsDestinations"),
  mapLocations: document.getElementById("mapLocations"),
  osmMap: document.getElementById("osmMap"),
  detailOsmMap: document.getElementById("detailOsmMap"),
  diveProfileSvg: document.getElementById("diveProfileSvg"),
  diveProfileGrid: document.getElementById("diveProfileGrid"),
  diveProfileLine: document.getElementById("diveProfileLine"),
  equipmentSummary: document.getElementById("equipmentSummary"),
  addGearButton: document.getElementById("addGearButton"),
  gearList: document.getElementById("gearList"),
  gearCategoryFilter: document.getElementById("gearCategoryFilter"),
  gearModal: document.getElementById("gearModal"),
  gearModalTitle: document.getElementById("gearModalTitle"),
  closeGearModal: document.getElementById("closeGearModal"),
  cancelGear: document.getElementById("cancelGear"),
  gearForm: document.getElementById("gearForm"),
  gearId: document.getElementById("gearId"),
  gearName: document.getElementById("gearName"),
  gearCategory: document.getElementById("gearCategory"),
  gearBrand: document.getElementById("gearBrand"),
  gearStatus: document.getElementById("gearStatus"),
  gearLastService: document.getElementById("gearLastService"),
  gearNotes: document.getElementById("gearNotes"),
  communityFeed: document.getElementById("communityFeed"),
  forumForm: document.getElementById("forumForm"),
  forumCategory: document.getElementById("forumCategory"),
  forumLocation: document.getElementById("forumLocation"),
  forumTitle: document.getElementById("forumTitle"),
  forumMessage: document.getElementById("forumMessage"),
  forumClear: document.getElementById("forumClear"),
  forumSearch: document.getElementById("forumSearch"),
  forumResetFilters: document.getElementById("forumResetFilters"),
  forumCategoryFilters: document.getElementById("forumCategoryFilters"),
  forumFeed: document.getElementById("forumFeed"),
  copyrightYear: document.getElementById("copyrightYear"),
  lightbox: document.getElementById("lightbox"),
  lightboxImg: document.getElementById("lightboxImg"),
  lightboxCaption: document.getElementById("lightboxCaption"),
  lightboxClose: document.getElementById("lightboxClose"),
  lightboxPrev: document.getElementById("lightboxPrev"),
  lightboxNext: document.getElementById("lightboxNext"),
  toastContainer: document.getElementById("toastContainer"),
  equipmentAlert: document.getElementById("equipmentAlert"),
  equipmentAlertMsg: document.getElementById("equipmentAlertMsg"),
  equipmentAlertGo: document.getElementById("equipmentAlertGo"),
  equipmentAlertDismiss: document.getElementById("equipmentAlertDismiss"),
  editDiveButton: document.getElementById("editDiveButton"),
  deleteDiveButton: document.getElementById("deleteDiveButton"),
  exportDiveButton: document.getElementById("exportDiveButton"),
  exportMenu: document.getElementById("exportMenu"),
  exportCurrentJSON: document.getElementById("exportCurrentJSON"),
  exportAllJSON: document.getElementById("exportAllJSON"),
  exportAllCSV: document.getElementById("exportAllCSV"),
  newDiveModalTitle: document.getElementById("newDiveModalTitle"),
  submitDiveFormBtn: document.getElementById("submitDiveFormBtn"),
};

function setPhase(phase) {
  appState.phase = phase;
  dom.screen.classList.remove("phase-loading", "phase-auth", "phase-app");
  dom.screen.classList.add(`phase-${phase}`);
}

function safeJsonParse(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function loadPersistedState() {
  const storedProfile = safeJsonParse(localStorage.getItem(STORAGE_KEYS.profile));
  if (storedProfile) {
    appState.profile = { ...appState.profile, ...storedProfile };
  }

  const storedSettings = safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings));
  if (storedSettings) {
    appState.settings = {
      ...appState.settings,
      ...storedSettings,
      loginHistory: Array.isArray(storedSettings.loginHistory) ? storedSettings.loginHistory : [],
    };
  }

  const storedDives = safeJsonParse(localStorage.getItem(STORAGE_KEYS.dives));
  if (Array.isArray(storedDives) && storedDives.length > 0) {
    dives.length = 0;
    dives.push(...storedDives);
  }

  const storedGear = safeJsonParse(localStorage.getItem(STORAGE_KEYS.gear));
  if (Array.isArray(storedGear) && storedGear.length > 0) {
    appState.gear = storedGear;
  }

  const storedForumPosts = safeJsonParse(localStorage.getItem(STORAGE_KEYS.forumPosts));
  if (Array.isArray(storedForumPosts)) {
    appState.forumPosts = storedForumPosts;
  }
}

function persistProfile() {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(appState.profile));
}

function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(appState.settings));
}

function persistDives() {
  localStorage.setItem(STORAGE_KEYS.dives, JSON.stringify(dives));
}

function persistGear() {
  localStorage.setItem(STORAGE_KEYS.gear, JSON.stringify(appState.gear));
}

function persistForumPosts() {
  localStorage.setItem(STORAGE_KEYS.forumPosts, JSON.stringify(appState.forumPosts));
}

/* ── Toast notifications ───────────────────────────────────── */
function showToast(message, type = "success", duration = 3000) {
  if (!dom.toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    window.setTimeout(() => toast.remove(), 320);
  }, duration);
}

/* ── Equipment alert banner ────────────────────────────────── */
function renderEquipmentAlert() {
  if (!dom.equipmentAlert) return;
  const problems = appState.gear.filter((g) => g.status === "service" || g.status === "overdue");
  if (!problems.length) {
    dom.equipmentAlert.classList.add("hidden");
    return;
  }
  const overdueCount = problems.filter((g) => g.status === "overdue").length;
  const serviceCount = problems.filter((g) => g.status === "service").length;
  const parts = [];
  if (overdueCount) parts.push(`${overdueCount}× po termínu`);
  if (serviceCount) parts.push(`${serviceCount}× potřebuje servis`);
  dom.equipmentAlertMsg.textContent = `⚠️  Výbava: ${parts.join(" • ")}`;
  dom.equipmentAlert.classList.remove("hidden");
}

/* ── Helper utilities ──────────────────────────────────────── */
function displayTimeToInput(displayTime) {
  const match = String(displayTime).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "09:00";
  let hours = Number.parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function profilePointsToText(points) {
  if (!Array.isArray(points)) return "";
  return points.map((p) => `${p.time},${p.depth}`).join("\n");
}

function downloadFile(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Export functions ──────────────────────────────────────── */
function exportCurrentDiveJSON() {
  const dive = dives.find((d) => d.id === appState.selectedDiveId);
  if (!dive) return;
  downloadFile(`dive-${dive.id}.json`, "application/json", JSON.stringify(dive, null, 2));
  showToast("Ponor exportován jako JSON ✓");
}

function exportAllDivesJSON() {
  downloadFile("yourdivelog-dives.json", "application/json", JSON.stringify(dives, null, 2));
  showToast(`Exportováno ${dives.length} ponorů jako JSON ✓`);
}

function exportAllDivesCSV() {
  const headers = ["ID", "Title", "Date", "Time", "Location", "Site", "Buddy", "Type", "Depth", "Duration", "Weather", "Temperature", "Visibility", "Current", "StartPressure", "EndPressure", "TankType"];
  const rows = dives.map((d) =>
    [d.id, d.title, d.date, d.time, d.location, d.siteName, d.diveBuddy, d.type, d.depth, d.duration, d.weather, d.waterTemperature, d.visibility, d.current, d.startPressure, d.endPressure, d.tankType]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  downloadFile("yourdivelog-dives.csv", "text/csv;charset=utf-8", [headers.join(","), ...rows].join("\n"));
  showToast(`Exportováno ${dives.length} ponorů jako CSV ✓`);
}

/* ── Delete dive ───────────────────────────────────────────── */
function deleteDive(diveId) {
  const index = dives.findIndex((d) => d.id === diveId);
  if (index < 0) return;
  dives.splice(index, 1);
  persistDives();
  appState.selectedDiveId = dives[0]?.id ?? "";
  initLocationOptions();
  syncFilterControls();
  render();
  showToast("Ponor byl smazán");
}

function openConfirmModal(diveId) {
  const modal = document.getElementById("confirmModal");
  if (!modal) { deleteDive(diveId); return; }
  modal.classList.remove("hidden");
  const confirmBtn = document.getElementById("confirmModalConfirm");
  const cancelBtn = document.getElementById("confirmModalCancel");
  const onConfirm = () => {
    modal.classList.add("hidden");
    confirmBtn.removeEventListener("click", onConfirm);
    cancelBtn.removeEventListener("click", onCancel);
    deleteDive(diveId);
  };
  const onCancel = () => {
    modal.classList.add("hidden");
    confirmBtn.removeEventListener("click", onConfirm);
    cancelBtn.removeEventListener("click", onCancel);
  };
  confirmBtn.addEventListener("click", onConfirm);
  cancelBtn.addEventListener("click", onCancel);
}

/* ── Dive detail action buttons ────────────────────────────── */
function bindDiveDetailActions() {
  if (dom.editDiveButton) {
    dom.editDiveButton.addEventListener("click", () => {
      if (appState.selectedDiveId) openNewDiveModal(appState.selectedDiveId);
    });
  }

  if (dom.deleteDiveButton) {
    dom.deleteDiveButton.addEventListener("click", () => {
      if (appState.selectedDiveId) openConfirmModal(appState.selectedDiveId);
    });
  }

  if (dom.exportDiveButton && dom.exportMenu) {
    dom.exportDiveButton.addEventListener("click", (e) => {
      e.stopPropagation();
      dom.exportMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
      dom.exportMenu?.classList.add("hidden");
    });
  }

  if (dom.exportCurrentJSON) {
    dom.exportCurrentJSON.addEventListener("click", (e) => {
      e.stopPropagation();
      exportCurrentDiveJSON();
      dom.exportMenu.classList.add("hidden");
    });
  }

  if (dom.exportAllJSON) {
    dom.exportAllJSON.addEventListener("click", (e) => {
      e.stopPropagation();
      exportAllDivesJSON();
      dom.exportMenu.classList.add("hidden");
    });
  }

  if (dom.exportAllCSV) {
    dom.exportAllCSV.addEventListener("click", (e) => {
      e.stopPropagation();
      exportAllDivesCSV();
      dom.exportMenu.classList.add("hidden");
    });
  }

  if (dom.equipmentAlertGo) {
    dom.equipmentAlertGo.addEventListener("click", () => setCurrentTab("equipment"));
  }

  const importInput = document.getElementById("importDivesInput");
  if (importInput) {
    importInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const imported = Array.isArray(parsed) ? parsed : [parsed];
          if (!imported.length) { showToast("Soubor neobsahuje žádné ponory", "error"); return; }
          let added = 0;
          for (const d of imported) {
            if (d.id && !dives.some((x) => x.id === d.id)) { dives.push(d); added++; }
          }
          persistDives();
          initLocationOptions();
          syncFilterControls();
          render();
          showToast(`Importováno ${added} nových ponorů ✓`);
        } catch {
          showToast("Chyba: neplatný JSON soubor", "error");
        }
      };
      reader.readAsText(file);
      importInput.value = "";
    });
  }

  if (dom.equipmentAlertDismiss) {
    dom.equipmentAlertDismiss.addEventListener("click", () =>
      dom.equipmentAlert.classList.add("hidden")
    );
  }
}

/* ── Keyboard navigation (1–6 = tabs) ─────────────────────── */
function bindKeyboardNav() {
  const tabMap = {
    "1": "logs",
    "2": "statistics",
    "3": "map",
    "4": "equipment",
    "5": "community",
    "6": "forum",
  };
  document.addEventListener("keydown", (event) => {
    if (appState.phase !== "app") return;
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (dom.newDiveModal && !dom.newDiveModal.classList.contains("hidden")) return;
    if (tabMap[event.key]) {
      event.preventDefault();
      setCurrentTab(tabMap[event.key]);
    }
  });
}

function applyTheme(theme) {
  appState.settings.theme = theme;
  document.body.classList.toggle("theme-dark", theme === "dark");
  if (dom.themeSelect) {
    dom.themeSelect.value = theme;
  }
  persistSettings();
}

function renderTopProfile() {
  dom.topAvatarImage.src = appState.profile.avatarUrl;
  dom.topAvatarImage.alt = `${appState.profile.name} avatar`;
}

function openProfileModal() {
  dom.profileName.value = appState.profile.name;
  dom.profileEmail.value = appState.profile.email;
  dom.profileCertification.value = appState.profile.certification;
  dom.profileHomeLocation.value = appState.profile.homeLocation;
  dom.profileAvatarPreview.src = appState.profile.avatarUrl;
  dom.profileAvatarFile.value = "";
  dom.profileBio.value = appState.profile.bio;
  dom.profileModal.classList.remove("hidden");
}

function closeProfileModal() {
  dom.profileModal.classList.add("hidden");
}

function addLoginHistoryEntry(actionLabel) {
  const timestamp = new Date().toLocaleString("cs-CZ");
  appState.settings.loginHistory.unshift(`${timestamp} — ${actionLabel}`);
  appState.settings.loginHistory = appState.settings.loginHistory.slice(0, 20);
  persistSettings();
}

function renderLoginHistory() {
  if (!appState.settings.loginHistory.length) {
    dom.loginHistoryList.innerHTML = '<p class="empty">No login history yet.</p>';
    return;
  }

  dom.loginHistoryList.innerHTML = appState.settings.loginHistory
    .map((entry) => `<article class="stack-item">${entry}</article>`)
    .join("");
}

function openSettingsModal() {
  dom.themeSelect.value = appState.settings.theme;
  dom.currentPassword.value = "";
  dom.newPassword.value = "";
  dom.confirmPassword.value = "";
  dom.passwordStatus.textContent = "";
  renderLoginHistory();
  dom.settingsModal.classList.remove("hidden");
}

function closeSettingsModal() {
  dom.settingsModal.classList.add("hidden");
}

function uniqueLocations() {
  return [...new Set(dives.map((dive) => dive.location))];
}

function initLocationOptions() {
  dom.locationFilter.innerHTML = '<option value="all">All locations</option>';

  const locations = uniqueLocations();
  for (const location of locations) {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    dom.locationFilter.appendChild(option);
  }
}

function normalizeCommaList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProfilePointsInput(value) {
  const points = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [timeRaw, depthRaw] = line.split(",").map((part) => part.trim());
      return {
        time: Number.parseFloat(timeRaw),
        depth: Number.parseFloat(depthRaw),
      };
    })
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.depth))
    .sort((a, b) => a.time - b.time);

  if (points.length < 2) {
    throw new Error("Invalid profile points");
  }

  return points;
}

function nextDiveId() {
  const max = dives.reduce((maxValue, dive) => {
    const parsed = Number.parseInt(dive.id, 10);
    return Number.isNaN(parsed) ? maxValue : Math.max(maxValue, parsed);
  }, 0);

  return String(max + 1);
}

function formatDateForTitle(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeForDisplay(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeString;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHour = hours % 12 || 12;
  return `${String(adjustedHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function openNewDiveModal(diveId = null) {
  const editDive = diveId ? dives.find((d) => d.id === String(diveId)) : null;
  dom.newDiveForm.reset();
  initFormPickerMap();
  dom.formMapHint.textContent = "Klikni do mapy pro automatické vyplnění pozice.";

  if (editDive) {
    if (dom.newDiveModalTitle) dom.newDiveModalTitle.textContent = "Upravit ponor";
    if (dom.submitDiveFormBtn) dom.submitDiveFormBtn.textContent = "Uložit změny";
    dom.formDiveNumber.value = editDive.id;
    dom.formDate.value = editDive.date;
    dom.formTime.value = displayTimeToInput(editDive.time);
    dom.formType.value = editDive.type;
    dom.formLocation.value = editDive.location;
    dom.formSiteName.value = editDive.siteName;
    dom.formDiveBuddy.value = editDive.diveBuddy;
    dom.formDepth.value = Number.parseFloat(editDive.depth);
    dom.formDuration.value = Number.parseInt(editDive.duration);
    dom.formProfilePoints.value = profilePointsToText(editDive.profilePoints);
    dom.formWaterTemperature.value = Number.parseFloat(editDive.waterTemperature);
    dom.formVisibility.value = Number.parseInt(editDive.visibility);
    dom.formCurrent.value = Number.parseFloat(editDive.current);
    dom.formWeather.value = editDive.weather;
    dom.formStartPressure.value = editDive.startPressure;
    dom.formEndPressure.value = editDive.endPressure;
    dom.formTankType.value = editDive.tankType;
    dom.formGasMix.value = editDive.gasMix.join(", ");
    dom.formWildlife.value = editDive.wildlife.join(", ");
    dom.formLatitude.value = editDive.coordinates?.lat ?? "";
    dom.formLongitude.value = editDive.coordinates?.lng ?? "";
    dom.formHeroImage.value = editDive.heroImage;
    dom.formPhotos.value = editDive.photos.join(", ");
    dom.formNotes.value = Array.isArray(editDive.notes) ? editDive.notes.join("\n") : (editDive.notes ?? "");
    renderFormEquipmentGrid(editDive.equipment);
    if (editDive.coordinates) {
      setFormPickerMarker(editDive.coordinates.lat, editDive.coordinates.lng);
    }
  } else {
    if (dom.newDiveModalTitle) dom.newDiveModalTitle.textContent = "New Dive Log";
    if (dom.submitDiveFormBtn) dom.submitDiveFormBtn.textContent = "Create Dive Log";
    dom.formDiveNumber.value = nextDiveId();
    dom.formType.value = "";
    renderFormEquipmentGrid([]);
    if (formPickerMap) {
      if (formPickerMarker) {
        formPickerMap.removeLayer(formPickerMarker);
        formPickerMarker = null;
      }
      formPickerMap.setView(DEFAULT_MAP_CENTER, 10);
    }
  }

  dom.newDiveModal.classList.remove("hidden");
  if (formPickerMap) {
    window.setTimeout(() => {
      formPickerMap.invalidateSize();
    }, 40);
  }
}

function closeNewDiveModal() {
  dom.newDiveModal.classList.add("hidden");
}

function createDiveFromForm() {
  const id = String(dom.formDiveNumber.value).trim();
  const date = dom.formDate.value;
  const time = dom.formTime.value;
  const location = dom.formLocation.value.trim();
  const siteName = dom.formSiteName.value.trim();
  const diveBuddy = dom.formDiveBuddy.value.trim();
  const depth = Number.parseFloat(dom.formDepth.value);
  const duration = Number.parseInt(dom.formDuration.value, 10);
  const profilePoints = parseProfilePointsInput(dom.formProfilePoints.value);
  const waterTemperature = Number.parseFloat(dom.formWaterTemperature.value);
  const visibility = Number.parseInt(dom.formVisibility.value, 10);
  const current = Number.parseFloat(dom.formCurrent.value);
  const weather = dom.formWeather.value.trim();
  const startPressure = dom.formStartPressure.value.trim();
  const endPressure = dom.formEndPressure.value.trim();
  const tankType = dom.formTankType.value.trim();
  const gasMix = normalizeCommaList(dom.formGasMix.value);
  const equipment = dom.formEquipmentGrid
    ? [...dom.formEquipmentGrid.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value)
    : [];
  const wildlife = normalizeCommaList(dom.formWildlife.value);
  const latitude = Number.parseFloat(dom.formLatitude.value);
  const longitude = Number.parseFloat(dom.formLongitude.value);
  const heroImage = dom.formHeroImage.value.trim();
  const photos = normalizeCommaList(dom.formPhotos.value);
  const notes = dom.formNotes.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    id,
    title: `Dive #${id} - ${formatDateForTitle(date)}`,
    date,
    time: formatTimeForDisplay(time),
    location,
    siteName,
    diveBuddy,
    weather,
    waterTemperature: `${waterTemperature.toFixed(1)}°C`,
    current: `${current.toFixed(1)} m`,
    visibility: `${visibility} %`,
    startPressure,
    endPressure,
    tankType,
    depth: `${depth.toFixed(1)}m`,
    duration: `${duration} min`,
    profilePoints,
    coordinates: { lat: latitude, lng: longitude },
    gasMix,
    equipment,
    wildlife,
    notes,
    type: dom.formType.value,
    heroImage,
    photos,
  };
}

function createChips(values) {
  return values.map((value) => `<span class="chip">${value}</span>`).join("");
}

function createEquipmentChips(equipment) {
  const gearNames = new Set(appState.gear.map(g => g.name));
  return equipment.map(name => {
    const known = gearNames.has(name);
    return known
      ? `<span class="chip chip-gear" data-gear-name="${escapeHtml(name)}" title="Zobrazit v Equipment" tabindex="0">${escapeHtml(name)} <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style="vertical-align:middle;opacity:.6"><path d="M2 2h3M2 2v7h7V6M6 2h4v4M6 6l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
      : `<span class="chip">${escapeHtml(name)}</span>`;
  }).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatNumber(value, digits = 1) {
  return Number.parseFloat(value).toFixed(digits);
}

function depthToMeters(depth) {
  return Number.parseFloat(depth.replace("m", ""));
}

function durationToMinutes(duration) {
  return Number.parseFloat(duration.replace("min", ""));
}

function initOsmMap() {
  if (!dom.osmMap || typeof window.L === "undefined" || osmMap) {
    return;
  }

  osmMap = window.L.map(dom.osmMap, {
    center: DEFAULT_MAP_CENTER,
    zoom: 10,
    zoomControl: true,
  });

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(osmMap);

  osmMarkersLayer = (typeof window.L.markerClusterGroup !== "undefined")
    ? window.L.markerClusterGroup({ maxClusterRadius: 50 })
    : window.L.layerGroup();
  osmMarkersLayer.addTo(osmMap);
}

function initDetailMap() {
  if (!dom.detailOsmMap || typeof window.L === "undefined" || detailMap) {
    return;
  }

  detailMap = window.L.map(dom.detailOsmMap, {
    center: DEFAULT_MAP_CENTER,
    zoom: 11,
    zoomControl: false,
    attributionControl: false,
  });

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(detailMap);
}

function initFormPickerMap() {
  if (!dom.formLocationMap || typeof window.L === "undefined" || formPickerMap) {
    return;
  }

  formPickerMap = window.L.map(dom.formLocationMap, {
    center: DEFAULT_MAP_CENTER,
    zoom: 10,
    zoomControl: true,
  });

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(formPickerMap);

  formPickerMap.on("click", (event) => {
    setFormCoordinates(event.latlng.lat, event.latlng.lng, true);
  });
}

function setFormPickerMarker(lat, lng) {
  if (!formPickerMap) {
    return;
  }

  if (!formPickerMarker) {
    formPickerMarker = window.L.marker([lat, lng]).addTo(formPickerMap);
  } else {
    formPickerMarker.setLatLng([lat, lng]);
  }

  formPickerMap.setView([lat, lng], 12);
}

async function reverseGeocodeCoordinates(lat, lng) {
  const requestId = ++geocodeRequestId;
  dom.formMapHint.textContent = "Načítám název lokality...";

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    if (requestId !== geocodeRequestId) {
      return;
    }

    const locationName = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    dom.formLocation.value = locationName;
    dom.formMapHint.textContent = "Lokalita byla doplněna z mapy.";
  } catch {
    if (requestId !== geocodeRequestId) {
      return;
    }

    dom.formMapHint.textContent = "Nepodařilo se načíst název lokality, souřadnice jsou vyplněné.";
  }
}

function setFormCoordinates(lat, lng, lookupLocation = false) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return;
  }

  dom.formLatitude.value = lat.toFixed(6);
  dom.formLongitude.value = lng.toFixed(6);
  setFormPickerMarker(lat, lng);

  if (lookupLocation) {
    reverseGeocodeCoordinates(lat, lng);
  }
}

function syncFormMapFromInputs(lookupLocation = false) {
  const lat = Number.parseFloat(dom.formLatitude.value);
  const lng = Number.parseFloat(dom.formLongitude.value);
  setFormCoordinates(lat, lng, lookupLocation);
}

function renderDetailMap(dive) {
  initDetailMap();

  if (!detailMap || !dive?.coordinates) {
    return;
  }

  const { lat, lng } = dive.coordinates;

  if (!detailMapMarker) {
    detailMapMarker = window.L.marker([lat, lng]).addTo(detailMap);
  } else {
    detailMapMarker.setLatLng([lat, lng]);
  }

  detailMap.setView([lat, lng], 12);

  window.setTimeout(() => {
    detailMap.invalidateSize();
  }, 30);
}

function renderOsmMarkers(filteredDives) {
  if (!osmMap || !osmMarkersLayer) {
    return;
  }

  osmMarkersLayer.clearLayers();

  const divesWithCoordinates = filteredDives.filter((dive) => dive.coordinates);
  if (divesWithCoordinates.length === 0) {
    osmMap.setView(DEFAULT_MAP_CENTER, 10);
    return;
  }

  const bounds = [];

  for (const dive of divesWithCoordinates) {
    const { lat, lng } = dive.coordinates;
    bounds.push([lat, lng]);

    const marker = window.L.marker([lat, lng]).addTo(osmMarkersLayer);
    marker.bindPopup(
      `<strong>${dive.title}</strong><br/>${dive.location}<br/>Depth: ${dive.depth} • ${dive.duration}`
    );

    marker.on("click", () => {
      appState.selectedDiveId = dive.id;
      setCurrentTab("logs");
      render();
    });
  }

  if (bounds.length === 1) {
    osmMap.setView(bounds[0], 12);
  } else {
    osmMap.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
  }
}

function passesDateFilter(diveDate, startDate, endDate) {
  if (startDate && diveDate < startDate) {
    return false;
  }

  if (endDate && diveDate > endDate) {
    return false;
  }

  return true;
}

function getFilteredDives() {
  const query = appState.filters.query.trim().toLowerCase();
  const { location, equipment, startDate, endDate, types } = appState.filters;

  return dives.filter((dive) => {
    const matchesQuery =
      !query ||
      dive.title.toLowerCase().includes(query) ||
      dive.location.toLowerCase().includes(query) ||
      dive.siteName.toLowerCase().includes(query);

    const matchesLocation = location === "all" || dive.location === location;
    const matchesEquipment = equipment === "all" || dive.equipment.includes(equipment);
    const matchesDate = passesDateFilter(dive.date, startDate, endDate);
    const matchesType = types.size === 0 || types.has(dive.type);

    return matchesQuery && matchesLocation && matchesEquipment && matchesDate && matchesType;
  });
}

function syncFilterControls() {
  dom.locationFilter.value = appState.filters.location;
}

function findSelectedDive(filteredDives) {
  const selected = filteredDives.find((dive) => dive.id === appState.selectedDiveId);
  if (selected) {
    return selected;
  }

  return filteredDives[0] ?? null;
}

function diveCardTemplate(dive, isActive) {
  return `
    <button class="list-card ${isActive ? "active" : ""}" data-dive-id="${dive.id}">
      <p class="list-title">${dive.title}</p>
      <p class="list-line"><span>📍 ${dive.location}</span></p>
      <p class="list-line"><span>⇩ ${dive.depth}</span><span>◷ ${dive.duration}</span></p>
    </button>
  `;
}

function renderDiveList(filteredDives) {
  const selectedDive = findSelectedDive(filteredDives);

  if (!selectedDive) {
    appState.selectedDiveId = "";
    dom.diveList.innerHTML = "";
    dom.noResults.classList.remove("hidden");
    return;
  }

  appState.selectedDiveId = selectedDive.id;
  dom.noResults.classList.add("hidden");

  dom.diveList.innerHTML = filteredDives
    .map((dive) => diveCardTemplate(dive, dive.id === selectedDive.id))
    .join("");
}

function applyImageFallback(imageElement) {
  imageElement.addEventListener(
    "error",
    () => {
      imageElement.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23369bd2'/%3E%3Cstop offset='100%25' stop-color='%230a3f66'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='300' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' fill='white' font-size='28' text-anchor='middle' dominant-baseline='middle' font-family='Segoe UI'%3EYourDiveLog Dive Photo%3C/text%3E%3C/svg%3E";
    },
    { once: true }
  );
}

function renderPhotos(photos) {
  dom.photos.innerHTML = photos
    .map(
      (photo, index) =>
        `<img src="${photo}" alt="Dive photo ${index + 1}" loading="lazy" referrerpolicy="no-referrer" data-photo-index="${index}" />`
    )
    .join("");

  const photoImages = dom.photos.querySelectorAll("img");
  photoImages.forEach((image) => applyImageFallback(image));

  dom.photos.addEventListener("click", (event) => {
    const target = event.target.closest("[data-photo-index]");
    if (!target) return;
    openLightbox(photos, Number(target.dataset.photoIndex));
  });
}

/* ── Lightbox ── */
const lightboxState = { photos: [], currentIndex: 0 };

function openLightbox(photos, index) {
  lightboxState.photos = photos;
  lightboxState.currentIndex = index;
  showLightboxPhoto();
  dom.lightbox.classList.remove("hidden");
}

function closeLightbox() {
  dom.lightbox.classList.add("hidden");
  dom.lightboxImg.src = "";
}

function showLightboxPhoto() {
  const { photos, currentIndex } = lightboxState;
  const total = photos.length;
  const src = photos[currentIndex];

  dom.lightboxImg.src = src;
  dom.lightboxImg.alt = `Dive photo ${currentIndex + 1}`;
  dom.lightboxCaption.textContent = `${currentIndex + 1} / ${total}`;
  dom.lightboxPrev.disabled = currentIndex === 0;
  dom.lightboxNext.disabled = currentIndex === total - 1;
}

function bindLightboxEvents() {
  dom.lightboxClose.addEventListener("click", closeLightbox);

  dom.lightbox.addEventListener("click", (event) => {
    if (event.target === dom.lightbox) closeLightbox();
  });

  dom.lightboxPrev.addEventListener("click", () => {
    if (lightboxState.currentIndex > 0) {
      lightboxState.currentIndex--;
      showLightboxPhoto();
    }
  });

  dom.lightboxNext.addEventListener("click", () => {
    if (lightboxState.currentIndex < lightboxState.photos.length - 1) {
      lightboxState.currentIndex++;
      showLightboxPhoto();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (dom.lightbox.classList.contains("hidden")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft" && lightboxState.currentIndex > 0) {
      lightboxState.currentIndex--;
      showLightboxPhoto();
    }
    if (event.key === "ArrowRight" && lightboxState.currentIndex < lightboxState.photos.length - 1) {
      lightboxState.currentIndex++;
      showLightboxPhoto();
    }
  });
}

function renderDiveProfile(dive) {
  if (!dom.diveProfileGrid || !dom.diveProfileLine) {
    return;
  }

  const points = Array.isArray(dive?.profilePoints) ? dive.profilePoints : [];
  if (points.length < 2) {
    dom.diveProfileGrid.innerHTML = "";
    dom.diveProfileLine.setAttribute("points", "");
    return;
  }

  const maxTimeRaw = Math.max(...points.map((point) => point.time), 1);
  const maxDepthRaw = Math.max(...points.map((point) => point.depth), 1);
  const maxTime = Math.ceil(maxTimeRaw / 5) * 5;
  const maxDepth = Math.ceil(maxDepthRaw / 5) * 5;

  const left = 14;
  const right = 96;
  const top = 6;
  const bottom = 52;
  const width = right - left;
  const height = bottom - top;

  const linePoints = points
    .map((point) => {
      const x = left + (point.time / maxTime) * width;
      const y = top + (point.depth / maxDepth) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const yGridAndTicks = [];
  for (let depthValue = 0; depthValue <= maxDepth; depthValue += 5) {
    const y = top + (depthValue / maxDepth) * height;
    yGridAndTicks.push(
      `<line x1="${left}" y1="${y.toFixed(1)}" x2="${right}" y2="${y.toFixed(1)}" stroke="#9fb7c8" stroke-width="0.4" />`
    );
    yGridAndTicks.push(
      `<line x1="${(left - 1.9).toFixed(1)}" y1="${y.toFixed(1)}" x2="${left}" y2="${y.toFixed(1)}" stroke="#5b7386" stroke-width="0.6" />`
    );
    yGridAndTicks.push(
      `<text x="${(left - 2.8).toFixed(1)}" y="${(y + 1.4).toFixed(1)}" text-anchor="end" font-size="3.2" fill="#355268">${depthValue}</text>`
    );
  }

  const xGridAndTicks = [];
  for (let timeValue = 0; timeValue <= maxTime; timeValue += 5) {
    const x = left + (timeValue / maxTime) * width;
    xGridAndTicks.push(
      `<line x1="${x.toFixed(1)}" y1="${top}" x2="${x.toFixed(1)}" y2="${bottom}" stroke="#9fb7c8" stroke-width="0.4" />`
    );
    xGridAndTicks.push(
      `<line x1="${x.toFixed(1)}" y1="${bottom}" x2="${x.toFixed(1)}" y2="${(bottom + 2).toFixed(1)}" stroke="#5b7386" stroke-width="0.6" />`
    );
    xGridAndTicks.push(
      `<text x="${x.toFixed(1)}" y="${(bottom + 6).toFixed(1)}" text-anchor="middle" font-size="3.2" fill="#355268">${timeValue}</text>`
    );
  }

  dom.diveProfileGrid.innerHTML = `
    <rect x="${left}" y="${top}" width="${width}" height="${height}" fill="none" stroke="#7f9cb0" stroke-width="0.6" />
    ${yGridAndTicks.join("")}
    ${xGridAndTicks.join("")}
    <text x="2.2" y="${(top + 1.5).toFixed(1)}" font-size="3.2" fill="#355268">m</text>
    <text x="${(right - 0.5).toFixed(1)}" y="${(bottom + 9).toFixed(1)}" text-anchor="end" font-size="3.2" fill="#355268">min</text>
  `;
  dom.diveProfileLine.setAttribute("points", linePoints);
  dom.diveProfileLine.setAttribute("stroke-width", "1.9");
}

function renderDiveDetail(dive) {
  if (!dive) {
    dom.detailTitle.textContent = "No dives match this filter";
    dom.detailSub.textContent = "Adjust search or filters to continue.";
    dom.heroImage.removeAttribute("src");
    dom.notesInput.value = "";
    dom.notesInput.disabled = true;
    dom.gasMixChips.innerHTML = "";
    dom.equipmentChips.innerHTML = "";
    dom.wildlifeChips.innerHTML = "";
    dom.photos.innerHTML = "";
    renderDiveProfile(null);
    return;
  }

  dom.notesInput.disabled = false;

  dom.detailTitle.textContent = dive.title;
  dom.detailSub.textContent = `◷ ${dive.time} • 📍 ${dive.location}`;
  dom.heroImage.src = dive.heroImage;
  dom.heroImage.alt = `${dive.siteName} dive`;
  applyImageFallback(dom.heroImage);

  dom.infoLocation.textContent = dive.location;
  dom.infoSiteName.textContent = dive.siteName;
  dom.infoBuddy.textContent = dive.diveBuddy;
  dom.infoWeather.textContent = dive.weather;
  dom.infoTemp.textContent = dive.waterTemperature;
  dom.infoCurrent.textContent = dive.current;
  dom.infoVisibility.textContent = dive.visibility;
  dom.infoStartPressure.textContent = dive.startPressure;
  dom.infoEndPressure.textContent = dive.endPressure;
  dom.infoTankType.textContent = dive.tankType;

  dom.gasMixChips.innerHTML = createChips(dive.gasMix);
  dom.equipmentChips.innerHTML = createEquipmentChips(dive.equipment);
  // Wire up gear chip clicks to jump to Equipment tab
  dom.equipmentChips.querySelectorAll('.chip-gear').forEach(chip => {
    chip.addEventListener('click', () => setCurrentTab('equipment'));
    chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') setCurrentTab('equipment'); });
  });
  dom.wildlifeChips.innerHTML = createChips(dive.wildlife);

  dom.notesInput.value = Array.isArray(dive.notes) ? dive.notes.join("\n") : "";
  renderPhotos(dive.photos);
  renderDiveProfile(dive);
  renderDetailMap(dive);
}

function renderStatistics(filteredDives) {
  if (filteredDives.length === 0) {
    dom.statsTotalDives.textContent = "0";
    dom.statsAvgDepth.textContent = "0 m";
    dom.statsAvgDuration.textContent = "0 min";
    dom.statsTopLocation.textContent = "-";
    dom.statsAirMix.textContent = "0";
    dom.statsEanxMix.textContent = "0";
    if (dom.statsDeepest) dom.statsDeepest.textContent = "0 m";
    if (dom.statsLongest) dom.statsLongest.textContent = "0 min";
    if (dom.statsTotalTime) dom.statsTotalTime.textContent = "0 h";
    if (dom.statsDestinations) dom.statsDestinations.textContent = "0";
    return;
  }

  const depthSum = filteredDives.reduce((total, dive) => total + depthToMeters(dive.depth), 0);
  const durationSum = filteredDives.reduce((total, dive) => total + durationToMinutes(dive.duration), 0);

  const locationCounts = filteredDives.reduce((counts, dive) => {
    counts[dive.location] = (counts[dive.location] ?? 0) + 1;
    return counts;
  }, {});

  const [topLocation, topLocationCount] = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];

  const airMixCount = filteredDives.filter((dive) =>
    dive.gasMix.some((mix) => mix.toLowerCase().includes("air"))
  ).length;
  const eanxCount = filteredDives.filter((dive) =>
    dive.gasMix.some((mix) => mix.toLowerCase().includes("eanx"))
  ).length;

  dom.statsTotalDives.textContent = String(filteredDives.length);
  dom.statsAvgDepth.textContent = `${formatNumber(depthSum / filteredDives.length)} m`;
  dom.statsAvgDuration.textContent = `${Math.round(durationSum / filteredDives.length)} min`;
  dom.statsTopLocation.textContent = `${topLocation} (${topLocationCount})`;
  dom.statsAirMix.textContent = String(airMixCount);
  dom.statsEanxMix.textContent = String(eanxCount);

  const deepest = Math.max(...filteredDives.map((d) => depthToMeters(d.depth)));
  const longest = Math.max(...filteredDives.map((d) => durationToMinutes(d.duration)));
  const totalHours = (durationSum / 60).toFixed(1);
  const destinationsCount = Object.keys(locationCounts).length;
  if (dom.statsDeepest) dom.statsDeepest.textContent = `${formatNumber(deepest)} m`;
  if (dom.statsLongest) dom.statsLongest.textContent = `${longest} min`;
  if (dom.statsTotalTime) dom.statsTotalTime.textContent = `${totalHours} h`;
  if (dom.statsDestinations) dom.statsDestinations.textContent = String(destinationsCount);
}

function renderMapTab(filteredDives) {
  initOsmMap();
  renderOsmMarkers(filteredDives);

  if (filteredDives.length === 0) {
    dom.mapLocations.innerHTML = '<p class="empty">No locations available for current filters.</p>';
    return;
  }

  const locationCounts = filteredDives.reduce((counts, dive) => {
    counts[dive.location] = (counts[dive.location] ?? 0) + 1;
    return counts;
  }, {});

  dom.mapLocations.innerHTML = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([location, count]) => {
      const isActive = appState.filters.location === location;
      return `<button class="stack-item filter-btn ${isActive ? "active" : ""}" type="button" data-location-filter="${location}">📍 ${location} — ${count} dive(s)</button>`;
    })
    .join("");
}

function renderEquipmentTab(filteredDives) {
  /* ── Usage panel (right) ── */
  if (filteredDives.length === 0) {
    dom.equipmentSummary.innerHTML = '<p class="empty">Žádné ponory pro aktuální filtr.</p>';
  } else {
    const equipmentCounts = filteredDives.reduce((counts, dive) => {
      dive.equipment.forEach((item) => {
        counts[item] = (counts[item] ?? 0) + 1;
      });
      return counts;
    }, {});

    dom.equipmentSummary.innerHTML = Object.entries(equipmentCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([item, count]) => {
        const isActive = appState.filters.equipment === item;
        return `<button class="stack-item filter-btn ${isActive ? "active" : ""}" type="button" data-equipment-filter="${item}">🤿 ${escapeHtml(item)} <strong>(${count} ponorů)</strong></button>`;
      })
      .join("");
  }

  /* ── Inventory panel (left) ── */
  renderGearInventory();
}

const GEAR_STATUS_LABEL = { good: "Dobrý stav", service: "Servis", overdue: "Po termínu" };

function renderFormEquipmentGrid(selected = []) {
  if (!dom.formEquipmentGrid) return;
  if (!appState.gear.length) {
    dom.formEquipmentGrid.innerHTML =
      '<p class="form-field-hint" style="margin:0">Žádná výbava v inventáři. Přidejte ji v záložce <strong>Equipment</strong>.</p>';
    return;
  }

  // Group gear by category for a nicer layout
  const categories = [...new Set(appState.gear.map((g) => g.category))].sort();
  const selectedSet = new Set(selected);

  dom.formEquipmentGrid.innerHTML = categories.map(cat => {
    const items = appState.gear.filter(g => g.category === cat);
    return `<div class="gear-check-category">
      <span class="gear-check-cat-label">${escapeHtml(cat)}</span>
      ${items.map(gear => {
        const checked = selectedSet.has(gear.name) ? 'checked' : '';
        const statusClass = gear.status === 'overdue' ? 'overdue' : gear.status === 'service' ? 'service' : '';
        return `<label class="gear-check-item${statusClass ? ` gear-check-${statusClass}` : ''}">
          <input type="checkbox" value="${escapeHtml(gear.name)}" ${checked} />
          <span class="gear-check-name">${escapeHtml(gear.name)}</span>
        </label>`;
      }).join('')}
    </div>`;
  }).join('');
}

function renderGearInventory() {
  if (!dom.gearList || !dom.gearCategoryFilter) return;

  const categories = [...new Set(appState.gear.map((g) => g.category))].sort();

  const catButtons = [
    `<button class="forum-category-btn ${appState.gearFilter === "all" ? "active" : ""}" type="button" data-gear-cat="all">Vše (${appState.gear.length})</button>`,
    ...categories.map((cat) => {
      const cnt = appState.gear.filter((g) => g.category === cat).length;
      return `<button class="forum-category-btn ${appState.gearFilter === cat ? "active" : ""}" type="button" data-gear-cat="${escapeHtml(cat)}">${escapeHtml(cat)} (${cnt})</button>`;
    }),
  ];
  dom.gearCategoryFilter.innerHTML = catButtons.join("");

  const filtered = appState.gearFilter === "all"
    ? appState.gear
    : appState.gear.filter((g) => g.category === appState.gearFilter);

  if (!filtered.length) {
    dom.gearList.innerHTML = '<p class="empty">Žádná výbava v této kategorii.</p>';
    return;
  }

  dom.gearList.innerHTML = filtered
    .map((gear) => {
      const statusLabel = GEAR_STATUS_LABEL[gear.status] ?? gear.status;
      const serviceText = gear.lastService
        ? `Servis: ${gear.lastService}`
        : "Servis: nezaznamenán";
      return `
        <article class="gear-card">
          <div class="gear-card-badges">
            <span class="gear-category-badge">${escapeHtml(gear.category)}</span>
            <span class="gear-status-badge status-${escapeHtml(gear.status)}">${escapeHtml(statusLabel)}</span>
          </div>
          <p class="gear-name">${escapeHtml(gear.name)}</p>
          ${gear.brand ? `<p class="gear-brand">${escapeHtml(gear.brand)}</p>` : ""}
          <p class="gear-service-date">🔧 ${escapeHtml(serviceText)}</p>
          ${gear.notes ? `<p class="gear-notes-text">${escapeHtml(gear.notes)}</p>` : ""}
          <div class="gear-card-actions">
            <button class="btn-ghost" type="button" data-edit-gear="${escapeHtml(gear.id)}">Upravit</button>
            <button class="btn-ghost danger" type="button" data-delete-gear="${escapeHtml(gear.id)}">Smazat</button>
          </div>
        </article>`;
    })
    .join("");
}

function openGearModal(gearId) {
  if (gearId) {
    const gear = appState.gear.find((g) => g.id === gearId);
    if (!gear) return;
    dom.gearModalTitle.textContent = "Upravit výbavu";
    dom.gearId.value = gear.id;
    dom.gearName.value = gear.name;
    dom.gearCategory.value = gear.category;
    dom.gearBrand.value = gear.brand;
    dom.gearStatus.value = gear.status;
    dom.gearLastService.value = gear.lastService;
    dom.gearNotes.value = gear.notes;
  } else {
    dom.gearModalTitle.textContent = "Přidat výbavu";
    dom.gearForm.reset();
    dom.gearId.value = "";
    dom.gearStatus.value = "good";
  }
  dom.gearModal.classList.remove("hidden");
}

function closeGearModal() {
  dom.gearModal.classList.add("hidden");
}

function bindGearEvents() {
  dom.addGearButton.addEventListener("click", () => openGearModal(null));
  dom.closeGearModal.addEventListener("click", closeGearModal);
  dom.cancelGear.addEventListener("click", closeGearModal);

  dom.gearCategoryFilter.addEventListener("click", (event) => {
    const target = event.target.closest("[data-gear-cat]");
    if (!target) return;
    appState.gearFilter = target.dataset.gearCat;
    renderGearInventory();
  });

  dom.gearList.addEventListener("click", (event) => {
    const editBtn = event.target.closest("[data-edit-gear]");
    if (editBtn) { openGearModal(editBtn.dataset.editGear); return; }

    const deleteBtn = event.target.closest("[data-delete-gear]");
    if (deleteBtn) {
      const id = deleteBtn.dataset.deleteGear;
      appState.gear = appState.gear.filter((g) => g.id !== id);
      persistGear();
      renderEquipmentAlert();
      renderGearInventory();
      showToast("Položka výbavy smazána");
    }
  });

  dom.gearForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dom.gearForm.reportValidity()) return;

    const id = dom.gearId.value || `g${Date.now()}`;
    const gearItem = {
      id,
      name: dom.gearName.value.trim(),
      category: dom.gearCategory.value,
      brand: dom.gearBrand.value.trim(),
      status: dom.gearStatus.value,
      lastService: dom.gearLastService.value,
      notes: dom.gearNotes.value.trim(),
    };

    const existing = appState.gear.findIndex((g) => g.id === id);
    if (existing >= 0) {
      appState.gear.splice(existing, 1, gearItem);
    } else {
      appState.gear.push(gearItem);
    }

    persistGear();
    renderEquipmentAlert();
    closeGearModal();
    renderGearInventory();
    showToast(existing >= 0 ? "Výbava byla upravena ✓" : "Výbava byla přidána ✓");
  });
}

function renderCommunityTab() {
  if (!dom.communityFeed) return;
  const recentPosts = appState.forumPosts
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10);

  if (!recentPosts.length) {
    dom.communityFeed.innerHTML = '<p class="empty">Zatím žádné příspěvky. Přidej první tip ve fóru.</p>';
    return;
  }

  dom.communityFeed.innerHTML = recentPosts
    .map((post) => {
      const created = new Date(post.createdAt).toLocaleDateString("cs-CZ");
      return `<article class="stack-item">
        <strong>${escapeHtml(post.title)}</strong>
        <span class="forum-meta">${escapeHtml(post.category)} • ${escapeHtml(post.location)} • ${created}</span>
        <p class="forum-message">${escapeHtml(post.message)}</p>
      </article>`;
    })
    .join("");
}

function renderForumTab() {
  if (!dom.forumFeed || !dom.forumCategoryFilters) {
    return;
  }

  const categoryCounts = appState.forumPosts.reduce((counts, post) => {
    counts[post.category] = (counts[post.category] ?? 0) + 1;
    return counts;
  }, {});

  const categoryButtons = [
    `<button class="forum-category-btn ${appState.forumFilters.category === "all" ? "active" : ""}" type="button" data-forum-category="all">Vše (${appState.forumPosts.length})</button>`,
    ...Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => {
        const isActive = appState.forumFilters.category === category;
        return `<button class="forum-category-btn ${isActive ? "active" : ""}" type="button" data-forum-category="${escapeHtml(category)}">${escapeHtml(category)} (${count})</button>`;
      }),
  ];

  dom.forumCategoryFilters.innerHTML = categoryButtons.join("");

  if (dom.forumSearch && dom.forumSearch.value !== appState.forumFilters.query) {
    dom.forumSearch.value = appState.forumFilters.query;
  }

  const query = appState.forumFilters.query.trim().toLowerCase();
  const filteredPosts = appState.forumPosts.filter((post) => {
    const matchesCategory =
      appState.forumFilters.category === "all" || post.category === appState.forumFilters.category;
    const matchesQuery =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.message.toLowerCase().includes(query) ||
      post.location.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  if (!appState.forumPosts.length) {
    dom.forumFeed.innerHTML = '<p class="empty">Zatím žádné příspěvky. Přidej první tip.</p>';
    return;
  }

  if (!filteredPosts.length) {
    dom.forumFeed.innerHTML = '<p class="empty">Žádné příspěvky pro vybranou kategorii nebo hledání.</p>';
    return;
  }

  const posts = filteredPosts
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((post) => {
      const created = new Date(post.createdAt).toLocaleString("cs-CZ");
      return `
      <article class="stack-item">
        <p class="forum-post-title">${escapeHtml(post.title)}</p>
        <p class="forum-meta">${escapeHtml(post.category)} • ${escapeHtml(post.location)} • ${escapeHtml(post.author)} • ${escapeHtml(created)}</p>
        <p class="forum-message">${escapeHtml(post.message)}</p>
      </article>`;
    });

  dom.forumFeed.innerHTML = posts.join("");
}

function setCurrentTab(tabName) {
  appState.currentTab = tabName;

  dom.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  dom.tabPanes.forEach((pane) => {
    pane.classList.toggle("hidden", pane.dataset.tabContent !== tabName);
  });

  if (tabName === "map" && osmMap) {
    window.setTimeout(() => {
      osmMap.invalidateSize();
    }, 60);
  }

  if (tabName === "logs" && detailMap) {
    window.setTimeout(() => {
      detailMap.invalidateSize();
    }, 60);
  }

  // Render the newly active tab's content
  const filteredDives = getFilteredDives();
  if (tabName === "statistics") renderStatistics(filteredDives);
  else if (tabName === "map") renderMapTab(filteredDives);
  else if (tabName === "equipment") renderEquipmentTab(filteredDives);
  else if (tabName === "community") renderCommunityTab();
  else if (tabName === "forum") renderForumTab();
}

function render() {
  const filteredDives = getFilteredDives();
  renderDiveList(filteredDives);
  const selectedDive = findSelectedDive(filteredDives);
  renderDiveDetail(selectedDive);

  // Lazy: only render the currently-visible tab's heavy panel
  const tab = appState.currentTab;
  if (tab === "statistics") renderStatistics(filteredDives);
  else if (tab === "map") renderMapTab(filteredDives);
  else if (tab === "equipment") renderEquipmentTab(filteredDives);
  else if (tab === "community") renderCommunityTab();
  else if (tab === "forum") renderForumTab();
}

function bindFilterEvents() {
  dom.searchInput.addEventListener("input", (event) => {
    appState.filters.query = event.target.value;
    render();
  });

  dom.locationFilter.addEventListener("change", (event) => {
    appState.filters.location = event.target.value;
    render();
  });

  dom.startDate.addEventListener("change", (event) => {
    appState.filters.startDate = event.target.value;
    render();
  });

  dom.endDate.addEventListener("change", (event) => {
    appState.filters.endDate = event.target.value;
    render();
  });

  dom.typeFilters.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const diveType = event.target.dataset.typeFilter;
      if (event.target.checked) {
        appState.filters.types.add(diveType);
      } else {
        appState.filters.types.delete(diveType);
      }
      render();
    });
  });
}

function bindListEvents() {
  dom.diveList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-dive-id]");
    if (!target) {
      return;
    }

    appState.selectedDiveId = target.dataset.diveId;
    render();
  });
}

function bindNavEvents() {
  dom.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCurrentTab(button.dataset.tab);
    });
  });
}

function bindCrossTabFilterEvents() {
  dom.mapLocations.addEventListener("click", (event) => {
    const target = event.target.closest("[data-location-filter]");
    if (!target) {
      return;
    }

    appState.filters.location = target.dataset.locationFilter;
    syncFilterControls();
    setCurrentTab("logs");
    render();
  });

  dom.equipmentSummary.addEventListener("click", (event) => {
    const target = event.target.closest("[data-equipment-filter]");
    if (!target) {
      return;
    }

    const equipment = target.dataset.equipmentFilter;
    appState.filters.equipment = appState.filters.equipment === equipment ? "all" : equipment;
    setCurrentTab("logs");
    render();
  });
}

function bindNotesEvents() {
  dom.notesInput.addEventListener("input", (event) => {
    const selectedDive = dives.find((dive) => dive.id === appState.selectedDiveId);
    if (!selectedDive) {
      return;
    }

    selectedDive.notes = event.target.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    persistDives();
  });
}

function bindAuthEvents() {
  dom.authButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPhase("app");
      addLoginHistoryEntry("Login");
    });
  });

  dom.logoutButton.addEventListener("click", () => {
    setPhase("auth");
    addLoginHistoryEntry("Logout");
  });
}

function bindProfileEvents() {
  dom.profileButton.addEventListener("click", openProfileModal);
  dom.closeProfileModal.addEventListener("click", closeProfileModal);
  dom.cancelProfile.addEventListener("click", closeProfileModal);

  dom.profileAvatarFile.addEventListener("change", () => {
    const file = dom.profileAvatarFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      dom.profileAvatarPreview.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  dom.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dom.profileForm.reportValidity()) {
      return;
    }

    const file = dom.profileAvatarFile.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        appState.profile = {
          ...appState.profile,
          name: dom.profileName.value.trim(),
          email: dom.profileEmail.value.trim(),
          certification: dom.profileCertification.value.trim(),
          homeLocation: dom.profileHomeLocation.value.trim(),
          bio: dom.profileBio.value.trim(),
          avatarUrl: event.target.result,
        };
        persistProfile();
        renderTopProfile();
        closeProfileModal();
      };
      reader.readAsDataURL(file);
      return;
    }

    appState.profile = {
      ...appState.profile,
      name: dom.profileName.value.trim(),
      email: dom.profileEmail.value.trim(),
      certification: dom.profileCertification.value.trim(),
      homeLocation: dom.profileHomeLocation.value.trim(),
      bio: dom.profileBio.value.trim(),
    };

    persistProfile();
    renderTopProfile();
    closeProfileModal();
  });
}

function bindSettingsEvents() {
  dom.settingsButton.addEventListener("click", openSettingsModal);
  dom.closeSettingsModal.addEventListener("click", closeSettingsModal);
  dom.closeSettingsFooter.addEventListener("click", closeSettingsModal);

  dom.themeSelect.addEventListener("change", (event) => {
    applyTheme(event.target.value);
  });

  dom.changePasswordButton.addEventListener("click", () => {
    const currentPassword = dom.currentPassword.value.trim();
    const newPassword = dom.newPassword.value.trim();
    const confirmPassword = dom.confirmPassword.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      dom.passwordStatus.textContent = "Vyplň všechna pole pro změnu hesla.";
      return;
    }

    if (newPassword.length < 6) {
      dom.passwordStatus.textContent = "Nové heslo musí mít alespoň 6 znaků.";
      return;
    }

    if (newPassword !== confirmPassword) {
      dom.passwordStatus.textContent = "Nové heslo a potvrzení se neshodují.";
      return;
    }

    dom.passwordStatus.textContent = "Heslo bylo úspěšně změněno.";
    dom.currentPassword.value = "";
    dom.newPassword.value = "";
    dom.confirmPassword.value = "";
  });
}

function bindNewDiveFormEvents() {
  dom.newLogButton.addEventListener("click", openNewDiveModal);
  dom.closeNewDiveModal.addEventListener("click", closeNewDiveModal);
  dom.cancelNewDive.addEventListener("click", closeNewDiveModal);

  dom.formProfilePoints.addEventListener("input", () => {
    dom.formProfilePoints.setCustomValidity("");
  });

  dom.formLatitude.addEventListener("change", () => {
    syncFormMapFromInputs(true);
  });

  dom.formLongitude.addEventListener("change", () => {
    syncFormMapFromInputs(true);
  });

  dom.newDiveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dom.newDiveForm.reportValidity()) {
      return;
    }

    let newDive;
    try {
      dom.formProfilePoints.setCustomValidity("");
      newDive = createDiveFromForm();
    } catch {
      dom.formProfilePoints.setCustomValidity(
        "Zadej body profilu jako 'čas,hloubka' na každý řádek (alespoň 2 řádky)."
      );
      dom.formProfilePoints.reportValidity();
      return;
    }

    dom.formProfilePoints.setCustomValidity("");
    const existingIndex = dives.findIndex((dive) => dive.id === newDive.id);
    const isEdit = existingIndex >= 0;
    if (isEdit) {
      dives.splice(existingIndex, 1, newDive);
    } else {
      dives.unshift(newDive);
    }
    persistDives();
    showToast(isEdit ? "Ponor byl upraven ✓" : "Nový ponor byl uložen ✓");

    appState.selectedDiveId = newDive.id;
    appState.filters.query = "";
    appState.filters.location = "all";
    appState.filters.equipment = "all";
    appState.filters.startDate = "";
    appState.filters.endDate = "";
    appState.filters.types.add(newDive.type);

    dom.searchInput.value = "";
    dom.startDate.value = "";
    dom.endDate.value = "";
    dom.typeFilters.forEach((checkbox) => {
      const diveType = checkbox.dataset.typeFilter;
      checkbox.checked = appState.filters.types.has(diveType);
    });

    initLocationOptions();
    syncFilterControls();
    render();
    closeNewDiveModal();
  });
}

function bindForumEvents() {
  if (!dom.forumForm) {
    return;
  }

  dom.forumClear.addEventListener("click", () => {
    dom.forumForm.reset();
    dom.forumCategory.value = "Tip";
  });

  dom.forumCategoryFilters.addEventListener("click", (event) => {
    const target = event.target.closest("[data-forum-category]");
    if (!target) {
      return;
    }

    appState.forumFilters.category = target.dataset.forumCategory;
    renderForumTab();
  });

  dom.forumSearch.addEventListener("input", (event) => {
    appState.forumFilters.query = event.target.value;
    renderForumTab();
  });

  dom.forumResetFilters.addEventListener("click", () => {
    appState.forumFilters.category = "all";
    appState.forumFilters.query = "";
    renderForumTab();
  });

  dom.forumForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dom.forumForm.reportValidity()) {
      return;
    }

    const post = {
      id: `f${Date.now()}`,
      category: dom.forumCategory.value,
      location: dom.forumLocation.value.trim(),
      title: dom.forumTitle.value.trim(),
      message: dom.forumMessage.value.trim(),
      author: appState.profile.name,
      createdAt: new Date().toISOString(),
    };

    appState.forumPosts.unshift(post);
    persistForumPosts();
    appState.forumFilters.category = "all";
    appState.forumFilters.query = "";
    renderForumTab();
    dom.forumForm.reset();
    dom.forumCategory.value = "Tip";
    setCurrentTab("forum");
  });
}

function init() {
  if (dom.copyrightYear) {
    dom.copyrightYear.textContent = String(new Date().getFullYear());
  }

  loadPersistedState();
  setPhase("loading");
  setCurrentTab("logs");
  applyTheme(appState.settings.theme);
  renderTopProfile();
  initOsmMap();
  initDetailMap();
  initFormPickerMap();
  initLocationOptions();
  bindAuthEvents();
  bindProfileEvents();
  bindSettingsEvents();
  bindFilterEvents();
  bindListEvents();
  bindNavEvents();
  bindCrossTabFilterEvents();
  bindNotesEvents();
  bindNewDiveFormEvents();
  bindForumEvents();
  bindGearEvents();
  bindLightboxEvents();
  bindDiveDetailActions();
  bindKeyboardNav();
  render();
  renderEquipmentAlert();

  window.setTimeout(() => {
    setPhase("auth");
  }, 2200);

  // Register service worker for PWA / offline support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {/* silently ignore in file:// */ });
  }
}

init();
