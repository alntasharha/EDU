// Variables globales
let currentStudentName = '';
let selectedTeacher = null;
let teachers = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadStudentData();
    loadTeachers();
    initializeEventHandlers();
});

function loadStudentData() {
    currentStudentName = localStorage.getItem('studentName') || '';
    
    if (currentStudentName) {
        document.getElementById('currentStudentName').textContent = currentStudentName;
    }
}

function loadTeachers() {
    // Charger les professeurs depuis localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    teachers = users.filter(user => user.email && user.email !== 'admin@eduprof.fr');
    
    displayTeachers();
}

function displayTeachers() {
    const teacherList = document.getElementById('teacherList');
    
    if (teachers.length === 0) {
        teacherList.innerHTML = '<p style="text-align: center; color: #666;">Aucun professeur disponible</p>';
        return;
    }
    
    teacherList.innerHTML = teachers.map(teacher => `
        <div class="teacher-item" onclick="selectTeacher('${teacher.email}', '${teacher.prenom} ${teacher.nom}', '${teacher.matiere}')">
            <div class="teacher-avatar">${teacher.prenom.charAt(0).toUpperCase()}</div>
            <div class="teacher-info">
                <div class="teacher-name">${teacher.prenom} ${teacher.nom}</div>
                <div class="teacher-subject">${teacher.matiere || 'Non spécifié'}</div>
            </div>
        </div>
    `).join('');
}

function selectTeacher(email, name, subject) {
    selectedTeacher = { email, name, subject };
    
    // Mettre à jour l'affichage
    document.querySelectorAll('.teacher-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
}

function initializeEventHandlers() {
    // Gestion du formulaire de contact
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendContactMessage();
    });
    
    // Gestion du formulaire de changement d'élève
    document.getElementById('switchStudentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        switchStudent();
    });
}

function sendContactMessage() {
    if (!currentStudentName) {
        showMessage('Veuillez d\'abord entrer votre nom dans l\'espace élève', 'error');
        return;
    }
    
    if (!selectedTeacher) {
        showMessage('Veuillez sélectionner un professeur', 'error');
        return;
    }
    
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    if (!subject || !message) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    // Créer le message
    const contactMessage = {
        id: Date.now(),
        from: currentStudentName,
        fromEmail: localStorage.getItem('studentEmail') || '',
        to: selectedTeacher.email,
        toName: selectedTeacher.name,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        type: 'student_contact',
        read: false
    };
    
    // Sauvegarder le message
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push(contactMessage);
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    
    // Créer une notification pour le professeur
    createNotification(selectedTeacher.email, `Nouveau message de ${currentStudentName}`, subject);
    
    // Afficher le message de succès
    showMessage(`Message envoyé avec succès à ${selectedTeacher.name}!`, 'success');
    
    // Réinitialiser le formulaire
    document.getElementById('contactForm').reset();
    selectedTeacher = null;
    document.querySelectorAll('.teacher-item').forEach(item => {
        item.classList.remove('selected');
    });
}

function createNotification(userEmail, title, message) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    const notification = {
        id: Date.now(),
        userEmail: userEmail,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function switchStudent() {
    const newStudentName = document.getElementById('newStudentName').value.trim();
    const studentClass = document.getElementById('studentClass').value;
    const studentEmail = document.getElementById('studentEmail').value.trim();
    
    if (!newStudentName || !studentClass) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    // Sauvegarder les nouvelles informations de l'élève
    localStorage.setItem('studentName', newStudentName);
    if (studentEmail) {
        localStorage.setItem('studentEmail', studentEmail);
    }
    localStorage.setItem('studentClass', studentClass);
    
    // Mettre à jour l'affichage
    currentStudentName = newStudentName;
    document.getElementById('currentStudentName').textContent = newStudentName;
    
    // Afficher le message de succès
    showMessage(`Bonjour ${newStudentName}! Vous êtes maintenant connecté en tant qu'élève de ${studentClass}.`, 'success');
    
    // Réinitialiser le formulaire
    document.getElementById('switchStudentForm').reset();
}

function changeStudent() {
    // Réinitialiser les informations de l'élève
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentClass');
    
    currentStudentName = '';
    document.getElementById('currentStudentName').textContent = 'Non connecté';
    
    showMessage('Vous avez été déconnecté. Vous pouvez maintenant vous reconnecter avec un autre nom.', 'success');
}

function showMessage(text, type) {
    const container = document.getElementById('messageContainer');
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    
    const messageHtml = `
        <div class="${messageClass}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${text}
        </div>
    `;
    
    container.innerHTML = messageHtml;
    
    // Faire disparaître le message après 5 secondes
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Fonction pour ajouter des professeurs de démonstration si aucun n'existe
function initializeDemoTeachers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const hasTeachers = users.some(user => user.email && user.email !== 'admin@eduprof.fr');
    
    if (!hasTeachers) {
        const demoTeachers = [
            {
                id: Date.now() + 1,
                nom: 'Martin',
                prenom: 'Pierre',
                email: 'pierre.martin@ecole.fr',
                matiere: 'Mathématiques',
                etablissement: 'Collège Demo',
                password: 'password123',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                nom: 'Dubois',
                prenom: 'Marie',
                email: 'marie.dubois@ecole.fr',
                matiere: 'Français',
                etablissement: 'Collège Demo',
                password: 'password123',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                nom: 'Bernard',
                prenom: 'Jean',
                email: 'jean.bernard@ecole.fr',
                matiere: 'Histoire',
                etablissement: 'Collège Demo',
                password: 'password123',
                createdAt: new Date().toISOString()
            }
        ];
        
        users.push(...demoTeachers);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Recharger les professeurs
        loadTeachers();
    }
}

// Initialiser les professeurs de démonstration au chargement
initializeDemoTeachers();
