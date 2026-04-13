// Variables globales
let currentUser = null;
let currentDate = new Date();
let currentView = 'month';
let events = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mettre à jour l'interface utilisateur
    updateUserInterface();
    
    // Charger les événements
    loadEvents();
    
    // Initialiser les gestionnaires d'événements
    initializeEventHandlers();
    
    // Initialiser les données de démonstration
    initializeDemoData();
    
    // Afficher le calendrier
    renderCalendar();
    
    // Afficher les événements à venir
    displayUpcomingEvents();
});

function updateUserInterface() {
    document.getElementById('userName').textContent = `${currentUser.prenom} ${currentUser.nom}`;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.prenom.charAt(0).toUpperCase();
}

function loadEvents() {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    events = allEvents.filter(event => 
        event.teacherId === currentUser.id || 
        event.participants && event.participants.includes(currentUser.email)
    );
}

function renderCalendar() {
    updateMonthDisplay();
    renderCalendarDays();
}

function updateMonthDisplay() {
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    document.getElementById('currentMonth').textContent = monthYear;
}

function renderCalendarDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Jours du mois précédent
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, new Date(year, month - 1, day));
        calendarDays.appendChild(dayElement);
    }
    
    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayElement = createDayElement(day, false, date);
        calendarDays.appendChild(dayElement);
    }
    
    // Jours du mois suivant
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, new Date(year, month + 1, day));
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth, date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // Vérifier si c'est aujourd'hui
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }
    
    // Ajouter le numéro du jour
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Ajouter les événements de ce jour
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        // Afficher jusqu'à 3 événements
        dayEvents.slice(0, 3).forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-item ${event.type}`;
            eventElement.textContent = event.title;
            eventElement.title = `${event.title} - ${formatEventTime(event)}`;
            eventsContainer.appendChild(eventElement);
        });
        
        // S'il y a plus de 3 événements, ajouter un indicateur
        if (dayEvents.length > 3) {
            const moreElement = document.createElement('div');
            moreElement.className = 'event-item';
            moreElement.textContent = `+${dayEvents.length - 3} plus`;
            moreElement.style.background = '#95a5a6';
            eventsContainer.appendChild(moreElement);
        }
        
        dayElement.appendChild(eventsContainer);
    }
    
    // Ajouter un gestionnaire de clic
    dayElement.addEventListener('click', () => selectDate(date));
    
    return dayElement;
}

function getEventsForDate(date) {
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
    });
}

function formatEventTime(event) {
    if (!event.time) return '';
    return `${event.time} (${event.duration || 60} min)`;
}

function selectDate(date) {
    // Désélectionner les jours précédemment sélectionnés
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Sélectionner le jour cliqué
    const dayElements = document.querySelectorAll('.calendar-day');
    dayElements.forEach(dayElement => {
        const dayText = dayElement.querySelector('.day-number').textContent;
        const elementDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dayText));
        
        if (elementDate.toDateString() === date.toDateString()) {
            dayElement.classList.add('selected');
        }
    });
    
    // Afficher les événements du jour sélectionné
    displayDayEvents(date);
}

function displayDayEvents(date) {
    const dayEvents = getEventsForDate(date);
    
    if (dayEvents.length === 0) {
        alert(`Aucun événement le ${date.toLocaleDateString('fr-FR')}`);
        return;
    }
    
    let eventsText = `Événements du ${date.toLocaleDateString('fr-FR')}:\n\n`;
    
    dayEvents.forEach((event, index) => {
        eventsText += `${index + 1}. ${event.title}\n`;
        eventsText += `   Type: ${getEventTypeLabel(event.type)}\n`;
        eventsText += `   Heure: ${event.time || 'Toute la journée'}\n`;
        eventsText += `   Durée: ${event.duration || 60} minutes\n`;
        if (event.location) {
            eventsText += `   Lieu: ${event.location}\n`;
        }
        if (event.description) {
            eventsText += `   Description: ${event.description}\n`;
        }
        eventsText += '\n';
    });
    
    alert(eventsText);
}

function getEventTypeLabel(type) {
    const labels = {
        course: 'Cours',
        exam: 'Examen',
        meeting: 'Réunion',
        other: 'Autre'
    };
    return labels[type] || 'Autre';
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    displayUpcomingEvents();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    displayUpcomingEvents();
}

function setView(view) {
    currentView = view;
    
    // Mettre à jour les boutons de vue
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Pour l'instant, seule la vue mois est implémentée
    if (view !== 'month') {
        alert(`La vue ${view} sera bientôt disponible!`);
        currentView = 'month';
        document.querySelector('.view-btn').classList.add('active');
    }
}

function openEventModal() {
    document.getElementById('eventModal').style.display = 'block';
    
    // Pré-remplir la date avec la date actuelle
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('eventForm').reset();
}

function saveEvent(event) {
    event.preventDefault();
    
    const eventData = {
        id: Date.now(),
        title: document.getElementById('eventTitle').value,
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        duration: parseInt(document.getElementById('eventDuration').value) || 60,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        teacherId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    // Sauvegarder l'événement
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    allEvents.push(eventData);
    localStorage.setItem('events', JSON.stringify(allEvents));
    
    // Recharger les événements
    loadEvents();
    renderCalendar();
    displayUpcomingEvents();
    
    // Fermer le modal
    closeEventModal();
    
    alert('Événement ajouté avec succès!');
}

function deleteEvent(eventId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
        return;
    }
    
    // Supprimer l'événement
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const updatedEvents = allEvents.filter(event => event.id !== eventId);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    
    // Recharger les événements
    loadEvents();
    renderCalendar();
    displayUpcomingEvents();
    
    alert('Événement supprimé avec succès!');
}

function displayUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filtrer les événements à venir
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5); // Limiter à 5 événements
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>Aucun événement à venir</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => {
        const eventDate = new Date(event.date);
        const colorClass = getEventColorClass(event.type);
        
        return `
            <div class="event-list-item">
                <div class="event-color ${colorClass}"></div>
                <div class="event-details">
                    <div class="event-title">${event.title}</div>
                    <div class="event-meta">
                        ${eventDate.toLocaleDateString('fr-FR')} ${event.time || ''} • ${getEventTypeLabel(event.type)}
                        ${event.location ? ` • ${event.location}` : ''}
                    </div>
                </div>
                <div class="event-actions">
                    <button class="btn-small" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small delete" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getEventColorClass(type) {
    const classes = {
        course: 'course',
        exam: 'exam',
        meeting: 'meeting',
        other: 'other'
    };
    return classes[type] || 'other';
}

