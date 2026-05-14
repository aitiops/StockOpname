const token = localStorage.getItem("token");
const namaUser = localStorage.getItem("nama");

if (document.getElementById("namaUser")) {
    document.getElementById("namaUser").innerHTML = namaUser || "User";
}

const page = window.location.pathname;

// Auto load saat halaman terbuka
window.onload = () => {
    if (page.includes("engineer.html")) loadDashboardEngineer();
};

// ================= SIMULASI BOOTING =================
async function runBootSequence() {
    const messages = [
        "> CONNECTING TO TJ_NET...",
        "> AUTHENTICATING...",
        "> FETCHING DATA...",
        "> SYSTEM READY!"
    ];

    for (let i = 0; i < messages.length; i++) {
        const el = document.getElementById(`bootMsg${i + 1}`);
        if (el) { // Cek apakah elemen ada supaya tidak error
            el.innerText = messages[i];
            el.classList.replace('opacity-0', 'opacity-100');
            await new Promise(r => setTimeout(r, 300));
        }
    }
}

// ================= LOAD DASHBOARD =================
async function loadDashboardEngineer() {
    // 1. Jalankan Booting Animasi
    await runBootSequence();

    try {
        // 2. Fetch Data Dashboard
        const dashboardRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardEngineer", token: token })
        });
        const dashboard = await dashboardRes.json();
        const dData = dashboard.data ? dashboard.data : dashboard;

        document.getElementById("totalHalte").innerHTML = dData.total_halte || 0;
        document.getElementById("halteSelesai").innerHTML = dData.halte_selesai || 0;
        document.getElementById("progressVisit").innerHTML = (dData.progress || 0) + "%";

        // 3. Fetch Data Halte
        const halteRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getHalte", token: token })
        });
        const halteData = await halteRes.json();
        const halte = halteData.data ? halteData.data : halteData;

        // 4. Grouping Koridor
        let koridorMap = {};
        halte.forEach(item => {
            if (!koridorMap[item.koridor_id]) koridorMap[item.koridor_id] = [];
            koridorMap[item.koridor_id].push(item);
        });

        // 5. Build HTML Accordion
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
                            <div class="font-bold text-slate-700 text-sm">${item.nama_halte}</div>
                            <div class="text-[10px] text-slate-400 font-mono">ID: ${item.halte_id}</div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="${badgeClass} text-[9px] font-black px-2 py-1 rounded-md">${isSelesai ? 'DONE' : 'PENDING'}</span>
                            <button onclick="window.location.href='halte-detail.html?halte_id=${item.halte_id}&halte_nama=${item.nama_halte}&koridor_id=${item.koridor_id}'" 
                                class="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-[#0095DA] hover:text-white transition-all">
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
                            <div class="w-10 h-10 bg-[#0095DA] text-white rounded-xl flex items-center justify-center font-black shadow-inner">${koridor}</div>
                            <div>
                                <h2 class="text-sm font-black text-slate-800 uppercase">Koridor ${koridor}</h2>
                                <p class="text-[10px] text-slate-500 font-bold">${countSelesai} / ${koridorMap[koridor].length} Selesai</p>
                            </div>
                        </div>
                        <div class="chevron-icon transition-transform duration-300 opacity-30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                    <div class="accordion-content bg-white border-t border-slate-50">
                        <div class="p-1">${halteHtml}</div>
                    </div>
                </div>
            `;
        }

        document.getElementById("dashboardKoridor").innerHTML = html;

        // 6. Matikan Loading (Kasih jeda dikit biar booting-nya kebaca)
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if(overlay) overlay.classList.remove('loading-active');
        }, 600);

    } catch (err) {
        console.error(err);
        const errEl = document.getElementById('bootMsg4');
        if(errEl) { errEl.innerText = "> ERROR: DATABASE OFFLINE"; errEl.style.color = "red"; }
    }
}
