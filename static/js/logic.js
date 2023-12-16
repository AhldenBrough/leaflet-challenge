let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
let scCoords = [37.503731, -122.264931];
function createFeatures(earthquakeData){
    let quakeMarkers = [];
    earthquakeData.forEach(quake=>{
        quakeMarkers.push(
            L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
                color: "red",
                fillColor: "red",
                fillOpacity: 0.5,
                radius: 10000 
            })
        )
    })
    let quakeLayer = L.layerGroup(quakeMarkers);
    createMap(quakeLayer);
}

function createMap(quakes){
    let light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object to hold the lightmap layer.
    let baseMaps = {
        "lightmap": light
    };

    // Create an overlayMaps object to hold the bikeStations layer.
    let overlayMaps = { 
        "Quakes": quakes
    };

    // Create the map object with options.
    let myMap = L.map("map", {
        center: scCoords,
        zoom: 6,
        layers: [light, quakes]
    });

    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);
    
}

d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });