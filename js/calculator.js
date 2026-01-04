// js/calculator.js

let calcMode = 'EXT';
let calcUnit = 'm';
let calcItems = [];
let currentEditingId = null; 
let currentEditingDocId = null;
let tempQuotes = [];

function parsePriceCSV(text) {
    const lines = text.trim().split('\n');
    const data = {};
    lines.forEach(line => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2) {
            let size = cols[0];
            let price = parseFloat(cols[1].replace(/,/g, ''));
            if (size && !isNaN(price)) {
                data[size] = price;
            }
        }
    });
    return data;
}

async function loadAlu25PriceData() {
    if (!alu25Cache.STD) {
        try {
            const res = await fetch(ALU25_STD_URL);
            const text = await res.text();
            alu25Cache.STD = parsePriceCSV(text);
        } catch(e) { console.error("Error loading ALU STD", e); }
    }
    if (!alu25Cache.CHAIN) {
        try {
            const res = await fetch(ALU25_CHAIN_URL);
            const text = await res.text();
            alu25Cache.CHAIN = parsePriceCSV(text);
        } catch(e) { console.error("Error loading ALU CHAIN", e); }
    }
}

function switchCalcMode(mode) {
    openCalculator(mode);
    toggleSidebar();
}

function openCalculator(mode) {
    calcMode = mode;
    document.getElementById('searchSection').classList.add('hidden');
    document.getElementById('calculatorSection').classList.remove('hidden');
    
    const titleText = document.getElementById('calcTitleText');
    const titleIcon = document.getElementById('calcTitleIcon');
    const priceInput = document.getElementById('calcPrice');
    const sysSelect = document.getElementById('calcSystemSelectContainer');

    if (mode === 'EXT') {
        titleText.innerText = 'คำนวณม่านม้วนภายนอก';
        titleIcon.innerText = '🪟';
        sysSelect.classList.add('hidden');
        priceInput.readOnly = false;
        priceInput.placeholder = "ระบุราคา";
        priceInput.value = "";
    } else if (mode === 'INT') {
        titleText.innerText = 'คำนวณราคาม่านม้วน';
        titleIcon.innerText = '🏠';
        sysSelect.classList.add('hidden');
        priceInput.readOnly = false;
        priceInput.placeholder = "ระบุราคา";
        priceInput.value = "";
    } else if (mode === 'ALU25') {
        titleText.innerText = 'คำนวณมู่ลี่อลูมิเนียม 25mm.';
        titleIcon.innerText = '📏';
        sysSelect.classList.remove('hidden');
        priceInput.readOnly = true;
        priceInput.placeholder = "รอค้นหาอัตโนมัติ...";
        priceInput.value = "";
        loadAlu25PriceData(); 
    }

    renderCalcTable();
}

