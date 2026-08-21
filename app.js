// ---------- Zustand ----------

let appData = leeresSchema();
let currentUsername = null;
let currentIsAdmin = false;
let currentCanEdit = false;
let currentCanAdmin = false;
let currentVorname = null;
let currentNachname = null;

let currentStufeId = null;      // Tab "Ausbildung"
let currentMannschaftId = null; // Tab "Spieltage"
let currentSpieltagId = null;   // offener Bogen
let auswertungMannschaftId = null;
let auswertungSaison = "";
let auswertungModus = "mannschaft"; // "mannschaft" | "jahrgang"
let auswertungJahrgang = null;
let vwView = "mannschaften";
// Die Mannschaften des Vereins aus der zentralen Liste — Vorschläge fürs
// Namensfeld im Mannschafts-Formular. Leer, bis fetchVereinsMannschaften()
// durch ist; das Formular ist auch ohne sie voll bedienbar.
let vereinsMannschaften = [];
let vwEditId = null;            // null = keine Bearbeitung, "neu" = neuer Datensatz

function canEdit() { return currentIsAdmin || currentCanEdit; }   // Bögen ausfüllen, drucken
function canAdmin() { return currentIsAdmin || currentCanAdmin; } // Katalog und Mannschaften pflegen

function leeresSchema() {
  return { meta: { stand: null }, bereiche: [], stufen: [], saeulen: [], schwerpunkte: [], uebungen: [], mannschaften: [], spieltage: [] };
}

// ---------- Helfer ----------

function escapeHtml(s) {
  return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  // Bewusst echtes UUID-Format, nicht irgendein Zufallsstring: aeltere iOS-Geraete
  // in der Flotte haben crypto.randomUUID nicht, die Ids muessen aber gleich aussehen.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : ((r & 0x3) | 0x8)).toString(16);
  });
}

function fmtDatum(iso) {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("de-DE");
}

function fmtDatumKurz(iso) {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (isNaN(d)) return iso;
  return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + ".";
}

function heuteIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Saison wird NICHT gespeichert, sondern immer aus dem Spieldatum abgeleitet —
// eine Quelle der Wahrheit. Stichtag ist der 1. Juli.
function saisonAusDatum(datum) {
  if (!datum) return "";
  const d = new Date(datum.length <= 10 ? datum + "T00:00:00" : datum);
  if (isNaN(d)) return "";
  const start = (d.getMonth() + 1) >= SAISON_STICHTAG_MONAT ? d.getFullYear() : d.getFullYear() - 1;
  return start + "/" + String(start + 1).slice(2);
}

// ---------- Jahrgänge ----------
//
// Der Jahrgang ist die Einheit, die man über Jahre verfolgt: er wandert durch die
// Stufen, während die Mannschaftsbezeichnung ("D1-Junioren") stehenbleibt und jede
// Saison andere Kinder meint. Deshalb trägt jeder Spieltag-Bogen zusätzlich die
// beteiligten Jahrgänge.
//
// DFB-Regel: die Saison läuft vom 1. Juli bis 30. Juni, maßgeblich ist ihr ENDJAHR.
// Jahrgang 2012 spielt in der Saison 2026/27 also als U15 (2027 − 2012).
function uKlasseFuerJahrgang(jahrgang, datum) {
  const j = Number(jahrgang);
  const saison = saisonAusDatum(datum);
  if (!j || !saison) return null;
  return Number(saison.slice(0, 4)) + 1 - j;
}

function stufeFuerU(u) {
  if (u === null || u === undefined) return null;
  return stufenSortiert().find((st) => u >= Number(st.vonU) && u <= Number(st.bisU)) || null;
}

function stufeFuerJahrgang(jahrgang, datum) {
  return stufeFuerU(uKlasseFuerJahrgang(jahrgang, datum));
}

// "2014, 2015" oder "2014 2015" -> [2014, 2015]. Alles Unplausible fliegt raus,
// damit ein Tippfehler nicht als Jahrgang im Filter auftaucht.
function jahrgaengeAusText(text) {
  return Array.from(new Set(
    String(text || "").split(/[^0-9]+/).map(Number).filter((n) => n >= 1990 && n <= 2100)
  )).sort((a, b) => a - b);
}

function jahrgaengeText(liste) {
  return (Array.isArray(liste) ? liste : []).join(", ");
}

function alleJahrgaenge() {
  const s = new Set();
  appData.mannschaften.forEach((m) => (m.jahrgaenge || []).forEach((j) => s.add(Number(j))));
  appData.spieltage.forEach((sp) => (sp.jahrgaenge || []).forEach((j) => s.add(Number(j))));
  return Array.from(s).sort((a, b) => b - a);
}

function spieltageFuerJahrgang(jahrgang) {
  const j = Number(jahrgang);
  return appData.spieltage
    .filter((s) => Array.isArray(s.jahrgaenge) && s.jahrgaenge.map(Number).includes(j))
    .sort((a, b) => String(a.datum || "").localeCompare(String(b.datum || "")));
}

// Umsetzungsgrad eines Bogens: grün zählt voll, gelb halb, rot nichts. "Nicht
// beobachtet" geht NICHT in den Nenner ein — sonst sähe ein Bogen, in dem der
// Trainer nur zwei Schwerpunkte beurteilt hat, schlechter aus als einer, in dem
// er alle beurteilt hat.
function umsetzungsgrad(spieltag) {
  const werte = Object.values(spieltag.bewertungen || {}).filter(Boolean);
  if (!werte.length) return null;
  const punkte = werte.reduce((n, w) => n + (w === "gruen" ? 1 : w === "gelb" ? 0.5 : 0), 0);
  return Math.round((punkte / werte.length) * 100);
}

function stufeFuerBogen(spieltag) {
  const m = mannschaftById(spieltag.mannschaftId);
  return m ? stufeById(m.stufeId) : null;
}

function trainingsartLabel(id) {
  const t = TRAININGSARTEN.find((x) => x.id === id);
  return t ? t.label : "";
}

function ampelLabel(id) {
  const a = AMPEL_STUFEN.find((x) => x.id === id);
  return a ? a.label : "Nicht beobachtet";
}

function nachReihenfolge(a, b) {
  const ra = Number(a.reihenfolge || 0), rb = Number(b.reihenfolge || 0);
  if (ra !== rb) return ra - rb;
  return String(a.titel || a.name || "").localeCompare(String(b.titel || b.name || ""), "de");
}

// ---------- Nachschlagen ----------

function stufeById(id) { return appData.stufen.find((s) => s.id === id) || null; }
function uebungById(id) { return appData.uebungen.find((u) => u.id === id) || null; }
function bereichById(id) { return appData.bereiche.find((b) => b.id === id) || null; }
function saeuleById(id) { return appData.saeulen.find((s) => s.id === id) || null; }
function mannschaftById(id) { return appData.mannschaften.find((m) => m.id === id) || null; }

function stufenSortiert() { return appData.stufen.slice().sort(nachReihenfolge); }

function schwerpunkteFuerStufe(stufeId, nurAktive) {
  return appData.schwerpunkte
    .filter((sp) => sp.stufeId === stufeId && (!nurAktive || sp.aktiv !== false))
    .sort(nachReihenfolge);
}

function mannschaftenSortiert(nurAktive) {
  return appData.mannschaften
    .filter((m) => !nurAktive || m.aktiv !== false)
    .sort((a, b) => {
      const sa = stufeById(a.stufeId), sb = stufeById(b.stufeId);
      const ra = sa ? Number(sa.reihenfolge || 0) : 999;
      const rb = sb ? Number(sb.reihenfolge || 0) : 999;
      if (ra !== rb) return ra - rb;
      return String(a.name || "").localeCompare(String(b.name || ""), "de");
    });
}

function spieltageFuerMannschaft(mannschaftId) {
  return appData.spieltage
    .filter((s) => s.mannschaftId === mannschaftId)
    .sort((a, b) => String(a.datum || "").localeCompare(String(b.datum || "")));
}

function stufeLabel(stufe) {
  if (!stufe) return "—";
  return `${stufe.name} (U${stufe.vonU}${stufe.bisU && stufe.bisU !== stufe.vonU ? "/U" + stufe.bisU : ""})`;
}

// Die einzige Regel, die das Tool selbst prueft: die Teamgroesse der Uebung gegen
// die DFB-Obergrenze der Stufe. Bei Stufen mit Anspieler-Erweiterung ist die
// Obergrenze bereits die rechnerische (4 Kernspieler + 2 Anspieler = 6).
function uebungUeberGrenze(uebung, stufe) {
  if (!uebung || !stufe || stufe.obergrenzeSpieler === null || stufe.obergrenzeSpieler === undefined) return false;
  return Number(uebung.spielerProTeam || 0) > Number(stufe.obergrenzeSpieler);
}

// ---------- Normalisieren ----------

function normalizeData(data) {
  const d = (data && typeof data === "object") ? data : {};
  if (!d.meta || typeof d.meta !== "object") d.meta = { stand: null };
  ["bereiche", "stufen", "saeulen", "schwerpunkte", "uebungen", "mannschaften", "spieltage"].forEach((k) => {
    if (!Array.isArray(d[k])) d[k] = [];
  });
  d.schwerpunkte.forEach((sp) => {
    if (!Array.isArray(sp.uebungIds)) sp.uebungIds = [];
    if (sp.aktiv === undefined) sp.aktiv = true;
  });
  d.stufen.forEach((st) => {
    if (!st.frequenz || typeof st.frequenz !== "object") {
      st.frequenz = { mannschaft: 2, foerder: 1, foerderFreiwillig: false };
    }
  });
  d.spieltage.forEach((sp) => {
    if (!sp.bewertungen || typeof sp.bewertungen !== "object") sp.bewertungen = {};
    // Bögen aus der Zeit vor der Jahrgangs-Achse haben das Feld nicht. Sie bleiben
    // gültig und tauchen weiter in der Mannschafts-Auswertung auf, nur eben in
    // keiner Jahrgangs-Auswertung — nichts wird geraten.
    if (!Array.isArray(sp.jahrgaenge)) sp.jahrgaenge = [];
    sp.jahrgaenge = sp.jahrgaenge.map(Number).filter((n) => n >= 1990 && n <= 2100);
  });
  d.mannschaften.forEach((m) => {
    if (m.aktiv === undefined) m.aktiv = true;
    if (!Array.isArray(m.jahrgaenge)) m.jahrgaenge = [];
    m.jahrgaenge = m.jahrgaenge.map(Number).filter((n) => n >= 1990 && n <= 2100);
  });
  return d;
}

// ---------- Speichern ----------
//
// Debounce + In-Flight-Guard: Laeuft schon ein Save, wird kein zweiter mit dem
// alten ETag gestartet — sonst meldet die App "von einem anderen Geraet geaendert",
// obwohl nur eine Person arbeitet.

let saveTimer = null;
let saveInFlight = false;
let savePending = false;

function setSaveStatus(text, istFehler) {
  const el = document.getElementById("save-status");
  if (!el) return;
  el.textContent = text || "";
  el.classList.toggle("visible", !!text);
  el.classList.toggle("error", !!istFehler);
}

function markDirty(delay) {
  if (!canEdit() && !canAdmin()) return;
  if (saveTimer) clearTimeout(saveTimer);
  setSaveStatus("Änderung vorgemerkt …");
  saveTimer = setTimeout(() => { saveTimer = null; persistNow(); }, delay === undefined ? 700 : delay);
}

