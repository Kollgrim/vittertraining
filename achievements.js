// ==========================================
// REGION: UTSTÄMPLING & ACHIEVEMENTS (ES Module)
// ==========================================

import { data, programs } from './database.js'; // Ändrat till litet d
import { queueAchievementModal } from './ui.js';

// ==========================================
// REGION: UTSTÄMPLING & ACHIEVEMENTS (ES Module)
// ==========================================

/**
 * Array med alla 30 tillgängliga achievements i appen, deras ikoner och villkor.
 * Tar emot (historyEfter, historyInnan, nuvarandeStreak) för att veta exakt vad som låses upp.
 */
export const achievementRules = [
    // --- ANTAL PASS ---
    { 
        id: 'badge-starter', 
        title: 'Första steget', 
        desc: 'Du har slutfört ditt allra första träningspass. Grym start!', 
        icon: '🌱',
        condition: (hEfter, hInnan) => hEfter.length >= 1 && hInnan.length < 1
    },
    { 
        id: 'badge-master5', 
        title: 'Kommit igång', 
        desc: '5 hela träningspass genomförda. Snyggt arbetat!', 
        icon: '🥉',
        condition: (hEfter, hInnan) => hEfter.length >= 5 && hInnan.length < 5
    },
    { 
        id: 'badge-veteran15', 
        title: 'Rutinerad', 
        desc: '15 slutförda träningspass! Beatrice är djupt imponerad.', 
        icon: '🥈',
        condition: (hEfter, hInnan) => hEfter.length >= 15 && hInnan.length < 15
    },
    { 
        id: 'badge-champion30', 
        title: 'Träningsnörd', 
        desc: '30 slutförda träningspass! Beatrice känner att hon gör skillnad.', 
        icon: '🥇',
        condition: (hEfter, hInnan) => hEfter.length >= 30 && hInnan.length < 30
    },
    { 
        id: 'badge-legend50', 
        title: 'Legendarisk', 
        desc: '50 träningspass! Du har byggt en fantastisk rutin.', 
        icon: '👑',
        condition: (hEfter, hInnan) => hEfter.length >= 50 && hInnan.length < 50
    },
    { 
        id: 'badge-immortal100', 
        title: 'Odödlig', 
        desc: '100 träningspass genomförda. Du har nått en helt utomjordisk niveau!', 
        icon: '🌌',
        condition: (hEfter, hInnan) => hEfter.length >= 100 && hInnan.length < 100
    },
    
    // --- STREAK ---
    { 
        id: 'badge-streak2', 
        title: 'Dubbelpipig', 
        desc: 'Hållt igång i 2 veckor i rad! Snyggt streak-flow.', 
        icon: '🔥',
        condition: (hEfter, hInnan, streak) => streak >= 2 && (!data.achievements?.['badge-streak2'])
    },
    { 
        id: 'badge-streak4', 
        title: 'Månadsrökare', 
        desc: '4 veckors oavbruten träning! Du har etablerat vanan nu.', 
        icon: '⚡',
        condition: (hEfter, hInnan, streak) => streak >= 4 && (!data.achievements?.['badge-streak4'])
    },
    { 
        id: 'badge-streak8', 
        title: 'Ostoppbar', 
        desc: '8 veckors streak! Det här är mer än bara träning, du är ostoppbar.', 
        icon: '☄️',
        condition: (hEfter, hInnan, streak) => streak >= 8 && (!data.achievements?.['badge-streak8'])
    },
    { 
        id: 'badge-streak12', 
        title: 'Livsstil', 
        desc: '12 veckor i rad! Träningen har officiellt blivit en del av din livsstil.', 
        icon: '🌋',
        condition: (hEfter, hInnan, streak) => streak >= 12 && (!data.achievements?.['badge-streak12'])
    },

    // --- UTMANINGAR & PROGRAM ---
    { 
        id: 'badge-hattrick', 
        title: 'Hattrick', 
        desc: 'Kört Pass 1, 2 & 3 minst en gång vardera!', 
        icon: '🎩',
        condition: (hEfter, hInnan) => {
            const check = (h) => {
                const s = h.map(x => (x.info || "").toUpperCase());
                return s.some(i => i.includes("PASS 1")) && s.some(i => i.includes("PASS 2")) && s.some(i => i.includes("PASS 3"));
            };
            return check(hEfter) && !check(hInnan);
        }
    },
    { 
        id: 'badge-pass1-expert', 
        title: 'Biffig Överkropp', 
        desc: 'Du har slutfört Pass 1 (Armar & Överkropp) fem gånger!', 
        icon: '💪',
        condition: (hEfter, hInnan) => hEfter.filter(x => (x.info || "").toUpperCase().includes("PASS 1")).length >= 5 && hInnan.filter(x => (x.info || "").toUpperCase().includes("PASS 1")).length < 5
    },
    { 
        id: 'badge-pass2-expert', 
        title: 'Ben av Stål', 
        desc: 'Grymt! Du har kört benpasset (Pass 2) fem gånger.', 
        icon: '🍗',
        condition: (hEfter, hInnan) => hEfter.filter(x => (x.info || "").toUpperCase().includes("PASS 2")).length >= 5 && hInnan.filter(x => (x.info || "").toUpperCase().includes("PASS 2")).length < 5
    },
    { 
        id: 'badge-pass3-expert', 
        title: 'Core-Kungen', 
        desc: 'Stabilt! Du har kört mag- och bålpasset (Pass 3) fem gånger.', 
        icon: '🛡️',
        condition: (hEfter, hInnan) => hEfter.filter(x => (x.info || "").toUpperCase().includes("PASS 3")).length >= 5 && hInnan.filter(x => (x.info || "").toUpperCase().includes("PASS 3")).length < 5
    },
    { 
        id: 'badge-hybrid', 
        title: 'Hybridatlet', 
        desc: 'Minst 5 styrkepass och 5 löppass registrerade.', 
        icon: '🧬',
        condition: (hEfter, hInnan) => {
            const check = (h) => h.filter(x => x.isStrength || x.type === 'styrka').length >= 5 && h.filter(x => x.isRun || x.type === 'löpning').length >= 5;
            return check(hEfter) && !check(hInnan);
        }
    },

    // --- LÖPNING ---
    { 
        id: 'badge-run-first', 
        title: 'Jungfruturen', 
        desc: 'Milstolpe nådd! Du har loggat ditt allra första löppass.', 
        icon: '👟',
        condition: (hEfter, hInnan) => hEfter.some(x => x.isRun || x.type === 'löpning') && !hInnan.some(x => x.isRun || x.type === 'löpning')
    },
    { 
        id: 'badge-run-5k', 
        title: 'Femman Säkrad', 
        desc: 'Snyggt sprunget! Du har avverkat en distans på minst 5 km.', 
        icon: '🖐️',
        condition: (hEfter, hInnan) => hEfter.some(x => (x.isRun || x.type === 'löpning') && parseFloat(x.distance) >= 5) && !hInnan.some(x => (x.isRun || x.type === 'löpning') && parseFloat(x.distance) >= 5)
    },
    { 
        id: 'badge-run-10k', 
        title: 'Milen-Klubben', 
        desc: 'Respekt! Du sprang över en mil och säkrade 10-kilometersmärket.', 
        icon: '🔟',
        condition: (hEfter, hInnan) => hEfter.some(x => (x.isRun || x.type === 'löpning') && parseFloat(x.distance) >= 10) && !hInnan.some(x => (x.isRun || x.type === 'löpning') && parseFloat(x.distance) >= 10)
    },
    { 
        id: 'badge-run-volume', 
        title: 'Maratondistans', 
        desc: 'Du har samlat ihop totalt över 42 km löpning i din historik.', 
        icon: '🗺️',
        condition: (hEfter, hInnan) => {
            const calc = (h) => h.filter(x => x.isRun || x.type === 'löpning').reduce((sum, x) => sum + (parseFloat(x.distance) || 0), 0);
            return calc(hEfter) >= 42 && calc(hInnan) < 42;
        }
    },

    // --- INTENSITET & BETEENDEDATA ---
    { 
        id: 'badge-feel-hard', 
        title: 'Blod, Svett & Tårar', 
        desc: 'Slutfört ditt allra första "Svårt"-pass. Enormt pannben!', 
        icon: '🥵',
        condition: (hEfter, hInnan) => hEfter.some(x => x.grade === "Svårt" || x.betyg === "Svårt") && !hInnan.some(x => x.grade === "Svårt" || x.betyg === "Svårt")
    },
    { 
        id: 'badge-feel-easy', 
        title: 'En Dag på Stranden', 
        desc: 'Du har registrerat 3 lätta, kontrollerade och stabila träningspass!', 
        icon: '🍦',
        condition: (hEfter, hInnan) => hEfter.filter(x => x.grade === "Lätt" || x.betyg === "Lätt").length >= 3 && hInnan.filter(x => x.grade === "Lätt" || x.betyg === "Lätt").length < 3
    },
    { 
        id: 'badge-warrior', 
        title: 'Pannbens-Krigare', 
        desc: 'Respekt! Du har tagit dig igenom hela 5 stycken extremt svåra pass!', 
        icon: '🧌',
        condition: (hEfter, hInnan) => hEfter.filter(x => x.grade === "Svårt" || x.betyg === "Svårt").length >= 5 && hInnan.filter(x => x.grade === "Svårt" || x.betyg === "Svårt").length < 5
    },
    { 
        id: 'badge-pb-any', 
        title: 'Rekordkrossare', 
        desc: 'Snyggt! Du har satt ett nytt personbästa i löparspåret.', 
        icon: '⭐',
        condition: (hEfter, hInnan) => hEfter.some(x => x.info && x.info.includes("⭐ NYTT PB!")) && !hInnan.some(x => x.info && x.info.includes("⭐ NYTT PB!"))
    },
    { 
        id: 'badge-pace-speedy', 
        title: 'Ljudvallen', 
        desc: 'Blixtsnabbt! Du har hållt ett genomsnittligt löptempo under 5:00 min/km.', 
        icon: '🚀',
        condition: (hEfter, hInnan) => hEfter.some(x => (x.isRun || x.type === 'löpning') && parseFloat(x.pace) < 5.0 && parseFloat(x.pace) > 0) && !hInnan.some(x => (x.isRun || x.type === 'löpning') && parseFloat(x.pace) < 5.0 && parseFloat(x.pace) > 0)
    },
    { 
        id: 'badge-timer-heavy', 
        title: 'Uthållig Kämpe', 
        desc: 'Du har kört ett tungt styrkepass konfigurerat med 60 sekunder eller mer per set!', 
        icon: '⏳',
        condition: (hEfter, hInnan) => hEfter.some(x => (x.isStrength || x.type === 'styrka') && parseInt(x.secondsPerSet) >= 60) && !hInnan.some(x => (x.isStrength || x.type === 'styrka') && parseInt(x.secondsPerSet) >= 60)
    },

    // --- TIDSPUNKTER & KALENDER ---
    { 
        id: 'badge-early-bird', 
        title: 'Morgonpigg', 
        desc: 'Disciplinerat! Du genomförde och slutförde din träning före klockan 08:00.', 
        icon: '🐓',
        condition: (hEfter, hInnan) => hEfter.some(x => x.date && new Date(x.date).getHours() < 8) && !hInnan.some(x => x.date && new Date(x.date).getHours() < 8)
    },
    { 
        id: 'badge-night-owl', 
        title: 'Nattugglan', 
        desc: 'Nattaktiv kämpe! Ett helt träningspass slutfört efter klockan 21:00.', 
        icon: '🦇',
        condition: (hEfter, hInnan) => hEfter.some(x => x.date && new Date(x.date).getHours() >= 21) && !hInnan.some(x => x.date && new Date(x.date).getHours() >= 21)
    },
    { 
        id: 'badge-weekend', 
        title: 'Helgkrigare', 
        desc: 'Ingen helgvila här inte! Du slutförde ett träningspass under en lördag eller söndag.', 
        icon: '🍻',
        condition: (hEfter, hInnan) => {
            const check = (h) => h.some(x => x.date && (new Date(x.date).getDay() === 0 || new Date(x.date).getDay() === 6));
            return check(hEfter) && !check(hInnan);
        }
    },
    { 
        id: 'badge-loyal', 
        title: 'Lojal Klient', 
        desc: 'Fantastisk hängivenhet! Du har registrerat träning på minst 5 olika veckodagar totalt.', 
        icon: '💎',
        condition: (hEfter, hInnan) => {
            const getDays = (h) => new Set(h.filter(x => x.date).map(x => new Date(x.date).getDay())).size;
            return getDays(hEfter) >= 5 && getDays(hInnan) < 5;
        }
    },
    { 
        id: 'badge-perfect-week', 
        title: 'Perfekt Vecka', 
        desc: 'Snyggt planerat! Du har kört minst 3 kompletta träningspass under denna kalendervecka.', 
        icon: '🌟',
        condition: (hEfter, hInnan) => {
            const countThisWeek = (h) => {
                if (h.length === 0) return 0;
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const dayOfWeek = today.getDay(); 
                const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const monday = new Date(today);
                monday.setDate(today.getDate() - distanceToMonday);
                monday.setHours(0,0,0,0);
                return h.filter(x => x.date && new Date(x.date) >= monday).length;
            };
            return countThisWeek(hEfter) >= 3 && countThisWeek(hInnan) < 3;
        }
    },

    // --- COMPLETIONIST ---
    {
        id: 'badge-completionist',
        title: 'Fulländad',
        desc: 'Makalöst! Du har låst upp 15 andra unika utmärkelser i appen. Du är fulländad!',
        icon: '🎓',
        condition: (hEfter, hInnan) => {
            const unlockedCount = Object.keys(data.achievements || {}).filter(k => k !== 'badge-completionist').length;
            return unlockedCount >= 15 && (!data.achievements?.['badge-completionist']);
        }
    }
];






