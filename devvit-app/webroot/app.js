// ─── State ───
var data = null;
var visaFilter = 'visitor-outside-canada';
var searchQuery = '';
var sortMode = 'alpha';

var VISA_LABELS = {
  'visitor-outside-canada': 'Visitor',
  'supervisa': 'Super Visa',
  'study': 'Study',
  'work': 'Work',
};

// ─── Helpers ───
function getSpeedClass(days) {
  if (days === null || days === undefined) return 'days-na';
  if (days <= 14) return 'speed-fast';
  if (days <= 30) return 'speed-moderate';
  if (days <= 60) return 'speed-slow';
  return 'speed-very-slow';
}

function codeToFlag(code) {
  if (!code || code.length !== 2) return '';
  return '<span class="flag-badge">' + code.toUpperCase() + '</span>';
}

// ─── Render ───
function render() {
  if (!data) return;

  // Meta
  var metaEl = document.getElementById('meta');
  var irccDate = data.ircc_last_updated || 'weekly';
  var fetchDate = data._meta && data._meta.lastFetched
    ? new Date(data._meta.lastFetched).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;
  metaEl.textContent = 'Official IRCC data \u00b7 Updated ' + irccDate + (fetchDate ? ' \u00b7 Fetched ' + fetchDate : '');

  // Visa type filters
  var filtersEl = document.getElementById('filters');
  filtersEl.innerHTML = Object.entries(VISA_LABELS).map(function(entry) {
    var key = entry[0], label = entry[1];
    return '<button class="filter-btn ' + (visaFilter === key ? 'active' : '') + '" data-visa="' + key + '">' + label + '</button>';
  }).join('');

  filtersEl.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      visaFilter = btn.dataset.visa;
      render();
    });
  });

  // Sort controls
  var sortEl = document.getElementById('sort-controls');
  var sorts = [
    { key: 'alpha', label: 'A\u2013Z' },
    { key: 'fastest', label: 'Fastest' },
    { key: 'slowest', label: 'Slowest' },
  ];
  sortEl.innerHTML = sorts.map(function(s) {
    return '<button class="sort-btn ' + (sortMode === s.key ? 'active' : '') + '" data-sort="' + s.key + '">' + s.label + '</button>';
  }).join('');

  sortEl.querySelectorAll('.sort-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      sortMode = btn.dataset.sort;
      render();
    });
  });

  // Filter + sort countries
  var entries = Object.entries(data.processing_times)
    .filter(function(entry) {
      var val = entry[1][visaFilter];
      return val !== null && val !== undefined && typeof val === 'number';
    })
    .filter(function(entry) {
      if (!searchQuery) return true;
      return (entry[1].name || '').toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort(function(a, b) {
      if (sortMode === 'fastest') return (a[1][visaFilter]) - (b[1][visaFilter]);
      if (sortMode === 'slowest') return (b[1][visaFilter]) - (a[1][visaFilter]);
      return (a[1].name || a[0]).localeCompare(b[1].name || b[0]);
    });

  // Stats
  var allDays = entries.map(function(entry) { return entry[1][visaFilter]; });
  var avg = allDays.length ? Math.round(allDays.reduce(function(a, b) { return a + b; }, 0) / allDays.length) : 0;
  var fastest = entries.length ? entries.reduce(function(a, b) { return a[1][visaFilter] < b[1][visaFilter] ? a : b; }) : null;
  var slowest = entries.length ? entries.reduce(function(a, b) { return a[1][visaFilter] > b[1][visaFilter] ? a : b; }) : null;

  document.getElementById('stats').innerHTML =
    '<div class="stat"><div class="stat-value" style="color:var(--blue)">' + avg + '<span class="days-unit">d</span></div><div class="stat-label">Average</div></div>' +
    '<div class="stat"><div class="stat-value" style="color:var(--green)">' + (fastest ? fastest[1][visaFilter] + '<span class="days-unit">d</span>' : '\u2014') + '</div><div class="stat-label">' + (fastest ? fastest[1].name : 'Fastest') + '</div></div>' +
    '<div class="stat"><div class="stat-value" style="color:var(--red)">' + (slowest ? slowest[1][visaFilter] + '<span class="days-unit">d</span>' : '\u2014') + '</div><div class="stat-label">' + (slowest ? slowest[1].name : 'Slowest') + '</div></div>' +
    '<div class="stat"><div class="stat-value">' + entries.length + '</div><div class="stat-label">Countries</div></div>';

  // Country list
  var listEl = document.getElementById('list');
  if (entries.length === 0) {
    listEl.innerHTML = '<div class="empty">No countries found</div>';
  } else {
    listEl.innerHTML = entries.map(function(entry, i) {
      var code = entry[0], c = entry[1];
      var days = c[visaFilter];
      var raw = c.raw ? c.raw[visaFilter] : null;
      return '<li class="country-row">' +
        '<span class="rank">' + (i + 1) + '</span>' +
        '<span class="flag">' + codeToFlag(code) + '</span>' +
        '<div class="country-info">' +
          '<div class="country-name">' + (c.name || code) + '</div>' +
          (raw ? '<div class="country-raw">' + raw + '</div>' : '') +
        '</div>' +
        '<div class="days-wrap">' +
          '<span class="days ' + getSpeedClass(days) + '">' + (typeof days === 'number' ? days : '\u2014') + '</span>' +
          '<span class="days-unit">days</span>' +
        '</div>' +
      '</li>';
    }).join('');
  }

  // Footer
  document.getElementById('footer').textContent = entries.length + ' countries \u00b7 r/CanadaVisitorVisa';
}

// ─── Events ───
document.getElementById('search').addEventListener('input', function(e) {
  searchQuery = e.target.value;
  render();
});

// ─── Init ───
async function init() {
  try {
    var res = await fetch('/api/data');
    if (res.ok) {
      data = await res.json();
      render();
    } else if (res.status === 404) {
      document.getElementById('list').innerHTML = '<div class="empty">No data available yet.<br>Use \u22ef menu \u203a "Load Full IRCC Data" to seed data.</div>';
      document.getElementById('meta').textContent = 'No data loaded';
    } else {
      document.getElementById('list').innerHTML = '<div class="empty">Server error (' + res.status + ')</div>';
      document.getElementById('meta').textContent = 'Error loading data';
    }
  } catch (e) {
    console.error('Fetch failed:', e);
    document.getElementById('list').innerHTML = '<div class="empty">Failed to connect to server.</div>';
    document.getElementById('meta').textContent = 'Connection error';
  }
}

init();
