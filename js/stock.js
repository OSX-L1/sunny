// js/stock.js

// --- CSV PARSING & DATA FETCHING ---

function isValidCode(c){if(!c||c.includes(',')||c.includes('"')||c.length>20)return false; const b=['SLAT','PCS','BOX','จำนวน','NAME','CODE','PRICE','35MM','50MM','F-WOOD','25MM','รหัส','คงเหลือ','ชื่อ','ความสูง']; return !b.some(w=>c.toUpperCase().includes(w));}

const STOCK_COLUMNS_WOOD={'4ft':{col:4,meter:'1.22 ม.'},'4.5ft':{col:6,meter:'1.37 ม.'},'5ft':{col:8,meter:'1.52 ม.'},'5.5ft':{col:10,meter:'1.68 ม.'},'6ft':{col:12,meter:'1.83 ม.'},'6.5ft':{col:14,meter:'1.98 ม.'},'7ft':{col:16,meter:'2.13 ม.'},'8ft':{col:18,meter:'2.44 ม.'}};

function parseWoodCSV(t){const l=t.trim().split('\n'),d={};let lc=null;for(let i=2;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(!c&&lc){const h=Object.values(STOCK_COLUMNS_WOOD).some(o=>cr[o.col]&&cr[o.col]!=='0');if(cr[1]||h)c=lc}if(c){c=c.toUpperCase();if(!isValidCode(c))continue;lc=c;if(!d[c]){d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{}};Object.keys(STOCK_COLUMNS_WOOD).forEach(k=>d[c].stocks[k]=0)}for(const[k,o]of Object.entries(STOCK_COLUMNS_WOOD))if(cr.length>o.col)d[c].stocks[k]+=parseInt(cr[o.col].replace(/,/g,'')||0,10)}}return d}
function parseAluCSV(t){const l=t.trim().split('\n'),d={};for(let i=1;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(c){c=c.toUpperCase();if(!isValidCode(c))continue;const v=parseInt(cr[2].replace(/,/g,'')||0,10);if(!d[c])d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{'คงเหลือ':v}};else d[c].stocks['คงเหลือ']+=v}}return d}
function parsePvcCSV(t){const l=t.trim().split('\n'),d={};const hr=l[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c=>c.trim().replace(/^"|"$/g,''));const hm=[];for(let i=2;i<hr.length;i++)if(hr[i]&&!isNaN(parseInt(hr[i])))hm.push({index:i,label:hr[i]});for(let i=2;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(c){c=c.toUpperCase();if(!isValidCode(c))continue;if(!d[c])d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{}};hm.forEach(h=>{if(cr.length>h.index)d[c].stocks[h.label]=(d[c].stocks[h.label]||0)+parseInt(cr[h.index].replace(/,/g,'')||0,10)})}}return d}
function parseRollerCSV(t){const l=t.trim().split('\n'),d={};for(let i=3;i<l.length;i++){const r=l[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/),cr=r.map(c=>c?c.trim().replace(/^"|"$/g,''):'');let c=cr[0];if(c){c=c.toUpperCase();if(!isValidCode(c))continue;const v=parseInt(cr[2].replace(/,/g,'')||0,10);if(!d[c])d[c]={name:cr[1]||'ไม่ระบุชื่อ',stocks:{'คงเหลือ':v}};else d[c].stocks['คงเหลือ']+=v}}return d}

async function fetchData(sysId) {
    const system = sysId || currentSystem; 
    if (cache[system]) return cache[system];
    let url = (system==='WOOD')?WOOD_CSV_URL:(system==='ALU')?ALU_CSV_URL:(system==='PVC')?PVC_CSV_URL:ROLLER_CSV_URL;
    try {
        const response = await fetch(url, { cache: "no-store" }); if (!response.ok) throw new Error('Network Error');
        const text = await response.text(); let parsedData;
        if (system==='WOOD') parsedData = parseWoodCSV(text); else if (system==='ALU') parsedData = parseAluCSV(text); else if (system==='PVC') parsedData = parsePvcCSV(text); else parsedData = parseRollerCSV(text);
        cache[system] = parsedData; 
        if (currentSystem === system) {
            document.getElementById('lastUpdateDisplay').innerText = new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'; 
        }
        return parsedData;
    } catch (e) { console.error(e); throw e; }
}

