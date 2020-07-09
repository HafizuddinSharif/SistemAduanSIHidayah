//jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(__dirname + "/public"))

app.use("/public", express.static('public'))

app.get("/aduan", function(req, res) {
  res.render("log-masuk")
})

app.get("/aduan/user/buat-aduan", function(req, res) {
  res.render("buat-aduan")
})

// app.get("/aduan/user/semakan-aduan", function(req, res) {
//   res.render("semakan-aduan")
// })

app.get("/aduan/user/semakan-aduan/senarai-aduan", function(req, res) {
  res.render("senarai-aduan")
})

app.get("/aduan/user/semakan-aduan/senarai-aduan/info-aduan", function(req, res) {
  res.render("info-aduan")
})

app.get("/aduan/user/tukar-katalaluan", function(req, res) {
  res.render("tukar-katalaluan")
})

app.get("/aduan/admin/direktori-pengguna", function(req, res) {
  res.render("direktori-pengguna")
})

app.get("/aduan/admin/direktori-pengguna/maklumat-staf", function(req, res) {
  res.render("maklumat-staf")
})

app.get("/aduan/user/tindakan", function(req, res) {
  res.render("tindakan")
})


app.listen(3000, function() {
  console.log("Server started on port 3000")
})
