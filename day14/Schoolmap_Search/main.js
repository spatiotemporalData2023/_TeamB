         var nearestLayer;
        var mymap = L.map('mapid').setView([35.66161697606394, 139.36643125161388], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

        var marker = L.marker([35.66161697606394, 139.36643125161388]).addTo(mymap);
        marker.bindPopup('You are here at Tokyo Metropolitan University.').openPopup();

        var lastClickedLocation = null;

        function onMapClick(e) {
            marker.setLatLng(e.latlng)
                  .bindPopup("You clicked the map at " + e.latlng)
                  .openPopup();

            lastClickedLocation = e.latlng;
        }

        mymap.on('click', onMapClick);

        function mergeGeoJSONData(geojsonDataArray) {
            let features = [];
            geojsonDataArray.forEach(geojsonData => {
                features = features.concat(geojsonData.features);
            });
            return turf.featureCollection(features);
        }

        const geojsonUrls = [
            'https://raw.githubusercontent.com/spatiotemporalData2023/_TeamB/main/day14/Schoolmap_Search/data/P29-21_08.geojson',
            'https://raw.githubusercontent.com/spatiotemporalData2023/_TeamB/main/day14/Schoolmap_Search/data/P29-21_09.geojson',
            'https://raw.githubusercontent.com/spatiotemporalData2023/_TeamB/main/day14/Schoolmap_Search/data/P29-21_10.geojson',
            'https://raw.githubusercontent.com/spatiotemporalData2023/_TeamB/main/day14/Schoolmap_Search/data/P29-21_11.geojson',
            'https://raw.githubusercontent.com/spatiotemporalData2023/_TeamB/main/day14/Schoolmap_Search/data/P29-21_12.geojson',
            'https://raw.githubusercontent.com/spatiotemporalData2023/_TeamB/main/day14/Schoolmap_Search/data/P29-21_13.geojson',
            'https://raw.githubusercontent.com/spatiotemporalData2023/_TeamB/main/day14/Schoolmap_Search/data/P29-21_14.geojson'
        ];

        let allGeojsonData = [];
        let combinedFeatureCollection;

        Promise.all(geojsonUrls.map(url => fetch(url).then(resp => resp.json())))
            .then(data => {
                allGeojsonData = data;
                combinedFeatureCollection = mergeGeoJSONData(allGeojsonData);
            })
            .catch(error => console.error('Error loading GeoJSON:', error));

document.getElementById('saveLocation').onclick = function() {
    var displayElement = document.getElementById('locationDisplay');
    var nearestDisplayElement = document.getElementById('nearestLocationDisplay');
    var distanceDisplayElement = document.getElementById('distanceDisplay'); // New element for distance
    var coordinatesDisplayElement = document.getElementById('coordinatesDisplay'); // New element for coordinates

    if (!displayElement || !nearestDisplayElement) {
        console.error('One or more display elements not found!');
        return;
    }

       if (lastClickedLocation && combinedFeatureCollection) {
            displayElement.textContent = 'Saved location: ' + JSON.stringify(lastClickedLocation);

            const clickedPoint = turf.point([lastClickedLocation.lng, lastClickedLocation.lat]);
            const nearest = turf.nearestPoint(clickedPoint, combinedFeatureCollection);

            // Remove existing nearest layer if it exists
            if (nearestLayer) {
                mymap.removeLayer(nearestLayer);
            }

            if (nearest && nearest.properties && 'P29_004' in nearest.properties) {
                nearestDisplayElement.textContent = 'Nearest location: ' + nearest.properties.P29_004;

                // Display the coordinates
                const coords = nearest.geometry.coordinates;
                coordinatesDisplayElement.textContent = 'Coordinates: ' + coords[1].toFixed(5) + ', ' + coords[0].toFixed(5);

                // Calculate and display the distance
                const distance = turf.distance(clickedPoint, nearest, { units: 'kilometers' });
                distanceDisplayElement.textContent = 'Distance: ' + distance.toFixed(2) + ' km';

                // Create a GeoJSON layer for the nearest point and add it to the map
                nearestLayer = L.geoJson(nearest).addTo(mymap);

            } else {
                nearestDisplayElement.textContent = 'Nearest location found, but no specific name available';
                coordinatesDisplayElement.textContent = '';
                distanceDisplayElement.textContent = '';
            }
        } else {
            displayElement.textContent = 'No location selected to save or data not loaded';
            nearestDisplayElement.textContent = '';
            coordinatesDisplayElement.textContent = '';
            distanceDisplayElement.textContent = ''; // Clear the distance display
        }
    };
