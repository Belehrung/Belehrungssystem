const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');
const { PDFDocument } = require('pdf-lib');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

/* ================= BASIS ================= */

const BASE_DIR = __dirname;
const UPLOAD_DIR = path.join(BASE_DIR, "uploads");
const DOKUMENT_DIR = path.join(BASE_DIR, "Dokumente");
const DB_PATH = path.join(BASE_DIR, "database.db");

[UPLOAD_DIR, DOKUMENT_DIR].forEach(dir=>{
if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
});

const db = new sqlite3.Database(DB_PATH);

/* ================= AUTO DB REPAIR ================= */

function repairDatabase(){

db.all("SELECT id,dateiname FROM belehrungen",[],(_,rows)=>{
rows.forEach(r=>{
const file=path.join(UPLOAD_DIR,r.dateiname||"");
if(!r.dateiname || !fs.existsSync(file)){
db.run("DELETE FROM belehrungen WHERE id=?",[r.id]);
db.run("DELETE FROM unterschriften WHERE belehrung=?",[r.id]);
}
});
});

db.all(`
SELECT u.id,u.datum,m.name,b.titel
FROM unterschriften u
LEFT JOIN mitarbeiter m ON m.id=u.mitarbeiter
LEFT JOIN belehrungen b ON b.id=u.belehrung
`,[],(_,rows)=>{
rows.forEach(r=>{
if(!r.name || !r.titel || !r.datum){
db.run("DELETE FROM unterschriften WHERE id=?",[r.id]);
}
});
});
}
repairDatabase();

/* ================= DATABASE ================= */

db.serialize(()=>{
db.run(`CREATE TABLE IF NOT EXISTS mitarbeiter (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS belehrungen (
id INTEGER PRIMARY KEY AUTOINCREMENT,
titel TEXT,
dateiname TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS unterschriften (
id INTEGER PRIMARY KEY AUTOINCREMENT,
mitarbeiter INTEGER,
belehrung INTEGER,
datum TEXT,
ort TEXT,
UNIQUE(mitarbeiter,belehrung)
)`);
});

/* ================= IP ================= */

function getLocalIP(){
const nets=os.networkInterfaces();
for(const name of Object.keys(nets)){
for(const net of nets[name]){
if(net.family==='IPv4' && !net.internal){
return net.address;
}
}
}
return "localhost";
}

/* ================= UPLOAD ================= */

const upload = multer({
storage: multer.diskStorage({
destination: (_,__,cb)=>cb(null,UPLOAD_DIR),
filename: (_,file,cb)=>cb(null,Date.now()+"_"+file.originalname)
})
});

/* ================= DASHBOARD ================= */

app.get('/', async (req,res)=>{

const ip=getLocalIP();
const tabletURL=`http://${ip}:3000/tablet`;
const qr=await QRCode.toDataURL(tabletURL);

db.all("SELECT * FROM mitarbeiter",[],(_,mitarbeiter)=>{
db.all("SELECT * FROM belehrungen",[],(_,belehrungen)=>{

res.send(`
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{margin:0;font-family:Segoe UI;background:#111418;color:white}
header{background:#1c2128;padding:25px 40px;font-size:22px;font-weight:600}
.container{padding:40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:30px}
.card{background:#1c2128;padding:30px;border-radius:18px}
input{width:100%;padding:12px;margin:10px 0;border-radius:10px;border:none;background:#2a2f36;color:white}
button{width:100%;padding:12px;border-radius:10px;border:none;background:#e60023;color:white;font-weight:600;margin-top:5px}
.delete{background:#444}
</style>
</head>

<body>

<header>McFit Belehrungssystem</header>

<div class="container">

<div class="card">
<h2>Mitarbeiter</h2>
<form method="POST" action="/mitarbeiter">
<input name="name" placeholder="Neuer Mitarbeiter" required>
<button>Hinzufügen</button>
</form>

${mitarbeiter.map(m=>`
<div style="margin-top:10px">
${m.name}
<form method="POST" action="/mitarbeiter-loeschen/${m.id}">
<button class="delete">Löschen</button>
</form>
</div>
`).join("")}
</div>

<div class="card">
<h2>Belehrungen / PDFs</h2>
<form method="POST" action="/belehrung" enctype="multipart/form-data">
<input name="titel" placeholder="Titel" required>
<input type="file" name="pdf" required>
<button>PDF hochladen</button>
</form>

${belehrungen.map(b=>`
<div style="margin-top:10px">
${b.titel}
<form method="POST" action="/belehrung-loeschen/${b.id}">
<button class="delete">Löschen</button>
</form>
</div>
`).join("")}
</div>

<div class="card">
<h2>Offene Unterschriften</h2>
<div id="statusListe">Lade Status...</div>
</div>

<div class="card">
<h2>Tablet verbinden</h2>
<img src="${qr}" width="180"><br><br>
${tabletURL}
</div>

</div>

<script>
window.addEventListener("load", async () => {
  const res = await fetch('/status-dashboard');
  const data = await res.json();
  document.getElementById("statusListe").innerHTML =
    data.map(s =>
      "<b>"+s.name+"</b>: " +
      (s.offen > 0
        ? "<span style='color:red'>"+s.offen+" offen</span>"
        : "<span style='color:green'>Alles unterschrieben</span>")
    ).join("<br>");
});
</script>

</body>
</html>
`);
});
});
});

/* ================= STATUS ================= */

app.get('/status-dashboard',(req,res)=>{
db.all("SELECT id,name FROM mitarbeiter",[],async(_,mitarbeiter)=>{

let result=[];

for(const m of mitarbeiter){
const rows=await new Promise(resolve=>{
db.all(`
SELECT b.id,b.dateiname,u.id as uid
FROM belehrungen b
LEFT JOIN unterschriften u
ON u.belehrung=b.id AND u.mitarbeiter=?`,
[m.id],(_,rows)=>resolve(rows));
});

let offen=0;
rows.forEach(r=>{
const file=path.join(UPLOAD_DIR,r.dateiname||"");
if(!r.dateiname || !fs.existsSync(file)) return;
if(!r.uid) offen++;
});

result.push({name:m.name,offen});
}

res.json(result);
});
});

/* ================= ROUTEN ================= */

app.post('/mitarbeiter',(req,res)=>{
db.run("INSERT INTO mitarbeiter (name) VALUES (?)",[req.body.name],()=>res.redirect('/'));
});

app.post('/mitarbeiter-loeschen/:id',(req,res)=>{
db.run("DELETE FROM mitarbeiter WHERE id=?",[req.params.id],()=>res.redirect('/'));
});

app.post('/belehrung',upload.single('pdf'),(req,res)=>{
db.run("INSERT INTO belehrungen (titel,dateiname) VALUES (?,?)",
[req.body.titel,req.file.filename],()=>res.redirect('/'));
});

app.post('/belehrung-loeschen/:id',(req,res)=>{
db.get("SELECT dateiname FROM belehrungen WHERE id=?",[req.params.id],(_,row)=>{
if(row){
const filePath=path.join(UPLOAD_DIR,row.dateiname);
if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
db.run("DELETE FROM belehrungen WHERE id=?",[req.params.id],()=>res.redirect('/'));
});
});

/* ================= SERVER ================= */

app.listen(3000,'0.0.0.0',()=>{
console.log("Server läuft:");
console.log("PC: http://localhost:3000");
console.log("Tablet: http://"+getLocalIP()+":3000/tablet");
});