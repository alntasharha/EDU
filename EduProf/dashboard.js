// Vérification de l'authentification
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mettre à jour les informations utilisateur
    updateUserInterface(currentUser);
    
    // Charger les données du dashboard
    loadDashboardData(currentUser);
    
    // Initialiser les gestionnaires d'événements
    initializeEventHandlers();
    
    // Initialiser la recherche globale
    initializeGlobalSearch();
});

function updateUserInterface(user) {
    // Vérifier si les éléments existent (pour éviter les erreurs)
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarInitialEl = document.getElementById('userAvatarInitial');
    const userAvatarImgEl = document.getElementById('userAvatarImg');
    
    if (userNameEl) userNameEl.textContent = `${user.prenom} ${user.nom}`;
    if (userEmailEl) userEmailEl.textContent = user.email;
    
    // Gérer l'avatar - photo ou initiale
    if (userAvatarInitialEl) {
        if (user.profilePhoto) {
            userAvatarInitialEl.style.display = 'none';
            if (userAvatarImgEl) {
                userAvatarImgEl.src = user.profilePhoto;
                userAvatarImgEl.style.display = 'block';
            }
        } else {
            userAvatarInitialEl.textContent = user.prenom.charAt(0).toUpperCase();
            userAvatarInitialEl.style.display = 'flex';
            if (userAvatarImgEl) {
                userAvatarImgEl.style.display = 'none';
            }
        }
    }
}

// ============================================
// GESTION DU PROFIL ET PHOTO
// ============================================

let tempProfilePhoto = null;

function openProfileModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Remplir les champs
    document.getElementById('modalUserName').textContent = `${currentUser.prenom} ${currentUser.nom}`;
    document.getElementById('modalUserEmail').textContent = currentUser.email;
    document.getElementById('profileFirstName').value = currentUser.prenom || '';
    document.getElementById('profileLastName').value = currentUser.nom || '';
    document.getElementById('profileSubject').value = currentUser.matiere || '';
    document.getElementById('profileSchool').value = currentUser.etablissement || '';
    
    // Mettre à jour l'avatar dans le modal
    const modalAvatarInitial = document.getElementById('modalAvatarInitial');
    const modalAvatarImg = document.getElementById('modalAvatarImg');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    
    tempProfilePhoto = currentUser.profilePhoto || null;
    
    if (currentUser.profilePhoto) {
        modalAvatarInitial.style.display = 'none';
        modalAvatarImg.src = currentUser.profilePhoto;
        modalAvatarImg.style.display = 'block';
        removePhotoBtn.style.display = 'inline-block';
    } else {
        modalAvatarInitial.textContent = currentUser.prenom.charAt(0).toUpperCase();
        modalAvatarInitial.style.display = 'flex';
        modalAvatarImg.style.display = 'none';
        removePhotoBtn.style.display = 'none';
    }
    
    // Afficher le modal
    document.getElementById('profileModal').classList.add('active');
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('active');
    tempProfilePhoto = null;
}

function closeProfileModalOnOutsideClick(event) {
    if (event.target.id === 'profileModal') {
        closeProfileModal();
    }
}

function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    processProfilePhoto(file);
}

function handleProfilePhotoDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#e1e8ed';
    event.currentTarget.style.background = 'transparent';
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processProfilePhoto(file);
    } else {
        alert('Veuillez déposer une image valide (JPG, PNG)');
    }
}

function processProfilePhoto(file) {
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
    }
    
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        tempProfilePhoto = e.target.result;
        
        // Mettre à jour l'aperçu dans le modal
        const modalAvatarInitial = document.getElementById('modalAvatarInitial');
        const modalAvatarImg = document.getElementById('modalAvatarImg');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        modalAvatarInitial.style.display = 'none';
        modalAvatarImg.src = tempProfilePhoto;
        modalAvatarImg.style.display = 'block';
        removePhotoBtn.style.display = 'inline-block';
    };
    
    reader.readAsDataURL(file);
}

