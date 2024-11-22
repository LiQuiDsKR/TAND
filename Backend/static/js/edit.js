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

  const schedule = scheduleData || { days: [] };

  function renderSchedule() {
      daysContainer.innerHTML = '';

      schedule.days.forEach((day, index) => {
          const dayColumn = document.createElement('div');
          dayColumn.className = 'day-column';
          dayColumn.innerHTML = `
              <h3>${day.day}일차</h3>
              <div class="schedule-items" data-day="${index}">
                  ${day.schedule_items.map((item, i) => {
                      if (item.type === 'memo') {
                          return `
                              <div class="schedule-memo" draggable="true" data-index="${i}">
                                  <p class="memo-title">${item.title}</p>
                              </div>
                          `;
                      } else {
                          return `
                              <div class="schedule-item" draggable="true" data-index="${i}">
                                  <img src="https://via.placeholder.com/50" alt="이미지">
                                  <div class="item-content">
                                      <span class="item-title">${item.title}</span>
                                      <span class="item-time">${item.start_time} ~ ${item.end_time}</span>
                                      <p class="item-description">${item.description}</p>
                                  </div>
                              </div>
                          `;
                      }
                  }).join('')}
              </div>
          `;
          daysContainer.appendChild(dayColumn);
      });

      addDragAndDrop();
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
      modalOverlay.classList.remove('hidden');
  }

  function closeModal(modal) {
      modal.classList.add('hidden');
      modalOverlay.classList.add('hidden');
  }

  addScheduleBtn.addEventListener('click', () => openModal(scheduleModal));
  addMemoBtn.addEventListener('click', () => openModal(memoModal));
  cancelScheduleBtn.addEventListener('click', () => closeModal(scheduleModal));
  cancelMemoBtn.addEventListener('click', () => closeModal(memoModal));
  modalOverlay.addEventListener('click', () => {
      closeModal(scheduleModal);
      closeModal(memoModal);
  });

  renderSchedule();
});
