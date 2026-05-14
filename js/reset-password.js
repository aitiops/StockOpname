const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("user_id");

async function handleReset() {
  const pass = document.getElementById("newPassword").value;
  const conf = document.getElementById("confirmPassword").value;
  const btn = document.getElementById("btnReset");
  const msg = document.getElementById("msg");

  if (pass !== conf) {
    alert("Password konfirmasi tidak cocok!");
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.innerText = "Processing...";
  msg.innerText = "Sedang mengupdate password...";
  msg.className = "text-center mt-4 text-sm font-medium text-blue-600";

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
      alert(data.message);
      // Redirect balik ke login (asumsi file login adalah index.html atau login.html)
      window.location.href = "index.html"; 
    } else {
      msg.innerText = data.message;
      msg.className = "text-center mt-4 text-sm font-medium text-red-600";
      btn.disabled = false;
      btn.innerText = "Simpan Password";
    }
  } catch (err) {
    console.error(err);
    msg.innerText = "Gagal terhubung ke server.";
    msg.className = "text-center mt-4 text-sm font-medium text-red-600";
    btn.disabled = false;
    btn.innerText = "Simpan Password";
  }
}
