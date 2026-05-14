const urlParams = new URLSearchParams(window.location.search);
const halte_id = urlParams.get("halte_id");
const halte_nama = urlParams.get("halte_nama");
const koridor_id = urlParams.get("koridor_id");

let perangkatList = [];

// ================= TITLE =================
document.getElementById("halteTitle").innerHTML = halte_nama;
document.getElementById("koridorTitle").innerHTML = koridor_id;

// ================= LOAD =================
loadPerangkat();

// ================= GO INPUT =================
function goInput(){
  window.location.href = `stock-opname.html?halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}`;
}

// ================= LOAD PERANGKAT =================
async function loadPerangkat(){
  try{
    const res = await fetch(API_URL, {
      method:"POST",
      body:JSON.stringify({
        action:"getPerangkatHalte",
        token:token,
        halte_id:halte_id
      })
    });
    const data = await res.json();
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
    console.log(err);
  }
}

// ================= FILTER =================
function filterPerangkat(){
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("filterStatus").value;

  const filtered = perangkatList.filter(item => {
    const cocokKeyword = item.nama_perangkat.toLowerCase().includes(keyword) || 
                         item.serial_number.toLowerCase().includes(keyword);
    const cocokStatus = status == "" ? true : item.status == status;
    return cocokKeyword && cocokStatus;
  });

  renderPerangkat(filtered);
}

// ================= RENDER =================
function renderPerangkat(dataList){
  let html = "";

  if(dataList.length == 0){
    html = `<div class="bg-white rounded-2xl p-10 text-center text-gray-500 col-span-full shadow-inner">Belum ada perangkat</div>`;
  }

  dataList.forEach(item => {
    html += `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
        <div class="p-5 flex-grow">
          <!-- STATUS & PHOTO BUTTON -->
          <div class="flex justify-between items-start mb-4">
            <span class="px-3 py-1 rounded-full text-xs font-bold text-white ${item.status == 'On Service' ? 'bg-green-500' : 'bg-red-500'}">
              ${item.status}
            </span>
            
            <!-- BUTTON LIHAT FOTO (Ganti Preview Gambar) -->
            <button onclick="openPhoto('${item.photo}')" class="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition border border-blue-200">
              Lihat Foto
            </button>
          </div>

          <h2 class="text-xl font-bold text-gray-800">${item.nama_perangkat}</h2>
          <p class="text-gray-500 text-sm mb-4">${item.merk_model}</p>

          <div class="space-y-2 text-sm border-t pt-4">
            <div class="flex justify-between"><span class="text-gray-500">Kategori:</span> <span class="font-medium">${item.kategori}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">S/N:</span> <span class="font-mono font-bold text-blue-700">${item.serial_number}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Engineer:</span> <span class="font-medium">${item.engineer}</span></div>
            ${item.arah ? `<div class="flex justify-between"><span class="text-gray-500">Arah:</span> <span class="font-medium">${item.arah}</span></div>` : ""}
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="p-4 bg-gray-50 border-t flex gap-2">
          <button onclick="window.location.href='stock-opname.html?edit=1&id=${item.opname_id}&halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}'" 
                  class="bg-amber-400 hover:bg-amber-500 text-white font-bold py-2 rounded-lg flex-1 text-sm transition">
            Edit
          </button>
          <button onclick="deletePerangkat('${item.opname_id}')" 
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
      loadPerangkat();
    } else {
      alert(data.message);
    }
  } catch(err) {
    console.log(err);
  }
}

// ================= PHOTO MODAL =================
function openPhoto(url){
  if(!url || url === "undefined" || url === "") {
    alert("Foto tidak tersedia");
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
