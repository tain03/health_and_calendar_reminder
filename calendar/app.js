// Core Logic for LG Work Calendar 2026

document.addEventListener('DOMContentLoaded', () => {
    const state = {
        currentDate: new Date(),
        viewDate: new Date(2026, 4, 15), // May 2026
        holidays: [
            { date: '2026-01-01', name: 'New Year' },
            { date: '2026-02-14', name: 'Tet Eve (Holiday)' },
            { date: '2026-02-15', name: 'Tet Holiday' },
            { date: '2026-02-16', name: 'Tet Holiday' },
            { date: '2026-02-17', name: 'Tet Holiday (1/1 Lunar)' },
            { date: '2026-02-18', name: 'Tet Holiday (2/1 Lunar)' },
            { date: '2026-02-19', name: 'Tet Holiday (3/1 Lunar)' },
            { date: '2026-02-20', name: 'Tet Holiday' },
            { date: '2026-02-21', name: 'Tet Holiday' },
            { date: '2026-04-10', name: 'LG Founding Day', isCompany: true },
            { date: '2026-04-26', name: 'Hung Kings Day (10/3 Lunar)' },
            { date: '2026-04-27', name: 'Hung Kings Day (Compensatory)' },
            { date: '2026-04-30', name: 'Victory Day' },
            { date: '2026-05-01', name: 'Labor Day' },
            { date: '2026-09-02', name: 'National Day' },
            { date: '2026-09-03', name: 'National Day (Extra)' },
        ],
        notes: JSON.parse(localStorage.getItem('lg_notes') || '{}'),
        joiningDate: localStorage.getItem('lg_joining_date') || null,
        theme: localStorage.getItem('lg_theme') || 'dark',
        activeNoteDate: null
    };

    // Initialize
    applyTheme();
    updateClock();
    setInterval(updateClock, 1000);
    renderDashboard();
    initCalendar();
    initNavigation();
    initThemeSwitch();
    initModals();
    updateSeniority();

    function applyTheme() {
        if (state.theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            const checkbox = document.getElementById('checkbox');
            if (checkbox) checkbox.checked = false; // Slider logic: checked is dark in some CSS, let's align
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            const checkbox = document.getElementById('checkbox');
            if (checkbox) checkbox.checked = true;
        }
    }

    function initThemeSwitch() {
        const checkbox = document.getElementById('checkbox');
        checkbox.addEventListener('change', () => {
            state.theme = checkbox.checked ? 'dark' : 'light';
            localStorage.setItem('lg_theme', state.theme);
            applyTheme();
        });
    }

    function initNavigation() {
        const navItems = document.querySelectorAll('.sidebar nav li');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.id === 'nav-settings') {
                    openModal('settings-modal');
                    return;
                }
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                updateView(item.id);
            });
        });
    }

    function initModals() {
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.onclick = () => closeModal();
        });

        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                closeModal();
            }
        };

        document.getElementById('save-settings').onclick = () => {
            const dateInput = document.getElementById('joining-date-input').value;
            if (dateInput) {
                state.joiningDate = dateInput;
                localStorage.setItem('lg_joining_date', dateInput);
                updateSeniority();
                closeModal();
            }
        };

        document.getElementById('save-note').onclick = () => {
            const noteText = document.getElementById('note-text').value;
            if (state.activeNoteDate) {
                if (noteText.trim()) {
                    state.notes[state.activeNoteDate] = noteText;
                } else {
                    delete state.notes[state.activeNoteDate];
                }
                localStorage.setItem('lg_notes', JSON.stringify(state.notes));
                renderDashboard();
                const yearly = document.getElementById('yearly-calendar-view');
                if (yearly) renderYearlyCalendar(yearly);
                closeModal();
            }
        };
    }

    function openModal(id, date = null) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.style.display = 'block';
        if (id === 'note-modal' && date) {
            state.activeNoteDate = date;
            document.getElementById('modal-date-title').textContent = `Note for ${date}`;
            document.getElementById('note-text').value = state.notes[date] || '';
        }
        if (id === 'settings-modal') {
            document.getElementById('joining-date-input').value = state.joiningDate || '';
        }
    }

    function closeModal() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        state.activeNoteDate = null;
    }

    function updateView(viewId) {
        const cards = document.querySelectorAll('.card');
        const grid = document.querySelector('.dashboard-grid');
        const header = document.querySelector('.top-header h1');

        if (viewId === 'nav-dashboard') {
            header.textContent = 'Work Dashboard 2026';
            cards.forEach(card => card.style.display = 'block');
            const yearly = document.getElementById('yearly-calendar-view');
            if (yearly) yearly.remove();
            renderDashboard();
            initCalendar();
        } else if (viewId === 'nav-calendar') {
            header.textContent = 'Full Calendar 2026';
            cards.forEach(card => card.style.display = 'none');
            let yearly = document.getElementById('yearly-calendar-view');
            if (!yearly) {
                yearly = document.createElement('div');
                yearly.id = 'yearly-calendar-view';
                yearly.className = 'yearly-grid';
                grid.parentElement.appendChild(yearly);
            }
            renderYearlyCalendar(yearly);
        }
    }

    function updateSeniority() {
        if (!state.joiningDate) return;
        const start = new Date(state.joiningDate);
        const now = state.currentDate;
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysElem = document.getElementById('days-at-lg');
        const textElem = document.getElementById('joining-date-text');
        if (daysElem) daysElem.textContent = diffDays;
        if (textElem) textElem.textContent = `Started on: ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const timeElem = document.getElementById('current-time');
        const dateElem = document.getElementById('current-date');
        if (timeElem) timeElem.textContent = timeStr;
        if (dateElem) dateElem.textContent = dateStr;
    }

    function renderDashboard() {
        const startOfYear = new Date(2026, 0, 1);
        const endOfYear = new Date(2026, 11, 31);
        const now = state.currentDate;

        // Yearly Progress
        const yearProgress = Math.max(0, Math.min(100, ((now - startOfYear) / (endOfYear - startOfYear)) * 100));
        const progressBar = document.getElementById('year-progress-bar');
        const progressText = document.getElementById('year-progress-text');
        if (progressBar) progressBar.style.width = `${yearProgress.toFixed(1)}%`;
        if (progressText) progressText.textContent = `${yearProgress.toFixed(1)}%`;

        // Cycle Progress (19th previous month to 18th current month)
        let cycleStart, cycleEnd;
        const day = now.getDate();
        if (day >= 19) {
            cycleStart = new Date(now.getFullYear(), now.getMonth(), 19);
            cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 18);
        } else {
            cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, 19);
            cycleEnd = new Date(now.getFullYear(), now.getMonth(), 18);
        }

        const cycleProgress = Math.max(0, Math.min(100, ((now - cycleStart) / (cycleEnd - cycleStart)) * 100));
        const cycleBar = document.getElementById('cycle-progress-bar');
        const cycleText = document.getElementById('cycle-progress-text');
        const cycleRangeText = document.getElementById('cycle-range-text');

        if (cycleBar) cycleBar.style.width = `${cycleProgress.toFixed(1)}%`;
        if (cycleText) cycleText.textContent = `${cycleProgress.toFixed(1)}%`;
        if (cycleRangeText) {
            cycleRangeText.textContent = `Cycle: ${cycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${cycleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }

        updateSalaryStats();
        renderUpcomingHolidays();
        renderCalendar();
    }

    function formatDateLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function isHoliday(date) {
        const dateStr = formatDateLocal(date);
        return state.holidays.some(h => h.date === dateStr);
    }

    function isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    function getPayday(month, year) {
        let payday = new Date(year, month, 25);
        while (isWeekend(payday) || isHoliday(payday)) {
            payday.setDate(payday.getDate() - 1);
        }
        return payday;
    }

    function updateSalaryStats() {
        const now = new Date(state.currentDate);
        now.setHours(0,0,0,0);
        let currentMonth = now.getMonth();
        let currentYear = now.getFullYear();
        let payday = getPayday(currentMonth, currentYear);
        if (now > payday) {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            payday = getPayday(currentMonth, currentYear);
        }
        const nextPaydayElem = document.getElementById('next-payday');
        if (nextPaydayElem) nextPaydayElem.textContent = payday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        let workDaysRemaining = 0;
        let tempDate = new Date(now);
        while (tempDate < payday) {
            if (!isWeekend(tempDate) && !isHoliday(tempDate)) workDaysRemaining++;
            tempDate.setDate(tempDate.getDate() + 1);
        }
        const daysToPayElem = document.getElementById('days-to-pay');
        if (daysToPayElem) daysToPayElem.textContent = workDaysRemaining;
    }

    function renderUpcomingHolidays() {
        const list = document.getElementById('upcoming-holidays');
        if (!list) return;
        list.innerHTML = '';
        const nowStr = formatDateLocal(state.currentDate);
        const upcoming = state.holidays.filter(h => h.date >= nowStr);
        if (upcoming.length === 0) {
            list.innerHTML = '<li class="holiday-item">No more holidays</li>';
            return;
        }
        const nextDate = upcoming[0].date;
        upcoming.filter(h => h.date === nextDate).forEach(h => {
            const date = new Date(h.date);
            const item = document.createElement('li');
            item.className = 'holiday-item';
            item.innerHTML = `
                <div class="holiday-date-circle">
                    <span class="day">${date.getDate()}</span>
                    <span class="month">${date.toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div class="holiday-info">
                    <h4>${h.name}</h4>
                    <p>${h.isCompany ? 'Company' : 'National'}</p>
                </div>
            `;
            list.appendChild(item);
        });
    }

    function initCalendar() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        if (prevBtn && nextBtn) {
            prevBtn.onclick = () => { state.viewDate.setMonth(state.viewDate.getMonth() - 1); renderCalendar(); };
            nextBtn.onclick = () => { state.viewDate.setMonth(state.viewDate.getMonth() + 1); renderCalendar(); };
        }
        renderCalendar();
    }

    function renderCalendar() {
        const grid = document.getElementById('calendar-days-grid');
        if (!grid) return;
        const monthYearLabel = document.getElementById('calendar-month-year');
        const year = state.viewDate.getFullYear();
        const month = state.viewDate.getMonth();
        if (monthYearLabel) monthYearLabel.textContent = state.viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        grid.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < startOffset; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day empty';
            grid.appendChild(div);
        }
        const paydayStr = formatDateLocal(getPayday(month, year));
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = formatDateLocal(date);
            const lunar = LunarCalendar.getLunarDate(d, month + 1, year);
            const div = document.createElement('div');
            div.className = 'calendar-day';
            const isOff = isWeekend(date) || isHoliday(date);
            if (isOff) {
                if (isWeekend(date)) div.classList.add('weekend');
                if (isHoliday(date)) div.classList.add('holiday');
            } else { div.classList.add('workday'); }
            if (dateStr === paydayStr) div.classList.add('payday');
            if (dateStr === formatDateLocal(state.currentDate)) div.classList.add('today');
            if (state.notes[dateStr]) div.classList.add('has-note');
            div.innerHTML = `<span class="solar-date">${d}</span><span class="lunar-date">${lunar.day}/${lunar.month}</span>`;
            div.onclick = () => openModal('note-modal', dateStr);
            grid.appendChild(div);
        }
    }

    function renderYearlyCalendar(container) {
        container.innerHTML = '';
        for (let m = 0; m < 12; m++) {
            const monthDate = new Date(2026, m, 1);
            const monthDiv = document.createElement('div');
            monthDiv.className = 'month-container';
            monthDiv.innerHTML = `<h4>${monthDate.toLocaleDateString('en-US', { month: 'long' })}</h4>`;
            const daysGrid = document.createElement('div');
            daysGrid.className = 'yearly-month-grid';
            const firstDay = monthDate.getDay();
            const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
            const daysInMonth = new Date(2026, m + 1, 0).getDate();
            for (let i = 0; i < startOffset; i++) {
                const empty = document.createElement('div');
                empty.className = 'yearly-day empty';
                daysGrid.appendChild(empty);
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(2026, m, d);
                const dateStr = formatDateLocal(date);
                const lunar = LunarCalendar.getLunarDate(d, m + 1, 2026);
                const dayDiv = document.createElement('div');
                dayDiv.className = 'yearly-day';
                const isOff = isWeekend(date) || isHoliday(date);
                if (isOff) {
                    if (isWeekend(date)) dayDiv.classList.add('weekend');
                    if (isHoliday(date)) dayDiv.classList.add('holiday');
                } else { dayDiv.classList.add('workday'); }
                if (dateStr === formatDateLocal(getPayday(m, 2026))) dayDiv.classList.add('payday');
                if (state.notes[dateStr]) dayDiv.classList.add('has-note');
                dayDiv.innerHTML = `<span class="yearly-day-solar">${d}</span><span class="yearly-day-lunar">${lunar.day}/${lunar.month}</span>`;
                dayDiv.onclick = () => openModal('note-modal', dateStr);
                daysGrid.appendChild(dayDiv);
            }
            monthDiv.appendChild(daysGrid);
            container.appendChild(monthDiv);
        }
    }
});
