/* =====================================================
   Click the Glitch – script.js
   Aufbau dieser Datei:
   1. Elemente aus dem HTML holen
   2. Einstellungen und Variablen
   3. Begrüßung (Name)
   4. Punkte und Highscore
   5. Das Spiel (Glitch, Start, Ende)
   6. Der Tresor
   ===================================================== */


/* ---------- 1. ELEMENTE AUS DEM HTML HOLEN ----------
   JavaScript kann nur mit Dingen arbeiten, die es "kennt".
   document.getElementById("...") sucht im HTML das Element mit
   dieser id und gibt es uns zurück. Wir speichern es in einer
   const-Variable, damit wir es später benutzen können.
   (const = Konstante: der Variablenname zeigt immer auf dasselbe Element) */

   const titelText     = document.getElementById("titel-text");
   const nameForm      = document.getElementById("name-form");
   const nameInput     = document.getElementById("spielername");
   const scoreEl       = document.getElementById("score");
   const highscoreEl   = document.getElementById("highscore");
   const restzeitEl    = document.getElementById("restzeit");
   const restzeitBox   = document.getElementById("restzeit-box");
   const startBtn      = document.getElementById("start-btn");
   const spielmeldung  = document.getElementById("spielmeldung");
   const spielfeld     = document.getElementById("spielfeld");
   const tresorForm    = document.getElementById("tresor-form");
   const passwortInput = document.getElementById("passwort");
   const tresorMeldung = document.getElementById("tresor-meldung");
   const tresorInhalt  = document.getElementById("tresor-inhalt");
   const spruchEl      = document.getElementById("geheimer-spruch");
   const cheatEl       = document.getElementById("cheat-text");
   
   
   /* ---------- 2. EINSTELLUNGEN UND VARIABLEN ----------
      Oben stehen Werte, die sich nie ändern (const), in GROSSBUCHSTABEN.
      Zum Ausprobieren kannst du sie einfach ändern!
      Darunter stehen Variablen (let), deren Wert sich während des
      Spiels verändert. */
   
   const SPIELDAUER  = 15;       // Länge einer Runde in Sekunden
   const PASSWORT    = "GeoSN";  // das Tresor-Passwort
   const CHEAT_BONUS = 10;        // Zusatzsekunden durch den Cheat-Code
   
   let agentName = "";           // Text: der Name des Spielers
   let score = 0;                // Zahl: aktuelle Punkte
   let highscore = 0;            // Zahl: bester Punktestand
   let highscoreBeiStart = 0;    // Highscore zu Rundenbeginn (zum Vergleichen am Ende)
   let restzeit = SPIELDAUER;    // Zahl: verbleibende Sekunden
   let laeuft = false;           // true/false: läuft gerade eine Runde?
   let countdown = null;         // merkt sich den Timer, damit wir ihn stoppen können
   let glitch = null;            // merkt sich das aktuelle Glitch-Quadrat
   let bonusZeit = 0;            // Zusatzzeit für die nächste Runde
   let cheatFreigeschaltet = false; // wurde der Cheat schon benutzt?
   
   
   /* ---------- 3. BEGRÜSSUNG ---------- */
   
   // Eine Funktion ist ein benannter Block Code, den wir beliebig oft
   // aufrufen können: setAgent("Max");
   function setAgent(name) {
     agentName = name;
     // textContent = der Text innerhalb eines HTML-Elements.
     // Wir überschreiben ihn, und die Seite ändert sich sofort.
     // `...${name}...` ist ein Template-String: ${name} wird durch den Wert ersetzt.
     titelText.textContent = `Willkommen, Agent ${name}!`;
   }
   
   // addEventListener = "Wenn X passiert, führe diese Funktion aus".
   // Hier: Wenn das Namens-Formular abgeschickt wird (Klick auf "Bestätigen").
   nameForm.addEventListener("submit", function (event) {
     event.preventDefault();             // verhindert, dass die Seite neu lädt
   
     const name = nameInput.value.trim(); // .value = Text im Eingabefeld, .trim() = Leerzeichen am Rand weg
     if (name === "") return;             // leer? Dann abbrechen (return beendet die Funktion)
   
     setAgent(name);
   
     // localStorage = kleiner Speicher im Browser, bleibt nach dem Schließen erhalten.
     // try/catch fängt Fehler ab, falls der Browser das Speichern verbietet.
     try {
       localStorage.setItem("spielername", name);
     } catch (e) {}
   });
   
   // Beim Laden der Seite: gespeicherte Werte zurückholen
   try {
     const gespeichert = localStorage.getItem("spielername");
     if (gespeichert) {                  // gibt es einen gespeicherten Namen?
       nameInput.value = gespeichert;
       setAgent(gespeichert);
     }
     // getItem liefert Text. parseInt macht daraus eine Zahl.
     // "|| 0" bedeutet: Wenn nichts da ist, nimm 0.
     highscore = parseInt(localStorage.getItem("highscore")) || 0;
   } catch (e) {}
   highscoreEl.textContent = highscore;
   
   
   /* ---------- 4. PUNKTE UND HIGHSCORE ---------- */
   
   // punkte ist ein Parameter: der Wert, den wir beim Aufruf mitgeben.
   // addScore(1) -> punkte ist 1
   function addScore(punkte) {
     score = score + punkte;
     scoreEl.textContent = score;        // Anzeige im Dashboard aktualisieren
   
     if (score > highscore) {            // neuer Rekord?
       highscore = score;
       highscoreEl.textContent = highscore;
       try {
         localStorage.setItem("highscore", highscore);
       } catch (e) {}
     }
   }
   
   
   /* ---------- 5. DAS SPIEL ---------- */
   
   // Zeigt die Restzeit an und färbt die Box rot, wenn es knapp wird.
   function anzeigeRestzeit() {
     restzeitEl.textContent = restzeit;
     // classList.toggle("warn", Bedingung): Klasse "warn" an, wenn die
     // Bedingung wahr ist, sonst aus. Das Aussehen steht dann in der CSS.
     restzeitBox.classList.toggle("warn", restzeit <= 5);
   }
   
   // Erzeugt einen neuen Glitch an einer zufälligen Position.
   function erzeugeGlitch() {
     // Gibt es schon einen alten Glitch? Dann zuerst entfernen.
     if (glitch) glitch.remove();
   
     const groesse = 36;                  // Kantenlänge des Quadrats in Pixeln
   
     // Wie weit rechts/unten darf die linke obere Ecke höchstens sein?
     // Spielfeldgröße minus Glitch-Größe, sonst ragt er über den Rand.
     const maxX = Math.max(0, spielfeld.clientWidth  - groesse);
     const maxY = Math.max(0, spielfeld.clientHeight - groesse);
   
     // Math.random() liefert eine Zufallszahl zwischen 0 und 1.
     // Mal maxX gerechnet ergibt das eine Zufallsposition zwischen 0 und maxX.
     const x = Math.random() * maxX;
     const y = Math.random() * maxY;
   
     // Zufällige Farbe: hsl(Farbton 0-360, Sättigung, Helligkeit)
     const farbton = Math.floor(Math.random() * 360); // floor = abrunden
     const farbe = `hsl(${farbton}, 100%, 55%)`;
   
     // Neues HTML-Element im Speicher erstellen: <div class="glitch"></div>
     glitch = document.createElement("div");
     glitch.className = "glitch";
     glitch.style.left = x + "px";        // Position per Inline-Style setzen
     glitch.style.top = y + "px";
     glitch.style.background = farbe;
     glitch.style.boxShadow = `0 0 14px ${farbe}`;
   
     // Klick auf den Glitch -> glitchGetroffen ausführen
     glitch.addEventListener("click", glitchGetroffen);
   
     // Erst jetzt wird das Quadrat wirklich ins Spielfeld eingefügt.
     spielfeld.appendChild(glitch);
   }
   
   // Wird bei jedem Klick auf einen Glitch ausgeführt.
   function glitchGetroffen() {
     if (!laeuft) return;                 // "!" heißt "nicht": läuft kein Spiel, nichts tun
     addScore(1);                         // +1 Punkt
     erzeugeGlitch();                     // alter Glitch weg, neuer an anderer Stelle
   }
   
   function startSpiel() {
     score = 0;
     scoreEl.textContent = 0;
     highscoreBeiStart = highscore;
   
     restzeit = SPIELDAUER + bonusZeit;   // Cheat-Bonus (falls vorhanden) dazurechnen
     bonusZeit = 0;                       // Bonus gilt nur für eine Runde
     anzeigeRestzeit();
   
     laeuft = true;
     startBtn.disabled = true;            // Start-Button sperren, solange gespielt wird
     spielmeldung.textContent = "Los! Jage die Glitches!";
   
     erzeugeGlitch();
   
     // setInterval führt die Funktion immer wieder aus, hier alle 1000 ms = 1 Sekunde.
     // Das ist unser Countdown.
     countdown = setInterval(function () {
       restzeit = restzeit - 1;
       anzeigeRestzeit();
       if (restzeit <= 0) {
         endeSpiel();
       }
     }, 1000);
   }
   
   function endeSpiel() {
     laeuft = false;
     clearInterval(countdown);            // Timer stoppen, sonst läuft er ewig weiter
   
     if (glitch) {                        // letzten Glitch entfernen
       glitch.remove();
       glitch = null;
     }
   
     const name = agentName || "Agent";   // "||" = oder: kein Name -> "Agent"
     const rekord = score > highscoreBeiStart;
   
     // Bedingter Ausdruck: Bedingung ? Wert_wenn_wahr : Wert_wenn_falsch
     spielmeldung.textContent =
       `Zeit abgelaufen! ${name}, du hast ${score} Punkt${score === 1 ? "" : "e"} erzielt.` +
       (rekord ? " NEUER HIGHSCORE!" : "");
   
     startBtn.textContent = "Nochmal";
     startBtn.disabled = false;
   }
   
   startBtn.addEventListener("click", startSpiel);
   
   
   /* ---------- 6. DER TRESOR ---------- */
   
   // Eine Liste (Array) mit Sprüchen. Die Zählung beginnt bei 0!
   const SPRUECHE = [
     `Wohl nicht genügend Zielwasser getrunken?`
   ];
   
   tresorForm.addEventListener("submit", function (event) {
     event.preventDefault();
   
     const eingabe = passwortInput.value.trim();
     passwortInput.value = "";            // Feld leeren
   
     // Beide Texte in Kleinbuchstaben vergleichen, damit "geosn" auch klappt.
     // "!==" heißt "ist nicht gleich".
     if (eingabe.toLowerCase() !== PASSWORT.toLowerCase()) {
       tresorMeldung.textContent = "Zugriff verweigert.";
       tresorMeldung.className = "fehler";
       return;                            // hier endet die Funktion bei falschem Passwort
     }
   
     // Ab hier: Passwort war richtig
     tresorMeldung.textContent = "Tresor geknackt!";
     tresorMeldung.className = "erfolg";
   
     // Zufälligen Spruch aus der Liste wählen:
     // Zufallszahl * Länge der Liste, abgerundet = gültiger Index
     const index = Math.floor(Math.random() * SPRUECHE.length);
     spruchEl.textContent = "Geheimer Spruch: " + SPRUECHE[index];
   
     // Cheat-Code: nur beim ersten Mal
     if (!cheatFreigeschaltet) {
       cheatFreigeschaltet = true;
   
       if (laeuft) {
         restzeit = restzeit + CHEAT_BONUS;  // Spiel läuft: Zeit sofort gutschreiben
         anzeigeRestzeit();
       } else {
         bonusZeit = CHEAT_BONUS;            // sonst für die nächste Runde merken
       }
       cheatEl.textContent = `CHEAT-CODE "GLITCH+${CHEAT_BONUS}": +${CHEAT_BONUS} Sekunden Zusatzzeit aktiviert!`;
     } else {
       cheatEl.textContent = "Cheat-Code bereits benutzt. Nicht schummeln, Agent!";
     }
   
     tresorInhalt.hidden = false;         // versteckten Bereich sichtbar machen
   });