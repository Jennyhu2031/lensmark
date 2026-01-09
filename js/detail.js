/**
 * detail.js - 获取并展示景点详情
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const poiId = urlParams.get('id');
    const poiName = urlParams.get('name');

    if (!poiId) {
        console.error('No POI ID provided in URL');
        document.getElementById('main-title').textContent = 'Error: No ID';
        return;
    }

    // 如果 URL 里有名称，先展示名称（优化体验）
    if (poiName) {
        document.getElementById('header-title').textContent = decodeURIComponent(poiName);
        document.getElementById('main-title').textContent = decodeURIComponent(poiName);
    }

    initDetail(poiId);
});

function initDetail(poiId) {
    if (typeof AMap === 'undefined') {
        console.error('AMap is not loaded');
        return;
    }

    // 初始化 PlaceSearch
    const placeSearch = new AMap.PlaceSearch({
        extensions: 'all' // 重要：获取包括图片、详情在内的所有信息
    });

    // 根据 ID 获取详情
    placeSearch.getDetails(poiId, (status, result) => {
        if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
            const poi = result.poiList.pois[0];
            updateDetailUI(poi);
        } else {
            console.error('Failed to fetch POI details:', status, result);
            document.getElementById('main-title').textContent = 'Detail not found';
        }
    });
}

function updateDetailUI(poi) {
    console.log('POI Details:', poi);

    // 1. 更新标题
    document.getElementById('header-title').textContent = poi.name;
    document.getElementById('main-title').textContent = poi.name;

    // 2. 更新图片
    const mainImage = document.getElementById('main-image');
    if (poi.photos && poi.photos.length > 0) {
        mainImage.style.backgroundImage = `url('${poi.photos[0].url}')`;
    }

    // 3. 更新地址
    document.getElementById('poi-address').textContent = poi.address || 'No address available';

    // 4. 更新类型 (如果有多个，可以动态创建)
    const typeContainer = document.getElementById('poi-type');
    if (poi.type) {
        // 高德的 type 通常是 "风景名胜;公园;公园" 这种格式
        const firstType = poi.type.split(';')[0];
        typeContainer.querySelector('p').textContent = firstType;
    }

    // 5. 更新简介
    const descElement = document.getElementById('poi-description');
    if (poi.introduction) {
        descElement.textContent = poi.introduction;
    } else if (poi.tag) {
        descElement.textContent = `A popular ${poi.tag} in ${poi.adname || 'this area'}. Enjoy the beautiful scenery and local culture.`;
    } else {
        descElement.textContent = `Welcome to ${poi.name}. Located in ${poi.address || poi.adname}, it's one of the must-visit places for photographers.`;
    }
}
