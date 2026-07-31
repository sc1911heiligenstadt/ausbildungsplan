// Startbestand des Ausbildungsplans.
//
// Quelle: DFB "Trainingsphilosophie Deutschland" (original_TPD.pdf), aufbereitet
// im vereinseigenen Trainingsleitfaden G- bis A-Jugend (2026).
//
// ⚠️ KORRIGIERTE ALTERSKLASSEN-ZUORDNUNG — die Jahresangaben, nicht die Buchstaben
//
// Der Word-Leitfaden hängt an jede Juniorenstufe eine falsche U-Zahl und
// Jahresangabe: er nennt die E-Junioren "U12/U13, 12-13 Jahre" (richtig wäre
// U10/U11) und die Bambini "U9, 8-9 Jahre" (richtig wäre U6/U7). Die
// BUCHSTABEN sind dagegen korrekt — nachgewiesen am Original, das die
// Spielform-Obergrenzen ausdrücklich nach Buchstaben nennt:
//
//   "Bambini: Spielformen dürfen 2-gegen-2-Varianten nicht übersteigen. […] ein
//    Begleiter pro vier Kinder. F-Junioren: […] maximal auf 3 plus TW gegen 3 plus
//    TW […] für jeweils sechs Spieler […] einen Spielfeldbegleiter. E-Junioren:
//    […] darf die Größe der Spielformen ein 4 plus TW gegen 4 plus TW nicht
//    übersteigen. D- bis A-Junioren: […] vom 1 gegen 1 bis zum 4 gegen 4 […] um
//    bis zu zwei Anspieler pro Team erweitert werden."
//
// Deshalb wird hier nach BUCHSTABEN zugeordnet und die Altersspanne korrigiert:
//
//   Leitfaden-Kapitel   Stufe hier              korrekte Spanne
//   5.1 "G-Jugend"  ->  Bambini / G-Junioren    U6/U7  (6-7 Jahre)
//   5.2 "F-Jugend"  ->  F-Junioren              U8/U9  (8-9 Jahre)
//   5.3 "E-Jugend"  ->  E-Junioren              U10/U11 (10-11 Jahre)
//   5.4 "D-Jugend"  ->  D-Junioren              U12/U13 (12-13 Jahre)
//   5.5 "C-Jugend"  ->  C-Junioren              U14/U15 (14-15 Jahre)
//   5.6 "B-Jugend"  ->  B-Junioren              U16/U17 (16-17 Jahre)
//   5.7 "A-Jugend"  ->  A-Junioren              U18/U19 (18-19 Jahre)
//
// Obergrenzen und Betreuungsschlüssel stammen aus dem Original, alles Übrige
// (Entwicklungsstand, Trainings-Fokus, Spieltag-Hinweise) aus dem Leitfaden.
// Die wöchentliche Nettospielzeit steht so NICHT im DFB-Dokument — sie ist eine
// Ergänzung des Leitfadens; der Bruch 48 -> 32 Minuten liegt dort bei U17.
//
// Wörtliche Zitate bleiben unverändert, auch wo sie eine Altersklasse nennen.

const SEED_BEREICHE = [
  { id: "grundlage", name: "Grundlagenbereich", vonU: 6, bisU: 13, reihenfolge: 1 },
  { id: "leistung", name: "Leistungsorientierter Bereich", vonU: 14, bisU: 23, reihenfolge: 2 }
];

