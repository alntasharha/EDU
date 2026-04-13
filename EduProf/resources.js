// Vérification de l'authentification
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mettre à jour les informations utilisateur
    updateUserInterface(currentUser);
    
    // Charger les ressources
    loadResources(currentUser);
    
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

function initializeEventHandlers() {
    // Gestion du drag & drop
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
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
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Gestion du formulaire
    document.getElementById('addResourceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addResource();
    });
    
    // Gestion des filtres
    document.getElementById('searchInput').addEventListener('input', filterResources);
    document.getElementById('typeFilter').addEventListener('change', filterResources);
    document.getElementById('subjectFilter').addEventListener('change', filterResources);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    // Afficher le formulaire pour le premier fichier
    showResourceForm();
    
    // Pré-remplir le titre avec le nom du fichier
    const fileName = files[0].name.split('.')[0];
    document.getElementById('resourceTitle').value = fileName;
    
    // Détecter le type de fichier
    const fileType = getFileType(files[0]);
    document.getElementById('resourceType').value = fileType;
}

function getFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    const typeMap = {
        'pdf': 'pdf',
        'doc': 'doc',
        'docx': 'doc',
        'mp4': 'video',
        'avi': 'video',
        'mov': 'video',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image'
    };
    
    return typeMap[extension] || 'other';
}

function showResourceForm() {
    document.getElementById('resourceForm').style.display = 'block';
    document.getElementById('uploadArea').style.display = 'none';
}

function hideResourceForm() {
    document.getElementById('resourceForm').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('addResourceForm').reset();
}

function addResource() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const resource = {
        id: Date.now(),
        title: document.getElementById('resourceTitle').value,
        type: document.getElementById('resourceType').value,
        subject: document.getElementById('resourceSubject').value,
        level: document.getElementById('resourceLevel').value,
        description: document.getElementById('resourceDescription').value,
        tags: document.getElementById('resourceTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        teacherId: currentUser.id,
        createdAt: new Date().toISOString(),
        downloads: 0,
        shared: false,
        favorite: false
    };
    
    // Sauvegarder la ressource
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    resources.push(resource);
    localStorage.setItem('resources', JSON.stringify(resources));
    
    // Ajouter l'activité
    addActivity(currentUser.id, 'upload', `Nouvelle ressource ajoutée: ${resource.title}`);
    
    // Masquer le formulaire
    hideResourceForm();
    
    // Recharger les ressources
    loadResources(currentUser);
    
    alert('Ressource ajoutée avec succès!');
}

function loadResources(user) {
    const resources = getResourcesForUser(user.id);
    displayResources(resources);
}

function getResourcesForUser(userId) {
    const allResources = JSON.parse(localStorage.getItem('resources') || '[]');
    return allResources.filter(res => res.teacherId === userId);
}

function displayResources(resources) {
    const grid = document.getElementById('resourcesGrid');
    
    if (resources.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-folder-open"></i>
                <h3>Aucune ressource</h3>
                <p>Commencez par ajouter votre première ressource pédagogique</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = resources.map(resource => `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-header">
                <div class="resource-icon ${resource.type}">
                    <i class="fas fa-${getResourceIcon(resource.type)}"></i>
                </div>
                <div class="resource-info">
                    <div class="resource-title">${resource.title}</div>
                    <div class="resource-meta">
                        ${resource.subject} • ${resource.level} • ${formatDate(resource.createdAt)}
                    </div>
                </div>
            </div>
            ${resource.description ? `<div class="resource-description">${resource.description}</div>` : ''}
            ${resource.tags.length > 0 ? `
                <div class="resource-tags">
                    ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="resource-actions">
                <button class="btn-small btn-download" onclick="downloadResource(${resource.id})">
                    <i class="fas fa-download"></i> Télécharger
                </button>
                <button class="btn-small btn-share" onclick="shareResource(${resource.id})">
                    <i class="fas fa-share"></i> Partager
                </button>
                <button class="btn-small btn-edit" onclick="editResource(${resource.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-small btn-delete" onclick="deleteResource(${resource.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

function getResourceIcon(type) {
    const icons = {
        pdf: 'file-pdf',
        doc: 'file-word',
        video: 'video',
        image: 'image',
        other: 'file'
    };
    return icons[type] || 'file';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR');
}

function filterResources() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const subjectFilter = document.getElementById('subjectFilter').value;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const resources = getResourcesForUser(currentUser.id);
    
    const filteredResources = resources.filter(resource => {
        const matchesSearch = !searchTerm || 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.description.toLowerCase().includes(searchTerm) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesType = !typeFilter || resource.type === typeFilter;
        const matchesSubject = !subjectFilter || resource.subject === subjectFilter;
        
        return matchesSearch && matchesType && matchesSubject;
    });
    
    displayResources(filteredResources);
}

function downloadResource(resourceId) {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource) {
        // Incrémenter le compteur de téléchargements
        resource.downloads = (resource.downloads || 0) + 1;
        localStorage.setItem('resources', JSON.stringify(resources));
        
        alert(`Téléchargement de: ${resource.title}\nTéléchargements: ${resource.downloads}`);
    }
}

function shareResource(resourceId) {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource) {
        // Marquer comme partagé
        resource.shared = true;
        localStorage.setItem('resources', JSON.stringify(resources));
        
        // Générer un lien de partage (simulation)
        const shareLink = `${window.location.origin}/shared/${resourceId}`;
        
        if (navigator.share) {
            navigator.share({
                title: resource.title,
                text: resource.description,
                url: shareLink
            });
        } else {
            prompt('Lien de partage:', shareLink);
        }
        
        alert(`Ressource partagée: ${resource.title}`);
    }
}

