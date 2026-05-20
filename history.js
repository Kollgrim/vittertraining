// ==========================================
// REGION: HISTORIK & PRESTATIONSMOTOR (ES Module)
// ==========================================

import { data, programs, saveDatabase } from './database.js';
import { playBeatriceSound } from './audio.js';
import { currentRunData, getCurrentProgramId } from './training.js';
import { 
    updateStreak, 
    updateHealth, 
    renderAchievements, 
    showAchievementPopup,
    updatePBDisplay,
    hidePauseButton // <-- Se till att denna är med här!
} from './ui.js';

import { renderStatistics } from './stats.js';

import { calculateAchievements } from './achievements.js';

// Global kö om användaren lyckas låsa upp flera prestationer samtidigt
export let achievementQueue = [];

// 🔥 MODULSPÄRR: Hindrar att funktionen kan köras två gånger samtidigt
let isSaving = false;

/**
 * Sparar det nyss avslutade passet (styrka eller löpning),
 * räknar ut statistik före/efter och kollar om nya prestationer låsts upp.
 * @param {string|number} rating - Användarens valda betyg ("Lätt", "Lagom", "Svårt")
 */
export function saveAndReset(rating) {

    hidePauseButton();
    // 🛑 SÄKERHETSSPÄRR: Om spärren är aktiv, avbryt direkt!
    if (isSaving) {
        console.warn("[Beatrice Motor] saveAndReset BLOCKERADE ett dubbelanrop.");
        return;
    }
    isSaving = true;

    console.log(`[Beatrice Motor] Sparar pass med betyg: ${rating}`);

    // 1. Standardisera textbetyget så att strängmatchningen inte missar på skiftläge
    let formatedRating = rating;
    if (typeof rating === 'string') {
        if (rating.toLowerCase() === 'svårt') formatedRating = 'Svårt';
        if (rating.toLowerCase() === 'lätt') formatedRating = 'Lätt';
        if (rating.toLowerCase() === 'lagom') formatedRating = 'Lagom';
    }

    // Tidsvariabler för det just avslutade passet
    const nu = new Date();
    const dennaVeckaStr = `${nu.getFullYear()}-W${getWeekNumber(nu)}`;

    // Hjälpfunktion för veckonummer (ISO 8601)
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var startYear = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - startYear) / 86400000) + 1) / 7);
    }

    // Säkerställ att det globala dataobjektet existerar
    let activeData = typeof data !== 'undefined' ? data : (window.data || null);
    if (!activeData) {
        console.error("[Beatrice Motor] Hittade inget 'data'-objekt!");
        isSaving = false;
        return;
    }

    // =========================================================================
    // STEG 1: RÄKNA UT STATISTIK *INNAN* DET NYA PASSET SPARAS
    // =========================================================================
    if (!Array.isArray(activeData.history)) activeData.history = [];
    const historikInnan = activeData.history;
    const passInnan = historikInnan.length;
    const streakInnan = activeData.streak || 0;

    let difficultInnan = 0, easyInnan = 0;
    let styrkaAntalInnan = 0, lopAntalInnan = 0;
    let pass1Innan = 0, pass2Innan = 0, pass3Innan = 0;
    let totalKmInnan = 0;
    let harSprungit5kInnan = false, harSprungit10kInnan = false;
    let harSattPBInnan = false;
    let harHålltTempoUnder5Innan = false;
    let harKörtTungTimerInnan = false;
    let harTränatMorgonInnan = false, harTränatNattInnan = false, harTränatHelgInnan = false;
    let unikaDagarInnan = new Set();
    let passDennaVeckaInnan = 0;

    historikInnan.forEach(entry => {
        const entryDatum = entry.date ? new Date(entry.date) : null;
        if (entry.grade === "Svårt" || entry.betyg === "Svårt") difficultInnan++;
        if (entry.grade === "Lätt" || entry.betyg === "Lätt") easyInnan++;
        if (entryDatum) {
            const timme = entryDatum.getHours();
            const dag = entryDatum.getDay();
            unikaDagarInnan.add(dag);
            if (timme < 8) harTränatMorgonInnan = true;
            if (timme >= 21) harTränatNattInnan = true;
            if (dag === 0 || dag === 6) harTränatHelgInnan = true;
            if (`${entryDatum.getFullYear()}-W${getWeekNumber(entryDatum)}` === dennaVeckaStr) passDennaVeckaInnan++;
        }
        if (entry.isRun || entry.type === 'löpning') {
            lopAntalInnan++;
            let dist = parseFloat(entry.distance) || 0;
            let paceNum = parseFloat(entry.pace) || 99;
            totalKmInnan += dist;
            if (dist >= 5) harSprungit5kInnan = true;
            if (dist >= 10) harSprungit10kInnan = true;
            if (entry.info && (entry.info.includes("⭐ NYTT PB!") || entry.info.includes("NYTT PB"))) harSattPBInnan = true;
            if (paceNum < 5.0 && paceNum > 0) harHålltTempoUnder5Innan = true;
        } else if (entry.isStrength || entry.type === 'styrka') {
            styrkaAntalInnan++;
            if (entry.info && entry.info.includes("PASS 1")) pass1Innan++;
            if (entry.info && entry.info.includes("PASS 2")) pass2Innan++;
            if (entry.info && entry.info.includes("PASS 3")) pass3Innan++;
            if (parseInt(entry.secondsPerSet) >= 60) harKörtTungTimerInnan = true;
        }
    });

    // =========================================================================
    // STEG 2: SKAPA OCH SPARA DET NYA TRÄNINGSPASSET (ENDAST ETT OBJEKT SKAPAS)
    // =========================================================================
    const dateKey = nu.toISOString(); 
    let runData = typeof currentRunData !== 'undefined' ? currentRunData : (window.currentRunData || null);
    const isRun = (runData !== null || window.currentWorkoutType === 'run');
    
    let completedWorkout = {
        date: dateKey,
        betyg: formatedRating,
        grade: formatedRating
    };

    if (isRun) {
        const distans = window.currentRunDistance || (runData ? runData.dist : 5);
        const tidIPass = window.currentRunTime || (runData ? runData.pace : 25);
        const distKey = distans.toString();
        
        completedWorkout.type = 'löpning';
        completedWorkout.isRun = true;
        completedWorkout.distance = parseFloat(distans);
        completedWorkout.pace = parseFloat(tidIPass);

        // PB-KONTROLL FÖR LÖPNING
        if (distans && tidIPass) {
            console.log(`[Beatrice Motor] Säkrad löpdata hittad: ${distans}km på ${tidIPass} min. Kollar PB...`);
            checkForNewPersonalRecord(distans, tidIPass);
        }

        const totalaSekunder = parseFloat(tidIPass) * 60;
        const sekunderPerKm = totalaSekunder / parseFloat(distans);
        const snittMinuter = Math.floor(sekunderPerKm / 60);
        const snittSekunder = Math.round(sekunderPerKm % 60);
        const snittTidText = `${snittMinuter}:${snittSekunder.toString().padStart(2, '0')} min/km`;

        completedWorkout.info = `🏃 Löpning ${distKey} km (${tidIPass} min)<br>⏱️ Snitt: ${snittTidText}`;

        if (!activeData.pb) {
            activeData.pb = { "5": null, "10": null };
        }

        if (activeData.pb[distKey] === null || parseFloat(tidIPass) < parseFloat(activeData.pb[distKey])) {
            activeData.pb[distKey] = parseFloat(parseFloat(tidIPass).toFixed(2));
            console.log(`[Beatrice] Nytt PB för ${distKey}km!`);
            completedWorkout.info = `⭐ <b>NYTT PB!</b> ⭐<br>🏃 ${distKey} km på ${tidIPass} min<br>⏱️ Snitt: ${snittTidText}`;
            completedWorkout.isPB = true; 
            
            if (typeof playBeatriceSound === 'function') {
                playBeatriceSound('nyttPB');
            }
        }
        window.currentRunData = null;
    } else {
        let sessionExercises = [];
        if (window.currentSessionExercises && Array.isArray(window.currentSessionExercises)) {
            sessionExercises = window.currentSessionExercises;
        }

        const progId = typeof currentProgramId !== 'undefined' ? currentProgramId : (window.currentProgramId || 1);
        const activePrograms = typeof programs !== 'undefined' ? programs : (window.programs || {});
        const programName = activePrograms[progId] ? activePrograms[progId].name : `Pass ${progId}`;
        const totalSets = typeof countCompletedSets === 'function' ? countCompletedSets() : (window.countCompletedSets ? window.countCompletedSets() : 15);

        completedWorkout.type = 'styrka';
        completedWorkout.isStrength = true;
        completedWorkout.programId = progId; 
        completedWorkout.info = programName; 
        completedWorkout.exercises = sessionExercises; 
        completedWorkout.secondsPerSet = activeData.seconds || 45; 
        completedWorkout.setAntal = totalSets;
    }

    // Skjut in i historiken en enda gång
    activeData.history.push(completedWorkout);

    if (typeof data !== 'undefined' && data && data !== activeData) {
        if (!Array.isArray(data.history)) data.history = [];
        data.history.push(completedWorkout);
    }

    // Spara databasen permanent
    if (typeof saveDatabase === 'function') saveDatabase();
    else if (typeof window.saveDatabase === 'function') window.saveDatabase();

    // Uppdatera UI och statistik
    if (typeof updateStreak === 'function') updateStreak();
    if (typeof updateHealth === 'function') updateHealth();
    if (typeof updatePBDisplay === 'function') updatePBDisplay();   
    if (typeof renderStatistics === 'function') renderStatistics();  
    if (typeof window.renderCalendar === 'function') window.renderCalendar(); 
    else if (typeof renderCalendar === 'function') renderCalendar();
    
    const achContainer = document.getElementById('achievements-container');
    if (achContainer) {
        if (typeof renderBadges === 'function') renderBadges();
        else if (typeof window.renderBadges === 'function') window.renderBadges();
    }

    // =========================================================================
    // STEG 3: RÄKNA UT STATISTIK *EFTER* ATT DET NYA PASSET SPARATS
    // =========================================================================
    const historikEfter = activeData.history || [];
    const passEfter = historikEfter.length;
    const streakEfter = activeData.streak || 0;

    let difficultEfter = 0, easyEfter = 0;
    let styrkaAntalEfter = 0, lopAntalEfter = 0;
    let pass1Efter = 0, pass2Efter = 0, pass3Efter = 0;
    let totalKmEfter = 0;
    let harSprungit5kEfter = false, harSprungit10kEfter = false;
    let harSattPBEfter = false;
    let harHålltTempoUnder5Efter = false;
    let harKörtTungTimerEfter = false;
    let harTränatMorgonEfter = false, harTränatNattEfter = false, harTränatHelgEfter = false;
    let unikaDagarEfter = new Set();
    let passDennaVeckaEfter = 0;

    historikEfter.forEach(entry => {
        const entryDatum = entry.date ? new Date(entry.date) : null;
        if (entry.grade === "Svårt" || entry.betyg === "Svårt") difficultEfter++;
        if (entry.grade === "Lätt" || entry.betyg === "Lätt") easyEfter++;
        if (entryDatum) {
            const timme = entryDatum.getHours();
            const dag = entryDatum.getDay();
            unikaDagarEfter.add(dag);
            if (timme < 8) harTränatMorgonEfter = true;
            if (timme >= 21) harTränatNattEfter = true;
            if (dag === 0 || dag === 6) harTränatHelgEfter = true;
            if (`${entryDatum.getFullYear()}-W${getWeekNumber(entryDatum)}` === dennaVeckaStr) passDennaVeckaEfter++;
        }
        if (entry.isRun || entry.type === 'löpning') {
            lopAntalEfter++;
            let dist = parseFloat(entry.distance) || 0;
            let paceNum = parseFloat(entry.pace) || 99;
            totalKmEfter += dist;
            if (dist >= 5) harSprungit5kEfter = true;
            if (dist >= 10) harSprungit10kEfter = true;
            if (entry.info && (entry.info.includes("⭐ NYTT PB!") || entry.info.includes("NYTT PB"))) harSattPBEfter = true;
            if (paceNum < 5.0 && paceNum > 0) harHålltTempoUnder5Efter = true;
        } else if (entry.isStrength || entry.type === 'styrka') {
            styrkaAntalEfter++;
            if (entry.info && entry.info.includes("PASS 1")) pass1Efter++;
            if (entry.info && entry.info.includes("PASS 2")) pass2Efter++;
            if (entry.info && entry.info.includes("PASS 3")) pass3Efter++;
            if (parseInt(entry.secondsPerSet) >= 60) harKörtTungTimerEfter = true;
        }
    });

    // =========================================================================
    // STEG 4: MATCHA MOT PRESTATIONSREGLERNA
    // =========================================================================
    const regler = [
    // --- ANTAL PASS ---
    { 
        id: 'badge-starter', 
        upplåst: passEfter >= 1, 
        varUpplåst: passInnan >= 1, 
        icon: '🌱', 
        title: 'Första steget', 
        desc: 'Du har slutfört ditt allra första träningspass. Grym start!' 
    },
    { 
        id: 'badge-master5', 
        upplåst: passEfter >= 5, 
        varUpplåst: passInnan >= 5, 
        icon: '🥉', 
        title: 'Kommit igång', 
        desc: '5 hela träningspass genomförda. Snyggt arbetat!' 
    },
    { 
        id: 'badge-veteran15', 
        upplåst: passEfter >= 15, 
        varUpplåst: passInnan >= 15, 
        icon: '🥈', 
        title: 'Rutinerad', 
        desc: '15 slutförda träningspass! Beatrice är djupt imponerad.' 
    },
    { 
        id: 'badge-champion30', 
        upplåst: passEfter >= 30, 
        varUpplåst: passInnan >= 30, 
        icon: '🥇', 
        title: 'Träningsnörd', 
        desc: '30 slutförda träningspass! Beatrice känner att hon gör skillnad.' 
    },
    { 
        id: 'badge-legend50', 
        upplåst: passEfter >= 50, 
        varUpplåst: passInnan >= 50, 
        icon: '👑', 
        title: 'Legendarisk', 
        desc: '50 träningspass! Du har byggt en fantastisk rutin.' 
    },
    { 
        id: 'badge-immortal100', 
        upplåst: passEfter >= 100, 
        varUpplåst: passInnan >= 100, 
        icon: '🌌', 
        title: 'Odödlig', 
        desc: '100 träningspass genomförda. Du har nått en helt utomjordisk niveau!' 
    },

    // --- STREAKS ---
    { 
        id: 'badge-streak2', 
        upplåst: streakEfter >= 2, 
        varUpplåst: streakInnan >= 2, 
        icon: '🔥', 
        title: 'Dubbelpipig', 
        desc: 'Hållt igång i 2 veckor i rad! Snyggt streak-flow.' 
    },
    { 
        id: 'badge-streak4', 
        upplåst: streakEfter >= 4, 
        varUpplåst: streakInnan >= 4, 
        icon: '⚡', 
        title: 'Månadsrökare', 
        desc: '4 veckors oavbruten träning! Du har etablerat vanan nu.' 
    },
    { 
        id: 'badge-streak8', 
        upplåst: streakEfter >= 8, 
        varUpplåst: streakInnan >= 8, 
        icon: '☄️', 
        title: 'Ostoppbar', 
        desc: '8 veckors streak! Det här är mer än bara träning, du är ostoppbar.' 
    },
    { 
        id: 'badge-streak12', 
        upplåst: streakEfter >= 12, 
        varUpplåst: streakInnan >= 12, 
        icon: '🌋', 
        title: 'Livsstil', 
        desc: '12 veckor i rad! Träningen har officiellt blivit en del av din livsstil.' 
    },

    // --- SPECIFIKA PASS OCH EXPERTIS ---
    { 
        id: 'badge-hattrick', 
        upplåst: (pass1Efter >= 1 && pass2Efter >= 1 && pass3Efter >= 1), 
        varUpplåst: (pass1Innan >= 1 && pass2Innan >= 1 && pass3Innan >= 1), 
        icon: '🎩', 
        title: 'Hattrick', 
        desc: 'Kört Pass 1, 2 & 3 minst en gång vardera!' 
    },
    { 
        id: 'badge-pass1-expert', 
        upplåst: pass1Efter >= 5, 
        varUpplåst: pass1Innan >= 5, 
        icon: '💪', 
        title: 'Biffig Överkropp', 
        desc: 'Du har slutfört Pass 1 (Armar & Överkropp) fem gånger!' 
    },
    { 
        id: 'badge-pass2-expert', 
        upplåst: pass2Efter >= 5, 
        varUpplåst: pass2Innan >= 5, 
        icon: '🍗', 
        title: 'Ben av Stål', 
        desc: 'Grymt! Du har kört benpasset (Pass 2) fem gånger.' 
    },
    { 
        id: 'badge-pass3-expert', 
        upplåst: pass3Efter >= 5, 
        varUpplåst: pass3Innan >= 5, 
        icon: '🛡️', 
        title: 'Core-Kungen', 
        desc: 'Stabilt! Du har kört mag- och bålpasset (Pass 3) fem gånger.' 
    },

    // --- LÖPNING OCH HYBRID ---
    { 
        id: 'badge-hybrid', 
        upplåst: (styrkaAntalEfter >= 5 && lopAntalEfter >= 5), 
        varUpplåst: (styrkaAntalInnan >= 5 && lopAntalInnan >= 5), 
        icon: '🧬', 
        title: 'Hybridatlet', 
        desc: 'Minst 5 styrkepass och 5 löppass registrerade.' 
    },
    { 
        id: 'badge-run-first', 
        upplåst: lopAntalEfter >= 1, 
        varUpplåst: lopAntalInnan >= 1, 
        icon: '👟', 
        title: 'Jungfruturen', 
        desc: 'Milstolpe nådd! Du har loggat ditt allra första löppass.' 
    },
    { 
        id: 'badge-run-5k', 
        upplåst: harSprungit5kEfter, 
        varUpplåst: harSprungit5kInnan, 
        icon: '🖐️', 
        title: 'Femman Säkrad', 
        desc: 'Snyggt sprunget! Du har avverkat en distans på minst 5 km.' 
    },
    { 
        id: 'badge-run-10k', 
        upplåst: harSprungit10kEfter, 
        varUpplåst: harSprungit10kInnan, 
        icon: '🔟', 
        title: 'Milen-Klubben', 
        desc: 'Respekt! Du sprang över en mil och säkrade 10-kilometersmärket.' 
    },
    { 
        id: 'badge-run-volume', 
        upplåst: totalKmEfter >= 42, 
        varUpplåst: totalKmInnan >= 42, 
        icon: '🗺️', 
        title: 'Maratondistans', 
        desc: 'Du har samlat ihop totalt över 42 km löpning i din historik.' 
    },

    // --- KÄNSLA OCH INTENSITET ---
    { 
        id: 'badge-feel-hard', 
        upplåst: difficultEfter >= 1, 
        varUpplåst: difficultInnan >= 1, 
        icon: '🥵', 
        title: 'Blod, Svett & Tårar', 
        desc: 'Slutfört ditt allra första "Svårt"-pass. Enormt pannben!' 
    },
    { 
        id: 'badge-feel-easy', 
        upplåst: easyEfter >= 3, 
        varUpplåst: easyInnan >= 3, 
        icon: '🍦', 
        title: 'En Dag på Stranden', 
        desc: 'Du har registrerat 3 lätta, kontrollerade och stabila träningspass!' 
    },
    { 
        id: 'badge-warrior', 
        upplåst: difficultEfter >= 5, 
        varUpplåst: difficultInnan >= 5, 
        icon: '🧌', 
        title: 'Pannbens-Krigare', 
        desc: 'Respekt! Du har tagit dig igenom hela 5 stycken extremt svåra pass!' 
    },

    // --- REKORD OCH PRESTATION ---
    { 
        id: 'badge-pb-any', 
        upplåst: harSattPBEfter, 
        varUpplåst: harSattPBInnan, 
        icon: '⭐', 
        title: 'Rekordkrossare', 
        desc: 'Snyggt! Du har satt ett nytt personbästa i löparspåret.' 
    },
    { 
        id: 'badge-pace-speedy', 
        upplåst: harHålltTempoUnder5Efter, 
        varUpplåst: harHålltTempoUnder5Innan, 
        icon: '🚀', 
        title: 'Ljudvallen', 
        desc: 'Blixtsnabbt! Du har hållt ett genomsnittligt löptempo under 5:00 min/km.' 
    },
    { 
        id: 'badge-timer-heavy', 
        upplåst: harKörtTungTimerEfter, 
        varUpplåst: harKörtTungTimerInnan, 
        icon: '⏳', 
        title: 'Uthållig Kämpe', 
        desc: 'Du har kört ett tungt styrkepass konfigurerat med 60 sekunder eller mer per set!' 
    },

    // --- TIDPUNKTER OCH SCHEMA ---
    { 
        id: 'badge-early-bird', 
        upplåst: harTränatMorgonEfter, 
        varUpplåst: harTränatMorgonInnan, 
        icon: '🐓', 
        title: 'Morgonpigg', 
        desc: 'Disciplinerat! Du genomförde och slutförde din träning före klockan 08:00.' 
    },
    { 
        id: 'badge-night-owl', 
        upplåst: harTränatNattEfter, 
        varUpplåst: harTränatNattInnan, 
        icon: '🦇', 
        title: 'Nattugglan', 
        desc: 'Nattaktiv kämpe! Ett helt träningspass slutfört efter klockan 21:00.' 
    },
    { 
        id: 'badge-weekend', 
        upplåst: harTränatHelgEfter, 
        varUpplåst: harTränatHelgInnan, 
        icon: '🍻', 
        title: 'Helgkrigare', 
        desc: 'Ingen helgvila här inte! Du slutförde ett träningspass under en lördag eller söndag.' 
    },
    { 
        id: 'badge-loyal', 
        upplåst: unikaDagarEfter.size >= 5, 
        varUpplåst: unikaDagarInnan.size >= 5, 
        icon: '💎', 
        title: 'Lojal Klient', 
        desc: 'Fantastisk hängivenhet! Du har registrerat träning på minst 5 olika veckodagar totalt.' 
    },
    { 
        id: 'badge-perfect-week', 
        upplåst: passDennaVeckaEfter >= 3, 
        varUpplåst: passDennaVeckaInnan >= 3, 
        icon: '🌟', 
        title: 'Perfekt Vecka', 
        desc: 'Snyggt planerat! Du har kört minst 3 kompletta träningspass under denna kalendervecka.' 
    }
];

    const antalAndraUpplastaInnan = regler.filter(r => r.upplåst).length;
    const completionistRegel = {
        id: 'badge-completionist',
        upplåst: antalAndraUpplastaInnan >= 15,
        varUpplåst: activeData.badges && activeData.badges['badge-completionist'] ? true : false,
        icon: '🎓',
        title: 'Fulländad',
        desc: 'Makalöst! Du har låst upp 15 andra unika utmärkelser i appen. Du är fulländad!'
    };
    regler.push(completionistRegel);

    const nyupplåstaUnderPasset = regler.filter(r => r.upplåst && !r.varUpplåst);

    if (!activeData.badges) activeData.badges = {};
    const dagensDatum = new Date().toISOString().split('T')[0];

    regler.forEach(r => {
        if (r.upplåst && !activeData.badges[r.id]) {
            activeData.badges[r.id] = dagensDatum;
        }
    });

    if (typeof saveDatabase === 'function') saveDatabase();
    else if (typeof window.saveDatabase === 'function') window.saveDatabase();

    // 🔥 FIX: Stäng modalen direkt utan lokala variabler för att slippa ReferenceError
    if (document.getElementById('ratingModal')) {
        document.getElementById('ratingModal').style.display = 'none';
    }

    // =========================================================================
    // STEG 5: POP UP-RENDERING OCH LJUDEFFEKT
    // =========================================================================
    function goHomeDirectlyBackup() {
        if (typeof goHomeDirectly === 'function') goHomeDirectly();
        else if (typeof window.goHomeDirectly === 'function') window.goHomeDirectly();
        else {
            const timerDisplay = document.getElementById('timer-display');
            const startBtn = document.getElementById('start-btn');
            if (timerDisplay) timerDisplay.style.display = 'none';
            if (startBtn) startBtn.style.display = 'block';
        }
    }

    if (nyupplåstaUnderPasset.length > 0) {
        const listContainer = document.getElementById('achievement-modal-list') || document.getElementById('achievementModal-list');
        const achModal = document.getElementById('achievement-modal') || document.getElementById('achievementModal');
        
        if (listContainer) {
            listContainer.innerHTML = ''; 
            nyupplåstaUnderPasset.forEach(p => {
                listContainer.innerHTML += `
                    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 0, 212, 0.3); border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 15px; text-align: left; margin-bottom: 12px;">
                        <div style="font-size: 40px; flex-shrink: 0;">${p.icon}</div>
                        <div>
                            <h4 style="color: white; margin: 0 0 3px 0; font-size: 16px;">${p.title}</h4>
                            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px; line-height: 1.3;">${p.desc}</p>
                        </div>
                    </div>
                `;
            });
        }

        if (achModal) {
            achModal.style.display = 'flex'; 
            if (typeof playBeatriceSound === 'function') playBeatriceSound('apploder');
        } else {
            goHomeDirectlyBackup();
        }
    } else {
        goHomeDirectlyBackup();
    }

    // Nollställ aktiva sessioner
    window.currentWorkoutType = null;
    window.currentRunDistance = null;
    window.currentRunTime = null;

    // Släpp modulspärren efter 1.5 sekund
    setTimeout(() => {
        isSaving = false;
    }, 1500);
    // ⬇️ LÄGG TILL DETTA PRECIS INNAN FUNKTIONEN AVSLUTAS ELLER DÄR DU GÖMMER RATING-MODALEN:

