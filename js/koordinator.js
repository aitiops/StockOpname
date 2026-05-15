/**
 * KOORDINATOR DASHBOARD ENGINE - MULTI CORRIDOR VERSION
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
    
    // Ambil wilayah tugas. Misal: "1" atau "1,2" atau "all"
    const wilayahTugas = localStorage.getItem("wilayah_tugas") || "";

    if (overlay) overlay.classList.add('loading-active');

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardKoordinator", token: token })
        });
        
        const result = await res.json();
        const data = result.data || result;

        // --- LOGIKA FILTER MULTI-KORIDOR ---
        let filteredKoridor = [];
        let allowedIDs = [];

        if (wilayahTugas.toLowerCase() === "all") {
            // Jika tim malam (all), tampilkan semua tanpa filter
            filteredKoridor = data.koridors;
        } else {
            // Jika spesifik (1 atau 1,2), pecah string menjadi array
            allowedIDs = wilayahTugas.split(",").map(id => id.trim());
            filteredKoridor = data.koridors.filter(kor => allowedIDs.includes(String(kor.id)));
        }

        // 1. Update Summary (Akumulasi dari koridor yang boleh dilihat)
        let totalH = 0, selesaiH = 0, totalA = 0;
        filteredKoridor.forEach(k => {
            totalH += parseInt(k.total_halte || 0);
            selesaiH += parseInt(k.selesai || 0);
            totalA += parseInt(k.total_perangkat || 0);
        });

        const totalProgress = totalH > 0 ? Math.round((selesaiH / totalH) * 100) : 0;

        document.getElementById("totalHalte").innerText = totalH;
        document.getElementById("halteSelesai").innerText = selesaiH;
        document.getElementById("progressVisit").innerText = totalProgress + "%";
        document.getElementById("totalPerangkat").innerText = totalA;

        // 2. Render List Engineer
        // Filter engineer: jika 'all' tampilkan semua, jika tidak, filter yang koridor_tugasnya ada di allowedIDs
        const filteredEngineers = wilayahTugas.toLowerCase() === "all" 
            ? data.engineers 
            : data.engineers.filter(eng => allowedIDs.includes(String(eng.koridor_tugas)));
            
        renderEngineers(filteredEngineers);

        // 3. Render List Koridor
        renderKoridor(filteredKoridor);

    } catch (err) {
        console.error(err);
    } finally {
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('loading-active');
                overlay.style.setProperty('display', 'none', 'important');
            }
        }, 800);
    }
}

// ... fungsi renderEngineers dan renderKoridor tetap sama dengan sebelumnya ...
