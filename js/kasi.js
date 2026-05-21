/**
 * KASI DASHBOARD ENGINE - ULTRA PREMIUM EXECUTIVE
 * Version: Global Scope, Progress Visualizer, & Premium Modal Control
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
    const token = localStorage.getItem("token");

    if (overlay) {
        overlay.classList.add('loading-active');
        overlay.style.display = 'flex';
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardKasi", token: token })
        });
        const result = await res.json();
        const rootData = result.data && result.data.koridors ? result.data : (result.data || result);

        if (!result.status) {
            console.error("Gagal ambil data:", result.message);
            return;
        }

        const koridors = rootData.koridors || [];
        const engineers = rootData.engineers || [];

        // CALCULATE GLOBAL METRICS
        let totalH = 0, selesaiH = 0, totalA = 0;
        koridors.forEach(k => {
            totalH += parseInt(k.total_halte || 0);
            selesaiH += parseInt(k.selesai || 0);
            totalA += parseInt(k.total_perangkat || 0);
        });

        const globalProgress = totalH > 0 ? Math.round((selesaiH / totalH) * 100) : 0;

        // INJECT METRICS
        document.getElementById("totalHalte").innerText = totalH;
        document.getElementById("halteSelesai").innerText = selesaiH;
        document.getElementById("totalPerangkat").innerText = totalA;
        document.getElementById("totalTim").innerText = engineers.length;
        
        // MASTER PROGRESS BAR
        document.getElementById("globalProgress").innerText = globalProgress + "%";
        setTimeout(() => {
            document.getElementById("globalProgressBar").style.width = globalProgress + "%";
        }, 500);

        renderEngineers(engineers);
        renderKoridor(koridors);

    } catch (err) {
        console.error("Gagal Sinkronisasi Kasi:", err);
    } finally {
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('loading-active');
                overlay.style.setProperty('display', 'none', 'important');
            }
        }, 800);
    }
}

// RENDER TIM GABUNGAN (KOORDINATOR & ENGINEER)
function renderEngineers(list) {
    const container = document.getElementById("engineerList");
    let html = "";
    
    if (!list || list.length === 0) {
        html = `<div class="bg-white dark:bg-[#0c162d]/40 p-10 rounded-[2rem] border border-dashed border-slate-200 dark:border-cyan-900/30 text-center">
                    <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tidak ada data tim</p>
                </div>`;
    } else {
        list.forEach(tim => {
            const isKoor = tim.role.toLowerCase() === 'koordinator';
            const badgeColor = isKoor ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
            const icon = isKoor ? '👑' : '👷';
            
            html += `
                <div class="bg-white dark:bg-[#0c162d]/60 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800 hover:border-cyan-500/50 transition-all shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-slate-100 dark:bg-[#070d19] rounded-2xl flex items-center justify-center text-lg shadow-inner border border-transparent dark:border-slate-800">${icon}</div>
                        <div class="flex-grow">
                            <h3 class="font-black text-slate-800 dark:text-white text-xs uppercase leading-tight">${tim.nama}</h3>
                            <div class="flex gap-2 mt-1">
                                <span class="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeColor}">${tim.role}</span>
                                <span class="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">KOR: ${tim.koridor_tugas || '-'}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-base font-black text-slate-700 dark:text-white">${tim.selesai || 0}</span>
                            <p class="text-[7px] font-black text-slate-400 dark:text-cyan-500 uppercase tracking-widest">Aset</p>
                        </div>
                    </div>
                </div>`;
        });
    }
    container.innerHTML = html;
}

// RENDER KORIDOR GRID (EXECUTIVE VIEW)
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
            <div class="bg-white dark:bg-[#0c162d]/60 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all relative overflow-hidden group">
                <div class="absolute -right-6 -top-6 w-20 h-20 bg-cyan-500/5 blur-2xl rounded-full group-hover:bg-cyan-500/10 transition-all"></div>
                <div class="flex justify-between items-start mb-4">
                    <div class="w-10 h-10 bg-slate-800 dark:bg-cyan-950/50 text-white dark:text-cyan-400 rounded-xl flex items-center justify-center font-black text-sm shadow-md border border-transparent dark:border-cyan-800/50">
                        ${kor.id}
                    </div>
                    <div class="text-right">
                        <span class="text-lg font-black text-slate-800 dark:text-white">${prog}%</span>
                    </div>
                </div>
                
                <h3 class="text-[10px] font-black text-slate-400 dark:text-cyan-500/70 uppercase tracking-widest mb-3">Jalur Koridor ${kor.id}</h3>
                
                <div class="w-full bg-slate-100 dark:bg-slate-800/50 h-1.5 rounded-full overflow-hidden shadow-inner mb-4">
                    <div class="bg-cyan-500 h-full transition-all duration-1000" style="width: ${prog}%"></div>
                </div>
                
                <div class="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <div class="text-center">
                        <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Halte</p>
                        <p class="text-xs font-black text-slate-700 dark:text-slate-300">${kor.selesai}/${totalHalte}</p>
                    </div>
                    <div class="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
                    <div class="text-center">
                        <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Aset Valid</p>
                        <p class="text-xs font-black text-cyan-600 dark:text-cyan-400">${totalAlat}</p>
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
        // Sedikit delay untuk trigger animasi pop-up CSS Tailwind
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    } else {
        // Fallback aman kalau modal gak nemu
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
