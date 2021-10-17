// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).get(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><`);
  }

  // Circle size
  function circleSize(mag) {
    return mag * 12000;
  }

  // Cirle color by Depth
  function circleColor(depth) {
    if (depth <= 5) {
      return "#DEF7BC"
    }
    else if (depth <= 10) {
      return "#C9DFAA"
    }
    else if (depth <= 20) {
      return "#ADBF93"
    }
    else if (depth <= 30) {
      return "#8C9B77"
    }
    else if (depth <= 40) {
      return "#758164"
    }
    else if (depth <= 50) {
      return "#4C5442"
    }
    else if (depth <= 60) {
      return "#363B2F"
    }
    else {
      return "#050504"
    }
  }
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: circleSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.geometry.coordinates[2]),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });



  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {
  
  // Create the layers.
  var satellite = L.tileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token={token}', {
    attribution: "Map data &copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    id: "mapbox.country-boundaries-v1",
    token: API_KEY
  });

  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={token}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v9',
    token: API_KEY
  });

  var outdoors = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
 

  // Create a baseMaps object.
  var baseMaps = {
    "Satellite": satellite,
    "<span style='color: gray'>Grayscale</span>": grayscale,
    "Outdoors": outdoors
  };

  // variable for the plates
  var plates = new L.LayerGroup();

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };
  // Query to retrieve the plates data
  var platesQuery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  // Create the plates and add them to the plates layer
  d3.json(platesQuery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "red", fill: 0}
      }
    }).addTo(plates)
  })

  // Create our map, giving it the streetmap, earthquakes, and plates layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellite, earthquakes, grayscale, plates]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var labels = ["Depth of the earthquake", "less than or equal to 5", "6-10", "11-20", "21-30","31-40","41-50", "51-60", "61 or greater"];
    var colorscale = ["transparent", "#DEF7BC", "#C9DFAA", "#ADBF93", "#8C9B77", "#758164", "#4C5442", "#363B2F","#050504"];
    title=`<fieldset style ="background: transparent">`;
    var infoLine = ''
    for(var i = 0; i < colorscale.length; i++) {
      infoLine +=`<fieldset style="background:${colorscale[i]}; padding: 5px"><b>
      ${labels[i]}<b></fieldset>`;
    };
    div.innerHTML = title + infoLine + "</fieldset>"
    return div
    

  };
  legend.addTo(myMap); 




  
}




