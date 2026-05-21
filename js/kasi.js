/**
 * KASI DASHBOARD ENGINE - HIERARCHY ACCORDION RY
 * Version: Card-in-Card UI & Smart Territory Mapping
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
        const rootData = result.data && result.data.koridors ? result.data : (result.data || result);

        if (!result.status) {
            console.error("Gagal ambil data:", result.message);
            if (overlay) overlay.classList.add('overlay-slide-up');
            return;
        }

        const koridors = rootData.koridors || [];
        const timRaw = rootData.engineers || [];

        let totalH = 0, selesaiH = 0, totalA = 0;
        koridors.forEach(k => {
            totalH += parseInt(k.total_halte || 0);
            selesaiH += parseInt(k.selesai || 0);
            totalA += parseInt(k.total_perangkat || 0);
        });

        const globalProgress = totalH > 0 ? Math.round((selesaiH / totalH) * 100) : 0;

        document.getElementById("totalHalte").innerText = totalH;
        document.getElementById("halteSelesai").innerText = selesaiH;
        document.getElementById("totalPerangkat").innerText = totalA;
        document.getElementById("totalTim").innerText = timRaw.length;
        
        document.getElementById("globalProgress").innerText = globalProgress + "%";
        setTimeout(() => {
            document.getElementById("globalProgressBar").style.width = globalProgress + "%";
        }, 500);

        // Render dengan sistem Accordion Hierarki
        renderHierarkiTim(timRaw);
        renderKoridor(koridors);

        setTimeout(() => {
            if (spinnerStage && welcomeStage && welcomeNama) {
                spinnerStage.classList.add('hidden');
                welcomeNama.innerText = namaKasi;
                welcomeStage.classList.remove('hidden');
                setTimeout(() => welcomeStage.classList.remove('opacity-0'), 50);
                setTimeout(() => { if (overlay) overlay.classList.add('overlay-slide-up'); }, 3000);
            } else {
                if (overlay) overlay.classList.add('overlay-slide-up');
            }
        }, 400);

    } catch (err) {
        console.error("Gagal Sinkronisasi Kasi:", err);
        if (overlay) overlay.classList.add('overlay-slide-up');
    }
}

// ================= SMART HIERARCHY ACCORDION =================
function renderHierarkiTim(list) {
    const container = document.getElementById("engineerList");
    if (!list || list.length === 0) {
        container.innerHTML = `<div class="bg-slate-50 dark:bg-[#050b14] p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center"><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada data tim</p></div>`;
        return;
    }

    // Pisah mana Koordinator, mana Engineer
    const koords = list.filter(t => t.role.toLowerCase() === 'koordinator');
    const engs = list.filter(t => t.role.toLowerCase() === 'engineer');
    
    let html = "";
    let matchedEngNames = new Set();

    // 1. BUAT ACCORDION UNTUK TIAP KOORDINATOR
    koords.forEach((koor, index) => {
        const koorKors = String(koor.koridor_tugas).toLowerCase().trim();
        const isAll = koorKors === 'all';
        const koorNums = koorKors.match(/\d+/g) || [];

        // Cari anak buah berdasarkan irisan wilayah (Territory Match)
        let anakBuah = engs.filter(e => {
            const eKors = String(e.koridor_tugas).toLowerCase().trim();
            if (isAll || eKors === 'all') return true;
            const eNums = eKors.match(/\d+/g) || [];
            return eNums.some(num => koorNums.includes(num));
        });

        anakBuah.forEach(a => matchedEngNames.add(a.nama)); // Tandai sudah punya bos
        
        // Hitung total aset yang dikerjakan oleh tim ini (Bos + Anak Buah)
        const totalAsetTim = anakBuah.reduce((sum, el) => sum + (el.selesai || 0), 0) + (koor.selesai || 0);
        const accId = `acc-koor-${index}`;

        html += `
        <div class="bg-slate-50 dark:bg-[#050b14] rounded-[1.25rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:border-purple-300 dark:hover:border-purple-900/50">
            <div onclick="toggleAccordion('${accId}')" class="p-3.5 flex items-center gap-3 cursor-pointer select-none group bg-white dark:bg-[#111c3a] hover:bg-slate-50 dark:hover:bg-[#15234b] transition-colors">
                <div class="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform">👑</div>
                <div class="flex-grow">
                    <h3 class="font-black text-slate-800 dark:text-white text-xs uppercase leading-tight">${koor.nama}</h3>
                    <p class="text-[8px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">KOR: ${koor.koridor_tugas}</p>
                </div>
                <div class="text-right pr-3 border-r border-slate-200 dark:border-slate-700">
                    <span class="text-sm font-black text-purple-600 dark:text-purple-400">${totalAsetTim}</span>
                    <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Tim Aset</p>
                </div>
                <div class="text-slate-300 dark:text-slate-600 pl-1 text-xs font-black transition-transform duration-300" id="icon-${accId}">▼</div>
            </div>

            <div id="${accId}" class="max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                <div class="p-3 space-y-2.5 bg-slate-50/50 dark:bg-[#050b14] border-t border-slate-100 dark:border-slate-800/50">
                    ${renderListAnakBuah(anakBuah)}
                </div>
            </div>
        </div>`;
    });

    // 2. TIM INDEPENDEN (Jika ada engineer yang ga masuk ke koridor koordinator manapun)
    const independentEngs = engs.filter(e => !matchedEngNames.has(e.nama));
    if (independentEngs.length > 0) {
        const totalAsetInd = independentEngs.reduce((sum, el) => sum + (el.selesai || 0), 0);
        const accId = `acc-independen`;
        
        html += `
        <div class="bg-slate-50 dark:bg-[#050b14] rounded-[1.25rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mt-4">
            <div onclick="toggleAccordion('${accId}')" class="p-3.5 flex items-center gap-3 cursor-pointer select-none group bg-slate-100 dark:bg-[#1a294d] hover:bg-slate-200 dark:hover:bg-[#203461] transition-colors">
                <div class="w-10 h-10 rounded-xl bg-slate-600 text-white flex items-center justify-center text-lg shadow-inner shrink-0">🚀</div>
                <div class="flex-grow">
                    <h3 class="font-black text-slate-700 dark:text-slate-200 text-xs uppercase leading-tight">Tim Independen</h3>
                    <p class="text-[8px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">Lintas Koridor</p>
                </div>
                <div class="text-right pr-3 border-r border-slate-300 dark:border-slate-600">
                    <span class="text-sm font-black text-slate-700 dark:text-slate-300">${totalAsetInd}</span>
                    <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Total Aset</p>
                </div>
                <div class="text-slate-400 pl-1 text-xs font-black transition-transform duration-300" id="icon-${accId}">▼</div>
            </div>
            <div id="${accId}" class="max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                <div class="p-3 space-y-2.5 border-t border-slate-200 dark:border-slate-800">
                    ${renderListAnakBuah(independentEngs)}
                </div>
            </div>
        </div>`;
    }

    container.innerHTML = html;
}

// Sub-fungsi untuk merender list anak buah di dalam collapse
function renderListAnakBuah(engs) {
    if(engs.length === 0) return `<p class="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest py-2">Tidak ada engineer bertugas</p>`;
    
    let html = "";
    engs.forEach(eng => {
        html += `
        <div class="flex items-center gap-3 bg-white dark:bg-[#0a1224] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-300 dark:hover:border-cyan-800 transition-colors">
            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#111c3a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shrink-0">👷</div>
            <div class="flex-grow">
                <h3 class="font-black text-slate-700 dark:text-slate-200 text-[10px] uppercase leading-tight">${eng.nama}</h3>
                <span class="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">KOR: ${eng.koridor_tugas}</span>
            </div>
            <div class="text-right pl-2 border-l border-slate-100 dark:border-slate-800">
                <span class="text-xs font-black text-cyan-600 dark:text-cyan-400">${eng.selesai || 0}</span>
                <p class="text-[6px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Aset</p>
            </div>
        </div>`;
    });
    return html;
}

// Fungsi Trigger Accordion Tim
function toggleAccordion(elementId) {
    const el = document.getElementById(elementId);
    const icon = document.getElementById(`icon-${elementId}`);
    if (el.style.maxHeight && el.style.maxHeight !== "0px") {
        el.style.maxHeight = "0px";
        if (icon) icon.style.transform = "rotate(0deg)";
    } else {
        el.style.maxHeight = el.scrollHeight + "px";
        if (icon) icon.style.transform = "rotate(180deg)";
    }
}

// RENDER KORIDOR (INNER CARD)
function renderKoridor(list) {
    const container = document.getElementById("koridorList");
    let html = "";
    
    if (!list || list.length === 0) {
        container.innerHTML = `<div class="col-span-full"><p class="text-center py-10 text-slate-400 text-[10px] font-black uppercase tracking-widest">Data Wilayah Tidak Ditemukan</p></div>`;
        return;
    }

    list.forEach(kor => {
        const prog = kor.progress || 0;
        const totalAlat = kor.total_perangkat || 0;
        const totalHalte = kor.total_halte || 0;
        
        // Kartu Inner (Lebih kontras di dalam pembungkus)
        html += `
            <div class="bg-slate-50 dark:bg-[#050b14] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all flex flex-col overflow-hidden">
                <div class="bg-white dark:bg-[#111c3a] p-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 bg-slate-800 dark:bg-cyan-950 text-white dark:text-cyan-400 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm">
                            ${kor.id}
                        </div>
                        <h3 class="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Jalur Koridor ${kor.id}</h3>
                    </div>
                    <span class="text-sm font-black text-cyan-600 dark:text-cyan-400">${prog}%</span>
                </div>
                <div class="p-4 flex-grow flex flex-col justify-center">
                    <div class="w-full bg-slate-200 dark:bg-[#111c3a] h-1.5 rounded-full overflow-hidden mb-4 border border-slate-300/50 dark:border-slate-700/50">
                        <div class="bg-cyan-500 h-full transition-all duration-1000" style="width: ${prog}%"></div>
                    </div>
                    <div class="flex justify-between items-center px-1">
                        <div>
                            <p class="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Total Halte</p>
                            <p class="text-xs font-black text-slate-700 dark:text-slate-200">${kor.selesai} <span class="text-[8px] text-slate-400 font-bold">/ ${totalHalte}</span></p>
                        </div>
                        <div class="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
                        <div class="text-right">
                            <p class="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Aset Valid</p>
                            <p class="text-xs font-black text-emerald-600 dark:text-emerald-400">${totalAlat}</p>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    const content = document.getElementById('logoutModalContent');
    if(modal && content) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    } else {
        executeLogout();
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
