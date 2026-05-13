const urlParams = new URLSearchParams(window.location.search);

const halte_id =
  urlParams.get("halte_id");

const halte_nama =
  urlParams.get("halte_nama");

const koridor_id =
  urlParams.get("koridor_id");

let perangkatList = [];


// ================= TITLE =================
document.getElementById("halteTitle").innerHTML =
  halte_nama;

document.getElementById("koridorTitle").innerHTML =
  koridor_id;


// ================= LOAD =================
loadPerangkat();


// ================= GO INPUT =================
function goInput(){

  window.location.href =
    `stock-opname.html?halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}`;

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

    const data =
      await res.json();

    console.log(data);

    perangkatList =
      data.data || [];


    // ================= TOTAL =================
    let total = 0;
    let totalOn = 0;
    let totalOff = 0;


    perangkatList.forEach(item => {

      total++;

      if(item.status == "On Service"){

        totalOn++;

      }else{

        totalOff++;

      }

    });


    // render
    renderPerangkat(perangkatList);


    // summary
    document.getElementById("totalPerangkat").innerHTML =
      total;

    document.getElementById("totalOn").innerHTML =
      totalOn;

    document.getElementById("totalOff").innerHTML =
      totalOff;

  }catch(err){

    console.log(err);

  }

}


// ================= FILTER =================
function filterPerangkat(){

  const keyword =
    document.getElementById("searchInput")
    .value
    .toLowerCase();

  const status =
    document.getElementById("filterStatus")
    .value;


  const filtered =
    perangkatList.filter(item => {

      const cocokKeyword =

        item.nama_perangkat
          .toLowerCase()
          .includes(keyword)

        ||

        item.serial_number
          .toLowerCase()
          .includes(keyword);


      const cocokStatus =

        status == ""
        ? true
        : item.status == status;


      return cocokKeyword && cocokStatus;

    });


  renderPerangkat(filtered);

}


// ================= RENDER =================
function renderPerangkat(dataList){

  let html = "";


  if(dataList.length == 0){

    html = `

      <div class="
        bg-white
        rounded-2xl
        p-10
        text-center
        text-gray-500
      ">

        Belum ada perangkat

      </div>

    `;

  }


  dataList.forEach(item => {

    html += `

      <div class="
        bg-white
        rounded-2xl
        shadow
        overflow-hidden
      ">

        <!-- PHOTO -->
        <img
          src="${item.photo}"
          onclick="
            openPhoto('${item.photo}')
          "
          class="
            w-full
            h-48
            object-cover
            cursor-pointer
            hover:scale-105
            transition
          "
        >

        <div class="p-4">

          <!-- STATUS -->
          <div class="mb-3">

            <span class="
              px-3
              py-1
              rounded-full
              text-sm
              text-white

              ${
                item.status == "On Service"
                ? "bg-green-500"
                : "bg-red-500"
              }
            ">

              ${item.status}

            </span>

          </div>


          <!-- DEVICE -->
          <h2 class="text-xl font-bold">

            ${item.nama_perangkat}

          </h2>

          <p class="text-gray-500">

            ${item.merk_model}

          </p>


          <!-- INFO -->
          <div class="mt-4 space-y-1 text-sm">

            <p>
              <b>Kategori:</b>
              ${item.kategori}
            </p>

            <p>
              <b>Serial Number:</b>
              ${item.serial_number}
            </p>

            <p>
              <b>Engineer:</b>
              ${item.engineer}
            </p>

            ${
              item.arah
              ? `
                <p>
                  <b>Arah:</b>
                  ${item.arah}
                </p>
              `
              : ""
            }

          </div>


          <!-- ACTION -->
          <div class="mt-4 flex gap-2">

            <!-- EDIT -->
            <button
              onclick="
                window.location.href=
                'stock-opname.html?edit=1&id=${item.opname_id}&halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}'
              "
              class="
                bg-yellow-500
                text-white
                px-4
                py-2
                rounded-lg
                w-full
              "
            >

              Edit

            </button>


            <!-- DELETE -->
            <button
              onclick="
                deletePerangkat('${item.opname_id}')
              "
              class="
                bg-red-600
                text-white
                px-4
                py-2
                rounded-lg
                w-full
              "
            >

              Hapus

            </button>

          </div>

        </div>

      </div>

    `;

  });


  document.getElementById("tablePerangkat").innerHTML =
    html;

}


// ================= DELETE =================
async function deletePerangkat(opnameId){

  const lanjut = confirm(
    "Yakin ingin menghapus perangkat ini?"
  );

  if(!lanjut){

    return;

  }

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"deletePerangkat",

        token:token,

        opname_id:opnameId

      })

    });

    const data =
      await res.json();


    if(data.status){

      alert("Data berhasil dihapus");

      loadPerangkat();

    }else{

      alert(data.message);

    }

  }catch(err){

    console.log(err);

  }

}


// ================= PHOTO MODAL =================
function openPhoto(url){

  document.getElementById("modalImage").src =
    url;

  document.getElementById("photoModal")
    .classList.remove("hidden");

  document.getElementById("photoModal")
    .classList.add("flex");

}


function closePhoto(){

  document.getElementById("photoModal")
    .classList.remove("flex");

  document.getElementById("photoModal")
    .classList.add("hidden");

}