/**
 * Kontrollerar och räknar ut om nya achievements har låsts upp
 * efter att ett träningspass sparats.
 * @param {Object} activeData - Det globala/aktiva dataobjektet
 * @param {Array} hInnan - Historiken innan passet sparades
 * @param {Array} hEfter - Historiken efter att passet sparades
 * @param {number} streak - Nuvarande streak-nummer
 * @returns {Array} Array med de nya achievements-objekten som låstes upp under passet
 */
export function calculateAchievements(activeData, hInnan, hEfter, streak) {
    const nyupplåsta = [];

    // Säkerställ att strukturen för sparade achievements existerar i databasen
    if (!activeData.achievements) {
        activeData.achievements = {};
    }

    // Gå igenom alla centrala regler från achievementRules
    achievementRules.forEach(rule => {
        // Kontrollera om regeln är uppfylld via dess condition-funktion
        const arUppfylld = rule.condition(hEfter, hInnan, streak);

        if (arUppfylld) {
            // Spara permanent i databasen med dagens datum om den inte redan finns där
            if (!activeData.achievements[rule.id]) {
                activeData.achievements[rule.id] = {
                    id: rule.id,
                    title: rule.title,
                    icon: rule.icon,
                    date: new Date().toLocaleDateString('sv-SE')
                };
                
                // Lägg till i retur-listan för popups/köhantering
                nyupplåsta.push(rule);
            }
        }
    });

    return nyupplåsta;
}