async function updateProductList() {
    const activeSystem = currentSystem; 
    const browse = document.getElementById('browseListContainer');
    browse.innerHTML = `<div class="flex justify-center items-center h-full text-slate-400"><span class="loader w-6 h-6 border-2 border-slate-300 border-t-sunny-red rounded-full mr-2"></span> กำลังโหลด...</div>`;
    try {
        const data = await fetchData(activeSystem);
        if (currentSystem !== activeSystem) return;

        const browseContent = document.createDocumentFragment();
        const codes = Object.keys(data).sort();
        if(codes.length===0) { browse.innerHTML = `<div class="text-center text-slate-400 mt-10">ไม่พบสินค้า</div>`; return; }
        
        codes.forEach(code => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left bg-slate-50 hover:bg-red-50 p-4 rounded-xl border border-slate-100 hover:border-red-100 transition-all flex justify-between items-center group btn-bounce mb-2";
            btn.onclick = () => { document.getElementById('productCodeInput').value = code; toggleCodeListModal(false); searchProduct(); };
            btn.innerHTML = `<div><span class="block font-bold text-lg text-slate-700 group-hover:text-sunny-red transition-colors">${code}</span></div><svg class="h-5 w-5 text-slate-300 group-hover:text-sunny-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`;
            browseContent.appendChild(btn);
        });
        browse.innerHTML = '';
        browse.appendChild(browseContent);
    } catch (error) { browse.innerHTML = `<div class="text-center text-red-400 mt-10">โหลดรายชื่อไม่สำเร็จ</div>`; }
}

