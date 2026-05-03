// =============================================
//  AETHERMOOR — SISTEMA RICOMPENSE IA
//  Usa Google Gemini 2.5 Flash (gratuito)
//  per calcolare ricompense dinamiche
// =============================================
//
//  ISTRUZIONI PER LA API KEY:
//  1. Vai su https://aistudio.google.com
//  2. Clicca "Get API key" > "Create API key"
//  3. Incolla la chiave nella variabile sotto
//
//  NOTA: La chiave sarà visibile nel codice client.
//  Per un progetto pubblico, proteggi l'API
//  impostando restriction su Google Cloud Console
//  (limita per HTTP referrer al tuo dominio GitHub).
// =============================================

// ⚠️  SOSTITUISCI CON LA TUA API KEY GEMINI ⚠️
const GEMINI_API_KEY = "LA_TUA_GEMINI_API_KEY";
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

// Cache locale per evitare troppe chiamate API
const rewardCache = new Map();

// =============================================
//  CALCOLA EFFORT SCORE (senza IA)
//  Usato anche come fallback se IA non disponibile
// =============================================
function calculateEffortScore(combatData) {
  const {
    playerLevel,
    monsterLevel,
    turnsUsed,
    playerHpLost,
    playerMaxHp,
    mpUsed,
    playerMaxMp,
    fled,
    won,
    attemptNumber = 1,
  } = combatData;

  if (!won) return 0;

  let score = 0;

  // Differenza di livello (più il mostro era forte, più punti)
  const levelDiff = monsterLevel - playerLevel;
  score += Math.max(levelDiff * 3, 0);

  // HP persi (più fatica = più punti)
  const hpLostPct = playerHpLost / playerMaxHp;
  score += Math.floor(hpLostPct * 40);

  // MP usati (ha usato le abilità?)
  const mpUsedPct = mpUsed / playerMaxMp;
  score += Math.floor(mpUsedPct * 20);

  // Turni impiegati
  score += Math.min(turnsUsed, 30);

  // Moltiplicatore per tentativi precedenti
  const attemptMult = Math.min(1 + (attemptNumber - 1) * 0.15, 3.0);
  score = Math.floor(score * attemptMult);

  return score;
}

// =============================================
//  CHIAMA GEMINI PER COMMENTO E MOLTIPLICATORE
// =============================================
async function getAIRewardComment(combatData) {
  // Fallback se API key non impostata
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "LA_TUA_GEMINI_API_KEY") {
    return getFallbackComment(combatData);
  }

  // Cache key per evitare doppie chiamate identiche
  const cacheKey = JSON.stringify(combatData);
  if (rewardCache.has(cacheKey)) return rewardCache.get(cacheKey);

  const {
    playerLevel, monsterLevel, playerClass,
    turnsUsed, playerHpLost, playerMaxHp,
    won, fled, attemptNumber, monsterName, effortScore
  } = combatData;

  const hpLostPct = Math.round((playerHpLost / playerMaxHp) * 100);
  const levelDiff = monsterLevel - playerLevel;

  // Prompt conciso per Gemini (pochi token = meno costi)
  const prompt = `Sei il narratore di un gioco RPG fantasy italiano chiamato Aethermoor Chronicles.
Un ${playerClass} di livello ${playerLevel} ha appena ${won ? 'sconfitto' : fled ? 'fuggito da' : 'perso contro'} ${monsterName} (livello ${monsterLevel}).
Dati: differenza livello ${levelDiff > 0 ? '+'+levelDiff+' (mostro più forte)' : levelDiff+' (player più forte)'}, HP persi: ${hpLostPct}%, turni: ${turnsUsed}, tentativo #${attemptNumber}, effort score: ${effortScore}.

Scrivi UNA sola frase breve (max 20 parole) in italiano fantasy che:
- Se il player era sotto-livellato e ha vinto: celebra l'impresa epica
- Se il player era sovra-livellato e ha vinto facilmente: tono un po' ironico
- Se è scappato: tono drammatico/ironico
- Se è morto: incoraggiante

Poi su una riga separata scrivi solo il numero del moltiplicatore XP tra 0.5 e 3.0 (es: 2.1).
Non scrivere altro.`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 80,
          temperature: 0.8,
        }
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Parsa risposta: prima riga = commento, ultima riga = moltiplicatore
    const lines    = text.split('\n').filter(l => l.trim());
    const comment  = lines[0] || getFallbackComment(combatData).comment;
    const multLine = lines[lines.length - 1];
    const mult     = parseFloat(multLine) || getFallbackMultiplier(combatData);
    const clampedMult = Math.max(0.5, Math.min(3.0, mult));

    const result = { comment, multiplier: clampedMult };
    rewardCache.set(cacheKey, result);
    return result;

  } catch (err) {
    console.warn('Gemini non disponibile, uso fallback:', err.message);
    return getFallbackComment(combatData);
  }
}

// =============================================
//  FALLBACK SENZA IA
// =============================================
function getFallbackComment(combatData) {
  const { playerLevel, monsterLevel, won, fled, attemptNumber, effortScore } = combatData;
  const levelDiff = monsterLevel - playerLevel;

  if (!won && !fled) {
    const msgs = [
      "Il tuo spirito non è ancora spezzato. Alzati e riprova.",
      "La sconfitta è maestra crudele. Impara dai tuoi errori.",
      "Anche i grandi eroi sono caduti prima di trionfare."
    ];
    return { comment: msgs[Math.floor(Math.random() * msgs.length)], multiplier: 0 };
  }
  if (fled) {
    return { comment: "Una ritirata strategica... o semplice codardia?", multiplier: 0.5 };
  }
  if (levelDiff >= 20 && attemptNumber >= 3) {
    return { comment: "Impensabile. Epico. Leggendario. Il mondo di Aethermoor ti ricorderà.", multiplier: 3.0 };
  }
  if (levelDiff >= 10) {
    return { comment: "Un'impresa degna dei canti dei bardi. Il sangue versato valeva ogni goccia.", multiplier: 2.0 + levelDiff * 0.05 };
  }
  if (levelDiff <= -15) {
    return { comment: "Hai sconfitto un avversario molto più debole. Almeno era... pratica.", multiplier: 0.6 };
  }
  return { comment: "Una vittoria guadagnata con sudore e determinazione.", multiplier: 1.0 + effortScore * 0.02 };
}

function getFallbackMultiplier(combatData) {
  return getFallbackComment(combatData).multiplier;
}

// =============================================
//  CALCOLA RICOMPENSE COMPLETE
// =============================================
async function calculateRewards(combatData) {
  const effortScore   = calculateEffortScore(combatData);
  combatData.effortScore = effortScore;

  // Chiama IA per commento e moltiplicatore
  const { comment, multiplier } = await getAIRewardComment(combatData);

  // XP base
  const { playerLevel, monsterLevel, won } = combatData;
  if (!won) return { xp: 0, gold: 0, loot: [], comment, multiplier: 0, effortScore };

  const baseXp   = Math.floor((monsterLevel * 20 + (monsterLevel - playerLevel) * 30) * multiplier);
  const finalXp  = Math.max(baseXp, 5); // almeno 5 XP

  // Loot e Gold
  const loot = generateLoot(
    playerLevel, monsterLevel, true,
    effortScore, combatData.attemptNumber || 1
  );
  const gold = generateGold(playerLevel, monsterLevel, effortScore);

  return { xp: finalXp, gold, loot, comment, multiplier, effortScore };
}

window.calculateEffortScore = calculateEffortScore;
window.calculateRewards     = calculateRewards;
window.getAIRewardComment   = getAIRewardComment;
