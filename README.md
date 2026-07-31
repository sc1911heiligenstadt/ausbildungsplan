# Ausbildungsplan

Trainingsschwerpunkte und Trainingsinhalte für jede Altersklasse der
Nachwuchsabteilung des 1. SC 1911 e.V. Heilbad Heiligenstadt — dazu der Spieltag
als Leistungsnachweis.

Fachliche Grundlage ist bereichsübergreifend die **Trainingsphilosophie
Deutschland** des DFB.

Live: https://tecko1985.github.io/ausbildungsplan/

## Was das Tool kann

**Ausbildung** — Für jede Juniorenstufe von den Bambini bis zur U23 stehen die
Trainingsschwerpunkte mit den zugehörigen Übungen bereit. Die Stufe wird über die
U-Mannschaft gefunden. Jede Stufe zeigt ihr Profil: Altersspanne,
Entwicklungsstand, DFB-Obergrenze für die Spielform, Mindest-Nettospielzeit und
Trainingsfrequenz (zwei Mannschaftstrainings plus Fördertraining, bis U11
freiwillig).

**Übungen** — Gemeinsamer Katalog, gegliedert nach den vier Säulen der
Trainingsphilosophie: Gleichzahlspiele, Spiele mit Anspielern, eine Linie
verteidigen, Über-/Unterzahlspiele. Filterbar nach Säule, Trainingsart und
Altersklasse; eine Übung darf an mehreren Schwerpunkten und Stufen hängen. Liegt
sie über der DFB-Obergrenze der betrachteten Stufe, wird sie markiert.

**Spieltage** — Nach jedem Spiel wird je Mannschaft ein Bogen ausgefüllt: Datum,
Gegner, Heim/Auswärts, Ergebnis und Fazit. Auf einer Ampel wird bewertet, wie weit
die Schwerpunkte der Stufe im Spiel bereits umgesetzt waren. Bewertet wird die
Mannschaft, nicht der einzelne Spieler.

**Auswertung** — Je Mannschaft eine Matrix aus Schwerpunkten und Spieltagen. Die
Saison ergibt sich aus dem Spieldatum, Stichtag ist der 1. Juli.

**Druckansicht** — Stufenprofil, alle Schwerpunkte und die vollständigen
Übungsbeschreibungen auf Papier für den Platz.

## Rechte

| Stufe | Darf |
|---|---|
| Sehen | Alle Stufen, Schwerpunkte und Übungen lesen — schreibgeschützt |
| Bearbeiten | Spieltag-Bögen anlegen und ausfüllen, Druckansicht nutzen |
| Administrieren | Bereiche, Stufen, Schwerpunkte, Übungen und Mannschaften pflegen, Startbestand einspielen |

Der Info-Tab ist immer für alle sichtbar.

## Technik

Vanilla JavaScript ohne Build-Step. Anmeldung und Speicherung laufen über das
zentrale Login-Gateway der Tools-Übersicht; die Daten liegen als einzelne
JSON-Datei in der Vereins-Nextcloud.

## Quelle

Trainingsphilosophie Deutschland — Deutscher Fußball-Bund (DFB), aufbereitet im
vereinseigenen Trainingsleitfaden G- bis A-Jugend (2026).
