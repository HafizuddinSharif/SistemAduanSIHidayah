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

// var allElems = document.getElementsByClassName('radio1');
// for (i = 0; i < allElems.length; i++) {
//     if (allElems[i].type == 'radio' && allElems[i].value == `<%= pengguna.Jawatan %>`) {
//         allElems[i].checked = true;
//     }
// }
//
// console.log(allElems)
