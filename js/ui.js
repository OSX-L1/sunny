// =========================================
// 0. SAFETY VALVE
// =========================================
(function() {
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if (s) { s.style.opacity = '0'; s.style.pointerEvents = 'none'; setTimeout(() => { if(s) s.remove(); }, 1000); }
    }, 2500);
})();

// =========================================
// 1. GLOBAL VARIABLES
// =========================================
const EMOJI_LIST = ['📢', '🔥', '✨', '🎉', '✅', '❌', '🟢', '🔴', '📅', '🕒', '📌', '📍', '📦', '🛒', '💬', '📞', '🏠', '⚙️', '💰', '❤️', '⭐', '🆕'];
let tempConfig = {}; // Admin Config Placeholder
let dashboardCharts = {}; // Store chart instances

function execCmd(command, value = null) { try { document.execCommand(command, false, value); } catch(e){} }
function showToast(msg) { 
    const t = document.getElementById('toast'); const tm = document.getElementById('toast-message');
    if(t && tm) { tm.innerText = msg; t.classList.remove('opacity-0','pointer-events-none','toast-hide'); t.classList.add('toast-show'); setTimeout(()=>{t.classList.remove('toast-show');t.classList.add('toast-hide');},2500); }
}

// =========================================
// 2. MAIN INIT LOGIC
// =========================================
window.addEventListener('DOMContentLoaded', () => {
    try { if(typeof initFirebase === 'function') initFirebase(); } catch(e) {}
    try { if(typeof checkPwaStatus === 'function') checkPwaStatus(); } catch(e) {}
    try { if(typeof setupAutocomplete === 'function') setupAutocomplete(); } catch(e) {}

    const params = new URLSearchParams(window.location.search);
    if (!params.get('mode')) initNormalMode(); 
    
    setTimeout(() => {
        const s = document.getElementById('intro-splash');
        if(s) { s.style.opacity = '0'; setTimeout(() => { if(s) s.remove(); }, 500); }
    }, 800);
});

function initNormalMode() {
    renderSidebar();
    setTimeout(() => {
        if(typeof switchSystem === 'function') switchSystem('WOOD');
        if(typeof renderNews === 'function') renderNews();
        if(typeof currentUser !== 'undefined') renderUserSidebar(currentUser);
    }, 200);
}