/**
 * Renderar ut alla utmärkelser på prestationsfliken.
 * Helt synkad för modulstruktur och kraschsäker mot saknad data!
 */
export function renderAchievements() {
    // Vi kollar efter alla möjliga ID-namn som din HTML-container kan tänkas ha!
    const container = document.getElementById('achievements-container') || 
                      document.getElementById('badges-grid') || 
                      document.getElementById('prestationer-grid') ||
                      document.getElementById('prestationer-content');
                      
    if (!container) {
        console.warn("[Beatrice Prestationer] Kunde inte hitta rätt container i HTML-koden för att rita ut badges. Kontrollera vad ditt ID heter i index.html!");
        return;
    }

    // 1. Hämta datan kraschsäkert från fönstret om den inte finns lokalt
    let activeData = typeof data !== 'undefined' ? data : (window.data || null);
    
    if (!activeData || !activeData.history) {
        console.warn("[Beatrice Prestationer] Ingen historik hittades än. Ritar tomma/låsta badges.");
        // Vi skapar ett tomt låtsasobjekt så att koden under kan rita ut alla badges som "låsta" 
        // istället för att funktionen bara dör och lämnar fliken helt tom!
        activeData = { history: {}, streak: 0 };
    }

    console.log("[Beatrice Prestationer] Renderar fliken baserat på:", Object.keys(activeData.history).length, "sparade pass.");

    // 2. Räkna ut statistiken exakt som i saveAndReset så att rätt badges tänds
    const historik = Object.values(activeData.history);
    const passAntal = historik.length;
    const currentStreak = activeData.streak || 0;

    let difficult = 0, easy = 0, styrkaAntal = 0, lopAntal = 0;
    let pass1 = 0, pass2 = 0, pass3 = 0, totalKm = 0;
    let harSprungit5k = false, harSprungit10k = false, harSattPB = false;
    let harHålltTempoUnder5 = false, harHålltTempoUnder4_5 = false, harHålltTempoUnder4 = false, harKörtTungTimer = false;
    let harTränatMorgon = false, harTränatNINJA = false, harTränatNatt = false, harTränatHelg = false, harTränad1111 = false;
    let unikaDagar = new Set();

    // Loopa igenom historiken för att räkna mätvärden
    historik.forEach(entry => {
        const entryDatum = entry.date ? new Date(entry.date) : null;
        if (entry.grade === "Svårt" || entry.betyg === "Svårt") difficult++;
        if (entry.grade === "Lätt" || entry.betyg === "Lätt") easy++;
        
        if (entryDatum) {
            unikaDagar.add(entryDatum.getDay());
            if (entryDatum.getHours() < 8) harTränatMorgon = true;
            if (entryDatum.getHours() === 1 || entryDatum.getHours() === 2 || entryDatum.getHours() === 3) harTränatNINJA = true;
            if (entryDatum.getHours() >= 21) harTränatNatt = true;
            if (entryDatum.getDay() === 0 || entryDatum.getDay() === 6) harTränatHelg = true;
            if (entryDatum.getHours() === 11 && entryDatum.getMinutes() === 11) harTränad1111 = true;
        }

        if (entry.isRun || entry.type === 'löpning') {
            lopAntal++;
            let dist = parseFloat(entry.distance) || 0;
            let paceNum = parseFloat(entry.pace) || 99;
            totalKm += dist;
            if (dist >= 5) harSprungit5k = true;
            if (dist >= 10) harSprungit10k = true;
            if (entry.info && entry.info.includes("⭐ NYTT PB!")) harSattPB = true;
            if (paceNum < 5.0 && paceNum > 0) harHålltTempoUnder5 = true;
            if (paceNum < 4.5 && paceNum > 0) harHålltTempoUnder4_5 = true;
             if (paceNum < 4.0 && paceNum > 0) harHålltTempoUnder4 = true;
        } else if (entry.isStrength || entry.type === 'styrka') {
            styrkaAntal++;
            if (entry.info && entry.info.includes("PASS 1")) pass1++;
            if (entry.info && entry.info.includes("PASS 2")) pass2++;
            if (entry.info && entry.info.includes("PASS 3")) pass3++;
            if (parseInt(entry.secondsPerSet) >= 60) harKörtTungTimer = true;
        }
    });

    // 3. Definition av alla utmärkelser
    const regler = [
        { id: 'badge-starter', upplåst: passAntal >= 1, icon: '🌱', title: 'Första steget', desc: 'Du har slutfört ditt allra första träningspass. Grym start!' },
        { id: 'badge-master5', upplåst: passAntal >= 5, icon: '🥉', title: 'Kommit igång', desc: '5 hela träningspass genomförda. Snyggt arbetat!' },
        { id: 'badge-veteran15', upplåst: passAntal >= 15, icon: '🥈', title: 'Rutinerad', desc: '15 slutförda träningspass! Beatrice är djupt imponerad.' },
        { id: 'badge-champion30', upplåst: passAntal >= 30, icon: '🥇', title: 'Träningsnörd', desc: '30 slutförda träningspass! Beatrice känner att hon gör skillnad.' },
        { id: 'badge-legend50', upplåst: passAntal >= 50, icon: '👑', title: 'Legendarisk', desc: '50 träningspass! Du har byggt en fantastisk rutin.' },
        { id: 'badge-immortal100', upplåst: passAntal >= 100, icon: '🌌', title: 'Odödlig', desc: '100 träningspass genomförda. Du har nått en helt utomjordisk nivå!' },
        { id: 'badge-streak2', upplåst: currentStreak >= 2, icon: '🔥', title: 'Dubbelpipig', desc: 'Hållt igång i 2 veckor i rad! Snyggt streak-flow.' },
        { id: 'badge-streak4', upplåst: currentStreak >= 4, icon: '⚡', title: 'Månadsrökare', desc: '4 veckors oavbruten träning! Du har etablerat vanan nu.' },
        { id: 'badge-streak8', upplåst: currentStreak >= 8, icon: '☄️', title: 'Ostoppbar', desc: '8 veckors streak! Det här är mer än bara träning, du är ostoppbar.' },
        { id: 'badge-streak12', upplåst: currentStreak >= 12, icon: '🌋', title: 'Livsstil', desc: '12 veckor i rad! Träningen har officiellt blivit en del av din livsstil.' },
        { id: 'badge-hattrick', upplåst: (pass1 >= 1 && pass2 >= 1 && pass3 >= 1), icon: '🎩', title: 'Hattrick', desc: 'Kört Pass 1, 2 & 3 minst en gång vardera!' },
        { id: 'badge-pass1-expert', upplåst: pass1 >= 5, icon: '💪', title: 'Biffig Överkropp', desc: 'Du har slutfört Pass 1 (Armar & Överkropp) fem gånger!' },
        { id: 'badge-pass2-expert', upplåst: pass2 >= 5, icon: '🍗', title: 'Ben av Stål', desc: 'Grymt! Du har kört benpasset (Pass 2) fem gånger.' },
        { id: 'badge-pass3-expert', upplåst: pass3 >= 5, icon: '🛡️', title: 'Core-Kungen', desc: 'Stabilt! Du har kört mag- och bålpasset (Pass 3) fem gånger.' },
        { id: 'badge-hybrid', upplåst: (styrkaAntal >= 5 && lopAntal >= 5), icon: '🧬', title: 'Hybridatlet', desc: 'Minst 5 styrkepass och 5 löppass registrerade.' },
        { id: 'badge-run-first', upplåst: lopAntal >= 1, icon: '👟', title: 'Jungfruturen', desc: 'Milstolpe nådd! Du har loggat ditt allra första löppass.' },
        { id: 'badge-run-5k', upplåst: harSprungit5k, icon: '🖐️', title: 'Femman Säkrad', desc: 'Snyggt sprunget! Du har avverkat en distans på minst 5 km.' },
        { id: 'badge-run-10k', upplåst: harSprungit10k, icon: '🔟', title: 'Milen-Klubben', desc: 'Respekt! Du sprang över en mil och säkrade 10-kilometersmärket.' },
        { id: 'badge-run-volume', upplåst: totalKm >= 42, icon: '🗺️', title: 'Maratondistans', desc: 'Du har samlat ihop totalt över 42 km löpning i din historik.' },
        { id: 'badge-feel-hard', upplåst: difficult >= 1, icon: '🥵', title: 'Blod, Svett & Tårar', desc: 'Slutfört ditt allra första "Svårt"-pass. Enormt pannben!' },
        { id: 'badge-feel-easy', upplåst: easy >= 3, icon: '🍦', title: 'En Dag på Stranden', desc: 'Du har registrerat 3 lätta, kontrollerade och stabila träningspass!' },
        { id: 'badge-warrior', upplåst: difficult >= 5, icon: '🧌', title: 'Pannbens-Krigare', desc: 'Respekt! Du har tagit dig igenom hela 5 stycken extremt svåra pass!' },
        { id: 'badge-pb-any', upplåst: harSattPB, icon: '⭐', title: 'Rekordkrossare', desc: 'Snyggt! Du har satt ett nytt personbästa i löparspåret.' },
        { id: 'badge-pace-speedy', upplåst: harHålltTempoUnder5, icon: '🚀', title: 'Ljudvallen', desc: 'Blixtsnabbt! Du har hållt ett genomsnittligt löptempo under 5:00 min/km.' },
        { id: 'badge-timer-heavy', upplåst: harKörtTungTimer, icon: '⏳', title: 'Uthållig Kämpe', desc: 'Du har kört ett tungt styrkepass konfigurerat med 60 sekunder eller mer per set!' },
        { id: 'badge-early-bird', upplåst: harTränatMorgon, icon: '🐓', title: 'Morgonpigg', desc: 'Diplinerat! Du genomförde och slutförde din träning före klockan 08:00.' },
        { id: 'badge-night-owl', upplåst: harTränatNatt, icon: '🦇', title: 'Nattugglan', desc: 'Nattaktiv kämpe! Ett helt träningspass slutfört efter klockan 21:00.' },
        { id: 'badge-weekend', upplåst: harTränatHelg, icon: '🍻', title: 'Helgkrigare', desc: 'Ingen helgvila här inte! Du slutförde ett träningspass under en lördag eller söndag.' },
        { id: 'badge-loyal', upplåst: unikaDagar.size >= 5, icon: '💎', title: 'Lojal Klient', desc: 'Fantastisk hängivenhet! Du har registrerat träning på minst 5 olika veckodagar totalt.' },
        // --- TID & DYGNSRYTM ---
{ id: 'badge-early-wolf', upplåst: harTränatMorgon && false, icon: '🐺', title: 'Vargtimmen', desc: 'Slutför ett pass mellan kl 04:00 och 05:59.' },
{ id: 'badge-siesta', upplåst: false, icon: '☀️', title: 'Siestaträning', desc: 'Slutför ett pass mitt på dagen (kl 12-13).' },
{ id: 'badge-new-year', upplåst: false, icon: '🎆', title: 'Nyårsraketen', desc: 'Träna på nyårsdagen.' },
{ id: 'badge-midsummer', upplåst: false, icon: '🌸', title: 'Midsommarkraft', desc: 'Träna på midsommarafton.' },
{ id: 'badge-christmas', upplåst: false, icon: '🎅', title: 'Tomtens Medhjälpare', desc: 'Styrkepass på julafton.' },
{ id: 'badge-halloween', upplåst: false, icon: '🎃', title: 'Kuslig Uthållighet', desc: 'Löpning på Halloween efter kl 20.' },
{ id: 'badge-friday-night', upplåst: false, icon: '🍿', title: 'Disco eller Träning?', desc: 'Fredagsträning kl 19-22.' },
{ id: 'badge-monday-pure', upplåst: false, icon: '📈', title: 'Perfekt Start', desc: 'Måndagsmorgon före kl 09.' },
{ id: 'badge-leap-year', upplåst: false, icon: '🌀', title: 'Skottårs-Milstolpe', desc: 'Träna den 29 februari.' },
{ id: 'badge-solstice', upplåst: false, icon: '🌗', title: 'Solståndet', desc: 'Träna på årets längsta eller kortaste dag.' },

// --- LÖPNING: DISTANS ---
{ id: 'badge-run-3k', upplåst: false, icon: '🎯', title: 'Prickskytten', desc: 'Spring exakt 3 km.' },
{ id: 'badge-run-7k', upplåst: false, icon: '🍀', title: 'Tur-sjuan', desc: 'Slutför ett pass på minst 7 km.' },
{ id: 'badge-run-15k', upplåst: totalKm >= 15, icon: '🏔️', title: 'Halvvägs till Lidingö', desc: 'Spring 15 km under ett pass.' },
{ id: 'badge-run-halfmarathon', upplåst: false, icon: '🏅', title: 'Halvmaraton', desc: 'Spring 21.1 km.' },
{ id: 'badge-run-double-digit', upplåst: false, icon: '🔢', title: 'Dubbla Siffror', desc: 'Tre pass i rad över 10 km.' },
{ id: 'badge-run-short', upplåst: false, icon: '⚡', title: 'Snabbvisit', desc: 'Kort löppass under 1.5 km.' },
{ id: 'badge-run-stairs', upplåst: false, icon: '🧗', title: 'Trappjägaren', desc: 'Logga ett pass med backar/trappor.' },
{ id: 'badge-run-pi', upplåst: false, icon: '🥧', title: 'Pi-passet', desc: 'Spring exakt 3.14 km.' },
{ id: 'badge-run-unbroken', upplåst: false, icon: '🧱', title: 'Jämna Femmor', desc: '5 löppass över 5 km på en månad.' },
{ id: 'badge-run-explorer', upplåst: totalKm >= 250, icon: '🗺️', title: 'Upptäcktsresanden', desc: 'Totalt 250 km löpta.' },

// --- LÖPNING: TEMPO ---
{ id: 'badge-pace-beast', upplåst: harHålltTempoUnder4_5, icon: '✈️', title: 'Ljudets Hastighet', desc: 'Tempo under 4:30 min/km.' },
{ id: 'badge-pace-cruise', upplåst: false, icon: '🚢', title: 'Kryssaren', desc: 'Håll helt jämnt tempo.' },
{ id: 'badge-pace-diesel', upplåst: false, icon: '🚜', title: 'Dieselmotorn', desc: 'Långdistans över 6:30 tempo.' },
{ id: 'badge-pace-recovery', upplåst: false, icon: '🧘', title: 'Aktiv Återhämtning', desc: 'Lugnt löppass under 2 km.' },
{ id: 'badge-pace-perfect-5', upplåst: false, icon: '🖐️', title: 'High Five', desc: 'Tempo mellan 5:00-5:05.' },
{ id: 'badge-pace-sub25', upplåst: false, icon: '⏱️', title: 'Dröm-25', desc: '5 km under 25 min.' },
{ id: 'badge-pace-sub50', upplåst: false, icon: '🏟️', title: 'Arenakungen', desc: '10 km under 50 min.' },
{ id: 'badge-pace-progression', upplåst: false, icon: '📈', title: 'Progressiv Ökning', desc: 'Öka tempot mot slutet.' },
{ id: 'badge-pace-angel', upplåst: false, icon: '👼', title: 'Beatrices Favorit', desc: 'Löp exakt 44 min 44 sek.' },
{ id: 'badge-pace-interval', upplåst: false, icon: '💥', title: 'Intervallchocken', desc: 'Logga intervaller.' },

// --- STYRKA ---
{ id: 'badge-strength-vol10', category: 'Styrka', upplåst: styrkaAntal >= 10, icon: '🏋️', title: 'Järnmannen', desc: '10 styrkepass.' },
{ id: 'badge-strength-vol25', category: 'Styrka', upplåst: styrkaAntal >= 25, icon: '🧱', title: 'Betongblocken', desc: '25 styrkepass.' },
{ id: 'badge-strength-sets', category: 'Styrka', upplåst: false, icon: '🧮', title: 'Set-Samlaren', desc: 'Kör 5 set i ett pass.' },
{ id: 'badge-strength-double', category: 'Styrka', upplåst: false, icon: '🔄', title: 'Dubbelpasset', desc: 'Två styrkepass på samma dag.' },
{ id: 'badge-pass1-expert', category: 'Styrka', upplåst: pass1 >= 10, icon: '📐', title: 'Överkropps-Proffs', desc: 'Pass 1 tio gånger.' },
{ id: 'badge-pass2-expert', category: 'Styrka', upplåst: pass2 >= 10, icon: '🦵', title: 'Skidåkaren', desc: 'Pass 2 tio gånger.' },
{ id: 'badge-pass3-expert', category: 'Styrka', upplåst: pass3 >= 10, icon: '🛡️', title: 'Ogenomtränglig', desc: 'Pass 3 tio gånger.' },
{ id: 'badge-strength-no-rest', category: 'Styrka', upplåst: false, icon: '⏱️', title: 'Kort Vila', desc: 'Vila under 30s per set.' },
{ id: 'badge-strength-beast', category: 'Styrka', upplåst: false, icon: '🌋', title: 'Total Utmattning', desc: '4 set med 60s arbetstid.' },
{ id: 'badge-strength-cent', category: 'Styrka', upplåst: false, icon: '💯', title: 'Hundraklubben', desc: '100 set totalt.' },

// --- KÄNSLA & PANNBEN ---
{ id: 'badge-feel-hard3', category: 'Känsla & Pannben', upplåst: difficult >= 3, icon: '🦾', title: 'Karaktärsbygge', desc: 'Tre "Svåra" pass på en vecka.' },
{ id: 'badge-feel-easy-streak', category: 'Känsla & Pannben', upplåst: false, icon: '🧊', title: 'Glida på räkmacka', desc: '5 "Lätta" pass i rad.' },
{ id: 'badge-feel-lagom', category: 'Känsla & Pannben', upplåst: easy >= 10, icon: '⚖️', title: 'Lagom-Guru', desc: '10 "Lagom" pass.' },
{ id: 'badge-feel-honest', category: 'Känsla & Pannben', upplåst: false, icon: '💬', title: 'Självinsikt', desc: 'Logga "Lätt" på långpass.' },
{ id: 'badge-feel-break', category: 'Känsla & Pannben', upplåst: false, icon: '🔓', title: 'Genombrottet', desc: 'PB under ett "Svårt" pass.' },
{ id: 'badge-feel-grind', category: 'Känsla & Pannben', upplåst: false, icon: '🦷', title: 'Bita ihop', desc: 'Svårt pass sent måndag.' },
{ id: 'badge-feel-zen', category: 'Känsla & Pannben', upplåst: false, icon: '🧘', title: 'Avstressad', desc: 'Pass 3 tidig söndag.' },
{ id: 'badge-feel-proud', category: 'Känsla & Pannben', upplåst: false, icon: '👑', title: 'Stolt men sliten', desc: 'Tre "Svåra" på rad.' },
{ id: 'badge-feel-smooth', category: 'Känsla & Pannben', upplåst: false, icon: '🎿', title: 'Sömlöst', desc: 'Långpass som känns lätt.' },
{ id: 'badge-feel-roller', category: 'Känsla & Pannben', upplåst: false, icon: '🎢', title: 'Känslostorm', desc: 'Svårt -> Lätt -> Svårt.' },

// --- STREAK & KONTINUITET ---
{ id: 'badge-streak-half', category: 'Streak & Kontinuitet', upplåst: currentStreak >= 26, icon: '🌋', title: 'Halvårs-Hjälten', desc: '26 veckors streak.' },
{ id: 'badge-streak-year', category: 'Streak & Kontinuitet', upplåst: currentStreak >= 52, icon: '👑', title: 'Odödlig Rutin', desc: '52 veckors streak.' },
{ id: 'badge-streak-comeback', category: 'Streak & Kontinuitet', upplåst: false, icon: '🩹', title: 'Comeback-Kungen', desc: 'Ny streak efter nollställning.' },
{ id: 'badge-streak-month', category: 'Streak & Kontinuitet', upplåst: false, icon: '🗓️', title: 'Kalenderbitaren', desc: '3 pass/vecka en hel månad.' },
{ id: 'badge-streak-biweekly', category: 'Streak & Kontinuitet', upplåst: false, icon: '☯️', title: 'Jämna Par', desc: '2 pass/vecka i en månad.' },
{ id: 'badge-streak-heavy', category: 'Streak & Kontinuitet', upplåst: false, icon: '🌪️', title: 'Överväxlaren', desc: '5 pass på en vecka.' },
{ id: 'badge-streak-const', category: 'Streak & Kontinuitet', upplåst: false, icon: '🕰️', title: 'Schweiziska Uret', desc: 'Samma veckodag 6 v i rad.' },
{ id: 'badge-streak-triple', category: 'Streak & Kontinuitet', upplåst: false, icon: '🔱', title: 'Trippel-Hotet', desc: 'Mån/Ons/Fre samma vecka.' },
{ id: 'badge-streak-weekend', category: 'Streak & Kontinuitet', upplåst: false, icon: '🍻', title: 'Helgmaskinen', desc: 'Lör+Sön i 3 helger.' },
{ id: 'badge-streak-fire', category: 'Streak & Kontinuitet', upplåst: currentStreak >= 15, icon: '🐲', title: 'Draken', desc: '15 veckors streak.' },

// --- VARIATION ---
{ id: 'badge-combo-sandwich', category: 'Variation', upplåst: false, icon: '🥪', title: 'Löpsmörgåsen', desc: 'Löp -> Styrka -> Löp.' },
{ id: 'badge-combo-yinyang', category: 'Variation', upplåst: false, icon: '☯️', title: 'Yin & Yang', desc: 'Kondition + Styrka/vecka.' },
{ id: 'badge-combo-house', category: 'Variation', upplåst: false, icon: '🏠', title: 'Kåk', desc: 'Alla pass-typer på en månad.' },
{ id: 'badge-combo-every', category: 'Variation', upplåst: false, icon: '🗺️', title: 'Sju av Sju', desc: 'Tränat alla veckodagar.' },
{ id: 'badge-combo-shift', category: 'Variation', upplåst: false, icon: '🔄', title: 'Disciplinskiftet', desc: 'Byt träningsform 4 ggr i rad.' },
{ id: 'badge-combo-legs', category: 'Variation', upplåst: false, icon: '🦵', title: 'Dubbelbänk', desc: 'Pass 2 + Löp på 36h.' },
{ id: 'badge-combo-equal', category: 'Variation', upplåst: false, icon: '⚖️', title: 'Jämvikt', desc: 'Lika många löp- som styrkepass.' },
{ id: 'badge-combo-corerun', category: 'Variation', upplåst: false, icon: '🦅', title: 'Löparbålen', desc: 'Pass 3 + Löp samma dag.' },
{ id: 'badge-combo-quad', category: 'Variation', upplåst: false, icon: '🍀', title: 'Fyrklövern', desc: '4 olika pass-typer på 10 dgr.' },
{ id: 'badge-combo-heavy', category: 'Variation', upplåst: false, icon: '🏋️‍♀️', title: 'Atlet-Månaden', desc: '12 pass på en månad.' },

// --- HÄLSA & COACH ---
{ id: 'badge-health-max', category: 'Hälsa', upplåst: false, icon: '🔋', title: 'Oövervinnerlig', desc: '100% hälsa.' },
{ id: 'badge-health-climb', category: 'Hälsa', upplåst: false, icon: '📈', title: 'Hälsoresan', desc: 'Från 40% till 80% hälsa.' },
{ id: 'badge-health-danger', category: 'Hälsa', upplåst: false, icon: '⚠️', title: 'Leve på gränsen', desc: 'Svårt pass under 20% hälsa.' },
{ id: 'badge-health-immature', category: 'Hälsa', upplåst: false, icon: '🧪', title: 'Biologisk föryngring', desc: '90% hälsa i 3 veckor.' },
{ id: 'badge-health-rec', category: 'Hälsa', upplåst: false, icon: '🛌', title: 'Vila-experten', desc: 'Vila upp till 100% hälsa.' },
{ id: 'badge-coach-listen', category: 'Hälsa', upplåst: false, icon: '🎧', title: 'Lojal lyssnare', desc: 'TTS aktiverat 10 pass.' },
{ id: 'badge-coach-sett', category: 'Hälsa', upplåst: false, icon: '⚙️', title: 'Skräddarsydd', desc: 'Ändrat inställningar.' },
{ id: 'badge-coach-insane', category: 'Hälsa', upplåst: false, icon: '🧠', title: 'Beatrices Maraton', desc: 'Styrkepass över 30 min.' },
{ id: 'badge-health-med', category: 'Hälsa', upplåst: false, icon: '💊', title: 'Immunförsvar', desc: 'Träna direkt efter vila.' },
{ id: 'badge-coach-perf', category: 'Hälsa', upplåst: false, icon: '💎', title: 'Guldskivan', desc: 'Inga pauser på ett pass.' },

// --- PB & SPECIAL ---
{ id: 'badge-pb-double', category: 'PB', upplåst: false, icon: '🚀', title: 'Seriös Ökning', desc: 'PB 5km två ggr/månad.' },
{ id: 'badge-pb-first10', category: 'PB', upplåst: false, icon: '🏁', title: 'Milen-Premiär', desc: 'Första 10km loggad.' },
{ id: 'badge-pb-shatter', category: 'PB', upplåst: false, icon: '🔨', title: 'Rekordkross', desc: 'PB-marginal över 60s.' },
{ id: 'badge-pb-both', category: 'PB', upplåst: false, icon: '🌟', title: 'Dubbelkrönt', desc: 'PB på 5km & 10km.' },
{ id: 'badge-pb-cons', category: 'PB', upplåst: false, icon: '⏱️', title: 'Stabil', desc: 'Inom 15s från PB.' },
{ id: 'badge-pb-timer', category: 'PB', upplåst: false, icon: '⏳', title: 'Tidsoptimisten', desc: 'Längsta set-tiden någonsin.' },
{ id: 'badge-pb-stamina', category: 'PB', upplåst: false, icon: '🌬️', title: 'Outtröttlig', desc: '12km snabbare än 5:30.' },
{ id: 'badge-pb-strike', category: 'PB', upplåst: false, icon: '🏹', title: 'Kontringen', desc: 'PB efter ett svårt pass.' },
{ id: 'badge-pb-spring', category: 'PB', upplåst: false, icon: '🌸', title: 'Vårruset', desc: 'PB i april eller maj.' },
{ id: 'badge-pb-autumn', category: 'PB', upplåst: false, icon: '🍂', title: 'Höstglöden', desc: 'PB i okt eller nov.' },

// --- SPECIAL ---
{ id: 'badge-special-ninja', category: 'Special', upplåst: harTränatNINJA, icon: '🥷', title: 'Nattlig Ninja', desc: 'Träna kl 01-03.' },
{ id: 'badge-special-1111', category: 'Special', upplåst: harTränad1111, icon: '👼', title: '11:11', desc: 'Spara pass kl 11:11.' },
{ id: 'badge-special-speed', category: 'Special', upplåst: harHålltTempoUnder4, icon: '🏎️', title: 'Formel 1', desc: 'Tempo under 4:00.' },
{ id: 'badge-special-halfcent', category: 'Special', upplåst: passAntal >= 50, icon: '🏅', title: 'Halvseklet', desc: '50 sparade pass.' },
        
    ];

    // Lägg till Completionist-märket
    const antalAndraUpplasta = regler.filter(r => r.upplåst).length;
    regler.push({
        id: 'badge-completionist',
        upplåst: antalAndraUpplasta >= 15,
        icon: '🎓',
        title: 'Fulländad',
        desc: 'Makalöst! Du har låst upp 15 andra unika utmärkelser i appen. Du är fulländad!'
    });

    // 🔥 🚀 NY SORT-LOGIK: Sortera så att upplåsta mål hamnar överst
    regler.sort((a, b) => {
        // Kolla om de är sparade i databasen sedan tidigare
        const aDatabaseUnlocked = !!(activeData.badges && activeData.badges[a.id]);
        const bDatabaseUnlocked = !!(activeData.badges && activeData.badges[b.id]);
        
        // En badge är upplåst om antingen live-statistiken slår till ELLER om den finns i databasen
        const aTotaltUpplast = a.upplåst || aDatabaseUnlocked;
        const bTotaltUpplast = b.upplåst || bDatabaseUnlocked;

        if (aTotaltUpplast && !bTotaltUpplast) return -1; // a ska flyttas upp före b
        if (!aTotaltUpplast && bTotaltUpplast) return 1;  // b ska flyttas upp före a
        return 0; // Behåll ursprunglig ordning om båda har samma status
    });

    // 4. Generera HTML-kod för hela rutnätet (i den nya sorterade ordningen)
    container.innerHTML = '';
    regler.forEach(badge => {
        // Hämta status/datum från databasen för denna specifika badge
        const badgeStatus = activeData.badges ? activeData.badges[badge.id] : null;
        const isUnlocked = !!badgeStatus; // Blir true om det finns ett datum eller true sparat
        
        let datumText = "";
        if (isUnlocked && typeof badgeStatus === "string") {
            // Om det finns ett sparat datum (t.ex. 2026-05-18), visa enbart det!
            datumText = `<div style="margin-top: 5px; color: #00e5ff; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">🗓️ ${badgeStatus}</div>`;
        } else if (isUnlocked || badge.upplåst) {
            // Backup för gamla prestationer eller de som precis slogs på i nuvarande session
            datumText = `<div style="margin-top: 5px; color: #2ecc71; font-size: 11px; font-weight: 600;">✨ Avklarad</div>`;
        }

        // Sätt stilar baserat på om den är upplåst
        const tillatUpplast = badge.upplåst || isUnlocked;
        const opacity = tillatUpplast ? '1' : '0.25';
        const filter = tillatUpplast ? 'none' : 'grayscale(100%)';
        const border = tillatUpplast ? '1px solid rgba(255, 0, 212, 0.4)' : '1px solid rgba(255,255,255,0.05)';
        const bg = tillatUpplast ? 'rgba(255, 0, 212, 0.03)' : 'rgba(255, 255, 255, 0.01)';

        // Här trycks kortet ut i HTML-koden
        container.innerHTML += `
            <div id="${badge.id}" style="background: ${bg}; border: ${border}; border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 15px; text-align: left; opacity: ${opacity}; filter: ${filter}; transition: all 0.3s ease;">
                <div style="font-size: 38px; flex-shrink: 0;">${badge.icon}</div>
                <div>
                    <h4 style="color: white; margin: 0 0 3px 0; font-size: 15px; font-weight: 600;">${badge.title}</h4>
                    <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px; line-height: 1.3;">${badge.desc}</p>
                    ${datumText}
                </div>
            </div>
        `;
    });
}
// Gör den global så att flik-menyerna i index.html hittar funktionen vid klick!
window.renderAchievements = renderAchievements;