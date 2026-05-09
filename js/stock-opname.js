const urlParams = new URLSearchParams(window.location.search);

const halte_id = urlParams.get("halte_id");
const halte_nama = urlParams.get("halte_nama");

document.getElementById("halteNama").value = halte_nama;


async function saveStockOpname(){

  const namaPerangkat =
    document.getElementById("namaPerangkat").value;

  const serialNumber =
    document.getElementById("serialNumber").value;

  const kondisi =
    document.getElementById("kondisi").value;

  const keterangan =
    document.getElementById("keterangan").value;

  const message =
    document.getElementById("message");

  message.innerHTML = "Loading...";


  try{

    const res = await fetch(API_URL, {

      method:"POST",

      body:JSON.stringify({

        action:"saveStockOpname",

        token:token,

        halte_id:halte_id,

        nama_perangkat:namaPerangkat,

        serial_number:serialNumber,

        kondisi:kondisi,

        keterangan:keterangan

      })

    });

    const data = await res.json();

    if(data.status){

      message.innerHTML = "Data berhasil disimpan";

    }else{

      message.innerHTML = data.message;

    }

  }catch(err){

    message.innerHTML = err;

  }

}
