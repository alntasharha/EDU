// Variables globales
let currentAction = null;
const ADMIN_SECRET_CODE = 'EDU-ADMIN-2026-SUPER'; // Code secret pour créer un compte admin

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultAdmin();
    checkAdminSession();
});

// Créer l'admin par défaut si aucun n'existe
function initializeDefaultAdmin() {
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    
    // Vérifier si l'admin par défaut existe déjà
    const defaultAdminExists = admins.find(a => a.email === 'albinamani10@gmail.com');
    
    if (!defaultAdminExists) {
        const defaultAdmin = {
            id: 1,
            name: 'Albina Mani',
            email: 'albinamani10@gmail.com',
            password: 'password123',
            role: 'admin',
            createdAt: new Date().toISOString(),
            isSuperAdmin: true
        };
        
        admins.push(defaultAdmin);
        localStorage.setItem('admins', JSON.stringify(admins));
        console.log('Compte admin par défaut créé: albinamani10@gmail.com / password123');
    }
}

// ============================================
// GESTION DE L'AUTHENTIFICATION ADMIN
// ============================================

function checkAdminSession() {
    const adminSession = JSON.parse(localStorage.getItem('adminSession'));
    
    if (adminSession && adminSession.isLoggedIn && adminSession.expiresAt > Date.now()) {
        // Admin connecté - afficher le panneau
        showAdminPanel(adminSession);
    } else {
        // Pas de session admin - afficher le login
        showAdminLogin();
    }
}

