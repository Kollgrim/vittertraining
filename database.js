// ==========================================
// REGION: DATABAS & LOCALSTORAGE INITIERING
// ==========================================

// ==========================================\
// REGION: DATABAS & SUPABASE INITIERING
// ==========================================\

// 1. Ange dina unika Supabase-uppgifter här:
const SUPABASE_URL = "https://zvmtksfuswcwubhllsip.supabase.co";
const SUPABASE_KEY = "sb_publishable_F99fBGTSulWP1OleIxe9gg_qSBgcVeO";

export const STORAGE_KEY = 'beatrice_workout_data';
export const USER_ID_KEY = 'beatrice_user_uuid';

const defaultData = {
    history: [],
    badges: {},
    achievements: {},
    streak: 0,
    health: 100,
    pb: { "5": null, "10": null },
    seconds: 10,
    sets: 3
};

// Skapa ett unikt Användar-ID (UUID v4) om det inte finns sedan tidigare
function getOrCreateUserID() {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
        // Enkel generator för ett slumpmässigt UUID på klienten
        userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem(USER_ID_KEY, userId);
        console.log("[Beatrice] Nytt unikt Användar-ID skapat i molnet:", userId);
    }
    return userId;
}

export const USER_ID = getOrCreateUserID();

// Starta med lokalt minne först för blixtsnabb laddning
const savedString = localStorage.getItem(STORAGE_KEY);
export let data = savedString ? JSON.parse(savedString) : defaultData;

/**
 * LÄSER IN DATA FRÅN MOLNET
 * Körs när appen startar för att se till att vi har färsk data
 */
export async function loadDatabaseFromCloud() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/beatrice_users?user_id=eq.${USER_ID}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error("Kunde inte hämta data från Supabase");
        
        const result = await response.json();
        
        if (result && result.length > 0) {
            // Molnet hade sparad data! Uppdatera appen och lokala minnet
            data = result[0].workout_data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log("[Beatrice Databas] Molndata hämtad och synkad!", data);
            return true;
        } else {
            console.log("[Beatrice Databas] Ingen tidigare molndata hittades för denna användare. Sparar standarddata.");
            await saveDatabase(); // Skapa första raden i molnet direkt
            return false;
        }
    } catch (error) {
        console.error("[Beatrice Databas] Fel vid molnladdning (kör på lokalt minne):", error);
        return false;
    }
}

/**
 * SPARAR DATA TILL BÅDE LOCALSTORAGE OCH MOLNET
 */
