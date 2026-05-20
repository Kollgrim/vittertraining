// ==========================================
// TRÄNINGSMOTOR & TIMERS (ES Module)
// ==========================================

import { data, programs } from './database.js'; // Ändrat till litet d
import { playBeep, playBeatriceSound } from './audio.js';
import { updateTimerDisplay, showPauseButton, hidePauseButton } from './ui.js';

// Exportera träningsstatustillstånd så att ui.js och history.js kan läsa dem
export let currentRunData = null;
export let workoutInterval = null; 
export let countdownInterval = null; // Håller koll på förberedelsenedräkningen
export let currentWorkoutTimeline = [];
export let currentTimelineIdx = 0;
export let currentWorkoutTimeLeft = 0;
export let isWarmup = false;

// Beroende på ditt nuvarande gränssnitt håller vi koll på aktivt program-ID globalt i modulen
let currentProgramId = 1;

/**
 * Startar logiken och nedräkningen för ett löppass (5km eller 10km)
 * @param {number} dist - Distansen i kilometer (t.ex. 5 eller 10)
 */
export function startRun(dist) {
    console.log(`[Beatrice] startRun anropad för: ${dist} km`);

    // 🔥 GÖM ALLA PASS- OCH LÖP-KORT NÄR LÖPNINGEN STARTAR
    const workoutGrid = document.querySelector('.workout-cards-grid');
    if (workoutGrid) workoutGrid.style.display = 'none';

    const runGrid = document.querySelector('.run-cards-grid');
    if (runGrid) runGrid.style.display = 'none';


    
    // SÄKRA KONTROLLER: Dölj väljare och startknappar OM de existerar i HTML
    const passSelector = document.getElementById('pass-selector');
    if (passSelector) passSelector.style.display = 'none';

    const runSelector = document.getElementById('run-selector');
    if (runSelector) runSelector.style.display = 'none';
    
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.style.display = 'none';
    
    // 🔥 FIX: Tvinga fram tidsdisplayen så att nedräkningen syns direkt under löpningen!
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.classList.remove('hidden');
        timerDisplay.style.display = 'flex';
    }

    // Visa pausknappen (från ui.js)
    if (typeof showPauseButton === 'function') {
        showPauseButton();
    }

    // Spela upp ljud
    if (dist === 5) {
        playBeatriceSound('start5km');
    } else if (dist === 10) {
        playBeatriceSound('start10km');
    }
    
    let countdown = 10;
    
    // Säkra uppdateringar av textfält
    const timerTask = document.getElementById('timer-task');
    const timerSet = document.getElementById('timer-set');
    const timerTime = document.getElementById('timer-time');

    if (timerTask) timerTask.innerText = "FÖRBERED LÖPNING";
    if (timerSet) timerSet.innerText = `${dist} KM`;
    if (timerTime) timerTime.innerText = countdown;

    const runInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
            if (timerTime) timerTime.innerText = countdown;
            if (countdown === 3 || countdown === 2 || countdown === 1) playBeep(false);
        } else {
            clearInterval(runInterval);
            playBeep(true);
            playBeatriceSound('löp');
            
            const startTime = Date.now();
            currentRunData = { dist: dist, startTime: startTime };

            // Säker hantering av overlays
            const overlay = document.getElementById('run-finish-overlay');
            const infoDisplay = document.getElementById('run-info-display');
            
            if (infoDisplay) infoDisplay.innerText = `🏃 LÖPER ${dist} KM...`;
            if (overlay) overlay.style.display = 'flex';

            const finishBtn = document.getElementById('finish-run-btn');
            if (finishBtn) {
                finishBtn.onclick = () => stopRunClock();
            }
            
            if (timerTask) timerTask.innerText = "SPRING!";
            if (timerTime) timerTime.innerText = "GO!";
        }
    }, 1000);
}



/**
 * Startar styrketräningspasset och bygger tidslinjen dynamiskt utifrån valt program
 */
