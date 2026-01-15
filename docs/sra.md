Software Requirements Specification
Project: AESTATE - Single Brand Capsule Wardrobe Platform
Identification No: SRS-CW-2024-001 Date: November 2025 Version: 1.0
Abstract
Dokumen ini merinci spesifikasi kebutuhan perangkat lunak untuk "AESTHETE", sebuah platform e-commerce berbasis web statis yang berfokus pada konsep Capsule Wardrobe. Sistem ini dirancang untuk memberikan pengalaman pengguna yang interaktif melalui fitur kustomisasi avatar sederhana dan mesin rekomendasi outfit berbasis aturan (rule-based), tanpa menggunakan infrastruktur backend yang kompleks.
Keywords
Capsule Wardrobe, Static Web, JavaScript, Outfit Recommendation, Client-Side Scripting.
Approval
Role
Name
Signature
Date
Author
Fran sumawijaya
_____________
[Tanggal]
Project Manager
[Kosongkan]
_____________
_________
Product Owner
[Kosongkan]
_____________
_________

TABLE OF CONTENTS
INTRODUCTION 1.1 Purpose 1.2 Scope 1.3 Overview 1.4 Definitions, Acronyms, and Abbreviations 1.5 References
GENERAL DESCRIPTION 2.1 Product Perspective 2.2 Product Functions 2.3 User Characteristics 2.4 General Constraints 2.5 Assumptions and Dependencies
SPECIFIC REQUIREMENTS 3.1 Functional Requirements 3.2 External Interface Requirements 3.3 Performance Requirements 3.4 Design Constraints 3.5 Software System Attributes
APPENDIX 4.1 Traceability Matrix
Section 1. INTRODUCTION
1.1 Purpose
Tujuan dari dokumen ini adalah untuk mendefinisikan kebutuhan fungsional dan non-fungsional untuk pengembangan website "AESTHETE". Dokumen ini ditujukan untuk tim pengembang, desainer antarmuka, dan pemangku kepentingan (stakeholders) untuk memastikan pemahaman yang sama mengenai spesifikasi teknis dan batasan sistem sebelum tahap implementasi dimulai.
1.2 Scope
Perangkat lunak yang akan dikembangkan adalah AESTHETE, sebuah aplikasi web statis (Static Web Application) yang berfungsi sebagai katalog digital dan alat bantu gaya (styling tool) untuk sebuah brand fashion spesifiknya adalah untuk membuat dengan tema capsul wardrobe .

Aplikasi ini akan melakukan:
Menampilkan katalog produk dengan detail spesifikasi.
Menyediakan fitur simulasi avatar sederhana berdasarkan input fisik pengguna.
Memberikan rekomendasi outfit otomatis berdasarkan logika pencocokan atribut (attribute matching logic).
Menyimpan preferensi pengguna sementara menggunakan Browser LocalStorage.
Aplikasi ini tidak akan melakukan:
Pemrosesan transaksi pembayaran secara real-time (Payment Gateway).
Manajemen akun pengguna berbasis server (Login/Register Database).
Manajemen inventaris dinamis secara real-time.
1.3 Overview
Dokumen ini disusun berdasarkan standar IEEE 830. Bagian 2 memberikan gambaran umum mengenai fungsionalitas produk dan karakteristik pengguna. Bagian 3 merinci spesifikasi kebutuhan teknis secara detail yang harus dipenuhi oleh sistem.
1.4 Definitions, Acronyms, and Abbreviations
Term/Acronym
Definition
Capsule Wardrobe
Konsep koleksi pakaian minimalis yang terdiri dari item-item esensial yang dapat dipadupadankan satu sama lain.
Static Web
Website yang kontennya dikirim ke browser pengguna persis seperti yang disimpan, tanpa pemrosesan sisi server (backend dynamic).
Client-Side
Operasi yang dieksekusi pada browser pengguna menggunakan JavaScript, bukan di server.
JSON
JavaScript Object Notation, format pertukaran data ringan yang digunakan untuk menyimpan data produk secara lokal.
CTA
Call to Action, elemen antarmuka yang mendorong pengguna melakukan aksi tertentu.

1.5 References
Brief Proyek Semester 3 - Pemrograman Web.
Dokumentasi MDN Web Docs (Mozilla Developer Network) untuk HTML, CSS, dan JavaScript.
Section 2. GENERAL DESCRIPTION
2.1 Product Perspective
Sistem Capsule Wardrobe dikembangkan sebagai aplikasi web statis (Static Web App) yang berjalan sepenuhnya di sisi klien (Client-Side). Sistem tidak memiliki database relasional konvensional (seperti MySQL) yang di-hosting di server aplikasi. Sebaliknya, sistem menggunakan arsitektur Decoupled Data Source, di mana data produk dan aturan logika avatar disimpan dalam layanan Cloud Spreadsheet (Google Sheets).
Aplikasi akan mengambil data (fetch) secara real-time saat halaman dimuat menggunakan format CSV/JSON. Transaksi pembelian tidak terjadi di dalam sistem, melainkan pengguna akan diarahkan (redirect) ke platform E-Commerce eksternal (Shopee/Tokopedia) 

