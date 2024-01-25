         var nearestLayer;
         var selectedSchoolType = null;
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
Promise.all(geojsonUrls.map(url => fetch(url).then(resp => resp.json())))
    .then(data => {
        allGeojsonData = data;
        combinedFeatureCollection = mergeGeoJSONData(allGeojsonData);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

function findNearestSchool(schoolType) {
    if (!lastClickedLocation || !combinedFeatureCollection) {
        return null;
    }

    const filteredFeatures = combinedFeatureCollection.features.filter(feature => 
        feature.properties.P29_004.includes(schoolType));

    if (filteredFeatures.length === 0) {
        return null; // No matching schools found
    }

    const filteredCollection = turf.featureCollection(filteredFeatures);
    const clickedPoint = turf.point([lastClickedLocation.lng, lastClickedLocation.lat]);
    return turf.nearestPoint(clickedPoint, filteredCollection);
}

function updateDisplayWithNearestSchool(nearestSchool) {
    var nearestDisplayElement = document.getElementById('nearestLocationDisplay');
    var coordinatesDisplayElement = document.getElementById('coordinatesDisplay');
    var distanceDisplayElement = document.getElementById('distanceDisplay');

    if (nearestSchool) {
        nearestDisplayElement.textContent = 'Nearest location: ' + nearestSchool.properties.P29_004;

        // Display the coordinates
        const coords = nearestSchool.geometry.coordinates;
        coordinatesDisplayElement.textContent = 'Coordinates: ' + coords[1].toFixed(5) + ', ' + coords[0].toFixed(5);

        // Calculate and display the distance
        const clickedPoint = turf.point([lastClickedLocation.lng, lastClickedLocation.lat]);
        const distance = turf.distance(clickedPoint, nearestSchool, { units: 'kilometers' });
        distanceDisplayElement.textContent = 'Distance: ' + distance.toFixed(2) + ' km';

        // Create a GeoJSON layer for the nearest point and add it to the map
        if (nearestLayer) {
            mymap.removeLayer(nearestLayer);
        }
        nearestLayer = L.geoJson(nearestSchool).addTo(mymap);

    } else {
        nearestDisplayElement.textContent = 'Nearest location found, but no specific name available';
        coordinatesDisplayElement.textContent = '';
        distanceDisplayElement.textContent = '';
    }
}

function handleSchoolTypeButtonClick(schoolType, displayText) {
    selectedSchoolType = schoolType;
    
    // Update the display with the school type text
    var schoolTypeDisplayElement = document.getElementById('selectedSchoolTypeDisplay');
    schoolTypeDisplayElement.textContent = displayText;

    const nearestSchool = findNearestSchool(schoolType);
    updateDisplayWithNearestSchool(nearestSchool);
}

// Attach event listeners to buttons
document.getElementById('kindergarten').onclick = () => handleSchoolTypeButtonClick('幼稚園', 'Kindergarten');
document.getElementById('elementary').onclick = () => handleSchoolTypeButtonClick('小学校', 'Elementary School');
document.getElementById('middleSchool').onclick = () => handleSchoolTypeButtonClick('中学校', 'Middle School');
document.getElementById('highSchool').onclick = () => handleSchoolTypeButtonClick('高等学校', 'High School');
document.getElementById('university').onclick = () => handleSchoolTypeButtonClick('大学', 'University');

// Existing JavaScript code...
document.getElementById('saveLocation').onclick = function() {
    if (!selectedSchoolType) {
        alert("Please select a school type to see the location.");
        return;
    }

    // Remove the nearest marker if it exists
    if (nearestLayer) {
        mymap.removeLayer(nearestLayer);
        nearestLayer = null;
    }

    const nearestSchool = findNearestSchool(selectedSchoolType);
    updateDisplayWithNearestSchool(nearestSchool);
};

document.getElementById('setLocation').onclick = function() {
    var lat = parseFloat(document.getElementById('latitude').value);
    var lng = parseFloat(document.getElementById('longitude').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        lastClickedLocation = { lat: lat, lng: lng };
        marker.setLatLng(lastClickedLocation).update();
        mymap.setView(lastClickedLocation, 15);

        // Clear the input fields
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';

        // Optional: Find and display nearest school if a type is selected
        if (selectedSchoolType) {
            const nearestSchool = findNearestSchool(selectedSchoolType);
            updateDisplayWithNearestSchool(nearestSchool);
        }
    } else {
        alert("Please enter valid latitude and longitude values.");
    }
};
