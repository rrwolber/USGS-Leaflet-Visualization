 // Define a markerSize function that will give each city a different radius based on its population
function markerSize(magnitude) {
    var size = magnitude*10000;
    return size;
};

// Define function that assigns color based on magnitude
function color(magnitude) {
    return magnitude > 5 ? "Red":
           magnitude > 4 ? "OrangeRed":
           magnitude > 3 ? "GoldenRod":
           magnitude > 2 ? "Gold":
           magnitude > 1 ? "GreenYellow":
                           "LightGreen";
};

    var plates = [];

d3.json("static/PB2002_boundaries.json", function createBoundaries(response) {

    var plateline;
    var platepoint;
    var feature = response.features;

    for(var i = 0; i < feature.length; i++) {
        var plateline = []
        for(j = 0; j < feature[i].geometry.coordinates.length; j++) {
            var pointset = feature[i].geometry.coordinates[j];
            platepoint = [pointset[1],pointset[0]]
            plateline.push(platepoint)}
        plates.push(L.polyline(plateline,
            {
                color: "yellow"
            }
        
        ))};
    })



d3.json("static/Quakes_30Days.json", function createMarkers(data) {

    var feature = data.features;
    var quakeMarkers = [];
    var mark;

    for(var i = 0; i < feature.length; i++) {
        var earthquake = feature[i].properties;
        var coordinates = feature[i].geometry.coordinates;
            mark = L.circle([parseFloat(coordinates[1]),parseFloat(coordinates[0])],
                {
                    fillColor: color(earthquake.mag),
                    fillOpacity: 0.5,
                    radius: markerSize(earthquake.mag),
                    stroke: false
                }
            )
            quakeMarkers.push(mark)
    }
    createMap(L.layerGroup(quakeMarkers));
})


function createMap(quakeMarkers) {

  // create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ");

  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnJ3b2xiZXIiLCJhIjoiY2pkd2drY203MDVtbzJ3bzF2NXUxdnNqayJ9.vzgFq7GgYJFYIJoCWDyu7g");

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnJ3b2xiZXIiLCJhIjoiY2pkd2drY203MDVtbzJ3bzF2NXUxdnNqayJ9.vzgFq7GgYJFYIJoCWDyu7g")

  var plateMarkers = L.layerGroup(plates)

  var baseMaps = {
    "Satellite" : satellite,
    "Outdoor": outdoors,
    "Greyscale": lightmap
  };

  // create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Earthquakes": quakeMarkers,
    "Plate Boundaries": plateMarkers
  };

  // Create the map object with options
  var myMap = L.map("map", {
    center: [40.73, -130],
    zoom: 4,
    layers: [satellite, quakeMarkers, plateMarkers]
  });


  // create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      // this.update();
      return this._div;
  };
  
  info.addTo(myMap);
  
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + color(grades[i]) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}
