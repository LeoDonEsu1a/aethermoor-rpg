// =============================================
//  AETHERMOOR — FIREBASE LEADERBOARD
//  Inserisci qui la tua configurazione Firebase
// =============================================
//
//  ISTRUZIONI:
//  1. Vai su https://console.firebase.google.com
//  2. Crea un progetto (es: "aethermoor-rpg")
//  3. Vai su "Project Settings" > "Your apps" > aggiungi Web App
//  4. Copia la config e incollala sotto
//  5. Vai su "Firestore Database" e crea il database (modalità test)
//  6. Vai su "Rules" e imposta: allow read, write: if true;
//     (per ora, per il testing - poi limitare)
// =============================================

// ⚠️  SOSTITUISCI QUESTI VALORI CON LA TUA CONFIG FIREBASE ⚠️
const FIREBASE_CONFIG = {
  apiKey:            "LA_TUA_API_KEY",
  authDomain:        "IL_TUO_PROGETTO.firebaseapp.com",
  projectId:         "IL_TUO_PROGETTO",
  storageBucket:     "IL_TUO_PROGETTO.firebasestorage.app",
  messagingSenderId: "IL_TUO_SENDER_ID",
  appId:             "LA_TUA_APP_ID"
};

// =============================================
//  INIZIALIZZAZIONE FIREBASE
// =============================================

let db = null;
let firebaseReady = false;

async function initFirebase() {
  try {
    // Carica Firebase SDK dinamicamente
    const { initializeApp }  = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp }
      = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    firebaseReady = true;

    // Salva riferimenti globali per usarli dopo
    window._fb = { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp };
    console.log('✅ Firebase pronto');
  } catch (err) {
    console.warn('⚠️ Firebase non disponibile (config mancante o offline). Leaderboard disabilitata.', err);
    firebaseReady = false;
  }
}

// =============================================
//  SALVA PUNTEGGIO SULLA LEADERBOARD
// =============================================
async function saveToLeaderboard(heroName, className, level, totalXp, gold) {
  if (!firebaseReady || !db) return false;
  try {
    const { collection, addDoc, serverTimestamp } = window._fb;
    await addDoc(collection(db, 'leaderboard'), {
      name:      heroName,
      class:     className,
      level:     level,
      totalXp:   totalXp,
      gold:      gold,
      score:     level * 1000 + totalXp,
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('Errore salvataggio leaderboard:', err);
    return false;
  }
}

// =============================================
//  CARICA TOP 20 LEADERBOARD
// =============================================
async function loadLeaderboard() {
  if (!firebaseReady || !db) return getDemoLeaderboard();
  try {
    const { collection, getDocs, query, orderBy, limit } = window._fb;
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Errore caricamento leaderboard:', err);
    return getDemoLeaderboard();
  }
}

// Leaderboard di esempio se Firebase non è configurato
function getDemoLeaderboard() {
  return [
    { name: 'Theron il Grigio',  class: 'mago',      level: 87,  score: 87420 },
    { name: 'Seraphine',         class: 'chierico',  level: 73,  score: 73100 },
    { name: 'Krix l\'Ombra',    class: 'ladro',     level: 65,  score: 65800 },
    { name: 'Borin Pietraforte', class: 'guerriero', level: 58,  score: 58200 },
    { name: 'Lyria',             class: 'druido',    level: 50,  score: 50100 },
    { name: 'Malachar',          class: 'sciamano',  level: 44,  score: 44600 },
    { name: 'Eris la Veloce',   class: 'ladro',     level: 38,  score: 38200 },
    { name: 'Aldric',            class: 'guerriero', level: 31,  score: 31500 },
  ];
}

// Inizializza all'avvio
initFirebase();

window.saveToLeaderboard = saveToLeaderboard;
window.loadLeaderboard   = loadLeaderboard;
