const urlParams = new URLSearchParams(window.location.search);

const halte_id =
  urlParams.get("halte_id");

const halte_nama =
  urlParams.get("halte_nama");

const koridor_id =
  urlParams.get("koridor_id");


document.getElementById("halteTitle").innerHTML =
  halte_nama;

document.getElementById("koridorTitle").innerHTML =
  koridor_id;


loadPerangkat();


function goInput(){

  window.location.href =
    `stock-opname.html?halte_id=${halte_id}&halte_nama=${halte_nama}&koridor_id=${koridor_id}`;

}



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

    let html = "";

    let total = 0;
    let totalOn = 0;
    let totalOff = 0;
    
    
    data.data.forEach(item => {
    
      total++;
    
      if(item.status == "On Service"){
    
        totalOn++;
    
      }else{
    
        totalOff++;
    
      }
    
    
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
            class="
              w-full
              h-48
              object-cover
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
            <div class="mt-4">
    
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
    
                Edit Perangkat
    
              </button>
    
            </div>
    
          </div>
    
        </div>
    
      `;
    
    });
    
    
    document.getElementById("tablePerangkat").innerHTML =
      html;
    
    
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

function editPerangkat(opnameId){

  window.location.href =
    `stock-opname.html?edit=${opnameId}`;

}
