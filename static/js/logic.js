let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

function onEachFeature(feature, layer) {
  layer.bindPopup(`<h3>${feature.properties.title}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Mag: ${feature.properties.mag}, Depth: ${feature.geometry.coordinates[2]}</p>`);
}
d3.json(queryUrl).then(function (data) {
  console.log(data.features);

  d3.json(url2).then(function (data2) {
    createMap(data, data2);
  });
});

function markerSize(magnitude) {
  let radius = magnitude * 20000;

  if (magnitude === 0) {
    radius = 40;
  }

  return radius;
}

function markerColor(magnitude) {
  let color = "#780000";
  if (magnitude <= 10) {
    color = "#00f965";
  } else if (magnitude <= 30) {
    color = "#00ac46";
  } else if (magnitude <= 50) {
    color = "#fdc500";
  } else if (magnitude <= 70) {
    color = "#fd8c00";
  } else if (magnitude <= 90) {
    color = "#dc0000";
  } else {
    color = "#780000";
  }

  return color;
}


// base layer
function createMap(data, data2) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// overplay layer 

let earthquakeLayer = L.geoJSON(data.features, {
  onEachFeature: onEachFeature
});

let tectonicLayer = L.geoJSON(data2, { color: "blue", weight: 2 });

let earthquakeCircles = [];

for (let i = 0; i < data.features.length; i++) {
  let earthquake = data.features[i];

  let location = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]];
   
  
  //marker radius

  let earthquakeCircle = L.circle(location, {
    stroke: false,
    fillOpacity: 0.75,
    color: markerColor(earthquake.geometry.coordinates[2]),
    weight: 7,
    fillColor: markerColor(earthquake.geometry.coordinates[2]),
    radius: markerSize(earthquake.properties.mag)
  }).bindPopup(`<h3>${earthquake.properties.title}</h3><hr><p>${new Date(earthquake.properties.time)}</p><hr><p>Mag: ${earthquake.properties.mag}, Depth: ${earthquake.geometry.coordinates[2]}</p>`);

  earthquakeCircles.push(earthquakeCircle);
}

let circleLayer = L.layerGroup(earthquakeCircles);

// control layer
let baseMaps = {
  "Street Map": street,
  "Topographic Map": topo
};

let overlayMaps = {
  "Earthquake Markers": earthquakeLayer,
  "Earthquake Circles": circleLayer,
  "Tectonic Plates": tectonicLayer
};

let newMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 3
 
});
L.control.layers(baseMaps, overlayMaps).addTo(newMap);

let legend = L.control({
  position: "bottomright"
});
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  div.innerHTML += "<div><b>Legend</b></div>";

  div.innerHTML += "<i style='background: #00f965'></i> -10-10<br>";
  div.innerHTML += "<i style='background: #00ac46'></i> 10-30<br>";
  div.innerHTML += "<i style='background: #fdc500'></i> 30-50<br>";
  div.innerHTML += "<i style='background: #fd8c00'></i> 50-70<br>";
  div.innerHTML += "<i style='background: #dc0000'></i> 70-90<br>";
  div.innerHTML += "<i style='background: #780000'></i> 90+<br>";

  return div
}
legend.addTo(newMap);
}