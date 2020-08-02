//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const ejs = require('ejs');

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

// VARIABLES

var user = ""
var name = ""
var id = 0
var logged = false
var pentadbir = false
var juruteknik = false
var selected = false

// GET Requests

app.get("/aduan", function(req, res) {

  logged = false
  user = ""
  id = 0
  pentadbir = false
  juruteknik = false

  res.render("log-masuk")
})

app.get("/aduan/:user/buat-aduan", function(req, res) {

  let sql1 = `SELECT PK_Kawasan, Nama_Kawasan FROM kawasan`
  let sql2 = `SELECT PK_Lokasi, FK_Kawasan, Nama_Lokasi FROM lokasi`
  let sql3 = `SELECT PK_Kategori, Nama_Kategori FROM kategori`
  let sql4 = `SELECT PK_Peralatan, Nama_Peralatan FROM senarai_peralatan`
  let sql5 = `SELECT ID, Nama_Staf FROM direktori_pengguna WHERE ID_Pengguna = '${user}'`

  connection.query(sql1 , function(err, rowsOfKawasan) {

    connection.query(sql2, function(err, rowsOfLokasi) {

      connection.query(sql3, function(err, rowsOfKategori) {

        connection.query(sql4, function(err, rowsOfItem) {

          connection.query(sql5, function(err, rowsOfIDStaf) {

            let obj = {
              pentadbir: pentadbir,
              logged: logged,
              juruteknik: juruteknik,
              user: user,
              rowsOfKawasan: rowsOfKawasan,
              rowsOfLokasi: rowsOfLokasi,
              rowsOfKategori: rowsOfKategori,
              rowsOfItem: rowsOfItem,
              infoStaf: rowsOfIDStaf[0]
            }

            res.render("buat-aduan", obj)

          })

        })

      })

    })

  })

})

// app.get("/aduan/user/semakan-aduan", function(req, res) {
//   res.render("semakan-aduan")
// })

