(function(){
  var mapDiv = document.getElementById('world-map');
  if (!mapDiv) return;
  var data = JSON.parse(mapDiv.dataset.destinations || '[]');
  if (!data.length) return;
  if (typeof L !== 'undefined' && L.map) { initMap(data); }
  else {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = function() { initMap(data); };
    s.onerror = function() { mapDiv.innerHTML = '<p style=\"text-align:center;padding:60px;color:#999\">Map unavailable.</p>'; };
    document.head.appendChild(s);
  }
  function initMap(data) {
    var map = L.map('world-map', { scrollWheelZoom: true, zoomControl: true }).setView([0, 30], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OSM</a>', maxZoom: 12,
    }).addTo(map);
    var markers = [], oceanColors = {
      pacific: '#2e8ab8', indian: '#4da6d1', caribbean: '#1c557e',
      'red-sea': '#c75b3a', atlantic: '#21638f', mediterranean: '#17476a',
    };
    data.forEach(function(d) {
      if (!d.lat || !d.lng) return;
      var color = oceanColors[d.ocean] || '#d96c4a';
      var marker = L.circleMarker([d.lat, d.lng], {
        radius: 7 + d.rating * 1.5,
        fillColor: color, color: '#fff', weight: 1.5, fillOpacity: 0.85,
      }).addTo(map);
      marker.bindPopup('<div style=\"font-family:system-ui,sans-serif;min-width:180px\">' +
        '<strong style=\"font-size:14px\">' + d.name + '</strong><br>' +
        '<span style=\"font-size:12px;color:#555\">' + d.country + '</span><br>' +
        '<span style=\"font-size:12px;color:#d96c4a\">' + '\u2605'.repeat(Math.round(d.rating)) + ' ' + d.rating + '</span><br>' +
        '<a href=\"/destinations/' + d.slug + '\" style=\"font-size:12px;color:#2e8ab8\">View details \u2192</a></div>');
      marker._ocean = d.ocean;
      markers.push(marker);
    });
    document.querySelectorAll('.map-filter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var ocean = this.dataset.ocean;
        document.querySelectorAll('.map-filter').forEach(function(b){ b.classList.remove('bg-ocean-500','text-white'); b.classList.add('bg-navy-700','text-sand-300'); });
        this.classList.remove('bg-navy-700','text-sand-300');
        this.classList.add('bg-ocean-500','text-white');
        markers.forEach(function(m) {
          if (ocean === 'all' || m._ocean === ocean) { if (!map.hasLayer(m)) m.addTo(map); }
          else { if (map.hasLayer(m)) map.removeLayer(m); }
        });
      });
    });
  }
})();
