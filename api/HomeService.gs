function getHomeData() {
  // Pake ID Global dari Main.gs
  var ss = SpreadsheetApp.openById(SHEET_ID); 
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  var data = sheet.getDataRange().getValues();
  var headers = data.shift(); 

  // --- SETTING BATAS WAKTU (12 BULAN) ---
  var today = new Date();
  var cutoffDate = new Date();
  cutoffDate.setMonth(today.getMonth() - 12); 

  // Variabel namanya 'products' (huruf kecil)
  var products = data.map(function(row) {
    var rawDate = row[7]; 
    var finalDate;

    if (Object.prototype.toString.call(rawDate) === '[object Date]') {
      finalDate = rawDate;
    } else if (typeof rawDate === 'string' && rawDate.includes('/')) {
      var parts = rawDate.split('/'); 
      finalDate = new Date(parts[2], parts[1] - 1, parts[0]); 
    } else {
      finalDate = new Date(0); 
    }

    return {
      id: row[0],
      name: row[1],
      category: row[2], 
      price: row[3],
      tags: row[4],
      image: row[5],
      shop_link: row[6],
      date_added: finalDate
    };
  });

  // --- FILTER ---
  // Kita filter variabel 'products' yang sudah dibuat di atas
  var freshSets = products.filter(function(p) {
    var isSet = String(p.category).toLowerCase() === 'set';
    var isFresh = p.date_added >= cutoffDate;
    return isSet && isFresh;
  });

  // --- SORTING ---
  freshSets.sort(function(a, b) {
    return b.date_added - a.date_added;
  });

  // Ambil 3 Teratas
  var result = freshSets.slice(0, 3);

  // RETURN HASIL
  return result; 
}

// --- FILE: HomeService.gs ---
// ... (kode getHomeData biarin aja di atas) ...

// 👇 FUNGSI BARU BUAT KATALOG 👇
function getCatalogData() {
  var ss = SpreadsheetApp.openById(SHEET_ID); 
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  var data = sheet.getDataRange().getValues();
  var headers = data.shift(); 

  var products = data.map(function(row) {
    // Logic Parsing Tanggal (Copy dari atas biar aman)
    var rawDate = row[7]; 
    var finalDate;
    if (Object.prototype.toString.call(rawDate) === '[object Date]') {
      finalDate = rawDate;
    } else if (typeof rawDate === 'string' && rawDate.includes('/')) {
      var parts = rawDate.split('/'); 
      finalDate = new Date(parts[2], parts[1] - 1, parts[0]); 
    } else {
      finalDate = new Date(0); 
    }

    return {
      id: row[0],
      name: row[1],
      category: row[2], 
      price: row[3],
      tags: row[4],
      image: row[5],
      shop_link: row[6],
      date_added: finalDate
    };
  });

  // FILTER: Ambil SEMUA KECUALI 'Set'
  var catalogItems = products.filter(function(p) {
    var cat = String(p.category).toLowerCase().trim();
    // Syarat: Bukan Set, dan Data tidak kosong
    return cat !== 'set' && p.name !== '';
  });

  // Sorting: Opsional (Misal dari terbaru)
  catalogItems.sort(function(a, b) {
    return b.date_added - a.date_added;
  });

  return catalogItems; // Kirim array data
}