async function persistNow() {
  if (saveInFlight) { savePending = true; return; }
  saveInFlight = true;
  setSaveStatus("Speichern …");
  try {
    appData.meta.stand = new Date().toISOString();
    await gatewaySave(appData);
    setSaveStatus("Gespeichert um " + new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
  } catch (e) {
    if (e instanceof ConflictError) {
      setSaveStatus("Konflikt: Die Daten wurden zwischenzeitlich von einem anderen Gerät geändert. Bitte die Seite neu laden — die letzten Eingaben sind sonst nicht gespeichert.", true);
    } else if (e instanceof NotLoggedInError) {
      setSaveStatus("Sitzung abgelaufen — bitte in der Tools-Übersicht neu anmelden.", true);
    } else {
      setSaveStatus("Fehler beim Speichern: " + e.message, true);
    }
  } finally {
    saveInFlight = false;
    if (savePending) { savePending = false; persistNow(); }
  }
}

// Beim Verlassen einer Ansicht ausstehende Aenderungen sofort wegschreiben,
// sonst gehen die letzten Eingaben verloren.
function flushPending() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; persistNow(); }
}

// ---------- Rechte im Client verdrahten ----------

function applyRechteVisibility() {
  document.getElementById("nav-verwaltung").style.display = canAdmin() ? "" : "none";
  document.querySelectorAll(".editor-only").forEach((el) => { el.style.display = canEdit() ? "" : "none"; });
  document.querySelectorAll(".admin-only").forEach((el) => { el.style.display = canAdmin() ? "" : "none"; });
  // Ausblenden ist nicht Zurueckhalten: den Verwaltungs-Bereich zusaetzlich leeren,
  // damit nach einem Rechteentzug kein gerendertes Admin-Markup im DOM stehenbleibt.
  if (!canAdmin()) document.getElementById("verwaltung-inhalt").innerHTML = "";
}

// ---------- Tabs ----------

function activateTab(name) {
  flushPending();
  document.querySelectorAll("nav button[data-tab]").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-section").forEach((s) => s.classList.remove("active"));
  const btn = document.querySelector(`nav button[data-tab="${name}"]`);
  if (btn) btn.classList.add("active");
  const sec = document.getElementById("tab-" + name);
  if (sec) sec.classList.add("active");
  if (name === "auswertung") renderAuswertung();
  if (name === "spieltage") renderSpieltage();
  if (name === "verwaltung") renderVerwaltung();
}

function setupTabs() {
  document.querySelectorAll("nav button[data-tab]").forEach((b) => {
    b.addEventListener("click", () => activateTab(b.dataset.tab));
  });
}

// ---------- Tab: Ausbildung ----------

function renderStufenChips() {
  const el = document.getElementById("stufen-chips");
  const stufen = stufenSortiert();
  el.innerHTML = stufen.map((st) => {
    const anzahl = schwerpunkteFuerStufe(st.id, true).length;
    const uSpanne = st.bisU && st.bisU !== st.vonU ? `U${st.vonU}/U${st.bisU}` : `U${st.vonU}`;
    return `<button type="button" class="stufe-chip${st.id === currentStufeId ? " active" : ""}${anzahl === 0 ? " leer" : ""}" data-stufe="${escapeHtml(st.id)}">
      <span>${escapeHtml(st.kuerzel || st.name)}</span>
      <span class="chip-u">${escapeHtml(uSpanne)}</span>
    </button>`;
  }).join("");
}

function stufenProfilHtml(st) {
  const bereich = bereichById(st.bereichId);
  const f = st.frequenz || {};
  const frequenzText = `${f.mannschaft || 0}× Mannschaftstraining + ${f.foerder || 0}× Fördertraining${f.foerderFreiwillig ? " (freiwillig)" : ""}`;
  const zeilen = [
    ["Bereich", bereich ? bereich.name : ""],
    ["Altersspanne", st.altersspanne],
    ["Entwicklungsstand", st.entwicklungsstand],
    ["DFB-Obergrenze Spielform", st.obergrenzeText],
    ["Mindest-Nettospielzeit", st.nettospielzeit],
    ["Betreuungsschlüssel", st.betreuung],
    ["Trainingsfrequenz", frequenzText],
    ["Am Spieltag", st.spieltagHinweise]
  ].filter((z) => z[1]);
  return `
    <div class="card">
      <h2>${escapeHtml(stufeLabel(st))}</h2>
      ${st.hinweis ? `<div class="hinweis-box">${escapeHtml(st.hinweis)}</div>` : ""}
      <div class="profil-grid">
        ${zeilen.map((z) => `
          <div class="profil-zeile">
            <div class="pz-label">${escapeHtml(z[0])}</div>
            <div class="pz-wert">${escapeHtml(z[1])}</div>
          </div>`).join("")}
      </div>
    </div>`;
}

function uebungRefHtml(u, stufe) {
  const ueber = uebungUeberGrenze(u, stufe);
  return `
    <details class="uebung">
      <summary class="uebung-kopf">
        <div class="uebung-name">${escapeHtml(u.name)}
          <div class="uebung-meta">${escapeHtml([u.spielform, u.feldgroesse, u.spielerGesamt ? u.spielerGesamt + " Spieler gesamt" : ""].filter(Boolean).join(" · "))}</div>
        </div>
        <div class="uebung-tags">
          ${ueber ? `<span class="tag warn">über DFB-Obergrenze</span>` : ""}
          <span class="tag art-${escapeHtml(u.trainingsart || "beide")}">${escapeHtml(trainingsartLabel(u.trainingsart))}</span>
        </div>
      </summary>
      ${uebungBodyHtml(u, stufe)}
    </details>`;
}

function uebungBodyHtml(u, stufe) {
  const ueber = uebungUeberGrenze(u, stufe);
  const saeule = saeuleById(u.saeule);
  return `
    <div class="uebung-body">
      ${ueber ? `<div class="hinweis-box">Diese Übung ist ein ${escapeHtml(u.spielform)} und liegt damit über der DFB-Obergrenze dieser Altersklasse (${escapeHtml(stufe.obergrenzeText || "max. " + stufe.obergrenzeSpieler)}).</div>` : ""}
      ${saeule ? `<div><span class="ub-label">Säule:</span> ${escapeHtml(saeule.name)}</div>` : ""}
      ${u.aufbau ? `<div><span class="ub-label">Aufbau:</span> ${escapeHtml(u.aufbau)}</div>` : ""}
      ${u.ablauf ? `<div><span class="ub-label">Ablauf:</span> ${escapeHtml(u.ablauf)}</div>` : ""}
      ${u.varianten ? `<div><span class="ub-label">Varianten:</span> ${escapeHtml(u.varianten)}</div>` : ""}
      ${u.zitat ? `<div class="uebung-zitat">„${escapeHtml(u.zitat)}“<span class="uz-von">— ${escapeHtml(u.zitatVon)}</span></div>` : ""}
    </div>`;
}

function renderStufenDetail() {
  const el = document.getElementById("stufen-detail");
  const st = stufeById(currentStufeId);
  if (!st) { el.innerHTML = ""; return; }
  const sps = schwerpunkteFuerStufe(st.id, true);
  const spHtml = sps.length ? sps.map((sp) => {
    const uebungen = sp.uebungIds.map(uebungById).filter(Boolean);
    return `
      <div class="schwerpunkt">
        <div class="schwerpunkt-kopf">
          <div class="schwerpunkt-titel">${escapeHtml(sp.titel)}
            ${sp.beschreibung ? `<div class="schwerpunkt-beschreibung">${escapeHtml(sp.beschreibung)}</div>` : ""}
          </div>
          <span class="tag art-${escapeHtml(sp.trainingsart || "beide")}">${escapeHtml(trainingsartLabel(sp.trainingsart))}</span>
        </div>
        <div class="schwerpunkt-uebungen">
          ${uebungen.length
            ? uebungen.map((u) => uebungRefHtml(u, st)).join("")
            : `<p class="muted">Für diesen Schwerpunkt sind noch keine Übungen aus dem Katalog verknüpft.</p>`}
        </div>
      </div>`;
  }).join("") : `<div class="empty-state">Für diese Altersklasse sind noch keine Trainingsschwerpunkte hinterlegt.</div>`;

  el.innerHTML = stufenProfilHtml(st) + `
    <div class="card">
      <h2>Trainingsschwerpunkte</h2>
      <p class="muted">Was in dieser Altersklasse ausgebildet wird — und mit welchen Übungen.</p>
      ${spHtml}
    </div>`;
}

function renderAusbildung() {
  const leer = appData.stufen.length === 0;
  document.getElementById("leerstand-card").style.display = leer ? "" : "none";
  document.getElementById("stufenwahl-card").style.display = leer ? "none" : "";
  if (leer) { document.getElementById("stufen-detail").innerHTML = ""; return; }
  if (!stufeById(currentStufeId)) {
    const ersteMitInhalt = stufenSortiert().find((st) => schwerpunkteFuerStufe(st.id, true).length > 0);
    currentStufeId = (ersteMitInhalt || stufenSortiert()[0]).id;
  }
  renderStufenChips();
  renderStufenDetail();
}

// ---------- Tab: Übungen ----------

