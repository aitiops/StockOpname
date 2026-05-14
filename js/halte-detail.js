const urlParams = new URLSearchParams(window.location.search);
const halte_id = urlParams.get("halte_id");
const halte_nama = urlParams.get("halte_nama");
const koridor_id = urlParams.get("koridor_id");

let perangkatList = [];

// ================= TITLE =================
document.getElementById("halteTitle").innerHTML = halte_nama || "Nama Halte";
document.getElementById("koridorTitle").innerHTML = koridor_id || "Koridor";

// ================= LOAD =================
loadPerangkat();

// ================= GO INPUT =================
function goInput(){
  window.location.href = `stock-opname.html?halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}`;
}

// ================= LOAD PERANGKAT =================
async function loadPerangkat(){
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getPerangkatHalte",
        token: token,
        halte_id: halte_id
      })
    });
    
    const data = await res.json();
    console.log("Data dari API:", data); // Cek di console log browser buat mastiin data masuk

    perangkatList = data.data || [];

    // Summary Counter
    let total = 0;
    let totalOn = 0;
    let totalOff = 0;

    perangkatList.forEach(item => {
      total++;
      if(item.status == "On Service"){
        totalOn++;
      } else {
        totalOff++;
      }
    });

    renderPerangkat(perangkatList);

    document.getElementById("totalPerangkat").innerHTML = total;
    document.getElementById("totalOn").innerHTML = totalOn;
    document.getElementById("totalOff").innerHTML = totalOff;

  } catch(err) {
    console.error("Gagal load perangkat:", err);
  }
}

// ================= FILTER =================
function filterPerangkat(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("filterStatus").value;

  const filtered = perangkatList.filter(item => {
    // PROTEKSI: Dijadikan string semua biar gak error kalau serial_number formatnya number
    const nama = String(item.nama_perangkat || "").toLowerCase();
    const sn = String(item.serial_number || "").toLowerCase();

    const cocokKeyword = nama.includes(keyword) || sn.includes(keyword);
    const cocokStatus = status == "" ? true : item.status == status;
    
    return cocokKeyword && cocokStatus;
  });

  renderPerangkat(filtered);
}

// ================= RENDER =================
function renderPerangkat(dataList){
  let html = "";

  if(!dataList || dataList.length == 0){
    html = `<div class="bg-white rounded-2xl p-10 text-center text-gray-500 col-span-full shadow-inner">Belum ada perangkat di halte ini</div>`;
    document.getElementById("tablePerangkat").innerHTML = html;
    return;
  }

  dataList.forEach(item => {
    // PROTEKSI: Handle jika ada field yang undefined/null dari backend
    const photoUrl = item.photo || "";
    const opnameId = item.opname_id || "";
    const statusDevice = item.status || "Unknown";
    const bgStatus = statusDevice == 'On Service' ? 'bg-green-500' : 'bg-red-500';

    html += `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
        <div class="p-5 flex-grow">
          <!-- STATUS & PHOTO BUTTON -->
          <div class="flex justify-between items-start mb-4">
            <span class="px-3 py-1 rounded-full text-xs font-bold text-white ${bgStatus}">
              ${statusDevice}
            </span>
            
            <!-- BUTTON LIHAT FOTO -->
            <button onclick="openPhoto('${photoUrl}')" class="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition border border-blue-200">
              Lihat Foto
            </button>
          </div>

          <h2 class="text-xl font-bold text-gray-800">${item.nama_perangkat || "-"}</h2>
          <p class="text-gray-500 text-sm mb-4">${item.merk_model || "-"}</p>

          <div class="space-y-2 text-sm border-t pt-4">
            <div class="flex justify-between"><span class="text-gray-500">Kategori:</span> <span class="font-medium">${item.kategori || "-"}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">S/N:</span> <span class="font-mono font-bold text-blue-700">${item.serial_number || "-"}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Engineer:</span> <span class="font-medium">${item.engineer || "-"}</span></div>
            ${item.arah ? `<div class="flex justify-between"><span class="text-gray-500">Arah:</span> <span class="font-medium">${item.arah}</span></div>` : ""}
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="p-4 bg-gray-50 border-t flex gap-2">
          <button onclick="window.location.href='stock-opname.html?edit=1&id=${opnameId}&halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}'" 
                  class="bg-amber-400 hover:bg-amber-500 text-white font-bold py-2 rounded-lg flex-1 text-sm transition">
            Edit
          </button>
          <button onclick="deletePerangkat('${opnameId}')" 
                  class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg flex-1 text-sm transition">
            Hapus
          </button>
        </div>
      </div>
    `;
  });

  document.getElementById("tablePerangkat").innerHTML = html;
}

// ================= DELETE =================
async function deletePerangkat(opnameId){
  if(!confirm("Yakin ingin menghapus perangkat ini?")) return;

  try {
    const res = await fetch(API_URL, {
      method:"POST",
      body:JSON.stringify({
        action:"deletePerangkat",
        token:token,
        opname_id:opnameId
      })
    });
    const data = await res.json();
    if(data.status){
      alert("Data berhasil dihapus");
      loadPerangkat(); // Reload data biar lsg update
    } else {
      alert(data.message);
    }
  } catch(err) {
    console.error("Gagal hapus perangkat:", err);
  }
}

// ================= PHOTO MODAL =================
function openPhoto(url){
  if(!url || url === "undefined" || url === "") {
    alert("Foto tidak tersedia atau belum diupload.");
    return;
  }
  document.getElementById("modalImage").src = url;
  document.getElementById("photoModal").classList.remove("hidden");
  document.getElementById("photoModal").classList.add("flex");
}

function closePhoto(){
  document.getElementById("photoModal").classList.remove("flex");
  document.getElementById("photoModal").classList.add("hidden");
}
