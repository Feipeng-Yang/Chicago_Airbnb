
// Create the tile layer for satellite map
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
});

// Create the tile layer for default map
var defaultmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
});


// Initialize the listing layer and neighbourhoods layer
var layers = {
  listings: new L.LayerGroup(),
  crimesmap: new L.LayerGroup()
};

// Create a baseMaps object to hold the Map layers
var baseMaps = {
  "Default": defaultmap,
  "Satellite": satellitemap
};

// Create an overlayMaps object to hold the Crimes layer
// Crimes data from: https://data.cityofchicago.org/Public-Safety/Crimes-2021/dwme-t96c
var overlayMaps = {
  "Crimes": layers.crimesmap
};

// Create the map object with options
var myMap = L.map("map", {
  center: [41.881832, -87.643177],
  zoom: 12,
  layers: [defaultmap, layers.listings]
});

// Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);



// Grab the listing data with d3 and add to the listing layer
d3.csv("/static/data/listings.csv").then(function(response) {
  // console.log(response);
  // Create a new marker cluster group
  var markers = L.markerClusterGroup();

  // Loop through data
  for (var i = 0; i < response.length; i++) {

    // Set the data location property to a variable
    var latitude = response[i].latitude;
    var longitude = response[i].longitude;

    // Check for location property
    if (latitude) {
      // Add a new marker to the cluster group and bind a pop-up, add to listings layer
      markers.addLayer(L.marker([latitude, longitude])
        .bindPopup(`${response[i].name}<br>Price: ${response[i].price}<br>Host: ${response[i].host_name}`))   // bind a pop-up
        .addTo(layers.listings);    // add to listing layer 
    };
  };
});

// Grab the Crimes data with d3 and add to the crimes layer
d3.csv("/static/data/Crimes_2021.csv").then(function(response) {

  // console.log(response);

  var heatArray = [];

  for (var i = 0; i < response.length; i++) {
    var latitude = response[i].Latitude;
    var longitude = response[i].Longitude;

    if (latitude && longitude) {
      heatArray.push([latitude, longitude]);
    }
  }

  var heat = L.heatLayer(heatArray, {
    radius: 6,
    blur: 10
  }).addTo(layers.crimesmap);

});