app.get("/aduan/:user/semakan-aduan/senarai-aduan", function(req, res) {

  let sql = `SELECT aduan.ID, aduan.No_Aduan, aduan.Tarikh_Aduan, kawasan.Nama_Kawasan, info_lokasi.Nama_Lokasi, bidang_tugas.Nama_Bidang, aduan.Catatan_Kerosakan, aduan.Status_Aduan
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN kawasan
            	ON aduan.FK_Kawasan = kawasan.PK_Kawasan
            JOIN info_lokasi
            	ON aduan.FK_Lokasi = info_lokasi.PK_Lokasi
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

  let sql = `SELECT direktori_pengguna.ID_Pengguna, aduan.No_Aduan, aduan.Tarikh_Aduan, kawasan.Nama_Kawasan, info_lokasi.Nama_Lokasi, bidang_tugas.Nama_Bidang, kategori.Nama_Kategori, aduan.Catatan_Kerosakan, rujukan_item.Nama_Item, dp.Nama_Staf, Tarikh_Terima_Tugasan, Komen_Teknikal, Tarikh_Selesai
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN kawasan
            	ON aduan.FK_Kawasan = kawasan.PK_Kawasan
            JOIN info_lokasi
            	ON aduan.FK_Lokasi = info_lokasi.PK_Lokasi
            JOIN kategori
            	ON aduan.FK_Kategori = kategori.PK_Kategori
            JOIN bidang_tugas
            	ON aduan.FK_Bidang_Tugas = bidang_tugas.No_Bidang
            JOIN rujukan_item
            	ON aduan.FK_Rujukan_Item = rujukan_item.ID
            JOIN direktori_pengguna dp
	             ON aduan.FK_Penerima_Tugasan = dp.ID
            WHERE direktori_pengguna.ID_Pengguna = '${user}' AND aduan.No_Aduan = '${req.params.no_aduan}'`

  connection.query(sql, function(err, rowsOfAduan) {

    let obj = {
      pentadbir: pentadbir,
      logged: logged,
      juruteknik: juruteknik,
      user: user,
      aduan: rowsOfAduan[0]
    }

    console.log(user, id)
    console.log(rowsOfAduan[0])

    res.render("info-aduan", obj)

  })

})

app.get("/aduan/:user/tukar-katalaluan", function(req, res) {

  let obj = {
    pentadbir: pentadbir,
    logged: logged,
    juruteknik: juruteknik,
    user: user,
  }

  res.render("tukar-katalaluan", obj)

})

app.get("/aduan/:user/direktori-pengguna", function(req, res) {

  let sql = `SELECT ID, Nama_Staf, Jenis_ID FROM direktori_pengguna`

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

  let sql = `SELECT aduan.ID, aduan.No_Aduan, aduan.Tarikh_Aduan, kawasan.Nama_Kawasan, info_lokasi.Nama_Lokasi, bidang_tugas.Nama_Bidang, kategori.Nama_Kategori, aduan.Catatan_Kerosakan, aduan.Status_Aduan
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN kawasan
            	ON aduan.FK_Kawasan = kawasan.PK_Kawasan
            JOIN info_lokasi
            	ON aduan.FK_Lokasi = info_lokasi.PK_Lokasi
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

  let sql = `SELECT direktori_pengguna.ID_Pengguna, aduan.No_Aduan, aduan.Tarikh_Aduan, kawasan.Nama_Kawasan, info_lokasi.Nama_Lokasi, bidang_tugas.Nama_Bidang, kategori.Nama_Kategori, aduan.Catatan_Kerosakan, rujukan_item.Nama_Item
            FROM aduan
            JOIN direktori_pengguna
            	ON aduan.FK_Pengadu = direktori_pengguna.ID
            JOIN kawasan
            	ON aduan.FK_Kawasan = kawasan.PK_Kawasan
            JOIN info_lokasi
            	ON aduan.FK_Lokasi = info_lokasi.PK_Lokasi
            JOIN kategori
            	ON aduan.FK_Kategori = kategori.PK_Kategori
            JOIN bidang_tugas
            	ON aduan.FK_Bidang_Tugas = bidang_tugas.No_Bidang
            JOIN rujukan_item
            	ON aduan.FK_Rujukan_Item = rujukan_item.ID
            JOIN direktori_pengguna dp
            	ON aduan.FK_Penerima_Tugasan = dp.ID
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

app.post("/log-masuk", function(req, res) {

  user = req.body.id
  let password = req.body.pass

  let sql = `SELECT ID, ID_Pengguna, Kata_laluan, Jenis_ID, Nama_Staf FROM direktori_pengguna WHERE ID_Pengguna = '${user}'`

  connection.query(sql, function (error, results, fields) {

    let hash = results[0].Kata_laluan

    bcrypt.compare(password, hash, function(err, result) {

      if (err) throw err;

      if (result) {

        name = results[0].Nama_Staf
        logged = true
        id = results[0].ID

        if (results[0].Jenis_ID == 'Pentadbir') {

          pentadbir = true

        } else if (results[0].Jenis_ID == 'Baikpulih') {

          juruteknik = true

        }

        res.redirect(`/aduan/${user}/buat-aduan`);

      } else {

        res.redirect("/aduan");

      }

    });

  });

})

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


    var sql = "INSERT INTO direktori_pengguna (ID_Pengguna, Kata_Laluan, Nama_Staf, No_Telefon, Jawatan, Emel, Bidang_Tugas, Created_Date, Jenis_ID) VALUES ('" +
      username + "', '" +
      password + "', '" +
      nama_staf + "', '" +
      no_telefon + "', '" +
      jawatan + "', '" +
      emel + "', '" +
      bidang_tugas + "', '" +
      date + "', '" +
      jenis_id + "')"

    if (selected) {

      sql = `UPDATE direktori_pengguna
      SET ID_Pengguna = '${username}',
      Nama_Staf = '${nama_staf}',
      No_Telefon = '${no_telefon}',
      Jawatan = '${jawatan}',
      Emel = '${emel}',
      Bidang_Tugas = '${bidang_tugas}',
      Created_Date = '${date}',
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
  });

});

