// Penyimpanan daftar semua gejala dan karakteristik setiap penyakit yang digunakan sebagai acuan perhitungan
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

const diseasesData = [
    { 
        name: "Flea Allergic Dermatitis", 
        shortDesc: "Alergi kutu → gatal, kemerahan, rontok pangkal ekor, ditemukan kutu.",
        gejalaIndices: [0, 1, 2, 3, 11, 12],
        saran: "➤ Lakukan kontrol kutu (spot-on/frontline). Konsultasi ke dokter untuk antiinflamasi. Bersihkan lingkungan."
    },
    { 
        name: "Ringworm (Kurap)", 
        shortDesc: "Infeksi jamur → lesi melingkar, rambut rontok cincin, bersisik.",
        gejalaIndices: [4, 5, 11],
        saran: "➤ Isolasi kucing, gunakan antijamur topikal (miconazole) & oral sesuai resep dokter. Sterilkan lingkungan."
    },
    { 
        name: "Scabies (Kudis)", 
        shortDesc: "Tungau → gatal ekstrem, keropeng tebal telinga/wajah, penebalan kulit.",
        gejalaIndices: [0, 6, 7, 13, 14, 12],
        saran: "➤ Segera konsultasi dokter untuk obat antiparasit (ivermectin/selamektin). Mandi obat, semua hewan kontak diobati."
    },
    { 
        name: "Feline Acne", 
        shortDesc: "Komedo dagu, bengkak, pustula, kemerahan.",
        gejalaIndices: [8, 9, 10, 15, 1],
        saran: "➤ Bersihkan dagu dengan sabun antiseptik (chlorhexidine). Ganti mangkuk plastik dengan stainless steel/keramik. Hindari stres."
    }
];

const gejalaContainer = document.getElementById('gejala-container');
function renderCheckboxes() {
    if (!gejalaContainer) return;
    gejalaContainer.innerHTML = '';
    gejalaMaster.forEach(gejala => {
        const div = document.createElement('div');
        div.className = 'gejala-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `gejala_${gejala.id}`;
        cb.setAttribute('value', gejala.id);
        const label = document.createElement('label');
        label.htmlFor = `gejala_${gejala.id}`;
        label.innerText = ServerLabel(gejala.label);
        div.appendChild(cb);
        div.appendChild(label);
        gejalaContainer.appendChild(div);
    });
}

function ServerLabel(text){
    return text;
}

function getSelectedGejala() {
    const checkboxes = document.querySelectorAll('#gejala-container input[type="checkbox"]');
    const selected = [];
    checkboxes.forEach(cb => {
        if (cb.checked) selected.push(parseInt(cb.value));
    });
    return selected;
}

function resetGejala() {
    const checkboxes = document.querySelectorAll('#gejala-container input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    const hasilDiv = document.getElementById('hasil-deteksi');
    if (hasilDiv) hasilDiv.style.display = 'none';
}

function detectDisease(selectedIndices) {
    if (!selectedIndices.length) {
        return { error: true, message: "⚠️ Belum ada gejala yang dipilih. Silakan centang minimal satu ciri-ciri pada kucing Anda." };
    }
    const results = diseasesData.map(disease => {
        let matchCount = 0;
        for (let idx of selectedIndices) {
            if (disease.gejalaIndices.includes(idx)) matchCount++;
        }
        let percent = (matchCount / selectedIndices.length) * 100;
        percent = Math.min(100, Math.round(percent));
        return { ...disease, matchCount, percent };
    });
    results.sort((a,b) => b.percent - a.percent);
    const top = results[0];
    const secondary = results[1] && results[1].percent > 20 && (top.percent - results[1].percent) < 35 ? results[1] : null;
    return { top, secondary, totalGejala: selectedIndices.length };
}

function displayResult(selectedIndices) {
    const resultDiv = document.getElementById('hasil-deteksi');
    if (!resultDiv) return;
    const detection = detectDisease(selectedIndices);
    if (detection.error) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<div style="color:#7c3aed;">${detection.message}</div>`;
        return;
    }
    const topDisease = detection.top;
    
    const topIcon = topDisease.icon ? topDisease.icon : "🐾";
    const secIcon = (detection.secondary && detection.secondary.icon) ? detection.secondary.icon : "🐾";

    const infoTanggal = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    let html = `
        <div style="font-weight:800; font-size:1.4rem; margin-bottom:4px;">📊 Hasil Analisis Gejala</div>
        <p style="font-size:0.85rem; color:#666; margin-top:0; margin-bottom:15px;">Waktu Pemeriksaan: ${infoTanggal}</p>
        
        <div style="background:#f9f6ff; border-radius:28px; padding:1rem; margin-bottom:12px; border:1px solid #e9defa;">
            <strong>🎯 Kemungkinan utama:</strong> ${topIcon} ${topDisease.name} (${topDisease.percent}% kecocokan dari gejala yang dipilih)<br>
            <strong>Deskripsi:</strong> ${topDisease.shortDesc}<br>
            <strong>💡 Saran awal:</strong> ${topDisease.saran}
        </div>
    `;
    
    if (detection.secondary) {
        const secDisease = detection.secondary;
        html += `
            <div style="background:#f3efff; border-radius:24px; padding:1rem; margin-bottom:12px; border:1px solid #e3d5fa;">
                <strong>🔍 Kemungkinan lain:</strong> ${secIcon} ${secDisease.name} (${secDisease.percent}% kecocokan)<br>
                <strong>Deskripsi:</strong> ${secDisease.shortDesc}<br>
                <strong>💡 Saran awal:</strong> ${secDisease.saran}
            </div>
        `;
    }
    
    html += `<div style="margin-top: 16px; font-size:0.85rem; color:#6d28d9; margin-bottom:15px;">✅ Hasil berdasarkan ${detection.totalGejala} gejala yang dipilih. Konsultasikan ke dokter hewan untuk diagnosis lebih lanjut.</div>`;
    // Untuk Fitur Cetak
    html += `
        <button id="cetak-hasil-btn" class="btn-print">
            🖨️ Cetak Lembar Rekam Medis
        </button>
    `;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = html;

    const cetakBtn = document.getElementById('cetak-hasil-btn');
    if (cetakBtn) {
        cetakBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

const pages = {
    'home': 'home-page',
    'deteksi': 'deteksi-page',
    'info': 'info-page',
    'tips': 'tips-page',
    'tentang': 'tentang-page'
};

function showPage(pageKey) {
    const targetId = pages[pageKey];
    if (!targetId) return;

    Object.values(pages).forEach(pid => {
        const el = document.getElementById(pid);
        if (el) el.classList.remove('active-page');
    });
    
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active-page');
    
    window.scrollTo({top: 0, behavior: 'smooth'});

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-nav') === pageKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function init() {
    renderCheckboxes();
    
    const deteksiBtn = document.getElementById('deteksi-btn');
    if (deteksiBtn) {
        deteksiBtn.addEventListener('click', () => {
            const selected = getSelectedGejala();
            if (selected.length === 0) {
                alert("Pilih minimal satu gejala / ciri-ciri pada kulit kucing.");
                return;
            }
            displayResult(selected);
        });
    }
    
    const resetBtn = document.getElementById('reset-gejala-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetGejala);
    
    const homeDeteksi = document.getElementById('home-deteksi-btn');
    if (homeDeteksi) homeDeteksi.addEventListener('click', () => showPage('deteksi'));
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const navKey = btn.getAttribute('data-nav');
            if (navKey) showPage(navKey);
        });
    });
    
    showPage('home');
}

window.addEventListener('DOMContentLoaded', init);
