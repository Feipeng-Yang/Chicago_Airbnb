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


// Initialize the listing layer and crime layer
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

//--------------------------- filter listing data ---------------------

// Select the button
var button = d3.select("#filter-btn");

// Select the form
var form = d3.select("#form");

// Create event handlers 
button.on("click", runEnter);
form.on("submit",runEnter);


// Complete the event handler function for the form
function runEnter() {

  // Prevent the page from refreshing
  // d3.event.preventDefault();

  // Select the input element and get the raw HTML node
  // var inputElement = d3.select("#datetime");

  // Get the value property of the input element ---------date----
  var inputPriceMin = d3.select("#pricemin").property("value");
  // Get the value property of the input element ---------date----
  var inputPriceMax = d3.select("#pricemax").property("value");

  // Grab the listing data with d3 and add to the listing layer
  d3.csv("/static/data/listings.csv").then(function(response) {
    // console.log(response);
    // console.log(inputPriceMin);
    // console.log(inputPriceMax);

    // // filter the data base on price min and max from the input
    if (inputPriceMin) {
      response = response.filter(o => o.price >= inputPriceMin);
    };
    if (inputPriceMax) {
      response = response.filter(o => o.price <= inputPriceMax);
    };
    // console.log(response);

    // Clear exsiting layer of markers
    layers.listings.clearLayers(markers);

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
          .bindPopup(`${response[i].name}<br>Price: ${response[i].price}<br>Neighbourhood: ${response[i].neighbourhood}
          <br>Room Type: ${response[i].room_type}`))   // bind a pop-up
          .addTo(layers.listings);    // add to listing layer 
      };
    };
  });
};

runEnter();




// Grab the listing data with d3 and add to the listing layer
// d3.csv("/static/data/listings.csv").then(function(response) {
//   // console.log(response);
//   // Create a new marker cluster group
//   var markers = L.markerClusterGroup();

//   // Loop through data
//   for (var i = 0; i < response.length; i++) {

//     // Set the data location property to a variable
//     var latitude = response[i].latitude;
//     var longitude = response[i].longitude;

//     // Check for location property
//     if (latitude) {
//       // Add a new marker to the cluster group and bind a pop-up, add to listings layer
//       markers.addLayer(L.marker([latitude, longitude])
//         .bindPopup(`${response[i].name}<br>Price: ${response[i].price}<br>Neighbourhood: ${response[i].neighbourhood}`))   // bind a pop-up
//         .addTo(layers.listings);    // add to listing layer 
//     };
//   };
// });