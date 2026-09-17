document.addEventListener('DOMContentLoaded', async () => {
  if (!Components.init('dashboard')) return;

  Utils.showLoading();
  try {
    const res = await API.getDashboardData();
    if (res.success) {
      if (res.isMock) {
        Utils.showToast(res.message, 'info');
        const demoRes = API.getDemoData('getDashboardData');
        renderDashboard(demoRes.data);
      } else {
        renderDashboard(res.data);
      }
    }
  } catch (error) {
    Utils.showToast('Gagal memuat data dashboard', 'error');
  } finally {
    Utils.hideLoading();
  }
});

function renderDashboard(data) {
  renderSummaryCards(data);
  renderChartRealisasiRencana(data.realisasiBulanan);
  renderChartKomposisi(data.komposisiAnggaran);
  renderChartRealisasiBulanan(data.realisasiBulanan);
  renderTopPenyedia(data.top5Penyedia);
  renderChartStatus(data.statusPekerjaan);
  renderNotifications(data.notifications);
}

function renderSummaryCards(data) {
  const container = document.getElementById('summaryCards');
  container.innerHTML = `
    <div class="summary-card blue">
      <div class="card-icon"><i data-lucide="wallet"></i></div>
      <div class="card-content">
        <div class="card-label">Total Anggaran</div>
        <div class="card-value">${Utils.formatShortCurrency(data.totalAnggaran)}</div>
        <div class="card-desc">Pagu tahun ${data.paguTahun}</div>
      </div>
    </div>
    <div class="summary-card green">
      <div class="card-icon"><i data-lucide="file-check"></i></div>
      <div class="card-content">
        <div class="card-label">Nilai Kontrak</div>
        <div class="card-value">${Utils.formatShortCurrency(data.nilaiKontrak)}</div>
        <div class="card-desc"><span class="up">↑ ${data.persentaseKontrak}%</span> dari anggaran</div>
      </div>
    </div>
    <div class="summary-card orange">
      <div class="card-icon"><i data-lucide="bar-chart-2"></i></div>
      <div class="card-content">
        <div class="card-label">Realisasi</div>
        <div class="card-value">${Utils.formatShortCurrency(data.realisasi)}</div>
        <div class="card-desc"><span class="up">↑ ${data.persentaseRealisasi}%</span> dari kontrak</div>
      </div>
    </div>
    <div class="summary-card red">
      <div class="card-icon"><i data-lucide="calculator"></i></div>
      <div class="card-content">
        <div class="card-label">Sisa Anggaran</div>
        <div class="card-value">${Utils.formatShortCurrency(data.sisaAnggaran)}</div>
        <div class="card-desc"><span class="down">↓ ${data.persentaseSisa}%</span> belum terserap</div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

function renderChartRealisasiRencana(data) {
  const ctx = document.getElementById('chartRealisasiRencana').getContext('2d');
  
  const labels = data.map(d => d.bulan);
  const rencanaData = [];
  const realisasiData = [];
  
  let cumRencana = 0;
  let cumRealisasi = 0;
  
  data.forEach(d => {
    cumRencana += d.rencana;
    rencanaData.push(cumRencana / 1000000); // in Million
    
    if (d.realisasi > 0) {
      cumRealisasi += d.realisasi;
      realisasiData.push(cumRealisasi / 1000000);
    } else {
      realisasiData.push(null);
    }
  });

  // Target line is a straight line to max
  const targetData = [0];
  const maxVal = rencanaData[rencanaData.length-1];
  for(let i=1; i<labels.length-1; i++) { targetData.push(null); }
  targetData.push(maxVal);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'RAB Kumulatif',
          data: rencanaData,
          borderColor: '#1B3A5C',
          backgroundColor: '#1B3A5C',
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.3
        },
        {
          label: 'Realisasi Kumulatif',
          data: realisasiData,
          borderColor: '#4CAF50',
          backgroundColor: '#4CAF50',
          borderWidth: 2,
          pointRadius: 4,
          tension: 0.3
        },
        {
          label: 'Target',
          data: targetData,
          borderColor: '#FF9800',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.raw !== null) {
                return context.dataset.label + ': Rp ' + context.raw.toFixed(2) + ' M';
              }
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { borderDash: [4, 4], color: '#E2E8F0' },
          ticks: { callback: function(value) { return value + ' M'; }, font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

function renderChartKomposisi(data) {
  const ctx = document.getElementById('chartKomposisi').getContext('2d');
  
  const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.jenis),
      datasets: [{
        data: data.map(d => d.persentase),
        backgroundColor: colors,
        borderWidth: 0,
        cutout: '75%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      animation: { animateScale: true }
    }
  });
  
  // Render Custom Legend
  const legendHtml = data.map((d, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:12px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${colors[i]}"></div>
        <span style="color:var(--text-secondary)">${d.jenis}</span>
      </div>
      <div style="font-weight:600;">${d.persentase}%</div>
    </div>
  `).join('');
  
  document.getElementById('komposisiLegend').innerHTML = legendHtml;
}