// =========================================
// 3. UI RENDERERS
// =========================================
function renderSidebar() {
    const container = document.getElementById('sidebar-menu-container');
    if (!container) return;
    const menus = (typeof appConfig !== 'undefined' && appConfig.menus) ? appConfig.menus : [];
    
    let html = `<div class="px-6 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">เช็คสต็อกสินค้า</div>`;
    menus.forEach(m => {
        if (!m.active) return;
        const icon = (typeof ICONS !== 'undefined' && ICONS[m.icon]) ? ICONS[m.icon] : '📦';
        const active = (typeof currentSystem !== 'undefined' && currentSystem === m.id) ? 'bg-red-50 text-sunny-red border-sunny-red' : 'border-transparent text-slate-600 hover:bg-red-50';
        html += `<a href="#" onclick="switchSystem('${m.id}')" class="flex items-center px-6 py-3 border-l-4 ${active} transition-all"><div class="w-8 mr-2">${icon}</div><div><div class="text-sm font-bold">${m.name}</div><div class="text-[10px] text-slate-400">${m.sub||''}</div></div></a>`;
    });

    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    if ((typeof appConfig !== 'undefined' && appConfig.calcSettings && appConfig.calcSettings.enabled) || isAdmin) {
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
    container.innerHTML = html;
    const t = document.getElementById('app-title-display');
    if(t && typeof appConfig !== 'undefined') t.innerText = appConfig.appTitle || 'SUNNY';
}

function renderUserSidebar(user) {
    const c = document.getElementById('user-profile-section');
    if (!c) return;
    if (user && !user.isAnonymous) {
        c.innerHTML = `<div class="p-3 bg-red-50 rounded-xl mb-2 flex items-center gap-2"><div class="font-bold text-sm text-sunny-red">${user.displayName || 'User'}</div><button onclick="logoutUser()" class="ml-auto text-xs text-red-500">ออก</button></div>`;
    } else {
        c.innerHTML = `<button onclick="loginWithGoogle()" class="w-full py-2 bg-white border rounded-xl text-xs font-bold shadow-sm mb-2">Login Gmail</button>`;
    }
    c.innerHTML += `<button onclick="openHistoryModal()" class="w-full py-2 text-slate-400 text-xs hover:text-sunny-red text-center">ดูประวัติ</button>`;
}

function renderNews() {
    const c = document.getElementById('news-container');
    if(!c || typeof appConfig === 'undefined' || !appConfig.newsItems) return;
    if(appConfig.newsItems.length === 0) { c.classList.add('hidden'); return; }
    c.classList.remove('hidden');
    const w = document.getElementById('pinned-news-wrapper');
    if(w) {
        w.innerHTML = '';
        appConfig.newsItems.filter(n=>n.pinned).forEach(n => {
            w.innerHTML += `<div class="bg-red-50 p-2 border border-red-100 rounded mb-2 text-sm">📌 <b>${n.badgeLabel||'ประกาศ'}:</b> ${n.text}</div>`;
        });
    }
}

// =========================================
// 4. ADMIN SYSTEM (ENHANCED DASHBOARD)
// =========================================
function checkAdminLogin() { 
    if (localStorage.getItem('isAdminLoggedIn') === 'true') openConfig(); 
    else document.getElementById('adminLoginModal').classList.remove('hidden');
}
function closeAdminLogin() { document.getElementById('adminLoginModal').classList.add('hidden'); }
function handleLogin() { 
    if(document.getElementById('adminPassword').value === 'sn1988') { 
        localStorage.setItem('isAdminLoggedIn', 'true'); 
        closeAdminLogin(); 
        openConfig(); 
    } else { alert("รหัสผิด"); }
}
function logoutAdmin() { localStorage.removeItem('isAdminLoggedIn'); closeConfig(); }

function openConfig() {
    if(typeof appConfig === 'undefined') return alert("System Loading...");
    tempConfig = JSON.parse(JSON.stringify(appConfig));
    document.getElementById('adminConfigModal').classList.remove('hidden');
    switchAdminTab('dashboard'); // เปิดหน้า Dashboard ก่อนเลย
}

function closeConfig() { document.getElementById('adminConfigModal').classList.add('hidden'); }

// ✨✨✨ ADMIN TAB SWITCHER & DASHBOARD RENDERER ✨✨✨
function switchAdminTab(tab) {
    // Hide all tabs
    ['dashboard', 'menu', 'news', 'calc', 'saved', 'theme', 'features'].forEach(t => { 
        const el = document.getElementById('tab-content-'+t);
        const btn = document.getElementById('tab-btn-'+t);
        if(el) el.classList.add('hidden');
        if(btn) {
            btn.classList.remove('text-indigo-600', 'bg-indigo-50', 'text-sunny-red', 'bg-red-50'); 
            btn.classList.add('text-slate-600');
        }
    });
    
    // Show selected tab
    const target = document.getElementById('tab-content-'+tab);
    const targetBtn = document.getElementById('tab-btn-'+tab);
    
    if(target) target.classList.remove('hidden');
    if(targetBtn) {
        targetBtn.classList.remove('text-slate-600');
        // ใช้สีต่างกันสำหรับ Dashboard
        if(tab === 'dashboard') targetBtn.classList.add('text-indigo-600', 'bg-indigo-50');
        else targetBtn.classList.add('text-sunny-red', 'bg-red-50');
    }
    
    // Render specific content
    if(tab === 'dashboard') renderAdminDashboard();
    if(tab === 'menu') renderAdminMenu();
    if(tab === 'news') renderAdminNews();
    if(tab === 'calc') renderAdminCalcInputs();
    if(tab === 'saved' && typeof renderQuotationsList === 'function') renderQuotationsList('saved-quotations-list', 'all');
    if(tab === 'features') renderAdminFeatures();
}

// ✨✨✨ APEXCHARTS RENDERER ✨✨✨
function renderAdminDashboard() {
    // 1. Render Main Chart (Area Chart)
    if (document.getElementById('mainChart') && !dashboardCharts.main) {
        var options = {
            series: [{ name: 'ยอดใช้งาน', data: [31, 40, 28, 51, 42, 109, 100] }, { name: 'ยอดขาย', data: [11, 32, 45, 32, 34, 52, 41] }],
            chart: { height: 300, type: 'area', toolbar: { show: false } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { type: 'category', categories: ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"] },
            colors: ['#6366f1', '#ec4899'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } },
            grid: { borderColor: '#f1f5f9' }
        };
        dashboardCharts.main = new ApexCharts(document.querySelector("#mainChart"), options);
        dashboardCharts.main.render();
    }

    // 2. Render Donut Chart
    if (document.getElementById('donutChart') && !dashboardCharts.donut) {
        var options2 = {
            series: [45, 30, 25],
            labels: ['ม่านม้วน', 'มู่ลี่ไม้', 'ฉากกั้น'],
            chart: { type: 'donut', height: 250 },
            colors: ['#6366f1', '#ec4899', '#facc15'],
            dataLabels: { enabled: false },
            legend: { show: false },
            plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'รวม', color: '#64748b' } } } } }
        };
        dashboardCharts.donut = new ApexCharts(document.querySelector("#donutChart"), options2);
        dashboardCharts.donut.render();
    }
}

