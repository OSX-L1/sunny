
// js/config.js

// --- CONFIGURATION & CONSTANTS ---
const WOOD_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1132498145&single=true&output=csv";
const PVC_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1230787558&single=true&output=csv";
const ROLLER_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1019928538&single=true&output=csv";
const ALU_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1880232984&single=true&output=csv";

// ALU25 Price Tables
const ALU25_STD_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=684509454&single=true&output=csv";
const ALU25_CHAIN_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=374964719&single=true&output=csv";

const ICONS = {
    wood: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>',
    alu: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>',
    pvc: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>',
    roller: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
};

const firebaseConfig = {
    apiKey: "AIzaSyCAWVxXlTIzt9zvuCZADEVYi1xCtJ8hdcA",
    authDomain: "sunny1988-a4483.firebaseapp.com",
    projectId: "sunny1988-a4483",
    storageBucket: "sunny1988-a4483.firebasestorage.app",
    messagingSenderId: "436626327232",
    appId: "1:436626327232:web:b3b67dd892aff358624f25"
};

const DEFAULT_CONFIG = {
    appTitle: "SUNNY",
    theme: 'default',
    menus: [
        { id: 'WOOD', name: 'มู่ลี่ไม้', sub: '', icon: 'wood', active: true, bgImage: '' },
        { id: 'ALU', name: 'มู่ลี่อลูมิเนียม', sub: '25mm.', icon: 'alu', active: true, bgImage: '' },
        { id: 'PVC', name: 'ฉาก PVC', sub: '(ใบ 8.5/10 cm)', icon: 'pvc', active: true, bgImage: '' },
        { id: 'ROLLER', name: 'ม่านม้วน', sub: '', icon: 'roller', active: true, bgImage: '' }
    ],
    newsSettings: { speed: 3, showDate: true },
    newsItems: [],
    calcSettings: { enabled: true, factors: { fabricMult: 1.2, minArea: 1.2, eqExt: 1956, railTop: 200, railBot: 150, sling: 69 } },
    features: { experimental_mode: false }
};

// Global State Variables
let appConfig = DEFAULT_CONFIG;
let db = null, auth = null;
let currentUser = null;
let configListenerSet = false;
let currentSystem = 'WOOD'; 
let cache = { WOOD: null, PVC: null, ROLLER: null, ALU: null };
let alu25Cache = { STD: null, CHAIN: null };
let tempConfig = {}; // For Admin
let deferredPrompt; // For PWA
