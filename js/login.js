async function login(){

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const message = document.getElementById("message");

  message.innerHTML = "Loading...";

  try{

    const res = await fetch(API_URL, {

      method: "POST",

      body: JSON.stringify({
        action: "login",
        username: username,
        password: password
      })

    });

    const data = await res.json();

    if(data.status){

      // simpan session
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("nama", data.user.nama);

      // redirect role
      if(data.user.role == "engineer"){

        window.location.href = "engineer.html";

      }else if(data.user.role == "koordinator"){

        window.location.href = "koordinator.html";

      }else if(data.user.role == "kasie"){

        window.location.href = "kasie.html";

      }

    }else{

      message.innerHTML = data.message;

    }

  }catch(err){

    message.innerHTML = err;

  }

}
