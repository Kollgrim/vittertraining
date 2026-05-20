// ==========================================
// REGION: LJUDMOTOR & BEATRICE TTS (ES Module)
// ==========================================

// Importera det globala dataobjektet ifall det behövs för inställningar framöver
import { data, programs } from './database.js'; // Ändrat till litet d

// Klistra in din API-nyckel från Deepgram här:
const DEEPGRAM_KEY = "5743beabb134aee060050fd2780eafacebe975eb"; 

/**
 * Generisk beep-funktion för nedräkningar under sekunder
 * @param {boolean} isFinal - Om true spelas en högre ton för att markera start/slut
 */
export function playBeep(isFinal = false) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(isFinal ? 1200 : 800, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) { 
        console.log("Ljud kunde inte spelas upp:", e); 
    }
}

/**
 * DEEPGRAM AURA TTS (MÄNSKLIG AI-RÖST - SVENSKA)
 * Skickar text till Deepgrams röstsyntes och spelar upp den
 * @param {string} text - Texten Beatrice ska läsa upp
 */
export async function speak(text) {
    try {
        // Om du inte lagt in nyckeln än, kör vi robot-backupen direkt
        if (!DEEPGRAM_KEY || DEEPGRAM_KEY.includes("DIN_DEEPGRAM")) {
            fallbackSpeak(text);
            return;
        }

        // Vi använder Deepgrams Aura-motor
        const model = "aura-2-athena-en//";
        const apiUrl = `https://api.deepgram.com/v1/speak?model=${model}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Token ${DEEPGRAM_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error(`Deepgram API fel: ${response.status}`);
        }

        // Ta emot ljudet som en blob (rå ljudfil)
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Spela upp Beatrices nya, mänskliga röst!
        const audio = new Audio(audioUrl);
        await audio.play();
        console.log("Beatrice talar via Deepgram Aura!");

    } catch (e) {
        console.error("Deepgram misslyckades, kör reservröst:", e);
        fallbackSpeak(text); // Om potten tar slut eller internet dippar
    }
}

/**
 * Intern reservröst (offline-robot) via webbläsarens inbyggda SpeechSynthesis
 * @param {string} text 
 */
function fallbackSpeak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE';
        window.speechSynthesis.speak(u);
    }
}

// ==========================================
// REGION: BEATRICE LJUD-BIBLIOTEK (Lokala filer)
// ==========================================
export const beatriceAudio = {
    // Array med dina kaxiga ljudfiler när vilan börjar
    vila: [
        "ljud/vila_v1.mp3",
        "ljud/vila_v2.mp3",
        "ljud/vila_v3.mp3",
        "ljud/vila_v4.mp3",
        "ljud/vila_v5.mp3",
        "ljud/vila_v6.mp3",
        "ljud/vila_v7.mp3",
        "ljud/vila_v8.mp3"
    ],
    // Ljudfil när vilan är helt slut
    vilaSlut: [
        "ljud/vila_slut.mp3"
    ],
    // Slutbetyg när passet sparas
    avslutatPass: [
        "ljud/avslutatPass_v1.mp3",
        "ljud/avslutatPass_v2.mp3",
        "ljud/avslutatPass_v3.mp3",
        "ljud/avslutatPass_v4.mp3",
        "ljud/avslutatPass_v5.mp3",
        "ljud/avslutatPass_v6.mp3",
    ],
    nyttPB: [
        "ljud/nyttPB_v1.mp3",
        "ljud/nyttPB_v2.mp3"
    ],
    startSet2: [
        "ljud/startSet2_v1.mp3",
        "ljud/startSet2_v2.mp3",
        "ljud/startSet2_v3.mp3",
        "ljud/startSet2_v4.mp3",
        "ljud/startSet2_v5.mp3",
        "ljud/startSet2_v6.mp3"
    ],
    startSet3: [
        "ljud/startSet3_v1.mp3",
        "ljud/startSet3_v2.mp3",
        "ljud/startSet3_v3.mp3",
        "ljud/startSet3_v4.mp3",
        "ljud/startSet3_v5.mp3",
        "ljud/startSet3_v6.mp3",
        "ljud/startSet3_v7.mp3",
        "ljud/startSet3_v8.mp3",
        "ljud/startSet3_v9.mp3",
        "ljud/startSet3_v10.mp3",
        "ljud/startSet3_v11.mp3",
        "ljud/startSet3_v12.mp3"
    ],
    bravo: [
        "ljud/bravo_v1.mp3",
        "ljud/bravo_v2.mp3",
        "ljud/bravo_v3.mp3",
        "ljud/bravo_v4.mp3",
    ],
    start5km: [
        "ljud/start_5km.mp3"
    ],
    start10km: [
        "ljud/start_10km.mp3"
    ],
    löp: [
        "ljud/löp_v1.mp3",
        "ljud/löp_v2.mp3"
    ],
    startTräning: [
        "ljud/start_träning_v1.mp3",
        "ljud/start_träning_v2.mp3"
    ],
    slutPaus: [
        "ljud/Slut_paus_v1.mp3"
    ],

    // Övningar
    axelpress: [
        "ljud/axelpress_v1.mp3",
        "ljud/axelpress_v2.mp3"
    ],
    hantelrodd: [
        "ljud/hantelrodd_v1.mp3",
        "ljud/hantelrodd_v2.mp3"
    ],
    bicepscurls: [
        "ljud/bicepscurls_v1.mp3",
        "ljud/bicepscurls_v2.mp3"
    ],
    tricepspress: [
        "ljud/tricepspress_v1.mp3",
        "ljud/tricepspress_v2.mp3"
    ],
    sidolyft: [
        "ljud/sidolyft_v1.mp3",
        "ljud/sidolyft_v2.mp3"
    ],
    knäböj: [
        "ljud/knäböj_v1.mp3",
        "ljud/knäböj_v2.mp3"
    ],
    utfallssteg: [
        "ljud/utfallssteg_v1.mp3",
        "ljud/utfallssteg_v2.mp3"
    ],
    rakaMarklyft: [
        "ljud/rakaMarklyft_v1.mp3",
        "ljud/rakaMarklyft_v2.mp3"
    ],
    gobletSquat: [
        "ljud/gobletSquat_v1.mp3",
        "ljud/gobletSquat_v2.mp3"
    ],
    stepUps: [
        "ljud/stepUps_v1.mp3",
        "ljud/stepUps_v2.mp3"
    ],
    plankan: [
        "ljud/plankan_v1.mp3",
        "ljud/plankan_v2.mp3"
    ],
    russianTwist: [
        "ljud/russianTwist_v1.mp3",
        "ljud/russianTwist_v2.mp3"
    ],
    benlyft: [
        "ljud/benlyft_v1.mp3",
        "ljud/benlyft_v2.mp3"
    ],
    mountainClimbers: [
        "ljud/mountainClimbers_v1.mp3",
        "ljud/mountainClimbers_v2.mp3"
    ],
    sidoplankan: [
        "ljud/sidoplankan_v1.mp3",
        "ljud/sidoplankan_v2.mp3"
    ],

    // LJUDEFFEKTER
    apploder: [
        "ljud/apploder_v1.mp3",
        "ljud/apploder_v2.mp3"
    ],
    allmanTraning: [
       // Eventuella generella ljudfiler kan placeras här
    ]
};

/**
 * Hjälpfunktion för att spela upp ljud slumpmässigt baserat på en kategori
 * @param {string} category - Kategorinamn som matchar nycklarna i beatriceAudio
 */
export function playBeatriceSound(category) {
    const tracks = beatriceAudio[category];
    if (!tracks || tracks.length === 0) return;

    // Slumpa fram ett spår om det finns flera i listan
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const chosenTrack = tracks[randomIndex];

    // Skapa och spela ljudet
    const audio = new Audio(chosenTrack);
    audio.volume = 0.8; // Volym mellan 0.0 och 1.0
    
    audio.play().catch(error => {
        // Webbläsare blockerar ibland ljud om användaren inte klickat på skärmen än
        console.log("Ljudet kunde inte spelas automatiskt:", error);
    });
}