function fuelleFilterSelects() {
  const sa = document.getElementById("filter-saeule");
  sa.innerHTML = `<option value="">Alle Säulen</option>` +
    appData.saeulen.slice().sort(nachReihenfolge).map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join("");
  // Nur die beiden echten Trainingsformen anbieten: "beide" ist keine Auswahl,
  // sondern faellt bei jeder der beiden mit hinein.
  const ta = document.getElementById("filter-trainingsart");
  ta.innerHTML = `<option value="">Alle</option>` +
    TRAININGSARTEN.filter((t) => t.id !== "beide")
      .map((t) => `<option value="${escapeHtml(t.id)}">Für ${escapeHtml(t.label)}</option>`).join("");
  const stf = document.getElementById("filter-stufe");
  stf.innerHTML = `<option value="">Alle Stufen</option>` +
    stufenSortiert().map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(stufeLabel(s))}</option>`).join("");
}

function renderUebungen() {
  const fSaeule = document.getElementById("filter-saeule").value;
  const fArt = document.getElementById("filter-trainingsart").value;
  const fStufeId = document.getElementById("filter-stufe").value;
  const suche = document.getElementById("filter-suche").value.trim().toLowerCase();
  const stufe = fStufeId ? stufeById(fStufeId) : null;

  let liste = appData.uebungen.slice();
  if (fSaeule) liste = liste.filter((u) => u.saeule === fSaeule);
  if (fArt) liste = liste.filter((u) => u.trainingsart === fArt || u.trainingsart === "beide");
  if (stufe) liste = liste.filter((u) => !uebungUeberGrenze(u, stufe));
  if (suche) {
    liste = liste.filter((u) => [u.name, u.aufbau, u.ablauf, u.varianten, u.spielform]
      .some((t) => String(t || "").toLowerCase().includes(suche)));
  }
  liste.sort((a, b) => String(a.id).localeCompare(String(b.id)));

  const gesamt = appData.uebungen.length;
  document.getElementById("uebungen-count").textContent =
    `${liste.length} von ${gesamt} Übungen` + (stufe ? ` — gefiltert auf Formen, die die DFB-Obergrenze der ${stufe.name} einhalten.` : "");

  const gruppen = appData.saeulen.slice().sort(nachReihenfolge)
    .map((s) => ({ saeule: s, uebungen: liste.filter((u) => u.saeule === s.id) }))
    .filter((g) => g.uebungen.length);

  const el = document.getElementById("uebungen-liste");
  if (!liste.length) {
    el.innerHTML = `<div class="card"><div class="empty-state">Keine Übung passt zu diesen Filtern.</div></div>`;
    return;
  }
  el.innerHTML = gruppen.map((g) => `
    <div class="card">
      <h2>${escapeHtml(g.saeule.name)}</h2>
      ${g.saeule.beschreibung ? `<p class="muted" style="margin-bottom:12px;">${escapeHtml(g.saeule.beschreibung)}</p>` : ""}
      ${g.uebungen.map((u) => uebungRefHtml(u, stufe)).join("")}
    </div>`).join("");
}

// ---------- Tab: Spieltage ----------

function fuelleMannschaftSelect(selectId, gewaehlt) {
  const el = document.getElementById(selectId);
  const liste = mannschaftenSortiert(true);
  el.innerHTML = liste.map((m) => {
    const st = stufeById(m.stufeId);
    return `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)}${st ? " — " + escapeHtml(st.name) : ""}</option>`;
  }).join("");
  if (gewaehlt && liste.some((m) => m.id === gewaehlt)) el.value = gewaehlt;
  return liste;
}

function renderSpieltage() {
  const liste = fuelleMannschaftSelect("spieltag-mannschaft", currentMannschaftId);
  const hinweis = document.getElementById("spieltage-hinweis");
  const neuBtn = document.getElementById("btn-neuer-spieltag");

  if (!liste.length) {
    hinweis.textContent = "Es ist noch keine aktive Mannschaft angelegt. Das macht die Nachwuchsleitung im Tab „Verwaltung“.";
    neuBtn.disabled = true;
    document.getElementById("spieltag-editor").innerHTML = "";
    document.getElementById("spieltage-rows").innerHTML = "";
    document.getElementById("spieltage-empty").style.display = "none";
    document.getElementById("spieltage-liste-card").style.display = "none";
    return;
  }
  document.getElementById("spieltage-liste-card").style.display = "";
  neuBtn.disabled = !canEdit();
  if (!currentMannschaftId || !liste.some((m) => m.id === currentMannschaftId)) {
    currentMannschaftId = liste[0].id;
    document.getElementById("spieltag-mannschaft").value = currentMannschaftId;
  }
  const m = mannschaftById(currentMannschaftId);
  const st = m ? stufeById(m.stufeId) : null;
  hinweis.textContent = st
    ? `Bewertet werden die ${schwerpunkteFuerStufe(st.id, true).length} Trainingsschwerpunkte der ${stufeLabel(st)}.`
    : "Dieser Mannschaft ist keine Juniorenstufe zugeordnet — im Tab „Verwaltung“ nachtragen.";

  renderSpieltagEditor();
  renderSpieltagListe();
}

function renderSpieltagListe() {
  const liste = spieltageFuerMannschaft(currentMannschaftId).slice().reverse();
  document.getElementById("spieltage-empty").style.display = liste.length ? "none" : "block";
  const m = mannschaftById(currentMannschaftId);
  const st = m ? stufeById(m.stufeId) : null;
  const sps = st ? schwerpunkteFuerStufe(st.id, true) : [];
  document.getElementById("spieltage-rows").innerHTML = liste.map((sp) => {
    const punkte = sps.map((x) => `<span class="ampel-punkt a-${escapeHtml(sp.bewertungen[x.id] || "leer")}" title="${escapeHtml(x.titel + ": " + ampelLabel(sp.bewertungen[x.id]))}"></span>`).join("");
    const bewertet = sps.filter((x) => sp.bewertungen[x.id]).length;
    return `
      <div class="spieltag-row" data-id="${escapeHtml(sp.id)}">
        <div class="spieltag-row-main">
          <div class="sr-kopf">${escapeHtml(fmtDatum(sp.datum))} · ${escapeHtml(sp.heim ? "Heim" : "Auswärts")} gegen ${escapeHtml(sp.gegner || "—")}${sp.ergebnis ? " · " + escapeHtml(sp.ergebnis) : ""}</div>
          <div class="muted">Saison ${escapeHtml(saisonAusDatum(sp.datum))} · ${bewertet} von ${sps.length} Schwerpunkten bewertet</div>
          <div class="spieltag-punkte">${punkte}</div>
        </div>
        <div class="spieltag-row-actions">
          <button type="button" class="btn secondary small btn-bogen-oeffnen">${sp.id === currentSpieltagId ? "Geöffnet" : "Öffnen"}</button>
          <button type="button" class="btn secondary small btn-bogen-loeschen editor-only">Löschen</button>
        </div>
      </div>`;
  }).join("");
  applyRechteVisibility();
}

function renderSpieltagEditor() {
  const el = document.getElementById("spieltag-editor");
  const sp = appData.spieltage.find((x) => x.id === currentSpieltagId && x.mannschaftId === currentMannschaftId);
  if (!sp) { el.innerHTML = ""; return; }
  const m = mannschaftById(sp.mannschaftId);
  const st = m ? stufeById(m.stufeId) : null;
  const sps = st ? schwerpunkteFuerStufe(st.id, true) : [];
  const ro = canEdit() ? "" : " disabled";

  el.innerHTML = `
    <div class="card" id="bogen-card">
      <div class="card-header-row">
        <h2>Spieltag-Bogen</h2>
        <button type="button" class="btn secondary small" id="btn-bogen-schliessen">Schließen</button>
      </div>
      <div class="form-grid wide">
        <div class="form-field">
          <label>Datum</label>
          <input type="date" id="bogen-datum" value="${escapeHtml(sp.datum || "")}"${ro} />
        </div>
        <div class="form-field">
          <label>Gegner</label>
          <input type="text" id="bogen-gegner" value="${escapeHtml(sp.gegner || "")}" placeholder="z.B. SV Beispiel"${ro} />
        </div>
        <div class="form-field">
          <label>Heim / Auswärts</label>
          <select id="bogen-heim"${ro}>
            <option value="heim"${sp.heim ? " selected" : ""}>Heim</option>
            <option value="auswaerts"${!sp.heim ? " selected" : ""}>Auswärts</option>
          </select>
        </div>
        <div class="form-field">
          <label>Ergebnis (optional)</label>
          <input type="text" id="bogen-ergebnis" value="${escapeHtml(sp.ergebnis || "")}" placeholder="z.B. 3:1"${ro} />
        </div>
        <div class="form-field">
          <label>Beteiligte Jahrgänge</label>
          <input type="text" id="bogen-jahrgaenge" value="${escapeHtml(jahrgaengeText(sp.jahrgaenge))}" placeholder="z.B. 2014, 2015"${ro} />
        </div>
      </div>
      <p class="muted">Saison ${escapeHtml(saisonAusDatum(sp.datum))} — ergibt sich aus dem Datum, Stichtag 1. Juli.</p>
      <p class="muted" id="bogen-jahrgang-hinweis">${escapeHtml(jahrgangHinweisText(sp, st))}</p>
    </div>

    <div class="card">
      <h2>Umsetzung der Schwerpunkte</h2>
      <p class="muted">Wie weit war im Spiel erkennbar, was trainiert wurde? Nicht angetippte Schwerpunkte gelten als nicht beobachtet.</p>
      ${sps.length ? sps.map((x) => `
        <div class="bogen-zeile" data-schwerpunkt="${escapeHtml(x.id)}">
          <div class="bogen-titel">${escapeHtml(x.titel)}
            ${x.beschreibung ? `<span class="bt-sub">${escapeHtml(x.beschreibung)}</span>` : ""}
          </div>
          <div class="ampel-gruppe">
            ${AMPEL_STUFEN.map((a) => `
              <button type="button" class="ampel-btn a-${escapeHtml(a.id)}${sp.bewertungen[x.id] === a.id ? " active" : ""}" data-ampel="${escapeHtml(a.id)}" title="${escapeHtml(a.label)}"${ro}>${escapeHtml(a.kurz)}</button>
            `).join("")}
          </div>
        </div>`).join("")
        : `<div class="empty-state">Für die Stufe dieser Mannschaft sind noch keine Schwerpunkte hinterlegt.</div>`}
      <div class="ampel-legende">
        ${AMPEL_STUFEN.map((a) => `<span><span class="ampel-punkt a-${escapeHtml(a.id)}"></span>${escapeHtml(a.label)}</span>`).join("")}
        <span><span class="ampel-punkt a-leer"></span>Nicht beobachtet</span>
      </div>
      <div class="form-field" style="margin-top:16px;">
        <label>Fazit zum Spiel</label>
        <textarea id="bogen-fazit" rows="3" placeholder="Was ist aufgefallen? Woran arbeiten wir als Nächstes?"${ro}>${escapeHtml(sp.fazit || "")}</textarea>
      </div>
      ${sp.erfasstVon ? `<p class="muted" style="margin-top:10px;">Erfasst von ${escapeHtml(sp.erfasstVon)}${sp.erfasstAm ? " am " + escapeHtml(fmtDatum(sp.erfasstAm)) : ""}</p>` : ""}
      ${canEdit() ? "" : `<p class="muted" style="margin-top:10px;">Du hast nur Leserechte — der Bogen ist schreibgeschützt.</p>`}
    </div>`;

  document.getElementById("btn-bogen-schliessen").addEventListener("click", () => {
    flushPending();
    currentSpieltagId = null;
    renderSpieltagEditor();
    renderSpieltagListe();
  });

  if (!canEdit()) return;

  const bindFeld = (id, setter) => {
    document.getElementById(id).addEventListener("input", (e) => {
      setter(e.target.value);
      markDirty();
      if (id === "bogen-datum") renderSpieltagListe();
    });
  };
  bindFeld("bogen-datum", (v) => { sp.datum = v; });
  bindFeld("bogen-gegner", (v) => { sp.gegner = v; });
  bindFeld("bogen-ergebnis", (v) => { sp.ergebnis = v; });
  bindFeld("bogen-fazit", (v) => { sp.fazit = v; });
  // Der Hinweis zieht bei jeder Eingabe nach, damit ein Tippfehler im Jahrgang
  // sofort auffaellt statt erst in der Auswertung zu fehlen.
  const jgHinweisNachziehen = () => {
    const el = document.getElementById("bogen-jahrgang-hinweis");
    if (el) el.textContent = jahrgangHinweisText(sp, st);
  };
  document.getElementById("bogen-jahrgaenge").addEventListener("input", (e) => {
    sp.jahrgaenge = jahrgaengeAusText(e.target.value);
    jgHinweisNachziehen();
    markDirty();
  });
  document.getElementById("bogen-datum").addEventListener("input", jgHinweisNachziehen);
  document.getElementById("bogen-heim").addEventListener("change", (e) => {
    sp.heim = e.target.value === "heim";
    markDirty();
    renderSpieltagListe();
  });

  el.querySelectorAll(".bogen-zeile").forEach((zeile) => {
    zeile.addEventListener("click", (e) => {
      const btn = e.target.closest(".ampel-btn");
      if (!btn) return;
      const spId = zeile.dataset.schwerpunkt;
      const wert = btn.dataset.ampel;
      // Nochmal auf den aktiven Wert tippen setzt zurueck auf "nicht beobachtet".
      if (sp.bewertungen[spId] === wert) delete sp.bewertungen[spId];
      else sp.bewertungen[spId] = wert;
      zeile.querySelectorAll(".ampel-btn").forEach((b) => {
        b.classList.toggle("active", sp.bewertungen[spId] === b.dataset.ampel);
      });
      markDirty();
      renderSpieltagListe();
    });
  });
}

// Erklärt, welcher Jahrgang zum Spieldatum in welcher Stufe steht — und meldet,
// wenn das nicht zur Stufe der Mannschaft passt. Genau dieser Fall tritt ein, wenn
// eine Mannschaftsbezeichnung stehenbleibt, während die Kinder weitergerückt sind.
function jahrgangHinweisText(spieltag, stufeDerMannschaft) {
  const jg = (spieltag.jahrgaenge || []);
  if (!jg.length) return "Ohne Jahrgang taucht dieser Bogen in keiner Jahrgangs-Auswertung auf.";
  const teile = jg.map((j) => {
    const u = uKlasseFuerJahrgang(j, spieltag.datum);
    const st = stufeFuerU(u);
    return `${j} spielt als U${u}${st ? " (" + st.name + ")" : ""}`;
  });
  const abweichend = stufeDerMannschaft && jg.some((j) => {
    const st = stufeFuerJahrgang(j, spieltag.datum);
    return st && st.id !== stufeDerMannschaft.id;
  });
  return teile.join(" · ") + (abweichend
    ? ` — das passt nicht zur hinterlegten Stufe ${stufeDerMannschaft.name}. Bewertet werden trotzdem deren Schwerpunkte; ggf. die Stufe der Mannschaft in der Verwaltung nachziehen.`
    : "");
}

function neuerSpieltag() {
  if (!canEdit() || !currentMannschaftId) return;
  const mannschaft = mannschaftById(currentMannschaftId);
  const sp = {
    id: uuid(),
    mannschaftId: currentMannschaftId,
    // Vorbelegung aus der Mannschaft — der Trainer soll nach dem Spiel nichts
    // tippen muessen, was ohnehin feststeht.
    jahrgaenge: mannschaft && Array.isArray(mannschaft.jahrgaenge) ? mannschaft.jahrgaenge.slice() : [],
    datum: heuteIso(),
    gegner: "",
    heim: true,
    ergebnis: "",
    bewertungen: {},
    fazit: "",
    erfasstVon: [currentVorname, currentNachname].filter(Boolean).join(" ") || currentUsername,
    erfasstAm: new Date().toISOString()
  };
  appData.spieltage.push(sp);
  currentSpieltagId = sp.id;
  markDirty(0);
  renderSpieltagEditor();
  renderSpieltagListe();
}

function loescheSpieltag(id) {
  if (!canEdit()) return;
  const sp = appData.spieltage.find((x) => x.id === id);
  if (!sp) return;
  if (!confirm(`Den Spieltag vom ${fmtDatum(sp.datum)} gegen ${sp.gegner || "—"} wirklich löschen?`)) return;
  appData.spieltage = appData.spieltage.filter((x) => x.id !== id);
  if (currentSpieltagId === id) currentSpieltagId = null;
  markDirty(0);
  renderSpieltagEditor();
  renderSpieltagListe();
}

// ---------- Tab: Auswertung ----------

function legendeHtml() {
  return `<div class="ampel-legende">` +
    AMPEL_STUFEN.map((a) => `<span><span class="ampel-punkt a-${escapeHtml(a.id)}"></span>${escapeHtml(a.label)}</span>`).join("") +
    `<span><span class="ampel-punkt a-leer"></span>Nicht beobachtet</span></div>`;
}

function matrixHtml(schwerpunkte, spieltage) {
  return `
    <div class="matrix-scroll">
      <table class="matrix">
        <thead>
          <tr>
            <th class="mx-schwerpunkt">Schwerpunkt</th>
            ${spieltage.map((s) => {
              const gegner = s.gegner || "—";
              const kurz = gegner.length > 12 ? gegner.slice(0, 11).trimEnd() + "…" : gegner;
              return `<th title="${escapeHtml(fmtDatum(s.datum) + " gegen " + gegner)}">${escapeHtml(fmtDatumKurz(s.datum))}<br>${escapeHtml(kurz)}</th>`;
            }).join("")}
          </tr>
        </thead>
        <tbody>
          ${schwerpunkte.map((sp) => `
            <tr>
              <td class="mx-schwerpunkt">${escapeHtml(sp.titel)}</td>
              ${spieltage.map((s) => {
                const w = s.bewertungen[sp.id];
                return `<td class="mx-zelle"><span class="ampel-punkt a-${escapeHtml(w || "leer")}" title="${escapeHtml(ampelLabel(w))}"></span></td>`;
              }).join("")}
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

// Durchgehende Linie des Umsetzungsgrades über ALLE Spieltage — die einzige
// Darstellung, die einen Stufenwechsel übersteht, weil sie keine Schwerpunkt-Zeilen
// vergleicht. Handgezeichnetes SVG: keine Bibliothek, läuft auch auf alten Geräten.
function verlaufChartHtml(spieltage) {
  const punkte = spieltage.map((s) => ({ s, wert: umsetzungsgrad(s) })).filter((p) => p.wert !== null);
  if (punkte.length < 2) return "";
  const w = Math.max(360, punkte.length * 58);
  const h = 176, pl = 38, pr = 16, pt = 16, pb = 46;
  const iw = w - pl - pr, ih = h - pt - pb;
  const x = (i) => pl + (i * iw) / (punkte.length - 1);
  const y = (v) => pt + ih - (v / 100) * ih;

  const gitter = [0, 25, 50, 75, 100].map((v) => `
    <line x1="${pl}" y1="${y(v).toFixed(1)}" x2="${w - pr}" y2="${y(v).toFixed(1)}" stroke="#dde1e8" stroke-width="1" />
    <text x="${pl - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#6b7280">${v}</text>`).join("");

  let trenner = `<text x="${pl + 3}" y="${pt + 11}" font-size="10" fill="#1a56a0">${escapeHtml(saisonAusDatum(punkte[0].s.datum))}</text>`;
  punkte.forEach((p, i) => {
    if (!i) return;
    const vorher = saisonAusDatum(punkte[i - 1].s.datum), jetzt = saisonAusDatum(p.s.datum);
    if (vorher === jetzt) return;
    const mx = ((x(i - 1) + x(i)) / 2).toFixed(1);
    trenner += `<line x1="${mx}" y1="${pt}" x2="${mx}" y2="${pt + ih}" stroke="#1a56a0" stroke-width="1" stroke-dasharray="4 3" />
      <text x="${Number(mx) + 4}" y="${pt + 11}" font-size="10" fill="#1a56a0">${escapeHtml(jetzt)}</text>`;
  });

  const pfad = punkte.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.wert).toFixed(1)}`).join(" ");
  const kreise = punkte.map((p, i) => `
    <circle cx="${x(i).toFixed(1)}" cy="${y(p.wert).toFixed(1)}" r="4" fill="#1a56a0">
      <title>${escapeHtml(fmtDatum(p.s.datum) + " gegen " + (p.s.gegner || "—") + ": " + p.wert + " %")}</title>
    </circle>`).join("");
  const beschriftung = punkte.map((p, i) => `
    <text x="${x(i).toFixed(1)}" y="${h - 26}" text-anchor="middle" font-size="10" fill="#6b7280">${escapeHtml(fmtDatumKurz(p.s.datum))}</text>
    <text x="${x(i).toFixed(1)}" y="${h - 13}" text-anchor="middle" font-size="10" fill="#1e2330">${p.wert}%</text>`).join("");

  return `
    <div class="chart-scroll">
      <svg class="verlauf-chart" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"
           aria-label="Umsetzungsgrad je Spieltag in Prozent">
        ${gitter}${trenner}
        <path d="${pfad}" fill="none" stroke="#1a56a0" stroke-width="2" />
        ${kreise}${beschriftung}
      </svg>
    </div>
    <p class="muted">Umsetzungsgrad je Spieltag: grün zählt voll, gelb halb, rot nicht. Nicht beobachtete Schwerpunkte bleiben außen vor. Die gestrichelten Linien markieren den Saisonwechsel.</p>`;
}

