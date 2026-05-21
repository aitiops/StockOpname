/**
 * KASI DASHBOARD ENGINE - FULL FINAL VERSION
 * Fix: BusLam Identity (Ryan Garry), Premium Logout Modal, & Unified Loading
 */

window.onload = () => {
    const nama = localStorage.getItem("nama");
    if (document.getElementById("namaUser")) {
        document.getElementById("namaUser").innerText = nama || "Kasi";
    }
    loadDashboardKasi();
};

async function loadDashboardKasi() {
    const overlay = document.getElementById("loadingOverlay");
    const spinnerStage = document.getElementById("spinnerStage");
    const welcomeStage = document.getElementById("welcomeStage");
    const welcomeNama = document.getElementById("welcomeNama");
    
    const token = localStorage.getItem("token");
    const namaKasi = localStorage.getItem("nama") || "Kepala Seksi";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardKasi", token: token })
        });
        const result = await res.json();
        const rootData = result.data || result;

        if (!result.status) {
            if (overlay) overlay.classList.add('overlay-slide-up');
            return;
        }

        const koridors = rootData.koridors || [];
        const timRaw = rootData.engineers || [];

        // Kalkulasi Statistik
        let totalH = 0, selesaiH = 0, totalA = 0;
        koridors.forEach(k => {
            totalH += parseInt(k.total_halte || 0);
            selesaiH += parseInt(k.selesai || 0);
            totalA += parseInt(k.total_perangkat || 0);
        });

        document.getElementById("totalHalte").innerText = totalH;
        document.getElementById("halteSelesai").innerText = selesaiH;
        document.getElementById("totalPerangkat").innerText = totalA;
        document.getElementById("totalTim").innerText = timRaw.length;
        document.getElementById("globalProgress").innerText = (totalH > 0 ? Math.round((selesaiH / totalH) * 100) : 0) + "%";
        document.getElementById("globalProgressBar").style.width = (totalH > 0 ? Math.round((selesaiH / totalH) * 100) : 0) + "%";

        renderHierarkiTim(timRaw);
        renderKoridor(koridors);

        setTimeout(() => {
            spinnerStage.classList.add('hidden');
            welcomeNama.innerText = namaKasi;
            welcomeStage.classList.remove('hidden');
            setTimeout(() => welcomeStage.classList.remove('opacity-0'), 50);
            setTimeout(() => { if (overlay) overlay.classList.add('overlay-slide-up'); }, 1500);
        }, 400);

    } catch (err) {
        if (overlay) overlay.classList.add('overlay-slide-up');
    }
}

function renderHierarkiTim(list) {
    const container = document.getElementById("engineerList");
    const koords = list.filter(t => t.role.toLowerCase() === 'koordinator');
    const engs = list.filter(t => t.role.toLowerCase() === 'engineer');
    
    let html = "";
    let matchedEngNames = new Set();

    koords.forEach((koor, index) => {
        const koorNums = String(koor.koridor_tugas).match(/\d+/g) || [];
        let anakBuah = engs.filter(e => {
            const eNums = String(e.koridor_tugas).match(/\d+/g) || [];
            return eNums.some(num => koorNums.includes(num));
        });
        anakBuah.forEach(a => matchedEngNames.add(a.nama));
        
        const totalAsetTim = anakBuah.reduce((sum, el) => sum + (el.selesai || 0), 0) + (koor.selesai || 0);
        const accId = `acc-koor-${index}`;

        html += `
        <div class="bg-slate-50 dark:bg-[#050b14] rounded-[1.25rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div onclick="toggleAccordion('${accId}')" class="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-[#111c3a] hover:bg-slate-50 dark:hover:bg-[#15234b] transition-colors">
                <div class="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg shrink-0">👑</div>
                <div class="flex-grow">
                    <h3 class="font-black text-slate-800 dark:text-white text-xs uppercase">${koor.nama}</h3>
                    <p class="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">KOR: ${koor.koridor_tugas}</p>
                </div>
                <div class="text-right pr-3 border-r border-slate-200 dark:border-slate-700">
                    <span class="text-sm font-black text-purple-600 dark:text-purple-400">${totalAsetTim}</span>
                </div>
                <div class="text-slate-300 dark:text-slate-600 pl-1 text-xs font-black" id="icon-${accId}">▼</div>
            </div>
            <div id="${accId}" class="max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                <div class="p-3 space-y-2.5 bg-slate-50/50 dark:bg-[#050b14] border-t border-slate-200 dark:border-slate-800">${renderListAnakBuah(anakBuah)}</div>
            </div>
        </div>`;
    });

    const independentEngs = engs.filter(e => !matchedEngNames.has(e.nama));
    const isBusLam = independentEngs.every(e => String(e.koridor_tugas).toLowerCase().includes('buslam'));
    
    if (independentEngs.length > 0) {
        const totalAsetInd = independentEngs.reduce((sum, el) => sum + (el.selesai || 0), 0);
        const accId = `acc-buslam`;
        html += `
        <div class="bg-slate-50 dark:bg-[#050b14] rounded-[1.25rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mt-4">
            <div onclick="toggleAccordion('${accId}')" class="p-3.5 flex items-center gap-3 cursor-pointer bg-slate-100 dark:bg-[#1a294d] hover:bg-slate-200 dark:hover:bg-[#203461] transition-colors">
                <div class="w-10 h-10 rounded-xl bg-slate-600 text-white flex items-center justify-center text-lg shrink-0">🚀</div>
                <div class="flex-grow">
                    <h3 class="font-black text-slate-700 dark:text-slate-200 text-xs uppercase">${isBusLam ? "RYAN GARRY" : "Tim Independen"}</h3>
                    <p class="text-[8px] font-bold text-slate-500 uppercase tracking-wider">${isBusLam ? "KOR: BUSLAM" : "Lintas Koridor"}</p>
                </div>
                <div class="text-right pr-3 border-r border-slate-300 dark:border-slate-600">
                    <span class="text-sm font-black text-slate-700 dark:text-slate-300">${totalAsetInd}</span>
                </div>
                <div class="text-slate-400 pl-1 text-xs font-black" id="icon-${accId}">▼</div>
            </div>
            <div id="${accId}" class="max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                <div class="p-3 space-y-2.5 border-t border-slate-200 dark:border-slate-800">${renderListAnakBuah(independentEngs)}</div>
            </div>
        </div>`;
    }
    container.innerHTML = html;
}

function renderListAnakBuah(list) {
    return list.map(e => `
        <div class="flex justify-between items-center bg-white dark:bg-[#111c3a] p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">${e.nama}</span>
            <span class="text-[10px] font-black text-slate-400">${e.selesai || 0} ASET</span>
        </div>
    `).join("");
}

function toggleAccordion(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el.style.maxHeight && el.style.maxHeight !== "0px") {
        el.style.maxHeight = "0px";
        if (icon) icon.style.transform = "rotate(0deg)";
    } else {
        el.style.maxHeight = el.scrollHeight + "px";
        if (icon) icon.style.transform = "rotate(180deg)";
    }
}

// PREMIUM LOGOUT MODAL & ACTIONS
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    const content = document.getElementById('logoutModalContent');
    if(modal && content) {
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); content.classList.remove('scale-95'); content.classList.add('scale-100'); }, 10);
    }
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    const content = document.getElementById('logoutModalContent');
    if(modal && content) {
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function executeLogout() {
    localStorage.clear();
    window.location.href = "index.html";
}
