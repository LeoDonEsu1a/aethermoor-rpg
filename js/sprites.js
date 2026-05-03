// =============================================
//  AETHERMOOR — SPRITE PIXEL ART
//  Disegnate programmaticamente su Canvas
//  Stile: 32x32 o 64x64 pixel art classica
// =============================================

const SPRITE_SIZE = 32;

// Palette colori per classi
const CLASS_PALETTES = {
  guerriero: { skin:'#f4c2a1', hair:'#6b3a2a', armor:'#7a7a7a', accent:'#c0392b', belt:'#5c3317' },
  ladro:     { skin:'#d4a87a', hair:'#1a1a1a', armor:'#2d2d2d', accent:'#4a90d9', belt:'#1a1a1a' },
  chierico:  { skin:'#f0d0b0', hair:'#d4a017', armor:'#e8dcc8', accent:'#f8f0e0', belt:'#c9952a' },
  druido:    { skin:'#c8b090', hair:'#5c4a1e', armor:'#4a7c3f', accent:'#7dcf60', belt:'#8b6914' },
  sciamano:  { skin:'#b8a090', hair:'#8a4fff', armor:'#2a1a4a', accent:'#8a4fff', belt:'#6a3a9a' },
  mago:      { skin:'#d8c0e8', hair:'#1a0a2a', armor:'#1a0a3a', accent:'#60a0ff', belt:'#3a1a6a' },
};

// =============================================
//  DISEGNA PERSONAGGIO (vista frontale, 32x32)
// =============================================
function drawCharacterSprite(canvas, classId, scale = 1) {
  const ctx = canvas.getContext('2d');
  const W = 32, H = 32;
  canvas.width  = W * scale;
  canvas.height = H * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(scale, scale);

  const p = CLASS_PALETTES[classId] || CLASS_PALETTES.guerriero;

  ctx.clearRect(0, 0, W, H);

  // Pixel helper
  const px = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  // ---- PIEDI / GAMBE ----
  rect(11, 25, 4, 5, p.armor);   // coscia sx
  rect(17, 25, 4, 5, p.armor);   // coscia dx
  rect(11, 29, 4, 3, '#333');     // stivale sx
  rect(17, 29, 4, 3, '#333');     // stivale dx

  // ---- CORPO ----
  rect(9, 16, 14, 10, p.armor);  // torso
  px(9, 16, p.accent); px(22, 16, p.accent); // spalle

  // Cintura
  rect(9, 24, 14, 2, p.belt);

  // Dettaglio armatura
  if (classId === 'guerriero') {
    // Piastra pettorale
    rect(12, 17, 8, 7, '#8a8a8a');
    rect(13, 18, 6, 5, '#9a9a9a');
    px(15, 20, '#aaa'); px(16, 20, '#aaa');
  } else if (classId === 'mago') {
    // Veste con stelle
    rect(10, 17, 12, 7, '#150a2a');
    px(12, 19, '#60a0ff'); px(18, 18, '#60a0ff');
    px(14, 21, '#9a6fff'); px(20, 20, '#9a6fff');
  } else if (classId === 'chierico') {
    // Croce sul petto
    rect(12, 17, 8, 7, '#d8d0c0');
    rect(15, 18, 2, 5, '#c9952a');
    rect(13, 20, 6, 2, '#c9952a');
  } else if (classId === 'druido') {
    // Foglie
    rect(10, 17, 12, 7, '#3a6030');
    px(11, 18, '#7dcf60'); px(20, 19, '#7dcf60');
    px(13, 21, '#5aaf40'); px(18, 21, '#5aaf40');
  }

  // ---- BRACCIA ----
  rect(6, 16, 3, 8, p.armor);    // braccio sx
  rect(23, 16, 3, 8, p.armor);   // braccio dx
  rect(6, 22, 3, 3, p.skin);     // mano sx
  rect(23, 22, 3, 3, p.skin);    // mano dx

  // ---- TESTA ----
  rect(11, 8, 10, 9, p.skin);    // faccia
  // Occhi
  px(13, 11, '#1a1a1a'); px(14, 11, '#1a1a1a');
  px(18, 11, '#1a1a1a'); px(19, 11, '#1a1a1a');
  // Riflesso occhi
  px(13, 10, '#fff'); px(18, 10, '#fff');
  // Naso
  px(16, 13, '#c4956a');
  // Bocca
  px(14, 15, '#8b4513'); px(15, 15, '#8b4513'); px(16, 15, '#8b4513');

  // ---- CAPELLI / CAPPELLO ----
  if (classId === 'mago') {
    // Cappello da mago appuntito
    rect(12, 2, 8, 7, '#1a0a3a');
    rect(10, 7, 12, 3, '#1a0a3a');
    px(15, 1, '#60a0ff'); px(16, 1, '#60a0ff');
  } else if (classId === 'chierico') {
    // Elmo sacro
    rect(10, 5, 12, 5, '#d8cca8');
    px(15, 4, '#c9952a'); px(16, 4, '#c9952a');
    rect(10, 7, 12, 2, '#c9952a');
  } else {
    // Capelli standard
    rect(11, 7, 10, 3, p.hair);
    if (classId === 'guerriero') {
      rect(9, 8, 2, 4, p.hair);
      rect(21, 8, 2, 4, p.hair);
    }
    if (classId === 'sciamano') {
      // Piume nei capelli
      px(11, 6, '#8a4fff'); px(20, 6, '#f87171');
    }
    if (classId === 'druido') {
      // Foglie nei capelli
      px(10, 8, '#7dcf60'); px(21, 8, '#7dcf60');
    }
  }

  // ---- ARMA (destra) ----
  drawClassWeapon(ctx, classId, p);
}