function removeProfilePhoto() {
    if (!confirm('Supprimer votre photo de profil?')) return;
    
    tempProfilePhoto = null;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const modalAvatarInitial = document.getElementById('modalAvatarInitial');
    const modalAvatarImg = document.getElementById('modalAvatarImg');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    
    modalAvatarImg.style.display = 'none';
    modalAvatarInitial.textContent = currentUser.prenom.charAt(0).toUpperCase();
    modalAvatarInitial.style.display = 'flex';
    removePhotoBtn.style.display = 'none';
}

function saveProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Récupérer les nouvelles valeurs
    const prenom = document.getElementById('profileFirstName').value.trim();
    const nom = document.getElementById('profileLastName').value.trim();
    const matiere = document.getElementById('profileSubject').value.trim();
    const etablissement = document.getElementById('profileSchool').value.trim();
    
    // Validation
    if (!prenom || !nom) {
        alert('Veuillez remplir le nom et le prénom');
        return;
    }
    
    // Mettre à jour l'utilisateur
    currentUser.prenom = prenom;
    currentUser.nom = nom;
    currentUser.matiere = matiere;
    currentUser.etablissement = etablissement;
    
    // Mettre à jour la photo si elle a changé
    if (tempProfilePhoto !== undefined) {
        if (tempProfilePhoto) {
            currentUser.profilePhoto = tempProfilePhoto;
        } else {
            delete currentUser.profilePhoto;
        }
    }
    
    // Sauvegarder
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Mettre à jour aussi dans la liste des utilisateurs
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Mettre à jour l'interface
    updateUserInterface(currentUser);
    
    // Fermer le modal
    closeProfileModal();
    
    // Message de succès
    alert('Profil mis à jour avec succès!');
}

function loadDashboardData(user) {
    // Charger les classes
    const classes = getClassesForUser(user.id);
    displayClasses(classes);
    
    // Charger les statistiques
    updateStatistics(classes, user.id);
    
    // Charger les activités récentes
    loadRecentActivities(user.id);
}

function getClassesForUser(userId) {
    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    return allClasses.filter(cls => cls.teacherId === userId);
}