function renderAuswertung() {
  const jahrgangModus = auswertungModus === "jahrgang";
  document.querySelectorAll("#auswertung-modus button").forEach((b) => {
    b.classList.toggle("active", b.dataset.modus === auswertungModus);
  });
  document.getElementById("feld-auswertung-mannschaft").style.display = jahrgangModus ? "none" : "";
  document.getElementById("feld-auswertung-jahrgang").style.display = jahrgangModus ? "" : "none";
  document.getElementById("feld-auswertung-saison").style.display = jahrgangModus ? "none" : "";
  document.getElementById("auswertung-erklaerung").textContent = jahrgangModus
    ? "Ein Jahrgang wandert über die Jahre durch die Stufen. Deshalb steht hier je Saison ein eigener Block mit den damals gültigen Schwerpunkten — darüber die durchgehende Kurve, die den Stufenwechsel übersteht."
    : "Schwerpunkte gegen Spieltage. Jede Spalte ist ein Spiel, jede Zeile ein Schwerpunkt der Stufe.";
  if (jahrgangModus) renderAuswertungJahrgang();
  else renderAuswertungMannschaft();
}

function renderAuswertungMannschaft() {
  const el = document.getElementById("auswertung-inhalt");
  const liste = fuelleMannschaftSelect("auswertung-mannschaft", auswertungMannschaftId || currentMannschaftId);
  if (!liste.length) {
    document.getElementById("auswertung-saison").innerHTML = "";
    el.innerHTML = `<div class="card"><div class="empty-state">Es ist noch keine aktive Mannschaft angelegt.</div></div>`;
    return;
  }
  if (!auswertungMannschaftId || !liste.some((m) => m.id === auswertungMannschaftId)) {
    auswertungMannschaftId = document.getElementById("auswertung-mannschaft").value || liste[0].id;
  }
  document.getElementById("auswertung-mannschaft").value = auswertungMannschaftId;

  const alle = spieltageFuerMannschaft(auswertungMannschaftId);
  const saisons = Array.from(new Set(alle.map((s) => saisonAusDatum(s.datum)).filter(Boolean))).sort().reverse();
  const saisonSel = document.getElementById("auswertung-saison");
  saisonSel.innerHTML = `<option value="">Alle Saisons</option>` +
    saisons.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
  if (auswertungSaison && saisons.includes(auswertungSaison)) saisonSel.value = auswertungSaison;
  else auswertungSaison = "";

  const spieltage = auswertungSaison ? alle.filter((s) => saisonAusDatum(s.datum) === auswertungSaison) : alle;
  const m = mannschaftById(auswertungMannschaftId);
  const st = m ? stufeById(m.stufeId) : null;
  const sps = st ? schwerpunkteFuerStufe(st.id, true) : [];

  if (!spieltage.length || !sps.length) {
    el.innerHTML = `<div class="card"><div class="empty-state">${escapeHtml(!sps.length
      ? "Für die Stufe dieser Mannschaft sind noch keine Schwerpunkte hinterlegt."
      : "Keine Spieltage für diese Auswahl.")}</div></div>`;
    return;
  }
  el.innerHTML = `<div class="card">${matrixHtml(sps, spieltage)}${legendeHtml()}</div>`;
}

