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

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };


  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
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