// ... (Other Admin Render Functions: Same as before, compacted) ...
function renderAdminCalcInputs() {
    const c = document.getElementById('tab-content-calc'); if(!c) return;
    if(!tempConfig.calcSettings) tempConfig.calcSettings = { enabled: true, wood:{}, pvc:{}, roller:{} };
    const w = tempConfig.calcSettings.wood || {};
    c.innerHTML = `<div class="p-6 bg-white rounded-xl border border-slate-200 shadow-sm mb-4 flex justify-between items-center"><span class="font-bold text-lg">เปิดระบบคำนวณ</span><input type="checkbox" ${tempConfig.calcSettings.enabled?'checked':''} onchange="tempConfig.calcSettings.enabled=this.checked" class="w-6 h-6 accent-sunny-red"></div><div class="space-y-4 bg-white p-6 rounded-xl border border-slate-200"><h4 class="font-bold border-b pb-2">Wood Pricing</h4><div class="grid grid-cols-2 gap-4"><div><label class="text-xs text-slate-400 block mb-1">Basswood</label><input type="number" value="${w.priceBasswood||0}" class="border rounded p-2 w-full" onchange="tempConfig.calcSettings.wood.priceBasswood=Number(this.value)"></div><div><label class="text-xs text-slate-400 block mb-1">Foamwood</label><input type="number" value="${w.priceFoamwood||0}" class="border rounded p-2 w-full" onchange="tempConfig.calcSettings.wood.priceFoamwood=Number(this.value)"></div></div></div>`;
}

function renderAdminMenu() {
    const l = document.getElementById('admin-menu-list'); if(!l) return; l.innerHTML = '';
    if(tempConfig.menus) tempConfig.menus.forEach((m,i) => {
        l.innerHTML += `<div class="p-4 border rounded-xl mb-3 flex items-center gap-4 bg-white shadow-sm"><span class="font-bold text-slate-300 text-xl w-6 text-center">${i+1}</span><input value="${m.name}" class="border p-2 rounded-lg flex-1 font-bold text-slate-700" onchange="tempConfig.menus[${i}].name=this.value"><div class="flex flex-col items-center"><input type="checkbox" ${m.active?'checked':''} class="w-6 h-6 accent-sunny-red" onchange="tempConfig.menus[${i}].active=this.checked"><span class="text-[10px] text-slate-400 mt-1">Show</span></div></div>`;
    });
}

