/**
 * explore.js - 高德地图交互逻辑
 */

let map;
let placeSearch;
let geolocation;
let currentMarkers = [];

// 初始化地图
function initMap() {
    console.log('Initializing AMap...');
    const container = document.getElementById('map-container');
    
    // 设置一个超时检查
    const loadTimeout = setTimeout(() => {
        if (container && container.innerHTML === '') {
            container.innerHTML = `<div style="padding:100px;color:white;text-align:center;background:#10221d;height:100vh;">
                地图加载超时。这通常是由于 API Key 无效、安全密钥配置错误或网络问题导致的。<br>
                请确保您的 Key 和安全密钥在 explore.html 中配置正确。
            </div>`;
        }
    }, 5000);

    if (typeof AMap === 'undefined') {
        clearTimeout(loadTimeout);
        const errorMsg = '高德地图脚本 (AMap) 未能加载。请检查您的 API Key 是否有效，或者网络是否正常。';
        console.error(errorMsg);
        if (container) container.innerHTML = `<div style="padding:100px;color:white;text-align:center;background:#10221d;height:100vh;">${errorMsg}</div>`;
        return;
    }

    try {
        console.log('Creating Map instance...');
        // 创建地图
        map = new AMap.Map('map-container', {
            zoom: 11,
            center: [116.397428, 39.90923],
            viewMode: '3D',
            mapStyle: 'amap://styles/normal', // 恢复为浅色标准模式
            expandZoomRange: true
        });

        // 立即尝试强制刷新一次尺寸
        setTimeout(() => {
            if (map) map.setFitView();
        }, 1000);

        map.on('complete', function() {
            console.log('地图加载完成');
            clearTimeout(loadTimeout);
            container.style.backgroundColor = 'transparent'; // 加载成功后移除背景色
        });

        map.on('error', function(err) {
            console.error('地图加载错误:', err);
        });

        map.on('complete', function() {
            console.log('Map load complete');
        });

        // 加载插件
        AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete', 'AMap.Geolocation'], function() {
            // 1. 初始化搜索服务
            placeSearch = new AMap.PlaceSearch({
                pageSize: 15,
                pageIndex: 1,
                city: '全国',
                map: null, // 不自动在地图上绘制 Marker
                autoFitView: true,
                extensions: 'all' // 获取详细信息，包括图片
            });

            // 2. 初始化输入提示
            const autoComplete = new AMap.AutoComplete({
                input: "search-input"
            });

            autoComplete.on("select", function(e) {
                if (e.poi && e.poi.name) {
                    document.getElementById('search-input').value = e.poi.name;
                    searchLocation(e.poi.name);
                }
            });

            // 3. 初始化定位
            geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,
                timeout: 10000,
                offset: [20, 20],
                zoomToAccuracy: true,
                position: 'RB',
                buttonOffset: new AMap.Pixel(10, 20),
                showButton: false // 我们自己写了定位按钮
            });

            map.addControl(geolocation);

            // 初始定位并搜索
            performInitialLocation();
        });

        // 绑定搜索框回车搜索
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                if (query) searchLocation(query);
            }
        });

        // 绑定定位按钮
        document.getElementById('locate-btn').addEventListener('click', () => {
            console.log('Locating...');
            geolocation.getCurrentPosition((status, result) => {
                if (status === 'complete') {
                    console.log('Location success', result.position);
                    searchNearby(result.position);
                } else {
                    console.error('Location failed', result);
                    alert('定位失败，请检查浏览器权限');
                }
            });
        });

    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function performInitialLocation() {
    geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
            console.log('Initial location success');
            searchNearby(result.position);
        } else {
            console.warn('Initial location failed, using default center');
            searchNearby(map.getCenter());
        }
    });
}

// 搜索特定位置
function searchLocation(query) {
    console.log('Searching for:', query);
    if (!placeSearch) return;
    
    placeSearch.search(query, (status, result) => {
        if (status === 'complete' && result.poiList) {
            updateAttractionsList(result.poiList.pois);
            // 手动调整视角到搜索结果
            if (result.poiList.pois.length > 0) {
                const firstPoi = result.poiList.pois[0];
                map.setCenter(firstPoi.location);
                map.setZoom(14);
            }
        } else {
            console.warn('Search returned no results or error', status, result);
        }
    });
}

// 搜索周边景点
function searchNearby(center) {
    console.log('Searching nearby:', center);
    if (!placeSearch) return;

    placeSearch.searchNearBy('风景名胜', center, 5000, (status, result) => {
        if (status === 'complete' && result.poiList) {
            updateAttractionsList(result.poiList.pois);
        } else {
            console.warn('Nearby search returned no results', status);
        }
    });
}

// 更新下方景点列表卡片
function updateAttractionsList(pois) {
    const listContainer = document.getElementById('attractions-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';

    pois.forEach(poi => {
        const card = document.createElement('div');
        card.className = "flex h-full flex-col gap-3 rounded-xl min-w-[240px] w-[240px] shrink-0 bg-white/90 dark:bg-[#1c2724]/90 backdrop-blur-md p-3 shadow-xl cursor-pointer transition-all hover:scale-[1.05] hover:shadow-2xl active:scale-95";
        
        const photoUrl = poi.photos && poi.photos.length > 0 ? poi.photos[0].url : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=225&fit=crop';
        const distance = poi.distance ? `${(poi.distance / 1000).toFixed(1)} km away` : 'Nearby';

        card.innerHTML = `
            <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style="background-image: url('${photoUrl}');"></div>
            <div class="flex flex-col gap-1">
              <p class="text-gray-900 dark:text-white text-base font-bold leading-tight truncate">${poi.name}</p>
              <div class="flex items-center gap-1 text-primary">
                <span class="material-symbols-outlined text-sm">distance</span>
                <p class="text-sm font-medium">${distance}</p>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-xs truncate">${poi.address || ''}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            // 跳转到详情页
            window.location.href = `detail.html?id=${poi.id}&name=${encodeURIComponent(poi.name)}`;
        });

        listContainer.appendChild(card);
    });
}

// 启动
if (document.readyState === 'complete') {
    initMap();
} else {
    window.addEventListener('load', initMap);
}