app.post("/buat-aduan", function(req, res) {

  let no_aduan = req.body.no_aduan;
  let id_pengguna = req.body.id_pengguna;
  let nama_pengadu = req.body.nama_pengadu;
  let jenis_aduan = req.body.jenis_aduan;
  let kawasan = req.body.kawasan;
  let lokasi = req.body.lokasi;
  let kategori = req.body.kategori;
  let item = req.body.item;
  let perihal = req.body.perihal;
  let tarikh_aduan = req.body.tarikh_aduan;

  // let tarikh_aduan = new Date();
  // let date = "" + tarikh_aduan.getFullYear() + "-" + tarikh_aduan.getMonth() + "-" + tarikh_aduan.getDate()

  // console.log(no_aduan, id_pengguna, nama_pengadu, jenis_aduan, kawasan, lokasi, kategori, item, perihal, tarikh_aduan)

  let columns = `No_Aduan, Tarikh_Aduan, FK_Pengadu, FK_Kawasan, FK_Lokasi, Catatan_Kerosakan, FK_Rujukan_Item, FK_Kategori, FK_Bidang_Tugas`
  let values = `'${no_aduan}', '${tarikh_aduan}', '${id_pengguna}', '${kawasan}', '${lokasi}', '${perihal}', '${item}', '${kategori}', '${jenis_aduan}'`
  let sql = `INSERT INTO aduan (${columns}) VALUES (${values})`

  connection.query(sql, function(err, results) {

    res.redirect(`/aduan/${user}/buat-aduan`)

  })

})

app.post("/tukar-katalaluan", function(req, res) {

  let id_pengguna = req.body.id_pengguna
  let katalaluan = req.body.katalaluan

  let sql1 = `SELECT ID, ID_Pengguna, Kata_laluan FROM direktori_pengguna WHERE ID_Pengguna = '${id_pengguna}'`

  connection.query(sql1, function(err, results) {

    let hash1 = results[0].Kata_laluan

    bcrypt.compare(katalaluan, hash1, function(err, result1) {

      if (err) throw err;

      if (result1) {

        bcrypt.hash(req.body.katalaluan_baru, saltRounds, function(err, hash2) {

          let sql2 = `UPDATE direktori_pengguna SET Kata_Laluan = '${hash2}' WHERE ID_Pengguna = '${id_pengguna}'`

          connection.query(sql2, function(err, result2) {

            res.redirect(`/aduan`);

          })

        })

      } else {

        res.redirect(`/aduan/${user}/tukar-katalaluan`);

      }

    });

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

    let sql = `DELETE FROM aduan WHERE No_Aduan = ${req.body.hapus} AND FK_Pengadu = ${id}`

    connection.query(sql, function(err, result) {

      res.redirect(`/aduan/${user}/semakan-aduan/senarai-aduan`)

    })

  }



})

app.post('/tindakan-lengkap', function(req, res) {

  res.redirect(`/aduan/${user}/tindakan/${req.body.semak}`)

})

app.post('/terima-aduan', function(req, res) {

  // let tarikh_terima = req.body.tarikh_terima
  let ulasan = req.body.ulasan

  if (req.body.terima_tugasan) {

    let sql = `UPDATE aduan SET FK_Penerima_Tugasan = ${id}, Tarikh_Terima_Tugasan = now(), Komen_Teknikal = '${ulasan}', Status_Aduan = 1 WHERE ID = ${req.body.terima_tugasan}`

    connection.query(sql , function(err, results) {

      res.redirect(`/aduan/${user}/tindakan`)

    })

  } else if (req.body.selesai_tugasan) {

    let sql = `UPDATE aduan SET Status_Aduan = 2, Tarikh_Selesai = now() WHERE ID = ${req.body.selesai_tugasan}`

    connection.query(sql , function(err, results) {

      console.log(results)

      res.redirect(`/aduan/${user}/tindakan`)

    })

  }


})


app.listen(3000, function() {
  console.log("Server started on port 3000")
})
