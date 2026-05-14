const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("user_id");

async function handleReset() {
    const pass = document.getElementById("newPassword").value;
    const conf = document.getElementById("confirmPassword").value;
    const btn = document.getElementById("btnReset");
    const msg = document.getElementById("msg");

    // Validasi sederhana di sisi client
    if (pass !== conf) {
        msg.innerText = "Konfirmasi sandi tidak cocok!";
        return;
    }

    // Indikator Loading
    btn.disabled = true;
    btn.innerText = "Menyimpan...";
    msg.innerText = "Sedang memproses perubahan...";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "resetPassword",
                user_id: userId,
                new_password: pass
            })
        });

        const data = await res.json();

        if (data.status) {
            alert("Berhasil! Sandi Anda telah diperbarui.");
            window.location.href = "index.html"; // Balik ke Login
        } else {
            msg.innerText = data.message;
            btn.disabled = false;
            btn.innerText = "Simpan Sandi";
        }
    } catch (err) {
        console.error(err);
        msg.innerText = "Koneksi gagal. Periksa internet Anda.";
        btn.disabled = false;
        btn.innerText = "Simpan Sandi";
    }
}
