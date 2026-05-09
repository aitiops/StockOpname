document.getElementById("namaUser").innerHTML =
  localStorage.getItem("nama");


loadDashboardKasi();


async function loadDashboardKasi(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDashboardKasi",

        token:token

      })

    });

    const data = await res.json();


    // SUMMARY
    document.getElementById("totalHalte").innerHTML =
      data.total_halte;

    document.getElementById("halteSelesai").innerHTML =
      data.halte_selesai;

    document.getElementById("progressVisit").innerHTML =
      data.progress + "%";

    document.getElementById("onService").innerHTML =
      data.on_service;

    document.getElementById("outService").innerHTML =
      data.out_service;


    // KATEGORI
    let kategoriHtml = "";

    data.kategori.forEach(item => {

      kategoriHtml += `

        <tr class="border-b">

          <td class="p-2">
            ${item.kategori}
          </td>

          <td class="p-2">
            ${item.total}
          </td>

        </tr>

      `;

    });

    document.getElementById("tableKategori").innerHTML =
      kategoriHtml;


    // KORIDOR
    let koridorHtml = "";

    data.koridor.forEach(item => {

      koridorHtml += `

        <tr class="border-b">

          <td class="p-2">
            ${item.koridor}
          </td>

          <td class="p-2">
            ${item.selesai}
          </td>

          <td class="p-2">
            ${item.progress}%
          </td>

        </tr>

      `;

    });

    document.getElementById("tableKoridor").innerHTML =
      koridorHtml;

  }catch(err){

    console.log(err);

  }

}
