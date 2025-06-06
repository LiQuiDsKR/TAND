let map;
let marker;
let selectedLocation = { lat: null, lng: null };

window.initMap = function () {
  const map = new google.maps.Map(document.getElementById("map-location-picker"), {
    center: { lat: 37.5400456, lng: 126.9921017 },
    zoom: 10,
  });

  let marker = new google.maps.Marker({
    map: map,
    position: map.getCenter(),
  });

  map.addListener('click', (event) => {
    const location = event.latLng;
    marker.setPosition(location);
    selectedLocation = {
      lat: location.lat(),
      lng: location.lng(),
    };
    updateLocationDisplay(selectedLocation);
  });
};

function updateLocationDisplay(location, displayId = 'location-display') {
  const locationDisplay = document.getElementById(displayId);
  if (locationDisplay) {
    locationDisplay.textContent = `위도: ${location.lat}, 경도: ${location.lng}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const daysContainer = document.getElementById('days-container');
  const addScheduleBtn = document.getElementById('add-schedule-btn');
  const addMemoBtn = document.getElementById('add-memo-btn');
  const confirmBtn = document.getElementById('confirm-btn');
  const backBtn = document.getElementById('back-btn');

  const scheduleModal = document.getElementById('schedule-modal');
  const memoModal = document.getElementById('memo-modal');
  const scheduleForm = document.getElementById('schedule-form');
  const memoForm = document.getElementById('memo-form');
  const cancelScheduleBtn = document.getElementById('cancel-schedule');
  const cancelMemoBtn = document.getElementById('cancel-memo');

  const modalOverlay = document.getElementById('modal-overlay');

  modalOverlay.classList.add('hidden');

  const schedule = scheduleData || { days: [] };

  const categoryImages = {
    관광: 'static/image/category/place.png',
    식사: 'static/image/category/restaurant.png',
    숙소: 'static/image/category/hotel.png',
    체험: 'static/image/category/activity.png',
    메모: 'static/image/category/memo.png',
    기타: 'static/image/category/etc.png',
  };

  function renderSchedule() {
    daysContainer.innerHTML = '';

    schedule.days.forEach((day, index) => {
      const dayColumn = document.createElement('div');
      dayColumn.className = 'day-column';
      dayColumn.innerHTML = `
        <h3>${day.day}일차</h3>
        <div class="schedule-items" data-day="${index}">
          ${day.schedule_items.map((item, i) => {
            const imageUrl = categoryImages[item.category] || categoryImages['기타'];
            return `
              <div class="schedule-item" draggable="true" data-index="${i}" data-lat="${item.location.lat}" data-lng="${item.location.lng}">
                <img src="${imageUrl}" alt="이미지">
                <div class="item-content">
                  <span class="item-title">${item.title}</span>
                  <p class="item-description">${item.description}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      daysContainer.appendChild(dayColumn);
    });

    addDragAndDrop();

    document.querySelectorAll('.schedule-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.schedule-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        openEditModal(item);
      });
    });
  }

  function addDragAndDrop() {
    const items = document.querySelectorAll('.schedule-item, .schedule-memo');
    let draggedItem = null;
    let placeholder = document.createElement('div');
    placeholder.className = 'placeholder';

    items.forEach(item => {
      item.addEventListener('dragstart', () => {
        draggedItem = item;
        setTimeout(() => item.classList.add('hide'), 0);
      });

      item.addEventListener('dragend', () => {
        draggedItem.classList.remove('hide');
        draggedItem = null;
        if (placeholder.parentElement) {
          placeholder.parentElement.removeChild(placeholder);
        }
      });
    });

    const containers = document.querySelectorAll('.schedule-items');
    containers.forEach(container => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
          container.appendChild(placeholder);
        } else {
          container.insertBefore(placeholder, afterElement);
        }
      });

      container.addEventListener('drop', () => {
        if (draggedItem) {
          container.insertBefore(draggedItem, placeholder);
        }
      });
    });

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.schedule-item:not(.dragging), .schedule-memo:not(.dragging)')];

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  }

  function openModal(modal) {
    modal.classList.remove('hidden');
    modalOverlay.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
    modalOverlay.classList.remove('active');
  }

  addScheduleBtn.addEventListener('click', () => openModal(scheduleModal));
  addMemoBtn.addEventListener('click', () => openModal(memoModal));
  cancelScheduleBtn.addEventListener('click', () => closeModal(scheduleModal));
  cancelMemoBtn.addEventListener('click', () => closeModal(memoModal));
  modalOverlay.addEventListener('click', () => {
    closeModal(scheduleModal);
    closeModal(memoModal);
  });

  scheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newSchedule = {
      type: 'schedule',
      title: document.getElementById('schedule-title').value,
      description: "",
      location: { lat: 0, lng: 0 },
    };

    if (schedule.days.length > 0) {
      schedule.days[0].schedule_items.push(newSchedule);
    } else {
      schedule.days.push({ day: 1, schedule_items: [newSchedule] });
    }

    renderSchedule();
    displayScheduleOnMap();
    closeModal(scheduleModal);
  });

  memoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newMemo = {
        type: 'memo',
        title: document.getElementById('memo-title').value,
        description: "",
        location: { lat: 0, lng: 0 },
    };

    if (schedule.days.length > 0) {
        schedule.days[0].schedule_items.push(newMemo);
    } else {
        schedule.days.push({ day: 1, schedule_items: [newMemo] });
    }

    renderSchedule();
    closeModal(memoModal);
  });

  renderSchedule();

  const editScheduleModal = document.getElementById('edit-schedule-modal');
  const editScheduleForm = document.getElementById('edit-schedule-form');

  function openEditModal(item) {
    const index = item.dataset.index;
    const scheduleItem = schedule.days[0].schedule_items[index];

    document.getElementById('edit-schedule-title').value = scheduleItem.title;
    document.getElementById('edit-schedule-description').value = scheduleItem.description;
    document.getElementById('edit-schedule-start-time').value = scheduleItem.start_time;
    document.getElementById('edit-schedule-end-time').value = scheduleItem.end_time;
    document.getElementById('edit-schedule-category').value = scheduleItem.category;

    const lat = scheduleItem.location.lat;
    const lng = scheduleItem.location.lng;

    const map = new google.maps.Map(document.getElementById('edit-map-location-picker'), {
        center: { lat: lat, lng: lng },
        zoom: 15,
    });

    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
    });

    map.addListener('click', (event) => {
        const location = event.latLng;
        marker.setPosition(location);
        selectedLocation = {
            lat: location.lat(),
            lng: location.lng(),
        };
        updateLocationDisplay(selectedLocation, 'edit-location-display');
    });

    editScheduleModal.classList.remove('hidden');
  }

  editScheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const updatedTitle = document.getElementById('edit-schedule-title').value;
    const updatedDescription = document.getElementById('edit-schedule-description').value;
    const updatedStartTime = document.getElementById('edit-schedule-start-time').value;
    const updatedEndTime = document.getElementById('edit-schedule-end-time').value;

    const currentItem = document.querySelector('.schedule-item.active');

    if (currentItem) {
      currentItem.querySelector('.item-title').textContent = updatedTitle;
      currentItem.querySelector('.item-description').textContent = updatedDescription;
      currentItem.querySelector('.item-time').textContent = `${updatedStartTime} ~ ${updatedEndTime}`;

      closeModal(editScheduleModal);
    }
  });

  document.getElementById('cancel-edit-schedule').addEventListener('click', () => {
    closeModal(editScheduleModal);
  });

  function displayScheduleOnMap() {
    const mapElement = document.getElementById("map");
    const map = new google.maps.Map(mapElement, {
      center: { lat: 37.5400456, lng: 126.9921017 },
      zoom: 10,
    });

    const scheduleLocations = [];
    schedule.days.forEach(day => {
      const sortedItems = day.schedule_items.sort((a, b) => a.order - b.order);
      sortedItems.forEach(item => {
        if (item.location.lat && item.location.lng) {
          const position = { lat: item.location.lat, lng: item.location.lng };
          scheduleLocations.push(position);
        }
      });
    });

    if (scheduleLocations.length > 1) {
      const path = new google.maps.Polyline({
        path: scheduleLocations,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      path.setMap(map);

      const bounds = new google.maps.LatLngBounds();
      scheduleLocations.forEach(location => {
        bounds.extend(location);
      });
      map.fitBounds(bounds);
    }
  }

  displayScheduleOnMap();
});
