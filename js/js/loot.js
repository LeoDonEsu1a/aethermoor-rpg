// =============================================
//  AETHERMOOR — SISTEMA LOOT
//  9 rarità, generazione procedurale, lore
// =============================================

const RARITIES = [
  { id: 'mundano',    name: 'Mundano',    color: '#888888', weight: 400, multiplier: 1.0,  loreDepth: 0 },
  { id: 'comune',     name: 'Comune',     color: '#cccccc', weight: 250, multiplier: 1.3,  loreDepth: 1 },
  { id: 'non-comune', name: 'Non Comune', color: '#4ade80', weight: 150, multiplier: 1.7,  loreDepth: 2 },
  { id: 'raro',       name: 'Raro',       color: '#60a5fa', weight: 80,  multiplier: 2.3,  loreDepth: 3 },
  { id: 'molto-raro', name: 'Molto Raro', color: '#c084fc', weight: 40,  multiplier: 3.2,  loreDepth: 4 },
  { id: 'epico',      name: 'Epico',      color: '#fb923c', weight: 20,  multiplier: 4.5,  loreDepth: 5 },
  { id: 'leggendario',name: 'Leggendario',color: '#facc15', weight: 8,   multiplier: 7.0,  loreDepth: 6 },
  { id: 'artefatto',  name: 'Artefatto',  color: '#f87171', weight: 3,   multiplier: 12.0, loreDepth: 7 },
  { id: 'unico',      name: 'Unico',      color: '#e879f9', weight: 1,   multiplier: 20.0, loreDepth: 8 },
];

const ITEM_TYPES = {
  spada:     { icon: '⚔️',  statMain: 'attackPower', statSecondary: 'forza',       base: 10, category: 'weapon' },
  ascia:     { icon: '🪓',  statMain: 'attackPower', statSecondary: 'costituzione', base: 12, category: 'weapon' },
  pugnale:   { icon: '🗡️',  statMain: 'attackPower', statSecondary: 'destrezza',   base: 8,  category: 'weapon' },
  bastone:   { icon: '🪄',  statMain: 'spellPower',  statSecondary: 'intelligenza', base: 9,  category: 'weapon' },
  libro:     { icon: '📖',  statMain: 'spellPower',  statSecondary: 'saggezza',     base: 8,  category: 'weapon' },
  arco:      { icon: '🏹',  statMain: 'attackPower', statSecondary: 'destrezza',    base: 9,  category: 'weapon' },
  scudo:     { icon: '🛡️',  statMain: 'difesa',      statSecondary: 'costituzione', base: 8,  category: 'armor'  },
  corazza:   { icon: '🥋',  statMain: 'difesa',      statSecondary: 'costituzione', base: 12, category: 'armor'  },
  veste:     { icon: '👘',  statMain: 'spellPower',  statSecondary: 'intelligenza', base: 6,  category: 'armor'  },
  elmo:      { icon: '⛑️',  statMain: 'difesa',      statSecondary: 'saggezza',     base: 7,  category: 'armor'  },
  anello:    { icon: '💍',  statMain: 'critChance',  statSecondary: 'destrezza',    base: 3,  category: 'accessory'},
  amuleto:   { icon: '📿',  statMain: 'maxHp',       statSecondary: 'costituzione', base: 50, category: 'accessory'},
  pozione:   { icon: '🧪',  statMain: 'hp',          statSecondary: null,           base: 50, category: 'consumable'},
  elisir:    { icon: '💊',  statMain: 'mp',          statSecondary: null,           base: 40, category: 'consumable'},
};

