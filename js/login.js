/**
 * LOGIN ENGINE - IT STOCK OPNAME
 * Final Fix: Case-Insensitive Role + Anti-Stuck Loading
 */

async function login() {
    const userField = document.getElementById("username");
    const passField = document.getElementById("password");
    const msg = document.getElementById("message");
    const overlay = document.getElementById('loadingOverlay');

    const username = userField.value.trim();
    const password = passField.value.trim();

    // 1. Validasi Input Kosong
    if (!username || !password) {
        alert("NIK dan Kata Sandi wajib diisi!");
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
                alert(data.message);
                window.location.href = `reset-password.html?user_id=${data.user_id}`;
                return;
            }

            // B. NORMALISASI ROLE (Biar kebal huruf besar/kecil dari Sheets)
            // Mau di sheet tulis "Engineer" atau "engineer", di sini jadi "engineer"
            const userRole = String(data.user.role).toLowerCase();

            // C. SIMPAN KE LOCALSTORAGE
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", userRole);
            localStorage.setItem("nama", data.user.nama);

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
                // Failsafe jika role di sheet tidak terdaftar di sistem
                forceHideLoading();
                alert(`Role "${data.user.role}" tidak dikenal oleh sistem.`);
                if (msg) msg.innerText = "Error: Role tidak terdaftar.";
            }

        } else {
            // LOGIN GAGAL (Salah Password/User)
            forceHideLoading();
            if (msg) msg.innerText = data.message || "NIK atau Kata Sandi Salah!";
        }

    } catch (err) {
        console.error("Critical Login Error:", err);
        forceHideLoading();
        if (msg) msg.innerText = "Koneksi Bermasalah. Pastikan API URL benar & 'Anyone' access aktif.";
    }
}

/**
 * FUNGSI PENGHANCUR LOADING (Mencegah Stuck)
 */
function forceHideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        // Hapus class agar tidak tertahan !important CSS
        overlay.classList.remove('loading-active');
        // Paksa sembunyikan dengan priority tinggi
        overlay.style.setProperty('display', 'none', 'important');
        overlay.style.display = 'none';
    }
}

// Support Login pakai tombol Enter
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});