export async function saveDatabase() {
    // 1. Spara lokalt direkt för direkt respons i UI
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("[Beatrice Databas] Data sparad lokalt.", data);

    // 2. Skicka asynkront upp till Supabase-molnet (Upsert = Skapa eller Uppdatera)
    try {
        const payload = {
            user_id: USER_ID,
            workout_data: data,
            updated_at: new Date().toISOString()
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/beatrice_users`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates' // Gör att det blir en "upsert" (skriv över om ID matchar)
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Supabase nekade sparningen");
        console.log("[Beatrice Databas] 🔥 Molnsynkning lyckades skottsäkert!");
    } catch (error) {
        console.error("[Beatrice Databas] ❌ Kunde inte synka till molnet just nu (sparas lokalt så länge):", error);
    }
}

console.log("[Beatrice Databas] Initierad med Användar-ID:", USER_ID);


// ==========================================
// REGION: TRÄNINGSPROGRAM OCH ÖVNINGAR
// ==========================================
export const programs = {
    1: { name: "ARMAR & ÖVERKROPP", list: [
        { name: "Axelpress", 
            gif: "https://i.pinimg.com/originals/c9/54/3e/c9543eaea3e7e8e928f12589a94ce8a7.gif", 
            img: "bild/Axelpress.png", 
            desc: "Pressa hantlarna upp mot taket." },
        { name: "Hantelrodd", 
            gif: "https://www.styrkelabbet.se/wp-content/uploads/2020/03/Dumbbell-Row.gif", 
            img: "bild/Hantelrodd.png",
            desc: "Dra hanteln mot höften." },
        { name: "Bicepscurls", 
            gif: "https://i0.wp.com/www.styrkelabbet.se/wp-content/uploads/2020/02/Hantelcurl.gif", 
            img: "bild/Bicepscurls.png", 
            desc: "Böj armarna uppåt med hantlar." },
        { name: "Triceps Extensions", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flegionathletics.com%2Fwp-content%2Fuploads%2F2024%2F07%2FOverhead-Triceps-Extension-gif.gif&f=1&nofb=1&ipt=d8a857010c44ba250098fce3d1093dfd670832b72d8ac5a47f9b90694f08187c",
            img: "bild/Axelpress.png", 
            desc: "Pressa hanteln bakom huvudet rakt upp." },
        { name: "Armhävningar", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi0.wp.com%2Fimages-prod.healthline.com%2Fhlcmsresource%2Fimages%2Ftopic_centers%2FFitness-Exercise%2F400x400_What_Muscles_Do_Pushups_Work_Standard_Pushup.gif%3Fw%3D1155%26h%3D840&f=1&nofb=1&ipt=0b1102349ae2400e435c52a596ac1842c88f4d5f6893c7e53fb1b858230dd4a3",
            img: "bild/Armhävningar.png", 
            desc: "Sänk kroppen mot golvet och pressa upp." },
        { name: "Sidolyft", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.styrkelabbet.se%2Fwp-content%2Fuploads%2F2020%2F02%2FSidolyft-med-hantlar.gif&f=1&nofb=1&ipt=bde6df5a6dcfb5e4c739f6bfe5f44ee8a823bf8d0b7337b2d096b2e26eed1688",
            img: "bild/Sidolyft.png", 
            desc: "Lyft hantlarna ut åt sidorna." }    
    ]},
    2: { name: "BEN & RUMPA", list: [
        { name: "Knäböj (Squats)", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.styrkelabbet.se%2Fwp-content%2Fuploads%2F2020%2F02%2FAir-squat.gif&f=1&nofb=1&ipt=eab8c6201edde8c692fe9e64d54d93677bf37ab2578d5873e978019ea56d7159", 
            img: "bild/Knäböj (Squats).png", 
            desc: "Böj i knäna till 90 grader och pressa upp." },
        { name: "Utfallsteg", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.styrkelabbet.se%2Fwp-content%2Fuploads%2F2023%2F03%2Fgrunda-utfall.gif&f=1&nofb=1&ipt=793ce5ee84091e4e8a7a2b2d76ca37be788b3f32585282c5fb5ab2165843ef0f", 
            img: "bild/Utfallsteg.png", 
            desc: "Ta ett stort steg framåt och sjunk ner." },
        { name: "Höftlyft", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia1.giphy.com%2Fmedia%2FxT0GqdyS7Ba0pTiKDm%2Fgiphy.gif&f=1&nofb=1&ipt=f825ccd635a17d94b033a28627e539c552dd43bbc62fd3cc4ca9c4727139f14e", 
            img: "bild/Höftlyft.png",  
            desc: "Ligg på rygg och pressa upp höften." },
        { name: "Vadpress", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.styrkelabbet.se%2Fwp-content%2Fuploads%2F2020%2F03%2Fcalf-raise-standing.gif&f=1&nofb=1&ipt=e7ffb92ff29a29b390666ae9fe8e9b3db3ea09ed069cb65f36f872f42bb72e0f", 
            img: "bild/Vadpress.png", 
            desc: "Stå på tå och sänk hälarna långsamt." },
        { name: "Raka Marklyft", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.styrkelabbet.se%2Fwp-content%2Fuploads%2F2020%2F02%2FRack-pull.gif&f=1&nofb=1&ipt=8e48151abe784ba8a8460fd4628c7734c23bfdde877b012743bf82aab94333b6", 
            img: "bild/Raka Marklyft.png", 
            desc: "Fäll i höften med rak rygg." },
        { name: "Goblet Squat", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F63%2Fbe%2F5f%2F63be5f70cad75c78074a6201a854030c.gif&f=1&nofb=1&ipt=75006c61850e775da50d69e978c614ec9087f728ad376ffb5271228b17aa34ae", 
            img: "bild/Goblet Squats.png", 
            desc: "Djup knäböj med hantel." },
        { name: "Step-ups", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fhips.hearstapps.com%2Fhmg-prod%2Fimages%2Fworkouts%2F2016%2F03%2Fstepup-1457044957.gif&f=1&nofb=1&ipt=01bbe4574f5cc4eac60c43ba1167728d21685965dcd9c2cebd36986a8846903e", 
            img: "bild/Step-ups.png", 
            desc: "Kliv upp på en bänk." }            
    ]},
    3: { name: "PASS 3: MAGE & CORE", list: [
        { name: "Plankan", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.mgdk.dk%2Fwp-content%2Fuploads%2Fsites%2F2%2F2025%2F09%2FShutterstock_2453890237-1024x532.jpg&f=1&nofb=1&ipt=cde59f26772ed64b1013dc63a46f280b325e70251e3c97e7fb46c539a249dd36", 
            img: "bild/Plankan.png", 
            desc: "Håll kroppen spikrak på armbågarna." },
        { name: "Crunches", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgifdb.com%2Fimages%2Fhigh%2Fman-unshirt-doing-crunches-exercise-pkehwdu3gbtcxc72.gif&f=1&nofb=1&ipt=ce6d1f666b41c57f6e74aad6d65d809dcce675c9915f63057910df63ca9e56d1", 
            img: "bild/Crunches.png",  
            desc: "Rulla upp överkroppen mot knäna." },
        { name: "Ryska Twist", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpost.healthline.com%2Fwp-content%2Fuploads%2F2019%2F10%2F400x400_Davis_Medicine_Ball_Moves_Russian_Twists.gif&f=1&nofb=1&ipt=f5564998d009b0643f8d0d18be7df2c6d64bced32adf20ce17806bfca407d1c9", 
            img: "bild/Ryska Twist.png", 
            desc: "Rotera överkroppen från sida till sida." },
        { name: "Benlyft", 
            gif: 
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.styrkelabbet.se%2Fwp-content%2Fuploads%2F2020%2F10%2Fliggande-benlyft.gif&f=1&nofb=1&ipt=081d9f06f1538df74654d487287aeae68abd716913322c2c72c7ab26e92c6183", 
            img: "bild/Benlyft.png",  
            desc: "Lyft benen rakt upp." },
        { name: "Mountain Climbers", 
            gif: "https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUycDZldjR4bjhyeWJjczZraXc3dHo0dzdhbWhlMmEyZjNlMmtybDVybSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bWYc47O3jSef6/giphy.gif", 
            img: "bild/Mountain Climbers.png", 
            desc: "Dra knäna mot bröstet." },
        { name: "Sidoplankan", 
            gif: "https://claratoll.se/wp-content/uploads/2016/08/output_wijTPJ.gif", 
            img: "bild/Sidoplankan.png",  
            desc: "Lyft upp höften från sidan." }
    ]},
    
   
    4: { name: "MIXAT", list: [] } 
};


// ==========================================
// REGION: UTSTÄMPLING & ACHIEVEMENTS (ES Module)
// ==========================================

/**
 * Renderar ut alla prestationer på Prestationsskärmen (Profilsidan) i appen.
 */
export function renderAchievements() {
    const container = document.getElementById('achievements-container') || document.getElementById('badges-grid');
    if (!container) return;

    container.innerHTML = '';

    const activeData = data;

    achievementRules.forEach(badge => {
        // Kontrollera om den är sparad i databasen
        const savedBadge = activeData.achievements ? activeData.achievements[badge.id] : null;
        const isUnlocked = savedBadge && (savedBadge.unlocked || savedBadge === true);

        let datumText = `<div style="margin-top: 5px; color: rgba(255,255,255,0.3); font-size: 11px;">🔒 Låst</div>`;
        if (isUnlocked) {
            const sparatDatum = savedBadge.date || new Date().toLocaleDateString('sv-SE');
            datumText = `<div style="margin-top: 5px; color: #2ecc71; font-size: 11px; font-weight: 600;">✨ Avklarad ${sparatDatum}</div>`;
        }

        const opacity = isUnlocked ? '1' : '0.25';
        const filter = isUnlocked ? 'none' : 'grayscale(100%)';
        const border = isUnlocked ? '1px solid rgba(255, 0, 212, 0.4)' : '1px solid rgba(255,255,255,0.05)';
        const bg = isUnlocked ? 'rgba(255, 0, 212, 0.03)' : 'rgba(255, 255, 255, 0.01)';

        container.innerHTML += `
            <div id="${badge.id}" style="background: ${bg}; border: ${border}; border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 15px; text-align: left; opacity: ${opacity}; filter: ${filter}; transition: all 0.3s ease;">
                <div style="font-size: 38px; flex-shrink: 0;">${badge.icon}</div>
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 15px; font-weight: 600;">${badge.title}</h3>
                    <p style="margin: 2px 0 0 0; color: rgba(255,255,255,0.6); font-size: 12px; line-height: 1.3;">${badge.desc}</p>
                    ${datumText}
                </div>
            </div>
        `;
    });
}

// Gör funktionen tillgänglig globalt i window utifall din HTML anropar den direkt via flikar
window.renderAchievements = renderAchievements;