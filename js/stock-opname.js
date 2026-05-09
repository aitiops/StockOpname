let halteList = [];

let masterPerangkat = [];

const urlParams = new URLSearchParams(window.location.search);

const halte_id = urlParams.get("halte_id");
const halte_nama = urlParams.get("halte_nama");
const koridor_id = urlParams.get("koridor_id");

const editId = urlParams.get("edit");

const urlParams = new URLSearchParams(window.location.search);

const halteId = urlParams.get("halte_id");

document.getElementById("halteNama").value =
  halte_nama;

loadHalteDetail();

loadMasterPerangkat();
if(editId){

  loadEditData();

}


async function compressImage(file){

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = function(event){

      const img = new Image();

      img.src = event.target.result;

      img.onload = function(){

        const canvas = document.createElement("canvas");

        const MAX_WIDTH = 1280;

        let width = img.width;
        let height = img.height;

        // resize
        if(width > MAX_WIDTH){

          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;

        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        // compress jpeg
        const compressedBase64 =
          canvas.toDataURL("image/jpeg", 0.5);

        resolve(compressedBase64);

      };

    };

  });

}



async function saveStockOpname(){

  const kategori =
    document.getElementById("kategori").value;

  const namaPerangkat =
    document.getElementById("namaPerangkat").value;

  const merkModel =
    document.getElementById("merkModel").value;

  const serialNumber =
    document.getElementById("serialNumber").value;

  const statusPerangkat =
    document.getElementById("statusPerangkat").value;

  const photoFile =
    document.getElementById("photo").files[0];

  const message =
    document.getElementById("message");

  message.innerHTML = "Compressing image...";


  let photoBase64 = "";

  // compress image
  if(photoFile){

    photoBase64 =
      await compressImage(photoFile);

  }


  message.innerHTML = "Uploading data...";


  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"saveStockOpname",

        token:token,

        halte_id:halte_id,
        halte_nama:halte_nama,
        koridor_id:koridor_id,

        kategori:kategori,
        nama_perangkat:namaPerangkat,
        merk_model:merkModel,
        serial_number:serialNumber,
        status:statusPerangkat,
        force_save:false,
        halte_id : halteId,

          arah :
            document.getElementById("arahPerangkat")
            ? document.getElementById("arahPerangkat").value
            : "",

        photo:photoBase64

      })

    });

    const data = await res.json();

if(data.status){

  message.innerHTML =
    "Stock opname berhasil disimpan";

}else{

  // duplicate warning
  if(data.duplicate){

    const lanjut = confirm(
      "Perangkat dengan Serial Number ini kemungkinan sudah pernah diinput.\n\nTetap simpan?"
    );

    if(lanjut){

      saveForce();

    }else{

      message.innerHTML =
        "Penyimpanan dibatalkan";

    }

  }else{

    message.innerHTML =
      data.message;

  }

}

}catch(err){

  message.innerHTML = err;

}

async function saveForce(){

  const kategori =
    document.getElementById("kategori").value;

  const namaPerangkat =
    document.getElementById("namaPerangkat").value;

  const merkModel =
    document.getElementById("merkModel").value;

  const serialNumber =
    document.getElementById("serialNumber").value;

  const statusPerangkat =
    document.getElementById("statusPerangkat").value;

  const photoFile =
    document.getElementById("photo").files[0];

  const message =
    document.getElementById("message");

  message.innerHTML =
    "Uploading data...";


  let photoBase64 = "";

  if(photoFile){

    photoBase64 =
      await compressImage(photoFile);

  }

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"saveStockOpname",

        token:token,

        halte_id:halte_id,
        halte_nama:halte_nama,
        koridor_id:koridor_id,

        kategori:kategori,
        nama_perangkat:namaPerangkat,
        merk_model:merkModel,
        serial_number:serialNumber,
        status:statusPerangkat,

        force_save:true,

        photo:photoBase64

      })

    });

    const data = await res.json();

    if(data.status){

      message.innerHTML =
        "Stock opname berhasil disimpan";

    }else{

      message.innerHTML =
        data.message;

    }

  }catch(err){

    console.log(err);

  }

}