function displayClasses(classes) {
    const grid = document.getElementById('classesGrid');
    
    if (classes.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>Vous n'avez pas encore de classe.</p>
                <button class="btn-add" onclick="addClass()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Créer votre première classe
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = classes.map(cls => `
        <div class="class-card">
            <h3>${cls.name}</h3>
            <div class="class-info">
                <p><i class="fas fa-building"></i> ${cls.level}</p>
                <p><i class="fas fa-user-graduate"></i> ${cls.studentCount || 0} élèves</p>
                <p><i class="fas fa-book"></i> ${cls.subject}</p>
            </div>
            <div class="class-actions">
                <button class="btn-small btn-view" onclick="viewClass(${cls.id})">
                    <i class="fas fa-eye"></i> Voir
                </button>
                <button class="btn-small btn-edit" onclick="editClass(${cls.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-small btn-delete" onclick="deleteClass(${cls.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

function updateStatistics(classes, userId) {
    // Nombre de classes
    document.getElementById('classCount').textContent = classes.length;
    
    // Nombre total d'élèves
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
    document.getElementById('studentCount').textContent = totalStudents;
    
    // Nombre de ressources
    const resources = getResourcesForUser(userId);
    document.getElementById('resourceCount').textContent = resources.length;
    
    // Nombre de cours
    const courses = getCoursesForUser(userId);
    const courseCount = document.getElementById('courseCount') || createStatCard('courseCount', 'Cours', courses.length);
    courseCount.textContent = courses.length;
    
    // Nombre d'examens
    const exams = getExamsForUser(userId);
    const examCount = document.getElementById('examCount') || createStatCard('examCount', 'Examens', exams.length);
    examCount.textContent = exams.length;
    
    // Nombre de devoirs
    const assignments = getAssignmentsForUser(userId);
    const assignmentCount = document.getElementById('assignmentCount') || createStatCard('assignmentCount', 'Devoirs', assignments.length);
    assignmentCount.textContent = assignments.length;
    
    // Nombre de notes
    const grades = getGradesForUser(userId);
    const gradeCount = document.getElementById('gradeCount') || createStatCard('gradeCount', 'Notes', grades.length);
    gradeCount.textContent = grades.length;
    
    // Cours à venir (simulation)
    const upcomingClasses = Math.floor(Math.random() * 10) + 1;
    document.getElementById('upcomingCount').textContent = upcomingClasses;
}

function createStatCard(id, label, value) {
    const statsGrid = document.querySelector('.stats-grid');
    const newCard = document.createElement('div');
    newCard.className = 'stat-card';
    newCard.innerHTML = `
        <i class="fas fa-${getIconForStat(label)}"></i>
        <div class="stat-number" id="${id}">${value}</div>
        <div class="stat-label">${label}</div>
    `;
    statsGrid.appendChild(newCard);
    return document.getElementById(id);
}

function getIconForStat(label) {
    const icons = {
        'Cours': 'book',
        'Examens': 'question-circle',
        'Devoirs': 'tasks',
        'Notes': 'chart-line',
        'default': 'chart-line'
    };
    return icons[label] || icons['default'];
}

function getCoursesForUser(userId) {
    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    return allCourses.filter(course => course.teacherId === userId);
}

function getExamsForUser(userId) {
    const allExams = JSON.parse(localStorage.getItem('exams') || '[]');
    return allExams.filter(exam => exam.teacherId === userId);
}

function getAssignmentsForUser(userId) {
    const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    return allAssignments.filter(assignment => assignment.teacherId === userId);
}

function getGradesForUser(userId) {
    const allGrades = JSON.parse(localStorage.getItem('grades') || '[]');
    return allGrades.filter(grade => grade.teacherId === userId);
}

function getResourcesForUser(userId) {
    const allResources = JSON.parse(localStorage.getItem('resources') || '[]');
    return allResources.filter(res => res.teacherId === userId);
}

function loadRecentActivities(userId) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const userActivities = activities.filter(act => act.teacherId === userId).slice(0, 5);
    
    const container = document.getElementById('recentActivities');
    
    if (userActivities.length === 0) {
        container.innerHTML = `
            <li style="text-align: center; padding: 20px; color: #666;">
                Aucune activité récente
            </li>
        `;
        return;
    }
    
    container.innerHTML = userActivities.map(activity => `
        <li class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${formatDate(activity.timestamp)}</div>
            </div>
        </li>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        add: 'plus',
        edit: 'edit',
        delete: 'trash',
        upload: 'upload',
        share: 'share'
    };
    return icons[type] || 'circle';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return "Aujourd'hui";
    } else if (diffDays === 1) {
        return 'Hier';
    } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
    } else {
        return date.toLocaleDateString('fr-FR');
    }
}

