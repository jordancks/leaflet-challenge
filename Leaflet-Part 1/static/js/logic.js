// Create the map object centered on the world
var myMap = L.map("map", {
    center: [0, 0], // Center over the world
    zoom: 2 // Zoom level appropriate for showing the world
});

// Add a tile layer (the background map image)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(myMap);

// Load the earthquake data from USGS
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

    // Define a function to determine the marker size based on earthquake magnitude
    function markerSize(magnitude) {
        return magnitude * 3;
    }

    // Define a function to determine the marker color based on earthquake depth
    function markerColor(depth) {
        if (depth > 90) return "#ff5f65";
        else if (depth > 70) return "#fca35d";
        else if (depth > 50) return "#fdb72a";
        else if (depth > 30) return "#f7db11";
        else if (depth > 10) return "#dcf400";
        else return "#a3f600";
    }

    // Create a GeoJSON layer
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]), // Depth is the third coordinate
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        // Add popups with earthquake info
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>Magnitude: " + feature.properties.mag + 
                "<br>Depth: " + feature.geometry.coordinates[2] + " km</p>");
        }
    }).addTo(myMap);

    // Add a legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
        depths = [-10, 10, 30, 50, 70, 90],
        colors = [
            "#a3f600", // Depth < 10
            "#dcf400", // Depth 10 - 30
            "#f7db11", // Depth 30 - 50
            "#fdb72a", // Depth 50 - 70
            "#fca35d", // Depth 70 - 90
            "#ff5f65"  // Depth > 90
        ];

    // Create a legend with colored boxes
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