Arsitektur diagram : 

2.2 Product Functions
Fungsi utama dari perangkat lunak ini meliputi:
Visualisasi Brand: Menampilkan identitas visual brand melalui Landing Page.
Kustomisasi Avatar: Mengizinkan pengguna memilih parameter fisik (Wajah, Kulit, Tubuh, Tinggi).
Mesin Rekomendasi: Menghasilkan saran kombinasi produk berdasarkan parameter avatar.
Katalog Interaktif: Menampilkan daftar produk dengan fitur filter kategori.
Edukasi Brand: Halaman "About" yang menjelaskan filosofi capsule wardrobe.
Catalog Display (Dynamic Fetching): Sistem menampilkan daftar produk yang diambil secara dinamis dari sumber data eksternal.
Avatar Logic Processing: Sistem memproses aturan rekomendasi (ruleset) yang dibaca dari spreadsheet untuk mencocokkan input pengguna dengan produk.
External Checkout Routing: Sistem memfasilitasi navigasi ke platform marketplace untuk penyelesaian transaksi.
Berikut adalah ringkasan fungsi utama yang akan disediakan oleh website Capsule Wardrobe. Interaksi pengguna dengan sistem digambarkan dalam Use Case Diagram di bawah ini.











2.3 User Characteristics
Pengguna sistem ini dikategorikan sebagai "Pengunjung Umum" (Guest User) dengan karakteristik:
Demografi: Usia 18-35 tahun, peminat fashion minimalis.
Keahlian Teknis: Mampu mengoperasikan peramban web standar pada perangkat desktop atau seluler.
2.4 General Constraints
Pengembangan sistem dibatasi oleh faktor-faktor berikut:
Teknologi: Wajib menggunakan HTML5, CSS3, dan Vanilla JavaScript (ES6+). Penggunaan framework berat (React/Vue/Angular) tidak diperbolehkan untuk proyek ini.
Waktu: Pengembangan harus diselesaikan dalam kurun waktu satu semester akademik.
Infrastruktur: Sistem harus dapat berjalan tanpa server-side scripting (PHP/Node.js).
2.5 Assumptions and Dependencies
Diasumsikan bahwa pengguna menggunakan peramban web modern yang mendukung ES6 JavaScript (Chrome, Firefox, Safari, Edge versi terbaru).
JavaScript harus diaktifkan pada peramban pengguna agar fitur interaktif dapat berjalan.
Section 3. REQUIREMENTS
3.1 Functional Requirements
3.1.1 Landing Page & Navigation
REQ-01: Sistem harus menampilkan halaman utama (Hero Section) yang memuat elemen visual branding dan Call-to-Action (CTA) utama menuju fitur Avatar.
REQ-02: Sistem harus menyediakan navigasi global yang responsif (Menu Bar pada Desktop, Hamburger Menu pada Mobile) untuk akses ke modul: Home, Avatar Studio, Catalog, dan About.
3.1.2 Avatar Customization Tool
REQ-03: Sistem harus menyediakan antarmuka visual interaktif bagi pengguna untuk menginput parameter fisik:
Bentuk Wajah (Oval, Round, Square)
Warna Kulit (Light, Medium, Tan, Deep)
Postur Tubuh (Petite, Athletic, Curvy)
Tinggi badan (tall, very tall, average, small)
REQ-04: Sistem harus memvalidasi kelengkapan input pengguna sebelum mengizinkan proses generate rekomendasi.
REQ-05: Sistem harus merespons input pengguna dengan mengubah visualisasi avatar secara real-time tanpa memuat ulang halaman.
3.1.3 Outfit Recommendation Engine (Rule-Based)
REQ-06: Sistem harus mengambil (fetch) data aturan logika (Logic Ruleset) dari sumber eksternal (Spreadsheet AvatarRules) saat aplikasi dimuat.
REQ-07: Algoritma sistem harus mencocokkan input parameter pengguna (Wajah + Kulit + Tubuh) dengan data ruleset untuk menghasilkan ID produk yang relevan.
REQ-08: Sistem harus menampilkan hasil rekomendasi yang terdiri dari 3 komponen terpisah: Atasan (Top), Bawahan (Bottom), dan Aksesoris/Luaran (Layering).
3.1.4 Product Catalog (Dynamic Data)
REQ-09: Sistem harus melakukan pengambilan data (Data Fetching) dari URL publik Google Sheets dalam format CSV dan melakukan parsing menjadi objek JSON pada sisi klien.
REQ-10: Sistem harus merender kartu produk (Product Cards) secara dinamis berdasarkan data yang diterima dari spreadsheet (Nama, Harga, Foto, Link Marketplace).
REQ-11: Sistem harus menyediakan fitur filter kategori (All, Top, Bottom, Outer) yang memanipulasi tampilan data di sisi klien (Client-side Filtering).
REQ-12: Sistem TIDAK memproses transaksi pembayaran. Tombol "Beli" pada detail produk harus mengarahkan pengguna (redirect) ke halaman produk terkait di platform E-Commerce eksternal (Shopee/Tokopedia).
3.2 External Interface Requirements
3.2.1 User Interfaces
Desain: Mengadopsi prinsip Minimalist UI dengan dominasi whitespace.
Warna: Sesuai Brand Identity
Responsivitas: Layout beradaptasi otomatis menggunakan CSS Grid/Flexbox untuk layar Mobile (320px+) hingga Desktop (1920px).
3.2.2 Software Interfaces
Data Source (Headless CMS): Google Sheets. Digunakan sebagai penyimpanan terpusat untuk data katalog produk dan logika avatar.
Data Parser: PapaParse Library (JS). Digunakan untuk mengonversi respons CSV dari Google Sheets menjadi format JSON yang dapat dibaca browser.
Transaction Platform: Shopee / Tokopedia. Antarmuka eksternal untuk penyelesaian transaksi pembelian.
3.2.3 Hardware Interfaces
Sistem bersifat Device-Agnostic, dapat berjalan pada perangkat apapun (Smartphone, Tablet, Laptop) yang memiliki peramban web modern dan koneksi internet aktif.
3.3 Performance Requirements
PERF-01: Proses pengambilan data (Fetching) dari Google Sheets harus dilakukan secara Asynchronous agar tidak memblokir antarmuka pengguna, dengan target waktu muat data di bawah 3 detik pada koneksi 4G.
PERF-02: Manipulasi DOM untuk pergantian avatar harus terjadi di bawah 100ms setelah interaksi pengguna (Low Latency Interaction).
3.4 Design Constraints
No Backend Server: Sistem harus berjalan sepenuhnya di sisi klien (Client-Side) tanpa database SQL konvensional.
Single Page Application (SPA) Feel: Navigasi antar fitur diutamakan tanpa full page reload untuk pengalaman pengguna yang mulus.
3.5 Software System Attributes
3.5.1 Availability
Ketersediaan sistem bergantung pada uptime layanan hosting statis (GitHub Pages/Vercel) dan ketersediaan API Google Sheets, dengan target uptime 99%.
3.5.2 Maintainability
Pembaruan konten (Produk Baru/Harga) dilakukan melalui antarmuka Spreadsheet tanpa perlu mengubah kode sumber program (Code-free Content Update), memudahkan pemeliharaan oleh pengguna non-teknis.