const SEED_STUFEN = [
  {
    id: "g", kuerzel: "G", name: "Bambini / G-Junioren", vonU: 6, bisU: 7,
    bereichId: "grundlage", reihenfolge: 1, altersspanne: "6-7 Jahre",
    entwicklungsstand: "Starke Ich-Perspektive, fokussiert auf Ball und Tor, spielerische Grundlagen werden erlernt, hohe Freude an Bewegung und Fangspielen.",
    obergrenzeText: "2 gegen 2", obergrenzeSpieler: 2, anspielerErlaubt: false,
    nettospielzeit: "mind. 48 Min./Woche", betreuung: "1 Spielfeldbegleiter pro 4 Kinder",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: true },
    spieltagHinweise: "Mehrere kleine Felder mit jeweils 3v3 oder 4v4 · Alle Kinder spielen gleich lange · Fokus auf Spaß und Freude, weniger auf Ergebnisse",
    hinweis: "Engste Spielform-Grenze der ganzen Ausbildung: der gemeinsame Übungskatalog hält dafür nur wenige passende Formen bereit. Eigene Spiel- und Fangformen ergänzt die Nachwuchsleitung."
  },
  {
    id: "f", kuerzel: "F", name: "F-Junioren", vonU: 8, bisU: 9,
    bereichId: "grundlage", reihenfolge: 2, altersspanne: "8-9 Jahre",
    entwicklungsstand: "Erste Mannschaftsfähigkeiten entstehen, verteidigt noch impulsiv, aber koordinative Entwicklung nimmt zu.",
    obergrenzeText: "3(+TW) gegen 3(+TW)", obergrenzeSpieler: 3, anspielerErlaubt: false,
    nettospielzeit: "mind. 48 Min./Woche", betreuung: "1 Spielfeldbegleiter pro 6 Feldspieler (ggf. plus 2 Torhüter)",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: true },
    spieltagHinweise: "Mehrere Felder: 5v5 oder mehrere 3v3 · Rotationen nach kurzen Spielabschnitten (7-10 Minuten) · Hohes Spieltempo mit Balldepots an jedem Feld",
    hinweis: ""
  },
  {
    id: "e", kuerzel: "E", name: "E-Junioren", vonU: 10, bisU: 11,
    bereichId: "grundlage", reihenfolge: 3, altersspanne: "10-11 Jahre",
    entwicklungsstand: "Kooperatives Spiel nimmt zu, erste Strategien entstehen, körperliche Unterschiede wachsen, technische Fähigkeiten werden robuster.",
    obergrenzeText: "4(+TW) gegen 4(+TW)", obergrenzeSpieler: 4, anspielerErlaubt: false,
    nettospielzeit: "mind. 48 Min./Woche", betreuung: "",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: true },
    spieltagHinweise: "7v7 oder mehrere 5v5-Felder · Alle Spieler spielen mindestens 75% der Gesamtspielzeit · Zwillings-Turniere mit mehreren Feldern (jedes Kind spielt immer)",
    hinweis: "Fokusjahrgang U11: Übergangsphase laut Konzeptpapier."
  },
  {
    id: "d", kuerzel: "D", name: "D-Junioren", vonU: 12, bisU: 13,
    bereichId: "grundlage", reihenfolge: 4, altersspanne: "12-13 Jahre",
    entwicklungsstand: "Pubertätsphase, Leistungsunterschiede wachsen, taktisches Verständnis reift, noch zunehmende körperliche Entwicklung.",
    obergrenzeText: "1 gegen 1 bis 4 gegen 4, ab hier +2 Anspieler pro Team erlaubt", obergrenzeSpieler: 6, anspielerErlaubt: true,
    nettospielzeit: "mind. 48 Min./Woche", betreuung: "",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: false },
    spieltagHinweise: "7v7 Zwillings-Turniere (zwei 7v7-Felder gleichzeitig) · Alle 14 Spieler spielen; 2 Torwarte in voller Spielzeit · Niveaugerechte Einteilung (Gold/Silber/Bronze)",
    hinweis: "Zwischenstufe zum leistungsorientierten Bereich: die U12/U13 bereitet auf den Übergang ab der U14 vor. Ab dieser Stufe gehört gezieltes, taktisch akzentuiertes Spielen dazu — siehe die Säule „Eine Linie verteidigen/bespielen“."
  },
  {
    id: "c", kuerzel: "C", name: "C-Junioren", vonU: 14, bisU: 15,
    bereichId: "leistung", reihenfolge: 5, altersspanne: "14-15 Jahre",
    entwicklungsstand: "Physische Reife wird erreicht, taktisches Verständnis ist erwachsen, individuelle Spezialisierung auf Positionen erlaubt (in gesunder Mischung mit ganzheitlicher Ausbildung).",
    obergrenzeText: "1 gegen 1 bis 4 gegen 4 (+2 Anspieler)", obergrenzeSpieler: 6, anspielerErlaubt: true,
    nettospielzeit: "mind. 48 Min./Woche", betreuung: "",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: false },
    spieltagHinweise: "9v9 oder 11v11 Spiele · Wettkampf in Ligensystem mit Niveaus · Mindestens 75% Spielzeit für alle Kader-Spieler",
    hinweis: "Einstieg in den leistungsorientierten Bereich. Ab dieser Stufe erlaubt die Trainingsphilosophie ausdrücklich Positionsspezifik — in gesunder Mischung mit ganzheitlicher Ausbildung."
  },
  {
    id: "b", kuerzel: "B", name: "B-Junioren", vonU: 16, bisU: 17,
    bereichId: "leistung", reihenfolge: 6, altersspanne: "16-17 Jahre",
    entwicklungsstand: "Nahezu vollständige Reife, sehr hohes Leistungsspektrum, professionelle Ansätze werden eingeführt, Vorbereitung auf den Seniorenfußball.",
    obergrenzeText: "1 gegen 1 bis 4 gegen 4 (+2 Anspieler)", obergrenzeSpieler: 6, anspielerErlaubt: true,
    nettospielzeit: "48 Min./Woche (U16), ab U17: 32 Min./Woche", betreuung: "",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: false },
    spieltagHinweise: "11v11 Ligaspiele mit regelmäßigen Einsatzzeiten · Pokal- und Ligasystem",
    hinweis: "Fokusjahrgang U17: letzte Stufe des Organigramms im Konzeptpapier."
  },
  {
    id: "a", kuerzel: "A", name: "A-Junioren", vonU: 18, bisU: 19,
    bereichId: "leistung", reihenfolge: 7, altersspanne: "18-19 Jahre",
    entwicklungsstand: "Vollerreichte Reife, professionelle Ansprüche, Vorbereitung auf Seniorenfußball oder höherklassigen Fußball, Individualität und Leistung im Fokus.",
    obergrenzeText: "1 gegen 1 bis 4 gegen 4 (+2 Anspieler)", obergrenzeSpieler: 6, anspielerErlaubt: true,
    nettospielzeit: "mind. 32 Min./Woche", betreuung: "",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: false },
    spieltagHinweise: "11v11 Ligaspiele · Wechsel zwischen Entwicklung und voller Leistung · Vorbereitung auf Seniorenfußball bzw. akademische/berufliche Karriere",
    hinweis: "Das Organigramm des Konzeptpapiers endet bei U17 — die A-Junioren laufen dort unter „Übergang in den Männerbereich“."
  },
  {
    id: "u23", kuerzel: "U23", name: "U23", vonU: 20, bisU: 23,
    bereichId: "leistung", reihenfolge: 8, altersspanne: "20-23 Jahre",
    entwicklungsstand: "",
    obergrenzeText: "", obergrenzeSpieler: null, anspielerErlaubt: false,
    nettospielzeit: "", betreuung: "",
    frequenz: { mannschaft: 2, foerder: 1, foerderFreiwillig: false },
    spieltagHinweise: "",
    hinweis: "Für diese Stufe liegen noch keine Inhalte vor. Die Trainingsphilosophie Deutschland endet mit dem Juniorenbereich — Schwerpunkte und Übungen für die U23 trägt die Nachwuchsleitung selbst ein."
  }
];