// ---- Prefissi aggettivali per nome arma per rarità ----
const NAME_PARTS = {
  prefixes: {
    mundano:     ['Logoro', 'Consumato', 'Arrugginito', 'Scheggiato'],
    comune:      ['Solido', 'Semplice', 'Grezzo', 'Robusto'],
    'non-comune':['Affinato', 'Forgiato', 'Preciso', 'Rinforzato'],
    raro:        ['Antico', 'Magistrale', 'Venerato', 'Incantato'],
    'molto-raro':['Mitico', 'Benedetto', 'Arcano', 'Scelto'],
    epico:       ['Glorioso', 'Leggendario', 'Supremo', 'Titano'],
    leggendario: ['Eterno', 'Divino', 'Cosmico', 'Primordiale'],
    artefatto:   ['Proibito', 'Assoluto', 'Transcendente', 'Vuoto'],
    unico:       [''],
  },
  names: {
    mundano:     ['Coltello', 'Bastone', 'Cintura', 'Gilet'],
    comune:      ['Lama', 'Scettro', 'Mantello', 'Cintura di Cuoio'],
    'non-comune':['Fauci', 'Verga', 'Protezione', 'Giubbotto'],
    raro:        ['Zanna', 'Fulmine', 'Baluardo', 'Egida'],
    'molto-raro':['Artiglio', 'Vento', 'Bastione', 'Cuore'],
    epico:       ['Cataclisma', 'Tempesta', 'Abisso', 'Eternità'],
    leggendario: ['del Creatore', 'della Fine', "dell'Aurora", 'del Vuoto'],
    artefatto:   ['Proibita', 'dell\'Oblio', 'dell\'Esistenza', 'del Tempo'],
    unico:       ['Onnipotente'],
  },
};

