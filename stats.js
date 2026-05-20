// ==========================================
// REGION: STATISTIK & STREAK-BERÄKNING (ES Module)
// ==========================================
import { data, programs } from './database.js';

// === BEHÅLL: Din existerande hjälpfunktion för veckonummer ===
function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const startYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - startYear) / 86400000) + 1) / 7);
}

// === UPPDATERAD FUNKTION: Beräknar streak baserat på unika kalenderveckor ===
export function updateStreak() {
    const historyEntries = data.history || [];
    if (historyEntries.length === 0) {
        data.streak = 0;
        return;
    }

    // 1. Skapa en lista med unika veckor-år kombinationer (t.ex. "22-2026") från historiken
    const activeWeeks = new Set();
    
    historyEntries.forEach(entry => {
        if (entry.date) {
            const dateObj = new Date(entry.date);
            const weekNum = getWeekNumber(dateObj);
            const yearNum = dateObj.getFullYear();
            // Kombinera vecka och år så att vecka 1 år 2026 skiljer sig från vecka 1 år 2027
            activeWeeks.add(`${weekNum}-${yearNum}`);
        }
    });

    // 2. Ta reda på vilken vecka och vilket år det är JUST NU
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    const currentWeekKey = `${currentWeek}-${currentYear}`;

    // 3. Om användaren inte har tränat alls den här veckan, utgå från förra veckan som startpunkt för kontrollen
    let checkDate = new Date(now);
    if (!activeWeeks.has(currentWeekKey)) {
        // Backa 7 dagar för att kontrollera om förra veckan var aktiv
        checkDate.setDate(checkDate.getDate() - 7);
    }

    let calculatedStreak = 0;
    let gapDetected = false;

    // 4. Räkna bakåt vecka för vecka så länge det finns registrerade pass
    while (!gapDetected) {
        const w = getWeekNumber(checkDate);
        const y = checkDate.getFullYear();
        const weekKey = `${w}-${y}`;

        if (activeWeeks.has(weekKey)) {
            calculatedStreak++;
            // Backa 7 dagar till nästa loop för att titta på veckan innan
            checkDate.setDate(checkDate.getDate() - 7);
        } else {
            // Hittade en tom vecka – kedjan är bruten!
            gapDetected = true;
        }
    }

    // 5. Spara det uträknade värdet i din databas
    data.streak = calculatedStreak;
}

// === BEHÅLL HELT ORÖRD: Din nya sammanfattningsfunktion ===
export function generateStatsSummary() {
    const historyEntries = Object.values(data.history || {});
    
    const summary = {
        totaltAntalPass: historyEntries.length,
        antalStyrka: 0,
        antalLöpning: 0,
        totalDistansKm: 0,
        genomsnittligtBetyg: "",
        morgonPass: 0, // Innan kl 08:00
        nattPass: 0,   // Efter kl 21:00
        betygsFördelning: { Lätt: 0, Lagom: 0, Svårt: 0 }
    };

    let totaltBetygVikt = 0;
    let passMedBetyg = 0;

    historyEntries.forEach(entry => {
        if (entry.type === 'löpning' || entry.isRun) {
            summary.antalLöpning++;
            summary.totalDistansKm += parseFloat(entry.distance) || 0;
        } else if (entry.type === 'styrka' || entry.isStrength) {
            summary.antalStyrka++;
        }

        if (entry.date) {
            const passTimme = new Date(entry.date).getHours();
            if (passTimme < 8) summary.morgonPass++;
            if (passTimme >= 21) summary.nattPass++;
        }

        const betyg = entry.betyg || entry.grade;
        if (betyg) {
            if (betyg === 'Lätt') {
                summary.betygsFördelning.Lätt++;
                totaltBetygVikt += 1;
                passMedBetyg++;
            } else if (betyg === 'Lagom') {
                summary.betygsFördelning.Lagom++;
                totaltBetygVikt += 2;
                passMedBetyg++;
            } else if (betyg === 'Svårt') {
                summary.betygsFördelning.Svårt++;
                totaltBetygVikt += 3;
                passMedBetyg++;
            }
        }
    });

    if (passMedBetyg > 0) {
        const snitt = totaltBetygVikt / passMedBetyg;
        if (snitt <= 1.5) summary.genomsnittligtBetyg = "Lätt";
        else if (snitt <= 2.5) summary.genomsnittligtBetyg = "Lagom";
        else summary.genomsnittligtBetyg = "Svårt";
    } else {
        summary.genomsnittligtBetyg = "Inga data";
    }

    return summary;
}