const SEED_SAEULEN = [
  {
    id: "gleichzahl", name: "Gleichzahlspiele", reihenfolge: 1,
    beschreibung: "1v1 bis 4v4 Varianten. Fokus: Frontale 1-gegen-1-Duelle, individuelles Dribbeln und Passspiel, ganzheitliche Spielerentwicklung."
  },
  {
    id: "anspieler", name: "Gleichzahlspiele mit Anspielern", reihenfolge: 2,
    beschreibung: "Spieler an den Außenpositionen (Anspieler). Durch die lebendige Bande gelangt der Ball seltener ins Aus, es entsteht mehr weiträumiges Passspiel sowie mehr Flanken und Kopfbälle."
  },
  {
    id: "linie", name: "Eine Linie verteidigen/bespielen", reihenfolge: 3,
    beschreibung: "Ab dem Alter der D-Junioren sollte gezieltes, taktisch akzentuiertes Fußballspielen eingeplant werden. Diese Spielformen schulen das Verteidigen im Verbund (Verschieben, Herausrücken, Absichern) sowie das Bespielen einer organisierten Abwehr unter Abseitsregel."
  },
  {
    id: "ueberunterzahl", name: "Über-/Unterzahlspiele", reihenfolge: 4,
    beschreibung: "Über-/Unterzahlspiele akzentuieren das Pass- und Zusammenspiel. Verteidiger können sich nicht auf einen Gegenspieler konzentrieren, sondern müssen den jeweils gefährlicheren Spieler decken — auch das erfordert Spielintelligenz."
  }
];

