// =============================================
//  AETHERMOOR — MOTORE DI GIOCO PRINCIPALE
//  Gestisce: stato gioco, combattimento, UI
// =============================================

// =============================================
//  STATO GLOBALE
// =============================================
let GAME = {
  player: null,
  currentEnemy: null,
  currentCombat: null,
  zone: 0,
  dungeons: [],
  inCombat: false,
  combatTurn: 0,
  cooldowns: {},
  buffs: [],
  dots: [],
  enemyDots: [],
  enemySummons: [],
  playerHasResurrection: false,
  resurrectionUsed: false,
  attemptCounter: {},  // traccia tentativi per ogni nemico
};

// =============================================
//  NEMICI
// =============================================
const ENEMIES = [
  // Zona 1: Pianure d'Aether (Lv 1-15)
  { id:'slime',    name:'Slime Verde',    sprite:'slime',   level:1,  type:'beast',  hp:30,  atk:5,  def:2, xpMult:1.0 },
  { id:'goblin',   name:'Goblin',         sprite:'goblin',  level:3,  type:'humanoid',hp:50, atk:8,  def:4, xpMult:1.1 },
  { id:'bandito',  name:'Bandito',        sprite:'bandito', level:6,  type:'humanoid',hp:80, atk:12, def:6, xpMult:1.2 },
  { id:'scheletro',name:'Scheletro',      sprite:'scheletro',level:9, type:'undead', hp:70,  atk:14, def:5, xpMult:1.3 },
  // Zona 2: Foresta Maledetta (Lv 10-30)
  { id:'troll',    name:'Troll della Foresta',sprite:'troll',level:15,type:'beast',  hp:200, atk:22, def:14, xpMult:1.5 },
  { id:'lich_min', name:'Lich Minore',    sprite:'lich',    level:25, type:'undead', hp:180, atk:30, def:10, xpMult:1.8 },
  // Zona 3: Rovine dell'Abisso (Lv 30-70)
  { id:'drago_min',name:'Drago Giovane',  sprite:'drago',   level:40, type:'dragon', hp:500, atk:45, def:25, xpMult:2.0 },
  { id:'boss1',    name:'Il Cercatore',   sprite:'boss',    level:50, type:'boss',   hp:800, atk:60, def:30, xpMult:3.0 },
  // Boss di fine zona
  { id:'drago_anc',name:'Drago Antico',   sprite:'drago',   level:100,type:'dragon', hp:5000,atk:150,def:80, xpMult:5.0 },
  { id:'lich_re',  name:'Lich Re',        sprite:'lich',    level:200,type:'undead', hp:15000,atk:350,def:150,xpMult:8.0 },
];

// =============================================
//  DUNGEON
// =============================================
const DUNGEONS = [
  { id:'cripta',  name:'Cripta Dimenticata',  desc:'Scheletri e non-morti infestano queste rovine antiche.',  minLevel:1,  maxLevel:20,  enemies:['slime','goblin','scheletro','lich_min'], rooms:5 },
  { id:'foresta', name:'Foresta Maledetta',   desc:'Gli alberi sussurrano nomi di morti. Il buio si muove.', minLevel:10, maxLevel:40,  enemies:['goblin','troll','bandito','lich_min'],   rooms:7 },
  { id:'abisso',  name:'Rovine dell\'Abisso', desc:'Dove un dio cadde. Il potere residuo è palpabile.',      minLevel:30, maxLevel:100, enemies:['troll','drago_min','boss1'],             rooms:10 },
  { id:'torre',   name:'Torre dell\'Eterno',  desc:'Si dice che in cima si trovi un portale verso il vuoto.', minLevel:80, maxLevel:200, enemies:['drago_min','boss1','drago_anc'],         rooms:12 },
  { id:'abisso2', name:'Abisso Profondo',     desc:'Nessuno è tornato. Eppure qualcosa chiama.',             minLevel:150,maxLevel:300, enemies:['boss1','drago_anc','lich_re'],            rooms:15 },
];

// =============================================
//  HELPER UI
// =============================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');

  // Azioni speciali per schermata
  if (id === 'screen-newgame') renderClassGrid();
  if (id === 'screen-leaderboard') renderLeaderboard();
  if (id === 'screen-dungeon') renderDungeonList();
}

function toast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.add('hidden'), duration);
}

