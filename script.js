// Data Gejala Utama
const gejalaMaster = [
    { id: 0, label: "Gatal intens pada kulit" },
    { id: 1, label: "Kemerahan pada kulit" },
    { id: 2, label: "Rambut rontok di area pangkal ekor / punggung belakang" },
    { id: 3, label: "Adanya kutu atau kotoran kutu (butiran hitam)" },
    { id: 4, label: "Lesi melingkar pada kulit" },
    { id: 5, label: "Rambut rontok berbentuk lingkaran (cincin)" },
    { id: 6, label: "Keropeng tebal di telinga, wajah, atau siku" },
    { id: 7, label: "Penebalan kulit (teraba kasar)" },
    { id: 8, label: "Komedo (bintik hitam) di area dagu" },
    { id: 9, label: "Pembengkakan / benjolan di dagu" },
    { id: 10, label: "Pustula atau jerawat di dagu" },
    { id: 11, label: "Kulit bersisik / berketombe" },
    { id: 12, label: "Luka akibat garukan berlebihan" },
    { id: 13, label: "Gatal parah ekstrem (kucing gelisah garuk terus)" },
    { id: 14, label: "Rambut rontok di area telinga" },
    { id: 15, label: "Lesi / kemerahan di sekitar bibir atau dagu (non komedo)" }
];

// Data Penyakit & Aturan Sistem Pakar (Melanjutkan kode kamu yang terpotong)
const diseasesData = [
    { 
        name: "Scabies (Kudis)", 
        shortDesc: "Infestasi tungau → gatal ekstrem, keropeng tebal telinga/wajah, penebalan kulit.",
        gejalaIndices: [0, 6, 7, 13, 14, 12],
        saran: "Segera konsultasi ke dokter untuk suntik antiparasit (ivermectin) atau obat tetes (selamektin). Mandikan dengan sampo sulfur/khusus medis."
    },
    { 
        name: "Flea Allergic Dermatitis (FAD)", 
        shortDesc: "Alergi kutu → gatal, kemerahan, rontok pangkal ekor, ditemukan kutu.",
        gejalaIndices: [0, 1, 2, 3, 11, 12],
        saran: "Lakukan kontrol kutu (spot-on/frontline). Konsultasi ke dokter untuk antiinflamasi. Bersihkan lingkungan secara berkala."
    },
    { 
        name: "Feline Acne", 
        shortDesc: "Komedom hitam / jerawat di dagu kucing.",
        gejalaIndices: [8, 9, 10, 15],
        saran: "Ganti mangkuk makan plastik dengan stainless-steel atau keramik. Bersihkan dagu dengan antiseptik chlorhexidine secara rutin."
    },
    { 
        name: "Ringworm (Kurap)", 
        shortDesc: "Infeksi jamur → lesi melingkar, rambut rontok cincin, bersisik.",
        gejalaIndices: [4, 5, 11],
        saran: "Isolasi kucing agar tidak menular. Gunakan antijamur topikal (salep/miconazole) & obat oral sesuai resep dokter hewan. Sterilkan kandang & ruangan." 
    }
];

// Fungsi Navigasi Antar Halaman
function showPage(pageId) {
    // Sembunyikan semua halaman
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active-page'));
    
    // Matikan status active di tombol navigasi header
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Tampilkan halaman terpilih
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active-page');
    }
    
    // Aktifkan tombol navigasi yang sesuai
    const activeBtn = document.querySelector(`.nav-btn[data-nav="${pageId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Scroll otomatis ke atas halaman saat pindah menu
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Menjalankan Kode Setelah Seluruh HTML Selesai Dimuat
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Logika Event Listener Tombol Navigasi Header
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.getAttribute('data-nav');
            showPage(pageId);
        });
    });

    // 2. Tombol "Mulai Deteksi Gejala" di Beranda Utama
    const homeDeteksiBtn = document.getElementById('home-deteksi-btn');
    if (homeDeteksiBtn) {
        homeDeteksiBtn.addEventListener('click', function() {
            showPage('deteksi');
        });
    }

    // 3. Merender (Memunculkan) Daftar Gejala secara Otomatis ke dalam Grid HTML
    const containerGejala = document.getElementById('gejala-container');
    if (containerGejala) {
        gejalaMaster.forEach(gejala => {
            const item = document.createElement('div');
            item.className = 'gejala-item';
            item.innerHTML = `
                <input type="checkbox" id="gejala-${gejala.id}" value="${gejala.id}">
                <label for="gejala-${gejala.id}">${gejala.label}</label>
            `;
            containerGejala.appendChild(item);
        });
    }

    // 4. Proses Tombol "Deteksi Sekarang" (Logika Sistem Pakar Sederhana)
    const deteksiBtn = document.getElementById('deteksi-btn');
    const hasilBox = document.getElementById('hasil-deteksi');

    if (deteksiBtn && hasilBox) {
        deteksiBtn.addEventListener('click', function() {
            // Mengambil semua ID gejala yang dicentang user
            const checkedBoxes = document.querySelectorAll('#gejala-container input[type="checkbox"]:checked');
            const selectedGejalaIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

            if (selectedGejalaIds.length === 0) {
                hasilBox.style.display = 'block';
                hasilBox.innerHTML = `<h3 style="color:#dc2626;">Peringatan</h3><p>Silakan centang minimal satu gejala terlebih dahulu untuk mendeteksi penyakit!</p>`;
                return;
            }

            let hasilHTML = `<h2>Hasil Analisis Kemungkinan Penyakit:</h2>`;
            let ditemukanPenyakit = false;

            // Mencocokkan input user dengan data aturan penyakit
            diseasesData.forEach(disease => {
                // Menghitung berapa banyak gejala yang cocok
                const cocok = disease.gejalaIndices.filter(id => selectedGejalaIds.includes(id));
                const persentase = Math.round((cocok.length / disease.gejalaIndices.length) * 100);

                // Jika kecocokan di atas 20%, tampilkan sebagai kemungkinan hasil
                if (persentase > 20) {
                    ditemukanPenyakit = true;
                    hasilHTML += `
                        <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px dashed #e2d6ff;">
                            <h3 style="margin-top:0.5rem;">${disease.name} (Tingkat Akurasi Kemungkinan: ${persentase}%)</h3>
                            <p style="margin: 0.3rem 0; color: #555;"><strong>Keterangan:</strong> ${disease.shortDesc}</p>
                            <p style="color: #6d28d9;"><strong>Saran Awal:</strong> ${disease.saran}</p>
                        </div>
                    `;
                }
            });

            if (!ditemukanPenyakit) {
                hasilHTML += `<p>Gejala yang Anda masukkan terlalu minim atau tidak spesifik ke 4 penyakit utama kami. Silakan periksa kembali ciri fisik kucing Anda atau langsung bawa ke dokter hewan.</p>`;
            }

            hasilBox.style.display = 'block';
            hasilBox.innerHTML = hasilHTML;
            
            // Scroll otomatis mengarah ke kotak hasil agar user langsung melihatnya
            hasilBox.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 5. Tombol "Reset Pilihan" Gejala
    const resetBtn = document.getElementById('reset-gejala-btn');
    if (resetBtn && hasilBox) {
        resetBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('#gejala-container input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
            hasilBox.style.display = 'none';
            hasilBox.innerHTML = '';
        });
    }
});