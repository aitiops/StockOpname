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
    const halteRes = await fetch(API_URL, {

      method:"POST",
    
      body:JSON.stringify({
        action:"getHalte",
        token:token
      })
    
    });
    
    const halteData = await halteRes.json();
    
    const halte = halteData.data;


    let html = "";

    halte.forEach(item => {

      html += `
        <tr class="border-b">

          <td class="p-2">
            ${item.nama_halte}
          </td>

          <td class="p-2">
            ${item.koridor_id}
          </td>

          <td class="p-2">
            ${item.status}
          </td>

          <td class="p-2">

            <button
              onclick="
                window.location.href=
                'stock-opname.html?halte_id=${item.halte_id}&halte_nama=${item.nama_halte}&koridor_id=${item.koridor_id}'
              "
              class="bg-blue-600 text-white px-3 py-1 rounded"
            >
            
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
