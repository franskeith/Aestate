// --- KONFIGURASI GLOBAL ---
// --- KONFIGURASI GLOBAL ---
var SHEET_ID = '1hV068uJ29O7jdMTA3ITqphz8kO3wah8oU8q2UNq5rdc'; // <-- Paste di dalam tanda kutip
var SHEET_NAME = 'Product_Catalog';
// 1. PINTU MASUK GET (ROUTER)
function doGet(e) {
  var action = e.parameter.action || "get_all"; 
  var resultData;

  try {
    // --- PERCABANGAN LOGIKA ---
    if (action == "get_new_arrivals") {
      // Panggil HomeService (Balikinnya Data Array, bukan JSON)
      resultData = getHomeData(); 
    } else {
      // Panggil MagicService
      resultData = getAllProducts();
    }
    
    // Sukses? Bungkus jadi JSON
    return responseJSON(resultData);

  } catch (error) {
    // Kalau ada error, kirim pesan error biar ketahuan di frontend
    return responseJSON({status: "error", message: error.toString()});
  }

  // --- FILE: Main.gs ---

function doGet(e) {
  var action = e.parameter.action || "get_all"; 
  var resultData;

  try {
    // --- ROUTING ---
    if (action == "get_new_arrivals") {
      resultData = getHomeData(); // Ambil 3 Set Terbaru
    } 
    // 👇 TAMBAHAN BARU DISINI 👇
    else if (action == "get_catalog") {
      resultData = getCatalogData(); // Ambil Semua Barang (Kecuali Set)
    } 
    // 👆 SAMPAI SINI 👆
    else {
      resultData = getAllProducts(); // Magic (Semua Data Mentah)
    }
    
    return responseJSON(resultData);

  } catch (error) {
    return responseJSON({status: "error", message: error.toString()});
  }
}
// ... sisanya sama
}

function doPost(e) {
  return handleAdminAction(e); 
}

// 3. HELPER RESPONSE
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}