async function searchProduct() {
    const input = document.getElementById('productCodeInput'); 
    const code = input.value.trim().toUpperCase(); 
    document.getElementById('suggestion-box').classList.add('hidden');
    if (!code) return;
    
    const ids = ['loadingIndicator', 'productCard', 'errorMessage', 'initialMessage']; 
    ids.forEach(id => document.getElementById(id).classList.add('hidden')); 
    
    document.getElementById('loadingIndicator').classList.remove('hidden'); 
    const btn = document.getElementById('searchButton'); 
    btn.disabled = true; 
    btn.innerHTML = '<span class="loader block w-5 h-5 border-2 border-white/50 border-t-white rounded-full"></span>';
    
    try {
        const data = await fetchData(currentSystem); 
        const result = data[code];
        document.getElementById('loadingIndicator').classList.add('hidden'); 
        btn.disabled = false; 
        btn.innerText = 'ค้นหา';
        
        if (result) {
            document.getElementById('productCodeDisplay').innerText = code; 
            document.getElementById('productName').innerText = result.name;
            const grid = document.getElementById('stockGrid'); 
            grid.innerHTML = '';
            const isSingle = currentSystem === 'ROLLER' || currentSystem === 'ALU';
            grid.className = isSingle ? 'grid grid-cols-1 gap-4 pb-4 max-w-sm mx-auto' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-4';
            
            const createCard = (label, sub, qty) => {
                const isZero = qty === 0, isLow = qty > 0 && qty < 20;
                return `<div class="bento-card relative rounded-2xl p-4 border flex flex-col justify-between ${isSingle?'h-40 items-center justify-center text-center':'h-28'} ${isZero?'bg-slate-50 opacity-60 text-slate-400':(isLow?'bg-white border-red-200 ring-1 ring-red-100 text-red-600':'bg-white text-slate-800')} shadow-sm group">
                    <div class="${isSingle?'w-full flex justify-between mb-2':'flex justify-between items-start'}"><div><span class="font-bold text-base md:text-lg">${label}</span>${sub?`<span class="block text-[10px] bg-slate-100 px-1.5 rounded-md w-fit mt-0.5 ${isSingle?'mx-auto':''}">${sub}</span>`:''}</div><div class="rounded-full p-1 ${isZero?'bg-red-100 text-red-400':(isLow?'bg-red-500 text-white':'bg-green-500 text-white')}"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${isZero?'M6 18L18 6M6 6l12 12':'M5 13l4 4L19 7'}"></path></svg></div></div>
                    <div class="${isSingle?'text-center mt-2':'text-right'}"><span class="block ${isSingle?'text-5xl':'text-3xl'} font-black tracking-tight leading-none">${qty.toLocaleString()}</span>${isSingle?'<span class="text-sm text-slate-400 mt-1 block">คงเหลือ</span>':''}</div></div>`;
            };

            if(currentSystem==='WOOD') Object.keys(STOCK_COLUMNS_WOOD).forEach(k => grid.innerHTML+=createCard(k, STOCK_COLUMNS_WOOD[k].meter, result.stocks[k]));
            else if(currentSystem==='PVC') Object.keys(result.stocks).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(k => grid.innerHTML+=createCard(`สูง ${k}`, 'ซม.', result.stocks[k]));
            else grid.innerHTML += createCard('จำนวนคงเหลือ', '', result.stocks['คงเหลือ']);
            document.getElementById('productCard').classList.remove('hidden');
        } else {
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('errorText').innerText = `ไม่พบรหัส: ${code} ในระบบ ${appConfig.menus.find(m=>m.id===currentSystem).name}`;
        }
    } catch (error) { 
        console.error(error); 
        document.getElementById('loadingIndicator').classList.add('hidden'); 
        btn.disabled = false; 
        btn.innerText = 'ค้นหา'; 
        document.getElementById('errorMessage').classList.remove('hidden'); 
        document.getElementById('errorText').innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'; 
    }
}

function setupAutocomplete() {
    const input = document.getElementById('productCodeInput');
    const box = document.getElementById('suggestion-box');
    if(!input || !box) return; 

    const showSuggestions = () => {
        const val = input.value.trim().toUpperCase();
        const data = cache[currentSystem];
        if (!data) return;

        const codes = Object.keys(data).sort();
        let matches = [];
        
        if (!val) {
            matches = codes.slice(0, 50);
        } else {
            const starts = codes.filter(c => c.startsWith(val));
            const includes = codes.filter(c => !c.startsWith(val) && c.includes(val));
            matches = [...starts, ...includes].slice(0, 50);
        }

        if (matches.length === 0) {
            box.classList.add('hidden');
            return;
        }

        let html = '';
        matches.forEach(code => {
            const name = data[code].name || '';
            const displayCode = val ? code.replace(val, `<span class="text-sunny-red bg-red-50">${val}</span>`) : code;
            
            html += `
                <div class="p-3 hover:bg-red-50 cursor-pointer flex justify-between items-center transition-colors group" onclick="selectSuggestion('${code}')">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-sunny-red transition-colors"></span>
                        <span class="font-bold text-slate-700 text-lg">${displayCode}</span>
                    </div>
                    <span class="text-xs text-slate-400 font-normal bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover:border-red-100 group-hover:text-sunny-red transition-colors">${name}</span>
                </div>
            `;
        });
        
        box.innerHTML = html;
        box.classList.remove('hidden');
    };

    input.addEventListener('input', showSuggestions);
    input.addEventListener('focus', showSuggestions);
    
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !box.contains(e.target)) {
            box.classList.add('hidden');
        }
    });
}

function selectSuggestion(code) {
    const input = document.getElementById('productCodeInput');
    input.value = code;
    document.getElementById('suggestion-box').classList.add('hidden');
    searchProduct();
}