// trainingsart wird nach der Gruppengröße vergeben: Formen ab 10 beteiligten
// Spielern brauchen den vollen Kader ("mannschaft"), kleinere laufen auch im
// Fördertraining ("beide").
const SEED_UEBUNGEN = [
  // ---------- Gleichzahlspiele ----------
  {
    id: "gz-01", name: "4 gegen 4", saeule: "gleichzahl",
    aufbau: "25x25m Feld, 2 Tore mit Torhütern, 2 Teams à 4 Spieler.",
    ablauf: "Geht der Ball ins Aus oder fällt ein Treffer, eröffnet der jeweilige Torhüter neu.",
    varianten: "Nur Quer-/Vorwärtspässe erlauben; max. 1 Rückpass zum Torhüter pro Ballbesitzphase; mit Shotclock (Abschluss in 8-10 Sekunden).",
    spielform: "4 gegen 4", spielerProTeam: 4, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 10, feldgroesse: "25 × 25 m", trainingsart: "mannschaft",
    zitat: "Kleine Spielformen machen den Spielern immer richtig Spaß. Sie enthalten das A und O des Fußballs. Verteidiger schießen Tore, Angreifer müssen verteidigen. Keiner kann sich verstecken.",
    zitatVon: "Hermann Gerland"
  },
  {
    id: "gz-02", name: "1 gegen 1 bis 4 gegen 4 (progressiv)", saeule: "gleichzahl",
    aufbau: "Doppelter Strafraum, 1 Tor mit Torhüter + 2 Minitore. 2 Teams à 4, durchnummeriert.",
    ablauf: "Verteidiger eröffnet per Flugball zum 1v1. Alle 30 Sekunden spielt der Trainer einen neuen Ball ein — so wird aus dem 1v1 ein 2v2, 3v3, schließlich 4v4.",
    varianten: "Spielzeit variieren; Treffer nur aus der gegnerischen Hälfte; mit Abseits.",
    spielform: "1 gegen 1 bis 4 gegen 4", spielerProTeam: 4, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 9, feldgroesse: "Doppelter Strafraum", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "gz-03", name: "Vom 2 gegen 2 zum 4 gegen 4", saeule: "gleichzahl",
    aufbau: "25x25m Feld, 2 Tore mit Torhütern. 2 Teams à 4 in Paaren.",
    ablauf: "2 gegen 2 für 15-20 Sekunden, danach nahtlos für die gleiche Dauer im 4 gegen 4 weiterspielen.",
    varianten: "",
    spielform: "2 gegen 2 → 4 gegen 4", spielerProTeam: 4, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 10, feldgroesse: "25 × 25 m", trainingsart: "mannschaft",
    zitat: "", zitatVon: ""
  },
  {
    id: "gz-04", name: "2 gegen 2 in 8 Sekunden", saeule: "gleichzahl",
    aufbau: "25x20m Feld, 2 Tore mit Torhüter. 2 Teams à 6 Spieler neben den Toren.",
    ablauf: "Trainer eröffnet mit Zuspiel zum Angreifer, 2 gegen 2 über 8 Sekunden — laut heruntergezählt statt mit der Uhr gestoppt.",
    varianten: "",
    spielform: "2 gegen 2", spielerProTeam: 2, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 14, feldgroesse: "25 × 20 m", trainingsart: "mannschaft",
    zitat: "Durch die 8-Sekunden-Regel müssen die Angreifer sofort nach vorn und gegebenenfalls ins gegnerüberwindende Dribbling denken.",
    zitatVon: "Antonio di Salvo"
  },
  {
    id: "gz-05", name: "Funino im 3 gegen 3", saeule: "gleichzahl",
    aufbau: "20x18m Feld mit zwei 5m tiefen Abschlusszonen, je 2 Minitore auf den Grundlinien, Balldepot zwischen den Toren.",
    ablauf: "Treffer zählen nur innerhalb der Abschlusszonen. Bei Seitenaus spielt der Trainer ein, sonst bedienen sich die Spieler selbst aus dem Balldepot.",
    varianten: "Ohne Abschlusszonen; mit Abseits; mit Mittellinie (Treffer nur in gegnerischer Hälfte).",
    spielform: "3 gegen 3", spielerProTeam: 3, anspieler: 0, mitTorhueter: false,
    spielerGesamt: 6, feldgroesse: "20 × 18 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "gz-06", name: "3 gegen 3 mit drehendem Angriffsrecht", saeule: "gleichzahl",
    aufbau: "20x20m Feld, 1 Tor mit Torhüter + 2 Minitore.",
    ablauf: "Ein Treffer auf die Minitore verschafft das Angriffsrecht aufs Großtor. Erobern die Verteidiger den Ball, kontern sie auf die Minitore, um ihrerseits das Angriffsrecht zu erhalten.",
    varianten: "",
    spielform: "3 gegen 3", spielerProTeam: 3, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 7, feldgroesse: "20 × 20 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "gz-07", name: "4 gegen 4 mit drehendem Angriffsrecht", saeule: "gleichzahl",
    aufbau: "20x20m Feld mit 5m tiefer Eröffnungszone + 1 Tor mit Torhüter.",
    ablauf: "Ein Dribbling in die Eröffnungszone verschafft dem Team das Angriffsrecht aufs Tor.",
    varianten: "Lässt sich auch ohne Torhüter und auf Minitore spielen — eignet sich damit auch für kleinsten Raum.",
    spielform: "4 gegen 4", spielerProTeam: 4, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 9, feldgroesse: "20 × 20 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },

  // ---------- Gleichzahlspiele mit Anspielern ----------
  {
    id: "an-01", name: "3 gegen 3 mit drehendem Angriffsrecht mit Anspieler", saeule: "anspieler",
    aufbau: "25x25m Feld mit Abseitslinie 15m vor dem Tor mit Torhüter. 1 Anspieler an der Grundlinie.",
    ablauf: "Nach Zuspiel zum Anspieler erhält das Team das Angriffsrecht (mit Abseits). Ballgewinn: Verteidiger kontern zum Anspieler auf der anderen Seite.",
    varianten: "Statt Anspieler mit Dribbellinie spielen; ohne Abseits.",
    spielform: "3 gegen 3 + Anspieler", spielerProTeam: 3, anspieler: 1, mitTorhueter: true,
    spielerGesamt: 8, feldgroesse: "25 × 25 m", trainingsart: "beide",
    zitat: "Beim klassischen 4 gegen 4 gibt es keine Flanken. Durch den Einsatz von seitlichen Anspielern entsteht die Möglichkeit zu flanken, wodurch Stürmer und Verteidiger mit Kopfballqualitäten gefördert werden.",
    zitatVon: "Sven Bender"
  },
  {
    id: "an-02", name: "Doppelfeld-Lösung bei 14 Feldspielern + 2 Torhütern", saeule: "anspieler",
    aufbau: "Zwei 22x25m Felder mit je 1 Tor + Torhüter, je 2 Teams à 3 plus 1 Anspieler an der Grundlinie.",
    ablauf: "Jeweils 3 gegen 3 mit drehendem Angriffsrecht über den Anspieler — parallel auf beiden Feldern.",
    varianten: "",
    spielform: "2 × 3 gegen 3 + Anspieler", spielerProTeam: 3, anspieler: 1, mitTorhueter: true,
    spielerGesamt: 16, feldgroesse: "2 × 22 × 25 m", trainingsart: "mannschaft",
    zitat: "Denken wir es noch größer, z.B. bei einer B- oder A-Jugend mit 21 Spielern und 3 Torhütern: Dann bauen wir dieses Feld dreimal auf und erhöhen so die Nettospielzeit pro Spieler.",
    zitatVon: "Hannes Wolf"
  },
  {
    id: "an-03", name: "Funino im 2 gegen 2 mit Anspieler", saeule: "anspieler",
    aufbau: "25x18m Feld mit Mittellinie, 2 Minitore auf einer Grundlinie, 1 Anspieler an der anderen Grundlinie.",
    ablauf: "Nach Zuspiel zum Anspieler erhält das Team das Angriffsrecht auf die Minitore (mit Abseits).",
    varianten: "Anspieler durch Dribbellinie ersetzen; ohne Abseits.",
    spielform: "2 gegen 2 + Anspieler", spielerProTeam: 2, anspieler: 1, mitTorhueter: false,
    spielerGesamt: 5, feldgroesse: "25 × 18 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "an-04", name: "4+TW gegen 4+TW plus Anspieler", saeule: "anspieler",
    aufbau: "Doppelter Strafraum, 2 Teams à 4, 1 Anspieler am Mittelkreis mit Bällen.",
    ablauf: "Anspieler eröffnet per Flugball ins Feld, danach freies Spiel. Aufgaben nach einiger Zeit tauschen.",
    varianten: "Nach Ausball/Treffer mit Standardsituation (Ecke, Einwurf, Freistoß) weiterspielen.",
    spielform: "4 gegen 4 + Anspieler", spielerProTeam: 4, anspieler: 1, mitTorhueter: true,
    spielerGesamt: 11, feldgroesse: "Doppelter Strafraum", trainingsart: "mannschaft",
    zitat: "", zitatVon: ""
  },
  {
    id: "an-05", name: "4+TW+2 gegen 4+TW+2 mit diagonalen Anspielern", saeule: "anspieler",
    aufbau: "20x30m Sechseck, 2 Tore mit Torhütern, 2 Teams à 6, je 2 Spieler diagonal in der gegnerischen Hälfte.",
    ablauf: "Anspieler agieren mit max. 2 Kontakten. Treffer können, müssen aber nicht über sie vorbereitet werden.",
    varianten: "Treffer nach Anspieler-Vorbereitung zählen doppelt; Direktspiel für Anspieler; mit Mittellinie und Abseits.",
    spielform: "4 gegen 4 + 2 Anspieler", spielerProTeam: 4, anspieler: 2, mitTorhueter: true,
    spielerGesamt: 14, feldgroesse: "20 × 30 m Sechseck", trainingsart: "mannschaft",
    zitat: "", zitatVon: ""
  },
  {
    id: "an-06", name: "3+TW+2 gegen 3+TW+2 mit Anspielern neben dem Tor", saeule: "anspieler",
    aufbau: "20x30m Sechseck, 2 Tore mit Torhütern, 2 Teams à 5, je 2 Spieler neben dem gegnerischen Tor.",
    ablauf: "Anspieler mit max. 2 Kontakten, Treffer optional über sie vorbereitet.",
    varianten: "Korridor neben den Toren vergrößern; im Rechteck spielen; Direktspiel.",
    spielform: "3 gegen 3 + 2 Anspieler", spielerProTeam: 3, anspieler: 2, mitTorhueter: true,
    spielerGesamt: 12, feldgroesse: "20 × 30 m Sechseck", trainingsart: "mannschaft",
    zitat: "", zitatVon: ""
  },
  {
    id: "an-07", name: "4+TW+2 gegen 4+TW+2 mit Anspielern zum Flanken", saeule: "anspieler",
    aufbau: "20x40m Sechseck, 2 Tore mit Torhütern, 2 Teams à 6, je 2 diagonale Anspieler.",
    ablauf: "Mit Abseits spielen. Anspieler müssen nach max. 2 Kontakten zielgerichtet flanken.",
    varianten: "Treffer nach Anspieler-Vorbereitung zählen doppelt.",
    spielform: "4 gegen 4 + 2 Anspieler", spielerProTeam: 4, anspieler: 2, mitTorhueter: true,
    spielerGesamt: 14, feldgroesse: "20 × 40 m Sechseck", trainingsart: "mannschaft",
    zitat: "", zitatVon: ""
  },
  {
    id: "an-08", name: "4+TW gegen 4+TW plus Flankengeber", saeule: "anspieler",
    aufbau: "Doppelter Strafraum, 2 Tore mit Torhütern, 2 Teams à 5, je 1 Flankengeber an der Seitenlinie.",
    ablauf: "Torhüter eröffnet per Abwurf zum Flankengeber, der hereingibt — danach freies Spiel.",
    varianten: "Flankengeber hat den Ball bereits am Fuß; Eröffnung per Chipball ins Zentrum; mit Standardsituationen.",
    spielform: "4 gegen 4 + Flankengeber", spielerProTeam: 4, anspieler: 1, mitTorhueter: true,
    spielerGesamt: 12, feldgroesse: "Doppelter Strafraum", trainingsart: "mannschaft",
    zitat: "", zitatVon: ""
  },
  {
    id: "an-09", name: "Funino im 3 gegen 3 mit Anspieler", saeule: "anspieler",
    aufbau: "20x18m Feld mit 2 Abschlusszonen, je 2 Minitore, Balldepots. 2 Teams à 4, je 1 Spieler zwischen den Minitoren als Anspieler.",
    ablauf: "Anspieler agiert mit max. 2 Kontakten oder direkt. Treffer nur in den Abschlusszonen.",
    varianten: "Treffer nach Anspieler-Vorlage zählen doppelt; ohne Abschlusszonen; mit Abseits; mit Mittellinie.",
    spielform: "3 gegen 3 + Anspieler", spielerProTeam: 3, anspieler: 1, mitTorhueter: false,
    spielerGesamt: 8, feldgroesse: "20 × 18 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "an-10", name: "3+2 diagonale Anspieler gegen 3+TW+1 Anspieler", saeule: "anspieler",
    aufbau: "20x25m Sechseck, 1 Tor mit Torhüter, 2 Minitore. Team Blau (5 Spieler) gegen Team Rot (4 Spieler).",
    ablauf: "Blau greift aufs Großtor an, Rot auf die Minitore. Anspieler mit max. 2 Kontakten.",
    varianten: "Anspieler und Aufgaben nach einiger Zeit tauschen.",
    spielform: "3 gegen 3 im Hybrid-Feld", spielerProTeam: 3, anspieler: 2, mitTorhueter: true,
    spielerGesamt: 10, feldgroesse: "20 × 25 m Sechseck", trainingsart: "mannschaft",
    zitat: "Eine Spielform im Hybrid-Feld kombiniert zwei Formate, sodass der Coach flexibler auf seine Trainingsbedingungen reagieren kann.",
    zitatVon: "Hannes Wolf"
  },
  {
    id: "an-11", name: "3 gegen 3 mit drehendem Angriffsrecht plus 2 diagonale Anspieler", saeule: "anspieler",
    aufbau: "20x25m Sechseck, 1 Tor mit neutralem Torhüter. 2 Teams à 3, 2 diagonale Anspieler.",
    ablauf: "Nach Dribbling über die Grundlinie erhält das Team das Angriffsrecht, bis es verloren geht oder der Ball ins Aus geht.",
    varianten: "",
    spielform: "3 gegen 3 + 2 Anspieler", spielerProTeam: 3, anspieler: 2, mitTorhueter: true,
    spielerGesamt: 9, feldgroesse: "20 × 25 m Sechseck", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },

  // ---------- Eine Linie verteidigen/bespielen ----------
  {
    id: "li-01", name: "4 gegen 4 auf Linie verteidigen", saeule: "linie",
    aufbau: "Doppelter Strafraum mit Mittellinie, 1 Tor mit Torhüter + 3 Minitore. 2 Teams à 4.",
    ablauf: "Mit Abseits spielen. Die Verteidiger agieren auf der Mittellinie, wobei jeweils einer herausrücken darf. Bei Ballgewinn: 20-30 Sekunden frei und ohne Abseits weiterspielen.",
    varianten: "Auf je 2 Minitore spielen.",
    spielform: "4 gegen 4", spielerProTeam: 4, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 9, feldgroesse: "Doppelter Strafraum", trainingsart: "beide",
    zitat: "So wird in der Bundesliga verteidigt. Drei Spieler können eine Linie verteidigen, sodass einer immer herausrücken darf. Die anderen schließen die Mitte, weil dort das Tor steht.",
    zitatVon: "Hermann Gerland"
  },
  {
    id: "li-02", name: "4 gegen 4 auf Linie verteidigen (breit)", saeule: "linie",
    aufbau: "30x45m Sechseck mit Mittellinie, 2 Tore mit Torhütern. 2 Teams à 4.",
    ablauf: "Gleicher Ablauf wie bei der Grundform, aber auf breiterem Feld — provoziert mehr Flügel-1v1.",
    varianten: "Auf 1 Großtor + 2 Minitore; auf je 2 Minitore.",
    spielform: "4 gegen 4", spielerProTeam: 4, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 10, feldgroesse: "30 × 45 m Sechseck", trainingsart: "mannschaft",
    zitat: "Durch das breitere Feld provozieren wir noch mehr 1-gegen-1-Duelle von außen, weil die Verteidiger mehr Raum abdecken müssen.",
    zitatVon: "Hannes Wolf"
  },
  {
    id: "li-03", name: "3 gegen 3 plus TW auf Linie verteidigen", saeule: "linie",
    aufbau: "25x20m Feld mit Mittellinie, 1 Tor mit Torhüter + 2 Minitore. 2 Teams à 3.",
    ablauf: "Mit Abseits spielen, Verteidiger auf der Mittellinie, einer darf herausrücken. Bei Ballgewinn 20-30 Sekunden frei ohne Abseits.",
    varianten: "",
    spielform: "3 gegen 3", spielerProTeam: 3, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 7, feldgroesse: "25 × 20 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "li-04", name: "5+TW gegen 5+TW auf Linie verteidigen", saeule: "linie",
    aufbau: "25x50m Feld mit 2 Toren, Torhütern und Abseitslinie. Angreifer im 2-3-System, Verteidiger im 4-1-System.",
    ablauf: "Verteidiger agieren auf der Abseitslinie, zusätzlich zum Sechser darf einer herausrücken. Bei Ballgewinn 20-30 Sekunden frei ohne Abseits.",
    varianten: "Abseitslinie tiefer/höher markieren (Feldtiefe entsprechend anpassen).",
    spielform: "5 gegen 5", spielerProTeam: 5, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 12, feldgroesse: "25 × 50 m", trainingsart: "mannschaft",
    zitat: "Je weiter die Abseitslinie nach vorne geschoben wird, desto mehr rückt das Verteidigen des Raumes im Rücken in den Fokus — und in der Offensive die Tiefenläufe.",
    zitatVon: "Sven Bender"
  },
  {
    id: "li-05", name: "3-gegen-3-Liniendribbling I", saeule: "linie",
    aufbau: "20x18m Feld mit Mittellinie, je 2 Minitore auf den Grundlinien, Balldepot.",
    ablauf: "Das Überdribbeln der Mittellinie ergibt 1 Punkt (max. 1x pro Ballbesitzphase), Treffer zählen ebenfalls einfach.",
    varianten: "Abschlusszone markieren; Überspielen der Mittellinie = 1 Punkt; mit Abseits.",
    spielform: "3 gegen 3", spielerProTeam: 3, anspieler: 0, mitTorhueter: false,
    spielerGesamt: 6, feldgroesse: "20 × 18 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "li-06", name: "3-gegen-3-Liniendribbling II", saeule: "linie",
    aufbau: "Wie Liniendribbling I, jedoch die Mittellinie dreigeteilt (Zentrumslinie).",
    ablauf: "Das Überspielen/-dribbeln der Zentrumslinie ergibt 1 Punkt. Fördert gezielt das Verteidigen des Zentrums.",
    varianten: "Überdribbeln der Mittellinie = 2 Punkte; mit Abseits.",
    spielform: "3 gegen 3", spielerProTeam: 3, anspieler: 0, mitTorhueter: false,
    spielerGesamt: 6, feldgroesse: "20 × 18 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },

  // ---------- Über-/Unterzahlspiele ----------
  {
    id: "uu-01", name: "4+TW gegen 4+TW plus 1 (Neutraler)", saeule: "ueberunterzahl",
    aufbau: "Doppelter Strafraum mit Mittellinie, 2 Tore mit Torhütern. 2 Teams à 4 + 1 Neutraler.",
    ablauf: "Der Neutrale spielt immer mit dem ballbesitzenden Team und darf Tore erzielen. In der eigenen Hälfte max. 2 Kontakte, in der gegnerischen frei. Mit Abseits.",
    varianten: "Feld auf 30m Breite verengen.",
    spielform: "4 gegen 4 + Neutraler", spielerProTeam: 4, anspieler: 1, mitTorhueter: true,
    spielerGesamt: 11, feldgroesse: "Doppelter Strafraum", trainingsart: "mannschaft",
    zitat: "Irgendwann muss sich ein Verteidiger von seinem Gegenspieler lösen und den gefährlicheren decken — so entstehen für das angreifende Team viele Aktionen nach vorn.",
    zitatVon: "Hannes Wolf"
  },
  {
    id: "uu-02", name: "4+TW gegen 4+1 — Tore nur direkt", saeule: "ueberunterzahl",
    aufbau: "20x25m Feld, 1 Tor mit Torhüter + 2 Minitore. 2 Teams à 4 + 1 Neutraler.",
    ablauf: "Neutraler spielt mit dem Ballbesitzer, Treffer zählen nur per direktem Abschluss.",
    varianten: "Treffer nur nach direkt gespielter Vorlage und direktem Abschluss.",
    spielform: "4 gegen 4 + Neutraler", spielerProTeam: 4, anspieler: 1, mitTorhueter: true,
    spielerGesamt: 10, feldgroesse: "20 × 25 m", trainingsart: "mannschaft",
    zitat: "Tore nur direkt erzielen zu dürfen, erhöht den Präzisionsdruck enorm — auch der letzte Pass muss perfekt sitzen.",
    zitatVon: "Peter Hermann"
  },
  {
    id: "uu-03", name: "4 gegen 3 mit fliegendem Torhüter", saeule: "ueberunterzahl",
    aufbau: "20x18m Feld mit 5m tiefer Schusszone, 1 Tor mit Torhüter. Team Blau (4) gegen Team Rot (3).",
    ablauf: "4 gegen 3 auf Minitore, Treffer nur aus der Schusszone. Erobert das Unterzahlteam den Ball, kontert es aufs Großtor — ein Spieler des Überzahlteams muss dann als letzter Mann zurücksprinten und den Kasten hüten.",
    varianten: "Spieler so wechseln, dass jeder mal in Über- bzw. Unterzahl spielt.",
    spielform: "4 gegen 3", spielerProTeam: 4, anspieler: 0, mitTorhueter: true,
    spielerGesamt: 8, feldgroesse: "20 × 18 m", trainingsart: "beide",
    zitat: "", zitatVon: ""
  },
  {
    id: "uu-04", name: "Funino 3 gegen 3 plus 1 — Tore nur direkt", saeule: "ueberunterzahl",
    aufbau: "20x20m Feld mit je 2 Minitoren auf den Grundlinien, Balldepots. 2 Teams à 3 + 1 Neutraler.",
    ablauf: "Neutraler agiert immer mit dem Ballbesitzer. Angriffe müssen in 10 Sekunden abgeschlossen werden, Treffer nur per direktem Abschluss.",
    varianten: "Abschlusszone markieren; Treffer nur nach direktem Assist + direktem Abschluss; mit Abseits; als 3+TW gegen 3+TW mit Mittellinie.",
    spielform: "3 gegen 3 + Neutraler", spielerProTeam: 3, anspieler: 1, mitTorhueter: false,
    spielerGesamt: 7, feldgroesse: "20 × 20 m", trainingsart: "beide",
    zitat: "Dank der Shotclock-Regel verfallen die Spieler durch den Überzahlspieler nicht in ein Ballgeschiebe, sondern sind gezwungen, Lösungen nach vorn zu finden.",
    zitatVon: "Hannes Wolf"
  }
];

// Die Schwerpunkte sind wörtlich die „Trainings-Fokus“-Punkte der Alterskapitel,
// zugeordnet nach Buchstabe (Kapitel 5.1 = Bambini/G … 5.7 = A-Junioren).
// Verknüpft sind nur Übungen, die die DFB-Obergrenze der jeweiligen Stufe
// einhalten — deshalb haben die Bambini (max. 2 gegen 2) sichtbar weniger als die
// späteren Stufen.
const SEED_SCHWERPUNKTE = [
  // ---------- Bambini / G-Junioren (U6/U7), Kapitel 5.1 ----------
  { id: "g-01", stufeId: "g", reihenfolge: 1, aktiv: true, trainingsart: "beide",
    titel: "Ballbeherrschung und Dribbeln",
    beschreibung: "Mit dem Ball am Fuß spielen.", uebungIds: ["gz-04"] },
  { id: "g-02", stufeId: "g", reihenfolge: 2, aktiv: true, trainingsart: "mannschaft",
    titel: "Spielerische Formen",
    beschreibung: "Fangspiele mit Ball.", uebungIds: [] },
  { id: "g-03", stufeId: "g", reihenfolge: 3, aktiv: true, trainingsart: "beide",
    titel: "Erste 1v1-Duelle",
    beschreibung: "Auf spielerische Art.", uebungIds: ["gz-04", "an-03"] },
  { id: "g-04", stufeId: "g", reihenfolge: 4, aktiv: true, trainingsart: "mannschaft",
    titel: "Mehrere Minitore statt Großfeld",
    beschreibung: "", uebungIds: ["an-03"] },
  { id: "g-05", stufeId: "g", reihenfolge: 5, aktiv: true, trainingsart: "beide",
    titel: "Verschiedene Ballarten",
    beschreibung: "Unterschiedliche Größen und Gewichte.", uebungIds: [] },

  // ---------- F-Junioren (U8/U9), Kapitel 5.2 ----------
  { id: "f-01", stufeId: "f", reihenfolge: 1, aktiv: true, trainingsart: "beide",
    titel: "Persönliche Duelle",
    beschreibung: "1v1 mit höherem Fokus.", uebungIds: ["gz-04", "gz-06"] },
  { id: "f-02", stufeId: "f", reihenfolge: 2, aktiv: true, trainingsart: "mannschaft",
    titel: "3v3 und 4v4 Spiele",
    beschreibung: "Verknüpft sind die Formen bis 3 gegen 3 — größere liegen über der DFB-Obergrenze dieser Stufe.",
    uebungIds: ["gz-05", "gz-06", "an-09", "uu-04"] },
  { id: "f-03", stufeId: "f", reihenfolge: 3, aktiv: true, trainingsart: "beide",
    titel: "Grundtechniken: Ballannahme, Passspiel, Torschuss",
    beschreibung: "", uebungIds: ["an-01", "an-11"] },
  { id: "f-04", stufeId: "f", reihenfolge: 4, aktiv: true, trainingsart: "mannschaft",
    titel: "Erste taktische Elemente",
    beschreibung: "Positionsverständnis.", uebungIds: ["gz-06", "an-02", "an-10"] },

  // ---------- E-Junioren (U10/U11), Kapitel 5.3 ----------
  { id: "e-01", stufeId: "e", reihenfolge: 1, aktiv: true, trainingsart: "mannschaft",
    titel: "3v3 bis 4v4 mit taktischen Elementen",
    beschreibung: "", uebungIds: ["gz-01", "gz-03", "gz-06", "gz-07"] },
  { id: "e-02", stufeId: "e", reihenfolge: 2, aktiv: true, trainingsart: "beide",
    titel: "Passspiel und Ballkontrolle in Spielsituationen",
    beschreibung: "", uebungIds: ["an-04", "an-05", "uu-01", "uu-02"] },
  { id: "e-03", stufeId: "e", reihenfolge: 3, aktiv: true, trainingsart: "mannschaft",
    titel: "Erste Rückpassregel",
    beschreibung: "", uebungIds: ["gz-01"] },
  { id: "e-04", stufeId: "e", reihenfolge: 4, aktiv: true, trainingsart: "mannschaft",
    titel: "Spezialisierung von Positionen",
    beschreibung: "Abwehr, Mittelfeld, Angriff.", uebungIds: ["an-06", "an-08", "li-01"] },
  { id: "e-05", stufeId: "e", reihenfolge: 5, aktiv: true, trainingsart: "beide",
    titel: "Kopfballtraining beginnt",
    beschreibung: "", uebungIds: ["an-07", "an-08"] },

  // ---------- D-Junioren (U12/U13), Kapitel 5.4 ----------
  { id: "d-01", stufeId: "d", reihenfolge: 1, aktiv: true, trainingsart: "mannschaft",
    titel: "4v4 bis 6v6 auf kleineren Feldern",
    beschreibung: "", uebungIds: ["gz-01", "gz-02", "gz-07", "an-05"] },
  { id: "d-02", stufeId: "d", reihenfolge: 2, aktiv: true, trainingsart: "mannschaft",
    titel: "Organisierte Abwehr",
    beschreibung: "Viererkette, Abseitslinie.", uebungIds: ["li-01", "li-02", "li-03", "li-04", "li-05", "li-06"] },
  { id: "d-03", stufeId: "d", reihenfolge: 3, aktiv: true, trainingsart: "foerder",
    titel: "Anforderungsspezifische Trainings",
    beschreibung: "Positions-Fokus.", uebungIds: ["an-07", "an-08", "uu-03"] },
  { id: "d-04", stufeId: "d", reihenfolge: 4, aktiv: true, trainingsart: "mannschaft",
    titel: "Hohe Intensität mit schnellen Umschaltungen",
    beschreibung: "", uebungIds: ["gz-04", "uu-01", "uu-04"] },

  // ---------- C-Junioren (U14/U15), Kapitel 5.5 ----------
  { id: "c-01", stufeId: "c", reihenfolge: 1, aktiv: true, trainingsart: "mannschaft",
    titel: "6v6 bis 8v8 auf kleineren/mittleren Feldern",
    beschreibung: "", uebungIds: ["an-05", "an-07", "li-04"] },
  { id: "c-02", stufeId: "c", reihenfolge: 2, aktiv: true, trainingsart: "mannschaft",
    titel: "Organisierte Defensivtaktiken",
    beschreibung: "Linien, Zonen.", uebungIds: ["li-01", "li-02", "li-04", "li-06"] },
  { id: "c-03", stufeId: "c", reihenfolge: 3, aktiv: true, trainingsart: "beide",
    titel: "Schnelle Umschaltspiele, positionsspezifisches Training",
    beschreibung: "", uebungIds: ["gz-06", "uu-01", "uu-02", "uu-03"] },

  // ---------- B-Junioren (U16/U17), Kapitel 5.6 ----------
  { id: "b-01", stufeId: "b", reihenfolge: 1, aktiv: true, trainingsart: "mannschaft",
    titel: "9v9 bis 11v11 auf regulären Feldern",
    beschreibung: "", uebungIds: ["an-02", "li-04"] },
  { id: "b-02", stufeId: "b", reihenfolge: 2, aktiv: true, trainingsart: "mannschaft",
    titel: "Taktische Spiel-Systeme",
    beschreibung: "4-3-3, 4-4-2, 3-5-2.", uebungIds: ["li-02", "li-04"] },
  { id: "b-03", stufeId: "b", reihenfolge: 3, aktiv: true, trainingsart: "beide",
    titel: "Athletische Spitzenleistung, mentales Training",
    beschreibung: "", uebungIds: ["gz-04", "uu-04"] },

  // ---------- A-Junioren (U18/U19), Kapitel 5.7 ----------
  { id: "a-01", stufeId: "a", reihenfolge: 1, aktiv: true, trainingsart: "mannschaft",
    titel: "11v11 auf regulären Plätzen, hochfrequente intensive Trainings",
    beschreibung: "", uebungIds: ["an-02", "gz-03"] },
  { id: "a-02", stufeId: "a", reihenfolge: 2, aktiv: true, trainingsart: "foerder",
    titel: "Individuelle Technik und Athletik auf höchstem Niveau",
    beschreibung: "", uebungIds: ["gz-02", "uu-03"] },
  { id: "a-03", stufeId: "a", reihenfolge: 3, aktiv: true, trainingsart: "mannschaft",
    titel: "Mannschaftstaktik, mentale Stärke, Professionalismus",
    beschreibung: "", uebungIds: ["li-01", "li-04", "uu-01"] }
];

// Aufbau einer idealen Trainingseinheit (Kapitel 4 des Leitfadens) — reine
// Anzeige im Info-Tab, kein Datensatz.
const TRAININGSEINHEIT_BLOECKE = [
  { dauer: "15 Minuten", titel: "Aktivierung / Erwärmung",
    inhalt: "Ballbeherrschung, Dribbling, Fintieren, Fangspiele.",
    ziel: "Viele Aktionen, wenige Standzeiten, Spielfähigkeit entwickeln." },
  { dauer: "30 Minuten", titel: "Spielblock 1",
    inhalt: "1v1 bis 4v4 auf mehreren Feldern (3-4 Min. netto pro Spieler).",
    ziel: "Ganzheitliche Spielerentwicklung, viele Ballaktionen." },
  { dauer: "15 Minuten", titel: "Zwischenblock",
    inhalt: "Grund- und Positionstechnik, Schnelligkeit, Sprints.",
    ziel: "Spezifische technische Fähigkeiten, Athletik." },
  { dauer: "30 Minuten", titel: "Spielblock 2",
    inhalt: "1v1 bis 4v4 auf mehreren Feldern (3-4 Min. netto pro Spieler).",
    ziel: "Ganzheitliche Spielerentwicklung, viele Ballaktionen." }
];

const ECKPFEILER = [
  { titel: "Freude", text: "Der Spaß am Fußball und das Erleben von Erfolgen." },
  { titel: "Intensität", text: "Hochdosiertes Spiel mit vielen Ballaktionen." },
  { titel: "Wiederholung", text: "Konstante Wiederholung von Bewegungsabläufen und Spielsituationen." }
];
