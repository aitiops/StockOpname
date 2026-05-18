/**
 * STOCK OPNAME ENGINE - ULTRA FOOLPROOF FINAL FIX
 * Version: Internal Anti-Blank Guard & Premium Success Modal Trigger
 */

let masterPerangkat = [];

const urlParams = new URLSearchParams(window.location.search);
const halteId = urlParams.get("halte_id");
const halteNama = urlParams.get("halte_nama");
const koridorId = urlParams.get("koridor_id");
const editMode = urlParams.get("edit");
const opnameId = urlParams.get("id");

window.onload = async () => {
    showLoading("Menyiapkan Formulir...");
    await Promise.all([loadMasterPerangkat(), loadHalteDetail()]);

    if (editMode && opnameId) {
        if (document.getElementById("pageTitle")) document.getElementById("pageTitle").innerText = "Edit Status";
        if (document.getElementById("btnSave")) document.getElementById("btnSave").innerText = "Update Status";
        await loadEditData();
    }
    hideLoading();
};

function showLoading(txt) {
    const ov = document.getElementById("loadingOverlay");
    if (ov) { 
        ov.classList.add('loading-active'); 
        ov.style.setProperty('display', 'flex', 'important'); 
    }
    if (document.getElementById("loadingStatus")) {
        document.getElementById("loadingStatus").innerText = txt;
    }
}

function hideLoading() {
    const ov = document.getElementById("loadingOverlay");
    if (ov) { 
        ov.classList.remove('loading-active'); 
        ov.style.setProperty('display', 'none', 'important'); 
    }
}

