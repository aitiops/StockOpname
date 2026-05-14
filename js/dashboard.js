// ================= INIT =================
document.getElementById("namaUser").innerHTML =
  localStorage.getItem("nama");


const page =
  window.location.pathname;


// ================= AUTO LOAD =================

// engineer
if(page.includes("engineer.html")){

  loadDashboardEngineer();

}

// koordinator
if(page.includes("koordinator.html")){

  loadDashboardKoordinator();

}

// kasi
if(page.includes("kasi.html")){

  loadDashboardKasi();

}



// =====================================================
// ================= DASHBOARD ENGINEER =================
// =====================================================
async function loadDashboardEngineer(){

  try{

    // ================= DASHBOARD =================
    const dashboardRes = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDashboardEngineer",

        token:token

      })

    });

    const dashboardData =
      await dashboardRes.json();

    console.log("DASHBOARD:");
    console.log(dashboardData);


    const dashboard =
      dashboardData.data
      ? dashboardData.data
      : dashboardData;


    document.getElementById("totalHalte").innerHTML =
      dashboard.total_halte || 0;


    document.getElementById("halteSelesai").innerHTML =
      dashboard.halte_selesai || 0;


    document.getElementById("progressVisit").innerHTML =
      (dashboard.progress || 0) + "%";



    // ================= GET HALTE =================
    const halteRes = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getHalte",

        token:token

      })

    });

    const halteData =
      await halteRes.json();

    console.log(halteData);


    const halte =
      halteData.data
      ? halteData.data
      : halteData;



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
          mb-4
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



// =======================================================
// ================= DASHBOARD KOORDINATOR =================
// =======================================================
async function loadDashboardKoordinator(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDashboardKoordinator",

        token:token

      })

    });

    const data =
      await res.json();

    console.log(data);


    document.getElementById("totalHalte").innerHTML =
      data.total_halte || 0;

    document.getElementById("halteSelesai").innerHTML =
      data.halte_selesai || 0;

    document.getElementById("progressVisit").innerHTML =
      (data.progress || 0) + "%";


  }catch(err){

    console.log(err);

  }

}



// ================================================
// ================= DASHBOARD KASI =================
// ================================================
async function loadDashboardKasi(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDashboardKasi",

        token:token

      })

    });

    const data =
      await res.json();

    console.log(data);


    // ================= SUMMARY =================
    document.getElementById("totalHalte").innerHTML =
      data.total_halte || 0;

    document.getElementById("halteSelesai").innerHTML =
      data.halte_selesai || 0;

    document.getElementById("onService").innerHTML =
      data.on_service || 0;

    document.getElementById("outService").innerHTML =
      data.out_service || 0;


    // ================= PROGRESS =================
    document.getElementById("progressText").innerHTML =
      (data.progress || 0) + "%";

    document.getElementById("progressBar").style.width =
      (data.progress || 0) + "%";


    // ================= KATEGORI =================
    let kategoriHtml = "";

    data.kategori.forEach(item => {

      kategoriHtml += `

        <div class="
          border
          rounded-xl
          p-4
          bg-white
        ">

          <p class="
            text-gray-500
            text-sm
          ">
            ${item.kategori}
          </p>

          <h2 class="
            text-2xl
            font-bold
            mt-2
          ">
            ${item.total}
          </h2>

        </div>

      `;

    });

    document.getElementById("kategoriContainer").innerHTML =
      kategoriHtml;


    // ================= KORIDOR =================
    let koridorHtml = "";

    data.koridor.forEach(item => {

      koridorHtml += `

        <div class="mb-5">

          <div class="
            flex
            justify-between
            mb-1
          ">

            <span class="font-bold">
              Koridor ${item.koridor}
            </span>

            <span>
              ${item.progress}%
            </span>

          </div>

          <div class="
            w-full
            bg-gray-200
            rounded-full
            h-4
          ">

            <div
              class="
                bg-purple-600
                h-4
                rounded-full
              "
              style="
                width:${item.progress}%
              "
            ></div>

          </div>

        </div>

      `;

    });

    document.getElementById("koridorContainer").innerHTML =
      koridorHtml;

  }catch(err){

    console.log(err);

  }

}

// FUNGSI ANIMASI BOOTING
async function runBootSequence() {
    const messages = [
        "> CONNECTING TO DATABASE...",
        "> AUTHENTICATING TOKEN...",
        "> FETCHING ASSET STATUS...",
        "> SYSTEM READY. SYNCING..."
    ];

    for (let i = 0; i < messages.length; i++) {
        const el = document.getElementById(`bootMsg${i + 1}`);
        if (el) {
            el.innerText = messages[i];
            el.classList.replace('opacity-0', 'opacity-100');
            // Jeda antar baris biar kayak beneran mikir
            await new Promise(r => setTimeout(r, 400)); 
        }
    }
}

// MODIFIKASI FUNGSI LOAD DASHBOARD
async function loadDashboardEngineer() {
    // 1. Jalankan animasi booting dulu
    await runBootSequence();

    try {
        // 2. Baru ambil data dari server
        const dashboardRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getDashboardEngineer", token: token })
        });
        
        const dashboardData = await dashboardRes.json();
        
        // ... (Sisa kode ambil data kamu yang lain) ...

        // 3. Matikan loading kalau SEMUA data sudah siap
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.remove('loading-active');
        }, 500);

    } catch (err) {
        console.log(err);
        document.getElementById('bootMsg4').innerText = "> ERROR: CONNECTION FAILED";
        document.getElementById('bootMsg4').style.color = "red";
    }
}