export function startWorkout(programId) {
   
   // 🔥 GÖM ALLA PASS- OCH LÖP-KORT NÄR PASSET STARTAR
    const workoutGrid = document.querySelector('.workout-cards-grid');
    if (workoutGrid) workoutGrid.style.display = 'none';

    const runGrid = document.querySelector('.run-cards-grid');
    if (runGrid) runGrid.style.display = 'none';
    
    // Göm även startknappen eftersom passet redan har startat
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.style.display = 'none';
   
    // 1. Om inget ID skickades med från knappen, hämta det som är valt globalt eller i fönstret
    let cleanProgramId = programId ? Number(programId) : (window.currentProgramId || currentProgramId);
    showPauseButton();
    // Säkerhetslina: Om det fortfarande är undefined, sätt till det som visas på skärmen (standard: 1)
    if (!cleanProgramId || isNaN(cleanProgramId)) {
        cleanProgramId = 1;
    }
    
    currentProgramId = cleanProgramId;
    window.currentProgramId = cleanProgramId;

    // 2. Hämta träningsprogrammen kraschsäkert från databasen
    const activePrograms = typeof programs !== 'undefined' ? programs : (window.programs || {});
    const selectedProgram = activePrograms[cleanProgramId];
    
    // 3. SÄKERHETSKONTROLL: Gå bara vidare om programmet faktiskt existerar
    if (!selectedProgram) {
        console.warn(`[Beatrice Träning] Kunde inte hitta program med ID ${cleanProgramId}.`);
        return; // Avbryt direkt så att raderna under inte kraschar appen
    }

    // Använd de 3 slumpade övningarna som sparades i selectPass, eller fall tillbaka på hela listan
    const exercisesToUse = selectedProgram.activeExecutionList || selectedProgram.list || [];

    // 4. BYGG SESSIONSÖVNINGAR OCH TIMELINE UTIFRÅN DET VALDA PROGRAMMET
    window.currentSessionExercises = JSON.parse(JSON.stringify(exercisesToUse));
    currentWorkoutTimeline = [];
    
    // Lägg till uppvärmning (120 sekunder)
    //currentWorkoutTimeline.push({ task: "Uppvärmning", duration: 120 });
    
    // Loopa igenom det valda programmets övningar
    exercisesToUse.forEach(ex => {
        ex.sets = data.sets;
        const sets = parseInt(ex.sets) || 3;
        for (let i = 1; i <= sets; i++) {
            currentWorkoutTimeline.push({ 
                task: `${ex.name}`, 
                setNummer: i,
                duration: data.seconds || 10 , // Arbetssekunder per set
                gif: ex.gif || ex.img || '',
                img: ex.img || ex.gif || '',
                exercise: ex 
            });
            
            // Lägg till vila efter varje set
            currentWorkoutTimeline.push({ task: "Vila", duration: 2 });
        }
    });
    
    currentTimelineIdx = 0;
    const programName = selectedProgram.name || `Pass ${cleanProgramId}`;
    console.log(`[Beatrice Träning] STARTAR PASSET: ${programName}`, currentWorkoutTimeline);

    // === 5. UPPDATERA GRÄNSSNITTET OCH STARTA SKÄRMBYTE ===
    const passSelector = document.getElementById('pass-selector');
    if (passSelector) passSelector.style.display = 'none';
    
    const runSelector = document.getElementById('run-selector');
    if (runSelector) runSelector.style.display = 'none';


    // 🔥 Tvinga fram tidsdisplayen så att nedräkningen syns direkt på skärmen!
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.style.display = 'flex';
        timerDisplay.classList.remove('hidden');
    }

    showPauseButton();

    // === 🔥 NYHET: FÖRBEREDELSENEDRÄKNING MED LJUD ===
    // Spela upp startljudet för styrketräning
    playBeatriceSound('startTräning');
    
    let countdown = 10;
    const taskEl = document.getElementById('timer-task');
    const setEl = document.getElementById('timer-set');
    const timeEl = document.getElementById('timer-time');

    if (taskEl) taskEl.innerText = "FÖRBERED TRÄNING";
    if (setEl) setEl.innerText = programName;
    if (timeEl) timeEl.innerText = countdown;

    // Rensa eventuella gamla intervaller för säkerhets skull
    if (countdownInterval) clearInterval(countdownInterval);
    if (workoutInterval) clearInterval(workoutInterval);
    
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
            if (timeEl) timeEl.innerText = countdown;
            // Pip-ljud vid 3, 2, 1 sekunder kvar
            if (countdown === 3 || countdown === 2 || countdown === 1) playBeep(false);
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
            
            // Slutpip innan första övningen/uppvärmningen börjar
            playBeep(true);
            
            // Kör igång den ordentliga stegmotorn som driver resten av passet!
            runWorkoutStep();
        }
    }, 1000);
}

