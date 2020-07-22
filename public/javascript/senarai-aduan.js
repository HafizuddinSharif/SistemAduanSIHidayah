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

  $("#semak").removeClass('hidden')
  // $("#hapus").removeClass('hidden')

  let new_html = $(this)[0]

  let content = new_html.getElementsByTagName('td')[0].innerText

  document.getElementById('semak').value = content
  // document.getElementById('hapus').value = content

})
