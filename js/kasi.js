/**
 * KASI DASHBOARD ENGINE - TWO-STAGE EXECUTIVE WELCOME RY
 * Version: High Contrast Card, Smart Welcome Transition Timer & Smooth Sliding Overlay
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
            // Tetap buka overlay biar ga stuck kalau error
            if (overlay) overlay.classList.add('overlay-slide-up');
            return;
        }

        const koridors = rootData.koridors || [];
        const engineers = rootData.engineers || [];

        // HAK ASES METRIK GLOBAL
        let totalH = 0, selesaiH = 0, totalA = 0;
        koridors.forEach(k => {
            totalH += parseInt(k.total_halte || 0);
            selesaiH += parseInt(k.selesai || 0);
            totalA += parseInt(k.total_perangkat || 0);
        });

        const globalProgress = totalH > 0 ? Math.round((selesaiH / totalH) * 100) : 0;

        // GELAR DATA KE SISI FRONTEND (DI BELAKANG LAYAR OVERLAY)
        document.getElementById("totalHalte").innerText = totalH;
        document.getElementById("halteSelesai").innerText = selesaiH;
        document.getElementById("totalPerangkat").innerText = totalA;
        document.getElementById("totalTim").innerText = engineers.length;
        
        document.getElementById("globalProgress").innerText = globalProgress + "%";
        setTimeout(() => {
            document.getElementById("globalProgressBar").style.width = globalProgress + "%";
        }, 500);

        renderEngineers(engineers);
        renderKoridor(koridors);

        // =========================================================
        // TIMING TRANSISI DAN SAMBUTAN PREMIUM DARI IDE LO RY!
        // =========================================================
        setTimeout(() => {
            if (spinnerStage && welcomeStage && welcomeNama) {
                // 1. Sembunyikan roda putar biasa
                spinnerStage.classList.add('hidden');
                
                // 2. Suntik nama Kasi ke papan sambutan
                welcomeNama.innerText = namaKasi;
                
                // 3. Gelar panggung sambutan & buat dia fade-in mulus
                welcomeStage.classList.remove('hidden');
                setTimeout(() => {
                    welcomeStage.classList.remove('opacity-0');
                }, 50);

                // 4. Biarkan Kasi membaca namanya yang megah selama 3 detik, lalu luncurkan overlay ke atas
                setTimeout(() => {
                    if (overlay) {
                        overlay.classList.add('overlay-slide-up');
                    }
                }, 3000);
            } else {
                // Fallback instan jika element htmlnya bermasalah
                if (overlay) overlay.classList.add('overlay-slide-up');
            }
        }, 400); // Penundaan awal biar putaran data pertamanya berasa real

    } catch (err) {
        console.error("Gagal Sinkronisasi Kasi:", err);
        if (overlay) overlay.classList.add('overlay-slide-up');
    }
}

// RENDER TIM GABUNGAN - SOLID VIEW
function renderEngineers(list) {
    const container = document.getElementById("engineerList");
    let html = "";
    
    if (!list || list.length === 0) {
        html = `<div class="bg-white dark:bg-[#0a1224] p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tidak ada data tim</p>
                </div>`;
    } else {
        list.forEach(tim => {
            const isKoor = tim.role.toLowerCase() === 'koordinator';
            const badgeBg = isKoor ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800' 
                                   : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
            const iconBg = isKoor ? 'bg-purple-500 text-white shadow-purple-500/30' 
                                  : 'bg-slate-100 dark:bg-[#111c3a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            const icon = isKoor ? '👑' : '👷';
            
            html += `
                <div class="bg-white dark:bg-[#0a1224] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none transition-all hover:border-cyan-500/50 dark:hover:border-cyan-700 card-hover flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner border ${iconBg} shrink-0">
                        ${icon}
                    </div>
                    <div class="flex-grow">
                        <h3 class="font-black text-slate-800 dark:text-white text-sm uppercase leading-tight">${tim.nama}</h3>
                        <div class="flex flex-wrap gap-2 mt-1.5">
                            <span class="text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${badgeBg}">${tim.role}</span>
                            <span class="text-[8px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#111c3a] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">KOR: ${tim.koridor_tugas || '-'}</span>
                        </div>
                    </div>
                    <div class="text-right border-l border-slate-100 dark:border-slate-800 pl-4 shrink-0">
                        <span class="text-xl font-black text-slate-800 dark:text-white">${tim.selesai || 0}</span>
                        <p class="text-[8px] font-black text-slate-400 dark:text-cyan-500 uppercase tracking-widest mt-0.5">Aset</p>
                    </div>
                </div>`;
        });
    }
    container.innerHTML = html;
}

// RENDER KORIDOR GRID - SEPARATED HEADER CARDS
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
        
        html += `
            <div class="bg-white dark:bg-[#0a1224] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none hover:shadow-xl dark:hover:shadow-cyan-900/20 transition-all card-hover flex flex-col overflow-hidden">
                <div class="bg-slate-50 dark:bg-[#111c3a] p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-slate-800 dark:bg-cyan-950 text-white dark:text-cyan-400 rounded-lg flex items-center justify-center font-black text-xs shadow-md border border-transparent dark:border-cyan-800">
                            ${kor.id}
                        </div>
                        <h3 class="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Jalur Koridor ${kor.id}</h3>
                    </div>
                    <span class="text-base font-black text-cyan-600 dark:text-cyan-400">${prog}%</span>
                </div>
                <div class="p-5 flex-grow flex flex-col justify-center">
                    <div class="w-full bg-slate-100 dark:bg-[#050b14] h-2 rounded-full overflow-hidden shadow-inner mb-5 border border-slate-200 dark:border-slate-800">
                        <div class="bg-cyan-500 h-full transition-all duration-1000" style="width: ${prog}%"></div>
                    </div>
                    <div class="flex justify-between items-center px-2">
                        <div>
                            <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Halte</p>
                            <p class="text-sm font-black text-slate-700 dark:text-slate-200">${kor.selesai} <span class="text-[10px] text-slate-400 font-bold">/ ${totalHalte}</span></p>
                        </div>
                        <div class="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2"></div>
                        <div class="text-right">
                            <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Aset Valid</p>
                            <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">${totalAlat}</p>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

// ================= PREMIUM MODAL CONTROL =================
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
