/**
 * STOCK OPNAME ENGINE
 * Versi Final: Image Compression + Sync UI
 */

let masterPerangkat = [];

// URL PARAMS
const urlParams = new URLSearchParams(window.location.search);
const halteId = urlParams.get("halte_id");
const halteNama = urlParams.get("halte_nama");
const koridorId = urlParams.get("koridor_id");
const editMode = urlParams.get("edit");
const opnameId = urlParams.get("id");

// INIT
window.onload = async () => {
    showPremiumLoading("Menyiapkan Formulir...");
    
    // Load data master dan detail halte secara paralel
    await Promise.all([
        loadMasterPerangkat(),
        loadHalteDetail()
    ]);

    if (editMode && opnameId) {
        document.getElementById("pageTitle").innerText = "Edit Perangkat";
        document.getElementById("btnSave").innerText = "Update Perangkat";
        await loadEditData();
    }

    hidePremiumLoading();
};

// ================= UTILITY: LOADING =================
function showPremiumLoading(text) {
    const overlay = document.getElementById("loadingOverlay");
    const status = document.getElementById("loadingStatus");
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.classList.add('loading-active');
    }
    if (status) status.innerText = text;
}

function hidePremiumLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
        overlay.classList.remove('loading-active');
        overlay.style.display = 'none';
    }
}

// ================= LOGIC: COMPRESS IMAGE =================
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1000; 
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
                resolve(canvas.toDataURL("image/jpeg", 0.7)); // Quality 0.7 (Optimal)
            };
        };
    });
}

// ================= LOGIC: SAVE / UPDATE =================
async function saveStockOpname() {
    const sessionToken = localStorage.getItem("token");
    const namaUser = localStorage.getItem("nama");

    const fields = {
        kategori: document.getElementById("kategori").value,
        namaPerangkat: document.getElementById("namaPerangkat").value,
        merkModel: document.getElementById("merkModel").value,
        serialNumber: document.getElementById("serialNumber").value.toUpperCase(),
        statusPerangkat: document.getElementById("statusPerangkat").value,
        arah: document.getElementById("arahPerangkat") ? document.getElementById("arahPerangkat").value : "",
        photoFile: document.getElementById("photo").files[0]
    };

    if (!fields.kategori || !fields.namaPerangkat || !fields.serialNumber) {
        alert("Wajib mengisi Kategori, Nama Alat, dan S/N!");
        return;
    }

    showPremiumLoading("Memproses Gambar...");
    
    let photoBase64 = "";
    if (fields.photoFile) {
        photoBase64 = await compressImage(fields.photoFile);
    }

    showPremiumLoading("Mengirim ke Server...");

    try {
        const payload = {
            action: editMode ? "updateStockOpname" : "saveStockOpname",
            token: sessionToken,
            opname_id: opnameId,
            updated_by: namaUser || "Engineer",
            halte_id: halteId,
            halte_nama: halteNama,
            koridor_id: koridorId,
            kategori: fields.kategori,
            nama_perangkat: fields.namaPerangkat,
            merk_model: fields.merkModel,
            serial_number: fields.serialNumber,
            status: fields.statusPerangkat,
            arah: fields.arah,
            force_save: false,
            photo: photoBase64
        };

        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status) {
            hidePremiumLoading();
            alert("Data Berhasil Disimpan!");
            window.location.href = `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
        } else {
            hidePremiumLoading();
            if (data.duplicate) {
                if (confirm("S/N sudah ada di halte lain. Tetap simpan?")) {
                    saveForce(payload);
                }
            } else {
                alert("Error: " + data.message);
            }
        }
    } catch (err) {
        hidePremiumLoading();
        alert("Terjadi kesalahan koneksi.");
    }
}

// Support untuk simpan paksa jika duplikat
async function saveForce(payload) {
    showPremiumLoading("Menyimpan Paksa...");
    payload.force_save = true;
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
        const data = await res.json();
        if(data.status) {
            window.location.href = `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
        }
    } catch (err) { hidePremiumLoading(); }
}

// ================= LOAD MASTER DATA =================
async function loadMasterPerangkat() {
    const sessionToken = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getMasterPerangkat", token: sessionToken })
        });
        const data = await res.json();
        masterPerangkat = data.data;
        
        const kategoriUnik = [...new Set(masterPerangkat.map(item => item.kategori))];
        let html = `<option value="">Pilih Kategori</option>`;
        kategoriUnik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
        document.getElementById("kategori").innerHTML = html;
    } catch (err) { console.error(err); }
}

// Cascading Dropdown Logic
function changeKategori() {
    const kategori = document.getElementById("kategori").value;
    const filtered = masterPerangkat.filter(item => item.kategori == kategori);
    const unik = [...new Set(filtered.map(item => item.nama_perangkat))];
    let html = `<option value="">Pilih Perangkat</option>`;
    unik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
    document.getElementById("namaPerangkat").innerHTML = html;
}

function changePerangkat() {
    const kategori = document.getElementById("kategori").value;
    const perangkat = document.getElementById("namaPerangkat").value;
    const filtered = masterPerangkat.filter(item => item.kategori == kategori && item.nama_perangkat == perangkat);
    const unik = [...new Set(filtered.map(item => item.merk_model))];
    let html = `<option value="">Pilih Merk / Model</option>`;
    unik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
    document.getElementById("merkModel").innerHTML = html;
}

// ================= LOAD DETAIL HALTE =================
async function loadHalteDetail() {
    const sessionToken = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getHalteDetail", token: sessionToken, halte_id: halteId })
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
    } catch (err) { console.error(err); }
}

// ================= EDIT MODE LOGIC =================
async function loadEditData() {
    const sessionToken = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDetailOpname", token: sessionToken, opname_id: opnameId })
        });
        const result = await res.json();
        if (!result.status) return;

        const item = result.data;
        document.getElementById("kategori").value = item.kategori;
        changeKategori();

        setTimeout(() => {
            document.getElementById("namaPerangkat").value = item.nama_perangkat;
            changePerangkat();
            setTimeout(() => {
                document.getElementById("merkModel").value = item.merk_model;
                document.getElementById("serialNumber").value = item.serial_number;
                document.getElementById("statusPerangkat").value = item.status;
                if (item.arah && document.getElementById("arahPerangkat")) {
                    document.getElementById("arahPerangkat").value = item.arah;
                }
            }, 300);
        }, 300);
    } catch (err) { console.error(err); }
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("uploadPlaceholder").classList.add("hidden");
        const preview = document.getElementById("previewPhoto");
        preview.src = e.target.result;
        preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
}