function showAdminLogin() {
    document.getElementById('adminLoginSection').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel(adminSession) {
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('currentAdminName').textContent = adminSession.name || 'Admin';
    
    // Charger les données du panneau
    loadStatistics();
    loadUsersList();
    loadDataList();
    
    // Charger les images si la fonction existe
    if (typeof loadUploadedImages === 'function') {
        setTimeout(loadUploadedImages, 100);
    }
    
    // Charger les codes si la fonction existe
    if (typeof displayGeneratedCodes === 'function') {
        setTimeout(() => {
            const codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
            displayGeneratedCodes(codes.slice(-10));
        }, 100);
    }
}

function showAdminTab(tab) {
    const tabLogin = document.getElementById('tabLogin');
    const tabSetup = document.getElementById('tabSetup');
    const loginForm = document.getElementById('adminLoginForm');
    const setupForm = document.getElementById('adminSetupForm');
    
    if (tab === 'login') {
        tabLogin.style.color = '#e74c3c';
        tabLogin.style.borderBottomColor = '#e74c3c';
        tabSetup.style.color = '#666';
        tabSetup.style.borderBottomColor = 'transparent';
        loginForm.style.display = 'block';
        setupForm.style.display = 'none';
    } else {
        tabSetup.style.color = '#27ae60';
        tabSetup.style.borderBottomColor = '#27ae60';
        tabLogin.style.color = '#666';
        tabLogin.style.borderBottomColor = 'transparent';
        setupForm.style.display = 'block';
        loginForm.style.display = 'none';
    }
}

function loginAsAdmin() {
    const email = document.getElementById('adminLoginEmail').value.trim();
    const password = document.getElementById('adminLoginPassword').value;
    
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Vérifier dans les admins
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const admin = admins.find(a => a.email === email && a.password === password);
    
    if (admin) {
        // Créer la session admin (valide 24h)
        const adminSession = {
            isLoggedIn: true,
            email: admin.email,
            name: admin.name,
            id: admin.id,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
        };
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        
        // Mettre aussi à jour currentUser pour compatibilité
        localStorage.setItem('currentUser', JSON.stringify({
            ...admin,
            role: 'admin'
        }));
        
        alert('Connexion admin réussie!');
        showAdminPanel(adminSession);
    } else {
        alert('Email ou mot de passe admin incorrect!');
    }
}

function createAdminAccount() {
    const code = document.getElementById('adminSetupCode').value.trim();
    const name = document.getElementById('adminSetupName').value.trim();
    const email = document.getElementById('adminSetupEmail').value.trim();
    const password = document.getElementById('adminSetupPassword').value;
    
    // Validation
    if (!code || !email || !password) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Vérifier le code secret
    if (code !== ADMIN_SECRET_CODE) {
        alert('Code admin invalide! Contactez le développeur pour obtenir le code de création admin.');
        return;
    }
    
    // Vérifier la force du mot de passe
    if (password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères');
        return;
    }
    
    // Vérifier si l'email existe déjà
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (admins.find(a => a.email === email)) {
        alert('Un compte admin existe déjà avec cet email!');
        return;
    }
    
    // Créer le nouvel admin
    const newAdmin = {
        id: Date.now(),
        name: name || email.split('@')[0],
        email: email,
        password: password,
        role: 'admin',
        createdAt: new Date().toISOString(),
        isSuperAdmin: admins.length === 0 // Premier admin = super admin
    };
    
    admins.push(newAdmin);
    localStorage.setItem('admins', JSON.stringify(admins));
    
    // Créer automatiquement la session
    const adminSession = {
        isLoggedIn: true,
        email: newAdmin.email,
        name: newAdmin.name,
        id: newAdmin.id,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
    localStorage.setItem('adminSession', JSON.stringify(adminSession));
    localStorage.setItem('currentUser', JSON.stringify(newAdmin));
    
    alert(`Félicitations ${newAdmin.name}! Votre compte admin a été créé avec succès.`);
    showAdminPanel(adminSession);
}

function logoutAdmin() {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter du panneau admin?')) return;
    
    localStorage.removeItem('adminSession');
    localStorage.removeItem('currentUser');
    
    alert('Déconnexion réussie');
    showAdminLogin();
    
    // Rediriger vers l'accueil après déconnexion
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Fonction legacy pour compatibilité
function checkAdminAccess() {
    checkAdminSession();
}

function loadStatistics() {
    const stats = {
        users: JSON.parse(localStorage.getItem('users') || '[]').length,
        exams: JSON.parse(localStorage.getItem('exams') || '[]').length,
        courses: JSON.parse(localStorage.getItem('courses') || '[]').length,
        resources: JSON.parse(localStorage.getItem('resources') || '[]').length,
        classes: JSON.parse(localStorage.getItem('classes') || '[]').length,
        messages: JSON.parse(localStorage.getItem('conversations') || '[]').length,
        events: JSON.parse(localStorage.getItem('events') || '[]').length,
        results: JSON.parse(localStorage.getItem('examResults') || '[]').length
    };
    
    document.getElementById('totalUsers').textContent = stats.users;
    document.getElementById('totalExams').textContent = stats.exams;
    document.getElementById('totalCourses').textContent = stats.courses;
    document.getElementById('totalResources').textContent = stats.resources;
}

function loadUsersList() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersList = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersList.innerHTML = '<p style="text-align: center; color: #666;">Aucun utilisateur</p>';
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="data-item">
            <div>
                <div class="data-name">${user.prenom} ${user.nom}</div>
                <small style="color: #666;">${user.email} • ${user.matiere || 'Non spécifié'}</small>
            </div>
            <button class="btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteUser(${user.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function loadDataList() {
    const dataTypes = [
        { name: 'Utilisateurs', key: 'users', icon: 'users' },
        { name: 'Examens', key: 'exams', icon: 'question-circle' },
        { name: 'Cours', key: 'courses', icon: 'book' },
        { name: 'Ressources', key: 'resources', icon: 'file-alt' },
        { name: 'Classes', key: 'classes', icon: 'chalkboard' },
        { name: 'Messages', key: 'conversations', icon: 'envelope' },
        { name: 'Événements', key: 'events', icon: 'calendar' },
        { name: 'Résultats', key: 'examResults', icon: 'chart-line' },
        { name: 'Notifications', key: 'notifications', icon: 'bell' },
        { name: 'Messages de contact', key: 'contactMessages', icon: 'comments' }
    ];
    
    const dataList = document.getElementById('dataList');
    
    dataList.innerHTML = dataTypes.map(data => {
        const count = JSON.parse(localStorage.getItem(data.key) || '[]').length;
        return `
            <div class="data-item">
                <div class="data-name">
                    <i class="fas fa-${data.icon}"></i> ${data.name}
                </div>
                <span class="data-count">${count}</span>
            </div>
        `;
    }).join('');
}

function refreshStats() {
    loadStatistics();
    loadUsersList();
    loadDataList();
    showMessage('Statistiques actualisées', 'success');
}

function deleteUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userToDelete = users.find(u => u.id === userId);
    
    if (!userToDelete) return;
    
    if (!confirm(`Supprimer l'utilisateur ${userToDelete.prenom} ${userToDelete.nom}? Cette action supprimera également toutes ses données.`)) {
        return;
    }
    
    // Supprimer l'utilisateur
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Supprimer les données associées
    deleteUserData(userId);
    
    // Recharger
    loadStatistics();
    loadUsersList();
    loadDataList();
    
    showMessage(`Utilisateur ${userToDelete.prenom} ${userToDelete.nom} supprimé`, 'success');
}

function deleteUserData(userId) {
    // Supprimer les classes de l'utilisateur
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const updatedClasses = classes.filter(c => c.teacherId !== userId);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    
    // Supprimer les examens de l'utilisateur
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const updatedExams = exams.filter(e => e.teacherId !== userId);
    localStorage.setItem('exams', JSON.stringify(updatedExams));
    
    // Supprimer les cours de l'utilisateur
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const updatedCourses = courses.filter(c => c.teacherId !== userId);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
    // Supprimer les ressources de l'utilisateur
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const updatedResources = resources.filter(r => r.teacherId !== userId);
    localStorage.setItem('resources', JSON.stringify(updatedResources));
    
    // Supprimer les événements de l'utilisateur
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const updatedEvents = events.filter(e => e.teacherId !== userId);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
}

function confirmDeleteUsers() {
    currentAction = 'deleteUsers';
    showModal(
        'Supprimer tous les utilisateurs',
        'Êtes-vous sûr de vouloir supprimer TOUS les utilisateurs? Cette action est irréversible et supprimera toutes les données associées.',
        'deleteAllUsers'
    );
}

function confirmClearAllData() {
    currentAction = 'clearAll';
    showModal(
        'Effacer toutes les données',
        'Êtes-vous sûr de vouloir effacer TOUTES les données de la plateforme? Cette action est TOTALEMENT irréversible et supprimera absolument tout.',
        'clearAllData'
    );
}

function confirmClearTestData() {
    currentAction = 'clearTest';
    showModal(
        'Effacer les données de test',
        'Êtes-vous sûr de vouloir effacer uniquement les données de test? Cette action supprimera les données de démonstration mais conservera les vrais utilisateurs.',
        'clearTestData'
    );
}

function executeAction(action) {
    switch(action) {
        case 'deleteAllUsers':
            deleteAllUsers();
            break;
        case 'clearAllData':
            clearAllData();
            break;
        case 'clearTestData':
            clearTestData();
            break;
    }
    closeModal();
}

function deleteAllUsers() {
    // Garder seulement l'administrateur
    const adminUser = {
        id: 1,
        nom: 'Admin',
        prenom: 'EduProf',
        email: 'albinamani10@gmail.com',
        matiere: 'Administration',
        etablissement: 'EduProf',
        password: 'password123',
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify([adminUser]));
    
    // Effacer toutes les autres données
    clearAllDataExceptUsers();
    
    loadStatistics();
    loadUsersList();
    loadDataList();
    
    showMessage('Tous les utilisateurs ont été supprimés (sauf l\'administrateur)', 'success');
}

function clearAllData() {
    // Effacer toutes les données localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key !== 'currentUser') {
            localStorage.removeItem(key);
        }
    });
    
    // Recréer l'administrateur
    const adminUser = {
        id: 1,
        nom: 'Admin',
        prenom: 'EduProf',
        email: 'albinamani10@gmail.com',
        matiere: 'Administration',
        etablissement: 'EduProf',
        password: 'password123',
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify([adminUser]));
    
    loadStatistics();
    loadUsersList();
    loadDataList();
    
    showMessage('Toutes les données ont été effacées avec succès', 'success');
}

