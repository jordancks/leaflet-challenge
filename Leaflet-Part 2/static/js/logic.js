// Create the map object centered on the world
var myMap = L.map("map", {
    center: [0, 0],
    zoom: 2
});

// Define the Street Map and Topographic Map tile layers
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
});

var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> contributors'
});

// Add the street map by default
streetMap.addTo(myMap);

// Define base maps object to hold Street and Topographic maps
var baseMaps = {
    "Street Map": streetMap,
    "Topographic Map": topoMap
};

// Function to determine the size of the marker based on earthquake magnitude
function markerSize(magnitude) {
    return magnitude * 4;  // Adjust size multiplier as needed
}

// Function to determine the color of the marker based on earthquake depth
function markerColor(depth) {
    if (depth > 90) return "#ff5f65";
    else if (depth > 70) return "#fca35d";
    else if (depth > 50) return "#fdb72a";
    else if (depth > 30) return "#f7db11";
    else if (depth > 10) return "#dcf400";
    else return "#a3f600";
}

// Load the earthquake data from USGS
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

    // Create the earthquake layer
    var earthquakes = L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),  // Size of the marker based on magnitude
                fillColor: markerColor(feature.geometry.coordinates[2]),  // Color based on depth
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>Magnitude: " + feature.properties.mag + 
                "<br>Depth: " + feature.geometry.coordinates[2] + " km</p>");
        }
    });

    // Add the earthquake layer to the map
    earthquakes.addTo(myMap);

    // Load tectonic plates data
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {

        // Create tectonic plates layer
        var tectonicPlates = L.geoJson(plateData, {
            style: function() {
                return { color: "orange", weight: 2 };  // Style for tectonic plates
            }
        });

        // Add tectonic plates layer to the map
        tectonicPlates.addTo(myMap);

        // Create overlays object for layer control
        var overlays = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": tectonicPlates
        };

        // Add layer control to the map
        L.control.layers(baseMaps, overlays, {
            collapsed: false
        }).addTo(myMap);

        /// Add a colored legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend"),
        depths = [-10, 10, 30, 50, 70, 90],
        colors = [
            "#a3f600",  // Depth < 10 km
            "#dcf400",  // Depth 10–30 km
            "#f7db11",  // Depth 30–50 km
            "#fdb72a",  // Depth 50–70 km
            "#fca35d",  // Depth 70–90 km
            "#ff5f65"   // Depth > 90 km
        ];

    // Loop through depth intervals and generate a label with a colored square for each interval
    div.innerHTML = "<h4>Depth (km)</h4>";
    for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }
    return div;
};

legend.addTo(myMap);
    });
});