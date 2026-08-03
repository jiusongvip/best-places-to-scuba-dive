(function(){
  var data = JSON.parse(document.getElementById('step-1')?.dataset.destinations || '[]');
  if (!data.length) return;

  var month = null, difficulty = null, life = null;

  var diffMap = { beginner: ['beginner'], intermediate: ['beginner','intermediate'], advanced: ['beginner','intermediate','advanced'], any: ['beginner','intermediate','advanced','technical','shark'] };
  var lifeMap = {
    sharks: function(d) { return d.marineLife.sharks >= 3; },
    'manta-rays': function(d) { return d.marineLife.mantaRays >= 3; },
    'whale-sharks': function(d) { return d.marineLife.whaleSharks >= 3; },
    'coral-reefs': function(d) { return d.marineLife.coral >= 4; },
    macro: function(d) { return d.marineLife.macro >= 4; },
    wrecks: function(d) { return d.diveTypes.indexOf('wreck') !== -1; },
    any: function() { return true; },
  };

  function compute() {
    var results = data.filter(function(d) {
      if (month !== null && d.bestMonths.indexOf(month) === -1) return false;
      if (difficulty !== null && diffMap[difficulty] && diffMap[difficulty].indexOf(d.difficulty) === -1) return false;
      if (life !== null && lifeMap[life] && !lifeMap[life](d)) return false;
      return true;
    });
    results.sort(function(a, b) { return b.overallRating - a.overallRating; });
    if (results.length === 0) results = data.sort(function(a, b) { return b.overallRating - a.overallRating; }).slice(0, 6);

    var grid = document.getElementById('results-grid');
    if (!grid) return;
    grid.innerHTML = results.slice(0, 12).map(function(d) {
      return '<a href="/destinations/' + d.slug + '" class="group block bg-white border border-sand-200 hover:border-ocean-300 hover:shadow-md rounded-xl overflow-hidden transition-all">' +
        '<div class="aspect-[3/2] bg-sand-200 overflow-hidden"><img src="' + (d.imageLocal || '/og-default.png') + '" alt="' + d.name + ' scuba diving" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" /></div>' +
        '<div class="p-6">' +
        '<div class="flex items-start justify-between mb-1">' +
        '<h3 class="text-lg font-semibold text-navy-900">' + d.name + '</h3>' +
        '<span class="text-amber-400 text-sm font-semibold">' + d.overallRating + '</span></div>' +
        '<p class="text-xs text-navy-500 mb-2">' + d.country + '</p>' +
        '<div class="grid grid-cols-3 gap-2 text-xs mb-3">' +
        '<div class="text-navy-500">Vis <span class="text-navy-800 font-medium block">' + d.visibilityMeters + 'm</span></div>' +
        '<div class="text-navy-500">Temp <span class="text-navy-800 font-medium block">' + d.waterTempCelsius + '°C</span></div>' +
        '<div class="text-navy-500">Cost <span class="text-navy-800 font-medium block">$' + d.averageDailyCostUsd + '</span></div></div>' +
        '<p class="text-sm text-navy-600 leading-relaxed line-clamp-2">' + d.tagline + '</p>' +
        '</div></a>';
    }).join('');

    var subtitle = document.getElementById('results-subtitle');
    if (subtitle) subtitle.textContent = results.length + ' destinations matched your preferences';

    document.querySelectorAll('.finder-step').forEach(function(s) { s.classList.add('hidden'); });
    var resultsDiv = document.getElementById('results');
    if (resultsDiv) resultsDiv.classList.remove('hidden');
  }

  document.querySelectorAll('.finder-month-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      month = parseInt(this.dataset.month || '0');
      document.querySelectorAll('.finder-month-btn').forEach(function(b) { b.classList.remove('bg-ocean-500','text-white','border-ocean-500'); b.classList.add('bg-white','text-navy-900','border-sand-200'); });
      this.classList.remove('bg-white','text-navy-900','border-sand-200');
      this.classList.add('bg-ocean-500','text-white','border-ocean-500');
      document.getElementById('step-1').classList.add('hidden');
      document.getElementById('step-2').classList.remove('hidden');
    });
  });

  var skipBtn = document.querySelector('.finder-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', function() {
      month = null;
      document.getElementById('step-1').classList.add('hidden');
      document.getElementById('step-2').classList.remove('hidden');
    });
  }

  document.querySelectorAll('.finder-diff-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      difficulty = this.dataset.diff || null;
      document.getElementById('step-2').classList.add('hidden');
      document.getElementById('step-3').classList.remove('hidden');
    });
  });

  document.querySelectorAll('.finder-life-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      life = this.dataset.life || null;
      compute();
    });
  });

  document.querySelectorAll('.finder-back-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var parent = this.parentElement;
      parent.classList.add('hidden');
      if (parent.id === 'step-3') document.getElementById('step-2').classList.remove('hidden');
      if (parent.id === 'step-2') document.getElementById('step-1').classList.remove('hidden');
    });
  });

  var restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      month = null; difficulty = null; life = null;
      document.getElementById('results').classList.add('hidden');
      document.getElementById('step-1').classList.remove('hidden');
      document.querySelectorAll('.finder-month-btn').forEach(function(b) { b.classList.remove('bg-ocean-500','text-white','border-ocean-500'); b.classList.add('bg-white','text-navy-900','border-sand-200'); });
      document.querySelectorAll('.finder-diff-btn').forEach(function(b) { b.classList.remove('bg-ocean-500','text-white'); b.classList.add('bg-white','text-navy-900','border-sand-200'); });
    });
  }
})();
