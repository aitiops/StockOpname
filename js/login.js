/**
 * LOGIN ENGINE - IT STOCK OPNAME
 * Final Fix: Case-Insensitive Role, Premium Modal Alert, & Anti-Stuck Loading
 */

async function login() {
    const userField = document.getElementById("username");
    const passField = document.getElementById("password");
    const msg = document.getElementById("message");
    const overlay = document.getElementById('loadingOverlay');

    const username = userField.value.trim();
    const password = passField.value.trim();

    // 1. Validasi Input Kosong (Menggunakan Premium Modal)
    if (!username || !password) {
        showLoginValidationModal("Input Kosong", "NIK dan Kata Sandi wajib diisi!");
        return;
    }

    // 2. Aktifkan Loading Overlay
    if (overlay) {
        overlay.classList.add('loading-active');
        overlay.style.display = 'flex';
    }
    if (msg) msg.innerText = "";

    try {
        console.log("Menghubungi server...");

        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "login",
                username: username,
                password: password
            })
        });

        if (!res.ok) throw new Error("Koneksi ke Google Script Gagal");

        const data = await res.json();
        console.log("Respon Login:", data);

        if (data.status) {
            // A. CEK APAKAH PERLU RESET PASSWORD (LOGIN PERTAMA)
            if (data.reset) {
                forceHideLoading();
                localStorage.setItem("reset_user_id", data.user_id);
                
                // SUNTIKKAN MODAL PERINGATAN PREMIUM (Ganti Alert Jadul)
                const warningModalHtml = `
                    <div id="passwordWarningModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
                        <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-300">
                            <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-100">
                                ⚠️
                            </div>
                            <h3 class="text-base font-black text-slate-800 uppercase tracking-tight mb-2">Keamanan Akun</h3>
                            <p class="text-slate-500 text-xs font-medium mb-6 leading-relaxed">
                                Sistem mendeteksi Anda masih menggunakan password bawaan. Silakan ganti password Anda demi keamanan data.
                            </p>
                            <button onclick="window.location.href='reset-password.html?user_id=${data.user_id}'" class="w-full bg-[#0095DA] hover:bg-[#007bb5] text-white py-3.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-950/20 active:scale-95 uppercase tracking-wider">
                                Ganti Password Sekarang
                            </button>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML("beforeend", warningModalHtml);
                return;
            }

            // B. NORMALISASI ROLE (Biar kebal huruf besar/kecil dari Sheets)
            const userRole = String(data.user.role).toLowerCase();

            // C. SIMPAN KE LOCALSTORAGE (Termasuk Kolom Wilayah untuk Koordinator)
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", userRole);
            localStorage.setItem("nama", data.user.nama);
            localStorage.setItem("wilayah", data.user.wilayah || ""); // KUNCI UTAMA FILTER KOORDINATOR

            // D. REDIRECT BERDASARKAN ROLE
            const rolesMap = {
                "engineer": "engineer.html",
                "koordinator": "koordinator.html",
                "kasie": "kasie.html"
            };

            const targetPage = rolesMap[userRole];

            if (targetPage) {
                window.location.href = targetPage;
            } else {
                forceHideLoading();
                showLoginValidationModal("Role Tidak Dikenal", `Role "${data.user.role}" tidak dikenal oleh sistem.`);
                if (msg) msg.innerText = "Error: Role tidak terdaftar.";
            }

        } else {
            // LOGIN GAGAL (Salah Password/User)
            forceHideLoading();
            if (msg) msg.innerText = data.message || "NIK atau Kata Sandi Salah!";
            showLoginValidationModal("Login Gagal", data.message || "NIK atau Kata Sandi Salah!");
        }

    } catch (err) {
        console.error("Critical Login Error:", err);
        forceHideLoading();
        if (msg) msg.innerText = "Koneksi Bermasalah. Pastikan API URL benar & 'Anyone' access aktif.";
        showLoginValidationModal("Koneksi Bermasalah", "Gagal terhubung ke server. Periksa jaringan internet Anda.");
    }
}

/**
 * FUNGSI TAMPILAN MODAL LOGIN VALIDATION
 */
function showLoginValidationModal(title, message) {
    if (document.getElementById("loginValModal")) document.getElementById("loginValModal").remove();
    const modalHtml = `
        <div id="loginValModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100">
                    ❌
                </div>
                <h3 class="text-base font-black text-slate-800 uppercase tracking-tight mb-2">${title}</h3>
                <p class="text-slate-500 text-xs font-medium mb-6 leading-relaxed">${message}</p>
                <button onclick="document.getElementById('loginValModal').remove()" class="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-xl text-xs font-bold transition active:scale-95 uppercase tracking-wider">
                    Mengerti
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

/**
 * FUNGSI PENGHANCUR LOADING (Mencegah Stuck)
 */
function forceHideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('loading-active');
        overlay.style.setProperty('display', 'none', 'important');
    }
}

// Support Login pakai tombol Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});
