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
    console.log("Memulai proses load data...");
    await runBootSequence();

    // Cek Token
    if (!token) {
        alert("Error: Token tidak ditemukan! Silakan login ulang.");
        window.location.href = "index.html";
        return;
    }

    try {
        console.log("Menghubungi API: " + API_URL);
        
        const dashboardRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardEngineer", token: token })
        });

        const dashboard = await dashboardRes.json();
        console.log("Data Dashboard Diterima:", dashboard);

        if (!dashboard.status && dashboard.message) {
            alert("Server berkata: " + dashboard.message);
        }

        // --- UPDATE UI SUMMARY ---
        const dData = dashboard.data ? dashboard.data : dashboard;
        document.getElementById("totalHalte").innerHTML = dData.total_halte || 0;
        document.getElementById("halteSelesai").innerHTML = dData.halte_selesai || 0;
        document.getElementById("progressVisit").innerHTML = (dData.progress || 0) + "%";

        // --- FETCH DATA HALTE ---
        console.log("Mengambil list halte...");
        const halteRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getHalte", token: token })
        });
        const halteData = await halteRes.json();
        console.log("Data Halte Diterima:", halteData);

        const halte = halteData.data ? halteData.data : halteData;
        
        if (!halte || halte.length === 0) {
            console.warn("Peringatan: Data halte kosong dari server.");
            document.getElementById("dashboardKoridor").innerHTML = "<p style='color:white; text-align:center;'>Data halte tidak ditemukan.</p>";
        }

        // --- PROSES GROUPING & RENDER ---
        let koridorMap = {};
        halte.forEach(item => {
            if (!koridorMap[item.koridor_id]) koridorMap[item.koridor_id] = [];
            koridorMap[item.koridor_id].push(item);
        });

        let html = "";
        for (let koridor in koridorMap) {
            // ... (Kode build HTML Accordion kamu yang kemarin) ...
            // Pastikan bagian build HTML ini tetap ada di sini
        }

        document.getElementById("dashboardKoridor").innerHTML = html;
        console.log("Render Selesai!");

        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if(overlay) overlay.classList.remove('loading-active');
        }, 600);

    } catch (err) {
        console.error("KATASTROFIK ERROR:", err);
        alert("Gagal ambil data. Cek Console (F12) untuk detail.");
    }
}
