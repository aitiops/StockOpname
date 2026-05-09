const token = localStorage.getItem("token");

if(!token){

  window.location.href = "index.html";

}


function logout(){

  localStorage.clear();

  window.location.href = "index.html";

}
