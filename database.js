// ==========================================
// REGION: DATABAS & LOCALSTORAGE INITIERING
// ==========================================

export const STORAGE_KEY = 'beatrice_workout_data';

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

// Läs in från LocalStorage
const savedString = localStorage.getItem(STORAGE_KEY);

// Huvudobjektet som hela appen läser ifrån
export let data = savedString ? JSON.parse(savedString) : defaultData;

// 🔥 NY FUNKTION: Denna funktion tvingar en säker sparning till webbläsarens minne
export function saveDatabase() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("[Beatrice Databas] Data har sparats permanent!", data);
}

console.log("[Beatrice Databas] Initierad! Pass i minnet:", data.history ? data.history.length : 0);


// ==========================================
// REGION: TRÄNINGSPROGRAM OCH ÖVNINGAR
// ==========================================
export const programs = {
    1: { name: "ARMAR & ÖVERKROPP", list: [
        { name: "Axelpress", 
            gif: "https://i.pinimg.com/originals/c9/54/3e/c9543eaea3e7e8e928f12589a94ce8a7.gif", 
            img: "https://www.traningsplatsen.se/wp-content/uploads/2026/05/Skarmbild-2026-05-12-184203.jpg", 
            desc: "Pressa hantlarna upp mot taket." },
        { name: "Hantelrodd", 
            gif: "https://www.styrkelabbet.se/wp-content/uploads/2020/03/Dumbbell-Row.gif", 
            img: "https://www.traningsplatsen.se/wp-content/uploads/2017/03/hantelrodd-p%C3%A5-b%C3%A4nk.jpg", 
            desc: "Dra hanteln mot höften." },
        { name: "Bicepscurls", 
            gif: "https://i0.wp.com/www.styrkelabbet.se/wp-content/uploads/2020/02/Hantelcurl.gif", 
            img: "https://Friskispressen.se/wp-content/uploads/2016/09/biceps.jpg", 
            desc: "Böj armarna uppåt med hantlar." },
        { name: "Triceps Extensions", 
            gif: "https://www.styrkelabbet.se/wp-content/uploads/2020/03/Triceps-Pushdown.gif", 
            img: "https://www.styrkelabbet.se/wp-content/uploads/2016/11/tricepspress-ovanfor-huvudet.jpg", 
            desc: "Pressa hanteln bakom huvudet rakt upp." },
        { name: "Armhävningar", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUycW5icjZnaGhpOHY4YWh2Y202MXQxdW5jdzF3OWtxb25zZnBlamFlOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SuIDKBoGhJxtO7AI4K/giphy.gif", 
            img: "https://www.folkhalsan.fi/globalassets/idrott/aktiv-vardag/pauser-och-traning/armhavning-mot-vagg.jpg", 
            desc: "Sänk kroppen mot golvet och pressa upp." }
    ]},
    2: { name: "BEN & RUMPA", list: [
        { name: "Knäböj (Squats)", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUyeDRpMHhtZmd0MGtzczB1c3E5Mm1nbTByMWFhdDZ2NGFicjEwMDhmbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MvdaY668vMRXy/giphy.gif", 
            img: "https://www.styrkelabbet.se/wp-content/uploads/2016/04/knaboj.jpg", 
            desc: "Böj i knäna till 90 grader och pressa upp." },
        { name: "Utfallsteg", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUyc3h1MTI3cTJrOHBpdHlkdjh3Z2xldHByODMxM2Y4MXpkaGQ2NDMxOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3q2uBypwS76U7FTO/giphy.gif", 
            img: "https://www.styrkelabbet.se/wp-content/uploads/2016/06/utfallsteg.jpg", 
            desc: "Ta ett stort steg framåt och sjunk ner." },
        { name: "Höftlyft", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUyeGFod2Z4YmZzcnAzcHFnYzNoeTdzNGxlOXk5NnVsb3A0eDZidmxnMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7qDQ4kc0FA1O9T32/giphy.gif", 
            img: "https://www.styrkelabbet.se/wp-content/uploads/2020/06/Glute-Bridge.jpg", 
            desc: "Ligg på rygg och pressa upp höften." },
        { name: "Vadpress", 
            gif: "https://www.styrkelabbet.se/wp-content/uploads/2021/04/Vadpress-i-maskin.gif", 
            img: "https://www.styrkelabbet.se/wp-content/uploads/2019/12/Vadpress.jpg", 
            desc: "Stå på tå och sänk hälarna långsamt." },
        { name: "Plankan", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUyeXgwbjI3M28zMXR6ZHZpMDBhcWZiaDVpdmlhdG9jZjA3NGU3dzlyeiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6Zt62PeJeFUDwBUI/giphy.gif", 
            img: "https://www.styrkelabbet.se/wp-content/uploads/2016/10/plankan.jpg", 
            desc: "Håll kroppen spikrak på armbågarna." }
    ]},
    3: { name: "PASS 3: MAGE & CORE", list: [
        { name: "Crunches", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUycjQ4MTB2MDlsdWhnbWF1YTF5azh5dDVrejd4dWFpNmRvdTJqMW4ybCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/61AhU7egDNGQE/giphy.gif", 
            img: "https://www.styrkelabbet.se/wp-content/uploads/2016/03/sit-ups.jpg", 
            desc: "Rulla upp överkroppen mot knäna." },
        { name: "Ryska Twist", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUyeWZ4M21scG53MDhxaW8wdWkxbmt4dHl4MHozcXd2OXNtcXRpdDVmeCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/4a5g9vXKiXfPO/giphy.gif", 
            img: "https://www.sportamore.com/wp-content/uploads/2018/06/russian_twist_sportamore.jpg", 
            desc: "Rotera överkroppen från sida till sida." },
        { name: "Benlyft", 
            gif: "https://media.giphy.com/media/v1.Y2lkPTZjMDliOTUycGRyYzlraHBsd3g3OTR0ZXU2cGlodjNoMDl3cnU0czQwbTF1ejNqMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKSjRrf9M0M1DGM/giphy.gif", 
            img: "https://privatetrainingonline.se/wp-content/uploads/2021/11/Benlyft-Magovning-PTO-Private-Training-Online-e1710271485356.jpeg", 
            desc: "Lyft benen rakt upp." },
        { name: "Mountain Climbers", 
            gif: "https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUycDZldjR4bjhyeWJjczZraXc3dHo0dzdhbWhlMmEyZjNlMmtybDVybSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bWYc47O3jSef6/giphy.gif", 
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwqX5p9J-76M5NuORxVQUvlGj1mA-dZMJFwQ&s",
            desc: "Dra knäna mot bröstet." },
        { name: "Sidoplankan", 
            gif: "https://claratoll.se/wp-content/uploads/2016/08/output_wijTPJ.gif", 
            img: "https://fitnessfia.com/wp-content/uploads/2021/08/Sidoplanka.jpg", 
            desc: "Lyft upp höften från sidan." }
    ]}
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