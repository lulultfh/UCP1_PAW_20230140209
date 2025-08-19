require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./database/db.js");
const bukuRoutes = require("./routes/perpus-db.js");
// const { books } = require("./routes/perpus-db.js");
const port = process.env.PORT;
const methodOverride = require("method-override");
const expressLayout = require("express-ejs-layouts");
app.use(expressLayout);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/buku", bukuRoutes);
app.use(express.static('public'));

app.set("view engine", "ejs"); //utk ke halaman ejs

app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
  }); //render file ke index.ejs
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
  }); //render ke file contact.ejs
});
app.get("/buku-data", (req, res) => {
  db.query("SELECT * FROM buku", (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.json(results);
  });
});

app.get("/buku-list", (req, res) => {
  db.query("SELECT * FROM buku", (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.render("buku-page", { books: results, layout: "layouts/main-layout" });
  });
});


app.post("/buku-list/add", (req, res) => {
  const { judul } = req.body;
  if (!judul || judul.trim() === "") {
    return res.status(400).send("Buku tidak boleh kosong");
  }

  db.query("INSERT INTO buku (judul) VALUES (?)", [judul.trim()], (err) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.redirect("/buku-list");
  });
});

app.put("/buku-list/edit/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { judul } = req.body;

  if (!judul || judul.trim() === "") {
    return res.status(400).send("Judul tidak boleh kosong");
  }

  db.query("UPDATE buku SET judul = ? WHERE id = ?", [judul.trim(), id], (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    if (results.affectedRows === 0) return res.status(404).send("Buku tidak ditemukan");
    res.redirect("/buku-list");
  });
})

app.delete("/buku-list/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);

  db.query("DELETE FROM buku WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    if (results.affectedRows === 0) return res.status(404).send("Buku tidak ditemukan");
    res.redirect("/buku-list");
  });
});

app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});