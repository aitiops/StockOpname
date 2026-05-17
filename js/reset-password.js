/**
 * RESET PASSWORD ENGINE - IT STOCK OPNAME
 * Final Fix: Premium Loader Sync, Anti-Alert, & Success Modal Redirect
 */

const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get("user_id");

// Failsafe backup jika parameter URL hilang, ambil dari LocalStorage cadangan
if (!userId) {
    userId = localStorage.getItem("reset_user_id");
}

async function handleReset() {
    const pass = document.getElementById("newPassword").value;
    const conf = document.getElementById("confirmPassword").value;
    const btn = document.getElementById("btnReset");
    const msg = document.getElementById("msg");
    const overlay = document.getElementById('loadingOverlay');
    const statusEl = document.getElementById("loadingStatus");

    // 1. Validasi Kecocokan (Menggunakan Premium Modal)
    if (pass !== conf) {
        showResetValidationModal("Sandi Tidak Cocok", "Konfirmasi kata sandi tidak cocok! Silakan periksa kembali.");
        return;
    }

    if (pass.length < 4) {
        showResetValidationModal("Sandi Terlalu Pendek", "Demi keamanan, batas minimal sandi baru adalah 4 karakter.");
        return;
    }

    // 2. AKTIFKAN PREMIUM LOADING OVERLAY (Biar muncul animasi berputar)
    if (overlay) {
        overlay.classList.add('loading-active');
        overlay.style.display = 'flex';
    }
    if (statusEl) statusEl.innerText = "Sedang memproses perubahan...";
    if (btn) btn.disabled = true;
    if (msg) msg.innerText = ""; // Bersihkan teks bawaan agar rapi

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "resetPassword",
                user_id: userId,
                new_password: pass
            })
        });

        if (!res.ok) throw new Error("Gagal terhubung dengan server database");

        const data = await res.json();

        if (data.status) {
            // SUNTIKKAN MODAL SUKSES PREMIUM
            showResetSuccessModal();
        } else {
            hideResetLoading();
            if (msg) msg.innerText = data.message;
            showResetValidationModal("Gagal Memperbarui", data.message || "Terjadi kesalahan pada sistem.");
        }
    } catch (err) {
        console.error(err);
        hideResetLoading();
        if (msg) msg.innerText = "Koneksi gagal. Periksa internet Anda.";
        showResetValidationModal("Server Error", "Koneksi gagal. Pastikan komputer Anda terhubung ke internet.");
    }
}

/**
 * FUNGSI NONAKTIFKAN LOADING RESET
 */
function hideResetLoading() {
    const overlay = document.getElementById('loadingOverlay');
    const btn = document.getElementById("btnReset");
    if (overlay) {
        overlay.classList.remove('loading-active');
        overlay.style.setProperty('display', 'none', 'important');
    }
    if (btn) {
        btn.disabled = false;
        btn.innerText = "Simpan Sandi";
    }
}

/**
 * FUNGSI TAMPILAN MODAL SUKSES (SUKSES RESET)
 */
function showResetSuccessModal() {
    // Matikan loading overlay utama terlebih dahulu
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');

    const successModalHtml = `
        <div id="successResetModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 transform scale-100 transition-transform duration-300">
                <div class="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-green-100 animate-bounce">
                    ✅
                </div>
                <h3 class="text-base font-black text-slate-800 uppercase tracking-tight mb-2">Berhasil Diperbarui</h3>
                <p class="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
                    Sandi baru Anda sukses disimpan ke dalam sistem. Silakan kembali ke halaman login utama.
                </p>
                <button onclick="redirectToLoginAfterReset()" class="w-full bg-[#0095DA] hover:bg-[#007bb5] text-white py-3.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-950/20 active:scale-95 uppercase tracking-wider">
                    Kembali Ke Login
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", successModalHtml);
}

/**
 * FUNGSI TAMPILAN MODAL VALIDASI ERROR
 */
function showResetValidationModal(title, message) {
    if (document.getElementById("resetValModal")) document.getElementById("resetValModal").remove();
    const modalHtml = `
        <div id="resetValModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100">
                    ❌
                </div>
                <h3 class="text-base font-black text-slate-800 uppercase tracking-tight mb-2">${title}</h3>
                <p class="text-slate-500 text-xs font-medium mb-6 leading-relaxed">${message}</p>
                <button onclick="document.getElementById('resetValModal').remove()" class="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-xl text-xs font-bold transition active:scale-95 uppercase tracking-wider">
                    Mengerti
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function redirectToLoginAfterReset() {
    localStorage.clear();
    window.location.href = "index.html";
}
