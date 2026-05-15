/**
 * KOORDINATOR DASHBOARD ENGINE
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

        // 1. Update Summary
        document.getElementById("totalHalte").innerText = data.total_halte || 0;
        document.getElementById("halteSelesai").innerText = data.halte_selesai || 0;
        document.getElementById("progressVisit").innerText = (data.progress || 0) + "%";
        document.getElementById("totalPerangkat").innerText = data.total_perangkat || 0;

        // 2. Render Engineer Performance
        renderEngineers(data.engineers || []);

        // 3. Render Koridor Progress
        renderKoridor(data.koridors || []);

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

function renderEngineers(list) {
    let html = "";
    if (list.length === 0) {
        html = `<p class="text-center py-10 text-slate-400 text-xs font-bold">BELUM ADA DATA ENGINEER</p>`;
    } else {
        list.forEach(eng => {
            const progress = eng.progress || 0;
            html += `
                <div class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div class="flex justify-between items-center mb-3">
                        <div>
                            <h3 class="font-black text-slate-800 text-sm uppercase">${eng.nama}</h3>
                            <p class="text-[10px] font-bold text-slate-400 italic">${eng.last_update || 'No activity'}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-lg font-black text-[#0095DA]">${progress}%</span>
                        </div>
                    </div>
                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div class="bg-[#0095DA] h-full transition-all duration-1000" style="width: ${progress}%"></div>
                    </div>
                    <div class="flex justify-between mt-2 text-[9px] font-black uppercase text-slate-400">
                        <span>${eng.selesai || 0} Halte Selesai</span>
                        <span>Total ${eng.total_tugas || 0} Halte</span>
                    </div>
                </div>`;
        });
    }
    document.getElementById("engineerList").innerHTML = html;
}

function renderKoridor(list) {
    let html = "";
    if (list.length === 0) {
        html = `<p class="text-center py-10 text-slate-400 text-xs font-bold">BELUM ADA DATA KORIDOR</p>`;
    } else {
        list.forEach(kor => {
            const progress = kor.progress || 0;
            html += `
                <div class="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                        ${kor.id}
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-end mb-1">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Koridor ${kor.id}</span>
                            <span class="text-xs font-black text-slate-800">${progress}%</span>
                        </div>
                        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-slate-800 h-full transition-all duration-1000" style="width: ${progress}%"></div>
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
