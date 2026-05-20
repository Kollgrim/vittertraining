// Importera start- och styrfunktioner från dina moduler
// Ändra denna rad längst upp i app.js:
import { data, programs, saveDatabase } from './database.js';
import { startWorkout, startRun, selectPass, pauseWorkout, resumeWorkout } from './training.js';
import { saveAndReset, clearHistory } from './history.js';
import { initUI, switchTab } from './ui.js';
import { speak } from './audio.js';
import { renderStatistics } from './stats.js';
// ==========================================
// EXNERA FUNKTIONER TILL HTML (window)
// ==========================================
// Eftersom moduler är isolerade måste vi manuellt lägga till 
// de funktioner som anropas via "onclick" i din HTML på window-objektet.

window.startWorkout = startWorkout;
window.startRun = startRun;
window.saveAndReset = saveAndReset;
window.clearHistory = clearHistory;
window.switchTab = switchTab;
window.selectPass = selectPass;
window.saveDatabase = saveDatabase;

// Säkra platshållare för paus/resume
window.pauseWorkout = function() { console.log("Paus klickad"); };
window.resumeWorkout = function() { console.log("Resume klickad"); };

// Exponera för testning eller specifika knapptryck
window.speakText = (text) => speak(text);

// ==========================================
// STARTA APPEN NÄR SIDAN HAR LADDATS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log("Beatrice Engine: ES-moduler laddade suveränt!");
    
    // Kör igång din UI-initiering (ritar upp streaks, medaljer, etc.)
    if (typeof initUI === 'function') {
        initUI();
    }

    // Tvinga fram renderingen av dina personbästan på knapparna direkt vid start!
    if (typeof window.updateButtonPBs === 'function') {
        window.updateButtonPBs();
    }
});

/*// === DEFINIERA SPARNINGEN EN GÅNG FÖR ALLA ===
export function saveDatabase() {
    console.log("[Database] Sparar all träningsdata till localStorage...");
    
    try {
        // Hämta det aktuella dataobjektet (justera namnet 'data' om ditt objekt heter något annat)
        let activeData = typeof data !== 'undefined' ? data : (window.data || null);
        
        if (activeData) {
            // Spara ner till webbläsarens minne under din STORAGE_KEY (eller fallback)
            const storageKeyName = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : 'training_data';
            localStorage.setItem(storageKeyName, JSON.stringify(activeData));
            console.log("[Database] Sparningen lyckades!");
        } else {
            console.warn("[Database] Kunde inte spara, hittade inget data-objekt.");
        }
    } catch (error) {
        console.error("[Database] Fel uppstod vid sparande till localStorage:", error);
    }
}*/

// === AUTOMATISK LAGA-CSS (Körs en gång när filen laddas) ===
if (!document.getElementById('beatrice-hidden-style')) {
    const style = document.createElement('style');
    style.id = 'beatrice-hidden-style';
    style.innerHTML = '.hidden { display: none !important; }';
    document.head.appendChild(style);
}

// Gör den global så att history.js, achievements.js och alla andra filer kan nå den via window!
// (Eftersom den importeras högst upp behövs ingen ny "function saveDatabase() {}" här)
window.saveDatabase = saveDatabase;
window.saveToDatabase = saveDatabase;
// Lägg till dessa rader i app.js där du har dina andra window.xxxx = xxxx;
window.renderStatistics = renderStatistics;
window.renderStatsPage = renderStatistics; // Säkerhetslina om din HTML anropar renderStatsPage
// ==========================================
// EXPORTERA FUNKTIONER TILL HTML (window)
// ==========================================
// Eftersom moduler är isolerade måste vi manuellt lägga till 
// de funktioner som anropas via "onclick" i din HTML på window-objektet.

window.startWorkout = startWorkout;
window.startRun = startRun;
window.saveAndReset = saveAndReset;
window.clearHistory = clearHistory;
window.switchTab = switchTab; // <-- SÄKERSTÄLL ATT DENNA RAD FINNS MED!
window.selectPass = selectPass;
window.saveDatabase = saveDatabase;

// Funktion för att hantera ändring av träningssekunder
function updateSettingsSeconds(val) {
    const value = parseInt(val, 10);
    data.seconds = value;
    saveDatabase();
    const display = document.getElementById('settings-seconds-display');
    if (display) display.textContent = value;
}

// NY FUNKTION: Hantera ändring av antal set
function updateSettingsSets(val) {
    const value = parseInt(val, 10);
    data.sets = value; // Spara i databasen
    saveDatabase();    // Spara till LocalStorage
    
    const display = document.getElementById('settings-sets-display');
    if (display) display.textContent = value;
}

// Öppna/stäng modalen och synka BÅDA reglagen med sparad data
function toggleSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            // 1. Synka sekunder
            const currentSeconds = data.seconds || 10;
            const sliderSec = document.getElementById('settings-seconds-slider');
            const displaySec = document.getElementById('settings-seconds-display');
            if (sliderSec) sliderSec.value = currentSeconds;
            if (displaySec) displaySec.textContent = currentSeconds;
            
            // 2. Synka set (NYTT)
            const currentSets = data.sets || 3;
            const sliderSets = document.getElementById('settings-sets-slider');
            const displaySets = document.getElementById('settings-sets-display');
            if (sliderSets) sliderSets.value = currentSets;
            if (displaySets) displaySets.textContent = currentSets;
            
            modal.style.display = 'flex';
        }
    }
}

// Funktion för att öppna/stänga streak-informationen
function toggleStreakInfoModal() {
    const modal = document.getElementById('streak-info-modal');
    if (modal) {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'flex';
        }
    }
}


// HEMSKÄRMSFUNKTION 

// app.js - Uppdaterad kod för att även byta flik efter startskärmen
document.addEventListener('DOMContentLoaded', () => {
    // ... (Din existerande initieringskod, t.ex. initUI(), renderStatistics() etc.)

    // Dölj startskärmen efter 2.5 sekunder och byt flik
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('fade-out');
            
            // 🚀 NYTT: Vänta tills uttoningen (0.5s) är helt klar, byt sedan flik till träning
            setTimeout(() => {
                if (typeof window.switchTab === 'function') {
                    window.switchTab('workout-section');
                } else {
                    console.warn("[Beatrice] switchTab hittades inte på window-objektet.");
                }
            }, ); // 500 millisekunder matchar CSS-transitionen för fade-out
        }
    }, 2500); 
});

window.startWorkout = startWorkout;
window.startRun = startRun;
window.saveAndReset = saveAndReset;
window.clearHistory = clearHistory;
window.switchTab = switchTab;
window.selectPass = selectPass;
window.saveDatabase = saveDatabase;
window.toggleSettingsModal = toggleSettingsModal; 
window.updateSettingsSeconds = updateSettingsSeconds;
window.updateSettingsSets = updateSettingsSets;
window.toggleStreakInfoModal = toggleStreakInfoModal;
window.pauseWorkout = pauseWorkout;
window.resumeWorkout = resumeWorkout;