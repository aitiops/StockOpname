/**
 * EXECUTIVE DASHBOARD ENGINE (KASIE)
 */

window.onload = () => {
    const nama = localStorage.getItem("nama");
    if (document.getElementById("namaUser")) {
        document.getElementById("namaUser").innerText = nama || "Kepala Seksi";
    }
    loadDashboardKasie();
};

async function loadDashboardKasie() {
    const statusEl = document.getElementById("loadingStatus");
    const overlay = document.getElementById("loadingOverlay");
    const token = localStorage.getItem("token");

    if (overlay) overlay.classList.add('loading-active');

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardKasi", token: token })
        });
        
        const result = await res.json();
        const data = result.data || result;

        // 1. Update Summary Eksekutif
        const healthScore = data.health_score || 0;
        document.getElementById("systemHealth").innerText = healthScore + "%";
        document.getElementById("healthBar").style.width = healthScore + "%";
        document.getElementById("totalAset").innerText = data.total_aset || 0;
        document.getElementById("totalOff").innerText = data.total_off || 0;
        document.getElementById("totalKoridor").innerText = data.total_koridor || 0;

        // 2. Render Top Issues (Alat yang paling sering rusak)
        renderTopIssues(data.top_issues || []);

        // 3. Render Regional Completion
        renderRegional(data.regional_data || []);

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

function renderTopIssues(issues) {
    let html = "";
    if (issues.length === 0) {
        html = `<div class="p-6 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-[10px] font-bold">TIDAK ADA DATA KENDALA</div>`;
    } else {
        issues.forEach(item => {
            html += `
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-red-200 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-bold text-xs">
                            ${item.count}
                        </div>
                        <div>
                            <h4 class="text-xs font-black text-slate-800 uppercase">${item.kategori}</h4>
                            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Rusak / Off Service</p>
                        </div>
                    </div>
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                </div>`;
        });
    }
    document.getElementById("issueList").innerHTML = html;
}

function renderRegional(list) {
    let html = "";
    list.forEach(reg => {
        html += `
            <div class="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-sm">${reg.koridor}</div>
                    <div>
                        <h4 class="text-sm font-black text-slate-800 uppercase">Koridor ${reg.koridor}</h4>
                        <p class="text-[10px] text-slate-400 font-bold">${reg.halte_count} Halte terdaftar</p>
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <div class="hidden md:block text-right">
                        <p class="text-[9px] font-black text-slate-400 uppercase">Perangkat</p>
                        <p class="text-xs font-black text-slate-700">${reg.aset_on} / ${reg.aset_total} ON</p>
                    </div>
                    <div class="w-16 h-16 relative flex items-center justify-center">
                        <svg class="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="6" fill="transparent" class="text-slate-100" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="6" fill="transparent" stroke-dasharray="${2 * Math.PI * 28}" stroke-dashoffset="${(1 - reg.progress / 100) * 2 * Math.PI * 28}" class="text-[#0095DA]" stroke-linecap="round" />
                        </svg>
                        <span class="absolute text-[10px] font-black text-slate-800">${reg.progress}%</span>
                    </div>
                </div>
            </div>`;
    });
    document.getElementById("regionalList").innerHTML = html;
}

function exportData() {
    alert("Menyiapkan File Laporan Komprehensif (Excel)...\nMohon tunggu sebentar.");
    // Logika export via Google Apps Script (GAS) biasanya diarahkan ke URL download
}

function logout() {
    if(confirm("Logout dari dashboard eksekutif?")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}
