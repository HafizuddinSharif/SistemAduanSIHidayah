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

// Handling selection of options

// $(".kawasan").click( function(event) {
//
//   let current_kawasan = document.aduan.kawasan.value
//
//   document.aduan.lokasi.options.length = 0
//   document.aduan.lokasi.options[0] = new Option("Sila Pilih", "0", true, false)
// })