function addLog(msg, type = 'system') {
  const log = document.getElementById('combat-log');
  if (!log) return;
  const el = document.createElement('p');
  el.className = `log-entry ${type}`;
  el.textContent = msg;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function setLoading(visible, text = 'Caricamento...') {
  const overlay = document.getElementById('loading-overlay');
  const txtEl   = document.getElementById('loading-text');
  if (txtEl) txtEl.textContent = text;
  overlay.classList.toggle('hidden', !visible);
}

function updateHUD() {
  if (!GAME.player) return;
  const p = GAME.player;
  document.getElementById('hud-name').textContent  = p.name;
  document.getElementById('hud-class').textContent = CLASSES[p.classId].name;
  document.getElementById('hud-level').textContent = p.level;

  const hpPct = (p.hp / p.maxHp) * 100;
  const mpPct = (p.mp / p.maxMp) * 100;
  const xpPct = (p.xp / p.xpToNext) * 100;

  document.getElementById('bar-hp').style.width = hpPct + '%';
  document.getElementById('bar-mp').style.width = mpPct + '%';
  document.getElementById('bar-xp').style.width = xpPct + '%';

  document.getElementById('val-hp').textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
  document.getElementById('val-mp').textContent = `${Math.ceil(p.mp)}/${p.maxMp}`;
  document.getElementById('val-xp').textContent = `${p.xp}/${p.xpToNext}`;
}

// =============================================
//  SELEZIONE CLASSE — SCHERMATA NEW GAME
// =============================================
let selectedClass = null;

function renderClassGrid() {
  const grid = document.getElementById('class-grid');
  grid.innerHTML = '';
  for (const [id, cls] of Object.entries(CLASSES)) {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.innerHTML = `<span class="class-icon">${cls.icon}</span><span class="class-name">${cls.name}</span>`;
    card.onclick = () => selectClass(id, card);
    grid.appendChild(card);
  }
}

function selectClass(classId, cardEl) {
  document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  selectedClass = classId;
  document.getElementById('btn-start').disabled = false;
  renderClassDetail(classId);
}

function renderClassDetail(classId) {
  const cls   = CLASSES[classId];
  const stats = cls.statWeights || {};
  const detail = document.getElementById('class-detail');

  const maxStat = 12;
  const statList = ['forza','destrezza','intelligenza','saggezza','costituzione','carisma'];
  const statIcons = { forza:'⚔️', destrezza:'🏃', intelligenza:'🔮', saggezza:'✨', costituzione:'❤️', carisma:'👑' };

  const barsHtml = statList.map(s => {
    const val  = stats[s] || 1;
    const pct  = Math.round((val / maxStat) * 100);
    return `<div class="stat-row">
      <span>${statIcons[s]} ${s}</span>
      <div class="stat-mini-bar"><div class="stat-mini-fill" style="width:${pct}%"></div></div>
      <span>${val}</span>
    </div>`;
  }).join('');

  const skillsHtml = cls.skills.slice(0, 3).map(sk =>
    `<span style="color:var(--text-dim);font-size:.8rem;">${sk.icon} ${sk.name} (Lv.${sk.unlockLevel})</span>`
  ).join(' · ');

  detail.innerHTML = `
    <h3>${cls.icon} ${cls.name}</h3>
    <p style="color:var(--text-dim);font-size:.9rem;font-style:italic;margin-bottom:.8rem;">${cls.description}</p>
    <div class="stat-bars">${barsHtml}</div>
    <div style="margin-top:.8rem;display:flex;flex-wrap:wrap;gap:.3rem;">${skillsHtml}</div>
  `;
}

// =============================================
//  AVVIA PARTITA
// =============================================
function startGame() {
  const name = document.getElementById('hero-name').value.trim() || 'Eroe Senza Nome';
  if (!selectedClass) return toast('Seleziona una classe!');

  const stats = calculateStats(selectedClass, 1);
  GAME.player = {
    name,
    classId: selectedClass,
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    gold: 50,
    totalXp: 0,
    inventory: [],
    equipped: {},
    ...stats,
    hp: stats.maxHp,
    mp: stats.maxMp,
  };

  // Disegna sprite nel canvas di gioco
  const canvas = document.getElementById('game-canvas');
  if (canvas) drawCharacterSprite(canvas, selectedClass, 6);

  showScreen('screen-game');
  updateHUD();
  addLog(`${name} il ${CLASSES[selectedClass].name} inizia la sua avventura!`, 'system');
  addLog('Il mondo di Aethermoor ti attende. Esplora, combatti, sopravvivi.', 'system');
}

// =============================================
//  ESPLORA ZONA
// =============================================
function exploreZone() {
  if (!GAME.player) return;
  const zones = [
    { name:'Pianure d\'Aether',   desc:'Vasti campi nebbiosi...', level: 1 },
    { name:'Foresta Maledetta',   desc:'Gli alberi sussurrano...', level: 10 },
    { name:'Rovine dell\'Abisso', desc:'Pietra e magia rotta...', level: 30 },
  ];
  const zone = zones[GAME.zone] || zones[0];

  // Trova nemico adeguato alla zona
  const suitable = ENEMIES.filter(e => e.level <= GAME.player.level + 10);
  if (suitable.length === 0) return addLog('Nessun nemico trovato in questa zona.', 'system');

  const enemy = suitable[Math.floor(Math.random() * suitable.length)];
  startCombat(enemy);
}

// =============================================
//  RIPOSA
// =============================================
function rest() {
  if (!GAME.player) return;
  GAME.player.hp = GAME.player.maxHp;
  GAME.player.mp = GAME.player.maxMp;
  GAME.cooldowns = {};
  updateHUD();
  toast('Hai riposato. HP e MP ripristinati!');
  addLog('Ti riposi. Le tue ferite si rimarginano lentamente.', 'heal');
}

// =============================================
//  NEGOZIO (semplice)
// =============================================
function visitShop() {
  if (!GAME.player) return;
  const p = GAME.player;
  const pozione = generateItem(p.level, p.level, 'comune');
  pozione.type = 'pozione';
  pozione.name = 'Pozione di Guarigione';
  pozione.category = 'consumable';
  pozione.stats = { hp: Math.floor(p.maxHp * 0.3) };
  const cost = 20 + p.level * 3;

  if (p.gold < cost) {
    toast(`Non hai abbastanza oro (ti servono ${cost} monete d'oro).`);
    return;
  }
  p.gold -= cost;
  p.inventory.push(pozione);
  toast(`Acquistata Pozione di Guarigione per ${cost} monete d'oro!`);
  addLog(`Hai comprato una pozione per ${cost} monete d'oro.`, 'loot');
}

// =============================================
//  DUNGEON LIST
// =============================================
function renderDungeonList() {
  const list = document.getElementById('dungeon-list');
  list.innerHTML = '';
  DUNGEONS.forEach(d => {
    const card = document.createElement('div');
    card.className = 'dungeon-card';
    const canEnter = !GAME.player || GAME.player.level >= d.minLevel;
    card.innerHTML = `
      <h3>${d.name}</h3>
      <p>${d.desc}</p>
      <div class="dungeon-level">Livello: ${d.minLevel}–${d.maxLevel}</div>
      ${!canEnter ? `<div style="color:var(--red-light);font-size:.8rem;margin-top:.4rem;">⚠ Richiede Lv.${d.minLevel}</div>` : ''}
    `;
    if (canEnter) {
      card.onclick = () => startDungeon(d);
    } else {
      card.style.opacity = '0.5';
      card.style.cursor = 'not-allowed';
    }
    list.appendChild(card);
  });
}

function startDungeon(dungeon) {
  const enemyId = dungeon.enemies[Math.floor(Math.random() * dungeon.enemies.length)];
  const enemy   = ENEMIES.find(e => e.id === enemyId) || ENEMIES[0];
  showScreen('screen-game');
  addLog(`Entri nel dungeon: ${dungeon.name}!`, 'system');
  setTimeout(() => startCombat(enemy), 500);
}

// =============================================
//  COMBATTIMENTO
// =============================================
function startCombat(enemyTemplate) {
  if (!GAME.player) return;
  const p = GAME.player;

  // Scala il nemico al livello dell'area (±5 dal livello base)
  const scaledLevel = Math.max(1, enemyTemplate.level + Math.floor(Math.random() * 10 - 3));
  const hpScale     = 1 + (scaledLevel - enemyTemplate.level) * 0.1;

  GAME.currentEnemy = {
    ...enemyTemplate,
    level:  scaledLevel,
    maxHp:  Math.floor(enemyTemplate.hp * hpScale),
    hp:     Math.floor(enemyTemplate.hp * hpScale),
    atk:    Math.floor(enemyTemplate.atk * hpScale),
    def:    Math.floor(enemyTemplate.def * hpScale),
    stunned: false,
    stunTurns: 0,
    attDebuff: 1.0,
    defDebuff: 1.0,
  };

  // Tracking tentativi per calcolo ricompense
  const eKey = enemyTemplate.id;
  GAME.attemptCounter[eKey] = (GAME.attemptCounter[eKey] || 0) + 1;

  GAME.currentCombat = {
    startHp:   p.hp,
    startMp:   p.mp,
    turnsUsed: 0,
    playerClass: GAME.player.classId,
    playerLevel: p.level,
    monsterLevel: scaledLevel,
    monsterName:  enemyTemplate.name,
    attemptNumber: GAME.attemptCounter[eKey],
  };

  GAME.combatTurn = 0;
  GAME.dots    = [];
  GAME.enemyDots = [];
  GAME.buffs   = [];
  GAME.enemySummons = [];
  GAME.resurrectionUsed = false;
  GAME.playerHasResurrection = false;
  GAME.inCombat = true;

  // Aggiorna UI combattimento
  document.getElementById('enemy-name').textContent = GAME.currentEnemy.name;
  document.getElementById('enemy-level-tag').textContent = `Lv.${scaledLevel}`;
  updateEnemyBars();
  updatePlayerCombatBars();
  renderSkillButtons();
  document.getElementById('combat-messages').innerHTML = '';

  addCombatMsg(`⚔️ Un ${GAME.currentEnemy.name} (Lv.${scaledLevel}) ti attacca!`);

  // Disegna sprite nemico
  const eCanvas = document.getElementById('enemy-canvas');
  if (eCanvas) drawEnemy(eCanvas, enemyTemplate.sprite, 8);

  showScreen('screen-combat');
}

function updateEnemyBars() {
  const e = GAME.currentEnemy;
  if (!e) return;
  const pct = (e.hp / e.maxHp) * 100;
  document.getElementById('bar-enemy-hp').style.width = pct + '%';
  document.getElementById('val-enemy-hp').textContent = `${Math.ceil(e.hp)}/${e.maxHp}`;
}

function updatePlayerCombatBars() {
  const p = GAME.player;
  if (!p) return;
  const hpPct = (p.hp / p.maxHp) * 100;
  const mpPct = (p.mp / p.maxMp) * 100;
  document.getElementById('bar-phero-hp').style.width = hpPct + '%';
  document.getElementById('bar-phero-mp').style.width = mpPct + '%';
  document.getElementById('val-phero-hp').textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
  document.getElementById('val-phero-mp').textContent = `${Math.ceil(p.mp)}/${p.maxMp}`;
}

function addCombatMsg(msg) {
  const box = document.getElementById('combat-messages');
  if (!box) return;
  box.innerHTML += `<div>${msg}</div>`;
  box.scrollTop = box.scrollHeight;
}

function renderSkillButtons() {
  const p = GAME.player;
  const container = document.getElementById('skill-buttons');
  container.innerHTML = '';
  const skills = getAvailableSkills(p.classId, p.level);

  skills.forEach(skill => {
    const btn = document.createElement('button');
    btn.className = 'btn-action skill';
    const cd = GAME.cooldowns[skill.id] || 0;
    const enoughMp = p.mp >= skill.mpCost;
    btn.disabled = cd > 0 || !enoughMp;
    btn.innerHTML = `${skill.icon} ${skill.name}<br><small style="font-size:.65rem;">${cd > 0 ? `CD:${cd}` : `MP:${skill.mpCost}`}</small>`;
    btn.onclick = () => combatAction('skill', skill.id);
    container.appendChild(btn);
  });
}

// =============================================
//  AZIONE COMBATTIMENTO
// =============================================
async function combatAction(action, skillId = null) {
  if (!GAME.inCombat) return;

  // Disabilita bottoni durante elaborazione
  setActionButtons(false);

  const p = GAME.player;
  const e = GAME.currentEnemy;
  GAME.combatTurn++;
  GAME.currentCombat.turnsUsed++;

  let playerMsg = '';

  // ---- Azione giocatore ----
  if (action === 'attack') {
    const crit = Math.random() < p.critChance;
    let dmg    = Math.floor(p.attackPower * (crit ? 2.0 : 1.0));
    dmg = applyDefence(dmg, e.def * e.defDebuff);
    e.hp -= dmg;
    playerMsg = crit ? `💥 CRITICO! ${p.name} colpisce per ${dmg} danni!` : `${p.name} attacca per ${dmg} danni.`;

  } else if (action === 'skill' && skillId) {
    const skill  = CLASSES[p.classId].skills.find(s => s.id === skillId);
    if (!skill || p.mp < skill.mpCost) {
      addCombatMsg('MP insufficienti!');
      setActionButtons(true);
      return;
    }
    p.mp -= skill.mpCost;
    GAME.cooldowns[skill.id] = skill.cooldown;

    const result = skill.effect(p, e);
    playerMsg = result.msg;

    if (result.damage) {
      const dmg = applyDefence(result.damage, e.def * e.defDebuff);
      e.hp -= dmg;
    }
    if (result.heal) {
      p.hp = Math.min(p.maxHp, p.hp + result.heal);
    }
    if (result.dot) {
      GAME.enemyDots.push({ ...result.dot, remaining: result.dot.turns });
    }
    if (result.hot) {
      GAME.dots.push({ ...result.hot, remaining: result.hot.turns, type: 'heal' });
    }
    if (result.buff) {
      GAME.buffs.push({ ...result.buff, remaining: result.buff.turns });
    }
    if (result.debuff) {
      if (result.debuff.stun) { e.stunned = true; e.stunTurns = result.debuff.stun; }
      if (result.debuff.attDebuff) e.attDebuff = result.debuff.attDebuff;
      if (result.debuff.defDebuff) e.defDebuff = result.debuff.defDebuff;
    }
    if (result.summon) {
      GAME.enemySummons.push({ ...result.summon, remaining: result.summon.turns });
    }
    if (result.special === 'resurrection') {
      GAME.playerHasResurrection = true;
    }

  } else if (action === 'item') {
    const potion = p.inventory.find(i => i.category === 'consumable');
    if (!potion) { addCombatMsg('Nessun oggetto utilizzabile!'); setActionButtons(true); return; }
    p.inventory.splice(p.inventory.indexOf(potion), 1);
    const healAmt = potion.stats?.hp || 0;
    const mpAmt   = potion.stats?.mp  || 0;
    if (healAmt) p.hp = Math.min(p.maxHp, p.hp + healAmt);
    if (mpAmt)   p.mp = Math.min(p.maxMp, p.mp + mpAmt);
    playerMsg = `🧪 Usi ${potion.name}! +${healAmt || ''}HP${mpAmt ? ' +'+mpAmt+'MP' : ''}`;

  } else if (action === 'flee') {
    const fleeChance = 0.4 + p.stats.destrezza * 0.005;
    if (Math.random() < fleeChance) {
      GAME.inCombat = false;
      addCombatMsg('Sei riuscito a fuggire!');
      await endCombat(false, true);
      return;
    } else {
      addCombatMsg('Non sei riuscito a fuggire!');
    }
  }

  addCombatMsg(playerMsg);

  // ---- Aggiorna DoT su nemico ----
  for (const dot of GAME.enemyDots) {
    if (dot.remaining > 0) {
      e.hp -= dot.damage;
      addCombatMsg(`☠️ ${dot.type === 'poison' ? 'Veleno' : 'Bruciatura'}: ${dot.damage} danni al nemico.`);
      dot.remaining--;
    }
  }
  GAME.enemyDots = GAME.enemyDots.filter(d => d.remaining > 0);

  // ---- Summon spirito ----
  for (const summon of GAME.enemySummons) {
    if (summon.remaining > 0) {
      e.hp -= summon.damage;
      addCombatMsg(`👻 Lo spirito evocato attacca per ${summon.damage} danni!`);
      summon.remaining--;
    }
  }

  // ---- Riduci cooldown ----
  for (const key of Object.keys(GAME.cooldowns)) {
    GAME.cooldowns[key] = Math.max(0, GAME.cooldowns[key] - 1);
  }

  updateEnemyBars();
  updatePlayerCombatBars();
  updateHUD();

  // ---- Nemico morto? ----
  if (e.hp <= 0) {
    e.hp = 0;
    addCombatMsg(`💀 ${e.name} è stato sconfitto!`);
    await endCombat(true, false);
    return;
  }

  // ---- Attacco nemico ----
  if (!e.stunned) {
    const eDmg = Math.max(1, Math.floor(e.atk * e.attDebuff) - Math.floor(p.difesa * 0.5));
    p.hp -= eDmg;
    addCombatMsg(`${e.name} ti colpisce per ${eDmg} danni.`);
  } else {
    addCombatMsg(`${e.name} è stordito e non può attaccare!`);
    e.stunTurns--;
    if (e.stunTurns <= 0) e.stunned = false;
  }

  // ---- HoT (guarigione nel tempo) ----
  for (const hot of GAME.dots) {
    if (hot.remaining > 0 && hot.type === 'heal') {
      p.hp = Math.min(p.maxHp, p.hp + hot.heal);
      addCombatMsg(`♻️ Rigenerazione: +${hot.heal} HP.`);
      hot.remaining--;
    }
  }
  GAME.dots = GAME.dots.filter(d => d.remaining > 0);

  updatePlayerCombatBars();
  updateHUD();

  // ---- Giocatore morto? ----
  if (p.hp <= 0) {
    // Resurrezione?
    if (GAME.playerHasResurrection && !GAME.resurrectionUsed) {
      GAME.resurrectionUsed = true;
      p.hp = Math.floor(p.maxHp * 0.30);
      addCombatMsg(`⚡ La Risurrezione ti richiama dall'oblio! Torni con ${p.hp} HP!`);
      updatePlayerCombatBars();
      setActionButtons(true);
      renderSkillButtons();
      return;
    }
    p.hp = 0;
    addCombatMsg(`💀 ${p.name} è caduto in battaglia...`);
    await endCombat(false, false);
    return;
  }

  setActionButtons(true);
  renderSkillButtons();
}

function setActionButtons(enabled) {
  document.querySelectorAll('.btn-action').forEach(b => b.disabled = !enabled);
}

function applyDefence(damage, defence) {
  return Math.max(1, Math.floor(damage * (100 / (100 + defence))));
}

// =============================================
//  FINE COMBATTIMENTO
// =============================================
async function endCombat(won, fled) {
  GAME.inCombat = false;
  setActionButtons(false);

  const p  = GAME.player;
  const e  = GAME.currentEnemy;
  const cc = GAME.currentCombat;

  const combatData = {
    playerLevel:   cc.playerLevel,
    monsterLevel:  cc.monsterLevel,
    turnsUsed:     cc.turnsUsed,
    playerHpLost:  cc.startHp - p.hp,
    playerMaxHp:   p.maxHp,
    mpUsed:        cc.startMp - p.mp,
    playerMaxMp:   p.maxMp,
    fled,
    won,
    attemptNumber: cc.attemptNumber,
    monsterName:   cc.monsterName,
    playerClass:   CLASSES[p.classId].name,
  };

  if (won || fled) {
    setLoading(true, "L'Oracolo valuta la tua impresa...");
  }

  const rewards = await calculateRewards(combatData);
  setLoading(false);

  if (!won) {
    if (!fled) {
      // Morte: torna all'inizio con HP 1
      p.hp = 1;
      p.mp = Math.floor(p.maxMp * 0.1);
    }
    showRewardOverlay(false, fled, rewards.comment, [], 0, 0);
    return;
  }

  // Applica ricompense
  p.xp      += rewards.xp;
  p.totalXp += rewards.xp;
  p.gold    += rewards.gold;

  for (const item of rewards.loot) {
    if (p.inventory.length < 50) p.inventory.push(item);
  }

  addLog(`+${rewards.xp} XP | +${rewards.gold} monete d'oro | ${rewards.loot.length} oggetti`, 'loot');

  // Level up?
  while (p.xp >= p.xpToNext) {
    p.xp -= p.xpToNext;
    p.level++;
    p.xpToNext = xpForLevel(p.level);
    levelUp(p);
  }

  updateHUD();
  showRewardOverlay(true, false, rewards.comment, rewards.loot, rewards.xp, rewards.gold);

  // Salva leaderboard
  saveToLeaderboard(p.name, CLASSES[p.classId].name, p.level, p.totalXp, p.gold);
  saveGame();
}

function levelUp(player) {
  const newStats = calculateStats(player.classId, player.level);
  const hpGain   = newStats.maxHp - player.maxHp;
  const mpGain   = newStats.maxMp - player.maxMp;

  player.maxHp  = newStats.maxHp;
  player.maxMp  = newStats.maxMp;
  player.hp     = Math.min(player.hp + hpGain, player.maxHp);
  player.mp     = Math.min(player.mp + mpGain, player.maxMp);
  player.attackPower = newStats.attackPower;
  player.spellPower  = newStats.spellPower;
  player.difesa      = newStats.difesa;
  player.critChance  = newStats.critChance;

  // Copia stats
  for (const s of ['forza','destrezza','intelligenza','saggezza','costituzione','carisma']) {
    player[s] = newStats[s];
    if (!player.stats) player.stats = {};
    player.stats[s] = newStats[s];
  }

  toast(`🎉 LEVEL UP! Ora sei livello ${player.level}!`);
  addLog(`⬆️ ${player.name} sale al livello ${player.level}! Stat aumentate!`, 'skill');
}

// =============================================
//  REWARD OVERLAY
// =============================================
function showRewardOverlay(won, fled, comment, loot, xp, gold) {
  const overlay = document.getElementById('reward-overlay');
  const title   = document.getElementById('reward-title');
  const aiMsg   = document.getElementById('reward-ai-comment');
  const items   = document.getElementById('reward-items');
  const xpEl    = document.getElementById('reward-xp');

  title.textContent = won ? '⚔️ Vittoria!' : fled ? '🏃 Ritirata!' : '💀 Sconfitta';
  title.style.color = won ? 'var(--gold-light)' : fled ? 'var(--blue-light)' : 'var(--red-light)';
  aiMsg.textContent = comment || '';

  items.innerHTML = '';
  for (const item of loot) {
    const el = document.createElement('div');
    el.className = `reward-item-card r-${item.rarity}`;
    el.innerHTML = `${item.icon} <span>${item.name}</span> <small style="opacity:.6">[${item.rarityName}]</small>`;
    items.appendChild(el);
  }

  xpEl.textContent = won ? `+${xp} XP | +${gold} 🪙` : '';
  overlay.classList.remove('hidden');
}

function closeReward() {
  document.getElementById('reward-overlay').classList.add('hidden');
  showScreen('screen-game');
  updateHUD();
}

// =============================================
//  INVENTARIO
// =============================================
function renderInventory() {
  const p = GAME.player;
  if (!p) return;

  // Stat box
  const statsEl = document.getElementById('inventory-stats');
  const stats = [
    ['ATK',  Math.floor(p.attackPower)],
    ['MAGIA',Math.floor(p.spellPower)],
    ['DEF',  Math.floor(p.difesa)],
    ['HP Max', p.maxHp],
    ['MP Max', p.maxMp],
    ['Oro',  p.gold + '🪙'],
  ];
  statsEl.innerHTML = stats.map(([k,v]) =>
    `<div class="stat-box"><span>${k}</span><span>${v}</span></div>`
  ).join('');

  // Griglia inventario
  const grid = document.getElementById('inventory-grid');
  grid.innerHTML = '';

  p.inventory.forEach((item, idx) => {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    const c = document.createElement('canvas');
    drawItemIcon(c, item.type, item.rarityColor, 2);

    const dot = document.createElement('div');
    dot.className = 'item-rarity-dot';
    dot.style.background = item.rarityColor;

    const name = document.createElement('div');
    name.className = 'item-name';
    name.style.color = item.rarityColor;
    name.textContent = item.name.substring(0, 12);

    slot.appendChild(c);
    slot.appendChild(dot);
    slot.appendChild(name);
    slot.onclick = () => showItemDetail(item, idx);
    grid.appendChild(slot);
  });
}

function showItemDetail(item, idx) {
  const el = document.getElementById('item-detail');
  const statStr = Object.entries(item.stats || {}).map(([k, v]) =>
    `<span class="item-stat-tag">+${v} ${k}</span>`
  ).join('');

  el.innerHTML = `
    <h3 style="color:${item.rarityColor}">${item.icon} ${item.name}</h3>
    <div style="color:${item.rarityColor};font-size:.75rem;margin-bottom:.3rem;">${item.rarityName}</div>
    <div class="item-lore">"${item.lore}"</div>
    <div class="item-stats">${statStr}</div>
    <div style="margin-top:.8rem;display:flex;gap:.5rem;">
      ${item.category === 'consumable'
        ? `<button class="btn-secondary" onclick="useItem(${idx})">🧪 Usa</button>`
        : `<button class="btn-secondary" onclick="equipItem(${idx})">⚔️ Equipaggia</button>`}
      <button class="btn-secondary" onclick="sellItem(${idx})">💰 Vendi (${Math.floor((item.level||1)*5*getRarityMult(item.rarity))} monete)</button>
    </div>
  `;
}

function getRarityMult(rId) {
  const r = RARITIES.find(r => r.id === rId);
  return r ? r.multiplier : 1;
}

function useItem(idx) {
  const p    = GAME.player;
  const item = p.inventory[idx];
  if (!item || item.category !== 'consumable') return;
  if (item.stats.hp) p.hp = Math.min(p.maxHp, p.hp + item.stats.hp);
  if (item.stats.mp) p.mp = Math.min(p.maxMp, p.mp + item.stats.mp);
  p.inventory.splice(idx, 1);
  toast(`Usato: ${item.name}!`);
  updateHUD();
  renderInventory();
}

function equipItem(idx) {
  const p    = GAME.player;
  const item = p.inventory[idx];
  if (!item) return;
  // Applica bonus statistiche
  for (const [stat, val] of Object.entries(item.stats || {})) {
    if (stat in p) p[stat] = (p[stat] || 0) + val;
  }
  toast(`Equipaggiato: ${item.name}!`);
  p.inventory.splice(idx, 1);
  updateHUD();
  renderInventory();
}

function sellItem(idx) {
  const p    = GAME.player;
  const item = p.inventory[idx];
  if (!item) return;
  const price = Math.floor((item.level || 1) * 5 * getRarityMult(item.rarity));
  p.gold += price;
  p.inventory.splice(idx, 1);
  toast(`Venduto ${item.name} per ${price} monete!`);
  renderInventory();
}

// =============================================
//  LEADERBOARD
// =============================================
async function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '<p style="color:var(--text-dim);text-align:center;">Caricamento...</p>';

  const entries = await loadLeaderboard();
  list.innerHTML = '';

  if (!entries.length) {
    list.innerHTML = '<p style="color:var(--text-dim);text-align:center;">Nessun eroe ancora. Sii il primo!</p>';
    return;
  }

  entries.forEach((entry, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const el = document.createElement('div');
    el.className = 'lb-entry';
    el.innerHTML = `
      <div class="lb-rank ${rankClass}">${i === 0 ? '👑' : '#' + (i + 1)}</div>
      <div class="lb-name">${entry.name}</div>
      <div class="lb-class">${CLASSES[entry.class]?.icon || ''} ${entry.class}</div>
      <div class="lb-level">Lv.${entry.level}</div>
    `;
    list.appendChild(el);
  });
}

