// Variables globales
let currentUser = null;
let assignments = [];
let classes = [];
let currentAssignmentId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mettre à jour l'interface utilisateur
    updateUserInterface();
    
    // Charger les données
    loadClasses();
    loadAssignments();
    
    // Initialiser les gestionnaires d'événements
    initializeEventHandlers();
    
    // Initialiser les données de démonstration
    initializeDemoData();
});

function updateUserInterface() {
    document.getElementById('userName').textContent = `${currentUser.prenom} ${currentUser.nom}`;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.prenom.charAt(0).toUpperCase();
}

function loadClasses() {
    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    classes = allClasses.filter(cls => cls.teacherId === currentUser.id);
    
    // Mettre à jour les filtres
    const classFilter = document.getElementById('classFilter');
    classFilter.innerHTML = '<option value="">Toutes les classes</option>';
    
    const assignmentClass = document.getElementById('assignmentClass');
    assignmentClass.innerHTML = '<option value="">Sélectionner une classe</option>';
    
    classes.forEach(cls => {
        const option1 = document.createElement('option');
        option1.value = cls.id;
        option1.textContent = `${cls.name} - ${cls.level}`;
        classFilter.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = cls.id;
        option2.textContent = `${cls.name} - ${cls.level}`;
        assignmentClass.appendChild(option2);
    });
}

