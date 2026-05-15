/**
 * STOCK OPNAME ENGINE - IT STOCK OPNAME
 * Versi Full Final: Premium Sync + Image Compression + Anti-Error Logic
 */

let masterPerangkat = [];

// 1. Ambil Parameter dari URL
const urlParams = new URLSearchParams(window.location.search);
const halteId = urlParams.get("halte_id");
const halteNama = urlParams.get("halte_nama");
const koridorId = urlParams.get("koridor_id");
const editMode = urlParams.get("edit");
const opnameId = urlParams.get("id");

// 2. Jalankan saat halaman siap
window.onload = async () => {
    showPremiumLoading("Menyiapkan Formulir...");
    
    // Load data pendukung secara paralel
    await Promise.all([
        loadMasterPerangkat(),
        loadHalteDetail()
    ]);

    // Jika masuk mode Edit
    if (editMode && opnameId) {
        const title = document.getElementById("pageTitle");
        const btn = document.getElementById("btnSave");
        if (title) title.innerText = "Edit Perangkat";
        if (btn) btn.innerText = "Update Data";
        await loadEditData();
    }

    hidePremiumLoading();
};

// ================= UTILITY: LOADING MANAGEMENT =================
function showPremiumLoading(text) {
    const overlay = document.getElementById("loadingOverlay");
    const status = document.getElementById("loadingStatus");
    if (overlay) {
        overlay.classList.add('loading-active');
        overlay.style.display = 'flex';
    }
    if (status) status.innerText = text;
}

function hidePremiumLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
        overlay.classList.remove('loading-active');
        overlay.style.setProperty('display', 'none', 'important');
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
                // Kompres ke JPEG kualitas 0.7
                resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
        };
    });
}

// ================= LOGIC: SAVE / UPDATE =================
async function saveStockOpname() {
    const sessionToken = localStorage.getItem("token");
    const namaUser = localStorage.getItem("nama");

    // Tangkap semua field
    const fields = {
        kategori: document.getElementById("kategori").value,
        namaPerangkat: document.getElementById("namaPerangkat").value,
        merkModel: document.getElementById("merkModel").value,
        serialNumber: document.getElementById("serialNumber").value.trim().toUpperCase(),
        statusPerangkat: document.getElementById("statusPerangkat").value,
        arah: document.getElementById("arahPerangkat") ? document.getElementById("arahPerangkat").value : "",
        photoFile: document.getElementById("photo").files[0]
    };

    // VALIDASI: Cek field wajib
    if (!fields.kategori || !fields.namaPerangkat || !fields.serialNumber || !fields.statusPerangkat) {
        alert("⚠️ Mohon lengkapi data wajib:\n- Kategori\n- Nama Perangkat\n- Serial Number\n- Kondisi Perangkat");
        return;
    }

    showPremiumLoading("Mengolah Gambar...");
    
    let photoBase64 = "";
    if (fields.photoFile) {
        photoBase64 = await compressImage(fields.photoFile);
    }

    showPremiumLoading("Mengirim Data...");

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
            alert("✅ Data Berhasil Disimpan!");
            window.location.href = `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
        } else {
            hidePremiumLoading();
            if (data.duplicate) {
                if (confirm(`S/N ${fields.serialNumber} sudah ada di data lain. Tetap simpan?`)) {
                    saveForce(payload);
                }
            } else {
                alert("❌ Error: " + data.message);
            }
        }
    } catch (err) {
        console.error(err);
        hidePremiumLoading();
        alert("❌ Terjadi kesalahan koneksi ke server.");
    }
}

// Fungsi Simpan Paksa (Force Save)
async function saveForce(payload) {
    showPremiumLoading("Menyimpan Paksa...");
    payload.force_save = true;
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
        const data = await res.json();
        if(data.status) {
            alert("✅ Data Berhasil Disimpan (Paksa)");
            window.location.href = `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
        }
    } catch (err) { 
        console.error(err);
        hidePremiumLoading(); 
    }
}

// ================= MASTER DATA & DROPDOWN =================
async function loadMasterPerangkat() {
    const sessionToken = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getMasterPerangkat", token: sessionToken })
        });
        const data = await res.json();
        masterPerangkat = data.data || [];
        
        const kategoriUnik = [...new Set(masterPerangkat.map(item => item.kategori))];
        let html = `<option value="">Pilih Kategori</option>`;
        kategoriUnik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
        document.getElementById("kategori").innerHTML = html;
    } catch (err) { console.error("Gagal load master:", err); }
}

function changeKategori() {
    const kategori = document.getElementById("kategori").value;
    const filtered = masterPerangkat.filter(item => item.kategori == kategori);
    const unik = [...new Set(filtered.map(item => item.nama_perangkat))];
    let html = `<option value="">Pilih Perangkat</option>`;
    unik.forEach(item => { html += `<option value="${item}">${item}</option>`; });
    document.getElementById("namaPerangkat").innerHTML = html;
    document.getElementById("merkModel").innerHTML = `<option value="">Pilih Merk / Model</option>`;
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

// ================= HALTE CONTEXT =================
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
            
            // Logika Halte Dual Arah
            if (h.tipe_halte?.toLowerCase() === "dual") {
                const arahContainer = document.getElementById("arahContainer");
                const arahSelect = document.getElementById("arahPerangkat");
                if (arahContainer) arahContainer.classList.remove("hidden");
                if (arahSelect) {
                    arahSelect.innerHTML = `
                        <option value="">Pilih Arah</option>
                        <option value="${h.arah_a}">${h.arah_a}</option>
                        <option value="${h.arah_b}">${h.arah_b}</option>`;
                }
            }
        }
    } catch (err) { console.error("Gagal load detail halte:", err); }
}

// ================= EDIT MODE HANDLER =================
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
        
        // Isi Form Secara Bertahap (Cascading)
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

    } catch (err) { console.error("Error load edit data:", err); }
}

// ================= PHOTO PREVIEW =================
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function (e) {
        const placeholder = document.getElementById("uploadPlaceholder");
        const preview = document.getElementById("previewPhoto");
        
        if (placeholder) placeholder.classList.add("hidden");
        if (preview) {
            preview.src = e.target.result;
            preview.classList.remove("hidden");
        }
    };
    reader.readAsDataURL(file);
}
