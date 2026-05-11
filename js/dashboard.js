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

    const dashboardRes = await fetch(API_URL, {

      method:"POST",
    
      body:JSON.stringify({
    
        action:"getDashboardEngineer",
    
        token:token
    
      })
    
    });
    
    const dashboardData =
      await dashboardRes.json();
    
    if(!dashboardData.status){

      alert("Session habis, silahkan login ulang");
    
      localStorage.clear();
    
      window.location.href = "index.html";
    
      return;
    
    }
    
    
    const dashboard = dashboardData;
    
    document.getElementById("totalHalte").innerHTML =
      dashboard.total_halte || 0;
    
    
    document.getElementById("halteSelesai").innerHTML =
      dashboard.halte_selesai || 0;
    
    
    document.getElementById("progressVisit").innerHTML =
      (dashboard.progress || 0) + "%";


    // DUMMY TABLE
    const halteRes = await fetch(API_URL, {

      method:"POST",
    
      body:JSON.stringify({
        action:"getHalte",
        token:token
      })
    
    });
    
    const halteData = await halteRes.json();
    const halte =
      halteData.data || halteData || [];

    let html = "";

    console.log(halteData);

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
                'halte-detail.html?halte_id=${item.halte_id}&halte_nama=${item.nama_halte}&koridor_id=${item.koridor_id}'
              "
              class="bg-blue-600 text-white px-3 py-1 rounded"
            >
            
              Detail
            
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
