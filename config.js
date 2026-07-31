const APP_VERSION = "1.0";

// Ampel-Skala des Spieltag-Bogens. "nicht beobachtet" ist der Default und wird
// nicht als eigener Wert gespeichert (fehlender Eintrag = nicht beobachtet).
const AMPEL_STUFEN = [
  { id: "gruen", label: "Sicher umgesetzt", kurz: "Grün" },
  { id: "gelb", label: "In Ansätzen erkennbar", kurz: "Gelb" },
  { id: "rot", label: "Noch nicht sichtbar", kurz: "Rot" }
];

const TRAININGSARTEN = [
  { id: "mannschaft", label: "Mannschaftstraining" },
  { id: "foerder", label: "Fördertraining" },
  { id: "beide", label: "Beides" }
];

// Stichtag für die Saison-Zuordnung: alles ab dem 1. Juli gehört zur neuen Saison.
const SAISON_STICHTAG_MONAT = 7;

const APP_CHANGELOG = [
  {
    version: "1.0",
    groups: [
      {
        title: "Ausbildungsinhalte je Altersklasse",
        items: [
          "Für jede Juniorenstufe von den Bambini bis zur U23 stehen Trainingsschwerpunkte samt zugehörigen Übungen bereit — die Stufe wird über die U-Mannschaft gefunden, z.B. U12 oder U13 führen zu den D-Junioren.",
          "Jede Stufe zeigt ihr Profil: Altersspanne, Entwicklungsstand, die DFB-Obergrenze für die Spielform, die wöchentliche Mindest-Nettospielzeit und die Trainingsfrequenz (zwei Mannschaftstrainings plus Fördertraining, bis U11 freiwillig).",
          "Übungskatalog mit 28 Spielformen aus der Trainingsphilosophie Deutschland, gegliedert nach den vier Säulen: Gleichzahlspiele, Spiele mit Anspielern, eine Linie verteidigen, Über-/Unterzahlspiele. Eine Übung kann an mehreren Schwerpunkten und Stufen hängen.",
          "Schwerpunkte und Übungen sind als Mannschaftstraining, Fördertraining oder beides gekennzeichnet und lassen sich danach filtern.",
          "Liegt eine Übung über der DFB-Obergrenze der gerade betrachteten Stufe, wird sie sichtbar markiert.",
          "Druckansicht je Stufe: Stufenprofil, alle Schwerpunkte und die vollständigen Übungsbeschreibungen auf Papier für den Platz."
        ]
      },
      {
        title: "Spieltag als Leistungsnachweis",
        items: [
          "Nach jedem Spiel wird je Mannschaft ein Bogen ausgefüllt: Datum, Gegner, Heim oder Auswärts, Ergebnis und ein Fazit.",
          "Bewertet wird auf einer Ampel, wie weit die Schwerpunkte der Stufe im Spiel bereits umgesetzt wurden. Nicht bewertete Schwerpunkte gelten als nicht beobachtet.",
          "Bewertet wird die Mannschaft, nicht der einzelne Spieler — die Einzelbewertung bleibt Aufgabe des Spielertools.",
          "Die Auswertung zeigt je Mannschaft eine Matrix aus Schwerpunkten und Spieltagen, sodass der Verlauf über die Saison auf einen Blick erkennbar ist. Die Saison ergibt sich aus dem Spieldatum, Stichtag ist der 1. Juli."
        ]
      },
      {
        title: "Rechte und Verwaltung",
        items: [
          "Sehen: alle eingeloggten Nutzer lesen sämtliche Stufen, Schwerpunkte und Übungen — schreibgeschützt.",
          "Bearbeiten: Spieltag-Bögen anlegen und ausfüllen sowie die Druckansicht nutzen.",
          "Administrieren: Bereiche, Stufen, Schwerpunkte, Übungen und Mannschaften pflegen sowie den Startbestand einspielen.",
          "Der Info-Tab ist immer für alle sichtbar."
        ]
      }
    ]
  }
];
