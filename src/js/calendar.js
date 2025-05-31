// frontend/src/js/calendar.js
let calendar;

function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: async (info, successCallback) => {
      const tasks = await fetchTasks(null, true) || [];
      const events = tasks
        .filter(task => !task.deleted && task.dueDate)
        .map(task => ({
          id: task._id,
          title: task.text,
          start: task.dueDate,
          color: task.color || '#87CEFF',
          extendedProps: { isToday: task.isToday, important: task.important }
        }));
      successCallback(events);
    },
    dateClick: function (info) {
      showSection3({ date: info.dateStr });
    },
    eventClick: function (info) {
      showSection3({
        id: info.event.id,
        text: info.event.title,
        dueDate: info.event.start,
        color: info.event.backgroundColor,
        isToday: info.event.extendedProps.isToday,
        important: info.event.extendedProps.important
      });
    },
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.5
  });
  calendar.render();
}

function showCalendar() {
  document.getElementById('sec2').style.display = 'block';
  document.getElementById('calendar').style.display = 'block';
  document.getElementById('taskList').style.display = 'none';
  document.getElementById('sec2Title').textContent = 'Lịch';
  if (window.innerWidth <= 768) {
    document.getElementById('sec1').style.display = 'none';
    document.getElementById('bt2').style.display = 'block';
  }
  if (calendar) {
    calendar.refetchEvents();
  }
}