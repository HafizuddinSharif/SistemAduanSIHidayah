//jshint esversion:6
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session')
const methodOverride = require('method-override')
var MySQLStore = require('express-mysql-session')(session);

const app = express()

const initializePassport = require('./passport-config')

initializePassport(
  passport,
  email => users.find(user => user.ID_Pengguna === email),
  id => users.find(user => user.ID === parseInt(id))
)

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: false}))

app.use(flash())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(methodOverride('_method'))

app.use(express.static(__dirname + "/public"))

app.use("/public", express.static('public'))

const saltRounds = 10;

// Establishing connection to database

var connection = mysql.createConnection({
  host     : process.env.HOST_NAME,
  user     : process.env.USER_NAME,
  password : process.env.PASSWORD,
  database : process.env.DATABASE
});

connectToDB = function () {
  connection.connect(function(err) {
    if (err) {
      setTimeout(connectToDB, 2000)
    }
  });

  connection.on('error', function(err) {
    systemMessage('Error: ' + err)
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectToDB()
    } else {
      throw err
    }
  });
}

systemMessage = function(message) {
  console.log(message)
}

connectToDB();

// To get and store the direktori_pengguna

var users = []

connection.query(`SELECT ID, ID_Pengguna, Kata_Laluan, Nama_Staf, Jenis_ID FROM direktori_pengguna`, function(err, results) {
  users = results
})

// VARIABLES

var user = ""
var name = ""
var id = 0
var logged = false
var pentadbir = false
var juruteknik = false
var selected = false
var failed = false
var success = false

// GET Requests

app.get('/', function(req, res) {

  res.redirect('/aduan')

})

app.get("/aduan", checkNotAuthenticated, function(req, res) {

  user = ""
  id = 0
  pentadbir = false
  juruteknik = false

  res.render("log-masuk")
})

app.get("/aduan/:user/buat-aduan", checkAunthenticated, function(req, res) {

  user = req.user.ID_Pengguna
  id = req.user.ID

  if (req.user.Jenis_ID === 'Pentadbir') pentadbir = true
  if (req.user.Jenis_ID === 'Baikpulih') juruteknik = true

  let sql1 = `SELECT PK_Bangunan, Nama_Bangunan, FK_Kawasan FROM bangunan2`
  let sql2 = `SELECT PK_Lokasi, FK_Bangunan, Nama_Lokasi FROM lokasi2`
  let sql3 = `SELECT PK_Kategori, Nama_Kategori FROM kategori`
  let sql4 = `SELECT PK_Peralatan, Nama_Peralatan FROM senarai_peralatan`
  let sql5 = `SELECT ID, Nama_Staf FROM direktori_pengguna WHERE ID_Pengguna = '${req.user.ID_Pengguna}'`
  let sql6 = `SELECT PK_Sekolah, Nama_Sekolah FROM sekolah`
  let sql7 = `SELECT PK_Kawasan, Nama_Kawasan, FK_Sekolah FROM kawasan`

  connection.query(sql1 , function(err, rowsOfBangunan) {

    connection.query(sql2, function(err, rowsOfLokasi) {

      connection.query(sql3, function(err, rowsOfKategori) {

        connection.query(sql4, function(err, rowsOfItem) {

          connection.query(sql5, function(err, rowsOfIDStaf) {

            connection.query(sql6, function(err, rowsOfSekolah) {

              connection.query(sql7, function(err, rowsOfKawasan) {

                let obj = {
                  pentadbir: pentadbir,
                  logged: logged,
                  juruteknik: juruteknik,
                  user: user,
                  rowsOfBangunan: rowsOfBangunan,
                  rowsOfLokasi: rowsOfLokasi,
                  rowsOfKategori: rowsOfKategori,
                  rowsOfItem: rowsOfItem,
                  infoStaf: rowsOfIDStaf[0],
                  rowsOfSekolah: rowsOfSekolah,
                  rowsOfKawasan: rowsOfKawasan,
                  success: success
                }

                res.render("buat-aduan", obj)

                success = false

              })

            })

          })

        })

      })

    })

  })

})

