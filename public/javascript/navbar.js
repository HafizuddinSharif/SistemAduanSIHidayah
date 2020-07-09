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
