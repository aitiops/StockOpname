document.getElementById("namaUser").innerHTML =
  localStorage.getItem("nama");


loadDashboard();


async function loadDashboard(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({
        action:"test",
        token:token
      })

    });

    const data = await res.json();

    console.log(data);

    // DUMMY DATA
    document.getElementById("totalHalte").innerHTML = 12;

    document.getElementById("halteSelesai").innerHTML = 5;

    document.getElementById("progressVisit").innerHTML = "42%";


    // DUMMY TABLE
    const halte = [
      {
        nama:"Pinang Ranti",
        koridor:"9",
        status:"Complete"
      },
      {
        nama:"Cikoko",
        koridor:"9",
        status:"On Progress"
      }
    ];


    let html = "";

    halte.forEach(item => {

      html += `
        <tr class="border-b">

          <td class="p-2">
            ${item.nama}
          </td>

          <td class="p-2">
            ${item.koridor}
          </td>

          <td class="p-2">
            ${item.status}
          </td>

          <td class="p-2">

            <button class="bg-blue-600 text-white px-3 py-1 rounded">

              Input

            </button>

          </td>

        </tr>
      `;

    });

    document.getElementById("tableHalte").innerHTML = html;

  }catch(err){

    console.log(err);

  }

}