app.get("/aduan/:user/semakan-aduan/senarai-aduan", function(req, res) {

  let sql = `SELECT aduan.ID, aduan.No_Aduan, aduan.Tarikh_Aduan, bangunan2.Nama_Bangunan, lokasi2.Nama_Lokasi, bidang_tugas.Nama_Bidang, aduan.Catatan_Kerosakan, aduan.FK_Tindakan
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN bangunan2
            	ON aduan.FK_Bangunan = bangunan2.PK_Bangunan
            JOIN lokasi2
            	ON aduan.FK_Lokasi = lokasi2.PK_Lokasi
            JOIN bidang_tugas
            	ON aduan.FK_Bidang_Tugas = bidang_tugas.No_Bidang
            WHERE direktori_pengguna.ID = ${id}
            ORDER BY aduan.ID`

  connection.query(sql, function(err, rowsOfAduan) {

    let obj = {
      pentadbir: pentadbir,
      logged: logged,
      juruteknik: juruteknik,
      user: user,
      rowsOfAduan: rowsOfAduan
    }

    res.render("senarai-aduan", obj)

  })

})

app.get("/aduan/:user/semakan-aduan/senarai-aduan/:no_aduan", function(req, res) {

  let sql = `SELECT direktori_pengguna.ID_Pengguna, aduan.No_Aduan, aduan.Tarikh_Aduan, bangunan2.Nama_Bangunan, lokasi2.Nama_Lokasi, bidang_tugas.Nama_Bidang, kategori.Nama_Kategori, aduan.Catatan_Kerosakan, senarai_peralatan.Nama_Peralatan, dp.Nama_Staf, Tarikh_Terima_Tugasan, Komen_Teknikal, Tarikh_Selesai
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN bangunan2
            	ON aduan.FK_Bangunan = bangunan2.PK_Bangunan
            JOIN lokasi2
            	ON aduan.FK_Lokasi = lokasi2.PK_Lokasi
            JOIN kategori
            	ON aduan.FK_Kategori = kategori.PK_Kategori
            JOIN bidang_tugas
            	ON aduan.FK_Bidang_Tugas = bidang_tugas.No_Bidang
            JOIN senarai_peralatan
            	ON aduan.FK_Rujukan_Item = senarai_peralatan.PK_Peralatan
            JOIN direktori_pengguna dp
	             ON aduan.FK_Penerima_Tugasan = dp.Bil
            WHERE direktori_pengguna.ID_Pengguna = '${user}' AND aduan.No_Aduan = '${req.params.no_aduan}'`

  connection.query(sql, function(err, rowsOfAduan) {

    let obj = {
      pentadbir: pentadbir,
      logged: logged,
      juruteknik: juruteknik,
      user: user,
      aduan: rowsOfAduan[0]
    }

    res.render("info-aduan", obj)

  })

})

app.get("/aduan/:user/tukar-katalaluan", function(req, res) {

  let obj = {
    pentadbir: pentadbir,
    logged: logged,
    juruteknik: juruteknik,
    user: user,
    failed: failed
  }

  res.render("tukar-katalaluan", obj)

  failed = false

})

app.get("/aduan/:user/direktori-pengguna", function(req, res) {

  let sql = `SELECT ID, Nama_Staf, Jenis_ID, Bil FROM direktori_pengguna`

  connection.query(sql, function(req, rowsOfStaf) {

    let obj = {
      pentadbir: pentadbir,
      logged: logged,
      juruteknik: juruteknik,
      user: user,
      rowsOfStaf: rowsOfStaf
    }

    res.render("direktori-pengguna", obj)

  })

})

app.get("/aduan/:user/direktori-pengguna/:id_staf", function(req, res) {

  if (!selected) {

    let sql = `SELECT PK_Jenis_ID, Nama_Jenis_ID FROM jenis_id`

    connection.query(sql, function(err, rowsOfJenisID) {

      let obj = {
        pentadbir: pentadbir,
        logged: logged,
        juruteknik: juruteknik,
        user: user,
        rowsOfJenisID: rowsOfJenisID,
        selected: selected
      }

      res.render("maklumat-staf", obj)

    })

  } else {

    let sql1 = `SELECT PK_Jenis_ID, Nama_Jenis_ID FROM jenis_id`

    connection.query(sql1, function(err, rowsOfJenisID) {

      let sql2 = `SELECT * FROM direktori_pengguna WHERE ID = ${req.params.id_staf}`

      connection.query(sql2, function(err, rowsOfPengguna) {

        let obj = {
          pentadbir: pentadbir,
          logged: logged,
          juruteknik: juruteknik,
          user: user,
          selected: selected,
          pengguna: rowsOfPengguna[0],
          rowsOfJenisID: rowsOfJenisID
        }

        res.render("maklumat-staf2", obj)

      })
    })
  }



})

