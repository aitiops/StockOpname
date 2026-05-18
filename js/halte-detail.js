/**
 * HALTE DETAIL ENGINE - IT STOCK OPNAME
 * Final Fix: Native Premium Delete Modal + Hybrid Dark Mode Responsive Cards
 */

const urlParams = new URLSearchParams(window.location.search);
const halte_id = urlParams.get("halte_id");
const halte_nama = urlParams.get("halte_nama");
const koridor_id = urlParams.get("koridor_id");

// Global Variable untuk menampung data asli dari server
let perangkatList = [];
let currentDeleteId = null; // Menyimpan ID perangkat yang akan dihapus

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
        perangkatList = data.data || [];

        // Update Summary Counter atas
        updateSummary(perangkatList);

        // Render Kartu Perangkat
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
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const statusFilter = document.getElementById("filterStatus").value;

    const filteredData = perangkatList.filter(item => {
        const nama = (item.nama_perangkat || "").toLowerCase();
        const sn = (item.serial_number || "").toLowerCase();
        const merk = (item.merk_model || "").toLowerCase();
        const kategori = (item.kategori || "").toLowerCase();

        const matchesKeyword = nama.includes(keyword) || 
                               sn.includes(keyword) || 
                               merk.includes(keyword) || 
                               kategori.includes(keyword);

        const matchesStatus = statusFilter === "" ? true : item.status === statusFilter;

        return matchesKeyword && matchesStatus;
    });

    renderPerangkat(filteredData);
}

// ================= RENDER CARD HYBRID DARK MODE =================
function renderPerangkat(dataList) {
    let html = "";
    const container = document.getElementById("tablePerangkat");

    if (!dataList || dataList.length === 0) {
        html = `
            <div class="col-span-full py-20 text-center">
                <div class="text-5xl mb-4 opacity-20">🔍</div>
                <p class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Data tidak ditemukan</p>
            </div>`;
        container.innerHTML = html;
        return;
    }

    dataList.forEach(item => {
        const isOn = item.status === 'On Service';
        const bgStatus = isOn ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400';
        const dotStatus = isOn ? 'bg-emerald-500' : 'bg-rose-500';

        html += `
            <div class="bg-white dark:bg-[#132247]/40 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-5">
                        <div class="flex items-center gap-2 ${bgStatus} px-3 py-1 rounded-full">
                            <span class="w-2 h-2 rounded-full ${dotStatus} animate-pulse"></span>
                            <span class="text-[10px] font-black uppercase tracking-wider">${item.status}</span>
                        </div>
                        <button onclick="openPhoto('${item.photo}')" class="bg-slate-50 dark:bg-[#1e293b] text-slate-400 dark:text-slate-500 hover:text-[#0095DA] dark:hover:text-[#0095DA] p-2 rounded-xl transition shadow-inner border border-transparent dark:border-slate-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        </button>
                    </div>

                    <h3 class="text-lg font-black text-slate-800 dark:text-white leading-tight group-hover:text-[#0095DA] dark:group-hover:text-[#0095DA] transition-colors">${item.nama_perangkat || "-"}</h3>
                    <p class="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-tighter">${item.merk_model || "-"}</p>

                    <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                        <div class="flex justify-between text-[11px]">
                            <span class="text-slate-400 dark:text-slate-500 font-bold uppercase">S/N</span>
                            <span class="font-mono font-black text-slate-700 dark:text-slate-300">${item.serial_number || "-"}</span>
                        </div>
                        <div class="flex justify-between text-[11px]">
                            <span class="text-slate-400 dark:text-slate-500 font-bold uppercase">Kategori</span>
                            <span class="font-bold text-slate-600 dark:text-slate-400">${item.kategori || "-"}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800/40">
                    <button onclick="window.location.href='stock-opname.html?edit=1&id=${item.opname_id}&halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}'" 
                        class="p-4 text-xs font-black text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors uppercase border-r border-slate-100 dark:border-slate-800/40">
                        Edit
                    </button>
                    <button onclick="deletePerangkat('${item.opname_id}')" 
                        class="p-4 text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors uppercase">
                        Hapus
                    </button>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

// ================= NATIVE MODAL CONTROL Ry =================
function deletePerangkat(opnameId) {
    currentDeleteId = opnameId; // Kunci ID yang mau dihapus di memori
    const dModal = document.getElementById('deleteModal');
    if (dModal) {
        dModal.classList.remove('hidden');
        dModal.classList.add('flex'); // Tampilkan Modal Custom Premium
    }
}

function closeDeleteModal() {
    const dModal = document.getElementById('deleteModal');
    if (dModal) {
        dModal.classList.remove('flex');
        dModal.classList.add('hidden');
    }
    currentDeleteId = null; // Kosongkan memori
}

async function executeDelete() {
    if (!currentDeleteId) return;
    
    showLoading("Menghapus Perangkat...");
    closeDeleteModal();

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ 
                action: "deletePerangkat", 
                token: localStorage.getItem("token"), 
                opname_id: currentDeleteId 
            })
        });
        const data = await res.json();
        if (data.status) { 
            loadPerangkat(); // Refresh data kartu baru
        } else {
            alert("Gagal menghapus: " + data.message);
        }
    } catch (err) { 
        console.error(err); 
        alert("Kesalahan Jaringan!");
    }
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