function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Remplir le formulaire avec les données de l'événement
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventDuration').value = event.duration || 60;
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventDescription').value = event.description || '';
    
    // Changer le gestionnaire de soumission pour mettre à jour
    const form = document.getElementById('eventForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateEvent(eventId);
    };
    
    // Ouvrir le modal
    openEventModal();
}

function updateEvent(eventId) {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    // Mettre à jour l'événement
    events[eventIndex] = {
        ...events[eventIndex],
        title: document.getElementById('eventTitle').value,
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        duration: parseInt(document.getElementById('eventDuration').value) || 60,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const updatedAllEvents = allEvents.map(e => e.id === eventId ? events[eventIndex] : e);
    localStorage.setItem('events', JSON.stringify(updatedAllEvents));
    
    // Recharger
    loadEvents();
    renderCalendar();
    displayUpcomingEvents();
    
    // Fermer le modal
    closeEventModal();
    
    // Restaurer le gestionnaire de soumission
    document.getElementById('eventForm').onsubmit = saveEvent;
    
    alert('Événement mis à jour avec succès!');
}

function initializeEventHandlers() {
    // Gestion du formulaire d'événement
    document.getElementById('eventForm').addEventListener('submit', saveEvent);
    
    // Fermer le modal en cliquant à l'extérieur
    document.getElementById('eventModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEventModal();
        }
    });
}

function initializeDemoData() {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const userEvents = allEvents.filter(event => event.teacherId === currentUser.id);
    
    if (userEvents.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const demoEvents = [
            {
                id: Date.now() + 1,
                title: 'Cours de Mathématiques',
                type: 'course',
                date: today.toISOString().split('T')[0],
                time: '09:00',
                duration: 60,
                location: 'Salle 101',
                description: 'Chapitre sur les fractions',
                teacherId: currentUser.id,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                title: 'Réunion équipe pédagogique',
                type: 'meeting',
                date: tomorrow.toISOString().split('T')[0],
                time: '14:00',
                duration: 90,
                location: 'Salle des professeurs',
                description: 'Préparation du prochain trimestre',
                teacherId: currentUser.id,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                title: 'Examen de Français',
                type: 'exam',
                date: nextWeek.toISOString().split('T')[0],
                time: '10:00',
                duration: 120,
                location: 'Salle 205',
                description: 'Évaluation sur la grammaire et la conjugaison',
                teacherId: currentUser.id,
                createdAt: new Date().toISOString()
            }
        ];
        
        allEvents.push(...demoEvents);
        localStorage.setItem('events', JSON.stringify(allEvents));
        
        // Recharger les événements
        loadEvents();
        renderCalendar();
        displayUpcomingEvents();
    }
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}