app.get("/aduan/:user/tindakan", function(req, res) {

  let sql = `SELECT aduan.ID, aduan.No_Aduan, aduan.Tarikh_Aduan, bangunan2.Nama_Bangunan, lokasi2.Nama_Lokasi, bidang_tugas.Nama_Bidang, kategori.Nama_Kategori, aduan.Catatan_Kerosakan, aduan.FK_Tindakan
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN bangunan2
            	ON aduan.FK_Bangunan = bangunan2.PK_Bangunan
            JOIN lokasi2
            	ON aduan.FK_Lokasi = lokasi2.PK_Lokasi
            JOIN kategori
            	ON aduan.FK_Kategori = kategori.PK_Kategori
            JOIN bidang_tugas
            	ON aduan.FK_Bidang_Tugas = bidang_tugas.No_Bidang
            ORDER BY aduan.ID`

  connection.query(sql, function(err, rowsOfAduan) {

    let obj = {
      pentadbir: pentadbir,
      logged: logged,
      juruteknik: juruteknik,
      user: user,
      rowsOfAduan: rowsOfAduan
    }

    res.render("tindakan", obj)

  })

})

app.get("/aduan/:user/tindakan/:no_tindakan", function(req, res) {

  let sql = `SELECT direktori_pengguna.ID_Pengguna, aduan.No_Aduan, aduan.Tarikh_Aduan, bangunan2.Nama_Bangunan, lokasi2.Nama_Lokasi, bidang_tugas.Nama_Bidang, kategori.Nama_Kategori, aduan.Catatan_Kerosakan, senarai_peralatan.Nama_Peralatan
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN bangunan2
            	ON aduan.FK_Bangunan = bangunan2.PK_Bangunan
            JOIN lokasi2
            	ON aduan.FK_Lokasi = lokasi2.PK_Lokasi
            JOIN kategori
            	ON aduan.FK_Kategori = kategori.PK_Kategori
            JOIN bidang_tugas
            	ON aduan.FK_Bidang_Tugas = bidang_tugas.No_Bidang
            JOIN senarai_peralatan
            	ON aduan.FK_Rujukan_Item = senarai_peralatan.PK_Peralatan
            JOIN direktori_pengguna dp
            	ON aduan.FK_Penerima_Tugasan = dp.Bil
            WHERE aduan.ID = ${req.params.no_tindakan}`

  connection.query(sql, function(err, rowsOfAduan) {

    let obj = {
      pentadbir: pentadbir,
      logged: logged,
      juruteknik: juruteknik,
      user: user,
      aduan: rowsOfAduan[0],
      name: name,
      no_tindakan: req.params.no_tindakan
    }

    res.render("tindakan-lengkap", obj)

  })

})

// POST Requests

// app.post("/log-masuk", function(req, res) {
//
//   user = req.body.id
//   let password = req.body.pass
//
//   let sql = `SELECT ID, ID_Pengguna, Kata_laluan, Jenis_ID, Nama_Staf FROM direktori_pengguna WHERE ID_Pengguna = '${user}'`
//
//   connection.query(sql, function (error, results, fields) {
//
//     if (results.length == 0) {
//
//       failed = true
//
//       res.redirect(`/aduan`)
//
//     } else {
//
//       let hash = results[0].Kata_laluan
//
//       bcrypt.compare(password, hash, function(err, result) {
//
//         if (err) throw err;
//
//         if (result) {
//
//           name = results[0].Nama_Staf
//           logged = true
//           id = results[0].ID
//
//           if (results[0].Jenis_ID == 'Pentadbir') {
//
//             pentadbir = true
//
//           } else if (results[0].Jenis_ID == 'Baikpulih') {
//
//             juruteknik = true
//
//           }
//
//           res.redirect(`/aduan/${user}/buat-aduan`);
//
//         } else {
//
//           failed = true
//
//           res.redirect("/aduan");
//
//         }
//
//       });
//
//     }
//
//   });
//
// })

