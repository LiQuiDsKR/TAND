document.addEventListener('DOMContentLoaded', () => {
    const daysContainer = document.getElementById('days-container');
    const addScheduleBtn = document.getElementById('add-schedule-btn');
    const addMemoBtn = document.getElementById('add-memo-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const backBtn = document.getElementById('back-btn');
  
    const schedule = scheduleData || { days: [] };
  
    function renderSchedule() {
        daysContainer.innerHTML = '';
    
        schedule.days.forEach((day, index) => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            dayColumn.innerHTML = `
                <h3>${day.day}일차</h3>
                <div class="schedule-items" data-day="${index}">
                    ${day.schedule_items.map((item, i) => `
                        <div class="schedule-item" draggable="true" data-index="${i}">
                            <img src="https://via.placeholder.com/50" alt="이미지">
                            <div class="item-content">
                                <span class="item-title">${item.title}</span>
                                <span class="item-time">${item.start_time} ~ ${item.end_time}</span>
                                <p class="item-description">${item.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            daysContainer.appendChild(dayColumn);
        });
    
        addDragAndDrop();
    }
    
  
    function addDragAndDrop() {
      const items = document.querySelectorAll('.schedule-item');
      let draggedItem = null;
  
      items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          draggedItem = item;
          setTimeout(() => item.classList.add('hide'), 0);
        });
  
        item.addEventListener('dragend', () => {
          draggedItem.classList.remove('hide');
          draggedItem = null;
        });
  
        item.addEventListener('dragover', (e) => e.preventDefault());
  
        item.addEventListener('drop', (e) => {
          e.target.closest('.schedule-items').appendChild(draggedItem);
        });
      });
    }
  
    addScheduleBtn.addEventListener('click', () => {
      alert("일정 추가 기능!");
    });
  
    addMemoBtn.addEventListener('click', () => {
      alert("메모 추가 기능!");
    });
  
    confirmBtn.addEventListener('click', () => {
      alert("일정이 확정되었습니다!");
    });
  
    backBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  
    renderSchedule();
  });
  