// === UPPDATERA HUVUDFUNKTIONEN: Renderar ut allt på skärmen ===
export function renderStatistics() {
    let activeData = typeof data !== 'undefined' ? data : (window.data || null);
    let activePrograms = typeof programs !== 'undefined' ? programs : (window.programs || {});
    
    if (!activeData || !activeData.history) {
        console.warn("[Beatrice Statistik] Ingen data hittades att bygga statistik på.");
        return; 
    }
    
    const historyEntries = activeData.history || [];

    // 1. ANVÄND DIN NYA FUNKTION HÄR: Rita ut sammanfattningen i dina HTML-element!
    const statsSummary = generateStatsSummary();
    
    // Om du har element i index.html för den övergripande datan, fylls de i här:
    const totaltPassEl = document.getElementById('total-workouts-count');
    if (totaltPassEl) totaltPassEl.textContent = statsSummary.totaltAntalPass;

    const totaltStyrkaEl = document.getElementById('strength-workouts-count');
    if (totaltStyrkaEl) totaltStyrkaEl.textContent = statsSummary.antalStyrka;

    const totaltLopningEl = document.getElementById('run-workouts-count');
    if (totaltLopningEl) totaltLopningEl.textContent = statsSummary.antalLöpning;


    // 2. RENDERA UT "DINA FRAMSTEG" (Övningslistan med unika pass och ackumulerad tid)
    const filterSelect = document.getElementById('stats-filter') || document.querySelector('select[onchange*="renderStatsPage"]');
    const currentFilter = filterSelect ? filterSelect.value : "all";

    const exerciseStats = {};

    // Bygg grundlistan från programdatabasen
    Object.values(activePrograms).forEach(program => {
        if (program.list && Array.isArray(program.list)) {
            program.list.forEach(ex => {
                const name = ex.name;
                if (name && !exerciseStats[name]) {
                    exerciseStats[name] = { count: 0, totalSeconds: 0 };
                }
            });
        }
    });

    // Loopa historiken utan att ge dubbla poäng för set
    historyEntries.forEach(entry => {
        if (entry.type === 'löpning' || entry.isRun) return;

        const cleanInfo = entry.info ? entry.info.replace('🏋️ ', '').trim() : '';
        const exercisesCountedInThisWorkout = new Set();

        if (entry.exercises && Array.isArray(entry.exercises) && entry.exercises.length > 0) {
            entry.exercises.forEach(ex => {
                const name = typeof ex === 'string' ? ex : (ex.name || null);
                if (name) {
                    if (!exerciseStats[name]) exerciseStats[name] = { count: 0, totalSeconds: 0 };
                    
                    if (!exercisesCountedInThisWorkout.has(name)) {
                        exerciseStats[name].count += 1; // Max +1 per unikt pass
                        exercisesCountedInThisWorkout.add(name);
                    }
                    // Räkna samman den totala tiden (arbetssekunder)
                    const sets = ex.sets ? parseInt(ex.sets) : 3;
                    const timeSpent = ex.timeSpent ? parseInt(ex.timeSpent) : 45;
                    exerciseStats[name].totalSeconds += timeSpent;
                }
            });
        } else {
            // Fallback för gamla pass
            let progId = entry.programId;
            if (!progId && cleanInfo) {
                progId = Object.keys(activePrograms).find(key => activePrograms[key].name === cleanInfo || activePrograms[key].name === entry.info);
            }
            const matchedProgram = activePrograms[progId];
            if (matchedProgram && matchedProgram.list) {
                matchedProgram.list.forEach(ex => {
                    const name = ex.name;
                    if (name) {
                        if (!exerciseStats[name]) exerciseStats[name] = { count: 0, totalSeconds: 0 };
                        if (!exercisesCountedInThisWorkout.has(name)) {
                            exerciseStats[name].count += 1;
                            exercisesCountedInThisWorkout.add(name);
                        }
                        exerciseStats[name].totalSeconds += (3 * 45); 
                    }
                });
            }
        }
    });

    // Rita ut övningslistan i containern
    const statsContainer = document.getElementById('exercise-stats-container') || document.getElementById('dina-framsteg-lista');
    if (statsContainer) {
        statsContainer.innerHTML = "";

        let exerciseList = Object.keys(exerciseStats).map(name => {
            return { name: name, ...exerciseStats[name] };
        });

        if (currentFilter === "most-trained" || currentFilter === "Mest tränat") {
            exerciseList = exerciseList.filter(ex => ex.count > 0).sort((a, b) => b.count - a.count);
        } else {
            exerciseList.sort((a, b) => a.name.localeCompare(b.name));
        }

        exerciseList.forEach(ex => {
            const totalMinutes = Math.floor(ex.totalSeconds / 60);
            let timeString = totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)} tim ${totalMinutes % 60} min` : `${totalMinutes} min`;

            const countColor = ex.count > 0 ? "#00e5ff" : "rgba(255, 255, 255, 0.2)";
            const timeColor = ex.count > 0 ? "#ff00d4" : "rgba(255, 255, 255, 0.2)";
            const textColor = ex.count > 0 ? "#fff" : "rgba(255, 255, 255, 0.4)";

            const item = document.createElement('div');
            item.style.cssText = "background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 12px 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
            item.innerHTML = `
                <div><strong style="color: ${textColor}; font-size: 1.05em;">${ex.name}</strong></div>
                <div style="text-align: right; font-size: 0.9em; color: #8fa0dd;">
                    <span style="display: block;">Utförd: <span style="color: ${countColor}; font-weight: bold;">${ex.count}</span> gånger</span>
                    <span style="display: block;">Total tid: <span style="color: ${timeColor}; font-weight: bold;">${timeString}</span></span>
                </div>
            `;
            statsContainer.appendChild(item);
        });
    }

    // === RENDERA PERSONLIGA REKORD (PB) I BOTTEN ===
    if (typeof getPersonalRecords === 'function') {
        const pbs = getPersonalRecords();
        const pb5El = document.getElementById('pb-5km');
        if (pb5El && pbs && pbs["5"]) {
            const mins = Math.floor(pbs["5"]);
            const secs = Math.round((pbs["5"] - mins) * 60);
            pb5El.textContent = `${mins}:${secs.toString().padStart(2, '0')} min`;
        }
    }
}

// === EXPORTERA OCH MAPPA TILL WINDOW HÄR I SLUTET ===
window.renderStatistics = renderStatistics;
window.renderStatsPage = renderStatistics;