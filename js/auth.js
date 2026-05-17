// ========================================================
// GLOBAL SESSION EXPIRED INTERCEPTOR (DYNAMIC MODAL)
// ========================================================

// 1. Fungsi untuk menyuntikkan Modal Premium ke HTML secara otomatis
function showSessionExpiredModal() {
    // Cegah duplikasi modal jika sudah ada di layar
    if (document.getElementById("sessionExpiredModal")) return;

    const modalHtml = `
        <div id="sessionExpiredModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse border border-red-100">
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

    // Masukkan modal ke bagian paling bawah body HTML
    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// 2. Fungsi Aksi saat tombol Login Ulang diklik
function forceRedirectToLogin() {
    localStorage.clear(); // Bersihkan semua token lama
    window.location.href = "index.html"; // Tendang ke halaman login
}

// 3. LOGIKA INTERCEPTOR: Membajak semua fungsi fetch di aplikasi secara global
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    
    // Clone respon agar tidak mengganggu kodingan utama di file .js lain
    const cloneResponse = response.clone();
    
    try {
        const json = await cloneResponse.json();
        
        // Cek apakah server mengirimkan pesan "Session expired"
        if (json && json.message && String(json.message).toLowerCase().includes("session expired")) {
            showSessionExpiredModal();
        }
    } catch (e) {
        // Abaikan jika respon bukan berupa JSON (misal error 500 html biasa)
    }
    
    return response;
};
