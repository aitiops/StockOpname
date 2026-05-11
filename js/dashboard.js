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
    
    console.log(dashboardData);
    
    if(!dashboardData.status){
    
      alert("Session habis");
    
      localStorage.clear();
    
      window.location.href = "index.html";
    
      return;
    
    }
    
    const dashboard =
      dashboardData.data;
    
    
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

    // ================= GROUP KORIDOR =================

let koridorMap = {};

halte.forEach(item => {

  if(!koridorMap[item.koridor_id]){

    koridorMap[item.koridor_id] = [];

  }

  koridorMap[item.koridor_id].push(item);

});


// ================= BUILD CARD =================

let html = "";

for(let koridor in koridorMap){

  let halteHtml = "";

  koridorMap[koridor].forEach(item => {

    let badge = `
      <span class="
        bg-red-100
        text-red-600
        text-xs
        px-2
        py-1
        rounded-full
      ">
        Belum
      </span>
    `;


    if(item.status == "Selesai"){

      badge = `
        <span class="
          bg-green-100
          text-green-600
          text-xs
          px-2
          py-1
          rounded-full
        ">
          Selesai
        </span>
      `;

    }


    halteHtml += `

      <div class="
        flex
        justify-between
        items-center
        border-b
        py-2
      ">

        <div>

          <div class="font-medium">
            ${item.nama_halte}
          </div>

          <div class="text-xs text-gray-500">
            Halte ${item.halte_id}
          </div>

        </div>

        <div class="flex gap-2 items-center">

          ${badge}

          <button
            onclick="
              window.location.href=
              'halte-detail.html?halte_id=${item.halte_id}&halte_nama=${item.nama_halte}&koridor_id=${item.koridor_id}'
            "
            class="
              bg-blue-600
              text-white
              text-xs
              px-3
              py-1
              rounded-lg
            "
          >
            Detail
          </button>

        </div>

      </div>

    `;

  });


  html += `

    <div class="
      bg-white
      rounded-2xl
      shadow-sm
      p-4
    ">

      <div class="
        flex
        justify-between
        items-center
        mb-4
      ">

        <div>

          <h2 class="
            text-lg
            font-bold
          ">
            Koridor ${koridor}
          </h2>

          <p class="
            text-sm
            text-gray-500
          ">
            ${koridorMap[koridor].length} halte
          </p>

        </div>

      </div>

      ${halteHtml}

    </div>

  `;

}


document.getElementById(
  "dashboardKoridor"
).innerHTML = html;

  }catch(err){

    console.log(err);

  }

}
