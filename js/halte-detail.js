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

    data.data.forEach(item => {

      html += `

        <tr class="border-b">

          <td class="p-2">

            <img
              src="${item.photo}"
              class="w-20 h-20 object-cover rounded"
            >

          </td>

          <td class="p-2">
            ${item.kategori}
          </td>

          <td class="p-2">
            ${item.nama_perangkat}
          </td>

          <td class="p-2">
            ${item.merk_model}
          </td>

          <td class="p-2">
            ${item.serial_number}
          </td>

          <td class="p-2">
            ${item.status}
          </td>

          <td class="p-2">
            ${item.engineer}
          </td>

        </tr>

      `;

    });

    document.getElementById("tablePerangkat").innerHTML =
      html;

  }catch(err){

    console.log(err);

  }

}
