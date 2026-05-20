// ui.js
import { data } from './database.js';
import { achievementRules } from './achievements.js';
import { achievementQueue } from './history.js';
import { renderStatistics, generateStatsSummary, updateStreak as calculateStreakValue } from './stats.js';

export function initUI() {
    updateStreak();
    renderAchievements();
    updatePBDisplay();
    updateHealth();
}

export function updateStreak() {
    if (typeof calculateStreakValue === 'function') {
        calculateStreakValue();
    }

    const streakEl = document.getElementById('streak-number');
    const streakNumber = data.streak || 0;
    if (streakEl) streakEl.textContent = streakNumber;
    
    const streakEmojiEl = document.getElementById('streak-emoji');
    const streakChipEl = document.getElementById('streak-chip-button');

    if (streakEmojiEl && streakChipEl) {
        if (streakNumber > 0) {
            streakEmojiEl.textContent = "🔥";
            streakEmojiEl.style.filter = "none";
            streakEmojiEl.style.opacity = "1";
            streakChipEl.onmouseover = function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 0 12px rgba(255, 165, 0, 0.5)';
            };
            streakChipEl.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 0 12px rgba(255, 165, 0, 0)';
            };
        } else {
            streakEmojiEl.textContent = "🔥"; 
            streakEmojiEl.style.filter = "grayscale(100%)";
            streakEmojiEl.style.opacity = "0.3";
            streakChipEl.onmouseover = function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = 'none';
            };
            streakChipEl.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            };
        }
    }
    
    const statusEl = document.getElementById('last-workout-status');
    if (statusEl) {
        const historyArray = data.history || [];
        if (historyArray.length > 0) {
            const last = historyArray[historyArray.length - 1];
            statusEl.textContent = `Senaste passet: ${last.info || 'Slutfört'}`;
        } else {
            statusEl.textContent = "Inga pass registrerade den här veckan. Kör igång!";
        }
    }
}

// === BERÄKNAR OCH UPPDATERAR DIN HÄLSOBAR ===
export function updateHealth() {
    const barEl = document.getElementById('health-bar');
    const textEl = document.getElementById('health-text');
    const heartEl = document.getElementById('health-heart');
    
    if (!barEl || !textEl) return;

    const historyArray = data.history || [];
    let health = 100;

    if (historyArray.length > 0) {
        const lastWorkout = historyArray[historyArray.length - 1];
        const lastDate = new Date(lastWorkout.date);
        const today = new Date();
        
        lastDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 3) {
            const extraDays = diffDays - 3;
            health = 100 - (extraDays * 10);
            if (health < 0) health = 0;
        }
    } else {
        health = 50; 
    }

    barEl.style.width = `${health}%`;
    textEl.textContent = `${health}%`;

    if (health < 50) {
        if (heartEl) heartEl.textContent = "💔";
        barEl.classList.add('danger-blink');
    } else {
        if (heartEl) heartEl.textContent = "🔥";
        barEl.classList.remove('danger-blink');
    }
}

export function updateTimerDisplay(step, timeLeft) {
    const taskEl = document.getElementById('timer-task');
    const setEl = document.getElementById('timer-set');
    const timeEl = document.getElementById('timer-time');
    
    if (taskEl) taskEl.textContent = step.task;
    if (setEl) setEl.textContent = step.setInfo || "";
    if (timeEl) timeEl.textContent = timeLeft;
}