function addCalcItem() {
    const wInput = parseFloat(document.getElementById('calcW').value);
    const hInput = parseFloat(document.getElementById('calcH').value);
    const qty = parseInt(document.getElementById('calcQty').value) || 1;
    
    if(!wInput || !hInput) { alert('กรุณากรอกความกว้างและความสูง'); return; }

    let price = 0;
    let totalPerSet = 0;
    let details = ``;
    let finalW = wInput;
    let finalH = hInput;
    let displayUnit = 'm';
    let systemLabel = '';

    if (calcMode === 'ALU25') {
        const roundCustom = (val) => Math.round(val / 10) * 10;
        let lookupW = roundCustom(wInput);
        let lookupH = roundCustom(hInput);
        finalW = wInput;
        finalH = hInput; 
        displayUnit = 'cm';
        const key = `${lookupW}*${lookupH}`;
        const sysType = document.querySelector('input[name="aluSystem"]:checked').value;
        const db = sysType === 'STD' ? alu25Cache.STD : alu25Cache.CHAIN;
        systemLabel = sysType === 'STD' ? 'มู่ลี่อลูมิเนียม (ธรรมดา)' : 'มู่ลี่อลูมิเนียม (โซ่วน)';

        if (!db || !db[key]) {
            alert(`ไม่พบราคาสำหรับขนาด ${lookupW}x${lookupH} (ปัดเศษจาก ${wInput}x${hInput}) ในระบบ ${sysType === 'STD' ? 'ธรรมดา' : 'โซ่วน'}`);
            return;
        }

        price = db[key];
        totalPerSet = price;
        details = `ขนาดจริง: ${wInput}x${hInput} cm<br>ปรับขนาดคำนวณ: ${lookupW}x${lookupH} cm<br>ระบบ: ${sysType==='STD'?'ธรรมดา':'โซ่วน'}<br>ราคาตามตาราง: ${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;
        document.getElementById('calcPrice').value = price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    } else {
        price = parseFloat(document.getElementById('calcPrice').value);
        if(!price) { alert('กรุณาระบุราคา'); return; }

        systemLabel = calcMode === 'EXT' ? 'ม่านม้วนภายนอก' : 'ม่านม้วน';
        const wM = (wInput >= 10) ? wInput / 100 : wInput;
        const hM = (hInput >= 10) ? hInput / 100 : hInput;
        finalW = wM.toFixed(2);
        finalH = hM.toFixed(2);
        displayUnit = 'm';

        const f = appConfig.calcSettings.factors;
        let rawArea = wM * hM * f.fabricMult;
        let finalArea = rawArea < f.minArea ? f.minArea : rawArea;
        let fabricCost = finalArea * price;

        if(calcMode === 'EXT') {
            const topRail = wM * f.railTop;
            const botRail = wM * f.railBot;
            const sling = hM * f.sling * 2;
            totalPerSet = fabricCost + f.eqExt + topRail + botRail + sling;
            details = `ราคาผ้า: ${finalW}x${finalH}x${f.fabricMult} = ${rawArea.toFixed(2)} ${rawArea<f.minArea?`(ปรับเป็น ${f.minArea})`:''} x ${price} = ${fabricCost.toLocaleString()} บ.<br>ค่าอุปกรณ์: ${f.eqExt.toLocaleString()} บ.<br>รางบน: ${finalW}x${f.railTop} = ${topRail.toLocaleString()} บ.<br>รางล่าง: ${finalW}x${f.railBot} = ${botRail.toLocaleString()} บ.<br>สลิง: ${finalH}x${f.sling}x2 = ${sling.toLocaleString()} บ.`;
        } else {
            totalPerSet = fabricCost;
            details = `ราคาผ้า: ${finalW}x${finalH}x${f.fabricMult} = ${rawArea.toFixed(2)} ${rawArea<f.minArea?`(ปรับเป็น ${f.minArea})`:''} x ${price} = ${fabricCost.toLocaleString()} บ.`;
        }
    }
    
    const grandTotal = totalPerSet * qty;
    calcItems.push({ w: finalW, h: finalH, unit: displayUnit, price: price, qty: qty, totalPerSet: totalPerSet, grandTotal: grandTotal, details: details, label: systemLabel });
    renderCalcTable();
    document.getElementById('calcW').value = '';
    document.getElementById('calcH').value = '';
    if(calcMode !== 'ALU25') document.getElementById('calcPrice').value = ''; 
}

function renderCalcTable() {
    const tbody = document.getElementById('calcTableBody');
    tbody.innerHTML = '';
    let sum = 0;
    calcItems.forEach((item, idx) => {
        sum += item.grandTotal;
        tbody.innerHTML += `
            <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td class="px-3 py-3 font-bold">
                    ชุดที่ ${idx+1}
                    <div class="text-xs text-slate-400 font-normal">${item.label || ''}</div>
                </td>
                <td class="px-3 py-3 text-slate-500">${item.w}x${item.h} ${item.unit}</td>
                <td class="px-3 py-3 text-right">${item.totalPerSet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="px-3 py-3 text-right font-bold">${item.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="px-3 py-3 text-right"><button onclick="removeCalcItem(${idx})" class="text-red-300 hover:text-red-500 btn-bounce">x</button></td>
            </tr>`;
    });
    document.getElementById('totalItems').innerText = calcItems.length;
    document.getElementById('grandTotal').innerText = sum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function removeCalcItem(idx) { calcItems.splice(idx, 1); renderCalcTable(); }
function clearCalc() { calcItems = []; currentEditingId = null; currentEditingDocId = null; renderCalcTable(); }

function showQuotationModal() {
    if(calcItems.length === 0) { alert('ไม่มีรายการคำนวณ'); return; }
    document.getElementById('quotationModal').classList.remove('hidden');
    document.getElementById('qDate').innerText = new Date().toLocaleDateString('th-TH');
    
    let typeLabel = 'ใบเสนอราคา'; 
    if(calcMode === 'EXT') typeLabel = 'ม่านม้วนภายนอก';
    else if(calcMode === 'ALU25') typeLabel = 'มู่ลี่อลูมิเนียม';
    else typeLabel = 'ม่านม้วน';
    
    document.getElementById('qType').innerText = typeLabel;
    
    const tbody = document.getElementById('qBody');
    const detailContent = document.getElementById('qDetailContent');
    tbody.innerHTML = '';
    detailContent.innerHTML = '';
    let sum = 0;
    
    calcItems.forEach((item, idx) => {
        sum += item.grandTotal;
        tbody.innerHTML += `<tr><td class="py-2"><span class="font-bold">ชุดที่ ${idx+1}</span> <span class="text-xs text-slate-500 ml-2">(${item.w}x${item.h} ${item.unit})</span><div class="text-xs text-slate-400">${item.label || ''}</div></td><td class="py-2 text-center">${item.qty}</td><td class="py-2 text-right">${item.totalPerSet.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td class="py-2 text-right font-bold">${item.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>`;
        detailContent.innerHTML += `<div class="border-b border-slate-200 pb-2 last:border-0"><span class="font-bold text-sunny-red">ชุดที่ ${idx+1} (${item.label||''}):</span><br>${item.details}</div>`;
    });
    document.getElementById('qGrandTotal').innerText = sum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' บาท';
}

function closeQuotation() { document.getElementById('quotationModal').classList.add('hidden'); }
function toggleQDetails() { document.getElementById('qDetails').classList.toggle('hidden'); }
function captureQuotation() { html2canvas(document.querySelector("#quotationModal > div"), { scale: 2, useCORS: true }).then(canvas => { const link = document.createElement('a'); link.download = `Sunny_Quote_${Date.now()}.png`; link.href = canvas.toDataURL(); link.click(); }); }

function saveCurrentQuotation() {
    const user = currentUser;
    const isMember = user && !user.isAnonymous;
    
    if (isMember && (!db || !auth)) { alert('ระบบกำลังเชื่อมต่อฐานข้อมูล กรุณารอสักครู่แล้วลองใหม่...'); return; }

    try {
        if (!calcItems || !Array.isArray(calcItems) || calcItems.length === 0) { alert('ไม่พบรายการสินค้า กรุณาลองคำนวณใหม่'); return; }

        let isUpdate = false;
        if (currentEditingId || currentEditingDocId) {
            if (confirm("คุณกำลังแก้ไขรายการเดิม\nกด [ตกลง] เพื่อบันทึกทับรายการเดิม (Update)\nกด [ยกเลิก] เพื่อบันทึกเป็นรายการใหม่ (Save as New)")) { isUpdate = true; } 
        } else {
            const msg = isMember ? 'ยืนยันบันทึกเข้าระบบ (บัญชีของคุณ)?' : 'ยืนยันบันทึกใบเสนอราคา (ในเครื่องนี้)?';
            if (!confirm(msg)) return;
        }

        const finalId = (isUpdate && currentEditingId) ? currentEditingId : Date.now();
        let typeLabel = calcMode === 'EXT' ? 'ม่านม้วนภายนอก' : (calcMode === 'ALU25' ? 'มู่ลี่อลูมิเนียม 25mm.' : 'ม่านม้วน');

        const qData = { 
            id: finalId, date: new Date().toISOString(), type: typeLabel, 
            total: document.getElementById('qGrandTotal').innerText, 
            items: JSON.parse(JSON.stringify(calcItems)) 
        };
        
        if (isMember) {
            qData.uid = user.uid; qData.ownerEmail = user.email; qData.ownerName = user.displayName;
            if (isUpdate && currentEditingDocId) {
                db.collection("quotations").doc(currentEditingDocId).update(qData).then(() => { showToast("แก้ไขข้อมูลเรียบร้อย"); closeQuotation(); clearCalc(); }).catch(e => { console.error(e); alert("Error: " + e.message); });
            } else {
                delete qData.docId; 
                db.collection("quotations").add(qData).then(() => { showToast("บันทึกรายการใหม่เรียบร้อย"); closeQuotation(); clearCalc(); }).catch(e => { console.error(e); alert("Error: " + e.message); });
            }
        } else {
            let saved = [];
            try { saved = JSON.parse(localStorage.getItem('sunny_quotations')) || []; } catch(e) { saved = []; }
            if (isUpdate && currentEditingId) {
                const idx = saved.findIndex(x => x.id === currentEditingId);
                if (idx !== -1) saved[idx] = qData; else saved.push(qData);
            } else { saved.push(qData); }
            localStorage.setItem('sunny_quotations', JSON.stringify(saved));
            showToast("บันทึก (Guest) เรียบร้อย");
            closeQuotation(); clearCalc();
        }
    } catch (e) { console.error("Critical Save Error:", e); alert("Error: " + e.message); }
}