app.post('/log-masuk', passport.authenticate('local', {
  successRedirect: `/aduan/test/buat-aduan`,
  failureRedirect: `/aduan`,
  failureFlash: true
}))

app.post("/daftar", function(req, res) {

  bcrypt.hash(req.body.katalaluan, saltRounds, function(err, hash) {

    var username = req.body.id_pengguna;
    var password = hash;
    var nama_staf = req.body.nama_staf;
    var no_telefon = req.body.no_telefon;
    var jawatan = req.body.jawatan;
    var emel = req.body.emel;
    var bidang_tugas = req.body.bidang_tugas;
    var jenis_id = req.body.jenis_id;

    var tarikh_daftar = new Date();
    // var date = "" + tarikh_daftar.getFullYear() + "-" + tarikh_daftar.getMonth() + "-" + tarikh_daftar.getDate()
    var date = '2020-01-16'

    let sql2 = 'SELECT * FROM direktori_pengguna'

    connection.query(sql2, function(error, results1) {

      let length = results1.length

      var sql = "INSERT INTO direktori_pengguna (ID_Pengguna, Kata_Laluan, Nama_Staf, No_Telefon, Jawatan, Emel, Bidang_Tugas, Created_Date, Jenis_ID, Bil) VALUES ('" +
        username + "', '" +
        password + "', '" +
        nama_staf + "', '" +
        no_telefon + "', '" +
        jawatan + "', '" +
        emel + "', '" +
        bidang_tugas + "', '" +
        date + "', '" +
        jenis_id + "', '" +
        (length-1) + "')"

      if (selected) {

        sql = `UPDATE direktori_pengguna
        SET ID_Pengguna = '${username}',
        Nama_Staf = '${nama_staf}',
        No_Telefon = '${no_telefon}',
        Jawatan = '${jawatan}',
        Emel = '${emel}',
        Bidang_Tugas = '${bidang_tugas}',
        Created_Date = now(),
        Jenis_ID = '${jenis_id}'
        WHERE ID_Pengguna = '${username}'`

      }

      connection.query(sql, function(error, results) {

        if (error) {
          console.log(error)
        } else {
          res.redirect(`/aduan/${user}/direktori-pengguna`)
        }
      })

    })

  });

});

app.post("/buat-aduan", function(req, res) {

  let no_aduan = req.body.no_aduan;
  let id_pengguna = req.body.id_pengguna;
  let nama_pengadu = req.body.nama_pengadu;
  let jenis_aduan = req.body.jenis_aduan;
  let bangunan = req.body.bangunan;
  let lokasi = req.body.lokasi;
  let kategori = req.body.kategori;
  let item = req.body.item;
  let perihal = req.body.perihal;
  let tarikh_aduan = req.body.tarikh_aduan;

  let dt = new Date(tarikh_aduan);

  let tahun = dt.getYear() + 1900;
  let bulan = dt.getMonth() + 1;
  let written_bulan = bulan < 10 ? `0${bulan}` : bulan
  let written_tahun = tahun - 2000
  var number = '0'

  connection.query(`SELECT No_Aduan FROM aduan WHERE Tahun = '${tahun}' AND Bulan = '${bulan}'`, function(err, results) {

    let what_number = 0

    if (!results) what_number = 1;
    else what_number = results.length + 1;

    if (what_number < 10) number = '00' + what_number
    else if (what_number < 100) number = '0' + what_number
    else number = '' + what_number

    let real_no_aduan =  `AG${written_tahun}${written_bulan}-${number}`

    let columns = `No_Aduan, Tarikh_Aduan, FK_Pengadu, FK_Bangunan, FK_Lokasi, Catatan_Kerosakan, FK_Rujukan_Item, FK_Kategori, FK_Bidang_Tugas, Tahun, Bulan`
    let values = `'${real_no_aduan}', now(), '${id_pengguna}', '${bangunan}', '${lokasi}', '${perihal}', '${item}', '${kategori}', '${jenis_aduan}', '${tahun}', '${bulan}'`
    let sql = `INSERT INTO aduan (${columns}) VALUES (${values})`

    connection.query(sql, function(err, results) {

      if (results) {

        success = true

        res.redirect(`/aduan/${user}/buat-aduan`)

      }

    })

  })

})