Section 4. APPENDIX
4.1 Traceability Matrix
Requirement ID
Description
Priority
Use Case Ref
REQ-01
Hero Landing Page
High
UC-01 View Landing
REQ-03
Input Avatar Attributes
High
UC-02 Customize Avatar
REQ-06
Fetch Logic Rules
High
UC-03 Get Recommendation
REQ-09
Fetch Product Data
High
UC-04 Browse Catalog
REQ-12
External Redirect
High
UC-03 & UC-04
PERF-01
Async Data Loading
Medium
N/A (Quality Attribute)

4.2 Data Schema Definition (Spreadsheet Structure)
Bagian ini mendefinisikan struktur data yang digunakan pada penyimpanan eksternal (Google Sheets).
Tabel 1: Sheet Product_Catalog
Digunakan untuk memenuhi REQ-09 dan REQ-10.
Column Header
Data Type
Description
id
String (PK)
Kode unik produk (e.g., P01, P02)
name
String
Nama produk untuk display
category
String
Kategori untuk filter (Top/Bottom/Outer)
price
Number
Harga dalam Rupiah
image_url
String (URL)
Tautan langsung ke file gambar produk
shopee_link
String (URL)
Tautan menuju halaman pembelian eksternal

Tabel 2: Sheet Avatar_Rules
Digunakan untuk memenuhi REQ-06 dan REQ-07.
Column Header
Data Type
Description
rule_id
String (PK)
Kode unik aturan
face_shape
String
Kondisi input wajah (e.g., Oval)
body_shape
String
Kondisi input tubuh (e.g., Curvy)
rec_top_id
String (FK)
ID Produk Atasan yang direkomendasikan
rec_bottom_id
String (FK)
ID Produk Bawahan yang direkomendasikan