function loadAssignments() {
    const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    assignments = allAssignments.filter(assignment => assignment.teacherId === currentUser.id);
    
    // Filtrer selon les sélections
    const classId = document.getElementById('classFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filteredAssignments = assignments;
    
    if (classId) {
        filteredAssignments = filteredAssignments.filter(assignment => assignment.classId === classId);
    }
    
    if (status) {
        filteredAssignments = filteredAssignments.filter(assignment => assignment.status === status);
    }
    
    displayAssignments(filteredAssignments);
}

function displayAssignments(assignmentsToDisplay) {
    const grid = document.getElementById('assignmentsGrid');
    
    if (assignmentsToDisplay.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-tasks"></i>
                <h3>Aucun devoir</h3>
                <p>Commencez par créer des devoirs pour vos élèves</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = assignmentsToDisplay.map(assignment => {
        const statusClass = getStatusClass(assignment.status);
        const statusLabel = getStatusLabel(assignment.status);
        const typeLabel = getTypeLabel(assignment.type);
        const daysUntilDue = getDaysUntilDue(assignment.dueDate);
        const isOverdue = daysUntilDue < 0;
        
        return `
            <div class="assignment-card">
                <div class="assignment-header">
                    <div class="assignment-title">${assignment.title}</div>
                    <div class="assignment-meta">
                        <span><i class="fas fa-book"></i> ${assignment.subject}</span>
                        <span><i class="fas fa-tag"></i> ${typeLabel}</span>
                    </div>
                </div>
                
                <div class="assignment-content">
                    ${assignment.description ? `<div class="assignment-description">${assignment.description}</div>` : ''}
                    
                    <div class="assignment-status">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                        <div class="submissions-info">
                            <i class="fas fa-users"></i>
                            <span>${assignment.submissions || 0} soumissions</span>
                        </div>
                    </div>
                    
                    <div class="assignment-meta" style="margin-bottom: 15px;">
                        <span>
                            <i class="fas fa-calendar"></i> 
                            Date limite: ${formatDate(assignment.dueDate)}
                        </span>
                        <span style="color: ${isOverdue ? '#e74c3c' : '#666'};">
                            <i class="fas fa-clock"></i>
                            ${isOverdue ? 'En retard' : `${daysUntilDue} jours restants`}
                        </span>
                    </div>
                    
                    ${assignment.files && assignment.files.length > 0 ? `
                        <div class="assignment-files">
                            <strong>Fichiers joints:</strong>
                            ${assignment.files.map(file => `
                                <div class="file-item">
                                    <i class="fas fa-file file-icon"></i>
                                    <span class="file-name">${file.name}</span>
                                    <span class="file-size">${file.size}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="assignment-actions">
                        <button class="btn-small btn-view" onclick="viewAssignment(${assignment.id})">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                        <button class="btn-small btn-edit" onclick="editAssignment(${assignment.id})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn-small btn-delete" onclick="deleteAssignment(${assignment.id})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusClass(status) {
    const classes = {
        published: 'status-published',
        draft: 'status-draft',
        closed: 'status-closed'
    };
    return classes[status] || 'status-draft';
}

function getStatusLabel(status) {
    const labels = {
        published: 'Publié',
        draft: 'Brouillon',
        closed: 'Fermé'
    };
    return labels[status] || 'Brouillon';
}

function getTypeLabel(type) {
    const labels = {
        homework: 'Devoir maison',
        research: 'Recherche',
        project: 'Projet',
        presentation: 'Présentation',
        lab: 'Travaux pratiques'
    };
    return labels[type] || type;
}

function getDaysUntilDue(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function openAssignmentModal() {
    currentAssignmentId = null;
    document.getElementById('modalTitle').textContent = 'Nouveau Devoir';
    document.getElementById('assignmentForm').reset();
    
    // Pré-remplir avec la matière du professeur
    if (currentUser.matiere) {
        document.getElementById('assignmentSubject').value = currentUser.matiere;
    }
    
    // Mettre la date limite par défaut à 7 jours
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    document.getElementById('assignmentDueDate').value = defaultDueDate.toISOString().split('T')[0];
    
    document.getElementById('assignmentModal').style.display = 'block';
}

function editAssignment(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    currentAssignmentId = assignmentId;
    document.getElementById('modalTitle').textContent = 'Modifier le Devoir';
    
    // Remplir le formulaire
    document.getElementById('assignmentTitle').value = assignment.title;
    document.getElementById('assignmentClass').value = assignment.classId || '';
    document.getElementById('assignmentSubject').value = assignment.subject;
    document.getElementById('assignmentDescription').value = assignment.description || '';
    document.getElementById('assignmentDueDate').value = assignment.dueDate;
    document.getElementById('assignmentType').value = assignment.type;
    document.getElementById('assignmentStatus').value = assignment.status;
    
    document.getElementById('assignmentModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('assignmentForm').reset();
    currentAssignmentId = null;
}

function initializeEventHandlers() {
    // Gestion du formulaire de devoir
    document.getElementById('assignmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAssignment();
    });
    
    // Fermer les modals en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

function saveAssignment() {
    const title = document.getElementById('assignmentTitle').value;
    const classId = document.getElementById('assignmentClass').value;
    const subject = document.getElementById('assignmentSubject').value;
    const description = document.getElementById('assignmentDescription').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const type = document.getElementById('assignmentType').value;
    const status = document.getElementById('assignmentStatus').value;
    
    if (!title || !classId || !subject || !dueDate || !type) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const assignment = {
        id: currentAssignmentId || Date.now(),
        teacherId: currentUser.id,
        title: title,
        classId: classId,
        className: getClassName(classId),
        subject: subject,
        description: description,
        dueDate: dueDate,
        type: type,
        status: status,
        submissions: 0,
        createdAt: currentAssignmentId ? assignments.find(a => a.id === currentAssignmentId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder
    const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    
    if (currentAssignmentId) {
        // Mettre à jour
        const index = allAssignments.findIndex(a => a.id === currentAssignmentId);
        if (index !== -1) {
            allAssignments[index] = assignment;
        }
    } else {
        // Ajouter
        allAssignments.push(assignment);
    }
    
    localStorage.setItem('assignments', JSON.stringify(allAssignments));
    
    // Recharger
    loadAssignments();
    
    // Fermer le modal
    closeModal('assignmentModal');
    
    alert(currentAssignmentId ? 'Devoir modifié avec succès!' : 'Devoir créé avec succès!');
}

function getClassName(classId) {
    const cls = classes.find(c => c.id == classId);
    return cls ? `${cls.name} - ${cls.level}` : 'Inconnue';
}

function viewAssignment(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const statusLabel = getStatusLabel(assignment.status);
    const typeLabel = getTypeLabel(assignment.type);
    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    const isOverdue = daysUntilDue < 0;
    
    alert(`
DEVOIR: ${assignment.title}

Classe: ${assignment.className}
Matière: ${assignment.subject}
Type: ${typeLabel}
Statut: ${statusLabel}
Date limite: ${formatDate(assignment.dueDate)}
${isOverdue ? 'EN RETARD' : `${daysUntilDue} jours restants`}

${assignment.description ? `\nDescription:\n${assignment.description}\n` : ''}
Soumissions: ${assignment.submissions || 0}

Créé le: ${formatDate(assignment.createdAt)}
${assignment.updatedAt !== assignment.createdAt ? `Modifié le: ${formatDate(assignment.updatedAt)}` : ''}
    `);
}

function deleteAssignment(assignmentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devoir?')) return;
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    // Supprimer
    const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const updatedAssignments = allAssignments.filter(a => a.id !== assignmentId);
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
    
    // Recharger
    loadAssignments();
    
    alert('Devoir supprimé avec succès!');
}

function initializeDemoData() {
    const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const userAssignments = allAssignments.filter(assignment => assignment.teacherId === currentUser.id);
    
    if (userAssignments.length === 0) {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const inTwoWeeks = new Date(today);
        inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
        
        const demoAssignments = [
            {
                id: Date.now() + 1,
                teacherId: currentUser.id,
                title: 'Exercices sur les fractions',
                classId: classes[0]?.id || null,
                className: classes[0] ? `${classes[0].name} - ${classes[0].level}` : '4ème A',
                subject: currentUser.matiere || 'Mathématiques',
                description: 'Faire les exercices 1 à 15 page 156 du manuel. Portez une attention particulière aux additions et soustractions de fractions.',
                dueDate: nextWeek.toISOString().split('T')[0],
                type: 'homework',
                status: 'published',
                submissions: 3,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: Date.now() + 2,
                teacherId: currentUser.id,
                title: 'Recherche sur les révolutions',
                classId: classes[0]?.id || null,
                className: classes[0] ? `${classes[0].name} - ${classes[0].level}` : '4ème A',
                subject: 'Histoire',
                description: 'Préparer une recherche de 2 pages sur une révolution de votre choix (française, américaine, russe, etc.). Inclure les causes, les événements clés et les conséquences.',
                dueDate: inTwoWeeks.toISOString().split('T')[0],
                type: 'research',
                status: 'published',
                submissions: 1,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: Date.now() + 3,
                teacherId: currentUser.id,
                title: 'Projet de groupe',
                classId: classes[0]?.id || null,
                className: classes[0] ? `${classes[0].name} - ${classes[0].level}` : '4ème A',
                subject: currentUser.matiere || 'Mathématiques',
                description: 'Par groupes de 3-4 élèves, créer une présentation sur l\'application des mathématiques dans la vie quotidienne.',
                dueDate: inTwoWeeks.toISOString().split('T')[0],
                type: 'project',
                status: 'draft',
                submissions: 0,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                updatedAt: new Date(Date.now() - 259200000).toISOString()
            }
        ];
        
        allAssignments.push(...demoAssignments);
        localStorage.setItem('assignments', JSON.stringify(allAssignments));
        
        // Recharger
        loadAssignments();
    }
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}