function renderAuswertungJahrgang() {
  const el = document.getElementById("auswertung-inhalt");
  const jgListe = alleJahrgaenge();
  const sel = document.getElementById("auswertung-jahrgang");
  if (!jgListe.length) {
    sel.innerHTML = "";
    el.innerHTML = `<div class="card"><div class="empty-state">
      Noch kein Jahrgang hinterlegt. Jahrgänge werden an der Mannschaft gepflegt (Verwaltung) und beim Anlegen eines Spieltag-Bogens vorbelegt.
    </div></div>`;
    return;
  }
  sel.innerHTML = jgListe.map((j) => {
    const u = uKlasseFuerJahrgang(j, heuteIso());
    const st = stufeFuerU(u);
    return `<option value="${j}">${j} — aktuell U${u}${st ? ", " + escapeHtml(st.name) : ""}</option>`;
  }).join("");
  if (!auswertungJahrgang || !jgListe.includes(Number(auswertungJahrgang))) auswertungJahrgang = jgListe[0];
  sel.value = String(auswertungJahrgang);

  const spieltage = spieltageFuerJahrgang(auswertungJahrgang);
  if (!spieltage.length) {
    el.innerHTML = `<div class="card"><div class="empty-state">Für den Jahrgang ${escapeHtml(auswertungJahrgang)} ist noch kein Spieltag erfasst.</div></div>`;
    return;
  }

  // Je Saison ein Block, innerhalb der Saison je Stufe einer — spielt ein Jahrgang
  // in einer Saison in zwei Mannschaften verschiedener Stufen, wäre eine gemeinsame
  // Matrix aus Zeilen gebaut, die nichts miteinander zu tun haben.
  const bloecke = [];
  spieltage.forEach((sp) => {
    const saison = saisonAusDatum(sp.datum);
    const st = stufeFuerBogen(sp);
    const key = saison + "|" + (st ? st.id : "-");
    let block = bloecke.find((b) => b.key === key);
    if (!block) { block = { key, saison, stufe: st, spieltage: [] }; bloecke.push(block); }
    block.spieltage.push(sp);
  });
  bloecke.reverse(); // neueste Saison zuerst

  const uJetzt = uKlasseFuerJahrgang(auswertungJahrgang, heuteIso());
  const stJetzt = stufeFuerU(uJetzt);

  el.innerHTML = `
    <div class="card">
      <h2>Jahrgang ${escapeHtml(auswertungJahrgang)}</h2>
      <p class="muted">In der laufenden Saison ${escapeHtml(saisonAusDatum(heuteIso()))} als <strong>U${uJetzt}</strong>${stJetzt ? " in der Stufe " + escapeHtml(stJetzt.name) : ""} — ${spieltage.length} erfasste Spieltage über ${bloecke.length} Saison-Abschnitt${bloecke.length === 1 ? "" : "e"}.</p>
      ${verlaufChartHtml(spieltage) || `<p class="muted">Die Verlaufskurve erscheint, sobald mindestens zwei Spieltage bewertet sind.</p>`}
    </div>
    ${bloecke.map((b) => {
      const sps = b.stufe ? schwerpunkteFuerStufe(b.stufe.id, true) : [];
      const mannschaften = Array.from(new Set(b.spieltage.map((s) => {
        const m = mannschaftById(s.mannschaftId);
        return m ? m.name : "unbekannte Mannschaft";
      })));
      return `
        <div class="card">
          <div class="card-header-row">
            <h2>Saison ${escapeHtml(b.saison)}${b.stufe ? " — " + escapeHtml(stufeLabel(b.stufe)) : ""}</h2>
            <span class="tag">${b.spieltage.length} Spieltag${b.spieltage.length === 1 ? "" : "e"}</span>
          </div>
          <p class="muted">Gespielt als ${escapeHtml(mannschaften.join(", "))}.</p>
          ${sps.length
            ? matrixHtml(sps, b.spieltage) + legendeHtml()
            : `<div class="empty-state">Für diese Stufe sind keine Schwerpunkte hinterlegt.</div>`}
        </div>`;
    }).join("")}`;
}

// ---------- Tab: Verwaltung ----------

