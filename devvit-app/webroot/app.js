var data = null;
var visaFilter = 'visitor-outside-canada';
var searchQuery = '';
var sortMode = 'alpha';
var maxDays = 1;

var VISA_LABELS = {
  'visitor-outside-canada': 'Visitor',
  'supervisa': 'Super Visa',
  'study': 'Study',
  'work': 'Work',
};

function speedClass(d) {
  if (typeof d !== 'number') return 'c-na';
  if (d <= 14) return 'c-fast';
  if (d <= 30) return 'c-mod';
  if (d <= 60) return 'c-slow';
  return 'c-vslow';
}

function bgClass(d) {
  if (typeof d !== 'number') return '';
  if (d <= 14) return 'bg-fast';
  if (d <= 30) return 'bg-mod';
  if (d <= 60) return 'bg-slow';
  return 'bg-vslow';
}

function getEntries() {
  if (!data) return [];
  return Object.entries(data.processing_times)
    .filter(function(e) {
      var v = e[1][visaFilter];
      return v !== null && v !== undefined && typeof v === 'number';
    })
    .filter(function(e) {
      if (!searchQuery) return true;
      return (e[1].name || '').toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
    })
    .sort(function(a, b) {
      if (sortMode === 'fastest') return a[1][visaFilter] - b[1][visaFilter];
      if (sortMode === 'slowest') return b[1][visaFilter] - a[1][visaFilter];
      return (a[1].name || a[0]).localeCompare(b[1].name || b[0]);
    });
}

function render() {
  if (!data) return;

  // Meta
  var ircc = data.ircc_last_updated || '';
  var fetched = data._meta && data._meta.lastFetched
    ? new Date(data._meta.lastFetched).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    : '';
  document.getElementById('meta').textContent = ircc + (fetched ? ' \u00b7 ' + fetched : '');

  // Filters
  var fEl = document.getElementById('filters');
  fEl.innerHTML = Object.entries(VISA_LABELS).map(function(e) {
    return '<button class="filter-btn' + (visaFilter === e[0] ? ' active' : '') + '" data-v="' + e[0] + '">' + e[1] + '</button>';
  }).join('');
  fEl.querySelectorAll('.filter-btn').forEach(function(b) {
    b.addEventListener('click', function() { visaFilter = b.dataset.v; render(); });
  });

  // Sorts
  var sEl = document.getElementById('sort-controls');
  var sorts = [['alpha','A\u2013Z'],['fastest','\u25B2'],['slowest','\u25BC']];
  sEl.innerHTML = sorts.map(function(s) {
    return '<button class="sort-btn' + (sortMode === s[0] ? ' active' : '') + '" data-s="' + s[0] + '" title="Sort ' + s[0] + '">' + s[1] + '</button>';
  }).join('');
  sEl.querySelectorAll('.sort-btn').forEach(function(b) {
    b.addEventListener('click', function() { sortMode = b.dataset.s; render(); });
  });

  var entries = getEntries();

  // Stats
  var days = entries.map(function(e) { return e[1][visaFilter]; });
  var avg = days.length ? Math.round(days.reduce(function(a,b){return a+b;},0) / days.length) : 0;
  var fastest = entries.length ? entries.reduce(function(a,b){return a[1][visaFilter]<b[1][visaFilter]?a:b;}) : null;
  var slowest = entries.length ? entries.reduce(function(a,b){return a[1][visaFilter]>b[1][visaFilter]?a:b;}) : null;
  maxDays = slowest ? slowest[1][visaFilter] : 1;

  document.getElementById('stats').innerHTML =
    '<div class="tick"><div class="tick-val c-mod">' + avg + 'd</div><div class="tick-label">Avg</div></div>' +
    '<div class="tick"><div class="tick-val c-fast">' + (fastest ? fastest[1][visaFilter] + 'd' : '\u2014') + '</div><div class="tick-label">' + (fastest ? fastest[1].name : '\u2014') + '</div></div>' +
    '<div class="tick"><div class="tick-val c-vslow">' + (slowest ? slowest[1][visaFilter] + 'd' : '\u2014') + '</div><div class="tick-label">' + (slowest ? slowest[1].name : '\u2014') + '</div></div>' +
    '<div class="tick"><div class="tick-val">' + entries.length + '</div><div class="tick-label">Countries</div></div>';

  // List
  var lEl = document.getElementById('list');
  if (!entries.length) {
    lEl.innerHTML = '<div class="empty">No results</div>';
  } else {
    lEl.innerHTML = entries.map(function(e) {
      var code = e[0], c = e[1], d = c[visaFilter];
      var pct = Math.min(Math.round((d / maxDays) * 100), 100);
      return '<li class="row">' +
        '<div class="row-bar ' + bgClass(d) + '" style="width:' + pct + '%"></div>' +
        '<span class="row-code">' + code + '</span>' +
        '<span class="row-name">' + (c.name || code) + '</span>' +
        '<span class="row-days ' + speedClass(d) + '">' + d + '</span>' +
        '<span class="row-unit">d</span>' +
      '</li>';
    }).join('');
  }

  document.getElementById('footer-count').textContent = entries.length + ' countries';
}

document.getElementById('search').addEventListener('input', function(e) {
  searchQuery = e.target.value;
  render();
});

async function init() {
  try {
    var res = await fetch('/api/data');
    if (res.ok) {
      data = await res.json();
      render();
    } else {
      document.getElementById('list').innerHTML = '<div class="empty">No data available.<br>Use menu to load data.</div>';
    }
  } catch (e) {
    document.getElementById('list').innerHTML = '<div class="empty">Connection error</div>';
  }
}

init();
