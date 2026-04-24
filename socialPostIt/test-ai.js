require('dotenv').config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("❌ Errore: API Key non trovata nel file .env");
        return;
    }

    console.log("⏳ Sto contattando Google per vedere a quali modelli hai accesso...\n");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Errore API:", data.error.message);
            return;
        }

        console.log("✅ I modelli che la tua API Key può utilizzare per generare testo sono:");
        console.log("--------------------------------------------------");
        data.models.forEach(model => {
            // Filtriamo solo quelli in grado di generare testo
            if (model.supportedGenerationMethods.includes("generateContent")) {
                // Rimuove la scritta "models/" dall'inizio per darti il nome pulito
                const cleanName = model.name.replace('models/', '');
                console.log(`- ${cleanName}`);
            }
        });
        console.log("--------------------------------------------------");
        console.log("👉 COPIA uno di questi nomi e incollalo nel tuo index.js!");
        
    } catch (error) {
        console.error("❌ Errore di connessione:", error);
    }
}

checkModels();