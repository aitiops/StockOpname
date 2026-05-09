const urlParams = new URLSearchParams(window.location.search);

const halte_id = urlParams.get("halte_id");
const halte_nama = urlParams.get("halte_nama");
const koridor_id = urlParams.get("koridor_id");

document.getElementById("halteNama").value =
  halte_nama;


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

    message.innerHTML = err;

  }

}
