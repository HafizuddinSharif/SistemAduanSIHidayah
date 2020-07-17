// Handling the Navbar opening animation

var appear = false

$(".burger").on("click", function(event) {

  if (!appear) {
    appear = true
    $("nav a").addClass("appear")
    $(".burger").text("Tutup Menu")
  }

  else if (appear) {
    appear = false
    $("nav a").removeClass("appear")
    $(".burger").text("Menu")
  }

})

// Handling when direktori pengguna table is clicked on one of its row

$(".clickable-row tr").on("click", function(event) {

  $(".clickable-row tr").removeClass("clicked-row")

  $(this).addClass("clicked-row")

})

// Handling password confirmation in /daftar

var password = document.getElementById("katalaluan")
var confirm_password = document.getElementById("pasti_katalaluan");

function validatePassword(){
  console.log(password.value)
  console.log(confirm_password.value)
  if(password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity('');
  }
}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;