function clearAllDataExceptUsers() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key !== 'users' && key !== 'currentUser') {
            localStorage.removeItem(key);
        }
    });
}

function clearTestData() {
    // Identifier et supprimer uniquement les données de test
    const testPatterns = [
        'demo', 'test', 'Alice', 'Bob', 'Claire', 'David', 'Emma',
        'Martin', 'Dubois', 'Bernard', 'Pierre', 'Marie', 'Jean'
    ];
    
    // Supprimer les utilisateurs de test
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = users.find(u => u.email === 'albinamani10@gmail.com');
    users = users.filter(user => {
        return !testPatterns.some(pattern => 
            user.nom.toLowerCase().includes(pattern.toLowerCase()) ||
            user.prenom.toLowerCase().includes(pattern.toLowerCase()) ||
            user.email.toLowerCase().includes(pattern.toLowerCase())
        );
    });
    
    if (adminUser && !users.find(u => u.email === adminUser.email)) {
        users.push(adminUser);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Supprimer les données associées aux utilisateurs de test
    const testUserIds = JSON.parse(localStorage.getItem('users') || '[]')
        .filter(user => testPatterns.some(pattern => 
            user.nom.toLowerCase().includes(pattern.toLowerCase()) ||
            user.prenom.toLowerCase().includes(pattern.toLowerCase())
        ))
        .map(user => user.id);
    
    // Supprimer classes, examens, cours, etc. des utilisateurs de test
    ['classes', 'exams', 'courses', 'resources', 'events'].forEach(dataType => {
        let data = JSON.parse(localStorage.getItem(dataType) || '[]');
        data = data.filter(item => !testUserIds.includes(item.teacherId));
        localStorage.setItem(dataType, JSON.stringify(data));
    });
    
    loadStatistics();
    loadUsersList();
    loadDataList();
    
    showMessage('Données de test supprimées avec succès', 'success');
}

function exportData() {
    const exportData = {};
    
    // Collecter toutes les données
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key !== 'currentUser') {
            try {
                exportData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                exportData[key] = localStorage.getItem(key);
            }
        }
    });
    
    // Créer le fichier JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Télécharger le fichier
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `eduprof-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Données exportées avec succès', 'success');
}

function createBackup() {
    const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {}
    };
    
    // Collecter toutes les données
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key !== 'currentUser') {
            try {
                backupData.data[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                backupData.data[key] = localStorage.getItem(key);
            }
        }
    });
    
    // Sauvegarder la backup dans localStorage
    const backups = JSON.parse(localStorage.getItem('backups') || '[]');
    backups.push(backupData);
    
    // Garder seulement les 10 dernières sauvegardes
    if (backups.length > 10) {
        backups.shift();
    }
    
    localStorage.setItem('backups', JSON.stringify(backups));
    
    showMessage('Sauvegarde créée avec succès', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Importer les données
                Object.keys(importData).forEach(key => {
                    if (key !== 'currentUser') {
                        localStorage.setItem(key, JSON.stringify(importData[key]));
                    }
                });
                
                loadStatistics();
                loadUsersList();
                loadDataList();
                
                showMessage('Données importées avec succès', 'success');
            } catch (error) {
                showMessage('Erreur lors de l\'importation: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function showModal(title, message, action) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalConfirm').onclick = () => executeAction(action);
    document.getElementById('confirmModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
    currentAction = null;
}

function showMessage(text, type) {
    // Créer un message temporaire
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${text}
    `;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2000;
        max-width: 300px;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Faire disparaître après 3 secondes
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Fermer le modal en cliquant à l'extérieur
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
};