async function loadMasterPerangkat(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getMasterPerangkat",

        token:token

      })

    });

    const data = await res.json();

    masterPerangkat = data.data;

    // ambil kategori unik
    const kategoriUnik = [
      ...new Set(
        masterPerangkat.map(
          item => item.kategori
        )
      )
    ];

    let html =
      `<option value="">
        Silahkan Pilih Kategori
      </option>`;

    kategoriUnik.forEach(item => {

      html += `
        <option value="${item}">
          ${item}
        </option>
      `;

    });

    document.getElementById("kategori").innerHTML =
      html;

  }catch(err){

    console.log(err);

  }

}

function changeKategori(){

  const kategori =
    document.getElementById("kategori").value;

  const perangkat =
    masterPerangkat.filter(

      item => item.kategori == kategori

    );

  // unique perangkat
  const perangkatUnik = [
    ...new Set(
      perangkat.map(
        item => item.nama_perangkat
      )
    )
  ];

  let html =
    `<option value="">
      Silahkan Pilih Perangkat
    </option>`;

  perangkatUnik.forEach(item => {

    html += `
      <option value="${item}">
        ${item}
      </option>
    `;

  });

  document.getElementById("namaPerangkat").innerHTML =
    html;


  // reset merk model
  document.getElementById("merkModel").innerHTML =
    `<option value="">
      Silahkan Pilih Merk / Model
    </option>`;

}

function changePerangkat(){

  const kategori =
    document.getElementById("kategori").value;

  const perangkat =
    document.getElementById("namaPerangkat").value;

  const merkModel =
    masterPerangkat.filter(

      item =>
        item.kategori == kategori &&
        item.nama_perangkat == perangkat

    );

  let html =
    `<option value="">
      Silahkan Pilih Merk / Model
    </option>`;

  const merkUnik = [
  ...new Set(
    merkModel.map(
      item => item.merk_model
    )
  )
];


merkUnik.forEach(item => {

  html += `
    <option value="${item}">
      ${item}
    </option>
  `;

});

  document.getElementById("merkModel").innerHTML =
    html;

}

async function loadEditData(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDetailOpname",

        token:token,

        opname_id:editId

      })

    });

    const result =
      await res.json();

    const item =
      result.data;


    // set halte
    document.getElementById("halteNama").value =
      item.halte;


    // kategori
    document.getElementById("kategori").value =
      item.kategori;

    changeKategori();


    // perangkat
    setTimeout(() => {

      document.getElementById("namaPerangkat").value =
        item.nama_perangkat;

      changePerangkat();

    }, 300);


    // merk
    setTimeout(() => {

      document.getElementById("merkModel").value =
        item.merk_model;

    }, 500);


    document.getElementById("serialNumber").value =
      item.serial_number;

    document.getElementById("statusPerangkat").value =
      item.status_perangkat;

  }catch(err){

    console.log(err);

  }

}

async function loadHalteDetail(){

  try{

    const res =
      await fetch(API_URL,{

        method:"POST",

        body:JSON.stringify({

          action:"getHalteDetail",

          token:token,

          halte_id:halteId

        })

      });


    const result =
      await res.json();


    const halte =
      result.data;


    document.getElementById("infoKoridor")
      .innerHTML =
      `Koridor ${halte.koridor_id}`;


    document.getElementById("infoHalte")
      .innerHTML =
      halte.nama_halte;


    // CEK DUAL ARAH

    if(halte.tipe_halte == "dual"){

      const arahContainer =
        document.getElementById("arahContainer");

      const arahSelect =
        document.getElementById("arahPerangkat");


      arahContainer.classList.remove("hidden");


      arahSelect.innerHTML =
        `
        <option value="">
          Pilih Arah
        </option>

        <option value="${halte.arah_a}">
          ${halte.arah_a}
        </option>

        <option value="${halte.arah_b}">
          ${halte.arah_b}
        </option>
        `;

    }

  }catch(err){

    console.log(err);

  }

}