function editResource(resourceId) {
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) return;
    
    // Remplir le formulaire avec les données de la ressource
    document.getElementById('resourceTitle').value = resource.title;
    document.getElementById('resourceType').value = resource.type;
    document.getElementById('resourceSubject').value = resource.subject;
    document.getElementById('resourceLevel').value = resource.level;
    document.getElementById('resourceDescription').value = resource.description;
    document.getElementById('resourceTags').value = resource.tags.join(', ');
    
    // Afficher le formulaire
    showResourceForm();
    
    // Modifier le gestionnaire de soumission pour mettre à jour au lieu d'ajouter
    const form = document.getElementById('addResourceForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Mettre à jour la ressource
        resource.title = document.getElementById('resourceTitle').value;
        resource.type = document.getElementById('resourceType').value;
        resource.subject = document.getElementById('resourceSubject').value;
        resource.level = document.getElementById('resourceLevel').value;
        resource.description = document.getElementById('resourceDescription').value;
        resource.tags = document.getElementById('resourceTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        localStorage.setItem('resources', JSON.stringify(resources));
        
        // Ajouter l'activité
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        addActivity(currentUser.id, 'edit', `Ressource modifiée: ${resource.title}`);
        
        // Réinitialiser le formulaire
        hideResourceForm();
        form.onsubmit = function(e) {
            e.preventDefault();
            addResource();
        };
        
        // Recharger les ressources
        loadResources(currentUser);
        
        alert('Ressource modifiée avec succès!');
    };
}

function deleteResource(resourceId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource?')) return;
    
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) return;
    
    // Supprimer la ressource
    const updatedResources = resources.filter(r => r.id !== resourceId);
    localStorage.setItem('resources', JSON.stringify(updatedResources));
    
    // Ajouter l'activité
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    addActivity(currentUser.id, 'delete', `Ressource supprimée: ${resource.title}`);
    
    // Recharger les ressources
    loadResources(currentUser);
    
    alert('Ressource supprimée avec succès!');
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
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const userResources = resources.filter(res => res.teacherId === user.id);
    
    if (userResources.length === 0) {
        const demoResources = [
            {
                id: Date.now() + 1,
                title: 'Exercices sur les fractions',
                type: 'pdf',
                subject: 'maths',
                level: '4eme',
                description: 'Série d\'exercices sur les fractions pour les élèves de 4ème',
                tags: ['exercices', 'fractions', '4ème'],
                teacherId: user.id,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                downloads: 5,
                shared: true,
                favorite: true
            },
            {
                id: Date.now() + 2,
                title: 'Vidéo: Révolution française',
                type: 'video',
                subject: 'histoire',
                level: '4eme',
                description: 'Documentaire vidéo sur la Révolution française',
                tags: ['vidéo', 'révolution', 'histoire'],
                teacherId: user.id,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                downloads: 12,
                shared: false,
                favorite: false
            },
            {
                id: Date.now() + 3,
                title: 'Évaluation grammaire',
                type: 'doc',
                subject: 'francais',
                level: '3eme',
                description: 'Évaluation sur les points de grammaire essentiels',
                tags: ['évaluation', 'grammaire', '3ème'],
                teacherId: user.id,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                downloads: 8,
                shared: true,
                favorite: true
            }
        ];
        
        resources.push(...demoResources);
        localStorage.setItem('resources', JSON.stringify(resources));
        
        // Recharger les ressources
        loadResources(user);
    }
}
