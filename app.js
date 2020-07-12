//jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')
var mysql      = require('mysql');

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(__dirname + "/public"))

app.use("/public", express.static('public'))

// Establishing connection to database

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});


app.get("/aduan", function(req, res) {
  res.render("log-masuk")
})

app.post("/aduan", function(req, res) {

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

app.get("/aduan/user/tindakan/tindakan-lengkap", function(req, res) {
  res.render("tindakan-lengkap")
})


app.listen(3000, function() {
  console.log("Server started on port 3000")
})
