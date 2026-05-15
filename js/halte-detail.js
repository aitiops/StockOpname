/**
 * HALTE DETAIL ENGINE - IT STOCK OPNAME
 * Final Fix: Search Logic + Anti-Stuck Loading
 */

const urlParams = new URLSearchParams(window.location.search);
const halte_id = urlParams.get("halte_id");
const halte_nama = urlParams.get("halte_nama");
const koridor_id = urlParams.get("koridor_id");

// Global Variable untuk menampung data asli dari server
let perangkatList = [];

// Proteksi: Jika ID tidak ada, balik ke dashboard
if (!halte_id) window.location.href = 'engineer.html';

// ================= INIT VIEW =================
document.getElementById("halteTitle").innerHTML = halte_nama || "Detail Halte";
document.getElementById("koridorTitle").innerHTML = `Koridor ${koridor_id || "-"}`;

window.onload = () => {
    loadPerangkat();
};

function goInput() {
    window.location.href = `stock-opname.html?halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}`;
}

// ================= LOAD DATA =================
async function loadPerangkat() {
    const statusEl = document.getElementById("loadingStatus");
    const overlay = document.getElementById("loadingOverlay");
    const sessionToken = localStorage.getItem("token");

    if (overlay) {
        overlay.classList.add('loading-active');
        overlay.style.display = 'flex';
    }
    if (statusEl) statusEl.innerText = "Sinkronisasi Perangkat...";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "getPerangkatHalte",
                token: sessionToken,
                halte_id: halte_id
            })
        });

        const data = await res.json();
        // Simpan ke variabel global agar bisa difilter nanti
        perangkatList = data.data || [];

        // Update Summary
        updateSummary(perangkatList);

        // Render pertama kali
        renderPerangkat(perangkatList);

        // Tutup Loading
        if (statusEl) statusEl.innerText = "Data Siap!";
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('loading-active');
                overlay.style.setProperty('display', 'none', 'important');
                overlay.style.display = 'none';
            }
        }, 600);

    } catch (err) {
        console.error("Gagal load:", err);
        if (overlay) {
            overlay.classList.remove('loading-active');
            overlay.style.display = 'none';
        }
    }
}

// ================= SUMMARY COUNTER =================
function updateSummary(data) {
    let totalOn = 0;
    let totalOff = 0;
    data.forEach(item => {
        if (item.status === "On Service") totalOn++;
        else totalOff++;
    });
    if(document.getElementById("totalPerangkat")) document.getElementById("totalPerangkat").innerHTML = data.length;
    if(document.getElementById("totalOn")) document.getElementById("totalOn").innerHTML = totalOn;
    if(document.getElementById("totalOff")) document.getElementById("totalOff").innerHTML = totalOff;
}

// ================= SEARCH & FILTER LOGIC =================
function filterPerangkat() {
    // 1. Ambil input dari user
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const statusFilter = document.getElementById("filterStatus").value;

    console.log("Mencari:", keyword, "Status:", statusFilter); // Debugging

    // 2. Lakukan Filter pada list asli
    const filteredData = perangkatList.filter(item => {
        // Gabungkan semua field biar pencarian luas
        const nama = (item.nama_perangkat || "").toLowerCase();
        const sn = (item.serial_number || "").toLowerCase();
        const merk = (item.merk_model || "").toLowerCase();
        const kategori = (item.kategori || "").toLowerCase();

        // Cek kecocokan teks
        const matchesKeyword = nama.includes(keyword) || 
                               sn.includes(keyword) || 
                               merk.includes(keyword) || 
                               kategori.includes(keyword);

        // Cek kecocokan status
        const matchesStatus = statusFilter === "" ? true : item.status === statusFilter;

        return matchesKeyword && matchesStatus;
    });

    // 3. Tampilkan hasil filter
    renderPerangkat(filteredData);
}

// ================= RENDER CARD =================
function renderPerangkat(dataList) {
    let html = "";
    const container = document.getElementById("tablePerangkat");

    if (!dataList || dataList.length === 0) {
        html = `
            <div class="col-span-full py-20 text-center">
                <div class="text-5xl mb-4 opacity-20">🔍</div>
                <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Data tidak ditemukan</p>
            </div>`;
        container.innerHTML = html;
        return;
    }

    dataList.forEach(item => {
        const isOn = item.status === 'On Service';
        const bgStatus = isOn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
        const dotStatus = isOn ? 'bg-green-500' : 'bg-red-500';

        html += `
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-5">
                        <div class="flex items-center gap-2 ${bgStatus} px-3 py-1 rounded-full">
                            <span class="w-2 h-2 rounded-full ${dotStatus} animate-pulse"></span>
                            <span class="text-[10px] font-black uppercase tracking-wider">${item.status}</span>
                        </div>
                        <button onclick="openPhoto('${item.photo}')" class="bg-slate-50 text-slate-400 hover:text-[#0095DA] hover:bg-blue-50 p-2 rounded-xl transition shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        </button>
                    </div>

                    <h3 class="text-lg font-black text-slate-800 leading-tight group-hover:text-[#0095DA] transition-colors">${item.nama_perangkat || "-"}</h3>
                    <p class="text-xs font-bold text-slate-400 mb-4 uppercase tracking-tighter">${item.merk_model || "-"}</p>

                    <div class="space-y-3 pt-4 border-t border-slate-50">
                        <div class="flex justify-between text-[11px]">
                            <span class="text-slate-400 font-bold uppercase">S/N</span>
                            <span class="font-mono font-black text-slate-700">${item.serial_number || "-"}</span>
                        </div>
                        <div class="flex justify-between text-[11px]">
                            <span class="text-slate-400 font-bold uppercase">Kategori</span>
                            <span class="font-bold text-slate-600">${item.kategori || "-"}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 border-t border-slate-50">
                    <button onclick="window.location.href='stock-opname.html?edit=1&id=${item.opname_id}&halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}'" 
                        class="p-4 text-xs font-black text-amber-500 hover:bg-amber-50 transition-colors uppercase border-r border-slate-50">
                        Edit
                    </button>
                    <button onclick="deletePerangkat('${item.opname_id}')" 
                        class="p-4 text-xs font-black text-red-500 hover:bg-red-50 transition-colors uppercase">
                        Hapus
                    </button>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

// ================= CRUD & MODAL =================
async function deletePerangkat(opnameId) {
    if (!confirm("Hapus perangkat ini?")) return;
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "deletePerangkat", token: localStorage.getItem("token"), opname_id: opnameId })
        });
        const data = await res.json();
        if (data.status) { loadPerangkat(); }
    } catch (err) { console.error(err); }
}

function openPhoto(url) {
    if (!url || url === "undefined" || url === "") { alert("Foto tidak tersedia."); return; }
    let fileId = "";
    if (url.includes("/d/")) fileId = url.split("/d/")[1].split("/")[0];
    else if (url.includes("id=")) fileId = url.split("id=")[1].split("&")[0];
    if (!fileId) { window.open(url, "_blank"); return; }
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    document.getElementById("modalIframe").src = previewUrl;
    document.getElementById("photoModal").classList.replace("hidden", "flex");
}

function closePhoto() {
    document.getElementById("modalIframe").src = "";
    document.getElementById("photoModal").classList.replace("flex", "hidden");
}
