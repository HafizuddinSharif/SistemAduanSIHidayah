//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static(__dirname + "/public"))

app.use("/public", express.static('public'))

const saltRounds = 10;

// Establishing connection to database

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'test_db'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});


// GET Requests

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

app.get("/aduan/user/tindakan/tindakan-lengkap", function(req, res) {
  res.render("tindakan-lengkap")
})

// POST Requests

app.post("/log-masuk", function(req, res) {

  let user = req.body.id
  let password = req.body.pass

  let sql = "SELECT ID_Pengguna, Kata_laluan FROM direktori_pengguna WHERE ID_Pengguna = '" +
  user + "'"

  connection.query(sql, function (error, results, fields) {

    var hash = results[0].Kata_laluan;

    bcrypt.compare(password, hash, function(err, result) {

      if (err) throw err;

      if (result) {
        res.redirect("/aduan/user/buat-aduan");
      } else {
        res.redirect("/aduan");
      }

    });

  });

})

app.post("/daftar", function(req, res) {

  bcrypt.hash(req.body.katalaluan, saltRounds, function(err, hash) {

    var user = req.body.id_pengguna;
    var password = hash;
    var nama_staf = req.body.nama_staf;
    var no_telefon = req.body.no_telefon;
    var jawatan = req.body.jawatan;
    var emel = req.body.emel;
    var bidang_tugas = req.body.bidang_tugas;
    var jenis_id = req.body.jenis_id;

    var created_date = new Date();
    var date = "" + created_date.getFullYear() + "-" + created_date.getMonth() + "-" + created_date.getDate()


  var sql = "INSERT INTO direktori_pengguna (ID_Pengguna, Kata_Laluan, Nama_Staf, No_Telefon, Jawatan, Emel, Bidang_Tugas, Created_Date, Jenis_ID) VALUES ('" +
    user + "', '" +
    password + "', '" +
    nama_staf + "', '" +
    no_telefon + "', '" +
    jawatan + "', '" +
    emel + "', '" +
    bidang_tugas + "', '" +
    date + "', '" +
    jenis_id + "')"

    connection.query(sql, function(error, results) {
      if (err) {
        console.log(error)
      } else {
        res.redirect("/aduan/admin/direktori-pengguna")
      }
    })
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000")
})
