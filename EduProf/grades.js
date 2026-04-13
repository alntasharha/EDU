// Variables globales
let currentUser = null;
let grades = [];
let classes = [];

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
    loadGrades();
    
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
    
    const classSelect = document.getElementById('classSelect');
    classSelect.innerHTML = '<option value="">Toutes les classes</option>';
    
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = `${cls.name} - ${cls.level}`;
        classSelect.appendChild(option);
    });
    
    // Charger les matières
    loadSubjects();
}

function loadSubjects() {
    const subjects = [...new Set(classes.map(cls => cls.subject))];
    const subjectSelect = document.getElementById('subjectSelect');
    
    subjectSelect.innerHTML = '<option value="">Toutes les matières</option>';
    
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

function loadGrades() {
    const allGrades = JSON.parse(localStorage.getItem('grades') || '[]');
    grades = allGrades.filter(grade => grade.teacherId === currentUser.id);
    
    // Filtrer selon les sélections
    const classId = document.getElementById('classSelect').value;
    const subject = document.getElementById('subjectSelect').value;
    const period = document.getElementById('periodSelect').value;
    
    let filteredGrades = grades;
    
    if (classId) {
        filteredGrades = filteredGrades.filter(grade => grade.classId === classId);
    }
    
    if (subject) {
        filteredGrades = filteredGrades.filter(grade => grade.subject === subject);
    }
    
    if (period) {
        filteredGrades = filteredGrades.filter(grade => grade.period === period);
    }
    
    displayGrades(filteredGrades);
}

function displayGrades(gradesToDisplay) {
    const grid = document.getElementById('gradesGrid');
    
    if (gradesToDisplay.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-chart-line"></i>
                <h3>Aucune note</h3>
                <p>Commencez par ajouter des notes pour vos élèves</p>
            </div>
        `;
        return;
    }
    
    // Grouper par élève
    const gradesByStudent = {};
    
    gradesToDisplay.forEach(grade => {
        if (!gradesByStudent[grade.studentId]) {
            gradesByStudent[grade.studentId] = {
                studentId: grade.studentId,
                studentName: grade.studentName,
                classId: grade.classId,
                className: grade.className,
                grades: []
            };
        }
        gradesByStudent[grade.studentId].grades.push(grade);
    });
    
    // Afficher les cartes d'élèves
    grid.innerHTML = Object.values(gradesByStudent).map(student => {
        const average = calculateAverage(student.grades);
        const gradeClass = getGradeClass(average);
        
        return `
            <div class="grade-card">
                <div class="grade-header ${gradeClass}">
                    <h3>${student.studentName}</h3>
                    <p>${student.className}</p>
                </div>
                <div class="grade-content">
                    <table class="grades-table">
                        <thead>
                            <tr>
                                <th>Matière</th>
                                <th>Note</th>
                                <th>Type</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${student.grades.map(grade => `
                                <tr>
                                    <td>${grade.subject}</td>
                                    <td>
                                        <input type="number" 
                                               class="grade-input ${getGradeClass(grade.value)}" 
                                               value="${grade.value}" 
                                               min="0" 
                                               max="${grade.max || 20}"
                                               onchange="updateGrade(${grade.id}, this.value)">
                                    </td>
                                    <td>${getGradeTypeLabel(grade.type)}</td>
                                    <td>${formatDate(grade.date)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="grade-summary">
                        <div class="summary-item">
                            <div class="summary-label">Moyenne</div>
                            <div class="summary-value">${average.toFixed(2)}/20</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Notes</div>
                            <div class="summary-value">${student.grades.length}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Appréciation</div>
                            <div class="summary-value">${getAppreciation(average)}</div>
                        </div>
                    </div>
                    
                    <div class="grade-actions">
                        <button class="btn-small btn-export" onclick="exportStudentGrades('${student.studentId}')">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        <button class="btn-small btn-print" onclick="printStudentGrades('${student.studentId}')">
                            <i class="fas fa-print"></i> Imprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Afficher les statistiques
    displayStatistics(gradesToDisplay);
}

function displayStatistics(gradesToDisplay) {
    const statsOverview = document.getElementById('statsOverview');
    
    if (gradesToDisplay.length === 0) {
        statsOverview.style.display = 'none';
        return;
    }
    
    statsOverview.style.display = 'block';
    
    // Calculer les statistiques
    const uniqueStudents = new Set();
    let sum = 0;
    let highest = 0;
    let lowest = 20;
    
    // Répartition
    let excellent = 0, good = 0, average = 0, poor = 0;
    
    gradesToDisplay.forEach(grade => {
        uniqueStudents.add(grade.studentId);
        sum += grade.value;
        if (grade.value > highest) highest = grade.value;
        if (grade.value < lowest) lowest = grade.value;
        
        // Répartition
        if (grade.value >= 16) excellent++;
        else if (grade.value >= 12) good++;
        else if (grade.value >= 8) average++;
        else poor++;
    });
    
    const totalGrades = gradesToDisplay.length;
    const classAverage = sum / totalGrades;
    
    // Mettre à jour l'affichage
    document.querySelector('#statTotalStudents .stat-box-value').textContent = uniqueStudents.size;
    document.querySelector('#statClassAverage .stat-box-value').textContent = classAverage.toFixed(2);
    document.querySelector('#statHighest .stat-box-value').textContent = highest.toFixed(1);
    document.querySelector('#statLowest .stat-box-value').textContent = lowest.toFixed(1);
    
    // Afficher la répartition
    const gradeDistribution = document.getElementById('gradeDistribution');
    const distributionBar = document.getElementById('distributionBar');
    
    if (totalGrades > 0) {
        gradeDistribution.style.display = 'block';
        
        const excellentPct = (excellent / totalGrades * 100).toFixed(1);
        const goodPct = (good / totalGrades * 100).toFixed(1);
        const averagePct = (average / totalGrades * 100).toFixed(1);
        const poorPct = (poor / totalGrades * 100).toFixed(1);
        
        distributionBar.innerHTML = `
            ${excellent > 0 ? `<div class="dist-segment dist-excellent" style="width: ${excellentPct}%">${excellentPct}%</div>` : ''}
            ${good > 0 ? `<div class="dist-segment dist-good" style="width: ${goodPct}%">${goodPct}%</div>` : ''}
            ${average > 0 ? `<div class="dist-segment dist-average" style="width: ${averagePct}%">${averagePct}%</div>` : ''}
            ${poor > 0 ? `<div class="dist-segment dist-poor" style="width: ${poorPct}%">${poorPct}%</div>` : ''}
        `;
    }
}

function calculateAverage(studentGrades) {
    if (studentGrades.length === 0) return 0;
    
    const total = studentGrades.reduce((sum, grade) => {
        const normalizedGrade = (grade.value / (grade.max || 20)) * 20;
        return sum + normalizedGrade;
    }, 0);
    
    return total / studentGrades.length;
}

function getGradeClass(grade) {
    if (grade >= 16) return 'grade-excellent';
    if (grade >= 14) return 'grade-good';
    if (grade >= 10) return 'grade-average';
    return 'grade-poor';
}

function getGradeTypeLabel(type) {
    const labels = {
        exam: 'Examen',
        quiz: 'Interro',
        homework: 'Devoir',
        participation: 'Part.',
        project: 'Projet'
    };
    return labels[type] || type;
}

function getAppreciation(average) {
    if (average >= 18) return 'Excellent';
    if (average >= 16) return 'Très bien';
    if (average >= 14) return 'Bien';
    if (average >= 12) return 'Assez bien';
    if (average >= 10) return 'Passable';
    if (average >= 8) return 'Insuffisant';
    return 'Très insuffisant';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function updateGrade(gradeId, newValue) {
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) return;
    
    const value = parseFloat(newValue);
    if (isNaN(value) || value < 0 || value > (grade.max || 20)) {
        loadGrades(); // Recharger pour annuler la modification
        return;
    }
    
    grade.value = value;
    grade.updatedAt = new Date().toISOString();
    
    // Sauvegarder
    const allGrades = JSON.parse(localStorage.getItem('grades') || '[]');
    const index = allGrades.findIndex(g => g.id === gradeId);
    if (index !== -1) {
        allGrades[index] = grade;
        localStorage.setItem('grades', JSON.stringify(allGrades));
    }
    
    // Recharger
    loadGrades();
}

function openAddGradeModal() {
    document.getElementById('addGradeModal').style.display = 'block';
    
    // Pré-remplir avec les valeurs actuelles
    const subject = document.getElementById('subjectSelect').value;
    if (subject) {
        document.getElementById('gradeSubject').value = subject;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('addGradeForm').reset();
}

function initializeEventHandlers() {
    // Gestion du formulaire d'ajout de note
    document.getElementById('addGradeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addGrade();
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

function addGrade() {
    const studentName = document.getElementById('studentName').value;
    const subject = document.getElementById('gradeSubject').value;
    const value = parseFloat(document.getElementById('gradeValue').value);
    const type = document.getElementById('gradeType').value;
    const max = parseInt(document.getElementById('gradeMax').value) || 20;
    const comment = document.getElementById('gradeComment').value;
    
    if (!studentName || !subject || isNaN(value) || !type) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Créer la note
    const grade = {
        id: Date.now(),
        teacherId: currentUser.id,
        studentId: `student_${Date.now()}`,
        studentName: studentName,
        classId: document.getElementById('classSelect').value || null,
        className: getClassName(document.getElementById('classSelect').value),
        subject: subject,
        value: value,
        max: max,
        type: type,
        comment: comment,
        period: document.getElementById('periodSelect').value,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    // Sauvegarder
    const allGrades = JSON.parse(localStorage.getItem('grades') || '[]');
    allGrades.push(grade);
    localStorage.setItem('grades', JSON.stringify(allGrades));
    
    // Recharger
    loadGrades();
    
    // Fermer le modal
    closeModal('addGradeModal');
    
    alert('Note ajoutée avec succès!');
}

function getClassName(classId) {
    if (!classId) return 'Non spécifiée';
    
    const cls = classes.find(c => c.id == classId);
    return cls ? `${cls.name} - ${cls.level}` : 'Inconnue';
}

function exportStudentGrades(studentId) {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    
    if (studentGrades.length === 0) {
        alert('Aucune note à exporter pour cet élève');
        return;
    }
    
    const student = studentGrades[0];
    const average = calculateAverage(studentGrades);
    
    let csvContent = "Bulletin de Notes\n";
    csvContent += `Élève: ${student.studentName}\n`;
    csvContent += `Classe: ${student.className}\n`;
    csvContent += `Période: ${student.period}\n`;
    csvContent += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    csvContent += "Matière,Note,Type,Date,Commentaire\n";
    
    studentGrades.forEach(grade => {
        csvContent += `"${grade.subject}","${grade.value}/${grade.max}","${getGradeTypeLabel(grade.type)}","${formatDate(grade.date)}","${grade.comment || ''}"\n`;
    });
    
    csvContent += `\nMoyenne: ${average.toFixed(2)}/20\n`;
    csvContent += `Appréciation: ${getAppreciation(average)}\n`;
    
    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bulletin_${student.studentName.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function printStudentGrades(studentId) {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    
    if (studentGrades.length === 0) {
        alert('Aucune note à imprimer pour cet élève');
        return;
    }
    
    const student = studentGrades[0];
    const average = calculateAverage(studentGrades);
    
    const printContent = `
        <html>
        <head>
            <title>Bulletin de Notes - ${student.studentName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2c3e50; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background: #f8f9fa; }
                .summary { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
                .summary-item { display: inline-block; margin: 0 20px; }
            </style>
        </head>
        <body>
            <h1>Bulletin de Notes</h1>
            <p><strong>Élève:</strong> ${student.studentName}</p>
            <p><strong>Classe:</strong> ${student.className}</p>
            <p><strong>Période:</strong> ${student.period}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Matière</th>
                        <th>Note</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Commentaire</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentGrades.map(grade => `
                        <tr>
                            <td>${grade.subject}</td>
                            <td>${grade.value}/${grade.max}</td>
                            <td>${getGradeTypeLabel(grade.type)}</td>
                            <td>${formatDate(grade.date)}</td>
                            <td>${grade.comment || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="summary">
                <div class="summary-item">
                    <strong>Moyenne:</strong> ${average.toFixed(2)}/20
                </div>
                <div class="summary-item">
                    <strong>Appréciation:</strong> ${getAppreciation(average)}
                </div>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function initializeDemoData() {
    const allGrades = JSON.parse(localStorage.getItem('grades') || '[]');
    const userGrades = allGrades.filter(grade => grade.teacherId === currentUser.id);
    
    if (userGrades.length === 0) {
        const demoGrades = [
            {
                id: Date.now() + 1,
                teacherId: currentUser.id,
                studentId: 'student_1',
                studentName: 'Alice Martin',
                classId: classes[0]?.id || null,
                className: classes[0] ? `${classes[0].name} - ${classes[0].level}` : '4ème A',
                subject: 'Mathématiques',
                value: 15.5,
                max: 20,
                type: 'exam',
                comment: 'Bon travail, attention aux calculs',
                period: 'T1',
                date: new Date(Date.now() - 86400000).toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                teacherId: currentUser.id,
                studentId: 'student_2',
                studentName: 'Bob Bernard',
                classId: classes[0]?.id || null,
                className: classes[0] ? `${classes[0].name} - ${classes[0].level}` : '4ème A',
                subject: 'Mathématiques',
                value: 12.0,
                max: 20,
                type: 'quiz',
                comment: 'Révision nécessaire',
                period: 'T1',
                date: new Date(Date.now() - 172800000).toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                teacherId: currentUser.id,
                studentId: 'student_1',
                studentName: 'Alice Martin',
                classId: classes[0]?.id || null,
                className: classes[0] ? `${classes[0].name} - ${classes[0].level}` : '4ème A',
                subject: 'Mathématiques',
                value: 18.0,
                max: 20,
                type: 'homework',
                comment: 'Excellent travail',
                period: 'T1',
                date: new Date(Date.now() - 259200000).toISOString(),
                createdAt: new Date().toISOString()
            }
        ];
        
        allGrades.push(...demoGrades);
        localStorage.setItem('grades', JSON.stringify(allGrades));
        
        // Recharger
        loadGrades();
    }
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}