export function renderAchievements() {
    const listEl = document.getElementById('achievements-list') || document.querySelector('.badges-grid'); 
    if (!listEl) return;
    
    listEl.innerHTML = "";
    const unlocked = data.achievements || [];
    
    achievementRules.forEach(badge => {
        const isUnlocked = unlocked.includes(badge.id);
        const card = document.createElement('div');
        card.style.opacity = isUnlocked ? "1" : "0.25";
        card.className = "badge-card";
        card.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 5px;">${badge.icon}</div>
            <h4 style="margin: 2px 0;">${badge.title}</h4>
            <p style="font-size: 11px; color: #8fa0dd; margin: 0;">${badge.desc}</p>
        `;
        listEl.appendChild(card);
    });
}

export function updatePBDisplay() {
    const activeData = typeof data !== 'undefined' ? data : (window.data || null);
    if (!activeData || !activeData.pb) return;

    const pb5El = document.getElementById('pb-5');
    if (pb5El) {
        const pb5 = activeData.pb["5"];
        if (pb5) {
            const mins = Math.floor(pb5);
            const secs = Math.round((pb5 - mins) * 60);
            pb5El.textContent = `PB: ${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
            pb5El.textContent = "PB: --:--";
        }
    }

    const pb10El = document.getElementById('pb-10');
    if (pb10El) {
        const pb10 = activeData.pb["10"];
        if (pb10) {
            const mins = Math.floor(pb10);
            const secs = Math.round((pb10 - mins) * 60);
            pb10El.textContent = `PB: ${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
            pb10El.textContent = "PB: --:--";
        }
    }
}

export function updateButtonPBs() {
    console.log("[Beatrice UI] Uppdaterar personbästan på löpningsknapparna...");
    
    let activeData = window.data;
    if (!activeData && typeof import('./database.js') !== 'undefined') {
        const saved = localStorage.getItem('beatrice_workout_data');
        if (saved) activeData = JSON.parse(saved);
    }

    if (!activeData || !activeData.pb) return;

    const pb5El = document.getElementById('pb-5');
    if (pb5El) {
        const pb5 = activeData.pb["5"];
        if (pb5) {
            const mins = Math.floor(pb5);
            const secs = Math.round((pb5 - mins) * 60);
            pb5El.textContent = `PB: ${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
            pb5El.textContent = "PB: --:--";
        }
    }

    const pb10El = document.getElementById('pb-10');
    if (pb10El) {
        const pb10 = activeData.pb["10"];
        if (pb10) {
            const mins = Math.floor(pb10);
            const secs = Math.round((pb10 - mins) * 60);
            pb10El.textContent = `PB: ${mins}:${secs.toString().padStart(2, '0')}`;
        } else {
            pb10El.textContent = "PB: --:--";
        }
    }
}

export function showAchievementPopup() {
    if (!achievementQueue || achievementQueue.length === 0) return;
    const badge = achievementQueue[0];
    
    const modal = document.getElementById('achievementModal'); 
    const listContainer = document.getElementById('achievement-modal-list');
    
    if (modal && listContainer) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding:15px;">
                <div style="font-size: 60px; animation: popIn 0.6s ease;">${badge.icon}</div>
                <h3 style="color: #ff00d4; margin-top:10px;">${badge.title}</h3>
                <p style="color: #fff;">${badge.desc}</p>
            </div>
        `;
        modal.style.display = 'flex';
    }
}

window.closeAchievementModal = function() {
    const modal = document.getElementById('achievementModal');
    if (modal) modal.style.display = 'none';
    
    if (achievementQueue && achievementQueue.length > 0) {
        achievementQueue.shift(); 
        if (achievementQueue.length > 0) {
            showAchievementPopup(); 
        }
    }
};

export function queueAchievementModal(badges) {
    if (!badges) return;
    badges.forEach(b => {
        if (achievementQueue && !achievementQueue.includes(b)) {
            achievementQueue.push(b);
        }
    });
    showAchievementPopup();
}

if (!document.getElementById('beatrice-hidden-style')) {
    const style = document.createElement('style');
    style.id = 'beatrice-hidden-style';
    style.innerHTML = '.hidden { display: none !important; }';
    document.head.appendChild(style);
}

export function switchTab(tabId) {
    console.log(`[Beatrice Navigering] switchTab anropad med id: ${tabId}`);
    if (tabId === 'stats-selection' || tabId === 'statistics') {
        renderStatistics();
    }

    const sections = [
        'home-section', 
        'workout-section', 
        'history-section', 
        'achievements-section', 
        'timer-display', 
        'stats-selection'
    ];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = ''; 
        }
    });

    const activePage = document.getElementById(tabId);
    if (activePage) {
        activePage.classList.remove('hidden');
        if (tabId === 'timer-display') {
            activePage.style.display = 'flex';
        }
    }

    // Kodbiten inuti switchTab(tabId) i ui.js som tänder rätt knapp:
    const buttons = document.querySelectorAll('.nav-btn, .tab-btn');
    buttons.forEach(btn => {
        // Kontrollerar om knappens onclick-kod innehåller det tabId vi just bytte till
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (tabId === 'achievements-section') {
        if (typeof window.renderAchievements === 'function') {
            window.renderAchievements();
        } else if (typeof renderAchievements === 'function') {
            renderAchievements();
        }
    }

    if (tabId === 'history-section' || tabId === 'statistic-section') {
        if (typeof window.renderStatistics === 'function') {
            window.renderStatistics();
        } else if (typeof renderStatistics === 'function') {
            renderStatistics();
        } else if (typeof window.updateCharts === 'function') {
            window.updateCharts();
        }
    }

    if (tabId === 'history-section') {
        if (typeof window.renderCalendar === 'function') {
            window.renderCalendar();
        } else if (typeof renderCalendar === 'function') {
            renderCalendar();
        } else if (typeof window.generateCalendar === 'function') {
            window.generateCalendar();
        } else if (typeof window.updateCalendar === 'function') {
            window.updateCalendar();
        }
    }

    if (tabId === 'stats-selection') {
        if (typeof window.renderStatsPage === 'function') {
            window.renderStatsPage();
        } else if (typeof renderStatsPage === 'function') {
            renderStatsPage();
        }
    }

  
// 🔥 AUTOMATISK VISNING/DÖLJNING AV TRÄNINGS- OCH LÖPKORT
    const workoutGrid = document.querySelector('.workout-cards-grid');
    const runGrid = document.querySelector('.run-cards-grid');
    const startBtn = document.getElementById('start-btn');

    if (tabId === 'workout-section') {
        // Om användaren klickar på Träningsfliken, visa korten!
        if (workoutGrid) workoutGrid.style.display = 'flex';
        if (runGrid) runGrid.style.display = 'flex';
        // Startknappen ska förbli dold tills de faktiskt väljer ett specifikt pass
    } else {
        // Om användaren är på någon annan flik (Historik, Mål, Stats, Hem), dölj allt!
        if (workoutGrid) workoutGrid.style.display = 'none';
        if (runGrid) runGrid.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';
    }
}

export function showPauseButton() {
    const controls = document.getElementById('workout-controls');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    
    if (controls) controls.style.display = 'flex';
    if (pauseBtn) pauseBtn.style.display = 'flex';
    if (resumeBtn) resumeBtn.style.display = 'none';
}

export function hidePauseButton() {
    const controls = document.getElementById('workout-controls');
    if (controls) controls.style.display = 'none';
}

// === POPUP LOGIK FÖR FRÅGETECKENSKNAPPEN ===
export function showHealthInfo() {
    const modal = document.getElementById('healthModal');
    if (modal) modal.style.display = 'flex';
}

export function closeHealthModal() {
    const modal = document.getElementById('healthModal');
    if (modal) modal.style.display = 'none';
}

// Exponera funktioner till det globala fönstret för onclick i din HTML
window.updateButtonPBs = updateButtonPBs;
window.switchTab = switchTab;
window.showHealthInfo = showHealthInfo;
window.closeHealthModal = closeHealthModal;