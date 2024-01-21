// 東京
// let lat = 35.7100069; // 緯度
// let lng = 139.8108103; // 経度

//栃木
let lat = 36.565912;
let lng = 139.883592;

let zoom = 16; 

// 地図の生成
let map = L.map("map"); 
map.setView([lat, lng], zoom); 

// タイルレイヤを生成し、地図に追加
// OpenStreetMapを表示
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
  {
    // 著作物の表示
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }

).addTo(map);


fetch("./data/P29-21_09.geojson")
  .then(response => response.json())
  // GeoJSONを地図に追加
  .then(data => {
        var maxDistance = 2;
        var clustered = turf.clustersDbscan(data, maxDistance); //DBSCANを実行
        var cluster_size = 100;

        const color_array = ['aqua', 'blue', 'fuchsia', 'gray', 'yellow',
                             'green', 'lime', 'maroon', 'navy', 'olive',
                             'purple', 'red', 'silver', 'teal', 'white'];

        // 各クラスターをマーカーで表示
        for (let i = 0; i < cluster_size; i++) {
            L.geoJSON(clustered.features.filter(feature => feature.properties.cluster === i), {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: color_array[i % 15],
                        color: color_array[i % 15],
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                },
              
                onEachFeature: function(feature, layer){
                  // 名前を取得
                  let name = feature.properties.P29_004;
                  // ポップアップに名前を表示
                  layer.bindPopup(name);
                }
            }).addTo(map);
        }

        // ノイズをマーカーで表示
        L.geoJSON(clustered.features.filter(feature => feature.properties.dbscan === 'noise'), {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: 'black',
                    color: 'black',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },

            onEachFeature: function(feature, layer){
              // 名前を取得
              let name = feature.properties.P29_004;
              // ポップアップに名前を表示
              layer.bindPopup(name);
            }

        }).addTo(map);
    });

