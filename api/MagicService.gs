// --- MAGIC SERVICE ---
// Tugas: Ambil semua data produk dari Sheet untuk halaman Try Magic

function getAllProducts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME); // SHEET_NAME diambil dari Main.gs (Global)
  
  // Cek kalo sheet ga ketemu (Safety)
  if (!sheet) {
    return { status: "error", message: "Sheet not found" };
  }
  
  // Ambil semua data
  var data = sheet.getDataRange().getValues();
  var headers = data.shift(); // Pisahin Header (Baris 1)
  
  // Mapping jadi JSON Rapi
  // Ini logika map yang kamu pake sebelumnya, kita pertahankan biar aman
  var output = data.map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      // header.toLowerCase() penting biar key JSON konsisten (id, name, dst)
      obj[header.toLowerCase()] = row[index]; 
    });
    return obj;
  });
  
  // Kembalikan Data Mentah (Array of Objects)
  // Kita GAK return ContentService di sini, tapi datanya aja.
  // Biar nanti Main.gs yang bungkus jadi JSON.
  return output;
}