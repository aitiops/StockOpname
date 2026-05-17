/**
 * GLOBAL AUTH & SESSION SYSTEM - IT STOCK OPNAME
 * Fitur: Interceptor Session Expired + Global Logout Bulletproof
 */

// ========================================================
// 1. FUNGSI LOGOUT GLOBAL (ANTI-GAGAL)
// ========================================================
window.logout = function() {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem monitoring?")) {
        // Bersihkan seluruh data login di browser
        localStorage.clear();
        // Tendang langsung ke halaman utama
        window.location.href = "index.html";
    }
};

// ========================================================
// 2. GLOBAL SESSION EXPIRED INTERCEPTOR (DYNAMIC MODAL)
// ========================================================

function showSessionExpiredModal() {
    if (document.getElementById("sessionExpiredModal")) return;

    const modalHtml = `
        <div id="sessionExpiredModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100 animate-pulse">
                    🔒
                </div>
                <h3 class="text-base font-black text-slate-800 uppercase tracking-tight mb-2">Sesi Anda Telah Berakhir</h3>
                <p class="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
                    Untuk menjaga keamanan data IT Stock Opname, silakan lakukan login ulang ke dalam sistem.
                </p>
                <button onclick="forceRedirectToLogin()" class="w-full bg-[#0095DA] hover:bg-[#007bb5] text-white py-3.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-950/20 active:scale-95 uppercase tracking-wider">
                    Login Ulang Sekarang
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function forceRedirectToLogin() {
    localStorage.clear();
    window.location.href = "index.html";
}

// Interceptor: Membajak fetch untuk deteksi otomatis session habis dari Google Script
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    const cloneResponse = response.clone();
    
    try {
        const json = await cloneResponse.json();
        if (json && json.message && String(json.message).toLowerCase().includes("session expired")) {
            showSessionExpiredModal();
        }
    } catch (e) {
        // Abaikan jika respon bukan berupa JSON
    }
    
    return response;
};