/**
 * Driver klockan sekund för sekund genom hela styrkepassets tidslinje
 */
export function runWorkoutTimeline() {
    // Uppdatera skärmen första sekunden
    updateTimerDisplay(currentWorkoutTimeline[currentTimelineIdx], currentWorkoutTimeLeft);

    workoutInterval = setInterval(() => {
        currentWorkoutTimeLeft--;
        if (currentWorkoutTimeLeft >= 0) {
            document.getElementById('timer-time').innerText = currentWorkoutTimeLeft;
            if (currentWorkoutTimeLeft === 3 || currentWorkoutTimeLeft === 2 || currentWorkoutTimeLeft === 1) playBeep(false);
        } else {
            currentTimelineIdx++;
            if (currentTimelineIdx < currentWorkoutTimeline.length) {
                const currentStep = currentWorkoutTimeline[currentTimelineIdx];
                
                currentWorkoutTimeLeft = currentStep.time;
                updateTimerDisplay(currentStep, currentWorkoutTimeLeft);
                playBeep(true);
                // === SPECIALLJUD LOGIK PER MOMENT ===
                if (currentStep.task === "VILA") {
                    playBeatriceSound('vila');
                } else if (currentStep.setNummer === 2) {
                    playBeatriceSound('startSet2');
                } else if (currentStep.setNummer === 3) {
                    playBeatriceSound('startSet3');
                } else {
                    // Det är Set 1 av en helt ny övning -> Spela upp specifikt övningsljud
                    triggerExerciseAudio(currentStep.task);
                }
            } else {
                // Passet är helt slutfört!
                playBeep(true);
                clearInterval(workoutInterval);
                workoutInterval = null;
                hidePauseButton(); 
                playBeatriceSound('avslutatPass');
                
                document.getElementById('timer-display').style.display = 'none';
                if (document.getElementById('start-btn')) document.getElementById('start-btn').style.display = 'block';
                
                // Sätt en flagga eller spara information om att det var STYRKA som kördes
                window.currentWorkoutType = 'strength';
                window.currentWorkoutId = currentProgramId || 1;

                const ratingModal = document.getElementById('ratingModal');
                if (ratingModal) {
                    ratingModal.style.display = 'flex';
                } else {
                    // Backup om modal saknas
                    import('./history.js').then(m => m.saveAndReset('Lagom', { type: 'strength', id: currentProgramId }));
                }
            }
        }
    }, 1000);
}

/**
 * Hjälpfunktion för att matcha aktiv övningstext med rätt ljudkategori
 * @param {string} taskName - Namnet på övningen
 */
function triggerExerciseAudio(taskName) {
    const taskLower = taskName.toLowerCase();

    if (taskLower.includes("vila") || taskLower.includes("paus")) {
        playBeatriceSound('vila');
    } else if (taskLower.includes("axelpress")) {
        playBeatriceSound('axelpress');
    } else if (taskLower.includes("hantelrodd")) {
        playBeatriceSound('hantelrodd');
    } else if (taskLower.includes("bicepscurls")) {
        playBeatriceSound('bicepscurls');
    } else if (taskLower.includes("tricepspress")) {
        playBeatriceSound('tricepspress');
    } else if (taskLower.includes("sidolyft")) { 
        playBeatriceSound('Sidolyft');
    } else if (taskLower.includes("knäböj")) {
        playBeatriceSound('knäböj');
    } else if (taskLower.includes("utfallssteg")) {
        playBeatriceSound('utfallssteg');
    } else if (taskLower.includes("rakamarklyft")) { 
        playBeatriceSound('rakaMarklyft');
    } else if (taskLower.includes("gobletsquat")) { 
        playBeatriceSound('gobletSquat');
    } else if (taskLower.includes("stepups")) { 
        playBeatriceSound('stepUps');
    } else if (taskLower.includes("plankan")) {
        playBeatriceSound('plankan');
    } else if (taskLower.includes("russiantwist")) { 
        playBeatriceSound('russianTwist');
    } else if (taskLower.includes("benlyft")) {
        playBeatriceSound('benlyft');
    } else if (taskLower.includes("mountainclimbers")) { 
        playBeatriceSound('mountainClimbers');
    } else if (taskLower.includes("sidoplankan")) {
        playBeatriceSound('sidoplankan');
    } else {
        playBeatriceSound('allmanTraning');
    }
}

