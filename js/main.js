// ============================
// MAIN.JS - GADIS QS HQ
// ============================

// API sebenar
const API = "https://script.google.com/macros/s/AKfycbzzE1MZSWJKvis8_DsJ9wKJMEj3jXXsuMHAYv77L4r5PxRbbh6WpnBnx_W_8IFtlEMh/exec";

// Audio assets
const audioSah = new Audio("https://www.soundjay.com/human/applause-01.mp3");
const audioAktif = new Audio("https://www.soundjay.com/button/beep-07.wav");

// Stamp assets
const stampSah = document.getElementById("stampSah");
const stampAktif = document.getElementById("stampAktif");

// QR Scanner
const qrScanner = new Html5QrcodeScanner(
  "qr-reader", { fps: 10, qrbox: 250 }
);

// ============================
// SEMAK KOD SIRI
// ============================
function semakKod() {
  const kod = document.getElementById("kodInput").value.trim().toUpperCase();
  if (!kod) return alert("Masukkan Kod Siri");

  // Animation laser scan
  document.getElementById("result").innerHTML = `<span class="scanning">📡 Sedang semak...</span>`;

  fetch(`${API}?kod=${kod}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("result").innerHTML = "";
      // Hapus stamp lama
      stampSah.classList.remove("fall");
      stampAktif.classList.remove("fall");

      if (data.success) {
        generateQR(kod);
        if (data.status === "TELAH DITEBUS") {
          stampSah.classList.add("fall");
          audioSah.play();
        } else if (data.status === "AKTIF") {
          stampAktif.classList.add("fall");
          audioAktif.play();
        }
        showResult(data);
      } else {
        document.getElementById("result").innerHTML = `<span style="color:red">${data.message}</span>`;
      }
    });
}

// ============================
// PAPAR HASIL SEMAKAN
// ============================
function showResult(data) {
  const html = `
    <div class="hasil">
      <h3 style="color:${data.color}">${data.tajuk}</h3>
      <p>KOD SIRI: ${data.kod_siri}</p>
      <p>NAMA PENUH: ${data.nama || "-"}</p>
      <p>HADIAH: ${data.hadiah}</p>
      <p>STATUS KOD: ${data.status_kod}</p>
      <p>PEMBELIAN PRODUK: ${data.produk}</p>
      <p>HARGA: ${data.harga}</p>
      <p>NO. TELEFON: ${sensorData(data.telefon)}</p>
      <p>NO. IC: ${sensorData(data.ic)}</p>
      <p>STATUS PENEBUSAN: ${data.status_penebusan}</p>
      <p>DISAHKAN OLEH: ${data.disahkan}</p>
      <p>TARIKH: ${data.tarikh}</p>
      <p>BANDAR / NEGERI: ${data.lokasi}</p>
    </div>`;
  document.getElementById("result").innerHTML = html;
}

// ============================
// SENSOR DATA TELEFON & IC
// ============================
function sensorData(val) {
  if (!val) return "-";
  return val.slice(0,3) + "XXXX" + val.slice(-4);
}

// ============================
// GENERATE QR CODE
// ============================
function generateQR(code){
  const token = btoa(code + "GADIS_SECRET_KEY");
  const verifyUrl = `https://gadis-hq.github.io/gadisqs/verify.html?code=${code}&token=${token}`;
  QRCode.toCanvas(document.getElementById("qrCanvas"), verifyUrl, {width:150});
}

// ============================
// LIVE DASHBOARD
// ============================
async function updateDashboard() {
  const res = await fetch(`${API}?mode=dashboard`);
  const data = await res.json();
  document.getElementById("countSah").textContent = data.total_sah;
  document.getElementById("countAktif").textContent = data.total_aktif;
  document.getElementById("countInvalid").textContent = data.total_invalid;
}
setInterval(updateDashboard,5000);
updateDashboard();

// ============================
// TICKER PEMENANG
// ============================
async function tickerPemenang() {
  const res = await fetch(`${API}?mode=ticker`);
  const data = await res.json();
  const ticker = document.getElementById("ticker");
  let idx = 0;
  setInterval(()=>{
    if (data.length==0) return;
    ticker.textContent = `${data[idx].nama} menebus ${data[idx].hadiah} di ${data[idx].lokasi}`;
    idx = (idx+1)%data.length;
  },4000);
}
tickerPemenang();

// ============================
// MAP PEMENANG
// ============================
var map = L.map('map').setView([4.2105, 101.9758], 6); // Malaysia
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OSM'}).addTo(map);

async function loadHeatmap() {
  const res = await fetch(`${API}?mode=map`);
  const data = await res.json();
  const heatPoints = [];
  data.forEach(w=>{
    heatPoints.push([w.lat,w.lng,1]);
    const marker = L.marker([w.lat,w.lng]).addTo(map);
    marker.bindPopup(`<b>${w.nama}</b><br>${w.lokasi}<br>Hadiah: ${w.hadiah}`);
  });
  L.heatLayer(heatPoints,{
    radius:35, blur:25, maxZoom:10,
    gradient:{0.2:'blue',0.4:'lime',0.6:'yellow',0.8:'orange',1.0:'red'}
  }).addTo(map);
}
loadHeatmap();

// ============================
// PWA INSTALL PROMPT
// ============================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt=e;
  document.getElementById('installBtn').style.display='block';
});
document.getElementById('installBtn').addEventListener('click', ()=>{
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(()=>{deferredPrompt=null;});
});