// FUNGSI PEMICU MODAL PREMIUM GLOBAL
function triggerSuccessRedirect() {
    hideLoading();
    const sm = document.getElementById("successModal");
    if (sm) {
        sm.classList.remove("hidden");
        sm.classList.add("flex");
    }
    // Delay 1.5 detik agar animasi modal terlihat premium, lalu auto-redirect
    setTimeout(() => {
        window.location.href = `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
    }, 1500);
}

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1000;
                let w = img.width, h = img.height;
                if (w > MAX_WIDTH) { h *= MAX_WIDTH / w; w = MAX_WIDTH; }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
        };
    });
}

async function saveStockOpname() {
    const fields = {
        kategori: document.getElementById("kategori").value,
        nama: document.getElementById("namaPerangkat").value,
        merk: document.getElementById("merkModel").value,
        sn: document.getElementById("serialNumber").value.trim().toUpperCase(),
        status: document.getElementById("statusPerangkat").value,
        arah: document.getElementById("arahPerangkat") ? document.getElementById("arahPerangkat").value : "",
        photoFile: document.getElementById("photo").files[0]
    };

    if (!fields.kategori || !fields.nama || !fields.sn || !fields.status) {
        alert("Wajib mengisi Kategori, Nama Alat, S/N, dan Status!");
        return;
    }

    showLoading("Memproses Data...");
    let photoBase64 = fields.photoFile ? await compressImage(fields.photoFile) : "";

    try {
        const payload = {
            action: editMode ? "updateStockOpname" : "saveStockOpname",
            token: localStorage.getItem("token"),
            opname_id: opnameId,
            updated_by: localStorage.getItem("nama") || "Engineer",
            halte_id: halteId,
            halte_nama: halteNama,
            koridor_id: koridorId,
            kategori: fields.kategori,
            nama_perangkat: fields.nama,
            merk_model: fields.merk,
            serial_number: fields.sn,
            status: fields.status,
            arah: fields.arah,
            force_save: false,
            photo: photoBase64
        };

        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
        const data = await res.json();

        if (data.status) {
            // FIX UTAMA: Panggil modal animasi custom, matikan alert() ghaib browser
            triggerSuccessRedirect();
        } else if (data.duplicate) {
            hideLoading();
            if (confirm("S/N terdeteksi duplikat. Tetap simpan?")) saveForce(payload);
        } else {
            hideLoading();
            alert("Gagal: " + data.message);
        }
    } catch (err) { 
        hideLoading(); 
        alert("Kesalahan Jaringan!"); 
    }
}

async function saveForce(p) {
    showLoading("Menyimpan Paksa...");
    p.force_save = true;
    try {
        const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(p) });
        const data = await res.json();
        if (data.status) {
            // FIX UTAMA: Panggil modal animasi custom, matikan alert() ghaib browser
            triggerSuccessRedirect();
        } else {
            hideLoading();
            alert("Gagal Simpan Paksa: " + data.message);
        }
    } catch (err) {
        hideLoading();
        alert("Kesalahan Jaringan!");
    }
}

// ========================================================
// DROPDOWN RENDERING LOGIC (PROTECTED WITH FILTER BOOLEAN)
// ========================================================
async function loadMasterPerangkat() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getMasterPerangkat", token: localStorage.getItem("token") }) });
    masterPerangkat = (await res.json()).data || [];
    
    const unik = [...new Set(masterPerangkat.map(i => i.kategori).filter(Boolean))];
    let h = `<option value="">Pilih Kategori</option>`;
    unik.forEach(i => h += `<option value="${i}">${i}</option>`);
    document.getElementById("kategori").innerHTML = h;
}

function changeKategori() {
    const kat = document.getElementById("kategori").value;
    const filtered = masterPerangkat.filter(i => i.kategori == kat);
    
    const unik = [...new Set(filtered.map(i => i.nama_perangkat).filter(Boolean))];
    let h = `<option value="">Pilih Perangkat</option>`;
    unik.forEach(i => h += `<option value="${i}">${i}</option>`);
    document.getElementById("namaPerangkat").innerHTML = h;
    
    document.getElementById("merkModel").innerHTML = `<option value="">Pilih Merk / Model</option>`;
}

function changePerangkat() {
    const kat = document.getElementById("kategori").value;
    const n = document.getElementById("namaPerangkat").value;
    const filtered = masterPerangkat.filter(i => i.kategori == kat && i.nama_perangkat == n);
    
    const unik = [...new Set(filtered.map(i => i.merk_model).filter(Boolean))];
    let h = `<option value="">Pilih Merk / Model</option>`;
    unik.forEach(i => h += `<option value="${i}">${i}</option>`);
    document.getElementById("merkModel").innerHTML = h;
}

async function loadHalteDetail() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getHalteDetail", token: localStorage.getItem("token"), halte_id: halteId }) });
    const r = await res.json();
    if (r.status) {
        const h = r.data;
        document.getElementById("infoKoridor").innerHTML = `Koridor ${h.koridor_id}`;
        document.getElementById("infoHalte").innerHTML = h.nama_halte;
        if (h.tipe_halte?.toLowerCase() === "dual") {
            const arahContainer = document.getElementById("arahContainer");
            const arahPerangkat = document.getElementById("arahPerangkat");
            if (arahContainer) arahContainer.classList.remove("hidden");
            if (arahPerangkat) {
                arahPerangkat.innerHTML = `<option value="">Pilih Arah</option><option value="${h.arah_a}">${h.arah_a}</option><option value="${h.arah_b}">${h.arah_b}</option>`;
            }
        }
    }
}

async function loadEditData() {
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getDetailOpname", token: localStorage.getItem("token"), opname_id: opnameId }) });
    const r = await res.json();
    if (!r.status) return;
    const i = r.data;
    
    document.getElementById("kategori").value = i.kategori;
    changeKategori();
    setTimeout(() => {
        document.getElementById("namaPerangkat").value = i.nama_perangkat;
        changePerangkat();
        setTimeout(() => {
            document.getElementById("merkModel").value = i.merk_model;
            document.getElementById("serialNumber").value = i.serial_number;
            document.getElementById("statusPerangkat").value = i.status;
            if (i.arah && document.getElementById("arahPerangkat")) {
                document.getElementById("arahPerangkat").value = i.arah;
            }
        }, 300);
    }, 300);
}

function previewImage(event) {
    const f = event.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        if (document.getElementById("uploadPlaceholder")) {
            document.getElementById("uploadPlaceholder").classList.add("hidden");
        }
        const p = document.getElementById("previewPhoto");
        if (p) {
            p.src = e.target.result; 
            p.classList.remove("hidden");
        }
    };
    reader.readAsDataURL(f);
}
