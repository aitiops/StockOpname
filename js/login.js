async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  if (!username || !password) {
    message.innerHTML = "Username dan password wajib diisi";
    return;
  }

  // 1. AKTIFKAN LOADING LAYAR GELAP (Sentuhan Modern)
  if (typeof showLoading === "function") showLoading();
  message.innerHTML = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "login",
        username: username,
        password: password
      })
    });

    const data = await res.json();

    if (data.status) {
      // 2. LOGIKA RESET PASSWORD (Sesuai script kamu)
      if (data.reset) {
        if (typeof hideLoading === "function") hideLoading();
        alert(data.message);
        window.location.href = `reset-password.html?user_id=${data.user_id}`;
        return; 
      }

      // 3. SIMPAN SESSION KE LOCALSTORAGE (Sesuai script kamu)
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("nama", data.user.nama);

      // 4. REDIRECT BERDASARKAN ROLE (Sesuai script kamu)
      if (data.user.role == "Engineer") {
        window.location.href = "engineer.html";
      } else if (data.user.role == "Koordinator") {
        window.location.href = "koordinator.html";
      } else if (data.user.role == "Kasie") {
        window.location.href = "kasie.html";
      }

    } else {
      // Login gagal
      if (typeof hideLoading === "function") hideLoading();
      message.innerHTML = data.message;
    }
  } catch (err) {
    // Error koneksi
    if (typeof hideLoading === "function") hideLoading();
    console.error(err);
    message.innerHTML = "Terjadi kesalahan koneksi ke server.";
  }
}

// Support tombol Enter untuk login
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') login();
});