function addClass() {
    const className = prompt('Nom de la classe:');
    if (!className) return;
    
    const level = prompt('Niveau (ex: 3ème, 2nde, etc.):');
    if (!level) return;
    
    const subject = prompt('Matière:');
    if (!subject) return;
    
    const studentCount = parseInt(prompt('Nombre d\'élèves:') || '0');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    
    const newClass = {
        id: Date.now(),
        name: className,
        level: level,
        subject: subject,
        studentCount: studentCount,
        teacherId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Ajouter l'activité
    addActivity(currentUser.id, 'add', `Nouvelle classe créée: ${className}`);
    
    // Recharger les données
    loadDashboardData(currentUser);
    
    alert('Classe ajoutée avec succès!');
}

function viewClass(classId) {
    alert(`Affichage des détails de la classe ${classId}`);
    // Ici vous pourriez rediriger vers une page détaillée
}

function editClass(classId) {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const classToEdit = classes.find(cls => cls.id === classId);
    
    if (!classToEdit) return;
    
    const newName = prompt('Nom de la classe:', classToEdit.name);
    if (!newName) return;
    
    const newLevel = prompt('Niveau:', classToEdit.level);
    if (!newLevel) return;
    
    const newSubject = prompt('Matière:', classToEdit.subject);
    if (!newSubject) return;
    
    const newStudentCount = parseInt(prompt('Nombre d\'élèves:', classToEdit.studentCount) || '0');
    
    // Mettre à jour la classe
    classToEdit.name = newName;
    classToEdit.level = newLevel;
    classToEdit.subject = newSubject;
    classToEdit.studentCount = newStudentCount;
    
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // Ajouter l'activité
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    addActivity(currentUser.id, 'edit', `Classe modifiée: ${newName}`);
    
    // Recharger les données
    loadDashboardData(currentUser);
    
    alert('Classe modifiée avec succès!');
}

function deleteClass(classId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe?')) return;
    
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const classToDelete = classes.find(cls => cls.id === classId);
    
    if (!classToDelete) return;
    
    // Supprimer la classe
    const updatedClasses = classes.filter(cls => cls.id !== classId);
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
    
    // Ajouter l'activité
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    addActivity(currentUser.id, 'delete', `Classe supprimée: ${classToDelete.name}`);
    
    // Recharger les données
    loadDashboardData(currentUser);
    
    alert('Classe supprimée avec succès!');
}

function addActivity(userId, type, title) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    const newActivity = {
        id: Date.now(),
        teacherId: userId,
        type: type,
        title: title,
        timestamp: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    localStorage.setItem('activities', JSON.stringify(activities));
}

function initializeEventHandlers() {
    // Gestion du menu sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Si c'est un lien externe (vers une autre page), laisser la navigation normale
            if (href.includes('.html')) {
                // Navigation normale vers une autre page
                return true;
            }
            
            // Si c'est un lien interne (ancre), empêcher le comportement par défaut
            e.preventDefault();
            
            // Retirer la classe active de tous les liens
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Ajouter la classe active au lien cliqué
            this.classList.add('active');
            
            // Ici vous pourriez charger différentes sections du dashboard
            const section = this.getAttribute('href').substring(1);
            console.log(`Navigation vers: ${section}`);
        });
    });
    
    // Gestion du menu mobile
    const sidebar = document.getElementById('sidebar');
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX - touchStartX > 50) {
            sidebar.classList.add('active');
        }
        if (touchStartX - touchEndX > 50) {
            sidebar.classList.remove('active');
        }
    }
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Simulation de données pour démonstration
function initializeDemoData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Ajouter des classes de démonstration si aucune n'existe
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const userClasses = classes.filter(cls => cls.teacherId === currentUser.id);
    
    if (userClasses.length === 0) {
        const demoClasses = [
            {
                id: Date.now() + 1,
                name: '3ème A',
                level: '3ème',
                subject: 'Mathématiques',
                studentCount: 28,
                teacherId: currentUser.id,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                name: '2nde B',
                level: '2nde',
                subject: 'Mathématiques',
                studentCount: 32,
                teacherId: currentUser.id,
                createdAt: new Date().toISOString()
            }
        ];
        
        classes.push(...demoClasses);
        localStorage.setItem('classes', JSON.stringify(classes));
        
        // Ajouter des activités de démonstration
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const demoActivities = [
            {
                id: Date.now() + 3,
                teacherId: currentUser.id,
                type: 'add',
                title: 'Nouvelle classe créée: 3ème A',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: Date.now() + 4,
                teacherId: currentUser.id,
                type: 'upload',
                title: 'Ressource ajoutée: Exercices sur les fractions',
                timestamp: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        activities.push(...demoActivities);
        localStorage.setItem('activities', JSON.stringify(activities));
    }
}

// Initialiser les données de démonstration
initializeDemoData();

// Fonction de recherche globale
function initializeGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm.length < 2) {
            clearSearchResults();
            return;
        }
        
        performGlobalSearch(searchTerm);
    });
    
    // Effacer les résultats lors du focus
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
            performGlobalSearch(this.value.toLowerCase().trim());
        }
    });
}

