// =========================================================
// 🚨 1. EMERGENCY SPLASH REMOVER
// =========================================================
(function() {
    var safetyTimer = setTimeout(function() {
        var s = document.getElementById('intro-splash');
        if (s) {
            console.warn("🛡️ Safety Valve Activated: Forcing Splash Removal");
            s.style.opacity = '0';
            s.style.pointerEvents = 'none';
            setTimeout(function() { if(s) s.remove(); }, 1000);
        }
    }, 2500);
})();

// =========================================
// 2. GLOBAL VARIABLES
// =========================================
const EMOJI_LIST = ['📢', '🔥', '✨', '🎉', '✅', '❌', '🟢', '🔴', '📅', '🕒', '📌', '📍', '📦', '🛒', '💬', '📞', '🏠', '⚙️', '💰', '❤️', '⭐', '🆕'];
let tempConfig = {}; 

// =========================================
// 3. MAIN INIT LOGIC
// =========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ System Starting...");

    try {
        if(typeof initFirebase === 'function') initFirebase();
    } catch(e) { console.error("Firebase Error:", e); }

    // Init Dashboard Data (Mockup for now)
    updateDashboardData();

    // Normal Mode Init
    initNormalMode();

    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if(s) {
            s.style.transition = "opacity 0.5s ease";
            s.style.opacity = '0';
            setTimeout(() => { if(s) s.remove(); }, 500);
        }
    }, 800);
});

function initNormalMode() {
    renderSidebar();
    
    setTimeout(() => {
        if(typeof switchSystem === 'function') switchSystem('WOOD');
        if(typeof renderNews === 'function') renderNews();
        if(typeof currentUser !== 'undefined') renderUserSidebar(currentUser);
        if(typeof checkPwaStatus === 'function') checkPwaStatus();
    }, 200);
}

// =========================================
// 4. UI HELPERS
// =========================================
function showToast(msg) { 
    const t = document.getElementById('toast'); 
    if(t) {
        t.innerHTML = msg; 
        t.classList.remove('opacity-0','pointer-events-none'); 
        setTimeout(()=>{t.classList.add('opacity-0','pointer-events-none');},2500); 
    }
}

function updateDashboardData() {
    // ฟังก์ชันจำลองข้อมูล Dashboard (สามารถเชื่อมต่อ Firebase จริงได้ในอนาคต)
    const elDate = document.getElementById('dashTime');
    if(elDate) elDate.innerText = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'});
    
    // Random Mockup Data
    const quoteCount = Math.floor(Math.random() * 20) + 5;
    const totalMoney = (Math.floor(Math.random() * 50) + 10) + 'k';
    
    const elQuote = document.getElementById('dashTotalQuote');
    if(elQuote) elQuote.innerText = quoteCount;
    
    const elMoney = document.getElementById('dashTotalMoney');
    if(elMoney) elMoney.innerText = '฿' + totalMoney;
}