/**
 * Hjälpfunktion för att nollställa tillståndet i händelse av manuell avbruten träning
 */
export function resetWorkoutState() {
    if (workoutInterval) clearInterval(workoutInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    workoutInterval = null;
    countdownInterval = null;
    currentRunData = null;
    isWarmup = false;
}

/**
 * Returnerar det nuvarande aktiva program-ID:t
 * @returns {number}
 */
export function getCurrentProgramId() {
    return currentProgramId || 1;
}

/**
 * Hanterar valet av träningspass, slumpar fram 3 övningar om det finns fler, 
 * och renderar gränssnittet i kompakt design.
 * @param {number|string} idx - ID för det valda programmet (1, 2 eller 3)
 */
export function selectPass(programId) {
    currentProgramId = programId;
    window.currentProgramId = programId;

    const activePrograms = typeof programs !== 'undefined' ? programs : (window.programs || {});
    if (activePrograms[programId] && activePrograms[programId].list) {
        window.currentSessionExercises = JSON.parse(JSON.stringify(activePrograms[programId].list));
    }
    
    if (data) {
        const base = Math.floor((data.workoutsThisWeek || 0) / 3) * 3;
        data.workoutsThisWeek = base + (programId - 1);
    }
    
    // 1. UPPDATERA AKTIV KLASS PÅ DE NYA TRÄNINGSKORTEN
    const workoutCards = document.querySelectorAll('.workout-cards-grid .workout-card');
    workoutCards.forEach((card, index) => {
        const cardId = index + 1;
        if (cardId === programId) {
            card.classList.add('active-pass');
            card.style.borderColor = 'rgba(255, 0, 212, 0.8)';
            card.style.background = '#24324d';
        } else {
            card.classList.remove('active-pass');
            card.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            card.style.background = '#1e293b';
        }
    });
    
    // 2. Hämta programmet och uppdatera rubriken
    const selectedProgram = programs[programId];
    const passTitleEl = document.getElementById('selected-pass-title');
    if (passTitleEl && selectedProgram) {
        passTitleEl.textContent = selectedProgram.name;
    }

    // 3. SLUMPA FRAM 3 ÖVNINGAR UR UTBUDET
    const exercisesListEl = document.getElementById('exercises-list') || document.querySelector('.exercises-list') || document.getElementById('workout-exercises');
    
    if (exercisesListEl && selectedProgram && selectedProgram.list) {
        exercisesListEl.innerHTML = "";

        const shuffledList = [...selectedProgram.list];

        for (let i = shuffledList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
        }

        const subList = shuffledList.slice(0, 3);
        selectedProgram.activeExecutionList = subList;

        subList.forEach(exercise => {
            const exerciseCard = document.createElement('div');
            
            exerciseCard.className = 'exercise-item';
            exerciseCard.style.display = 'flex';
            exerciseCard.style.alignItems = 'center';
            exerciseCard.style.justifyContent = 'space-between';
            exerciseCard.style.backgroundColor = '#15171e';
            exerciseCard.style.padding = '15px';
            exerciseCard.style.marginBottom = '10px';
            exerciseCard.style.borderRadius = '8px';
            exerciseCard.style.border = '1px solid #232733';
            exerciseCard.style.color = '#ffffff';

            exerciseCard.innerHTML = `
                <div class="exercise-left" style="display: flex; align-items: center; gap: 20px;">
                    <img src="${exercise.img || exercise.gif || ''}" alt="${exercise.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; background-color: #fff;">
                    <div class="exercise-details" style="display: flex; flex-direction: column; gap: 5px;">
                        <div class="exercise-title" style="font-weight: bold; font-size: 1.1rem;">${exercise.name}</div>
                        <a href="#" class="instruction-link" style="color: #4cd964; font-size: 0.85rem; text-decoration: none;"
                           onclick="event.preventDefault(); window.showInstructionModal('${exercise.name.replace(/'/g, "\\'")}', '${(exercise.desc || '').replace(/'/g, "\\'")}', '${exercise.gif || exercise.img || ''}');">
                            Visa instruktion
                        </a>
                    </div>
                </div>
                <div class="exercise-right">
                    <span class="set-badge" style="background-color: #8a2be2; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">
                    ${data.sets || 3} set × ${data.seconds || 10}s
                    </span>
                </div>
            `;
            
            exercisesListEl.appendChild(exerciseCard);
        });
    } else {
        console.warn("[Beatrice] Kunde inte hitta behållaren för övningslistan i HTML-koden.");
    }

    // 🔥 FIX: Tvinga fram "Starta passet"-knappen först NU när ett pass har klickats i!
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.style.display = 'block';
    }

    // 🔥 NYTT: Göm löpningsknapparna (både grid-klassen och eventuell run-selector container)
    const runGrid = document.querySelector('.run-cards-grid');
    if (runGrid) {
        runGrid.style.display = 'none';
    }
    const runSelector = document.getElementById('run-selector');
    if (runSelector) {
        runSelector.style.display = 'none';
    }

    console.log(`[Beatrice] Valt pass ID: ${programId}. 3 slumpmässiga övningar har genererats och startknappen är aktiverad.`);
}

window.selectPass = selectPass;
/**
 * Kör det nuvarande steget i träningspassets tidslinje (Övning, Vila, Uppvärmning etc.) och hanterar klockan.
 */
export function runWorkoutStep() {
    // 1. Om vi har gått igenom hela tidslinjen är passet slut!
    if (currentTimelineIdx >= currentWorkoutTimeline.length) {
        console.log("[Beatrice Spion] Tidslinjen är slut! Öppnar betygsskärmen.");
        if (workoutInterval) clearInterval(workoutInterval);
        
        // Sätt flaggor för sparande
        window.currentWorkoutType = 'strength';
        window.currentWorkoutId = currentProgramId || 1;

        const ratingModal = document.getElementById('ratingModal');
        if (ratingModal) {
            ratingModal.style.display = 'flex';
        } else {
            import('./history.js').then(m => m.saveAndReset('Lagom', { type: 'strength', id: currentProgramId }));
        }
        return;
    }

    // 2. Hämta det aktuella steget från tidslinjen
    const currentStep = currentWorkoutTimeline[currentTimelineIdx];
    currentWorkoutTimeLeft = currentStep.duration;

    // 🕵️‍♂️ SPION-LOGG: Se exakt vilket steg och vilket set som laddas i konsolen!
    console.log(`[Beatrice Spion] Steg ${currentTimelineIdx + 1}: Aktivitet = ${currentStep.task}, Set = ${currentStep.setNummer || 'Inget set (t.ex. vila/uppvärmning)'}, Tid = ${currentWorkoutTimeLeft}s`);

    // 3. Uppdatera texter och bilder i gränssnittet direkt via ui.js
    updateTimerDisplay(currentStep, currentWorkoutTimeLeft);
    
    const exerciseGifEl = document.getElementById('timer-gif') || document.getElementById('exercise-image');
    if (exerciseGifEl) {
        exerciseGifEl.src = currentStep.gif || currentStep.img || '';
        exerciseGifEl.style.display = (currentStep.gif || currentStep.img) ? 'block' : 'none';
    }

    // 🔥 FIXEN: Nu skickar vi med BÅDE namnet på övningen OCH vilket setnummer det är till ljudmotorn!
    playBeatriceExerciseSound(currentStep.task, currentStep.setNummer);

    // 4. Starta sekundräknaren för det här specifika steget
    if (workoutInterval) clearInterval(workoutInterval);
    workoutInterval = setInterval(() => {
        if (currentWorkoutTimeLeft > 0) {
            currentWorkoutTimeLeft--;
            updateTimerDisplay(currentStep, currentWorkoutTimeLeft);
            
            if (currentWorkoutTimeLeft <= 3 && currentWorkoutTimeLeft > 0) {
                playBeep(false);
            }
        } else {
            clearInterval(workoutInterval);
            playBeep(true);
            currentTimelineIdx++;
            
            runWorkoutStep(); 
        }
    }, 1000);
}