function performGlobalSearch(searchTerm) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Récupérer toutes les données
    const classes = getClassesForUser(currentUser.id);
    const courses = getCoursesForUser(currentUser.id);
    const exams = getExamsForUser(currentUser.id);
    const assignments = getAssignmentsForUser(currentUser.id);
    const resources = getResourcesForUser(currentUser.id);
    
    // Rechercher dans chaque type de contenu
    const results = {
        classes: classes.filter(cls => 
            cls.name.toLowerCase().includes(searchTerm) || 
            cls.level.toLowerCase().includes(searchTerm) ||
            cls.subject.toLowerCase().includes(searchTerm)
        ),
        courses: courses.filter(course => 
            course.title.toLowerCase().includes(searchTerm) || 
            course.description.toLowerCase().includes(searchTerm) ||
            course.subject.toLowerCase().includes(searchTerm)
        ),
        exams: exams.filter(exam => 
            exam.title.toLowerCase().includes(searchTerm) || 
            exam.subject.toLowerCase().includes(searchTerm)
        ),
        assignments: assignments.filter(assignment => 
            assignment.title.toLowerCase().includes(searchTerm) || 
            assignment.description.toLowerCase().includes(searchTerm) ||
            assignment.subject.toLowerCase().includes(searchTerm)
        ),
        resources: resources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm) || 
            resource.description.toLowerCase().includes(searchTerm) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
    };
    
    displaySearchResults(results, searchTerm);
}

function displaySearchResults(results, searchTerm) {
    // Créer ou mettre à jour le conteneur de résultats
    let resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'search-results';
        document.querySelector('.search-bar').appendChild(resultsContainer);
    }
    
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalResults === 0) {
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>Aucun résultat trouvé pour "${searchTerm}"</p>
            </div>
        `;
        return;
    }
    
    let html = `<div class="search-results-header">${totalResults} résultat(s) trouvé(s)</div>`;
    
    // Afficher les résultats par catégorie
    Object.entries(results).forEach(([category, items]) => {
        if (items.length > 0) {
            html += `
                <div class="search-category">
                    <h4>${getCategoryLabel(category)}</h4>
                    <div class="search-items">
                        ${items.map(item => createSearchResultItem(category, item)).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    resultsContainer.innerHTML = html;
}

function createSearchResultItem(category, item) {
    const icons = {
        classes: 'users',
        courses: 'book',
        exams: 'question-circle',
        assignments: 'tasks',
        resources: 'file-alt'
    };
    
    const links = {
        classes: '#classes',
        courses: 'courses.html',
        exams: 'exams.html',
        assignments: 'assignments.html',
        resources: 'resources.html'
    };
    
    return `
        <div class="search-result-item" onclick="handleSearchResult('${category}', ${item.id})">
            <i class="fas fa-${icons[category]}"></i>
            <div class="search-result-content">
                <div class="search-result-title">${item.title || item.name}</div>
                <div class="search-result-subtitle">${item.subject || item.level || ''}</div>
            </div>
        </div>
    `;
}

function getCategoryLabel(category) {
    const labels = {
        classes: 'Classes',
        courses: 'Cours',
        exams: 'Examens',
        assignments: 'Devoirs',
        resources: 'Ressources'
    };
    return labels[category] || category;
}

function handleSearchResult(category, itemId) {
    // Rediriger vers la page appropriée avec l'ID
    const links = {
        classes: '#classes',
        courses: 'courses.html',
        exams: 'exams.html',
        assignments: 'assignments.html',
        resources: 'resources.html'
    };
    
    if (category === 'classes') {
        // Pour les classes, rester sur la page et scroller vers la section
        const element = document.querySelector(`[data-class-id="${itemId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.style.animation = 'highlight 2s ease';
        }
    } else {
        // Pour les autres catégories, rediriger vers la page appropriée
        window.location.href = `${links[category]}?id=${itemId}`;
    }
    
    clearSearchResults();
}

function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}
