/**
 * explore.js - 高德地图交互逻辑
 */

let map;
let placeSearch;
let currentMarkers = [];

// 初始化地图
function initMap() {
    map = new AMap.Map('map-container', {
        zoom: 13,
        center: [116.397428, 39.90923], // 默认北京
        viewMode: '3D'
    });

    // 初始化搜索插件
    AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete', 'AMap.Geolocation'], function() {
        placeSearch = new AMap.PlaceSearch({
            pageSize: 10,
            pageIndex: 1,
            city: '全国',
            map: map,
            panel: '', // 不显示面板
            autoFitView: true
        });

        const autoOptions = {
            input: "search-input"
        };
        const autoComplete = new AMap.AutoComplete(autoOptions);

        autoComplete.on("select", function(e) {
            searchLocation(e.poi.name);
        });

        // 初始化定位
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            offset: [10, 20],
            zoomToAccuracy: true,
            position: 'RB'
        });

        map.addControl(geolocation);

        // 默认获取定位并搜索周边
        geolocation.getCurrentPosition(function(status, result) {
            if (status === 'complete') {
                searchNearby(result.position);
            } else {
                console.error('定位失败', result);
                // 定位失败则搜索默认位置周边
                searchNearby(map.getCenter());
            }
        });

        // 绑定定位按钮
        document.getElementById('locate-btn').addEventListener('click', () => {
            geolocation.getCurrentPosition();
        });
    });

    // 搜索按钮逻辑
    document.getElementById('search-btn').addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        if (query) {
            searchLocation(query);
        }
    });
}

// 搜索特定位置
function searchLocation(query) {
    placeSearch.search(query, (status, result) => {
        if (status === 'complete' && result.poiList) {
            updateAttractionsList(result.poiList.pois);
        }
    });
}

// 搜索周边景点
function searchNearby(center) {
    placeSearch.searchNearBy('风景名胜', center, 5000, (status, result) => {
        if (status === 'complete' && result.poiList) {
            updateAttractionsList(result.poiList.pois);
        }
    });
}

// 更新下方景点列表卡片
function updateAttractionsList(pois) {
    const listContainer = document.getElementById('attractions-list');
    listContainer.innerHTML = '';

    pois.forEach(poi => {
        const card = document.createElement('a');
        card.href = `detail.html?id=${poi.id}`;
        card.className = "flex h-full flex-col gap-3 rounded-xl min-w-[240px] w-[240px] shrink-0 bg-white/80 dark:bg-[#1c2724]/80 backdrop-blur-sm p-3 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]";
        
        // 使用高德提供的图片，如果没有则使用占位图
        const photoUrl = poi.photos && poi.photos.length > 0 ? poi.photos[0].url : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=225&fit=crop';
        const distance = poi.distance ? `${(poi.distance / 1000).toFixed(1)} km away` : 'Nearby';

        card.innerHTML = `
            <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col" style="background-image: url('${photoUrl}');"></div>
            <div>
              <p class="text-gray-900 dark:text-white text-base font-bold leading-normal truncate">${poi.name}</p>
              <p class="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">${distance}</p>
            </div>
        `;

        card.addEventListener('click', (e) => {
            // 如果只是想在地图上中心化，不跳转详情页，可以取消下面注释
            // e.preventDefault();
            // map.setCenter(poi.location);
            // map.setZoom(16);
        });

        listContainer.appendChild(card);
    });
}

// 页面加载完成后初始化
window.onload = initMap;