function drawClassWeapon(ctx, classId, p) {
  const rect = (x, y, w, h, color) => { ctx.fillStyle=color; ctx.fillRect(x,y,w,h); };
  const px = (x, y, color) => { ctx.fillStyle=color; ctx.fillRect(x,y,1,1); };

  if (classId === 'guerriero') {
    // Spada
    rect(25, 8, 2, 18, '#c0c0c0');
    rect(23, 15, 6, 2, '#8b6914');
    px(25, 7, '#e0e0e0'); px(26, 7, '#e0e0e0');
    px(25, 8, '#fff');
  } else if (classId === 'ladro') {
    // Pugnale
    rect(25, 14, 2, 12, '#b0b0b0');
    rect(23, 24, 4, 2, '#4a3a2a');
    px(25, 13, '#e0e0e0');
  } else if (classId === 'chierico') {
    // Mazza/bastone sacro
    rect(25, 10, 2, 16, '#c9952a');
    rect(23, 10, 6, 3, '#c9952a');
    px(25, 9, '#f0e060'); px(26, 9, '#f0e060');
  } else if (classId === 'druido') {
    // Bastone di legno
    rect(25, 8, 2, 18, '#6b4226');
    px(24, 7, '#7dcf60'); px(27, 8, '#7dcf60');
    px(23, 9, '#5aaf40');
  } else if (classId === 'sciamano') {
    // Totem
    rect(25, 9, 2, 18, '#6b4226');
    rect(23, 9, 6, 4, '#8a4fff');
    px(25, 8, '#e879f9'); px(26, 8, '#e879f9');
  } else if (classId === 'mago') {
    // Bacchetta magica
    rect(25, 10, 2, 18, '#2a1a4a');
    px(25, 9, '#60a0ff'); px(26, 9, '#60a0ff');
    px(24, 10, '#9a6fff'); px(27, 10, '#9a6fff');
  }
}

