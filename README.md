# 🎓 Ausbildungsplan

Was in welcher Altersklasse trainiert wird — und ob es am Spieltag ankommt.
Fachliche Grundlage ist bereichsübergreifend die **Trainingsphilosophie
Deutschland** des DFB. Für jede Juniorenstufe von den Bambini bis zur U23
stehen Trainingsschwerpunkte samt zugehörigen Übungen bereit; nach jedem Spiel
wird auf einer Ampel bewertet, wie weit die Schwerpunkte umgesetzt wurden.

**➡️ [Ausbildungsplan öffnen](https://sc1911heiligenstadt.github.io/ausbildungsplan/)**

## Was drin ist

| Reiter | Wofür |
|---|---|
| **Ausbildung** | Die Schwerpunkte je Stufe, dazu das Stufenprofil: Altersspanne, Entwicklungsstand, DFB-Obergrenze der Spielform, wöchentliche Mindest-Nettospielzeit, Trainingsfrequenz. Mit Druckansicht für den Platz |
| **Übungen** | Der Übungskatalog: 28 Spielformen aus der Trainingsphilosophie Deutschland, gegliedert nach den vier Säulen — Gleichzahlspiele, Spiele mit Anspielern, eine Linie verteidigen, Über- und Unterzahlspiele |
| **Spieltage** | Nach jedem Spiel ein Bogen je Mannschaft: Datum, Gegner, Heim oder Auswärts, Ergebnis, Fazit — und die Ampel-Bewertung der Schwerpunkte |
| **Auswertung** | Je Mannschaft eine Matrix aus Schwerpunkten und Spieltagen; zusätzlich die Ansicht **Nach Jahrgang** über mehrere Saisons hinweg |
| **Verwaltung** | Bereiche, Stufen, Schwerpunkte, Übungen und Mannschaften pflegen, Startbestand einspielen |
| **Info** | Was die App tut, der Aufbau einer idealen Trainingseinheit, die Änderungen und der Datenschutz-Hinweis |

## Die Stufe findet sich selbst

Beim Anlegen einer Mannschaft schlägt das Namensfeld die echten Mannschaften des
Vereins vor — dieselbe Liste, die in der Tools-Übersicht gepflegt wird. Wird ein
Name von dort gewählt, stellt sich die Juniorenstufe von selbst ein: aus „D2“
wird die Stufe D-Junioren. Wer die Stufe von Hand ändert, behält seine Eingabe.
Eigene Namen für Trainingsgruppen ohne Mannschaft bleiben möglich.

Liegt eine Übung über der DFB-Obergrenze der betrachteten Stufe, wird sie
sichtbar markiert.

## Den Jahrgang über die Jahre verfolgen

Eine Bezeichnung wie „D1-Junioren“ meint jede Saison andere Kinder. Der
**Jahrgang** dagegen bleibt derselbe und wandert über die Jahre durch die Stufen
— der Jahrgang 2012 spielt in der Saison 2026/27 als U15 bei den C-Junioren.

Die Auswertung hat deshalb eine zweite Ansicht **Nach Jahrgang**: je Saison ein
eigener Block mit den damals geltenden Schwerpunkten, darüber eine durchgehende
Kurve des Umsetzungsgrads über alle Spieltage (Grün zählt voll, Gelb halb, Rot
gar nicht). Sie übersteht den Stufenwechsel und beantwortet damit, ob sich ein
Jahrgang über die Jahre entwickelt.

Bewertet wird immer die **Mannschaft**, nicht der einzelne Spieler — die
Einzelbewertung bleibt Aufgabe des Spielertools.

## Am Handy

Die Ansicht ist fürs Handy gebaut: der Spieltag-Bogen lässt sich direkt am Platz
ausfüllen.

## Zugang

Die Anmeldung läuft über die [Tools-Übersicht](https://sc1911heiligenstadt.github.io/ToolsUebersicht/) — dort einmal anmelden, danach ist dieses Werkzeug offen.

Die Rechte gelten in drei Stufen: **Sehen** (alle Stufen, Schwerpunkte und
Übungen lesen, schreibgeschützt), **Bearbeiten** (Spieltag-Bögen anlegen und
ausfüllen, Druckansicht nutzen) und **Administrieren** (Reiter *Verwaltung*).
Der Reiter **Info** ist für alle sichtbar. Wer welche Stufe hat, legt die
Tools-Übersicht fest.

## Lokal starten

Über den Eintrag `ausbildungsplan` in `E:\.claude\launch.json` — der Server läuft dann auf `http://localhost:8811/`.

## Technik

Vanilla JavaScript ohne Build-Schritt — die Dateien werden so ausgeliefert, wie sie im Repo liegen. Veröffentlicht über GitHub Pages. Die Daten liegen in der Vereins-Nextcloud; der Zugriff läuft ausschließlich über den Login-Worker der Tools-Übersicht, nie mit Zugangsdaten im Browser.

---

Ein Werkzeug des 1. SC 1911 Heiligenstadt. Alle Werkzeuge auf einen Blick: [Tools-Übersicht](https://sc1911heiligenstadt.github.io/ToolsUebersicht/) · Erklärungen im [Toolbox Wiki](https://sc1911heiligenstadt.github.io/Vereinswiki/).
