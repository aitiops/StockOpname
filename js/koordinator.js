document.getElementById("namaUser").innerHTML =
  localStorage.getItem("nama");


loadDashboardKoordinator();


async function loadDashboardKoordinator(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDashboardKoordinator",

        token:token

      })

    });

    const data = await res.json();

    // CARD
    document.getElementById("totalHalte").innerHTML =
      data.total_halte;

    document.getElementById("halteSelesai").innerHTML =
      data.halte_selesai;

    document.getElementById("progressVisit").innerHTML =
      data.progress + "%";

    document.getElementById("totalPerangkat").innerHTML =
      data.total_perangkat;


    // TABLE ENGINEER
    let html = "";

    data.engineer.forEach(item => {

      html += `
        <tr class="border-b">

          <td class="p-2">
            ${item.nama}
          </td>

          <td class="p-2">
            ${item.total_input}
          </td>

          <td class="p-2">
            ${item.halte_selesai}
          </td>

        </tr>
      `;

    });

    document.getElementById("tableEngineer").innerHTML =
      html;

  }catch(err){

    console.log(err);

  }

}