// ============================================
// GESTION DES CODES D'ACCÈS
// ============================================

function generateAccessCodes() {
    const type = document.getElementById('codeType').value;
    const count = parseInt(document.getElementById('codeCount').value) || 1;
    
    const generatedCodes = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
        const code = generateUniqueCode(type, timestamp + i);
        generatedCodes.push({
            code: code,
            type: type,
            createdAt: new Date().toISOString(),
            used: false,
            usedBy: null
        });
    }
    
    // Sauvegarder les codes
    const existingCodes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
    const allCodes = [...existingCodes, ...generatedCodes];
    localStorage.setItem('accessCodes', JSON.stringify(allCodes));
    
    // Afficher les codes
    displayGeneratedCodes(generatedCodes);
    showMessage(`${count} code(s) généré(s) avec succès!`, 'success');
}

function generateUniqueCode(type, seed) {
    const prefix = {
        'student': 'EDU-STU-',
        'teacher': 'EDU-TEC-',
        'premium': 'EDU-PRM-'
    }[type] || 'EDU-';
    
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = seed.toString(36).substring(0, 4).toUpperCase();
    
    return `${prefix}${random}${timestamp}`;
}

function displayGeneratedCodes(codes) {
    const codesList = document.getElementById('codesList');
    
    if (codes.length === 0) {
        codesList.innerHTML = '<p style="text-align: center; color: #666;">Aucun code généré</p>';
        return;
    }
    
    codesList.innerHTML = codes.map((code, index) => `
        <div class="data-item" style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-key" style="color: #9b59b6;"></i>
                <div>
                    <div class="data-name" style="font-family: monospace; font-size: 1.1rem; color: #9b59b6;">${code.code}</div>
                    <small style="color: #666;">${getCodeTypeLabel(code.type)} • ${new Date(code.createdAt).toLocaleDateString()}</small>
                </div>
            </div>
            <button class="btn-info" style="padding: 4px 8px; font-size: 0.8rem;" onclick="copyCode('${code.code}')">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    `).join('');
}

function getCodeTypeLabel(type) {
    const labels = {
        'student': 'Élève',
        'teacher': 'Professeur',
        'premium': 'Premium'
    };
    return labels[type] || type;
}

function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showMessage('Code copié!', 'success');
    });
}