// =============================================
//  DISEGNA NEMICO (vari tipi)
// =============================================
const ENEMY_SPRITES = {
  goblin: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    r(3,1,10,10,'#2d7a2d');  // corpo verde
    r(4,0,8,2,'#1a5c1a');   // testa
    r(2,4,2,4,'#2d7a2d');   // braccia
    r(12,4,2,4,'#2d7a2d');
    r(5,11,3,5,'#1a5c1a');  // gambe
    r(9,11,3,5,'#1a5c1a');
    // Occhi rossi
    r(4,2,2,2,'#ff2020');
    r(9,2,2,2,'#ff2020');
    // Arma
    r(13,3,1,8,'#888');
  },

  scheletro: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    r(4,0,8,8,'#e8e0c8');   // cranio
    r(5,8,6,6,'#e8e0c8');   // torso
    r(2,8,3,5,'#e8e0c8');   // braccio sx
    r(11,8,3,5,'#e8e0c8');
    r(5,14,3,6,'#e8e0c8');  // gamba sx
    r(8,14,3,6,'#e8e0c8');
    // Occhi
    r(5,2,2,2,'#111');
    r(9,2,2,2,'#111');
    // Sorriso
    r(5,6,1,1,'#111'); r(7,6,1,1,'#111'); r(9,6,1,1,'#111');
  },

  troll: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    r(2,2,12,10,'#5c8a40');  // corpo massiccio
    r(1,4,2,6,'#4a7030');    // braccio sx
    r(13,4,2,6,'#4a7030');
    r(4,12,4,8,'#4a7030');   // gamba sx
    r(8,12,4,8,'#4a7030');
    r(3,0,10,4,'#4a7030');   // testa
    // Occhi
    r(4,1,3,2,'#ff5500');
    r(9,1,3,2,'#ff5500');
    // Zanne
    r(5,4,2,2,'#e8e0c8');
    r(9,4,2,2,'#e8e0c8');
  },

  drago: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    // Corpo drago
    r(1,6,14,10,'#8b0000');
    r(3,2,10,6,'#8b0000');   // testa
    // Ali
    r(0,4,2,8,'#6b0000');
    r(14,4,2,8,'#6b0000');
    // Occhi gialli
    r(4,3,2,2,'#ffff00');
    r(10,3,2,2,'#ffff00');
    // Corna
    r(4,1,2,2,'#666');
    r(10,1,2,2,'#666');
    // Fuoco
    r(12,5,4,2,'#ff8c00');
    r(13,4,3,1,'#ff4500');
    r(14,7,2,1,'#ffcc00');
    // Artigli
    r(2,16,3,3,'#555');
    r(11,16,3,3,'#555');
  },

  lich: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    // Veste
    r(3,6,10,14,'#1a0a2a');
    r(4,2,8,6,'#1a0a2a');
    // Braccia scheletriche
    r(1,6,3,8,'#d0c8b0');
    r(12,6,3,8,'#d0c8b0');
    // Cranio
    r(5,0,6,5,'#d0c8b0');
    // Occhi viola
    r(6,1,2,2,'#8a4fff');
    r(9,1,2,2,'#8a4fff');
    // Corona
    r(4,0,2,1,'#c9952a');
    r(10,0,2,1,'#c9952a');
    r(7,0,2,1,'#c9952a');
    // Orb magica
    r(13,4,3,3,'#60a0ff');
    r(14,4,1,1,'#fff');
  },

  slime: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    r(3,4,10,10,'#40c040');
    r(2,6,2,6,'#40c040');
    r(12,6,2,6,'#40c040');
    r(4,12,8,4,'#40c040');
    r(5,2,6,3,'#40c040');
    // Occhi
    r(5,6,2,2,'#fff');
    r(9,6,2,2,'#fff');
    r(6,6,1,1,'#000');
    r(10,6,1,1,'#000');
    // Bocca
    r(6,10,4,1,'#20a020');
  },

  bandito: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    r(4,8,8,8,'#4a3020');    // corpo
    r(5,0,6,9,'#c8a07a');    // testa
    r(2,8,3,6,'#4a3020');    // braccio
    r(11,8,3,6,'#4a3020');
    r(5,16,3,6,'#2a1a10');
    r(8,16,3,6,'#2a1a10');
    // Benda sull'occhio
    r(5,3,5,2,'#1a1a1a');
    r(7,2,1,4,'#1a1a1a');
    // Occhio
    r(9,3,2,2,'#8b4513');
    // Cappello
    r(4,0,8,2,'#1a1a1a');
    r(3,1,10,2,'#1a1a1a');
    // Arma
    r(13,5,1,10,'#c0c0c0');
  },

  boss: (ctx, s) => {
    const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*s,y*s,w*s,h*s); };
    // Grande e minaccioso
    r(0,4,16,12,'#4a0a0a');
    r(2,0,12,6,'#4a0a0a');
    r(0,3,2,9,'#3a0808');
    r(14,3,2,9,'#3a0808');
    r(2,16,5,6,'#3a0808');
    r(9,16,5,6,'#3a0808');
    // Occhi infernali
    r(3,2,4,3,'#ff2200');
    r(9,2,4,3,'#ff2200');
    r(4,2,2,2,'#ffaa00');
    r(10,2,2,2,'#ffaa00');
    // Corna
    r(2,0,2,3,'#888');
    r(12,0,2,3,'#888');
    // Aura
    r(0,8,1,4,'#ff220040');
    r(15,8,1,4,'#ff220040');
  }
};