// ---- Testi di lore per rarità (base) ----
const LORE_TEMPLATES = {
  mundano:     () => `Un oggetto ordinario senza storia degna di nota.`,
  comune:      (type, rng) => `Un ${type} prodotto da un artigiano locale. Funzionale, niente di più.`,
  'non-comune':(type, rng) => {
    const origins = ['nanico','elfico','umano antico'];
    return `Di fattura ${rand(origins)}, questo ${type} mostra segni di cura nella lavorazione. Qualcuno lo apprezzava.`;
  },
  raro:        (type, rng) => {
    const tales = [
      `Si dice che appartenesse a un soldato sopravvissuto alla Guerra delle Ceneri.`,
      `Trovato nelle rovine di una fortezza sepolta sotto l'Aethermoor.`,
      `Un mercante lo vendette per sopravvivere — non raccontò mai da dove veniva.`
    ];
    return rand(tales);
  },
  'molto-raro':(type, rng) => {
    const tales = [
      `Forgiato da un maestro il cui nome è stato cancellato dalla storia. Solo quest'opera rimane.`,
      `Passato di mano in mano tra cinque eroi — ognuno di loro morì portando con sé un segreto.`,
      `Le rune incise sulla superficie cambiano disposizione ad ogni luna nuova.`
    ];
    return rand(tales);
  },
  epico:       (type, rng) => {
    const tales = [
      `Tremila anni fa, un dio della guerra gettò quest'arma sulla terra. Da allora, cerca ancora un degno portatore.`,
      `Chi la stringe sente voci antiche — promesse di potere in lingue dimenticate.`,
      `La pergamena ritrovata accanto ad essa recita: "Chiunque la sollevi, solleva anche il suo destino".`
    ];
    return rand(tales);
  },
  leggendario: (type, rng) => {
    const tales = [
      `Quando l'Arcanomante Velareth morì, il suo potere si fuse con quest'arma. Ora sogna dentro di essa, aspettando.`,
      `Nelle cronache di Aethermoor è chiamata semplicemente "la Scelta". Non esiste una seconda.`,
      `Il cielo si oscurò il giorno in cui fu forgiata. Il fabbro divenne cenere appena la lasciò andare.`
    ];
    return rand(tales);
  },
  artefatto:   (type, rng) => {
    const tales = [
      `Non fu creata da mani mortali. Emerse dal nucleo del cristallo primordiale quando il mondo fu spezzato in tre.`,
      `Il Conclave l'ha cercata per secoli. Non sanno — o non vogliono sapere — cosa succederebbe se la trovassero davvero.`,
      `Le stelle si allineano diversamente quando è vicina. I maghi dicono che sia lei a muoverle.`
    ];
    return rand(tales);
  },
  unico:       (type, rng) => `Nessuno sa dove finisce l'arma e dove inizia il portatore. Sono diventati la stessa cosa.`,
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// =============================================
//  SELEZIONA RARITÀ in base a moltiplicatori
// =============================================
function rollRarity(playerLevel, monsterLevel, attemptCount = 1) {
  // Bonus rarità se il mostro era molto più forte del player
  const diffBonus = Math.max(0, monsterLevel - playerLevel);
  const effortBonus = Math.min(attemptCount * 0.5, 30); // max +30 al peso
  
  const weights = RARITIES.map((r, i) => {
    let w = r.weight;
    // Spostamento verso rarità più alte
    if (i >= 3) w += diffBonus * 2 + effortBonus;
    return Math.max(w, 0.1);
  });
  
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  
  for (let i = 0; i < RARITIES.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return RARITIES[i];
  }
  return RARITIES[0];
}

// =============================================
//  GENERA UN ITEM
// =============================================
function generateItem(playerLevel, monsterLevel, forcedRarity = null, attemptCount = 1) {
  const rarity = forcedRarity
    ? RARITIES.find(r => r.id === forcedRarity) || rollRarity(playerLevel, monsterLevel, attemptCount)
    : rollRarity(playerLevel, monsterLevel, attemptCount);

  // Scegli tipo
  const typeKeys = Object.keys(ITEM_TYPES);
  const typeKey  = rand(typeKeys);
  const type     = ITEM_TYPES[typeKey];

  // Nome
  const prefixArr = NAME_PARTS.prefixes[rarity.id] || NAME_PARTS.prefixes.comune;
  const nameArr   = NAME_PARTS.names[rarity.id]    || NAME_PARTS.names.comune;
  const prefix    = rand(prefixArr);
  const namePart  = rand(nameArr);
  const itemTypeName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
  const name = rarity.id === 'unico'
    ? `${namePart} ${itemTypeName}`
    : `${prefix} ${itemTypeName} ${namePart}`.trim();

  // Statistiche scalate
  const levelScale = 1 + playerLevel * 0.08;
  const rarityMult = rarity.multiplier;
  const baseVal    = Math.floor(type.base * levelScale * rarityMult);

  const stats = {};
  stats[type.statMain] = baseVal;
  if (type.statSecondary) {
    stats[type.statSecondary] = Math.floor(baseVal * 0.4);
  }

  // Bonus secondari per rarità alta
  if (rarity.loreDepth >= 3) {
    const bonusStats = ['attackPower','spellPower','difesa','maxHp','critChance'];
    const bonusStat  = rand(bonusStats);
    if (!stats[bonusStat]) {
      stats[bonusStat] = Math.floor(baseVal * 0.25 * (rarity.loreDepth - 2));
    }
  }

  // Lore
  const loreGen = LORE_TEMPLATES[rarity.id];
  const lore = typeof loreGen === 'function' ? loreGen(typeKey) : loreGen;

  return {
    id: `item_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    name,
    type: typeKey,
    category: type.category,
    icon: type.icon,
    rarity: rarity.id,
    rarityName: rarity.name,
    rarityColor: rarity.color,
    stats,
    lore,
    level: playerLevel,
  };
}

// =============================================
//  GENERA LOOT DA UN COMBATTIMENTO
// =============================================
function generateLoot(playerLevel, monsterLevel, monsterDead, effortScore, attemptCount = 1) {
  if (!monsterDead) return [];

  const loot = [];
  const diff = monsterLevel - playerLevel;

  // Numero di item
  let itemCount = 1;
  if (diff >= 10) itemCount = 2;
  if (diff >= 20) itemCount = 3;
  if (effortScore > 5) itemCount += 1;

  for (let i = 0; i < itemCount; i++) {
    loot.push(generateItem(playerLevel, monsterLevel, null, attemptCount));
  }

  // Chance extra item raro se player era molto sotto-livellato
  if (diff >= 15 && Math.random() < 0.4) {
    const rarities = diff >= 30 ? 'epico' : 'raro';
    loot.push(generateItem(playerLevel, monsterLevel, rarities, attemptCount));
  }

  return loot;
}

// =============================================
//  GOLD DA COMBATTIMENTO
// =============================================
function generateGold(playerLevel, monsterLevel, effortScore) {
  const base = monsterLevel * 5 + playerLevel * 2;
  const bonus = Math.min(effortScore * 10, 200);
  return Math.floor(base + bonus + Math.random() * base * 0.3);
}

window.RARITIES = RARITIES;
window.ITEM_TYPES = ITEM_TYPES;
window.generateItem = generateItem;
window.generateLoot = generateLoot;
window.generateGold = generateGold;
window.rollRarity   = rollRarity;
