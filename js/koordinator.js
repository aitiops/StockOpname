/**
 * KOORDINATOR DASHBOARD ENGINE - ULTRA PREMIUM EXECUTIVE VERSION
 * Version: Minimalist Interactive Pins & Clean Layout Overhaul (No More Overlapping Badges Ry)
 */

window.onload = () => {
    const nama = localStorage.getItem("nama");
    if (document.getElementById("namaUser")) {
        document.getElementById("namaUser").innerText = nama || "Koordinator";
    }
    loadDashboardKoordinator();
};

async function loadDashboardKoordinator() {
    const overlay = document.getElementById("loadingOverlay");
    const token = localStorage.getItem("token");
    const wilayahAkses = localStorage.getItem("wilayah") || "";

    if (overlay) {
        overlay.classList.add('loading-active');
        overlay.style.display = 'flex';
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardKoordinator", token: token })
        });
        
        const result = await res.json();
        const data = result.data || result;

        if (!result.status) {
            console.error("Gagal ambil data:", result.message);
            return;
        }

        // ==========================================
        // 1. FILTER DATA BERDASARKAN WILAYAH TUGAS
        // ==========================================
        let filteredKoridors = [];
        let allowedIDs = [];

        if (wilayahAkses.toLowerCase() === "all") {
            filteredKoridors = data.koridors || [];
        } else {
            allowedIDs = wilayahAkses.split(",").map(id => id.trim());
            filteredKoridors = (data.koridors || []).filter(kor => allowedIDs.includes(String(kor.id)));
        }

        // ==========================================
        // 2. HITUNG RINGKASAN (SUMMARY CARDS)
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
        // 3. RENDER DATA KE PANEL LAYAR
        // ==========================================
        const filteredEngineers = wilayahAkses.toLowerCase() === "all" 
            ? (data.engineers || []) 
            : (data.engineers || []).filter(eng => allowedIDs.includes(String(eng.koridor_tugas)));
            
        renderEngineers(filteredEngineers);
        renderKoridor(filteredKoridors);

    } catch (err) {
        console.error("Gagal Sinkronisasi Koordinator:", err);
    } finally {
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('loading-active');
                overlay.style.setProperty('display', 'none', 'important');
            }
        }, 800);
    }
}

// ================= RENDER TIM ENGINEER =================
function renderEngineers(list) {
    const container = document.getElementById("engineerList");
    let html = "";
    
    if (!list || list.length === 0) {
        html = `<div class="bg-white dark:bg-[#132247]/40 p-10 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 text-center backdrop-blur-sm">
                    <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tidak ada engineer aktif di wilayah Anda</p>
                </div>`;
    } else {
        list.forEach(eng => {
            const prog = eng.progress || 0; 
            html += `
                <div class="bg-white dark:bg-[#132247]/40 p-5 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm backdrop-blur-sm">
                    <div class="flex justify-between items-center mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-lg shadow-inner">👷</div>
                            <div>
                                <h3 class="font-black text-slate-800 dark:text-white text-sm uppercase leading-tight">${eng.nama}</h3>
                                <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-0.5">Tugas: Koridor ${eng.koridor_tugas || '-'}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-lg font-black text-[#0095DA]">${eng.selesai || 0}</span>
                            <p class="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alat Diinput</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                            <div class="bg-[#0095DA] h-full transition-all duration-1000" style="width: ${prog}%"></div>
                        </div>
                        <span class="text-[10px] font-black font-mono text-[#0095DA] min-w-[28px] text-right">${prog}%</span>
                    </div>
                </div>`;
        });
    }
    container.innerHTML = html;
}

// ================= RENDER KORIDOR ACCORDION SYSTEM Ry =================
function renderKoridor(list) {
    const container = document.getElementById("koridorList");
    let html = "";
    
    if (!list || list.length === 0) {
        html = `<p class="text-center py-10 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Data Wilayah Tidak Ditemukan</p>`;
        container.innerHTML = html;
        return;
    }

    list.forEach(kor => {
        const prog = kor.progress || 0;
        const accordionId = `child-halte-koridor-${kor.id}`;
        
        html += `
            <div class="bg-white dark:bg-[#132247]/40 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden backdrop-blur-sm">
                
                <div onclick="toggleAccordionKoridor('${accordionId}')" class="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all select-none">
                    <div class="w-12 h-12 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md transition-colors border border-transparent dark:border-slate-600">
                        ${kor.id}
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-end mb-1.5">
                            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jalur Koridor ${kor.id}</span>
                            <span class="text-xs font-black text-[#0095DA] font-mono">${prog}%</span>
                        </div>
                        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                            <div class="bg-slate-800 dark:bg-[#0095DA] h-full transition-all duration-1000" style="width: ${prog}%"></div>
                        </div>
                    </div>
                    <div class="text-slate-400 pl-1 text-sm font-black transform transition-transform duration-300" id="icon-${accordionId}">
                        ▼
                    </div>
                </div>

                <div id="${accordionId}" class="max-h-0 overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/40 dark:bg-[#0f1a36]/30 border-t border-transparent">
                    <div class="p-4 space-y-2.5">
                        ${renderHalteChildRows(kor.haltes, kor.id)}
                    </div>
                </div>

            </div>`;
    });
    container.innerHTML = html;
}

// UPGRADE ULTRA PREMIUM: Mengganti badge teks kaku dengan visual Smart Reactive Pins Ry!
function renderHalteChildRows(haltes, koridorId) {
    if (!haltes || haltes.length === 0) {
        return `<p class="text-[10px] font-bold text-slate-400 text-center py-2 uppercase">Belum ada halte terdaftar</p>`;
    }

    let rowsHtml = "";
    haltes.forEach(h => {
        const isDone = h.status === "SELESAI";
        // Jika selesai kasih pin hijau (🟢), jika belum/proses kasih pin merah (🔴)
        const pinIndicator = isDone ? "🟢" : "🔴";
        
        const totalOff = parseInt(h.total_off || 0);
        const offBadge = totalOff > 0 
            ? `<span class="bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-[8px] font-black px-2 py-1 rounded-md animate-pulse">⚠️ ${totalOff} DOWN</span>` 
            : "";

        rowsHtml += `
            <div onclick="window.location.href='halte-detail.html?halte_id=${h.id}&halte_nama=${encodeURIComponent(h.nama_halte)}&koridor_id=${koridorId}'"
                class="flex justify-between items-center bg-white dark:bg-[#111c3a]/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/40 hover:border-[#0095DA] dark:hover:border-[#0095DA] cursor-pointer transition-all active:scale-[0.99] group">
                <div class="flex items-center gap-3">
                    <span class="text-xs transition-transform group-hover:scale-125 duration-300">${pinIndicator}</span>
                    <div>
                        <p class="text-xs font-black text-slate-700 dark:text-slate-200 group-hover:text-[#0095DA] transition-colors uppercase tracking-tight">${h.nama_halte}</p>
                        <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase">${h.total_perangkat || 0} Perangkat Terdata</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${offBadge}
                    <span class="text-slate-300 dark:text-slate-600 group-hover:text-[#0095DA] group-hover:translate-x-1 transition-all text-xs font-black">➔</span>
                </div>
            </div>`;
    });
    return rowsHtml;
}

function toggleAccordionKoridor(elementId) {
    const el = document.getElementById(elementId);
    const icon = document.getElementById(`icon-${elementId}`);
    
    if (el.style.maxHeight && el.style.maxHeight !== "0px") {
        el.style.maxHeight = "0px";
        el.style.setProperty('border-color', 'transparent', 'important');
        if (icon) icon.style.transform = "rotate(0deg)";
    } else {
        el.style.maxHeight = el.scrollHeight + "px";
        el.style.borderColor = "rgba(226, 232, 240, 0.6)";
        if (icon) icon.style.transform = "rotate(180deg)";
    }
}

function logout() {
    if(confirm("Logout dari aplikasi monitoring koordinator?")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}

function filterKoridorManual() {
    const input = document.getElementById('searchKoridor').value.toLowerCase().trim();
    const cards = document.querySelectorAll('#koridorList > div');

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (input === "" || text.includes(input)) {
            card.style.setProperty('display', 'block', 'important');
        } else {
            card.style.setProperty('display', 'none', 'important');
        }
    });
}
