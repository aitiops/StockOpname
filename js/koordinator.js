/**
 * KOORDINATOR DASHBOARD ENGINE - FINAL MULTI-SCOPE
 * Mendukung: Single Corridor, Multi (1,2,3), dan Master Access (all)
 */

window.onload = () => {
    const nama = localStorage.getItem("nama");
    if (document.getElementById("namaUser")) {
        document.getElementById("namaUser").innerText = nama || "Koordinator";
    }
    loadDashboardKoordinator();
};

async function loadDashboardKoordinator() {
    const statusEl = document.getElementById("loadingStatus");
    const overlay = document.getElementById("loadingOverlay");
    const token = localStorage.getItem("token");
    
    // Ambil data 'wilayah' dari Sheet via LocalStorage
    const wilayahAkses = localStorage.getItem("wilayah") || "";

    if (overlay) overlay.classList.add('loading-active');

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardKoordinator", token: token })
        });
        
        const result = await res.json();
        const data = result.data || result;

        // ==========================================
        // LOGIKA FILTER BERDASARKAN HAK AKSES
        // ==========================================
        let filteredKoridors = [];
        let allowedIDs = [];

        if (wilayahAkses.toLowerCase() === "all") {
            // Skenario 1: Akses Semua (Tim Malam)
            filteredKoridors = data.koridors || [];
        } else {
            // Skenario 2: Akses Spesifik (contoh: "1" atau "1,2,3")
            allowedIDs = wilayahAkses.split(",").map(id => id.trim());
            filteredKoridors = (data.koridors || []).filter(kor => allowedIDs.includes(String(kor.id)));
        }

        // ==========================================
        // HITUNG ULANG SUMMARY BERDASARKAN FILTER
        // ==========================================
        let totalH = 0, selesaiH = 0, totalA = 0;
        
        filteredKoridors.forEach(k => {
            totalH += parseInt(k.total_halte || 0);
            selesaiH += parseInt(k.selesai || 0);
            totalA += parseInt(k.total_perangkat || 0);
        });

        const totalProgress = totalH > 0 ? Math.round((selesaiH / totalH) * 100) : 0;

        document.getElementById("totalHalte").innerText = totalH;
        document.getElementById("halteSelesai").innerText = selesaiH;
        document.getElementById("progressVisit").innerText = totalProgress + "%";
        document.getElementById("totalPerangkat").innerText = totalA;

        // ==========================================
        // RENDER LISTS
        // ==========================================
        
        // Filter Engineer yang hanya kerja di wilayah Koordinator tersebut
        const filteredEngineers = wilayahAkses.toLowerCase() === "all" 
            ? (data.engineers || []) 
            : (data.engineers || []).filter(eng => allowedIDs.includes(String(eng.koridor_tugas)));
            
        renderEngineers(filteredEngineers);
        renderKoridor(filteredKoridors);

    } catch (err) {
        console.error("Gagal memuat data koordinator:", err);
    } finally {
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('loading-active');
                overlay.style.setProperty('display', 'none', 'important');
            }
        }, 800);
    }
}

function renderEngineers(list) {
    let html = "";
    if (!list || list.length === 0) {
        html = `<div class="bg-white p-10 rounded-[2rem] border border-dashed border-slate-200 text-center">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada engineer aktif di wilayah Anda</p>
                </div>`;
    } else {
        list.forEach(eng => {
            const prog = eng.progress || 0;
            html += `
                <div class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div class="flex justify-between items-center mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-lg">👷</div>
                            <div>
                                <h3 class="font-black text-slate-800 text-sm uppercase">${eng.nama}</h3>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Koridor ${eng.koridor_tugas || '-'}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-lg font-black text-[#0095DA]">${prog}%</span>
                        </div>
                    </div>
                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div class="bg-[#0095DA] h-full transition-all duration-1000" style="width: ${prog}%"></div>
                    </div>
                    <div class="flex justify-between mt-3 text-[9px] font-black uppercase text-slate-400">
                        <span>${eng.selesai || 0} SELESAI</span>
                        <span class="text-slate-300">TOTAL ${eng.total_tugas || 0} HALTE</span>
                    </div>
                </div>`;
        });
    }
    document.getElementById("engineerList").innerHTML = html;
}

function renderKoridor(list) {
    let html = "";
    if (!list || list.length === 0) {
        html = `<p class="text-center py-10 text-slate-400 text-[10px] font-black uppercase">DATA KORIDOR KOSONG</p>`;
    } else {
        list.forEach(kor => {
            const prog = kor.progress || 0;
            html += `
                <div class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-[#0095DA] transition-all">
                    <div class="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:bg-[#0095DA] transition-colors">
                        ${kor.id}
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-end mb-1">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Koridor ${kor.id}</span>
                            <span class="text-xs font-black text-slate-800">${prog}%</span>
                        </div>
                        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-slate-800 h-full group-hover:bg-[#0095DA] transition-all duration-1000" style="width: ${prog}%"></div>
                        </div>
                    </div>
                </div>`;
        });
    }
    document.getElementById("koridorList").innerHTML = html;
}

function logout() {
    if(confirm("Apakah Anda ingin logout?")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}