// Återställ och visa tränings- och löpningsväljarna på startskärmen igen
const passSelector = document.getElementById('pass-selector');
const runSelector = document.getElementById('run-selector');

if (passSelector) passSelector.style.display = 'flex'; // eller 'flex' beroende på din CSS layout
if (runSelector) runSelector.style.display = 'block';

// Stäng betygsskärmen (Säkerställ att detta görs)
const ratingModal = document.getElementById('ratingModal');
if (ratingModal) {
    ratingModal.style.display = 'none';
}

// Släpp modulspärren så att man kan spara nästa pass i framtiden
isSaving = false; 
console.log("[Beatrice Motor] Passet sparat och startskärmens knappar är återställda!");
}

window.saveAndReset = saveAndReset;

/**
 * Hjälpfunktion för att rensa träningshistoriken
 */
export function clearHistory() {
    if (confirm("Är du helt säker på att du vill rensa all historik, dina PB:n och dina streaks? Det går inte att ångra!")) {
        data.history = [];
        data.streak = 0;
        data.workoutsThisWeek = 0;
        data.pb = { "5": null, "10": null };
        data.badges = {};
        saveDatabase();
        location.reload();
    }
}

// Globala kalendervariabler
if (typeof window.currentYear === 'undefined') window.currentYear = 2026;
if (typeof window.currentMonth === 'undefined') window.currentMonth = new Date().getMonth();

