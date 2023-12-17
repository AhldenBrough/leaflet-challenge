let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let scCoords = [37.503731, -122.264931];

function colorFinder(depth){
    let color = "#341bf5";
    switch (true){
        case(depth > 90):
            color = "#f51b1b";
            break;
        case(depth >= 70):
            color = "#f51b59";
            break;
        case(depth >= 50):
            color = "#f51b88";
            break;
        case(depth >= 30):
            color = "#f51bb7";
            break;
        case(depth > 10):
            color = "#e31bf5";
            break;
    }
    return color;
}


function createFeatures(earthquakeData){
    let quakeMarkers = [];

    function radiusFinder(magnitude){
        return magnitude ** 7
    }

    

    earthquakeData.forEach(quake=>{
        quakeMarkers.push(
            L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
                color: colorFinder(quake.geometry.coordinates[2]),
                fillColor: colorFinder(quake.geometry.coordinates[2]),
                fillOpacity: 0.5,
                radius: radiusFinder(quake.properties.mag)
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
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
        depthRanges = [-10, 10, 30, 50, 70, 90];

        // Add a white background box
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';

        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

        for (var i = 0; i < depthRanges.length; i++) {
            div.innerHTML += '<i style="background:' + colorFinder(depthRanges[i] + 1) + '; width: 20px; height: 20px; display: inline-block;"></i> ' + depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);




}

d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });