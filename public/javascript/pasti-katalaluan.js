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

// Handling password confirmation in /tukar-katalalauan

var password_new = document.getElementById("katalaluan_baru")
var confirm_password_new = document.getElementById("pasti_katalaluan_baru");

function validatePasswordNew(){
  console.log(password_new.value)
  console.log(confirm_password_new.value)
  if(password_new.value != confirm_password_new.value) {
    confirm_password_new.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password_new.setCustomValidity('');
  }
}

password_new.onchange = validatePasswordNew;
confirm_password_new.onkeyup = validatePasswordNew;
