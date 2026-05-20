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
    let harHålltTempoUnder5 = false, harKörtTungTimer = false;
    let harTränatMorgon = false, harTränatNatt = false, harTränatHelg = false;
    let unikaDagar = new Set();

    // Loopa igenom historiken för att räkna mätvärden
    historik.forEach(entry => {
        const entryDatum = entry.date ? new Date(entry.date) : null;
        if (entry.grade === "Svårt" || entry.betyg === "Svårt") difficult++;
        if (entry.grade === "Lätt" || entry.betyg === "Lätt") easy++;
        
        if (entryDatum) {
            unikaDagar.add(entryDatum.getDay());
            if (entryDatum.getHours() < 8) harTränatMorgon = true;
            if (entryDatum.getHours() >= 21) harTränatNatt = true;
            if (entryDatum.getDay() === 0 || entryDatum.getDay() === 6) harTränatHelg = true;
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
        } else if (entry.isStrength || entry.type === 'styrka') {
            styrkaAntal++;
            if (entry.info && entry.info.includes("PASS 1")) pass1++;
            if (entry.info && entry.info.includes("PASS 2")) pass2++;
            if (entry.info && entry.info.includes("PASS 3")) pass3++;
            if (parseInt(entry.secondsPerSet) >= 60) harKörtTungTimer = true;
        }
    });

    // 3. Definition av alla 31 utmärkelser (Ska matcha saveAndReset exakt!)
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
        { id: 'badge-loyal', upplåst: unikaDagar.size >= 5, icon: '💎', title: 'Lojal Klient', desc: 'Fantastisk hängivenhet! Du har registrerat träning på minst 5 olika veckodagar totalt.' }
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

    // 4. Generera HTML-kod för hela rutnätet
    container.innerHTML = '';
    regler.forEach(badge => {
        // Kontrollera om prestationen är upplåst i din sparade data
        // Hämta status/datum från databasen för denna specifika badge
        const badgeStatus = data.badges ? data.badges[badge.id] : null;
        const isUnlocked = !!badgeStatus; // Blir true om det finns ett datum eller true sparat
        
        // 🔥 NY FIX: Visa enbart datumet eller en stilren symbol utan ordet "UPPLÅST"
        let datumText = "";
        if (isUnlocked && typeof badgeStatus === "string") {
            // Om det finns ett sparat datum (t.ex. 2026-05-18), visa enbart det!
            datumText = `<div style="margin-top: 5px; color: #00e5ff; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">🗓️ ${badgeStatus}</div>`;
        } else if (isUnlocked) {
            // Backup för gamla prestationer som sparats som "true" innan datumet fanns med
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