function copyAllCodes() {
    const codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
    if (codes.length === 0) {
        showMessage('Aucun code à copier', 'error');
        return;
    }
    
    const text = codes.map(c => `${c.code} (${getCodeTypeLabel(c.type)})`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        showMessage(`${codes.length} codes copiés!`, 'success');
    });
}

function clearAllCodes() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les codes?')) return;
    
    localStorage.removeItem('accessCodes');
    displayGeneratedCodes([]);
    showMessage('Tous les codes ont été supprimés', 'success');
}

// ============================================
// GESTION DES MÉDIAS & PHOTOS
// ============================================

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    processImage(file);
}

function handleImageDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#e1e8ed';
    event.currentTarget.style.background = 'transparent';
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    } else {
        showMessage('Veuillez déposer une image valide', 'error');
    }
}

function processImage(file) {
    if (file.size > 5 * 1024 * 1024) {
        showMessage('L\'image ne doit pas dépasser 5MB', 'error');
        return;
    }
    
    const type = document.getElementById('imageType').value;
    const name = document.getElementById('imageName').value || file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = {
            id: Date.now(),
            name: name,
            type: type,
            dataUrl: e.target.result,
            originalName: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString()
        };
        
        // Sauvegarder l'image
        const images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
        images.push(imageData);
        localStorage.setItem('uploadedImages', JSON.stringify(images));
        
        showMessage('Image uploadée avec succès!', 'success');
        loadUploadedImages();
        
        // Reset le champ
        document.getElementById('imageName').value = '';
        document.getElementById('imageFile').value = '';
    };
    
    reader.readAsDataURL(file);
}

function loadUploadedImages() {
    const images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    const container = document.getElementById('uploadedImages');
    
    if (images.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Aucune image uploadée</p>';
        return;
    }
    
    container.innerHTML = images.map(img => `
        <div style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <img src="${img.dataUrl}" style="width: 100%; height: 80px; object-fit: cover; cursor: pointer;" onclick="viewImage(${img.id})" title="${img.name}">
            <div style="position: absolute; top: 2px; right: 2px;">
                <button onclick="deleteImage(${img.id})" style="background: #e74c3c; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 0.7rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 5px; background: white;">
                <small style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.7rem; color: #666;">${img.name}</small>
                <small style="font-size: 0.6rem; color: #999;">${getImageTypeLabel(img.type)}</small>
            </div>
        </div>
    `).join('');
}

function getImageTypeLabel(type) {
    const labels = {
        'course': 'Cours',
        'profile': 'Profil',
        'banner': 'Bannière',
        'resource': 'Ressource'
    };
    return labels[type] || type;
}

function viewImage(id) {
    const images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    const img = images.find(i => i.id === id);
    if (!img) return;
    
    // Créer un modal pour voir l'image en grand
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 3000; display: flex;
        align-items: center; justify-content: center; padding: 20px;
    `;
    modal.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 90%;">
            <img src="${img.dataUrl}" style="max-width: 100%; max-height: 85vh; border-radius: 10px;">
            <div style="text-align: center; color: white; margin-top: 10px;">
                <p style="margin: 0; font-size: 1.2rem;">${img.name}</p>
                <small>${getImageTypeLabel(img.type)} • ${new Date(img.uploadedAt).toLocaleDateString()}</small>
            </div>
            <button onclick="this.closest('.confirm-modal').remove()" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    modal.className = 'confirm-modal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

function deleteImage(id) {
    if (!confirm('Supprimer cette image?')) return;
    
    let images = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    images = images.filter(i => i.id !== id);
    localStorage.setItem('uploadedImages', JSON.stringify(images));
    
    loadUploadedImages();
    showMessage('Image supprimée', 'success');
}

function clearAllImages() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES les images?')) return;
    
    localStorage.removeItem('uploadedImages');
    loadUploadedImages();
    showMessage('Toutes les images ont été supprimées', 'success');
}

// ============================================
// CRÉATION RAPIDE
// ============================================

function quickCreate(type) {
    const pages = {
        'course': 'courses.html',
        'exam': 'exams.html',
        'resource': 'resources.html',
        'class': 'dashboard.html'
    };
    
    // Sauvegarder le mode création rapide
    sessionStorage.setItem('quickCreateMode', type);
    
    // Ouvrir la page avec un paramètre
    window.location.href = pages[type] + '?quickCreate=true';
}

// Initialisation des images au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Charger les images existantes
    setTimeout(loadUploadedImages, 100);
    
    // Charger les codes existants
    setTimeout(() => {
        const codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
        displayGeneratedCodes(codes.slice(-10)); // Afficher les 10 derniers
    }, 100);
});