app.post("/tukar-katalaluan", function(req, res) {

  let id_pengguna = req.body.id_pengguna
  let katalaluan = req.body.katalaluan

  let sql1 = `SELECT ID, ID_Pengguna, Kata_laluan FROM direktori_pengguna WHERE ID_Pengguna = '${id_pengguna}'`

  connection.query(sql1, function(err, results) {

    if (!results || id_pengguna != req.user.ID_Pengguna) {

      failed = true

      res.redirect(`/aduan/${user}/tukar-katalaluan`)

    }

    else {

      let hash1 = results[0].Kata_laluan

      bcrypt.compare(katalaluan, hash1, function(err, result1) {

        if (err) throw err;

        if (result1) {

          bcrypt.hash(req.body.katalaluan_baru, saltRounds, function(err, hash2) {

            let sql2 = `UPDATE direktori_pengguna SET Kata_Laluan = '${hash2}' WHERE ID_Pengguna = '${id_pengguna}'`

            connection.query(sql2, function(err, result2) {

              req.user.Kata_Laluan = hash2

              req.logOut()
              res.redirect(`/aduan`)

            })

          })

        } else {

          failed = true

          res.redirect(`/aduan/${user}/tukar-katalaluan`);

        }

      });

    }

  })

})

app.post("/maklumat-staf", function(req, res) {

  if (req.body.ubah) {

    selected = true

    res.redirect(`/aduan/${user}/direktori-pengguna/${req.body.ubah}`)

  }

  else if (req.body.tambah) {

    res.redirect(`/aduan/${user}/direktori-pengguna/tambah`)

  }

  else if (req.body.hapus) {

    let sql = `DELETE FROM direktori_pengguna WHERE ID = ${req.body.hapus}`

    connection.query(sql, function(err, result) {

      res.redirect(`/aduan/${user}/direktori-pengguna`)

    })
  }

})

app.post('/info-aduan', function(req, res) {

  if (req.body.semak) {

    res.redirect(`/aduan/${user}/semakan-aduan/senarai-aduan/${req.body.semak}`)

  }

  else if (req.body.hapus) {

    let sql = `UPDATE aduan SET FK_Tindakan = 4 WHERE No_Aduan = '${req.body.hapus}' AND FK_Pengadu = ${id}`

    connection.query(sql, function(err, result) {

      res.redirect(`/aduan/${user}/semakan-aduan/senarai-aduan`)

    })

  }



})

app.post('/tindakan-lengkap', function(req, res) {

  res.redirect(`/aduan/${user}/tindakan/${req.body.semak}`)

})

app.post('/terima-aduan', function(req, res) {

  let ulasan = req.body.ulasan

  if (req.body.terima_tugasan) {

    let sql = `UPDATE aduan SET FK_Penerima_Tugasan = ${id - 2}, Tarikh_Terima_Tugasan = now(), Komen_Teknikal = '${ulasan}', FK_Tindakan = 1 WHERE ID = ${req.body.terima_tugasan}`

    connection.query(sql , function(err, results) {

      res.redirect(`/aduan/${user}/tindakan`)

    })

  } else if (req.body.selesai_tugasan) {

    let sql = `UPDATE aduan SET FK_Tindakan = 3, Tarikh_Selesai = now() WHERE ID = ${req.body.selesai_tugasan}`

    connection.query(sql , function(err, results) {

      res.redirect(`/aduan/${user}/tindakan`)

    })

  } else if (req.body.dalam_tindakan) {

    let sql = `UPDATE aduan SET FK_Tindakan = 2, Tarikh_Selesai = now() WHERE ID = ${req.body.dalam_tindakan}`

    connection.query(sql , function(err, results) {

      res.redirect(`/aduan/${user}/tindakan`)

    })

  }

})

app.delete('/log-keluar', (req, res) => {
  req.logOut()
  res.redirect(`/aduan`)
})

function checkAunthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect(`/aduan`)

}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect(`aduan/${req.user.ID_Pengguna}/buat-aduan`)
  }
  next()
}

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000")
})
