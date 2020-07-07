//jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))

app.get("/aduan", function(req, res) {
  res.render("log-masuk")
})

app.get("/aduan/user/buat-aduan", function(req, res) {
  res.render("buat-aduan")
})

app.get("/aduan/user/semakan-aduan", function(req, res) {
  res.render("semakan-aduan")
})

app.get("/aduan/user/tukar-katalaluan", function(req, res) {
  res.render("tukar-katalaluan")
})

app.get("/aduan/admin/direktori-pengguna", function(req, res) {
  res.render("direktori-pengguna")
})


app.listen(3000, function() {
  console.log("Server started on port 3000")
})
