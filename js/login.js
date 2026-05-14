async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  if (!username || !password) {
    message.innerHTML = "Username dan password wajib diisi";
    return;
  }

  message.innerHTML = "Loading...";

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
      // CEK APAKAH PERLU RESET PASSWORD
      if (data.reset) {
        alert(data.message);
        window.location.href = `reset-password.html?user_id=${data.user_id}`;
        return; // Hentikan proses login normal
      }

      // SIMPAN SESSION (Login Normal)
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("nama", data.user.nama);

      // REDIRECT BERDASARKAN ROLE
      if (data.user.role == "engineer") {
        window.location.href = "engineer.html";
      } else if (data.user.role == "koordinator") {
        window.location.href = "koordinator.html";
      } else if (data.user.role == "kasie") {
        window.location.href = "kasie.html";
      }

    } else {
      message.innerHTML = data.message;
    }
  } catch (err) {
    console.error(err);
    message.innerHTML = "Terjadi kesalahan koneksi ke server.";
  }
}
