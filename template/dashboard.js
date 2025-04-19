

const apiUrls = {
  1: 'https://de7c7d8d-a886-410d-97dc-88e8bb5720ed.mock.pstmn.io/TVData',
  2: 'https://de7c7d8d-a886-410d-97dc-88e8bb5720ed.mock.pstmn.io/FANData',
  3: 'https://de7c7d8d-a886-410d-97dc-88e8bb5720ed.mock.pstmn.io/FRIDGEData',
};

const sendDataEndpoint = 'https://644a567c-c569-4222-b898-ab09a17b38aa.mock.pstmn.io/ReceiveData';

const collectedData = {}; 


let selectedMode = 'bar';

document.getElementById('mode-select').addEventListener('change', (e) => {
  selectedMode = e.target.value;
  updateCharts();
  updateView();
});

function loadData(buttonNumber) {
  const apiUrl = apiUrls[buttonNumber];

  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    })
    .then(data => {
      collectedData[data.device] = data;
      renderCards();
      updateCharts();
      sendDataToEndpoint(data);
    })
    .catch(err => {
      console.error(err);
      alert(`Error loading data ${buttonNumber}`);
    });
}

function renderCards() {
  const container = document.getElementById('data-container');
  container.innerHTML = ''; // Clear existing cards

  Object.values(collectedData).forEach(data => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${data.device}</h2>
      <p>Power: ${data.power}</p>
      <small>Status: ${data.status}</small>
    `;
    container.appendChild(card);
  });
}

function updateCharts() {
  const labels = Object.keys(collectedData);
  const powerValues = Object.values(collectedData).map(d => parseInt(d.power) || 0);

  // Destroy existing charts if any
  if (window.barChart?.destroy instanceof Function) window.barChart.destroy();
  if (window.pieChart?.destroy instanceof Function) window.pieChart.destroy();

  // Handle Bar Chart
  const barCtx = document.getElementById('barChart').getContext('2d');
  window.barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Power Value',
        data: powerValues,
        backgroundColor: '#4bc0c0'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#fff' // Change color of y-axis ticks
          }
        },
        x: {
          ticks: {
            color: '#fff' // Change color of x-axis ticks
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        bar: {
          borderWidth: 2
        }
      },
      plugins: {
        tooltip: {
          bodyColor: '#fff', // Tooltip text color
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tooltip background color
        },
        legend: {
          labels: {
            color: '#fff' // Change color of legend text
          }
        }
      }
    }
  });

  // Handle Pie Chart
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  window.pieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: powerValues,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          bodyColor: '#fff', // Tooltip text color
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tooltip background color
        },
        legend: {
          labels: {
            color: '#fff' // Change color of legend text
          }
        }
      }
    }
  });

  updateView();
}


function updateView() {
  // Hide all charts and grid initially
  document.getElementById('barChart').style.display = 'none';
  document.getElementById('pieChart').style.display = 'none';
  document.querySelector('.card-grid').style.display = 'none';

  // Display based on selected mode
  if (selectedMode === 'bar') {
    document.getElementById('barChart').style.display = 'block';
  } else if (selectedMode === 'pie') {
    document.getElementById('pieChart').style.display = 'block';
  } else if (selectedMode === 'grid') {
    document.querySelector('.card-grid').style.display = 'flex';
  }
}

function sendDataToEndpoint(data) {
  fetch(sendDataEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(async res => {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Received JSON response:', json);
    } catch (e) {
      console.warn('Received non-JSON response:', text);
    }
  })
  .catch(err => {
    console.error('Error sending data:', err);
  });
}
function fetchMonthlyUsage() {
  fetch(monthlyDataUrl)
    .then(res => res.json())
    .then(data => {
      renderCombinedChart(data);
    })
    .catch(err => {
      console.error("Failed to load monthly usage data:", err);
    });
}
let combinedChart = null;

function renderCombinedChart(data) {
  const ctx = document.getElementById('combinedChart').getContext('2d');
  if (combinedChart) combinedChart.destroy();

  combinedChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'TV',
          data: data.TV,
          backgroundColor: '#36A2EB'
        },
        {
          label: 'Fan',
          data: data.Fan,
          backgroundColor: '#4BC0C0'
        },
        {
          label: 'Fridge',
          data: data.Fridge,
          backgroundColor: '#FFCE56'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Monthly Energy Usage (kWh)',
          color: '#333'
        },
        legend: {
          labels: { color: '#333' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy (kWh)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      }
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  fetchMonthlyUsage(); // This will load the chart immediately on load
});