/**
 * Hjälpfunktion inuti modulen för att mappa Beatrices ljudfiler till rätt övningsnamn
 */
/**
 * Hjälpfunktion för att mappa Beatrices ljudfiler.
 * PRIORITERAR Set 2 och Set 3 före specifika övningsnamn!
 */
/**
 * Hjälpfunktion för att mappa Beatrices ljudfiler.
 * Hanterar nu Set 1, 2 och 3 helt kraschsäkert!
 */
function playBeatriceExerciseSound(taskName, setNummer) {
    if (!taskName) return;
    const taskLower = taskName.toLowerCase();

    console.log(`[Ljudspion] playBeatriceExerciseSound tog emot -> Övning: "${taskName}", Set: ${setNummer}`);

    // === 1. KOLLA SET 2 & SET 3 (Högsta prioritet!) ===
    if (setNummer === 2) {
        console.log("[Ljudspion] Triggar ljud: 'startSet2'");
        playBeatriceSound('startSet2');
        return;
    } 
    
    if (setNummer === 3) {
        console.log("[Ljudspion] Triggar ljud: 'startSet3'");
        playBeatriceSound('startSet3');
        return;
    }

    // === 2. STANDARDLJUD (Körs för Set 1, Vila, Uppvärmning etc.) ===
    if (taskLower.includes("uppvärmning")) {
        playBeatriceSound('uppvarmning');
    } else if (taskLower.includes("nedvarvning")) {
        playBeatriceSound('nedvarvning');
    } else if (taskLower.includes("vila")) {
        playBeatriceSound('vila');
    } else {
        // === SET 1: Matcha övningens namn mer flexibelt ===
        console.log(`[Ljudspion] Försöker hitta röstspår för Set 1: "${taskLower}"`);

        if (taskLower.includes("axelpress")) {
            playBeatriceSound('axelpress');
        } else if (taskLower.includes("hantelrodd")) {
            playBeatriceSound('hantelrodd');
        } else if (taskLower.includes("biceps")) { // Matchar både "Bicepscurls" och "Bicepscurl"
            playBeatriceSound('bicepscurls');
        } else if (taskLower.includes("knäböj") || taskLower.includes("squat")) { // Matchar "Knäböj med hantel", "Goblet squat" etc.
            playBeatriceSound('knäböj');
        } else if (taskLower.includes("utfall")) {
            playBeatriceSound('utfall');
        } else if (taskLower.includes("step-up") || taskLower.includes("stepup")) {
            playBeatriceSound('stepup');
        } else if (taskLower.includes("plankan")) {
            playBeatriceSound('plankan');
        } else if (taskLower.includes("benlyft")) {
            playBeatriceSound('benlyft');
        } else if (taskLower.includes("sidoplankan")) {
            playBeatriceSound('sidoplankan');
        } else {
            // Om övningsnamnet är helt nytt eller saknar specifik fil, kör den din original-trigger:
            console.log(`[Ljudspion] Hittade ingen exakt matchning för "${taskLower}". Kör triggerExerciseAudio().`);
            if (typeof triggerExerciseAudio === 'function') {
                triggerExerciseAudio(taskName);
            } else {
                playBeatriceSound('allmanTraning');
            }
        }
    }
}

