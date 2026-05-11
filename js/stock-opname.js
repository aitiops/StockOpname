let halteList = [];

let masterPerangkat = [];

// ================= URL PARAMS =================
const urlParams =
  new URLSearchParams(
    window.location.search
  );

const halteId =
  urlParams.get("halte_id");

const halteNama =
  urlParams.get("halte_nama");

const koridorId =
  urlParams.get("koridor_id");

const editMode =
  urlParams.get("edit");

const opnameId =
  urlParams.get("id");


// ================= INIT =================
loadHalteDetail();

loadMasterPerangkat();

if(editMode){

  loadEditData();

}


// ================= COMPRESS IMAGE =================
async function compressImage(file){

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = function(event){

      const img = new Image();

      img.src = event.target.result;

      img.onload = function(){

        const canvas =
          document.createElement("canvas");

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

        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        // compress jpeg
        const compressedBase64 =
          canvas.toDataURL(
            "image/jpeg",
            0.5
          );

        resolve(compressedBase64);

      };

    };

  });

}


// ================= SAVE =================
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


  message.innerHTML =
    "Compressing image...";


  let photoBase64 = "";

  // compress image
  if(photoFile){

    photoBase64 =
      await compressImage(photoFile);

  }


  message.innerHTML =
    "Uploading data...";


  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:
          editMode
          ? "updateStockOpname"
          : "saveStockOpname",

        token:token,

        opname_id:opnameId,

        updated_by:
          localStorage.getItem("nama"),

        halte_id:halteId,

        halte_nama:halteNama,

        koridor_id:koridorId,

        kategori:kategori,

        nama_perangkat:namaPerangkat,

        merk_model:merkModel,

        serial_number:serialNumber,

        status:statusPerangkat,

        arah:
          document.getElementById("arahPerangkat")
          ? document.getElementById("arahPerangkat").value
          : "",

        force_save:false,

        photo:photoBase64

      })

    });

    const data =
      await res.json();


    if(data.status){

      message.innerHTML =
        editMode
        ? "Data berhasil diupdate"
        : "Stock opname berhasil disimpan";
    
    
      // delay 1 detik
      setTimeout(() => {
    
        window.location.href =
          `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
    
      }, 1000);
    
    }

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

    console.log(err);

    message.innerHTML = err;

  }

}


// ================= FORCE SAVE =================
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

        halte_id:halteId,

        halte_nama:halteNama,

        koridor_id:koridorId,

        kategori:kategori,

        nama_perangkat:namaPerangkat,

        merk_model:merkModel,

        serial_number:serialNumber,

        status:statusPerangkat,

        arah:
          document.getElementById("arahPerangkat")
          ? document.getElementById("arahPerangkat").value
          : "",

        force_save:true,

        photo:photoBase64

      })

    });

    const data =
      await res.json();

    if(data.status){

      message.innerHTML =
        "Stock opname berhasil disimpan";
    
      setTimeout(() => {
    
        window.location.href =
          `halte-detail.html?halte_id=${halteId}&halte_nama=${halteNama}&koridor_id=${koridorId}`;
    
      }, 1000);
    
    }

    }else{

      message.innerHTML =
        data.message;

    }

  }catch(err){

    console.log(err);

  }

}


// ================= LOAD MASTER =================
async function loadMasterPerangkat(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getMasterPerangkat",

        token:token

      })

    });

    const data =
      await res.json();

    masterPerangkat =
      data.data;


    // kategori unik
    const kategoriUnik = [

      ...new Set(

        masterPerangkat.map(
          item => item.kategori
        )

      )

    ];


    let html =
      `
      <option value="">
        Silahkan Pilih Kategori
      </option>
      `;


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


// ================= CHANGE KATEGORI =================
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
    `
    <option value="">
      Silahkan Pilih Perangkat
    </option>
    `;


  perangkatUnik.forEach(item => {

    html += `
      <option value="${item}">
        ${item}
      </option>
    `;

  });


  document.getElementById("namaPerangkat").innerHTML =
    html;


  // reset merk
  document.getElementById("merkModel").innerHTML =
    `
    <option value="">
      Silahkan Pilih Merk / Model
    </option>
    `;

}


// ================= CHANGE PERANGKAT =================
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
    `
    <option value="">
      Silahkan Pilih Merk / Model
    </option>
    `;


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


// ================= LOAD HALTE DETAIL =================
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


    // dual arah
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


// ================= LOAD EDIT DATA =================
async function loadEditData(){

  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"getDetailPerangkat",

        token:token,

        opname_id:opnameId

      })

    });

    const result =
      await res.json();


    console.log(result);


    if(!result.status){

      alert("Data tidak ditemukan");

      return;

    }


    const item =
      result.data;


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

    }, 600);


    // serial
    document.getElementById("serialNumber").value =
      item.serial_number;


    // status
    document.getElementById("statusPerangkat").value =
      item.status;


    // arah
    if(item.arah){

      const arahContainer =
        document.getElementById("arahContainer");

      arahContainer.classList.remove("hidden");


      setTimeout(() => {

        document.getElementById("arahPerangkat").value =
          item.arah;

      }, 500);

    }


    // tombol
    document.querySelector("button").innerHTML =
      "Update Data";

  }catch(err){

    console.log(err);

  }

}