export function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) {
        console.warn("[Beatrice Kalender] Hittade inte #calendar-container i HTML.");
        return;
    }

    let activeData = typeof data !== 'undefined' ? data : (window.data || null);
    let historik = (activeData && Array.isArray(activeData.history)) ? activeData.history : [];

    const year = window.currentYear;
    const month = window.currentMonth;
    const manadsNamn = ["JANUARI", "FEBRUARI", "MARS", "APRIL", "MAJ", "JUNI", "JULI", "AUGUSTI", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DECEMBER"];
    
    const headerTitle = document.querySelector('#history-section h2');
    if (headerTitle) {
        headerTitle.innerText = `${manadsNamn[month]} ${year}`;
    }

    const forstaDagenIManaden = new Date(year, month, 1).getDay();
    const startMåndagIndex = forstaDagenIManaden === 0 ? 6 : forstaDagenIManaden - 1;
    const antalDagarIManaden = new Date(year, month + 1, 0).getDate();

    let html = `
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; color: rgba(255,255,255,0.4); margin-bottom: 10px; font-size: 0.8em;">
            <div>MÅN</div><div>TIS</div><div>ONS</div><div>TOR</div><div>FRE</div><div>LÖR</div><div>SÖN</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; min-height: 200px;">
    `;

    for (let i = 0; i < startMåndagIndex; i++) {
        html += `<div style="background: rgba(255,255,255,0.02); border-radius: 8px; min-height: 50px;"></div>`;
    }

    for (let dag = 1; dag <= antalDagarIManaden; dag++) {
        const nuvarandeDatumStrang = `${year}-${String(month + 1).padStart(2, '0')}-${String(dag).padStart(2, '0')}`;
        
        const dagensPass = historik.filter(pass => {
            if (!pass.date) return false;
            return pass.date.startsWith(nuvarandeDatumStrang);
        });

        let bakgrund = "rgba(255, 255, 255, 0.05)";
        let ram = "1px solid rgba(255, 255, 255, 0.1)";
        let textFarg = "white";

        if (dagensPass.length > 0) {
            const pass = dagensPass[0];
            if (pass.grade === "Lätt" || pass.betyg === "Lätt") bakgrund = "rgba(0, 255, 255, 0.2)";
            else if (pass.grade === "Svårt" || pass.betyg === "Svårt") bakgrund = "rgba(255, 0, 212, 0.2)";
            else bakgrund = "rgba(0, 200, 100, 0.2)";
            
            ram = "1px solid var(--neon-pink, #ff00d4)";
        }

        html += `
            <div style="background: ${bakgrund}; border: ${ram}; color: ${textFarg}; border-radius: 8px; padding: 10px; min-height: 50px; display: flex; flex-direction: column; justify-content: space-between; font-size: 0.9em; position: relative;">
                <span>${dag}</span>
                ${dagensPass.length > 0 ? `<span style="font-size: 10px; text-align: right;">💪</span>` : ''}
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
    
}

window.changeMonth = function(direction) {
    window.currentMonth += direction;
    if (window.currentMonth > 11) {
        window.currentMonth = 0;
        window.currentYear++;
    } else if (window.currentMonth < 0) {
        window.currentMonth = 11;
        window.currentYear--;
    }
    renderCalendar();
};

window.goToToday = function() {
    window.currentYear = new Date().getFullYear();
    window.currentMonth = new Date().getMonth();
    renderCalendar();
};

window.renderCalendar = renderCalendar;


/**
 * Kontrollerar om det slutförda löppasset är ett nytt Personligt Rekord (PB)
 * och sparar det i så fall i databasen.
 * @param {string|number} distans - Distansen som sprangs (t.ex. "5" eller "10")
 * @param {number} tidIPass - Tiden det tog i minuter
 */
export function checkForNewPersonalRecord(distans, tidIPass) {
    if (!distans || !tidIPass) return;

    const distansStr = distans.toString(); // Säkerställ att det är en sträng ("5" eller "10")

    // Initiera pb-objektet i databasen om det av någon anledning saknas
    if (!data.pb) {
        data.pb = { "5": null, "10": null };
    }

    // Hämta det gamla rekordet
    const nuvarandePB = data.pb[distansStr];

    // Om inget PB finns sedan tidigare, ELLER om den nya tiden är snabbare (lägre)
    if (nuvarandePB === null || tidIPass < nuvarandePB) {
        data.pb[distansStr] = tidIPass;
        console.log(`[Beatrice Databas] 🏆 NYTT PB för ${distansStr}km: ${tidIPass} minuter!`);
        
        // Här kan du i framtiden lägga till roliga effekter, 
        // t.ex. Beatrice-ljud eller en extra prestation-popup!
        return true; // Returnera true om det blev ett nytt rekord
    }

    return false; // Inget nytt rekord
}

// Gör den tillgänglig globalt via window om det behövs i framtiden
window.checkForNewPersonalRecord = checkForNewPersonalRecord;