/**
 * Öppnar den anpassade popup-rutan och fyller den med övningens detaljer samt GIF
 */
export function showInstructionModal(name, desc, mediaUrl) {
    const modal = document.getElementById('instruction-modal');
    const titleEl = document.getElementById('modal-exercise-title');
    const descEl = document.getElementById('modal-exercise-desc');
    const gifEl = document.getElementById('modal-exercise-gif');

    if (modal && titleEl && descEl && gifEl) {
        titleEl.textContent = name;
        descEl.textContent = desc || "Ingen instruktion tillgänglig för tillfället. Kör så det ryker!";
        gifEl.src = mediaUrl || "";
        
        // Visa modalen på skärmen
        modal.style.display = 'flex';
    }
}

// Koppla stäng-knappen så att popupen försvinner när man klickar
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-instruction-btn');
    const modal = document.getElementById('instruction-modal');
    if (closeBtn && modal) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        // Stäng även om man klickar utanför själva rutan
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }
});

// Exponera funktionen globalt så att HTML-länkarna kan anropa den
window.showInstructionModal = showInstructionModal;

/**
 * UTANVÄNDNING / TEST: Hoppar direkt till sista setet i hela passet
 * med endast 5 sekunder kvar, så att man snabbt kan testa slutskärmen.
 */
export function devSkipToEnd() {
    // 1. Kontrollera att passet faktiskt har startat och det finns en tidslinje
    if (!currentWorkoutTimeline || currentWorkoutTimeline.length === 0) {
        alert("Du måste starta ett träningspass först innan du kan hoppa till slutet!");
        return;
    }

    console.log("[Test-Fusk] Hoppar förbi allt till sista momentet...");

    // 2. Hitta det absolut sista steget i tidslinjen (oftast nedvarvning eller sista setet)
    // Men för att testa set 3, låt oss leta efter det sista steget som har setNummer === 3, 
    // eller helt enkelt näst sista steget i listan (innan nedvarvning).
    let targetIdx = currentWorkoutTimeline.length - 1; 

    // Vi backar i tidslinjen för att hitta sista riktiga övningen (Set 3) om det finns en nedvarvning efter
    for (let i = currentWorkoutTimeline.length - 1; i >= 0; i--) {
        if (currentWorkoutTimeline[i].setNummer === 3) {
            targetIdx = i;
            break;
        }
    }

    // 3. Flytta timerns position i minnet
    currentTimelineIdx = targetIdx;
    
    // Ge det sista steget bara 5 sekunder kvar så du slipper vänta!
    currentWorkoutTimeLeft = 5; 

    // 4. Starta om timerns intervall på det här nya steget direkt
    if (workoutInterval) clearInterval(workoutInterval);
    
    // Kör igång din original-timerfunktion så att den plockar upp det nya fuskat-steget direkt
    if (typeof runWorkoutTimeline === 'function') {
        runWorkoutTimeline();
    } else if (typeof runWorkoutStep === 'function') {
        runWorkoutStep();
    }
    
    console.log(`[Test-Fusk] Justerade tidslinjen till index ${currentTimelineIdx}. 5 sekunder kvar på sista setet!`);
}