function renderAdminNews() {
    const l = document.getElementById('admin-news-list'); if(!l) return; l.innerHTML = '';
    if(tempConfig.newsItems) tempConfig.newsItems.forEach((n,i) => {
        l.innerHTML += `<div class="p-4 border rounded-xl mb-3 bg-white shadow-sm"><textarea class="w-full border p-3 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-sunny-red outline-none" rows="2" onchange="tempConfig.newsItems[${i}].text=this.value">${n.text}</textarea><div class="flex justify-between items-center"><label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" ${n.pinned?'checked':''} class="w-4 h-4 accent-sunny-red" onchange="tempConfig.newsItems[${i}].pinned=this.checked"> ปักหมุดประกาศสำคัญ</label><button onclick="deleteNews(${i})" class="text-red-500 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100">ลบ</button></div></div>`;
    });
}

function addNewNewsItem() { if(!tempConfig.newsItems) tempConfig.newsItems=[]; tempConfig.newsItems.unshift({text:'ประกาศใหม่...', pinned:false, date:new Date().toISOString(), id:Date.now()}); renderAdminNews(); }
function deleteNews(i) { if(confirm('ลบ?')) { tempConfig.newsItems.splice(i,1); renderAdminNews(); } }
function renderAdminFeatures() { const l=document.getElementById('admin-features-list'); if(!l)return; l.innerHTML=''; Object.keys(tempConfig.features).forEach(k=>{ l.innerHTML+=`<div class="flex justify-between items-center p-3 bg-white border rounded-lg mb-2 shadow-sm"><span class="font-mono text-sm text-purple-700">${k}</span><input type="checkbox" ${tempConfig.features[k]?'checked':''} onchange="tempConfig.features['${k}']=this.checked" class="w-5 h-5 accent-purple-600"></div>`; }); }
function addNewFeature() { const k=document.getElementById('new-feature-key').value.trim(); if(k){tempConfig.features[k]=false; renderAdminFeatures();} }
function previewTheme(t) { applyTheme(t); tempConfig.theme=t; }
function saveConfig() { appConfig = JSON.parse(JSON.stringify(tempConfig)); if(typeof db !== 'undefined') db.collection("app_settings").doc("config").set(appConfig).then(()=>{ showToast("บันทึกสำเร็จ"); closeConfig(); renderSidebar(); renderNews(); }).catch(e=>alert(e.message)); }

// --- AUTH & PWA ---
function loginWithGoogle() { if(auth) auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(r => { showToast("Login OK"); renderUserSidebar(r.user); }); }
function logoutUser() { if(auth) auth.signOut().then(() => { showToast("Logged Out"); renderUserSidebar(null); }); }
function checkPwaStatus() { const b = document.getElementById('pwaInstallBtn'); if(b && !window.matchMedia('(display-mode: standalone)').matches) b.classList.remove('hidden'); }
function installApp() { if(deferredPrompt) deferredPrompt.prompt(); }
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; checkPwaStatus(); });

// --- UTILS ---
function setupAutocomplete() {} 
function switchSystem() {} 
function shareCurrentPage() {} // Disabled as requested
function toggleSidebar() { const s=document.getElementById('sidebar'); if(s) s.classList.toggle('-translate-x-full'); const o=document.getElementById('sidebarOverlay'); if(o) o.classList.toggle('hidden'); }
function toggleHelpModal(show) { document.getElementById('helpModal').classList.toggle('hidden', !show); }
function toggleCodeListModal(show) { document.getElementById('codeListModal').classList.toggle('hidden', !show); }
function applyTheme(theme) { document.body.classList.remove('theme-christmas'); if (theme === 'christmas') document.body.classList.add('theme-christmas'); }
