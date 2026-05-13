document.getElementById("namaUser").innerHTML =
  localStorage.getItem("nama");


loadDashboard();


async function loadDashboard(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDashboardKoordinator",

        token:token

      })

    });

    const data = await res.json();

    console.log(data);


    // SUMMARY
    document.getElementById("totalHalte").innerHTML =
      data.total_halte;

    document.getElementById("halteSelesai").innerHTML =
      data.halte_selesai;

    document.getElementById("progressVisit").innerHTML =
      data.progress + "%";

    document.getElementById("totalPerangkat").innerHTML =
      data.total_perangkat;


    // ================= ENGINEER =================
    let engineerHtml = "";

    data.engineer.forEach(item => {

      engineerHtml += `

        <div class="border rounded-xl p-4">

          <div class="flex justify-between mb-2">

            <div>

              <h2 class="font-bold text-lg">
                ${item.nama}
              </h2>

              <p class="text-sm text-gray-500">
                ${item.halte_selesai} halte selesai
              </p>

            </div>

            <div class="text-right">

              <h2 class="text-2xl font-bold text-blue-600">
                ${item.total_input}
              </h2>

              <p class="text-sm text-gray-500">
                perangkat
              </p>

            </div>

          </div>

        </div>

      `;

    });

    document.getElementById("engineerList").innerHTML =
      engineerHtml;


    // ================= KORIDOR =================
    let koridorHtml = "";

    data.koridor.forEach(item => {

      koridorHtml += `

        <div>

          <div class="flex justify-between mb-1">

            <span class="font-semibold">
              Koridor ${item.koridor}
            </span>

            <span>
              ${item.progress}%
            </span>

          </div>

          <div class="w-full bg-gray-200 rounded-full h-4">

            <div
              class="bg-blue-600 h-4 rounded-full"
              style="width:${item.progress}%"
            ></div>

          </div>

        </div>

      `;

    });

    document.getElementById("koridorList").innerHTML =
      koridorHtml;

  }catch(err){

    console.log(err);

  }

}