// === UPPDATERAD OCH SÄKRAD STOPPFUNKTION FÖR LÖPNING ===
window.stopRunClock = function() {
    console.log("[Beatrice Timer] stopRunClock körs. Stoppar intervallet direkt...");
    
    // 1. Stoppa klockan genom att rensa intervallet
    if (typeof timerInterval !== 'undefined') {
        clearInterval(timerInterval);
    } else if (window.timerInterval) {
        clearInterval(window.timerInterval);
    } else {
        for (let i = 1; i < 100; i++) clearInterval(i);
    }

    // 🔥 BERÄKNA HUR MÅNGA MINUTER DU SPRANG (För Personbästa & Tempo)
    if (currentRunData && currentRunData.startTime) {
        const totalaSekunder = Math.floor((Date.now() - currentRunData.startTime) / 1000);
        // Spara tiden i minuter (t.ex. 1500 sekunder blir 25 minuter)
        currentRunData.tid = totalaSekunder / 60; 
        console.log(`[Beatrice] Du sprang i ${totalaSekunder} sekunder (${currentRunData.tid.toFixed(2)} minuter).`);
    } else {
        // Reserv om timern inte startade korrekt: Sätt en rimlig standardtid (t.ex. 25 min)
        if (currentRunData) currentRunData.tid = 25;
    }

    // Spela upp avslutningsljud och dölj timer-gränssnittet
    playBeep(true);
    hidePauseButton(); 
    playBeatriceSound('avslutatPass');

    // Dölj BÅDE timer-displayen och löpnings-overlayen där stoppknappen ligger!
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) timerDisplay.style.display = 'none';

    const runOverlay = document.getElementById('run-finish-overlay');
    if (runOverlay) runOverlay.style.display = 'none';
    
    // Återställ startknappen i bakgrunden så den är redo till nästa gång
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.textContent = 'STARTA PASSET';
        startBtn.style.display = 'block';
        startBtn.disabled = false;
    }




    // 2. Öppna betygsskärmen så användaren får sätta betyg
   // Leta upp där löpningen avslutas och ratingModal öppnas i training.js
window.currentWorkoutType = 'run'; 

// 🔥 LÄGG TILL DESSA TVÅ RADER HÄR:
window.currentRunDistance = currentRunData?.dist; // Sparar t.ex. 10
window.currentRunTime = currentRunData?.tid || 25; // Sparar tiden (eller din fallback på 25)


    
    const ratingModal = document.getElementById('ratingModal');
    if (ratingModal) {
        console.log("[Beatrice Timer] Öppnar betygsskärmen för löpningspasset.");
        ratingModal.style.display = 'flex';
    } else {
        console.warn("[Beatrice Timer] Hittade inte ratingModal i HTML. Sparar automatiskt.");
        import('./history.js').then(m => m.saveAndReset('Lagom', { type: 'run', data: currentRunData }));
    }
};

    // ⏸️ Funktion för att pausa timern
export function pauseWorkout() {
    if (workoutInterval) {
        clearInterval(workoutInterval); // Stoppar klockan temporärt
        workoutInterval = null;
        
        // Uppdatera knapparna i UI
        const pauseBtn = document.getElementById('pause-btn');
        const resumeBtn = document.getElementById('resume-btn');
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (resumeBtn) resumeBtn.style.display = 'flex';
        
        console.log("[Beatrice Motor] Passet är pausat.");
    }
}

// ▶️ Funktion för att starta om timern från exakt samma sekund
export function resumeWorkout() {
    // Om passet redan körs eller tidslinjen är slut, gör inget
    if (workoutInterval || currentWorkoutTimeline.length === 0) return;
    
    // Uppdatera knapparna i UI
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    if (pauseBtn) pauseBtn.style.display = 'flex';
    if (resumeBtn) resumeBtn.style.display = 'none';
    
    // Starta om intervallet (återanvänder din existerande tick-logik)
    // OBS: Detta förutsätter att din tick-funktion heter 'workoutTick' eller körs anonymt inuti startWorkout.
    // Om du har en extern tick-funktion, anropa den här i setInterval, t.ex:
    if (typeof workoutTick === 'function') {
        workoutInterval = setInterval(workoutTick, 1000);
    } else {
        // Om logiken låg anonymt i startWorkout, återskapar vi klockan här:
        workoutInterval = setInterval(() => {
            if (currentWorkoutTimeLeft > 0) {
                currentWorkoutTimeLeft--;
                updateTimerDisplay(currentWorkoutTimeline[currentTimelineIdx], currentWorkoutTimeLeft);
            } else {
                // Gå till nästa steg i tidslinjen
                clearInterval(workoutInterval);
                workoutInterval = null;
                // Anropa din funktion som byter övning (oftast 'nextStep' eller 'nextTimelineItem')
                if (typeof nextStep === 'function') nextStep();
            }
        }, 1000);
    }
    console.log("[Beatrice Motor] Passet har återupptagits.");
}

// Gör funktionen tillgänglig för HTML-knappen
window.devSkipToEnd = devSkipToEnd;