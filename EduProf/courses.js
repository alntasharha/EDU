// Vérification de l'authentification
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mettre à jour les informations utilisateur
    updateUserInterface(currentUser);
    
    // Charger les données
    loadClasses(currentUser);
    loadCourses(currentUser);
    
    // Initialiser les gestionnaires d'événements
    initializeEventHandlers();
    
    // Initialiser les données de démonstration
    initializeDemoData(currentUser);
});

function updateUserInterface(user) {
    document.getElementById('userName').textContent = `${user.prenom} ${user.nom}`;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userAvatar').textContent = user.prenom.charAt(0).toUpperCase();
}

function loadClasses(user) {
    const classSelect = document.getElementById('courseClass');
    const classes = getClassesForUser(user.id);
    
    classSelect.innerHTML = '<option value="">Toutes les classes</option>';
    
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = `${cls.name} - ${cls.level}`;
        classSelect.appendChild(option);
    });
}

function getClassesForUser(userId) {
    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    return allClasses.filter(cls => cls.teacherId === userId);
}

function loadCourses(user) {
    const courses = getCoursesForUser(user.id);
    displayCourses(courses);
}

function getCoursesForUser(userId) {
    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    return allCourses.filter(course => course.teacherId === userId);
}

function displayCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    
    if (courses.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-book-open"></i>
                <h3>Aucun cours</h3>
                <p>Commencez par ajouter votre premier cours PDF ou Word</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = courses.map(course => `
        <div class="course-card" data-id="${course.id}">
            <div class="course-header">
                <div class="course-icon ${course.fileType}">
                    <i class="fas fa-file-${getCourseIcon(course.fileType)}"></i>
                </div>
                <div class="course-info">
                    <div class="course-title">${course.title}</div>
                    <div class="course-meta">
                        ${course.subject} • ${course.level} ${course.className ? `• ${course.className}` : ''}
                    </div>
                </div>
            </div>
            ${course.description ? `<div class="course-description">${course.description}</div>` : ''}
            <div class="course-stats">
                <div class="course-stat">
                    <i class="fas fa-file"></i>
                    <span>${course.fileSize || 'N/A'}</span>
                </div>
                <div class="course-stat">
                    <i class="fas fa-download"></i>
                    <span>${course.downloads || 0} téléchargements</span>
                </div>
                <div class="course-stat">
                    <i class="fas fa-eye"></i>
                    <span>${course.views || 0} vues</span>
                </div>
            </div>
            <div class="course-actions">
                <button class="btn-small btn-view" onclick="viewCourse(${course.id})">
                    <i class="fas fa-eye"></i> Voir
                </button>
                <button class="btn-small btn-download" onclick="downloadCourse(${course.id})">
                    <i class="fas fa-download"></i> Télécharger
                </button>
                <button class="btn-small btn-share" onclick="shareCourse(${course.id})">
                    <i class="fas fa-share"></i> Partager
                </button>
                <button class="btn-small btn-edit" onclick="editCourse(${course.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-small btn-delete" onclick="deleteCourse(${course.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

function getCourseIcon(fileType) {
    const icons = {
        pdf: 'pdf',
        doc: 'word',
        docx: 'word',
        ppt: 'powerpoint',
        pptx: 'powerpoint',
        other: 'alt'
    };
    return icons[fileType] || 'alt';
}

function toggleCourseForm() {
    const form = document.getElementById('courseForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    
    if (form.style.display === 'block') {
        // Réinitialiser le formulaire
        document.getElementById('addCourseForm').reset();
        document.getElementById('fileInfo').style.display = 'none';
    }
}

function initializeEventHandlers() {
    // Gestion du drag & drop
    const uploadArea = document.getElementById('uploadArea');
    const courseFile = document.getElementById('courseFile');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    courseFile.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Gestion du formulaire
    document.getElementById('addCourseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addCourse();
    });
    
    // Gestion du fichier dans le formulaire
    document.getElementById('courseFileInput').addEventListener('change', function(e) {
        handleFormFile(e.target.files[0]);
    });
    
    // Gestion des filtres
    document.getElementById('searchInput').addEventListener('input', filterCourses);
    document.getElementById('subjectFilter').addEventListener('change', filterCourses);
    document.getElementById('levelFilter').addEventListener('change', filterCourses);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    
    if (!allowedTypes.includes(file.type)) {
        alert('Veuillez sélectionner un fichier PDF, Word ou PowerPoint valide.');
        return;
    }
    
    // Afficher le formulaire
    toggleCourseForm();
    
    // Pré-remplir avec les informations du fichier
    const fileName = file.name.split('.')[0];
    document.getElementById('courseTitle').value = fileName;
    
    // Détecter le type de fichier
    const fileType = getFileType(file);
    
    // Stocker le fichier pour utilisation ultérieure
    window.currentFile = file;
    
    // Afficher les informations du fichier
    handleFormFile(file);
}

function getFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    const typeMap = {
        'pdf': 'pdf',
        'doc': 'doc',
        'docx': 'doc',
        'ppt': 'ppt',
        'pptx': 'ppt'
    };
    
    return typeMap[extension] || 'other';
}

function handleFormFile(file) {
    if (!file) return;
    
    const fileInfo = document.getElementById('fileInfo');
    const fileSize = formatFileSize(file.size);
    
    fileInfo.innerHTML = `
        <i class="fas fa-file"></i> ${file.name} (${fileSize})
    `;
    fileInfo.style.display = 'block';
    
    // Stocker le fichier
    window.currentFile = file;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function addCourse() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Valider le formulaire
    const title = document.getElementById('courseTitle').value;
    const subject = document.getElementById('courseSubject').value;
    const level = document.getElementById('courseLevel').value;
    const classId = document.getElementById('courseClass').value;
    const description = document.getElementById('courseDescription').value;
    
    if (!title || !subject || !level) {
        alert('Veuillez remplir tous les champs obligatoires!');
        return;
    }
    
    if (!window.currentFile) {
        alert('Veuillez sélectionner un fichier!');
        return;
    }
    
    // Créer le cours
    const course = {
        id: Date.now(),
        title: title,
        subject: subject,
        level: level,
        classId: classId,
        className: getClassName(classId),
        description: description,
        fileName: window.currentFile.name,
        fileType: getFileType(window.currentFile),
        fileSize: formatFileSize(window.currentFile.size),
        teacherId: currentUser.id,
        createdAt: new Date().toISOString(),
        downloads: 0,
        views: 0,
        shared: false
    };
    
    // Simuler le stockage du fichier (en réalité, on stocke juste les métadonnées)
    // Dans une vraie application, le fichier serait uploadé sur un serveur
    
    // Sauvegarder le cours
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    courses.push(course);
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // Ajouter l'activité
    addActivity(currentUser.id, 'upload', `Nouveau cours ajouté: ${course.title}`);
    
    // Recharger les cours
    loadCourses(currentUser);
    
    // Masquer le formulaire
    toggleCourseForm();
    
    // Nettoyer
    window.currentFile = null;
    
    alert('Cours ajouté avec succès!');
}

function getClassName(classId) {
    if (!classId) return 'Toutes les classes';
    
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const cls = classes.find(c => c.id == classId);
    return cls ? `${cls.name} - ${cls.level}` : 'Inconnue';
}

function viewCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    
    if (course) {
        // Incrémenter les vues
        course.views = (course.views || 0) + 1;
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Afficher les détails du cours
        alert(`
COURS: ${course.title}

Matière: ${course.subject}
Niveau: ${course.level}
Classe: ${course.className || 'Toutes les classes'}

${course.description ? `Description:\n${course.description}\n\n` : ''}
Fichier: ${course.fileName}
Taille: ${course.fileSize}
Vues: ${course.views}
Téléchargements: ${course.downloads}

Note: Dans une vraie application, ce fichier serait ouvert dans un visualiseur PDF/Word.
        `);
        
        // Recharger pour mettre à jour les statistiques
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        loadCourses(currentUser);
    }
}

function downloadCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    
    if (course) {
        // Incrémenter les téléchargements
        course.downloads = (course.downloads || 0) + 1;
        localStorage.setItem('courses', JSON.stringify(courses));
        
        alert(`Téléchargement de: ${course.title}\nFichier: ${course.fileName}\nTaille: ${course.fileSize}\n\nDans une vraie application, le fichier serait téléchargé.`);
        
        // Recharger pour mettre à jour les statistiques
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        loadCourses(currentUser);
    }
}

function shareCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    
    if (course) {
        // Marquer comme partagé
        course.shared = true;
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Générer un lien de partage (simulation)
        const shareLink = `${window.location.origin}/course/${courseId}`;
        
        if (navigator.share) {
            navigator.share({
                title: course.title,
                text: course.description,
                url: shareLink
            });
        } else {
            prompt('Lien de partage:', shareLink);
        }
        
        alert(`Cours partagé: ${course.title}`);
    }
}

function editCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    
    if (!course) return;
    
    // Remplir le formulaire avec les données du cours
    document.getElementById('courseTitle').value = course.title;
    document.getElementById('courseSubject').value = course.subject;
    document.getElementById('courseLevel').value = course.level;
    document.getElementById('courseClass').value = course.classId || '';
    document.getElementById('courseDescription').value = course.description || '';
    
    // Afficher les informations du fichier
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.innerHTML = `
        <i class="fas fa-file"></i> ${course.fileName} (${course.fileSize})
        <br><small>Pour changer le fichier, sélectionnez-en un nouveau</small>
    `;
    fileInfo.style.display = 'block';
    
    // Afficher le formulaire
    const form = document.getElementById('courseForm');
    form.style.display = 'block';
    
    // Modifier le gestionnaire de soumission pour mettre à jour au lieu d'ajouter
    const formElement = document.getElementById('addCourseForm');
    formElement.onsubmit = function(e) {
        e.preventDefault();
        updateCourse(courseId);
    };
}

function updateCourse(courseId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Valider le formulaire
    const title = document.getElementById('courseTitle').value;
    const subject = document.getElementById('courseSubject').value;
    const level = document.getElementById('courseLevel').value;
    const classId = document.getElementById('courseClass').value;
    const description = document.getElementById('courseDescription').value;
    
    if (!title || !subject || !level) {
        alert('Veuillez remplir tous les champs obligatoires!');
        return;
    }
    
    // Mettre à jour le cours
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
        courses[courseIndex] = {
            ...courses[courseIndex],
            title: title,
            subject: subject,
            level: level,
            classId: classId,
            className: getClassName(classId),
            description: description,
            updatedAt: new Date().toISOString()
        };
        
        // Si un nouveau fichier est sélectionné, mettre à jour les infos du fichier
        if (window.currentFile) {
            courses[courseIndex].fileName = window.currentFile.name;
            courses[courseIndex].fileType = getFileType(window.currentFile);
            courses[courseIndex].fileSize = formatFileSize(window.currentFile.size);
        }
        
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Ajouter l'activité
        addActivity(currentUser.id, 'edit', `Cours modifié: ${title}`);
        
        // Recharger les cours
        loadCourses(currentUser);
        
        // Masquer le formulaire
        toggleCourseForm();
        
        // Restaurer le gestionnaire de soumission
        document.getElementById('addCourseForm').onsubmit = function(e) {
            e.preventDefault();
            addCourse();
        };
        
        // Nettoyer
        window.currentFile = null;
        
        alert('Cours mis à jour avec succès!');
    }
}

function deleteCourse(courseId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours?')) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    
    if (!course) return;
    
    // Supprimer le cours
    const updatedCourses = courses.filter(c => c.id !== courseId);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
    // Ajouter l'activité
    addActivity(currentUser.id, 'delete', `Cours supprimé: ${course.title}`);
    
    // Recharger les cours
    loadCourses(currentUser);
    
    alert('Cours supprimé avec succès!');
}

function filterCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const subjectFilter = document.getElementById('subjectFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const courses = getCoursesForUser(currentUser.id);
    
    const filteredCourses = courses.filter(course => {
        const matchesSearch = !searchTerm || 
            course.title.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm);
        
        const matchesSubject = !subjectFilter || course.subject === subjectFilter;
        const matchesLevel = !levelFilter || course.level === levelFilter;
        
        return matchesSearch && matchesSubject && matchesLevel;
    });
    
    displayCourses(filteredCourses);
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

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

function initializeDemoData(user) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const userCourses = courses.filter(course => course.teacherId === user.id);
    
    if (userCourses.length === 0) {
        const demoCourses = [
            {
                id: Date.now() + 1,
                title: 'Chapitre 3: Les fractions',
                subject: 'maths',
                level: '4eme',
                classId: null,
                className: 'Toutes les classes',
                description: 'Cours complet sur les fractions numériques avec exercices corrigés',
                fileName: 'fractions_chap3.pdf',
                fileType: 'pdf',
                fileSize: '2.5 MB',
                teacherId: user.id,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                downloads: 12,
                views: 45,
                shared: true
            },
            {
                id: Date.now() + 2,
                title: 'Révolution française',
                subject: 'histoire',
                level: '4eme',
                classId: null,
                className: 'Toutes les classes',
                description: 'Présentation PowerPoint sur les causes et conséquences de la Révolution française',
                fileName: 'revolution_francaise.pptx',
                fileType: 'ppt',
                fileSize: '5.2 MB',
                teacherId: user.id,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                downloads: 8,
                views: 23,
                shared: false
            },
            {
                id: Date.now() + 3,
                title: 'Exercices de grammaire',
                subject: 'francais',
                level: '3eme',
                classId: null,
                className: 'Toutes les classes',
                description: 'Série d\'exercices sur les accords et la conjugaison',
                fileName: 'exercices_grammaire.docx',
                fileType: 'doc',
                fileSize: '1.8 MB',
                teacherId: user.id,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                downloads: 15,
                views: 67,
                shared: true
            }
        ];
        
        courses.push(...demoCourses);
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Recharger les cours
        loadCourses(user);
    }
}