// =============================================
//  SALVA / CARICA PARTITA
// =============================================
function saveGame() {
  if (!GAME.player) return;
  try {
    localStorage.setItem('aethermoor_save', JSON.stringify(GAME.player));
    toast('Partita salvata!');
  } catch(e) {
    toast('Errore nel salvataggio.');
  }
}

function loadGame() {
  try {
    const data = localStorage.getItem('aethermoor_save');
    if (!data) { toast('Nessun salvataggio trovato.'); return; }
    GAME.player = JSON.parse(data);
    const canvas = document.getElementById('game-canvas');
    if (canvas) drawCharacterSprite(canvas, GAME.player.classId, 6);
    showScreen('screen-game');
    updateHUD();
    toast(`Bentornato, ${GAME.player.name}!`);
    addLog(`${GAME.player.name} il ${CLASSES[GAME.player.classId].name} riprende l'avventura (Lv.${GAME.player.level}).`, 'system');
  } catch(e) {
    toast('Salvataggio corrotto.');
  }
}

// =============================================
//  INIZIALIZZAZIONE
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  initParticles('particle-canvas');
  showScreen('screen-intro');
});

// Patch: aggiorna proprietà stats nel player
const _origStart = window.startGame;
window.startGame = function() {
  _origStart();
  if (GAME.player) {
    GAME.player.stats = calculateStats(GAME.player.classId, GAME.player.level);
  }
};

// Intercetta click inventario per renderizzare
const origShowScreen = window.showScreen;
window.showScreen = function(id) {
  origShowScreen(id);
  if (id === 'screen-inventory') renderInventory();
};

// Esponi funzioni globali
window.showScreen     = showScreen;
window.startGame      = startGame;
window.exploreZone    = exploreZone;
window.startCombat    = startCombat;
window.combatAction   = combatAction;
window.closeReward    = closeReward;
window.saveGame       = saveGame;
window.loadGame       = loadGame;
window.visitShop      = visitShop;
window.rest           = rest;
window.useItem        = useItem;
window.equipItem      = equipItem;
window.sellItem       = sellItem;