function drawEnemy(canvas, enemyType, scale = 2) {
  const SIZE = 16;
  canvas.width  = SIZE * scale;
  canvas.height = SIZE * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const drawFn = ENEMY_SPRITES[enemyType] || ENEMY_SPRITES.goblin;
  drawFn(ctx, scale);
}

// =============================================
//  DISEGNA ITEM ICON (16x16)
// =============================================
function drawItemIcon(canvas, itemType, rarityColor, scale = 2) {
  const S = 16;
  canvas.width  = S * scale;
  canvas.height = S * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const r = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(x*scale,y*scale,w*scale,h*scale); };

  const col = rarityColor || '#888';
  const dark = '#1a1a1a';

  switch(itemType) {
    case 'spada':
      r(7,0,2,14,col); r(4,8,8,2,col); r(7,14,2,2,dark);
      break;
    case 'ascia':
      r(7,0,2,14,col); r(3,2,6,7,col); r(9,2,4,7,col);
      break;
    case 'pugnale':
      r(7,2,2,11,col); r(5,11,6,2,dark); r(7,0,2,2,'#fff');
      break;
    case 'bastone': case 'libro':
      r(7,0,2,12,col); r(5,1,2,2,'#f0e060'); r(9,1,2,2,'#f0e060');
      r(5,0,6,1,'#f0e060');
      break;
    case 'arco':
      r(7,0,2,16,col); r(3,1,1,1,col); r(12,1,1,1,col);
      r(3,1,1,14,col); r(12,1,1,14,col);
      r(4,2,8,1,'#c8a070');
      break;
    case 'scudo':
      r(3,2,10,10,col); r(4,0,8,3,col); r(3,10,10,3,col);
      r(4,12,8,2,col); r(7,5,2,6,'#fff');
      break;
    case 'corazza':
      r(3,4,10,10,col); r(4,0,8,5,col); r(2,5,2,7,col); r(12,5,2,7,col);
      r(6,3,4,8,'#888');
      break;
    case 'veste':
      r(3,0,10,14,col); r(2,3,2,9,col); r(12,3,2,9,col);
      r(6,0,4,4,'#fff');
      break;
    case 'elmo':
      r(3,5,10,7,col); r(2,7,2,5,col); r(12,7,2,5,col);
      r(4,2,8,4,col); r(6,1,4,2,col);
      break;
    case 'anello':
      r(5,0,6,2,col); r(3,2,2,2,col); r(11,2,2,2,col);
      r(3,8,2,2,col); r(11,8,2,2,col);
      r(5,10,6,2,col); r(7,4,2,4,'#fff');
      break;
    case 'amuleto':
      r(6,0,4,2,col); r(7,2,2,8,col);
      r(4,8,8,6,col); r(6,9,4,4,'#fff'); r(7,10,2,2,'#f0e060');
      break;
    case 'pozione':
      r(6,0,4,3,'#888'); r(5,3,6,1,col); r(4,4,8,9,col);
      r(5,5,6,7,'rgba(255,255,255,0.3)'); r(3,13,10,1,col); r(4,14,8,1,col);
      break;
    case 'elisir':
      r(6,0,4,3,'#888'); r(5,3,6,1,col); r(4,4,8,9,col);
      r(6,6,4,5,'rgba(100,200,255,0.5)');
      break;
    default:
      r(4,4,8,8,col); r(6,6,4,4,'#fff');
  }
}

// =============================================
//  PARTICELLE (schermata intro)
// =============================================
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({length: 60}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.5 - 0.1,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.6 + 0.1,
    color: Math.random() < 0.5 ? '#c9952a' : '#4a5580',
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
}

window.drawCharacterSprite = drawCharacterSprite;
window.drawEnemy = drawEnemy;
window.drawItemIcon = drawItemIcon;
window.initParticles = initParticles;
window.ENEMY_SPRITES = ENEMY_SPRITES;
