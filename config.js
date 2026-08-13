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
    version: "1.1",
    groups: [
      {
        title: "Mannschaften kommen jetzt aus der einen Vereinsliste",
        items: [
          "Beim Anlegen einer Mannschaft schlägt das Namensfeld die echten Mannschaften des Vereins vor — dieselbe Liste, die in der Tools-Übersicht gepflegt wird.",
          "Wird ein Name von dort gewählt, stellt sich die Juniorenstufe von selbst richtig ein: aus „D2“ wird die Stufe D-Junioren. Wer die Stufe von Hand ändert, behält seine Eingabe — der Vorschlag überschreibt sie nicht.",
          "Ein eigener Name bleibt möglich: Trainingsgruppen ohne eigene Mannschaft lassen sich weiterhin frei eintippen.",
          "Die Mannschaften bleiben in dieser App gespeichert — an ihnen hängen Stufe, Jahrgänge und alle Spieltag-Bögen. Die Vereinsliste ist ein Vorschlag, keine Vorschrift."
        ]
      }
    ]
  },
  {
    version: "1.0",
    groups: [
      {
        title: "Ausbildungsinhalte je Altersklasse",
        items: [
          "Für jede Juniorenstufe von den Bambini bis zur U23 stehen Trainingsschwerpunkte samt zugehörigen Übungen bereit. Die Stufe wird über die U-Mannschaft gefunden — U12 und U13 führen also zu den D-Junioren.",
          "Jede Stufe zeigt ihr Profil: Altersspanne, Entwicklungsstand, die DFB-Obergrenze für die Spielform, die wöchentliche Mindest-Nettospielzeit und die Trainingsfrequenz — zwei Mannschaftstrainings plus Fördertraining, bis U11 freiwillig.",
          "Übungskatalog mit 28 Spielformen aus der Trainingsphilosophie Deutschland, gegliedert nach den vier Säulen: Gleichzahlspiele, Spiele mit Anspielern, eine Linie verteidigen und Über- oder Unterzahlspiele. Eine Übung kann an mehreren Schwerpunkten und Stufen hängen.",
          "Schwerpunkte und Übungen sind als Mannschaftstraining, Fördertraining oder beides gekennzeichnet und lassen sich danach filtern.",
          "Liegt eine Übung über der DFB-Obergrenze der betrachteten Stufe, wird sie sichtbar markiert.",
          "Druckansicht je Stufe: Stufenprofil, alle Schwerpunkte und die vollständigen Übungsbeschreibungen — für den Platz auf Papier."
        ]
      },
      {
        title: "Spieltag als Leistungsnachweis",
        items: [
          "Nach jedem Spiel wird je Mannschaft ein Bogen ausgefüllt: Datum, Gegner, Heim oder Auswärts, Ergebnis und ein Fazit.",
          "Auf einer Ampel wird bewertet, wie weit die Schwerpunkte der Stufe im Spiel umgesetzt wurden. Nicht bewertete Schwerpunkte gelten als nicht beobachtet.",
          "Bewertet wird die Mannschaft, nicht der einzelne Spieler — die Einzelbewertung bleibt Aufgabe des Spielertools.",
          "Die Auswertung zeigt je Mannschaft eine Matrix aus Schwerpunkten und Spieltagen, sodass der Verlauf über die Saison auf einen Blick erkennbar ist. Die Saison ergibt sich aus dem Spieldatum, Stichtag ist der 1. Juli."
        ]
      },
      {
        title: "Den Jahrgang über die Jahre verfolgen",
        items: [
          "Jede Mannschaft trägt zusätzlich ihre Geburtsjahrgänge. Beim Anlegen eines Spieltag-Bogens sind sie vorbelegt und lassen sich für das einzelne Spiel ändern — etwa wenn ein Jahrgang einmal hoch- oder runterspielt.",
          "Der Hintergrund: eine Bezeichnung wie „D1-Junioren“ meint jede Saison andere Kinder. Der Jahrgang bleibt derselbe und wandert über die Jahre durch die Stufen — der Jahrgang 2012 spielt in der Saison 2026/27 als U15 bei den C-Junioren und ist erst vier Jahre später aus dem Juniorenbereich heraus.",
          "Die Auswertung hat deshalb eine zweite Ansicht „Nach Jahrgang“. Sie zeigt je Saison einen eigenen Block mit den Schwerpunkten, die damals galten — beim Wechsel in die nächste Stufe tauschen die Schwerpunkte schließlich komplett.",
          "Darüber liegt eine durchgehende Kurve über alle Spieltage: der Umsetzungsgrad je Spiel, bei dem Grün voll zählt, Gelb halb und Rot gar nicht. Sie übersteht den Stufenwechsel und beantwortet damit, ob sich ein Jahrgang über die Jahre entwickelt. Gestrichelte Linien markieren den Saisonwechsel.",
          "Beim Ausfüllen steht dabei, in welcher U-Klasse der eingetragene Jahrgang am Spieltag tatsächlich steht. Passt das nicht zur hinterlegten Stufe der Mannschaft, erscheint ein Hinweis — so fällt auf, wenn eine Mannschaftsbezeichnung stehengeblieben ist, während die Kinder weitergerückt sind."
        ]
      },
      {
        title: "Wer darf was",
        items: [
          "Sehen: alle Stufen, Schwerpunkte und Übungen lesen, schreibgeschützt.",
          "Bearbeiten: Spieltag-Bögen anlegen und ausfüllen sowie die Druckansicht nutzen.",
          "Administrieren: Bereiche, Stufen, Schwerpunkte, Übungen und Mannschaften pflegen sowie den Startbestand einspielen.",
          "Der Reiter „Info“ ist für alle sichtbar."
        ]
      },
      {
        title: "Bedienung am Handy",
        items: [
          "Die Ansicht ist für das Handy gebaut — der Spieltag-Bogen lässt sich direkt am Platz ausfüllen.",
          "Eingabefelder sind mindestens 16 Pixel groß, damit der iPhone-Browser beim Antippen nicht ungefragt in die Seite hineinzoomt und verschoben stehen bleibt."
        ]
      },
      {
        title: "Daten & Speicherung",
        items: [
          "Gespeichert wird in der Vereins-Nextcloud über die zentrale Anmeldung der Tools-Übersicht — ein eigenes Passwort braucht es nicht.",
          "Ändern zwei Geräte gleichzeitig denselben Stand, erkennt die App das, lädt den fremden Stand nach und sagt Bescheid."
        ]
      }
    ]
  }
];
