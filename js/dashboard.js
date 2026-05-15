/**
 * DASHBOARD ENGINE - IT STOCK OPNAME
 * Versi "Sapu Bersih": Smart Search + Auto-Hide Corridor + Anti-Stuck
 */

window.onload = () => {
    const path = window.location.pathname;
    const nama = localStorage.getItem("nama");
    if (document.getElementById("namaUser")) {
        document.getElementById("namaUser").innerHTML = nama || "User";
    }

    if (path.includes("engineer.html")) {
        loadDashboardEngineer();
    }
};

// ========================================================
// LOAD DATA DARI SERVER
// ========================================================
async function loadDashboardEngineer() {
    const statusEl = document.getElementById("loadingStatus");
    const overlay = document.getElementById("loadingOverlay");
    const sessionToken = localStorage.getItem("token");

    if (overlay) {
        overlay.classList.add('loading-active');
        overlay.style.display = 'flex';
    }

    try {
        // 1. Ambil Statistik
        const resStats = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardEngineer", token: sessionToken })
        });
        const statsJson = await resStats.json();
        const dData = statsJson.data || statsJson;

        document.getElementById("totalHalte").innerHTML = dData.total_halte || 0;
        document.getElementById("halteSelesai").innerHTML = dData.halte_selesai || 0;
        document.getElementById("progressVisit").innerHTML = (dData.progress || 0) + "%";

        // 2. Ambil Daftar Halte
        if (statusEl) statusEl.innerText = "Sinkronisasi Koridor...";
        const resHalte = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getHalte", token: sessionToken })
        });
        const halteJson = await resHalte.json();
        const listHalte = halteJson.data || halteJson;

        // 3. Mapping Koridor
        let koridorMap = {};
        if (Array.isArray(listHalte)) {
            listHalte.forEach(item => {
                if (!koridorMap[item.koridor_id]) koridorMap[item.koridor_id] = [];
                koridorMap[item.koridor_id].push(item);
            });
        }

        // 4. Render HTML
        let html = "";
        for (let koridor in koridorMap) {
            let halteHtml = "";
            let countSelesai = 0;

            koridorMap[koridor].forEach(item => {
                const isSelesai = item.status === "Selesai";
                if (isSelesai) countSelesai++;
                let badgeClass = isSelesai ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600";
                
                halteHtml += `
                    <div class="halte-row flex justify-between items-center p-4 border-b border-slate-50 last:border-none">
                        <div>
                            <div class="font-bold text-slate-700 text-sm h-nama">${item.nama_halte}</div>
                            <div class="text-[10px] text-slate-400 font-mono">ID: ${item.halte_id}</div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="${badgeClass} text-[9px] font-black px-2 py-1 rounded-md uppercase">${isSelesai ? 'DONE' : 'PENDING'}</span>
                            <button onclick="window.location.href='halte-detail.html?halte_id=${item.halte_id}&halte_nama=${item.nama_halte}&koridor_id=${item.koridor_id}'" 
                                class="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-[#0095DA] hover:text-white transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>`;
            });

            html += `
                <div class="accordion-item tj-card overflow-hidden bg-white shadow-sm mb-4" id="koridor-${koridor}">
                    <div class="accordion-header flex justify-between items-center p-4 cursor-pointer" onclick="toggleAccordion('koridor-${koridor}')">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-[#0095DA] text-white rounded-xl flex items-center justify-center font-black shadow-inner">${koridor}</div>
                            <div>
                                <h2 class="text-sm font-black text-slate-800 uppercase">Koridor ${koridor}</h2>
                                <p class="text-[10px] text-slate-500 font-bold">${countSelesai} / ${koridorMap[koridor].length} Selesai</p>
                            </div>
                        </div>
                        <div class="chevron-icon transition-transform duration-300 opacity-20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                    <div class="accordion-content bg-white border-t border-slate-50">
                        <div class="p-1">${halteHtml}</div>
                    </div>
                </div>`;
        }

        const container = document.getElementById("dashboardKoridor");
        if (container) container.innerHTML = html || "<p class='text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs'>Data Tidak Ditemukan</p>";

    } catch (err) {
        console.error("Gagal sinkronisasi:", err);
    } finally {
        // --- JALUR PAKSA TUTUP LOADING ---
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('loading-active');
                overlay.style.setProperty('display', 'none', 'important');
            }
        }, 800);
    }
}

// ========================================================
// FUNGSI SEARCH (VERSI SAPU BERSIH)
// ========================================================
function filterHalteManual() {
    // Ambil input dari user
    const searchVal = document.getElementById('searchHalte').value.toLowerCase().trim();
    const accordions = document.querySelectorAll('.accordion-item');

    accordions.forEach(acc => {
        const rows = acc.querySelectorAll('.halte-row');
        let hasMatch = false;

        rows.forEach(row => {
            // Kita cari di semua teks di dalam baris tersebut
            const rowText = row.innerText.toLowerCase();

            if (searchVal === "" || rowText.includes(searchVal)) {
                row.style.setProperty('display', 'flex', 'important');
                if (searchVal !== "") hasMatch = true;
            } else {
                row.style.setProperty('display', 'none', 'important');
            }
        });

        // Tampilkan/Sembunyikan Koridor
        if (searchVal === "") {
            // Jika kosong, tampilkan semua koridor dan tutup listnya
            acc.style.setProperty('display', 'block', 'important');
            acc.classList.remove('accordion-active');
        } else {
            if (hasMatch) {
                acc.style.setProperty('display', 'block', 'important');
                acc.classList.add('accordion-active'); // Buka otomatis kalau ada hasil
            } else {
                acc.style.setProperty('display', 'none', 'important'); // SEMBUNYIKAN KORIDOR TOTAL
            }
        }
    });
}

function toggleAccordion(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('accordion-active');
}
