// =============================================
//  AETHERMOOR — CLASSI DEI PERSONAGGI
//  7 classi con statistiche, abilità e scaling
// =============================================

const CLASSES = {

  guerriero: {
    id: 'guerriero',
    name: 'Guerriero',
    icon: '⚔️',
    description: 'Padrone delle arti marziali, resiste ai colpi più duri e infligge danni devastanti in mischia.',
    statWeights: { forza: 10, destrezza: 4, intelligenza: 1, saggezza: 2, costituzione: 9, carisma: 2 },
    baseStats: {
      hp: 150, mp: 30,
      forza: 18, destrezza: 10, intelligenza: 5, saggezza: 8, costituzione: 16, carisma: 8,
      difesa: 12, velocita: 8,
      attackPower: 0, // calcolato
      spellPower: 0,
    },
    hpPerLevel: 12,
    mpPerLevel: 1,
    statGrowth: { forza: 2.5, destrezza: 1.0, intelligenza: 0.2, saggezza: 0.5, costituzione: 2.0, carisma: 0.3 },
    primaryStat: 'forza',
    damageStat: 'forza',        // usa forza per i danni
    defenceStat: 'costituzione',
    skills: [
      {
        id: 'colpo_poderoso',
        name: 'Colpo Poderoso',
        icon: '💥',
        mpCost: 8,
        cooldown: 2,
        description: 'Un attacco devastante che infligge 180% danno fisico.',
        unlockLevel: 1,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.attackPower * 1.8 * (1 + player.stats.forza * 0.01));
          return { damage: dmg, type: 'physical', msg: `${player.name} scatena un Colpo Poderoso per ${dmg} danni!` };
        }
      },
      {
        id: 'grido_di_guerra',
        name: 'Grido di Guerra',
        icon: '📯',
        mpCost: 15,
        cooldown: 5,
        duration: 3,
        description: 'Aumenta ATK del 40% per 3 turni.',
        unlockLevel: 5,
        effect: (player, enemy) => {
          return { buff: { stat: 'attackPower', mult: 1.4, turns: 3 }, msg: `${player.name} lancia un Grido di Guerra! ATK +40% per 3 turni!` };
        }
      },
      {
        id: 'rotazione_lame',
        name: 'Rotazione di Lame',
        icon: '🌀',
        mpCost: 20,
        cooldown: 4,
        description: 'Attacca 3 volte infliggendo 80% danno ciascuno.',
        unlockLevel: 15,
        effect: (player, enemy) => {
          const hitDmg = Math.floor(player.attackPower * 0.80);
          const total = hitDmg * 3;
          return { damage: total, hits: 3, type: 'physical', msg: `Rotazione di Lame! 3 colpi da ${hitDmg} = ${total} danni totali!` };
        }
      },
      {
        id: 'baluardo',
        name: 'Baluardo',
        icon: '🛡️',
        mpCost: 10,
        cooldown: 4,
        duration: 2,
        description: 'Riduce i danni subiti del 50% per 2 turni.',
        unlockLevel: 25,
        effect: (player, enemy) => {
          return { buff: { stat: 'defence', mult: 0.5, turns: 2, type: 'damage_reduction' }, msg: `${player.name} si protegge col Baluardo! Danno subito -50% per 2 turni!` };
        }
      },
      {
        id: 'furia_ancestrale',
        name: 'Furia Ancestrale',
        icon: '🔥',
        mpCost: 40,
        cooldown: 8,
        description: 'Danno massiccio: 350% ATK fisico. Richiede Lv.50.',
        unlockLevel: 50,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.attackPower * 3.5 * (1 + player.stats.forza * 0.015));
          return { damage: dmg, type: 'physical', msg: `⚔️ FURIA ANCESTRALE! ${player.name} infligge ${dmg} danni devastanti!` };
        }
      }
    ]
  },

  ladro: {
    id: 'ladro',
    name: 'Ladro',
    icon: '🗡️',
    description: 'Veloce e letale, eccelle nei colpi critici e nell\'evasione. Colpisce dove fa più male.',
    baseStats: {
      hp: 100, mp: 50,
      forza: 10, destrezza: 20, intelligenza: 8, saggezza: 7, costituzione: 9, carisma: 12,
      difesa: 7, velocita: 18,
    },
    hpPerLevel: 7,
    mpPerLevel: 2,
    statGrowth: { forza: 0.8, destrezza: 3.0, intelligenza: 0.5, saggezza: 0.4, costituzione: 0.7, carisma: 0.8 },
    primaryStat: 'destrezza',
    damageStat: 'destrezza',
    defenceStat: 'destrezza',
    skills: [
      {
        id: 'pugnalata',
        name: 'Pugnalata',
        icon: '🗡️',
        mpCost: 6,
        cooldown: 1,
        description: 'Colpo preciso: danno elevato, alta probabilità critico.',
        unlockLevel: 1,
        effect: (player, enemy) => {
          const critChance = 0.35 + player.stats.destrezza * 0.005;
          const isCrit = Math.random() < critChance;
          const dmg = Math.floor(player.attackPower * (isCrit ? 2.5 : 1.4));
          return { damage: dmg, type: 'physical', msg: isCrit ? `💥 CRITICO! Pugnalata per ${dmg} danni!` : `Pugnalata per ${dmg} danni.` };
        }
      },
      {
        id: 'veleno',
        name: 'Veleno',
        icon: '☠️',
        mpCost: 12,
        cooldown: 5,
        duration: 4,
        description: 'Avvelena il nemico: 30% ATK ogni turno per 4 turni.',
        unlockLevel: 8,
        effect: (player, enemy) => {
          const dot = Math.floor(player.attackPower * 0.30);
          return { dot: { damage: dot, turns: 4, type: 'poison' }, msg: `${player.name} avvelena il nemico! ${dot} danni/turno per 4 turni.` };
        }
      },
      {
        id: 'ombra',
        name: 'Passo nell\'Ombra',
        icon: '🌑',
        mpCost: 20,
        cooldown: 6,
        description: 'Evasione totale per 1 turno + attacco garantito critico.',
        unlockLevel: 20,
        effect: (player, enemy) => {
          return { special: 'shadow_step', msg: `${player.name} svanisce nell'ombra! Prossimo attacco garantito critico.` };
        }
      },
      {
        id: 'tempesta_di_lame',
        name: 'Tempesta di Lame',
        icon: '⚡',
        mpCost: 35,
        cooldown: 7,
        description: '5 colpi rapidi, 60% ATK ciascuno + veleno.',
        unlockLevel: 40,
        effect: (player, enemy) => {
          const hitDmg = Math.floor(player.attackPower * 0.6);
          const dot = Math.floor(player.attackPower * 0.2);
          return { damage: hitDmg * 5, hits: 5, dot: { damage: dot, turns: 3, type: 'poison' }, type: 'physical', msg: `⚡ Tempesta di Lame! 5x${hitDmg} danni + veleno!` };
        }
      }
    ]
  },

  chierico: {
    id: 'chierico',
    name: 'Chierico',
    icon: '✝️',
    description: 'Guaritore e protettore. La luce divina non è solo cura — scuote anche i non-morti.',
    baseStats: {
      hp: 110, mp: 120,
      forza: 9, destrezza: 7, intelligenza: 12, saggezza: 20, costituzione: 12, carisma: 16,
      difesa: 10, velocita: 7,
    },
    hpPerLevel: 8,
    mpPerLevel: 5,
    statGrowth: { forza: 0.4, destrezza: 0.3, intelligenza: 1.0, saggezza: 3.5, costituzione: 0.8, carisma: 1.0 },
    primaryStat: 'saggezza',
    damageStat: 'saggezza',
    defenceStat: 'costituzione',
    skills: [
      {
        id: 'colpo_sacro',
        name: 'Colpo Sacro',
        icon: '✨',
        mpCost: 8,
        cooldown: 1,
        description: 'Danno sacro: 120% Saggezza. Extra danno vs. non-morti.',
        unlockLevel: 1,
        effect: (player, enemy) => {
          const base = Math.floor(player.spellPower * 1.2);
          const bonus = enemy.type === 'undead' ? Math.floor(base * 0.5) : 0;
          const total = base + bonus;
          return { damage: total, type: 'holy', msg: bonus > 0 ? `✨ Colpo Sacro: ${total} danni sacri (bonus vs non-morti)!` : `✨ Colpo Sacro: ${total} danni sacri.` };
        }
      },
      {
        id: 'cura',
        name: 'Cura',
        icon: '💚',
        mpCost: 15,
        cooldown: 0,
        description: 'Ripristina HP pari a 140% della Saggezza.',
        unlockLevel: 1,
        effect: (player, enemy) => {
          const heal = Math.floor(player.spellPower * 1.4);
          return { heal, msg: `💚 Cura! ${player.name} recupera ${heal} HP.` };
        }
      },
      {
        id: 'benedizione',
        name: 'Benedizione',
        icon: '🌟',
        mpCost: 25,
        cooldown: 6,
        duration: 4,
        description: 'Aumenta tutte le stat del 20% per 4 turni.',
        unlockLevel: 12,
        effect: (player, enemy) => {
          return { buff: { stat: 'all', mult: 1.2, turns: 4 }, msg: `🌟 Benedizione! Tutte le statistiche +20% per 4 turni!` };
        }
      },
      {
        id: 'nova_sacra',
        name: 'Nova Sacra',
        icon: '☀️',
        mpCost: 50,
        cooldown: 8,
        description: 'Esplosione di luce divina: 300% Saggezza come danno sacro.',
        unlockLevel: 30,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 3.0);
          return { damage: dmg, type: 'holy', msg: `☀️ NOVA SACRA! La luce divina infligge ${dmg} danni!` };
        }
      },
      {
        id: 'resurrezione',
        name: 'Risurrezione',
        icon: '⚡',
        mpCost: 80,
        cooldown: 20,
        description: 'Se ferito a morte, si auto-risuscita con 30% HP. Una volta per combattimento.',
        unlockLevel: 60,
        effect: (player, enemy) => {
          return { special: 'resurrection', msg: `⚡ La Risurrezione è pronta — se cadi, tornerai!` };
        }
      }
    ]
  },

  druido: {
    id: 'druido',
    name: 'Druido',
    icon: '🌿',
    description: 'Parla con la natura. Può trasformarsi, rigenerarsi e scatenare forze elementali.',
    baseStats: {
      hp: 120, mp: 100,
      forza: 10, destrezza: 12, intelligenza: 15, saggezza: 17, costituzione: 13, carisma: 10,
      difesa: 9, velocita: 10,
    },
    hpPerLevel: 9,
    mpPerLevel: 4,
    statGrowth: { forza: 0.5, destrezza: 0.8, intelligenza: 2.0, saggezza: 2.5, costituzione: 0.8, carisma: 0.5 },
    primaryStat: 'saggezza',
    damageStat: 'saggezza',
    defenceStat: 'costituzione',
    skills: [
      {
        id: 'frustata_spinosa',
        name: 'Frustata Spinosa',
        icon: '🌿',
        mpCost: 6,
        cooldown: 0,
        description: 'Attacco naturale: 110% INT danni + avvelena leggermente.',
        unlockLevel: 1,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 1.1);
          return { damage: dmg, dot: { damage: Math.floor(dmg * 0.1), turns: 2, type: 'poison' }, type: 'nature', msg: `🌿 Frustata Spinosa: ${dmg} danni + veleno.` };
        }
      },
      {
        id: 'forma_orso',
        name: 'Forma d\'Orso',
        icon: '🐻',
        mpCost: 30,
        cooldown: 8,
        duration: 5,
        description: 'Si trasforma in orso: +80% HP, +50% ATK fisico, perde accesso magie.',
        unlockLevel: 10,
        effect: (player, enemy) => {
          return { special: 'bear_form', duration: 5, msg: `🐻 Il Druido si trasforma in Orso! HP+80%, ATK+50%!` };
        }
      },
      {
        id: 'rigenerazione',
        name: 'Rigenerazione',
        icon: '♻️',
        mpCost: 20,
        cooldown: 4,
        duration: 5,
        description: 'Rigenera 20% Saggezza HP per 5 turni.',
        unlockLevel: 15,
        effect: (player, enemy) => {
          const regen = Math.floor(player.spellPower * 0.20);
          return { hot: { heal: regen, turns: 5 }, msg: `♻️ Rigenerazione attiva! +${regen} HP per 5 turni.` };
        }
      },
      {
        id: 'tempesta_naturale',
        name: 'Tempesta Naturale',
        icon: '⛈️',
        mpCost: 45,
        cooldown: 7,
        description: 'Fulmini + radici: 250% INT danni e blocca il nemico 2 turni.',
        unlockLevel: 35,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 2.5);
          return { damage: dmg, type: 'nature', debuff: { stun: 2 }, msg: `⛈️ Tempesta Naturale! ${dmg} danni + nemico bloccato 2 turni!` };
        }
      }
    ]
  },

  sciamano: {
    id: 'sciamano',
    name: 'Sciamano',
    icon: '🔮',
    description: 'Parla con gli spiriti. Evoca alleati, maledice i nemici e usa sia il fisico che il magico.',
    baseStats: {
      hp: 115, mp: 110,
      forza: 11, destrezza: 9, intelligenza: 16, saggezza: 16, costituzione: 11, carisma: 14,
      difesa: 8, velocita: 9,
    },
    hpPerLevel: 8,
    mpPerLevel: 4,
    statGrowth: { forza: 0.6, destrezza: 0.4, intelligenza: 2.2, saggezza: 2.2, costituzione: 0.6, carisma: 1.0 },
    primaryStat: 'intelligenza',
    damageStat: 'intelligenza',
    defenceStat: 'saggezza',
    skills: [
      {
        id: 'colpo_spirito',
        name: 'Colpo Spirito',
        icon: '👻',
        mpCost: 8,
        cooldown: 0,
        description: 'Attacco ibrido fisico/magico: 80% STR + 80% INT.',
        unlockLevel: 1,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.attackPower * 0.8 + player.spellPower * 0.8);
          return { damage: dmg, type: 'spirit', msg: `👻 Colpo Spirito: ${dmg} danni ibridi (fisici + magici).` };
        }
      },
      {
        id: 'evoca_spirito',
        name: 'Evoca Spirito',
        icon: '🌀',
        mpCost: 35,
        cooldown: 8,
        duration: 4,
        description: 'Evoca uno spirito che attacca ogni turno per 4 turni.',
        unlockLevel: 10,
        effect: (player, enemy) => {
          const spiritDmg = Math.floor(player.spellPower * 0.7);
          return { summon: { damage: spiritDmg, turns: 4 }, msg: `🌀 Uno spirito viene evocato! Attacca per ${spiritDmg} ogni turno.` };
        }
      },
      {
        id: 'maledizione',
        name: 'Maledizione',
        icon: '💀',
        mpCost: 20,
        cooldown: 5,
        duration: 4,
        description: 'Riduce ATK e DEF del nemico del 30% per 4 turni.',
        unlockLevel: 18,
        effect: (player, enemy) => {
          return { debuff: { attDebuff: 0.7, defDebuff: 0.7, turns: 4 }, msg: `💀 Maledizione! Nemico indebolito: ATK e DEF -30% per 4 turni.` };
        }
      },
      {
        id: 'trance_spiritale',
        name: 'Trance Spiritale',
        icon: '✨',
        mpCost: 50,
        cooldown: 10,
        description: 'Chiamata agli spiriti: danno massiccio 280% INT e cura 30% HP max.',
        unlockLevel: 45,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 2.8);
          const heal = Math.floor(player.maxHp * 0.30);
          return { damage: dmg, heal, type: 'spirit', msg: `✨ Trance Spiritale! ${dmg} danni agli spiriti e ${heal} HP recuperati!` };
        }
      }
    ]
  },

  mago: {
    id: 'mago',
    name: 'Mago',
    icon: '🔥',
    description: 'Padrone degli elementi. Il danno magico più alto di tutte le classi — ma fragile come vetro.',
    baseStats: {
      hp: 80, mp: 180,
      forza: 5, destrezza: 8, intelligenza: 25, saggezza: 14, costituzione: 6, carisma: 10,
      difesa: 4, velocita: 9,
    },
    hpPerLevel: 5,
    mpPerLevel: 8,
    statGrowth: { forza: 0.2, destrezza: 0.4, intelligenza: 4.0, saggezza: 1.0, costituzione: 0.3, carisma: 0.4 },
    primaryStat: 'intelligenza',
    damageStat: 'intelligenza',
    defenceStat: 'intelligenza',
    skills: [
      {
        id: 'dardo_magico',
        name: 'Dardo Magico',
        icon: '✨',
        mpCost: 5,
        cooldown: 0,
        description: 'Attacco magico base: 130% INT. Sempre preciso.',
        unlockLevel: 1,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 1.3);
          return { damage: dmg, type: 'magic', msg: `✨ Dardo Magico: ${dmg} danni magici.` };
        }
      },
      {
        id: 'palla_di_fuoco',
        name: 'Palla di Fuoco',
        icon: '🔥',
        mpCost: 20,
        cooldown: 2,
        description: '200% INT danni da fuoco + bruciatura (15%/turno per 3 turni).',
        unlockLevel: 3,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 2.0);
          const burn = Math.floor(player.spellPower * 0.15);
          return { damage: dmg, dot: { damage: burn, turns: 3, type: 'fire' }, type: 'fire', msg: `🔥 Palla di Fuoco! ${dmg} danni + bruciatura ${burn}/turno!` };
        }
      },
      {
        id: 'catena_fulminea',
        name: 'Catena Fulminea',
        icon: '⚡',
        mpCost: 28,
        cooldown: 3,
        description: '180% INT danni fulmine. Se stordito, triplo danno.',
        unlockLevel: 20,
        effect: (player, enemy) => {
          const base = Math.floor(player.spellPower * 1.8);
          const dmg = enemy.stunned ? base * 3 : base;
          return { damage: dmg, type: 'lightning', msg: enemy.stunned ? `⚡ SCARICA! Triplo danno: ${dmg}!` : `⚡ Catena Fulminea: ${dmg} danni.` };
        }
      },
      {
        id: 'glaciazione',
        name: 'Glaciazione',
        icon: '❄️',
        mpCost: 35,
        cooldown: 5,
        description: '160% INT danni ghiaccio + congela il nemico 2 turni.',
        unlockLevel: 30,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 1.6);
          return { damage: dmg, type: 'ice', debuff: { stun: 2, type: 'freeze' }, msg: `❄️ Glaciazione! ${dmg} danni e nemico congelato 2 turni!` };
        }
      },
      {
        id: 'meteorite',
        name: 'Meteorite',
        icon: '☄️',
        mpCost: 80,
        cooldown: 10,
        description: 'Richiama un meteorite: 500% INT danni devastanti.',
        unlockLevel: 50,
        effect: (player, enemy) => {
          const dmg = Math.floor(player.spellPower * 5.0);
          return { damage: dmg, type: 'cosmic', msg: `☄️ METEORITE! Il cielo cade sul nemico: ${dmg} danni catastrofici!` };
        }
      }
    ]
  },

};

