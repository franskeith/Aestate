const form = document.getElementById("formPengeluaran");
const nama = document.getElementById("nama");
const nilai = document.getElementById("nilai");
const error = document.getElementById("error");

form.addEventListener("submit", function (e) {
    error.textContent = "Error bre";

    // Nama pengeluaran tidak boleh hanya angka
    if (!isNaN(nama.value)) {
        e.preventDefault();
        error.textContent = "Nama pengeluaran tidak boleh hanya angka";
        return;
    }

    // Nilai pengeluaran harus angka
    if (isNaN(nilai.value) || nilai.value <= 0) {
        e.preventDefault();
        error.textContent = "Nilai pengeluaran harus angka dan lebih dari 0";
        return;
    }

    alert("Pengeluaran berhasil disimpan");
});