function renderChartRealisasiBulanan(data) {
  const ctx = document.getElementById('chartRealisasiBulanan').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.bulan),
      datasets: [
        {
          label: 'Rencana',
          data: data.map(d => d.rencana / 1000000), // in Million
          backgroundColor: '#64B5F6',
          borderRadius: 4
        },
        {
          label: 'Realisasi',
          data: data.map(d => d.realisasi / 1000000),
          backgroundColor: '#4CAF50',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) { return context.dataset.label + ': Rp ' + context.raw.toFixed(2) + ' M'; }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { borderDash: [4, 4], color: '#E2E8F0' },
          ticks: { callback: function(value) { return value + ' M'; }, font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

function renderTopPenyedia(data) {
  const container = document.getElementById('top5Penyedia');
  
  let html = '';
  data.forEach((d, i) => {
    // animate width
    setTimeout(() => {
      const bar = document.getElementById(`bar-penyedia-${i}`);
      if (bar) bar.style.width = `${d.persentase}%`;
    }, 100 * (i + 1));
    
    html += `
      <div class="penyedia-item">
        <div class="penyedia-name" title="${d.nama}">${d.nama}</div>
        <div class="penyedia-bar-container">
          <div class="penyedia-bar" id="bar-penyedia-${i}" style="width:0%">
            ${Utils.formatShortCurrency(d.nilai)} (${d.persentase}%)
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderChartStatus(data) {
  const ctx = document.getElementById('chartStatus').getContext('2d');
  
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9E9E9E'];
  const values = [data.selesai, data.on_progress, data.belum_mulai, data.tunda, data.batal];
  const labels = ['Selesai', 'On Progress', 'Belum Mulai', 'Tunda', 'Batal'];
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        cutout: '70%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      animation: { animateScale: true }
    }
  });
  
  document.getElementById('totalPaket').textContent = data.total;
  
  // Render Legend
  const legendHtml = labels.map((label, i) => `
    <div class="status-legend-item">
      <div class="status-legend-left">
        <div class="status-legend-dot" style="background:${colors[i]}"></div>
        <div class="status-legend-label">${label}</div>
      </div>
      <div class="status-legend-value">${values[i]}</div>
    </div>
  `).join('');
  
  document.getElementById('statusLegend').innerHTML = legendHtml;
}

function renderNotifications(data) {
  const container = document.getElementById('notifications');
  
  if (!data || data.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:12px;">Tidak ada notifikasi</div>';
    return;
  }
  
  const icons = {
    'warning': 'alert-triangle',
    'info': 'info',
    'success': 'check-circle',
    'danger': 'alert-circle'
  };
  
  let html = '';
  data.forEach(d => {
    html += `
      <div class="notification-item">
        <div class="notification-icon ${d.type}"><i data-lucide="${icons[d.type]}"></i></div>
        <div class="notification-content">
          <div class="notification-text">${d.text}</div>
          <div class="notification-time">${d.time}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}
