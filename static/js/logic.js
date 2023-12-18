let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
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

    // for each earthquake in the earthquake data
    earthquakeData.forEach(quake=>{
        //add to quakeMarkers array
        quakeMarkers.push(
            //create a circle at the coords of the earthquake (lon, lat)
            L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
                //detemine color using colorFinder function
                color: colorFinder(quake.geometry.coordinates[2]),
                fillColor: colorFinder(quake.geometry.coordinates[2]),
                fillOpacity: 0.5,
                //determine radius using radius finder
                radius: radiusFinder(quake.properties.mag)
            //add a popup with the title and date
            }).bindPopup(`<h3>${quake.properties.title}</h3><hr><p>Time: ${new Date(quake.properties.time)}, Depth: ${quake.geometry.coordinates[2]}</p>`)
        )
    })
    //create layer group with all of the quake markers
    let quakeLayer = L.layerGroup(quakeMarkers);
    //call create map
    createMap(quakeLayer);
}

function createMap(quakes){
    let light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let cartoDBPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.carto.com/attributions">CartoDB</a> contributors'
    });

    let cartoDBDarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.carto.com/attributions">CartoDB</a> contributors'
    });

    // Create a baseMaps object to hold the lightmap layer.
    let baseMaps = {
        "Street Map": light,
        "Topographic Map": topo,
        "Carto DB positron": cartoDBPositron,
        "Carto DB darkmatter": cartoDBDarkMatter
    };

    // Create an overlayMaps object to hold the bikeStations layer.
    let overlayMaps = { 
        "Quakes": quakes
    };

    // Create the map object with options.
    let myMap = L.map("map", {
        center: scCoords,
        zoom: 6,
        maxBounds: L.latLngBounds([90, -180], [-90, 180]),
        maxBoundsViscosity: 0.95,
        layers: [light, quakes]
    });

    d3.json(plateUrl).then(function (plateData) {
        // Pass on the plate data to the create layer function
        createPlateLayer(plateData);
    });

    //separate function for plate layer as it is using data found by D3
    function createPlateLayer(plateData) {
        //create a geojson layer using the plate data
        let plateLayer = L.geoJSON(plateData, {
            style: function (feature) {
                return {
                    color: "orange",
                    weight: 2
                };
            }
        }).addTo(myMap);

        //add layer we just created to the layer control
        overlayMaps["Tectonic Plates"] = plateLayer;
    
        // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: true
        }).addTo(myMap);
    }

    // Create the legend
    var legend = L.control({position: "bottomright"});
    //when the legend is added to the map
    legend.onAdd = function() {
        //create html object
        var div = L.DomUtil.create("div", "info legend"),
        //variables for each depth
        depthRanges = [-10, 10, 30, 50, 70, 90];

        // Add a white background box
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';

        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

        // for each depth
        depthRanges.forEach(depth=>{
            // if its not the last depth (format will be different)
            if (depth != 90){
                //add from range depth to next depth, with appropriate color
                div.innerHTML += '<i style="background:' + colorFinder(depth+20) + '; width: 20px; height: 20px; display: inline-block;"></i> ' + depth + '&ndash;' + (depth+20) + '<br>' 
            //if its the last depth
            }else{
                // add last depth and a + symbol
                div.innerHTML += '<i style="background:' + colorFinder(depth+20) + '; width: 20px; height: 20px; display: inline-block;"></i> ' + depth + '+';
            }
        })

        return div;
    };
    legend.addTo(myMap);
}

d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });