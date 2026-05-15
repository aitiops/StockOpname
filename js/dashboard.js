/**
 * DASHBOARD ENGINE - IT STOCK OPNAME
 * Final Fix: Ultra-Smart Search (Hide Empty Corridors)
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
// AMBIL DATA DARI SERVER
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
        // 1. Ambil Stats
        const resStats = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardEngineer", token: sessionToken })
        });
        const dData = (await resStats.json()).data;

        document.getElementById("totalHalte").innerHTML = dData.total_halte || 0;
        document.getElementById("halteSelesai").innerHTML = dData.halte_selesai || 0;
        document.getElementById("progressVisit").innerHTML = (dData.progress || 0) + "%";

        // 2. Ambil List Halte
        const resHalte = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getHalte", token: sessionToken })
        });
        const halte = (await resHalte.json()).data;

        // 3. Grouping Koridor
        let koridorMap = {};
        if (Array.isArray(halte)) {
            halte.forEach(item => {
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
                            <span class="${badgeClass} text-[9px] font-black px-2 py-1 rounded-md">${isSelesai ? 'DONE' : 'PENDING'}</span>
                            <button onclick="window.location.href='halte-detail.html?halte_id=${item.halte_id}&halte_nama=${item.nama_halte}&koridor_id=${item.koridor_id}'" 
                                class="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-[#0095DA] hover:text-white transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>`;
            });

            html += `
                <div class="accordion-item tj-card overflow-hidden bg-white shadow-sm mb-4" id="koridor-${koridor}">
                    <div class="accordion-header flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors" onclick="toggleAccordion('koridor-${koridor}')">
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

        document.getElementById("dashboardKoridor").innerHTML = html || "<p class='text-center py-10 text-slate-400'>Data tidak tersedia.</p>";

        // Tutup Loading
        if(statusEl) statusEl.innerText = "Data Sinkron!";
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('loading-active');
                overlay.style.setProperty('display', 'none', 'important');
            }
        }, 600);

    } catch (err) {
        console.error(err);
        if (overlay) overlay.style.display = 'none';
    }
}

// ========================================================
// PENCARIAN CERDAS (KUNCI UTAMA)
// ========================================================
function filterHalteManual() {
    const input = document.getElementById('searchHalte').value.toLowerCase().trim();
    const accordions = document.querySelectorAll('.accordion-item');

    // Jika input kosong: Tampilkan semua koridor, tutup semua list
    if (input === "") {
        accordions.forEach(acc => {
            acc.style.setProperty('display', 'block', 'important');
            acc.classList.remove('accordion-active');
            const rows = acc.querySelectorAll('.halte-row');
            rows.forEach(row => row.style.setProperty('display', 'flex', 'important'));
        });
        return;
    }

    // Jika sedang mencari:
    accordions.forEach(acc => {
        const rows = acc.querySelectorAll('.halte-row');
        let adaYangCocok = false;

        rows.forEach(row => {
            // Kita ambil teks hanya dari nama haltenya saja biar akurat
            const namaHalte = row.querySelector('.h-nama').innerText.toLowerCase();
            const idHalte = row.innerText.toLowerCase(); // Tetap cek ID juga kalau mau

            if (namaHalte.includes(input) || idHalte.includes(input)) {
                row.style.setProperty('display', 'flex', 'important');
                adaYangCocok = true;
            } else {
                row.style.setProperty('display', 'none', 'important');
            }
        });

        // TAMPILKAN ATAU SEMBUNYIKAN KORIDOR
        if (adaYangCocok) {
            acc.style.setProperty('display', 'block', 'important'); // Tampilkan box koridor
            acc.classList.add('accordion-active'); // Buka list-nya otomatis
        } else {
            acc.style.setProperty('display', 'none', 'important'); // SEMBUNYIKAN KORIDOR TOTAL
        }
    });
}

// ========================================================
// UI HELPERS
// ========================================================
function toggleAccordion(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('accordion-active');
}