function renderSidebar() {
    const c = document.getElementById('sidebar-menu-container');
    if (!c) return;
    
    const menus = (typeof appConfig !== 'undefined' && appConfig.menus) ? appConfig.menus : [];
    
    let html = `<div class="px-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">เช็คสต็อกสินค้า</div>`;
    
    menus.forEach(m => {
        if (!m.active) return;
        const icon = (typeof ICONS !== 'undefined' && ICONS[m.icon]) ? ICONS[m.icon] : '📦';
        const active = (typeof currentSystem !== 'undefined' && currentSystem === m.id) ? 'bg-red-50 text-sunny-red border-sunny-red' : 'border-transparent text-slate-600 hover:bg-red-50';
        html += `<a href="#" onclick="switchSystem('${m.id}')" class="flex items-center px-6 py-3 border-l-4 ${active} transition-all"><div class="w-8 mr-2">${icon}</div><div><div class="text-sm font-bold">${m.name}</div><div class="text-[10px] text-slate-400">${m.sub||''}</div></div></a>`;
    });

    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    const isCalc = (typeof appConfig !== 'undefined' && appConfig.calcSettings && appConfig.calcSettings.enabled);
    
    if (isCalc || isAdmin) {
        html += `<div class="px-6 mt-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">ระบบคำนวณราคา</div>`;
        const cls = "flex items-center px-6 py-3 text-slate-600 hover:bg-indigo-50 border-l-4 border-transparent hover:border-indigo-900 transition-all";
        const i = `<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
        
        html += `
            <a href="#" onclick="switchCalcMode('EXT')" class="${cls}">${i}<span>ม่านม้วนภายนอก</span></a>
            <a href="#" onclick="switchCalcMode('INT')" class="${cls}">${i}<span>ม่านม้วน (ภายใน)</span></a>
            <a href="#" onclick="switchCalcMode('PVC_CALC')" class="${cls}">${i}<span>ฉากกั้นห้อง PVC</span></a>
            <a href="#" onclick="switchCalcMode('WOOD_CALC')" class="${cls}">${i}<span>มู่ลี่ไม้</span></a>
            <a href="#" onclick="switchCalcMode('ALU25')" class="${cls}">${i}<span>มู่ลี่อลูมิเนียม 25mm.</span></a>
        `;
    }
    c.innerHTML = html;
    
    const t = document.getElementById('app-title-display');
    if(t && typeof appConfig !== 'undefined') t.innerText = appConfig.appTitle || 'SUNNY';
}

function renderUserSidebar(user) {
    const c = document.getElementById('user-profile-section');
    if (!c) return;
    if (user && !user.isAnonymous) {
        c.innerHTML = `<div class="p-3 bg-red-50 rounded-xl mb-2 flex items-center gap-2"><div class="font-bold text-sm text-sunny-red">${user.displayName}</div><button onclick="logoutUser()" class="ml-auto text-xs text-red-500">ออก</button></div>`;
    } else {
        c.innerHTML = `<button onclick="loginWithGoogle()" class="w-full py-2 bg-white border rounded-xl text-xs font-bold shadow-sm mb-2">Login Gmail</button>`;
    }
    c.innerHTML += `<button onclick="openHistoryModal()" class="w-full py-2 text-slate-400 text-xs hover:text-sunny-red text-center">ดูประวัติ</button>`;
}

// =========================================
// 5. ADMIN & AUTH
// =========================================
function checkAdminLogin() { 
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        openConfig(); 
    } else {
        openAdminLogin();
    }
}

function openAdminLogin() { 
    document.getElementById('adminLoginModal').classList.remove('hidden'); 
    document.getElementById('adminPassword').value=''; 
    document.getElementById('loginError').classList.add('hidden'); 
    document.getElementById('adminPassword').focus(); 
}

function closeAdminLogin() { 
    document.getElementById('adminLoginModal').classList.add('hidden'); 
}

function handleLogin() { 
    if(document.getElementById('adminPassword').value === 'sn1988') { 
        localStorage.setItem('isAdminLoggedIn', 'true'); 
        closeAdminLogin(); 
        showToast("เข้าสู่ระบบสำเร็จ"); 
        openConfig(); 
        renderSidebar(); 
    } else { 
        document.getElementById('loginError').classList.remove('hidden'); 
    } 
}

function logoutAdmin() { 
    localStorage.removeItem('isAdminLoggedIn'); 
    closeConfig(); 
    showToast("ออกจากระบบแล้ว"); 
    renderSidebar(); 
}

function openConfig() {
    tempConfig = JSON.parse(JSON.stringify(appConfig));
    const modal = document.getElementById('adminConfigModal');
    if(modal) modal.classList.remove('hidden');
    
    // Initialize Old Dashboard in Admin Modal
    renderOldDashboardInAdmin();
    
    const titleInp = document.getElementById('conf-app-title');
    if(titleInp) titleInp.value = tempConfig.appTitle;
    
    const speedInp = document.getElementById('conf-news-speed');
    if(speedInp) speedInp.value = tempConfig.newsSettings.speed || 3;
    
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.classList.remove('hidden');
    
    renderAdminCalcInputs(); 
    switchAdminTab('menu');
}

function renderOldDashboardInAdmin() {
    const c = document.getElementById('oldDashboardContainer');
    if(!c) return;
    
    // Simulate Data for Admin View
    c.innerHTML = `
        <div class="bg-white p-4 rounded-xl border shadow-sm">
            <div class="text-xs text-slate-400">ใบเสนอราคา (Old View)</div>
            <div class="text-2xl font-bold text-sunny-red">42</div>
        </div>
        <div class="bg-white p-4 rounded-xl border shadow-sm">
            <div class="text-xs text-slate-400">ยอดรวม (Old View)</div>
            <div class="text-2xl font-bold text-slate-700">฿1.2M</div>
        </div>
        <div class="bg-slate-800 p-4 rounded-xl text-white col-span-2">
            <div class="text-xs opacity-50">สินค้ามาแรง</div>
            <div class="font-bold text-lg">มู่ลี่ไม้ Basswood</div>
        </div>
    `;
}

function saveConfig() {
    const titleInp = document.getElementById('conf-app-title');
    if(titleInp) tempConfig.appTitle = titleInp.value;
    
    const speedInp = document.getElementById('conf-news-speed');
    if(speedInp) tempConfig.newsSettings.speed = parseInt(speedInp.value);
    
    appConfig = JSON.parse(JSON.stringify(tempConfig));
    applyTheme(appConfig.theme);
    
    if(typeof db !== 'undefined') {
        db.collection("app_settings").doc("config").set(appConfig).then(()=>{
            showToast("บันทึกสำเร็จ");
            closeConfig();
            renderSidebar();
            if(typeof renderNews === 'function') renderNews();
        }).catch(err => alert("Save Error: " + err.message));
    }
}

function closeConfig() { 
    applyTheme(appConfig.theme); 
    document.getElementById('adminConfigModal').classList.add('hidden'); 
}

function switchAdminTab(tab) {
    ['dashboard', 'menu','news','calc','saved', 'theme', 'features'].forEach(t => {
        const btn = document.getElementById('tab-btn-'+t);
        const content = document.getElementById('tab-content-'+t);
        if(btn) btn.className = "px-4 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:bg-slate-50 whitespace-nowrap flex items-center gap-1";
        if(content) content.classList.add('hidden');
    });
    const activeBtn = document.getElementById('tab-btn-'+tab);
    const activeContent = document.getElementById('tab-content-'+tab);
    if(activeBtn) activeBtn.className = "px-4 py-3 text-sm font-bold border-b-2 border-sunny-red text-sunny-red bg-red-50 whitespace-nowrap flex items-center gap-1";
    if(activeContent) activeContent.classList.remove('hidden');
    
    if(tab === 'menu') renderAdminMenu();
    if(tab === 'news') renderAdminNews();
    if(tab === 'saved') renderQuotationsList('saved-quotations-list', 'all'); 
    if(tab === 'features') renderAdminFeatures();
}

function renderAdminCalcInputs() {
    const container = document.getElementById('tab-content-calc');
    if(!container) return;
    
    if(!tempConfig.calcSettings) tempConfig.calcSettings = { enabled: true, wood:{}, pvc:{}, roller:{} };
    const w = tempConfig.calcSettings.wood || {};

    container.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-slate-200 flex justify-between mb-4">
            <span class="font-bold">เปิดระบบคำนวณ</span>
            <input type="checkbox" ${tempConfig.calcSettings.enabled?'checked':''} onchange="tempConfig.calcSettings.enabled=this.checked">
        </div>
        <div class="space-y-4">
            <div class="p-3 border rounded bg-slate-50">
                <h4 class="font-bold mb-2">Wood Pricing</h4>
                Basswood: <input type="number" class="border p-1 w-20" value="${w.priceBasswood||0}" onchange="tempConfig.calcSettings.wood.priceBasswood=parseFloat(this.value)"><br>
                Foamwood: <input type="number" class="border p-1 w-20 mt-1" value="${w.priceFoamwood||0}" onchange="tempConfig.calcSettings.wood.priceFoamwood=parseFloat(this.value)">
            </div>
        </div>
    `;
}

function renderAdminMenu() {
    const list = document.getElementById('admin-menu-list');
    if(!list) return;
    list.innerHTML = '';
    if(tempConfig.menus) tempConfig.menus.forEach((m, i) => {
        list.innerHTML += `
            <div class="p-3 border rounded-xl mb-2 flex items-center gap-3 bg-white">
                <span class="font-bold text-slate-400">${i+1}</span>
                <input type="text" value="${m.name}" class="border p-1 rounded text-sm flex-1" onchange="tempConfig.menus[${i}].name=this.value">
                <input type="checkbox" ${m.active?'checked':''} class="w-5 h-5" onchange="tempConfig.menus[${i}].active=this.checked">
            </div>`;
    });
}

function renderAdminNews() {
    const list = document.getElementById('admin-news-list');
    if(!list) return;
    list.innerHTML = `<button onclick="addNewNewsItem()" class="w-full py-2 border-2 border-dashed rounded-xl mb-4 text-slate-400">+ เพิ่มประกาศ</button>`;
    if(tempConfig.newsItems) {
        tempConfig.newsItems.forEach((n, i) => {
            list.innerHTML += `<div class="p-2 border mb-2 bg-white"><input type="text" value="${n.text}" class="w-full border p-1 mb-1" onchange="tempConfig.newsItems[${i}].text=this.value"><button onclick="deleteNews(${i})" class="text-red-500 text-xs">ลบ</button></div>`;
        });
    }
}

function addNewNewsItem() {
    if(!tempConfig.newsItems) tempConfig.newsItems = [];
    tempConfig.newsItems.unshift({ id: Date.now(), text: "New", date: new Date().toISOString(), pinned: false });
    renderAdminNews();
}

function deleteNews(i) {
    if(confirm('ลบ?')) {
        tempConfig.newsItems.splice(i, 1);
        renderAdminNews();
    }
}

function renderAdminFeatures() {
    const list = document.getElementById('admin-features-list');
    if(!list) return;
    list.innerHTML = '';
    if(tempConfig.features) Object.keys(tempConfig.features).forEach(key => {
        list.innerHTML += `<div class="flex justify-between items-center p-2 border-b"><span class="text-sm">${key}</span><input type="checkbox" ${tempConfig.features[key]?'checked':''} onchange="tempConfig.features['${key}']=this.checked"></div>`;
    });
}

function addNewFeature() {
    const key = document.getElementById('new-feature-key').value.trim();
    if(key) { if(!tempConfig.features) tempConfig.features={}; tempConfig.features[key] = false; renderAdminFeatures(); }
}

function previewTheme(themeName) { applyTheme(themeName); tempConfig.theme = themeName; }

// --- NEWS RENDER ---
function renderNews() {
    const container = document.getElementById('news-container');
    const pinnedWrapper = document.getElementById('pinned-news-wrapper');
    
    if(!container) return;
    
    const news = (appConfig && appConfig.newsItems) ? appConfig.newsItems : [];
    if(news.length === 0) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    
    const pinnedItems = news.filter(n => n.pinned);
    pinnedWrapper.innerHTML = '';
    pinnedItems.forEach(item => {
        pinnedWrapper.innerHTML += `<div class="bg-red-50 p-2 border border-red-100 rounded mb-2 text-sm">📌 ${item.text}</div>`;
    });
}

// --- UTILS ---
function toggleSidebar() { const sb = document.getElementById('sidebar'); const ov = document.getElementById('sidebarOverlay'); sb.classList.toggle('-translate-x-full'); ov.classList.toggle('hidden'); }
function toggleHelpModal(show) { document.getElementById('helpModal').classList.toggle('hidden', !show); }
function toggleCodeListModal(show) { document.getElementById('codeListModal').classList.toggle('hidden', !show); }

// --- PWA ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => { 
    e.preventDefault(); 
    deferredPrompt = e; 
    checkPwaStatus(); 
});

function checkPwaStatus() { 
    const sidebarBtn = document.getElementById('pwaInstallBtn'); 
    if(!window.matchMedia('(display-mode: standalone)').matches) { 
        if(sidebarBtn) sidebarBtn.classList.remove('hidden'); 
    } 
}

async function installApp() { 
    if (deferredPrompt) { 
        deferredPrompt.prompt(); 
        const { outcome } = await deferredPrompt.userChoice; 
        deferredPrompt = null; 
    } else {
        document.getElementById('installGuideModal').classList.remove('hidden'); 
    }
}

window.addEventListener('appinstalled', () => { 
    checkPwaStatus(); 
});

function applyTheme(theme) {
    document.body.classList.remove('theme-christmas');
    if (theme === 'christmas') {
        document.body.classList.add('theme-christmas');
    }
}

// Placeholders for stability
function setupAutocomplete() {} 
function switchSystem() {} 
function insertEmoji() {}
function switchCalcMode() {}
function saveCurrentQuotation() {}
function captureQuotation() {}
function closeQuotation() {}
function toggleQDetails() {}
function renderQuotationsList() {}
function clearCalc() {}
function addCalcItem() {}
function showQuotationModal() {}