// ============================================
//  CALCOLO STATISTICHE PER LIVELLO
// ============================================
function calculateStats(classId, level) {
  const cls = CLASSES[classId];
  const base = { ...cls.baseStats };
  const growth = cls.statGrowth;

  // Applica crescita per livello
  for (const stat in growth) {
    base[stat] = Math.floor(base[stat] + growth[stat] * (level - 1));
  }

  // HP e MP scalano
  base.maxHp = Math.floor(base.hp + cls.hpPerLevel * (level - 1));
  base.maxMp = Math.floor(base.mp + cls.mpPerLevel * (level - 1));
  base.hp = base.maxHp;
  base.mp = base.maxMp;

  // Attack Power (scala con stat primaria danno)
  if (cls.damageStat === 'forza' || cls.damageStat === 'destrezza') {
    base.attackPower = Math.floor(base[cls.damageStat] * 2.5 + level * 1.5);
    base.spellPower  = Math.floor(base.intelligenza * 1.5 + level * 0.5);
  } else {
    base.attackPower = Math.floor(base.forza * 1.5 + level * 0.8);
    base.spellPower  = Math.floor(base[cls.damageStat] * 2.8 + level * 2.0);
  }

  base.critChance = 0.05 + base.destrezza * 0.003;
  base.evasion    = base.destrezza * 0.002 + 0.03;
  base.difesa     = Math.floor((base.difesa || 8) + base.costituzione * 0.5 + level * 0.8);

  return base;
}

// ============================================
//  XP NECESSARIA PER IL LIVELLO
// ============================================
function xpForLevel(level) {
  // Curva: più ripida man mano che si sale
  return Math.floor(100 * Math.pow(level, 1.6));
}

// ============================================
//  ABILITÀ DISPONIBILI PER IL LIVELLO
// ============================================
function getAvailableSkills(classId, level) {
  return CLASSES[classId].skills.filter(s => s.unlockLevel <= level);
}

// Export globale
window.CLASSES = CLASSES;
window.calculateStats = calculateStats;
window.xpForLevel = xpForLevel;
window.getAvailableSkills = getAvailableSkills;