function vwFeld(label, id, wert, typ, optionen) {
  if (typ === "textarea") {
    return `<div class="form-field"><label>${escapeHtml(label)}</label><textarea id="${id}" rows="3">${escapeHtml(wert || "")}</textarea></div>`;
  }
  if (typ === "select") {
    return `<div class="form-field"><label>${escapeHtml(label)}</label><select id="${id}">${
      optionen.map((o) => `<option value="${escapeHtml(o.id)}"${String(o.id) === String(wert) ? " selected" : ""}>${escapeHtml(o.label)}</option>`).join("")
    }</select></div>`;
  }
  if (typ === "checkbox") {
    return `<div class="form-field"><label>${escapeHtml(label)}</label>
      <div class="checkbox-zeile"><input type="checkbox" id="${id}"${wert ? " checked" : ""} /><span class="cbz-text">ja</span></div></div>`;
  }
  if (typ === "datalist") {
    // ⚠️ Die datalist steht IM Formular, nicht einmalig in der index.html:
    // #verwaltung-inhalt wird bei jedem Render komplett neu gebaut, eine
    // außerhalb liegende Liste wäre beim ersten Öffnen noch leer gewesen.
    // Freitext bleibt möglich — eine datalist schlägt vor, sie verbietet nicht.
    const opts = (optionen || [])
      .map((o) => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.label)}</option>`).join("");
    return `<div class="form-field"><label>${escapeHtml(label)}</label>
      <input type="text" id="${id}" list="${id}-liste" autocomplete="off" value="${escapeHtml(wert === null || wert === undefined ? "" : wert)}" />
      <datalist id="${id}-liste">${opts}</datalist></div>`;
  }
  const t = typ === "number" ? "number" : "text";
  return `<div class="form-field"><label>${escapeHtml(label)}</label><input type="${t}" id="${id}" value="${escapeHtml(wert === null || wert === undefined ? "" : wert)}" /></div>`;
}

// Schreibt die Formulardaten in den Bestand: entweder als neuer Eintrag oder in
// den vorhandenen. Faellt der vorhandene weg (parallel geloescht), wird nichts
// stillschweigend ins Leere geschrieben.
function vwUebernehmen(liste, daten) {
  if (vwEditId === "neu") { liste.push(Object.assign({ id: uuid() }, daten)); return true; }
  const vorhanden = liste.find((x) => x.id === vwEditId);
  if (!vorhanden) { alert("Der Eintrag existiert nicht mehr — er wurde zwischenzeitlich gelöscht."); return false; }
  Object.assign(vorhanden, daten);
  return true;
}

function vwWert(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  if (el.type === "checkbox") return el.checked;
  return el.value;
}

function vwZahl(id) {
  const v = String(vwWert(id)).trim();
  if (v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function setupVerwaltungSubnav() {
  document.getElementById("verwaltung-subnav").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-vw]");
    if (!b) return;
    vwView = b.dataset.vw;
    vwEditId = null;
    document.querySelectorAll("#verwaltung-subnav button").forEach((x) => x.classList.toggle("active", x === b));
    renderVerwaltung();
  });
}

function renderVerwaltung() {
  if (!canAdmin()) { document.getElementById("verwaltung-inhalt").innerHTML = ""; return; }
  const el = document.getElementById("verwaltung-inhalt");
  if (vwView === "startbestand") { el.innerHTML = vwStartbestandHtml(); bindeStartbestand(); return; }
  if (vwView === "mannschaften") { el.innerHTML = vwMannschaftenHtml(); }
  if (vwView === "bereiche") { el.innerHTML = vwBereicheHtml(); }
  if (vwView === "stufen") { el.innerHTML = vwStufenHtml(); }
  if (vwView === "schwerpunkte") { el.innerHTML = vwSchwerpunkteHtml(); }
  if (vwView === "uebungen") { el.innerHTML = vwUebungenHtml(); }
  bindeStufenwechselImSchwerpunkt();
  bindeMannschaftAusVereinsliste();
}

// Wird im Mannschafts-Formular ein Name aus der Vereinsliste gewählt, zieht die
// Juniorenstufe mit. Die zentrale Liste leitet den Buchstaben aus dem Kurznamen
// ab ("B2" → "b"), und die Stufen dieser App tragen genau diese Ids (seed.js).
//
// ⚠️ Zieht NUR nach, solange niemand die Stufe von Hand angefasst hat. Ein
// Verein hat Fälle, in denen die Mannschaftsbezeichnung nicht zur Stufe passt
// (eine D2, die als Jahrgang hochspielt) — eine Handeingabe darf ein späterer
// Tastendruck im Namensfeld nicht wieder wegräumen. Gleiche Linie wie die
// Liga-Automatik im Busplan.
function bindeMannschaftAusVereinsliste() {
  if (vwView !== "mannschaften") return;
  const nameFeld = document.getElementById("vw-name");
  const stufeFeld = document.getElementById("vw-stufeId");
  if (!nameFeld || !stufeFeld) return;

  let stufeVonHand = false;
  stufeFeld.addEventListener("change", () => { stufeVonHand = true; });

  nameFeld.addEventListener("input", () => {
    if (stufeVonHand) return;
    const treffer = vereinsMannschaften.find(
      (v) => v.kurz.toLowerCase() === nameFeld.value.trim().toLowerCase()
    );
    if (!treffer || !treffer.stufe) return;
    // Nur setzen, wenn es die Stufe hier auch wirklich gibt: "herren" und
    // "sonstige" kennt der Ausbildungsplan nicht, der endet im Juniorenbereich.
    const stufe = stufeById(treffer.stufe);
    if (!stufe) return;
    stufeFeld.value = treffer.stufe;
    // Der Jahrgangs-Hinweis nennt die Stufe beim Namen — er hängt an keinem
    // Listener und stünde sonst mit der alten Stufe daneben.
    const hinweis = document.getElementById("vw-jahrgang-hinweis");
    if (hinweis) {
      const jg = vorschlagJahrgaenge(stufe);
      hinweis.textContent = jg.length
        ? `In der laufenden Saison spielt die ${stufe.name} den Jahrgang ${jg.join(", ")}. Mehrere durch Komma trennen.`
        : "Mehrere Jahrgänge durch Komma trennen, z.B. 2014, 2015.";
    }
  });
}

function vwListeHtml(titel, hinweis, zeilen, neuLabel) {
  return `
    <div class="card">
      <div class="card-header-row">
        <h2>${escapeHtml(titel)}</h2>
        <button type="button" class="btn success small" data-vw-neu="1">${escapeHtml(neuLabel)}</button>
      </div>
      ${hinweis ? `<p class="muted" style="margin-bottom:12px;">${escapeHtml(hinweis)}</p>` : ""}
      ${zeilen.length ? zeilen.join("") : `<div class="empty-state">Noch nichts angelegt.</div>`}
    </div>`;
}

function vwZeileHtml(id, titel, sub) {
  return `
    <div class="vw-row" data-id="${escapeHtml(id)}">
      <div class="vw-row-main">
        <div class="vr-titel">${escapeHtml(titel)}</div>
        ${sub ? `<div class="vr-sub">${escapeHtml(sub)}</div>` : ""}
      </div>
      <div class="vw-row-actions">
        <button type="button" class="btn secondary small" data-vw-edit="1">Bearbeiten</button>
        <button type="button" class="btn secondary small" data-vw-del="1">Löschen</button>
      </div>
    </div>`;
}

function vwFormularHtml(titel, felder, extra) {
  return `
    <div class="card">
      <h2>${escapeHtml(titel)}</h2>
      <div class="form-grid wide">${felder.join("")}</div>
      ${extra || ""}
      <div class="btn-row" style="justify-content:flex-end; margin-top:16px;">
        <button type="button" class="btn secondary" data-vw-abbruch="1">Abbrechen</button>
        <button type="button" class="btn success" data-vw-save="1">Speichern</button>
      </div>
    </div>`;
}

// --- Mannschaften ---

function vwMannschaftenHtml() {
  const zeilen = mannschaftenSortiert(false).map((m) => {
    const st = stufeById(m.stufeId);
    const anzahl = spieltageFuerMannschaft(m.id).length;
    const jg = (m.jahrgaenge || []).length ? "Jahrgang " + jahrgaengeText(m.jahrgaenge) : "kein Jahrgang hinterlegt";
    return vwZeileHtml(m.id, m.name + (m.aktiv === false ? " (inaktiv)" : ""),
      `${st ? stufeLabel(st) : "keine Stufe zugeordnet"} · ${jg} · ${anzahl} Spieltag${anzahl === 1 ? "" : "e"}`);
  });
  let html = vwListeHtml("Mannschaften",
    "Die Stufe bestimmt, welche Schwerpunkte im Spieltag-Bogen stehen. Die Jahrgänge bestimmen, welcher Kohorte ein Bogen zugerechnet wird — sie werden beim Anlegen eines Bogens vorbelegt und wandern über die Jahre mit.",
    zeilen, "+ Neue Mannschaft");
  if (vwEditId) {
    const m = vwEditId === "neu"
      ? { name: "", stufeId: (stufenSortiert()[0] || {}).id, jahrgaenge: [], aktiv: true }
      : mannschaftById(vwEditId);
    if (m) {
      const st = stufeById(m.stufeId);
      const vorschlag = st ? vorschlagJahrgaenge(st) : [];
      html += vwFormularHtml(vwEditId === "neu" ? "Neue Mannschaft" : "Mannschaft bearbeiten", [
        vwFeld("Name", "vw-name", m.name, "datalist", vereinsMannschaften.map((v) => ({
          id: v.kurz,
          label: v.lang + (v.liga ? " · " + v.liga : "")
        }))),
        vwFeld("Juniorenstufe", "vw-stufeId", m.stufeId, "select", stufenSortiert().map((s) => ({ id: s.id, label: stufeLabel(s) }))),
        vwFeld("Jahrgänge", "vw-jahrgaenge", jahrgaengeText(m.jahrgaenge), "text"),
        vwFeld("Aktiv", "vw-aktiv", m.aktiv !== false, "checkbox")
      ], `<p class="muted" id="vw-jahrgang-hinweis">${vorschlag.length
            ? `In der laufenden Saison spielt die ${escapeHtml(st.name)} den Jahrgang ${escapeHtml(vorschlag.join(", "))}. Mehrere durch Komma trennen.`
            : "Mehrere Jahrgänge durch Komma trennen, z.B. 2014, 2015."}</p>`);
    }
  }
  return html;
}

// Welche Geburtsjahrgänge spielen in der laufenden Saison in dieser Stufe?
// Umkehrung von uKlasseFuerJahrgang: Jahrgang = Saison-Endjahr − U-Klasse.
function vorschlagJahrgaenge(stufe) {
  const saison = saisonAusDatum(heuteIso());
  if (!saison || !stufe || stufe.vonU === null || stufe.vonU === undefined) return [];
  const endjahr = Number(saison.slice(0, 4)) + 1;
  const jg = [];
  for (let u = Number(stufe.vonU); u <= Number(stufe.bisU); u++) jg.push(endjahr - u);
  return jg.sort((a, b) => a - b);
}

function speichereMannschaft() {
  const name = String(vwWert("vw-name")).trim();
  if (!name) { alert("Bitte einen Namen angeben."); return false; }
  const daten = {
    name, stufeId: vwWert("vw-stufeId"),
    jahrgaenge: jahrgaengeAusText(vwWert("vw-jahrgaenge")),
    aktiv: !!vwWert("vw-aktiv")
  };
  return vwUebernehmen(appData.mannschaften, daten);
}

function loescheMannschaft(id) {
  const anzahl = spieltageFuerMannschaft(id).length;
  const m = mannschaftById(id);
  const frage = anzahl
    ? `„${m.name}“ hat ${anzahl} erfasste Spieltage. Mannschaft UND Spieltage endgültig löschen?`
    : `„${m.name}“ wirklich löschen?`;
  if (!confirm(frage)) return;
  appData.mannschaften = appData.mannschaften.filter((x) => x.id !== id);
  appData.spieltage = appData.spieltage.filter((x) => x.mannschaftId !== id);
  if (currentMannschaftId === id) currentMannschaftId = null;
  if (auswertungMannschaftId === id) auswertungMannschaftId = null;
  markDirty(0);
}

// --- Bereiche ---

function vwBereicheHtml() {
  const zeilen = appData.bereiche.slice().sort(nachReihenfolge)
    .map((b) => vwZeileHtml(b.id, b.name, `U${b.vonU} bis U${b.bisU}`));
  let html = vwListeHtml("Bereiche", "Die Gliederung der Nachwuchsförderung. Ändert sie sich, wird hier angepasst — nicht im Code.", zeilen, "+ Neuer Bereich");
  if (vwEditId) {
    const b = vwEditId === "neu" ? { name: "", vonU: 6, bisU: 13, reihenfolge: appData.bereiche.length + 1 } : bereichById(vwEditId);
    if (b) {
      html += vwFormularHtml(vwEditId === "neu" ? "Neuer Bereich" : "Bereich bearbeiten", [
        vwFeld("Name", "vw-name", b.name, "text"),
        vwFeld("Von U", "vw-vonU", b.vonU, "number"),
        vwFeld("Bis U", "vw-bisU", b.bisU, "number"),
        vwFeld("Reihenfolge", "vw-reihenfolge", b.reihenfolge, "number")
      ]);
    }
  }
  return html;
}

function speichereBereich() {
  const name = String(vwWert("vw-name")).trim();
  if (!name) { alert("Bitte einen Namen angeben."); return false; }
  const daten = { name, vonU: vwZahl("vw-vonU"), bisU: vwZahl("vw-bisU"), reihenfolge: vwZahl("vw-reihenfolge") };
  return vwUebernehmen(appData.bereiche, daten);
}

function loescheBereich(id) {
  const stufen = appData.stufen.filter((s) => s.bereichId === id);
  if (stufen.length) { alert(`Diesem Bereich sind noch ${stufen.length} Stufen zugeordnet. Erst dort umhängen.`); return; }
  if (!confirm("Bereich wirklich löschen?")) return;
  appData.bereiche = appData.bereiche.filter((x) => x.id !== id);
  markDirty(0);
}

// --- Stufen ---

function vwStufenHtml() {
  const zeilen = stufenSortiert().map((s) => {
    const b = bereichById(s.bereichId);
    const n = schwerpunkteFuerStufe(s.id, false).length;
    return vwZeileHtml(s.id, stufeLabel(s), `${b ? b.name : "kein Bereich"} · ${n} Schwerpunkt${n === 1 ? "" : "e"}`);
  });
  let html = vwListeHtml("Juniorenstufen", "Auf dieser Ebene werden die Schwerpunkte gepflegt. Die U-Spanne bestimmt, welche Mannschaft welche Inhalte sieht.", zeilen, "+ Neue Stufe");
  if (vwEditId) {
    const s = vwEditId === "neu"
      ? { kuerzel: "", name: "", vonU: 6, bisU: 7, bereichId: (appData.bereiche[0] || {}).id, reihenfolge: appData.stufen.length + 1,
          altersspanne: "", entwicklungsstand: "", obergrenzeText: "", obergrenzeSpieler: null, anspielerErlaubt: false,
          nettospielzeit: "", betreuung: "", frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: false }, spieltagHinweise: "", hinweis: "" }
      : stufeById(vwEditId);
    if (s) {
      const f = s.frequenz || {};
      html += vwFormularHtml(vwEditId === "neu" ? "Neue Stufe" : "Stufe bearbeiten", [
        vwFeld("Kürzel", "vw-kuerzel", s.kuerzel, "text"),
        vwFeld("Name", "vw-name", s.name, "text"),
        vwFeld("Von U", "vw-vonU", s.vonU, "number"),
        vwFeld("Bis U", "vw-bisU", s.bisU, "number"),
        vwFeld("Bereich", "vw-bereichId", s.bereichId, "select", appData.bereiche.map((b) => ({ id: b.id, label: b.name }))),
        vwFeld("Reihenfolge", "vw-reihenfolge", s.reihenfolge, "number"),
        vwFeld("Altersspanne (Text)", "vw-altersspanne", s.altersspanne, "text"),
        vwFeld("Obergrenze (Text)", "vw-obergrenzeText", s.obergrenzeText, "text"),
        vwFeld("Obergrenze Spieler pro Team", "vw-obergrenzeSpieler", s.obergrenzeSpieler, "number"),
        vwFeld("Anspieler-Erweiterung erlaubt", "vw-anspielerErlaubt", s.anspielerErlaubt, "checkbox"),
        vwFeld("Mindest-Nettospielzeit", "vw-nettospielzeit", s.nettospielzeit, "text"),
        vwFeld("Betreuungsschlüssel", "vw-betreuung", s.betreuung, "text"),
        vwFeld("Mannschaftstrainings/Woche", "vw-freqM", f.mannschaft, "number"),
        vwFeld("Fördertrainings/Woche", "vw-freqF", f.foerder, "number"),
        vwFeld("Fördertraining freiwillig", "vw-freqFreiwillig", f.foerderFreiwillig, "checkbox"),
        vwFeld("Entwicklungsstand", "vw-entwicklungsstand", s.entwicklungsstand, "textarea"),
        vwFeld("Hinweise zum Spieltag", "vw-spieltagHinweise", s.spieltagHinweise, "textarea"),
        vwFeld("Hinweis (Kasten oben)", "vw-hinweis", s.hinweis, "textarea")
      ], `<p class="muted">Die Obergrenze in Spielern ist der Wert, gegen den das Tool rechnet. Bei Stufen mit Anspieler-Erweiterung ist das die rechnerische Grenze (4 Kernspieler + 2 Anspieler = 6).</p>`);
    }
  }
  return html;
}

function speichereStufe() {
  const name = String(vwWert("vw-name")).trim();
  if (!name) { alert("Bitte einen Namen angeben."); return false; }
  const daten = {
    kuerzel: String(vwWert("vw-kuerzel")).trim(), name,
    vonU: vwZahl("vw-vonU"), bisU: vwZahl("vw-bisU"),
    bereichId: vwWert("vw-bereichId"), reihenfolge: vwZahl("vw-reihenfolge"),
    altersspanne: vwWert("vw-altersspanne"), entwicklungsstand: vwWert("vw-entwicklungsstand"),
    obergrenzeText: vwWert("vw-obergrenzeText"), obergrenzeSpieler: vwZahl("vw-obergrenzeSpieler"),
    anspielerErlaubt: !!vwWert("vw-anspielerErlaubt"),
    nettospielzeit: vwWert("vw-nettospielzeit"), betreuung: vwWert("vw-betreuung"),
    frequenz: { mannschaft: vwZahl("vw-freqM"), foerder: vwZahl("vw-freqF"), foerderFreiwillig: !!vwWert("vw-freqFreiwillig") },
    spieltagHinweise: vwWert("vw-spieltagHinweise"), hinweis: vwWert("vw-hinweis")
  };
  return vwUebernehmen(appData.stufen, daten);
}

function loescheStufe(id) {
  const sps = schwerpunkteFuerStufe(id, false).length;
  const ms = appData.mannschaften.filter((m) => m.stufeId === id).length;
  if (sps || ms) { alert(`An dieser Stufe hängen noch ${sps} Schwerpunkte und ${ms} Mannschaften. Erst dort umhängen oder löschen.`); return; }
  if (!confirm("Stufe wirklich löschen?")) return;
  appData.stufen = appData.stufen.filter((x) => x.id !== id);
  if (currentStufeId === id) currentStufeId = null;
  markDirty(0);
}

// --- Schwerpunkte ---

function vwSchwerpunkteHtml() {
  const zeilen = stufenSortiert().flatMap((st) =>
    schwerpunkteFuerStufe(st.id, false).map((sp) =>
      vwZeileHtml(sp.id, sp.titel + (sp.aktiv === false ? " (inaktiv)" : ""),
        `${st.name} · ${trainingsartLabel(sp.trainingsart)} · ${sp.uebungIds.length} Übung${sp.uebungIds.length === 1 ? "" : "en"}`)));
  let html = vwListeHtml("Trainingsschwerpunkte", "Was in einer Altersklasse ausgebildet wird. Die verknüpften Übungen kommen aus dem gemeinsamen Katalog.", zeilen, "+ Neuer Schwerpunkt");
  if (vwEditId) {
    const sp = vwEditId === "neu"
      ? { stufeId: currentStufeId || (stufenSortiert()[0] || {}).id, titel: "", beschreibung: "", trainingsart: "mannschaft",
          reihenfolge: 99, aktiv: true, uebungIds: [] }
      : appData.schwerpunkte.find((x) => x.id === vwEditId);
    if (sp) {
      const stufe = stufeById(sp.stufeId);
      const gruppen = appData.saeulen.slice().sort(nachReihenfolge).map((s) => ({
        saeule: s, uebungen: appData.uebungen.filter((u) => u.saeule === s.id).sort((a, b) => String(a.id).localeCompare(String(b.id)))
      })).filter((g) => g.uebungen.length);
      const checkliste = `
        <div class="form-field" style="margin-top:14px;">
          <label>Verknüpfte Übungen</label>
          <div class="checkbox-liste" id="vw-uebungen">
            ${gruppen.map((g) => `
              <div class="cbz-meta" style="font-weight:700; margin-top:6px;">${escapeHtml(g.saeule.name)}</div>
              ${g.uebungen.map((u) => {
                const ueber = uebungUeberGrenze(u, stufe);
                return `<label class="checkbox-zeile">
                  <input type="checkbox" value="${escapeHtml(u.id)}"${sp.uebungIds.includes(u.id) ? " checked" : ""} />
                  <span class="cbz-text">${escapeHtml(u.name)}
                    <span class="cbz-meta">${escapeHtml(u.spielform)}${ueber ? " — über der DFB-Obergrenze dieser Stufe" : ""}</span>
                  </span>
                </label>`;
              }).join("")}`).join("")}
          </div>
        </div>`;
      html += vwFormularHtml(vwEditId === "neu" ? "Neuer Schwerpunkt" : "Schwerpunkt bearbeiten", [
        vwFeld("Stufe", "vw-stufeId", sp.stufeId, "select", stufenSortiert().map((s) => ({ id: s.id, label: stufeLabel(s) }))),
        vwFeld("Titel", "vw-titel", sp.titel, "text"),
        vwFeld("Trainingsart", "vw-trainingsart", sp.trainingsart, "select", TRAININGSARTEN.map((t) => ({ id: t.id, label: t.label }))),
        vwFeld("Reihenfolge", "vw-reihenfolge", sp.reihenfolge, "number"),
        vwFeld("Aktiv", "vw-aktiv", sp.aktiv !== false, "checkbox"),
        vwFeld("Beschreibung", "vw-beschreibung", sp.beschreibung, "textarea")
      ], checkliste);
    }
  }
  return html;
}

function speichereSchwerpunkt() {
  const titel = String(vwWert("vw-titel")).trim();
  if (!titel) { alert("Bitte einen Titel angeben."); return false; }
  const uebungIds = Array.from(document.querySelectorAll("#vw-uebungen input[type=checkbox]"))
    .filter((c) => c.checked).map((c) => c.value);
  const daten = {
    stufeId: vwWert("vw-stufeId"), titel, beschreibung: vwWert("vw-beschreibung"),
    trainingsart: vwWert("vw-trainingsart"), reihenfolge: vwZahl("vw-reihenfolge"),
    aktiv: !!vwWert("vw-aktiv"), uebungIds
  };
  return vwUebernehmen(appData.schwerpunkte, daten);
}

function loescheSchwerpunkt(id) {
  const betroffen = appData.spieltage.filter((s) => s.bewertungen && s.bewertungen[id]).length;
  const frage = betroffen
    ? `Dieser Schwerpunkt ist in ${betroffen} Spieltag-Bögen bewertet. Löschen entfernt ihn aus der Auswertung. Fortfahren?`
    : "Schwerpunkt wirklich löschen?";
  if (!confirm(frage)) return;
  appData.schwerpunkte = appData.schwerpunkte.filter((x) => x.id !== id);
  appData.spieltage.forEach((s) => { if (s.bewertungen) delete s.bewertungen[id]; });
  markDirty(0);
}

// --- Übungen ---

function vwUebungenHtml() {
  const zeilen = appData.saeulen.slice().sort(nachReihenfolge).flatMap((sa) =>
    appData.uebungen.filter((u) => u.saeule === sa.id).sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .map((u) => {
        const anzahl = appData.schwerpunkte.filter((sp) => sp.uebungIds.includes(u.id)).length;
        return vwZeileHtml(u.id, u.name, `${sa.name} · ${u.spielform || ""} · an ${anzahl} Schwerpunkt${anzahl === 1 ? "" : "en"}`);
      }));
  let html = vwListeHtml("Übungskatalog", "Der gemeinsame Bestand. Eine Änderung hier wirkt überall, wo die Übung verknüpft ist.", zeilen, "+ Neue Übung");
  if (vwEditId) {
    const u = vwEditId === "neu"
      ? { name: "", saeule: (appData.saeulen[0] || {}).id, aufbau: "", ablauf: "", varianten: "",
          spielform: "", spielerProTeam: null, anspieler: 0, mitTorhueter: false, spielerGesamt: null,
          feldgroesse: "", trainingsart: "beide", zitat: "", zitatVon: "" }
      : uebungById(vwEditId);
    if (u) {
      html += vwFormularHtml(vwEditId === "neu" ? "Neue Übung" : "Übung bearbeiten", [
        vwFeld("Name", "vw-name", u.name, "text"),
        vwFeld("Säule", "vw-saeule", u.saeule, "select", appData.saeulen.map((s) => ({ id: s.id, label: s.name }))),
        vwFeld("Spielform (Text)", "vw-spielform", u.spielform, "text"),
        vwFeld("Spieler pro Team", "vw-spielerProTeam", u.spielerProTeam, "number"),
        vwFeld("Anspieler", "vw-anspieler", u.anspieler, "number"),
        vwFeld("Spieler gesamt", "vw-spielerGesamt", u.spielerGesamt, "number"),
        vwFeld("Mit Torhüter", "vw-mitTorhueter", u.mitTorhueter, "checkbox"),
        vwFeld("Feldgröße", "vw-feldgroesse", u.feldgroesse, "text"),
        vwFeld("Trainingsart", "vw-trainingsart", u.trainingsart, "select", TRAININGSARTEN.map((t) => ({ id: t.id, label: t.label }))),
        vwFeld("Aufbau", "vw-aufbau", u.aufbau, "textarea"),
        vwFeld("Ablauf", "vw-ablauf", u.ablauf, "textarea"),
        vwFeld("Varianten", "vw-varianten", u.varianten, "textarea"),
        vwFeld("Zitat", "vw-zitat", u.zitat, "textarea"),
        vwFeld("Zitat von", "vw-zitatVon", u.zitatVon, "text")
      ], `<p class="muted">„Spieler pro Team“ ist der Wert, den das Tool gegen die DFB-Obergrenze der Stufe prüft.</p>`);
    }
  }
  return html;
}

function speichereUebung() {
  const name = String(vwWert("vw-name")).trim();
  if (!name) { alert("Bitte einen Namen angeben."); return false; }
  const daten = {
    name, saeule: vwWert("vw-saeule"), spielform: vwWert("vw-spielform"),
    spielerProTeam: vwZahl("vw-spielerProTeam"), anspieler: vwZahl("vw-anspieler"),
    spielerGesamt: vwZahl("vw-spielerGesamt"), mitTorhueter: !!vwWert("vw-mitTorhueter"),
    feldgroesse: vwWert("vw-feldgroesse"), trainingsart: vwWert("vw-trainingsart"),
    aufbau: vwWert("vw-aufbau"), ablauf: vwWert("vw-ablauf"), varianten: vwWert("vw-varianten"),
    zitat: vwWert("vw-zitat"), zitatVon: vwWert("vw-zitatVon")
  };
  return vwUebernehmen(appData.uebungen, daten);
}

function loescheUebung(id) {
  const verknuepft = appData.schwerpunkte.filter((sp) => sp.uebungIds.includes(id)).length;
  const frage = verknuepft
    ? `Diese Übung ist an ${verknuepft} Schwerpunkten verknüpft. Löschen entfernt sie überall. Fortfahren?`
    : "Übung wirklich löschen?";
  if (!confirm(frage)) return;
  appData.uebungen = appData.uebungen.filter((x) => x.id !== id);
  appData.schwerpunkte.forEach((sp) => { sp.uebungIds = sp.uebungIds.filter((x) => x !== id); });
  markDirty(0);
}

// --- Startbestand ---

function vwStartbestandHtml() {
  return `
    <div class="card">
      <h2>Startbestand einspielen</h2>
      <p class="muted">
        Spielt die Inhalte aus der Trainingsphilosophie Deutschland ein:
        ${SEED_BEREICHE.length} Bereiche, ${SEED_STUFEN.length} Juniorenstufen,
        ${SEED_SAEULEN.length} Säulen, ${SEED_SCHWERPUNKTE.length} Schwerpunkte und
        ${SEED_UEBUNGEN.length} Übungen.
      </p>
      <div class="hinweis-box">
        Der Vorgang ist wiederholbar und überschreibt nichts: Was bereits vorhanden ist,
        bleibt unverändert — es werden nur fehlende Einträge ergänzt. Eigene Änderungen an
        Texten und Verknüpfungen gehen also nicht verloren.
      </div>
      <p class="muted">Aktuell im Tool: ${appData.bereiche.length} Bereiche, ${appData.stufen.length} Stufen, ${appData.saeulen.length} Säulen, ${appData.schwerpunkte.length} Schwerpunkte, ${appData.uebungen.length} Übungen.</p>
      <div class="btn-row" style="justify-content:flex-start; margin-top:14px;">
        <button type="button" class="btn success" id="btn-seed">Fehlende Einträge einspielen</button>
      </div>
      <p class="muted" id="seed-ergebnis" style="margin-top:12px;"></p>
    </div>`;
}

// Idempotent per id — deshalb ist ein zweiter Lauf harmlos.
function spieleSeedEin() {
  if (!canAdmin()) return null;
  const ergaenzt = { bereiche: 0, stufen: 0, saeulen: 0, uebungen: 0, schwerpunkte: 0 };
  const uebernimm = (zielKey, quelle, zaehler) => {
    quelle.forEach((eintrag) => {
      if (appData[zielKey].some((x) => x.id === eintrag.id)) return;
      appData[zielKey].push(JSON.parse(JSON.stringify(eintrag)));
      ergaenzt[zaehler]++;
    });
  };
  uebernimm("bereiche", SEED_BEREICHE, "bereiche");
  uebernimm("stufen", SEED_STUFEN, "stufen");
  uebernimm("saeulen", SEED_SAEULEN, "saeulen");
  uebernimm("uebungen", SEED_UEBUNGEN, "uebungen");
  uebernimm("schwerpunkte", SEED_SCHWERPUNKTE, "schwerpunkte");
  markDirty(0);
  return ergaenzt;
}

function bindeStartbestand() {
  const btn = document.getElementById("btn-seed");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const r = spieleSeedEin();
    if (!r) return;
    document.getElementById("seed-ergebnis").textContent =
      `Ergänzt: ${r.bereiche} Bereiche, ${r.stufen} Stufen, ${r.saeulen} Säulen, ${r.uebungen} Übungen, ${r.schwerpunkte} Schwerpunkte.`;
    renderAlles();
  });
}

// --- gemeinsame Verdrahtung der Verwaltung ---

const VW_HANDLER = {
  mannschaften: { save: speichereMannschaft, del: loescheMannschaft },
  bereiche: { save: speichereBereich, del: loescheBereich },
  stufen: { save: speichereStufe, del: loescheStufe },
  schwerpunkte: { save: speichereSchwerpunkt, del: loescheSchwerpunkt },
  uebungen: { save: speichereUebung, del: loescheUebung }
};

// Genau EINMAL beim Start verdrahtet (siehe init). Der Handler liest vwView zur
// Klickzeit — waere er Teil von renderVerwaltung(), haenge nach jedem Render ein
// weiterer Listener am selben Element und "Bearbeiten" feuerte mehrfach.
function bindeVerwaltungEinmalig() {
  document.getElementById("verwaltung-inhalt").addEventListener("click", (e) => {
    const h = VW_HANDLER[vwView];
    if (!h) return;
    if (e.target.closest("[data-vw-neu]")) { vwEditId = "neu"; renderVerwaltung(); return; }
    if (e.target.closest("[data-vw-abbruch]")) { vwEditId = null; renderVerwaltung(); return; }
    if (e.target.closest("[data-vw-save]")) {
      if (h.save()) { vwEditId = null; markDirty(0); renderAlles(); renderVerwaltung(); }
      return;
    }
    const row = e.target.closest(".vw-row");
    if (!row) return;
    if (e.target.closest("[data-vw-edit]")) { vwEditId = row.dataset.id; renderVerwaltung(); return; }
    if (e.target.closest("[data-vw-del]")) { h.del(row.dataset.id); renderAlles(); renderVerwaltung(); }
  });
}

// Wechselt im Schwerpunkt-Formular die Stufe, aendert sich, welche Uebungen ueber
// der Obergrenze liegen. Die Hinweise werden an Ort und Stelle nachgezogen statt
// das Formular neu zu zeichnen — sonst waeren alle bereits getippten Eingaben weg.
function bindeStufenwechselImSchwerpunkt() {
  const sel = document.getElementById("vw-stufeId");
  if (!sel || vwView !== "schwerpunkte") return;
  sel.addEventListener("change", () => {
    const stufe = stufeById(sel.value);
    document.querySelectorAll("#vw-uebungen .checkbox-zeile").forEach((zeile) => {
      const cb = zeile.querySelector("input[type=checkbox]");
      const meta = zeile.querySelector(".cbz-meta");
      const u = cb ? uebungById(cb.value) : null;
      if (!u || !meta) return;
      meta.textContent = String(u.spielform || "") + (uebungUeberGrenze(u, stufe) ? " — über der DFB-Obergrenze dieser Stufe" : "");
    });
  });
}

// ---------- Druckansicht ----------

function druckeStufe() {
  if (!canEdit()) return;
  const st = stufeById(currentStufeId);
  if (!st) { alert("Bitte zuerst eine Altersklasse wählen."); return; }
  const bereich = bereichById(st.bereichId);
  const f = st.frequenz || {};
  const profil = [
    ["Bereich", bereich ? bereich.name : ""],
    ["Altersspanne", st.altersspanne],
    ["Entwicklungsstand", st.entwicklungsstand],
    ["DFB-Obergrenze Spielform", st.obergrenzeText],
    ["Mindest-Nettospielzeit", st.nettospielzeit],
    ["Betreuungsschlüssel", st.betreuung],
    ["Trainingsfrequenz", `${f.mannschaft || 0}× Mannschaftstraining + ${f.foerder || 0}× Fördertraining${f.foerderFreiwillig ? " (freiwillig)" : ""}`],
    ["Am Spieltag", st.spieltagHinweise]
  ].filter((z) => z[1]);

  const sps = schwerpunkteFuerStufe(st.id, true);
  document.getElementById("print-content").innerHTML = `
    <h1>Ausbildungsplan — ${escapeHtml(stufeLabel(st))}</h1>
    <p class="print-meta">1. SC 1911 Heiligenstadt e.V. · Stand ${escapeHtml(new Date().toLocaleDateString("de-DE"))} · Grundlage: Trainingsphilosophie Deutschland (DFB)</p>
    <table class="print-profil">
      ${profil.map((z) => `<tr><td class="pp-label">${escapeHtml(z[0])}</td><td>${escapeHtml(z[1])}</td></tr>`).join("")}
    </table>
    <h2>Trainingsschwerpunkte</h2>
    ${sps.length ? sps.map((sp) => {
      const uebungen = sp.uebungIds.map(uebungById).filter(Boolean);
      return `
        <div class="print-sp">
          <h3>${escapeHtml(sp.titel)} — ${escapeHtml(trainingsartLabel(sp.trainingsart))}</h3>
          ${sp.beschreibung ? `<p>${escapeHtml(sp.beschreibung)}</p>` : ""}
          ${uebungen.length ? uebungen.map((u) => `
            <div class="print-ue">
              <p><strong>${escapeHtml(u.name)}</strong> — ${escapeHtml([u.spielform, u.feldgroesse].filter(Boolean).join(", "))}${uebungUeberGrenze(u, st) ? " (über DFB-Obergrenze dieser Stufe)" : ""}</p>
              ${u.aufbau ? `<p><strong>Aufbau:</strong> ${escapeHtml(u.aufbau)}</p>` : ""}
              ${u.ablauf ? `<p><strong>Ablauf:</strong> ${escapeHtml(u.ablauf)}</p>` : ""}
              ${u.varianten ? `<p><strong>Varianten:</strong> ${escapeHtml(u.varianten)}</p>` : ""}
            </div>`).join("") : `<p>Keine Übungen verknüpft.</p>`}
        </div>`;
    }).join("") : `<p>Für diese Altersklasse sind noch keine Schwerpunkte hinterlegt.</p>`}`;

  document.body.classList.add("printing-report");
  const cleanup = () => { document.body.classList.remove("printing-report"); window.removeEventListener("afterprint", cleanup); };
  window.addEventListener("afterprint", cleanup);
  setTimeout(() => window.print(), 150);
}

// ---------- Info ----------

function renderChangelog() {
  document.getElementById("changelog-list").innerHTML = APP_CHANGELOG.map((entry) => `
    <div class="changelog-entry">
      <span class="cv">Version ${escapeHtml(entry.version)}</span>
      ${entry.groups.map((g) => `
        <div class="changelog-group">
          <div class="cg-title">${escapeHtml(g.title)}</div>
          <ul class="cg-items">${g.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
        </div>`).join("")}
    </div>`).join("");
}

function renderInfoStatisch() {
  document.getElementById("eckpfeiler-liste").innerHTML = ECKPFEILER.map((e) => `
    <div class="profil-zeile">
      <div class="pz-label">${escapeHtml(e.titel)}</div>
      <div class="pz-wert">${escapeHtml(e.text)}</div>
    </div>`).join("");
  document.getElementById("einheit-liste").innerHTML = TRAININGSEINHEIT_BLOECKE.map((b) => `
    <div class="profil-zeile">
      <div class="pz-label">${escapeHtml(b.dauer)} — ${escapeHtml(b.titel)}</div>
      <div class="pz-wert">${escapeHtml(b.inhalt)}<br><span class="muted">Ziel: ${escapeHtml(b.ziel)}</span></div>
    </div>`).join("");
}

// ---------- Start ----------

function renderAlles() {
  renderAusbildung();
  fuelleFilterSelects();
  renderUebungen();
  renderSpieltage();
  applyRechteVisibility();
}

function startApp() {
  document.getElementById("connect-screen").style.display = "none";
  document.getElementById("app-shell").style.display = "block";
}

function showConnectScreen(errorMsg) {
  document.getElementById("connect-screen").style.display = "block";
  document.getElementById("app-shell").style.display = "none";
  const err = document.getElementById("cloud-error");
  err.style.display = errorMsg ? "block" : "none";
  err.textContent = errorMsg || "";
}

async function init() {
  document.getElementById("version-badge-2").textContent = "v" + APP_VERSION;
  renderChangelog();
  renderInfoStatisch();
  setupTabs();
  setupVerwaltungSubnav();
  bindeVerwaltungEinmalig();

  document.getElementById("stufen-chips").addEventListener("click", (e) => {
    const b = e.target.closest(".stufe-chip");
    if (!b) return;
    currentStufeId = b.dataset.stufe;
    renderStufenChips();
    renderStufenDetail();
  });
  document.getElementById("btn-print-stufe").addEventListener("click", druckeStufe);
  ["filter-saeule", "filter-trainingsart", "filter-stufe"].forEach((id) => {
    document.getElementById(id).addEventListener("change", renderUebungen);
  });
  document.getElementById("filter-suche").addEventListener("input", renderUebungen);

  document.getElementById("spieltag-mannschaft").addEventListener("change", (e) => {
    flushPending();
    currentMannschaftId = e.target.value;
    currentSpieltagId = null;
    renderSpieltage();
  });
  document.getElementById("btn-neuer-spieltag").addEventListener("click", neuerSpieltag);
  document.getElementById("spieltage-rows").addEventListener("click", (e) => {
    const row = e.target.closest(".spieltag-row");
    if (!row) return;
    if (e.target.closest(".btn-bogen-loeschen")) { loescheSpieltag(row.dataset.id); return; }
    if (e.target.closest(".btn-bogen-oeffnen")) {
      flushPending();
      currentSpieltagId = row.dataset.id;
      renderSpieltagEditor();
      renderSpieltagListe();
      document.getElementById("spieltag-editor").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  document.getElementById("auswertung-mannschaft").addEventListener("change", (e) => {
    auswertungMannschaftId = e.target.value;
    auswertungSaison = "";
    renderAuswertung();
  });
  document.getElementById("auswertung-saison").addEventListener("change", (e) => {
    auswertungSaison = e.target.value;
    renderAuswertung();
  });
  document.getElementById("auswertung-jahrgang").addEventListener("change", (e) => {
    auswertungJahrgang = Number(e.target.value);
    renderAuswertung();
  });
  document.getElementById("auswertung-modus").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-modus]");
    if (!b) return;
    auswertungModus = b.dataset.modus;
    renderAuswertung();
  });
  document.getElementById("btn-seed-direkt").addEventListener("click", () => {
    if (spieleSeedEin()) renderAlles();
  });

  // Ausstehende Eingaben nicht im Debounce verhungern lassen, wenn die Seite
  // in den Hintergrund geht oder geschlossen wird.
  window.addEventListener("pagehide", flushPending);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushPending(); });

  if (!getSessionToken()) { showConnectScreen(); return; }

  try {
    // Nacheinander statt Promise.all: dav-load liefert das "me" gratis mit, der
    // fetchMe()-Aufruf kostet danach keinen eigenen Request mehr.
    const data = await gatewayLoad();
    const me = await fetchMe();
    currentUsername = me.username;
    currentIsAdmin = !!me.isAdmin;
    currentCanEdit = !!me.canEdit;
    currentCanAdmin = !!me.canAdmin;
    currentVorname = me.vorname || null;
    currentNachname = me.nachname || null;
    appData = normalizeData(data);

    startApp();
    const el = document.getElementById("header-user");
    const name = (currentVorname || currentNachname)
      ? `${currentVorname || ""} ${currentNachname || ""}`.trim() : currentUsername;
    el.textContent = "👤 " + name + (currentIsAdmin ? " (Admin)" : "");
    renderAlles();
    // Kommt zum Schluss: die Liste füllt nur das Vorschlagsfeld im
    // Mannschafts-Formular, der Ausbildungsplan ist ohne sie schon vollständig.
    // Danach einmal nachzeichnen, falls die Verwaltung schon offen steht.
    vereinsMannschaften = await fetchVereinsMannschaften();
    // ⚠️ NICHT nachzeichnen, solange ein Formular offen ist: renderVerwaltung()
    // baut #verwaltung-inhalt komplett neu und würde getippte, noch nicht
    // gespeicherte Eingaben wegwerfen.
    if (vereinsMannschaften.length && !vwEditId) renderVerwaltung();
  } catch (e) {
    if (e instanceof NotLoggedInError) showConnectScreen();
    else showConnectScreen("Fehler beim Laden: " + e.message);
  }
}

window.addEventListener("DOMContentLoaded", () => { init(); });
