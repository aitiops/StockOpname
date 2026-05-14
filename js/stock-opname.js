let halteList = [];
let masterPerangkat = [];

// ================= URL PARAMS =================
const urlParams = new URLSearchParams(window.location.search);
const halteId = urlParams.get("halte_id");
const halteNama = urlParams.get("halte_nama");
const koridorId = urlParams.get("koridor_id");
const editMode = urlParams.get("edit");
const opnameId = urlParams.get("id");

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
    // Jalankan master data dulu baru load edit
    await loadMasterPerangkat();
    await loadHalteDetail();

    if (editMode && opnameId) {
        loadEditData();
    }
});

// ================= COMPRESS IMAGE =================
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1000; // Optimal size
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.6));
            };
        };
    });
}

// ================= SAVE / UPDATE =================
async function saveStockOpname() {
    const kategori = document.getElementById("kategori").value;
    const namaPerangkat = document.getElementById("namaPerangkat").value;
    const merkModel = document.getElementById("merkModel").value;
    const serialNumber = document.getElementById("serialNumber").value;
    const statusPerangkat = document.getElementById("statusPerangkat").value;
    const photoFile = document.getElementById("photo").files[0];
    const message = document.getElementById("message");

    if (!kategori || !namaPerangkat || !merkModel || !serialNumber) {
        alert("Mohon lengkapi semua data wajib!");
        return;
    }

    message.innerHTML = "Sedang memproses data...";
    
    let photoBase64 = "";
    if (photoFile) {
        message.innerHTML = "Compressing image...";
        photoBase64 = await compressImage(photoFile);
    }

    message.innerHTML = "Uploading to server...";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: editMode ? "updateStockOpname" : "saveStockOpname",
                token: token,
                opname_id: opnameId,
                updated_by: user.nama || "Engineer",
                halte_id: halteId,
                halte_nama: halteNama,
                koridor_id: koridorId,
                kategori: kategori,
                nama_perangkat: namaPerangkat,
                merk_model: merkModel,
                serial_number: serialNumber,
                status: statusPerangkat,
                arah: document.getElementById("arahPerangkat") ? document.getElementById("arahPerangkat").value : "",
                force_save: false,
                photo: photoBase64
            })
        });

        const data = await res.json();

        if (data.status) {
            message.innerHTML = data.message;
            setTimeout(() => {
                window.location.href = `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
            }, 1000);
        } else {
            if (data.duplicate) {
                if (confirm("Serial Number duplikat. Tetap simpan?")) {
                    saveForce();
                } else {
                    message.innerHTML = "Penyimpanan dibatalkan";
                }
            } else {
                message.innerHTML = "Error: " + data.message;
            }
        }
    } catch (err) {
        console.error(err);
        message.innerHTML = "Gagal terhubung ke server.";
    }
}

// ================= LOAD EDIT DATA =================
async function loadEditData() {
    const message = document.getElementById("message");
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "getDetailOpname", // Sesuaikan dengan Code.gs
                token: token,
                opname_id: opnameId
            })
        });

        const result = await res.json();
        if (!result.status) return;

        const item = result.data;

        // 1. Kategori
        document.getElementById("kategori").value = item.kategori;
        changeKategori();

        // 2. Perangkat (Kasih jeda biar dropdown namaPerangkat keisi)
        setTimeout(() => {
            document.getElementById("namaPerangkat").value = item.nama_perangkat;
            changePerangkat();
            
            // 3. Merk & Lainnya
            setTimeout(() => {
                document.getElementById("merkModel").value = item.merk_model;
                document.getElementById("serialNumber").value = item.serial_number;
                document.getElementById("statusPerangkat").value = item.status_perangkat; // Key dari getDetailOpname
                
                if (item.arah && document.getElementById("arahPerangkat")) {
                    document.getElementById("arahContainer").classList.remove("hidden");
                    document.getElementById("arahPerangkat").value = item.arah;
                }
            }, 300);
        }, 300);

        // Update UI
        document.querySelector("h2").innerText = "Edit Data Perangkat";
        document.querySelector("button[onclick='saveStockOpname()']").innerText = "Update Data";

    } catch (err) {
        console.log("Error load edit data:", err);
    }
}

// --- Fungsi Pendukung (Tetap Gunakan Yang Kamu Punya) ---

async function loadMasterPerangkat() {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getMasterPerangkat", token: token })
        });
        const data = await res.json();
        masterPerangkat = data.data;
        
        const kategoriUnik = [...new Set(masterPerangkat.map(item => item.kategori))];
        let html = `<option value="">Pilih Kategori</option>`;
        kategoriUnik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
        document.getElementById("kategori").innerHTML = html;
    } catch (err) { console.log(err); }
}

function changeKategori() {
    const kategori = document.getElementById("kategori").value;
    const perangkat = masterPerangkat.filter(item => item.kategori == kategori);
    const perangkatUnik = [...new Set(perangkat.map(item => item.nama_perangkat))];
    let html = `<option value="">Pilih Perangkat</option>`;
    perangkatUnik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
    document.getElementById("namaPerangkat").innerHTML = html;
    document.getElementById("merkModel").innerHTML = `<option value="">Pilih Merk / Model</option>`;
}

function changePerangkat() {
    const kategori = document.getElementById("kategori").value;
    const perangkat = document.getElementById("namaPerangkat").value;
    const merkModel = masterPerangkat.filter(item => item.kategori == kategori && item.nama_perangkat == perangkat);
    const merkUnik = [...new Set(merkModel.map(item => item.merk_model))];
    let html = `<option value="">Pilih Merk / Model</option>`;
    merkUnik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
    document.getElementById("merkModel").innerHTML = html;
}

async function loadHalteDetail() {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getHalteDetail", token: token, halte_id: halteId })
        });
        const result = await res.json();
        if (result.status) {
            const h = result.data;
            document.getElementById("infoKoridor").innerHTML = `Koridor ${h.koridor_id}`;
            document.getElementById("infoHalte").innerHTML = h.nama_halte;
            if (h.tipe_halte?.toLowerCase() == "dual") {
                document.getElementById("arahContainer").classList.remove("hidden");
                document.getElementById("arahPerangkat").innerHTML = `
                    <option value="">Pilih Arah</option>
                    <option value="${h.arah_a}">${h.arah_a}</option>
                    <option value="${h.arah_b}">${h.arah_b}</option>`;
            }
        }
    } catch (err) { console.log(err); }
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const preview = document.getElementById("previewPhoto");
        preview.src = e.target.result;
        preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
}
