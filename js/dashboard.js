/**
 * DASHBOARD ENGINE - IT STOCK OPNAME
 * Versi Full Final: Premium Loading + Accordion + Search Logic
 */

// 1. Jalankan saat halaman selesai dimuat
window.onload = () => {
    const path = window.location.pathname;
    
    // Set Nama di Navbar
    const nama = localStorage.getItem("nama");
    const namaEl = document.getElementById("namaUser");
    if (namaEl) namaEl.innerHTML = nama || "User";

    // Panggil fungsi muat data berdasarkan halaman
    if (path.includes("engineer.html")) {
        loadDashboardEngineer();
    } else if (path.includes("koordinator.html")) {
        loadDashboardKoordinator();
    } else if (path.includes("kasi.html")) {
        loadDashboardKasi();
    }
};

// ========================================================
// DASHBOARD ENGINEER (MAIN LOGIC)
// ========================================================
async function loadDashboardEngineer() {
    const statusEl = document.getElementById("loadingStatus");
    const sessionToken = localStorage.getItem("token");

    if (!sessionToken) {
        console.error("Token tidak ditemukan! Harap login kembali.");
        return;
    }

    try {
        // A. AMBIL DATA RINGKASAN (STATS)
        if(statusEl) statusEl.innerText = "Sinkronisasi Data...";
        
        const dashboardRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardEngineer", token: sessionToken })
        });
        const dashboardData = await dashboardRes.json();
        const dData = dashboardData.data ? dashboardData.data : dashboardData;

        // Update Elemen Statistik
        if(document.getElementById("totalHalte")) document.getElementById("totalHalte").innerHTML = dData.total_halte || 0;
        if(document.getElementById("halteSelesai")) document.getElementById("halteSelesai").innerHTML = dData.halte_selesai || 0;
        if(document.getElementById("progressVisit")) document.getElementById("progressVisit").innerHTML = (dData.progress || 0) + "%";

        // B. AMBIL DATA LIST HALTE
        if(statusEl) statusEl.innerText = "Menyusun Daftar Koridor...";
        
        const halteRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getHalte", token: sessionToken })
        });
        const halteData = await halteRes.json();
        const listHalte = halteData.data ? halteData.data : halteData;

        // C. GROUPING DATA BERDASARKAN KORIDOR
        let koridorMap = {};
        if (Array.isArray(listHalte)) {
            listHalte.forEach(item => {
                if (!koridorMap[item.koridor_id]) koridorMap[item.koridor_id] = [];
                koridorMap[item.koridor_id].push(item);
            });
        }

        // D. BUILD HTML ACCORDION
        let html = "";
        for (let koridor in koridorMap) {
            let halteHtml = "";
            let countSelesai = 0;

            koridorMap[koridor].forEach(item => {
                const isSelesai = item.status === "Selesai";
                if (isSelesai) countSelesai++;

                const badgeClass = isSelesai ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600";
                const badgeText = isSelesai ? 'DONE' : 'PENDING';
                
                halteHtml += `
                    <div class="halte-row flex justify-between items-center p-4 border-b border-slate-50 last:border-none">
                        <div>
                            <div class="font-bold text-slate-700 text-sm">${item.nama_halte}</div>
                            <div class="text-[10px] text-slate-400 font-medium tracking-tight">ID: ${item.halte_id}</div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="${badgeClass} text-[9px] font-black px-2 py-1 rounded-md uppercase">${badgeText}</span>
                            <button onclick="window.location.href='halte-detail.html?halte_id=${item.halte_id}&halte_nama=${item.nama_halte}&koridor_id=${item.koridor_id}'" 
                                class="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-[#0095DA] hover:text-white transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `
                <div class="accordion-item tj-card overflow-hidden bg-white shadow-sm mb-4" id="koridor-${koridor}">
                    <div class="accordion-header flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors" onclick="toggleAccordion('koridor-${koridor}')">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-[#0095DA] text-white rounded-xl flex items-center justify-center font-black shadow-inner">
                                ${koridor}
                            </div>
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
                </div>
            `;
        }

        const container = document.getElementById("dashboardKoridor");
        if (container) container.innerHTML = html || "<p class='text-center py-10 text-slate-400 font-medium'>Data tidak tersedia.</p>";

        // E. SELESAI & TUTUP LOADING
        if(statusEl) statusEl.innerText = "Data Siap!";
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if(overlay) overlay.style.display = 'none';
        }, 500);

    } catch (err) {
        console.error("Terjadi kesalahan:", err);
        if(statusEl) {
            statusEl.innerText = "Gagal Memuat Data";
            statusEl.style.color = "#ef4444";
        }
    }
}

// ========================================================
// UI HELPERS (ACCORDION & SEARCH)
// ========================================================
function toggleAccordion(id) {
    const all = document.querySelectorAll('.accordion-item');
    all.forEach(item => {
        if(item.id === id) item.classList.toggle('accordion-active');
        else item.classList.remove('accordion-active');
    });
}

function filterHalteManual() {
    let input = document.getElementById('searchHalte').value.toLowerCase();
    let items = document.querySelectorAll('.halte-row');
    let headers = document.querySelectorAll('.accordion-item');

    if(input === "") {
        headers.forEach(h => { 
            h.style.display = "block"; 
            h.classList.remove('accordion-active'); 
        });
        items.forEach(i => i.style.display = "flex");
        return;
    }

    items.forEach(item => {
        let text = item.innerText.toLowerCase();
        let parent = item.closest('.accordion-item');
        if(text.includes(input)) {
            item.style.display = "flex";
            if(parent) {
                parent.classList.add('accordion-active');
                parent.style.display = "block";
            }
        } else {
            item.style.display = "none";
        }
    });
}

// ========================================================
// DASHBOARD LAIN (STUB)
// ========================================================
async function loadDashboardKoordinator() { /* Logika Koordinator */ }
async function loadDashboardKasi() { /* Logika Kasi */ }
