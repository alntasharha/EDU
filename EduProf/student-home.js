// Variables globales
let studentName = '';
let examResults = [];
let downloadedCourses = [];
let tempStudentPhoto = null;

// ============================================
// GESTION DE LA PHOTO DE PROFIL ÉLÈVE
// ============================================

function loadStudentData() {
    // Charger le nom de l'élève
    studentName = localStorage.getItem('studentName') || '';
    if (studentName) {
        document.getElementById('studentName').value = studentName;
        document.getElementById('studentNameDisplay').textContent = studentName;
    }
    
    // Charger les résultats d'examens
    examResults = JSON.parse(localStorage.getItem('examResults') || '[]');
    
    // Charger les cours téléchargés
    downloadedCourses = JSON.parse(localStorage.getItem('downloadedCourses') || '[]');
    
    // Charger la photo de profil
    loadStudentAvatar();
}

function loadStudentAvatar() {
    const studentPhoto = localStorage.getItem('studentPhoto');
    const avatarImg = document.getElementById('studentAvatarImg');
    const avatarInitial = document.getElementById('studentAvatarInitial');
    
    if (studentPhoto && avatarImg && avatarInitial) {
        avatarImg.src = studentPhoto;
        avatarImg.style.display = 'block';
        avatarInitial.style.display = 'none';
    } else if (avatarInitial) {
        // Utiliser la première lettre du nom ou 'E' par défaut
        const initial = studentName ? studentName.charAt(0).toUpperCase() : 'E';
        avatarInitial.textContent = initial;
        avatarInitial.style.display = 'flex';
        if (avatarImg) avatarImg.style.display = 'none';
    }
}

function openStudentPhotoModal() {
    const studentPhoto = localStorage.getItem('studentPhoto');
    const modalAvatarImg = document.getElementById('modalStudentAvatarImg');
    const modalAvatarInitial = document.getElementById('modalStudentAvatarInitial');
    const removeBtn = document.getElementById('removeStudentPhotoBtn');
    
    tempStudentPhoto = studentPhoto || null;
    
    if (studentPhoto && modalAvatarImg && modalAvatarInitial) {
        modalAvatarImg.src = studentPhoto;
        modalAvatarImg.style.display = 'block';
        modalAvatarInitial.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-block';
    } else if (modalAvatarInitial) {
        modalAvatarInitial.textContent = studentName ? studentName.charAt(0).toUpperCase() : 'E';
        modalAvatarInitial.style.display = 'flex';
        if (modalAvatarImg) modalAvatarImg.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'none';
    }
    
    document.getElementById('photoModal').classList.add('active');
}

function closeStudentPhotoModal() {
    document.getElementById('photoModal').classList.remove('active');
    tempStudentPhoto = null;
}

function closePhotoModalOnOutside(event) {
    if (event.target.id === 'photoModal') {
        closeStudentPhotoModal();
    }
}

function handleStudentPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    processStudentPhoto(file);
}

function handleStudentPhotoDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#e1e8ed';
    event.currentTarget.style.background = 'transparent';
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processStudentPhoto(file);
    } else {
        alert('Veuillez déposer une image valide (JPG, PNG)');
    }
}

function processStudentPhoto(file) {
    if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        tempStudentPhoto = e.target.result;
        
        const modalAvatarImg = document.getElementById('modalStudentAvatarImg');
        const modalAvatarInitial = document.getElementById('modalStudentAvatarInitial');
        const removeBtn = document.getElementById('removeStudentPhotoBtn');
        
        modalAvatarImg.src = tempStudentPhoto;
        modalAvatarImg.style.display = 'block';
        modalAvatarInitial.style.display = 'none';
        removeBtn.style.display = 'inline-block';
    };
    
    reader.readAsDataURL(file);
}

function removeStudentPhoto() {
    if (!confirm('Supprimer votre photo de profil?')) return;
    
    tempStudentPhoto = null;
    
    const modalAvatarImg = document.getElementById('modalStudentAvatarImg');
    const modalAvatarInitial = document.getElementById('modalStudentAvatarInitial');
    const removeBtn = document.getElementById('removeStudentPhotoBtn');
    
    modalAvatarImg.style.display = 'none';
    modalAvatarInitial.textContent = studentName ? studentName.charAt(0).toUpperCase() : 'E';
    modalAvatarInitial.style.display = 'flex';
    removeBtn.style.display = 'none';
}

function saveStudentPhoto() {
    if (tempStudentPhoto !== undefined) {
        if (tempStudentPhoto) {
            localStorage.setItem('studentPhoto', tempStudentPhoto);
        } else {
            localStorage.removeItem('studentPhoto');
        }
    }
    
    loadStudentAvatar();
    closeStudentPhotoModal();
}

function saveStudentName() {
    const nameInput = document.getElementById('studentName');
    studentName = nameInput.value.trim();
    
    if (studentName) {
        localStorage.setItem('studentName', studentName);
        document.getElementById('studentNameDisplay').textContent = studentName;
        updateExamResultsWithStudentName();
        loadStudentAvatar();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadStudentData();
    loadAvailableExams();
    loadAvailableCourses();
    updateStatistics();
});

function updateExamResultsWithStudentName() {
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    let updated = false;
    
    results.forEach(result => {
        if (result.studentId === 'demo_student' && result.studentName !== studentName) {
            result.studentName = studentName;
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem('examResults', JSON.stringify(results));
        examResults = results;
    }
}

function loadAvailableExams() {
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const publishedExams = exams.filter(exam => exam.status === 'published');
    
    const examsList = document.getElementById('examsList');
    
    if (publishedExams.length === 0) {
        examsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Aucun examen disponible</p>
            </div>
        `;
        return;
    }
    
    examsList.innerHTML = publishedExams.map(exam => {
        const studentResult = examResults.find(result => result.examId === exam.id && result.studentName === studentName);
        const isCompleted = !!studentResult;
        const statusClass = isCompleted ? 'status-completed' : 'status-available';
        const statusText = isCompleted ? 'Terminé' : 'Disponible';
        
        return `
            <div class="item exam">
                <div class="item-header">
                    <div>
                        <div class="item-title">${exam.title}</div>
                        <div class="item-meta">${exam.subject} • ${exam.className || 'Toutes classes'} • ${exam.duration} min</div>
                    </div>
                    <div class="item-status ${statusClass}">${statusText}</div>
                </div>
                ${isCompleted ? `
                    <div style="margin: 10px 0; padding: 10px; background: #f0f8ff; border-radius: 5px;">
                        <strong>Score:</strong> ${studentResult.score.correct}/${studentResult.score.total} (${studentResult.score.percentage}%)
                        <br><small>Terminé le: ${new Date(studentResult.submittedAt).toLocaleDateString('fr-FR')}</small>
                    </div>
                ` : ''}
                <div style="margin-top: 10px;">
                    ${isCompleted ? `
                        <button class="btn-action" onclick="viewExamResults(${exam.id})">
                            <i class="fas fa-eye"></i> Voir les résultats
                        </button>
                    ` : `
                        <button class="btn-action exam" onclick="startExam(${exam.id})">
                            <i class="fas fa-play"></i> Commencer l'examen
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function loadAvailableCourses() {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const sharedCourses = courses.filter(course => course.shared);
    
    const coursesList = document.getElementById('coursesList');
    
    if (sharedCourses.length === 0) {
        coursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>Aucun cours disponible</p>
            </div>
        `;
        return;
    }
    
    coursesList.innerHTML = sharedCourses.map(course => {
        const isDownloaded = downloadedCourses.includes(course.id);
        const statusClass = isDownloaded ? 'status-completed' : 'status-available';
        const statusText = isDownloaded ? 'Téléchargé' : 'Disponible';
        
        return `
            <div class="item course">
                <div class="item-header">
                    <div>
                        <div class="item-title">${course.title}</div>
                        <div class="item-meta">${course.subject} • ${course.level} • ${course.fileType.toUpperCase()}</div>
                    </div>
                    <div class="item-status ${statusClass}">${statusText}</div>
                </div>
                <div style="margin: 10px 0;">
                    <small><i class="fas fa-file"></i> ${course.fileName} (${course.fileSize})</small>
                    ${course.description ? `<br><small>${course.description.substring(0, 100)}${course.description.length > 100 ? '...' : ''}</small>` : ''}
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn-action course" onclick="downloadCourse(${course.id})">
                        <i class="fas fa-${isDownloaded ? 'eye' : 'download'}"></i> ${isDownloaded ? 'Voir' : 'Télécharger'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateStatistics() {
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const publishedExams = exams.filter(exam => exam.status === 'published');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const sharedCourses = courses.filter(course => course.shared);
    
    // Statistiques des examens
    const availableExams = publishedExams.length;
    const completedExams = examResults.filter(result => result.studentName === studentName).length;
    
    document.getElementById('availableExams').textContent = availableExams;
    document.getElementById('completedExams').textContent = completedExams;
    
    // Statistiques des cours
    const totalCourses = sharedCourses.length;
    const downloadedCount = downloadedCourses.length;
    
    document.getElementById('totalCourses').textContent = totalCourses;
    document.getElementById('downloadedCourses').textContent = downloadedCount;
}

function startExam(examId) {
    if (!studentName) {
        alert('Veuillez entrer votre nom avant de commencer l\'examen');
        document.getElementById('studentName').focus();
        return;
    }
    
    // Rediriger vers la page d'examen
    window.location.href = `take-exam.html?exam=${examId}`;
}

function viewExamResults(examId) {
    const result = examResults.find(r => r.examId === examId && r.studentName === studentName);
    
    if (!result) {
        alert('Résultats non trouvés');
        return;
    }
    
    const exam = JSON.parse(localStorage.getItem('exams') || '[]').find(e => e.id == examId);
    
    if (!exam) {
        alert('Examen non trouvé');
        return;
    }
    
    // Afficher les résultats détaillés
    let resultsHtml = `
        <div style="text-align: center; padding: 20px;">
            <h3>Résultats de l'examen</h3>
            <h4>${exam.title}</h4>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 2rem; color: #3498db; font-weight: bold;">
                    ${result.score.percentage}%
                </div>
                <div>${result.score.correct}/${result.score.total} questions correctes</div>
            </div>
            
            <div style="text-align: left; margin: 20px 0;">
                <h5>Détail des réponses:</h5>
    `;
    
    exam.questions.forEach((question, index) => {
        const userAnswer = result.answers[question.id];
        let answerText = 'Non répondue';
        let isCorrect = false;
        
        if (userAnswer !== null && userAnswer !== undefined) {
            switch (question.type) {
                case 'multiple':
                case 'truefalse':
                    answerText = userAnswer === question.correctAnswer ? 'Correct' : 'Incorrect';
                    isCorrect = userAnswer === question.correctAnswer;
                    break;
                case 'checkbox':
                    if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
                        const userSet = new Set(userAnswer);
                        const correctSet = new Set(question.correctAnswer);
                        isCorrect = userSet.size === correctSet.size && [...userSet].every(x => correctSet.has(x));
                        answerText = isCorrect ? 'Correct' : 'Incorrect';
                    }
                    break;
                case 'text':
                    answerText = userAnswer.length > 50 ? userAnswer.substring(0, 50) + '...' : userAnswer;
                    break;
            }
        }
        
        resultsHtml += `
            <div style="margin: 10px 0; padding: 10px; background: ${isCorrect ? '#d5f4e6' : '#fadbd8'}; border-radius: 5px;">
                <strong>Q${index + 1}:</strong> ${answerText}
                ${question.type !== 'text' ? ` (${isCorrect ? '✓' : '✗'})` : ''}
            </div>
        `;
    });
    
    resultsHtml += `
            </div>
            
            <div style="margin: 20px 0;">
                <small>
                    <strong>Temps:</strong> ${Math.floor(result.timeTaken / 60)} minutes<br>
                    <strong>Date:</strong> ${new Date(result.submittedAt).toLocaleString('fr-FR')}
                </small>
            </div>
            
            <button onclick="location.reload()" style="background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                Fermer
            </button>
        </div>
    `;
    
    // Créer un modal pour afficher les résultats
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 20px;
        border-radius: 10px;
        margin: 20px;
    `;
    
    modalContent.innerHTML = resultsHtml;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Fermer le modal en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function downloadCourse(courseId) {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
        alert('Cours non trouvé');
        return;
    }
    
    // Ajouter aux cours téléchargés
    if (!downloadedCourses.includes(courseId)) {
        downloadedCourses.push(courseId);
        localStorage.setItem('downloadedCourses', JSON.stringify(downloadedCourses));
        
        // Incrémenter le compteur de téléchargements
        course.downloads = (course.downloads || 0) + 1;
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Mettre à jour l'affichage
        loadAvailableCourses();
        updateStatistics();
    }
    
    // Afficher les informations du cours
    alert(`
COURS: ${course.title}

Fichier: ${course.fileName}
Taille: ${course.fileSize}
Type: ${course.fileType.toUpperCase()}
Matière: ${course.subject}
Niveau: ${course.level}

${course.description ? `Description:\n${course.description}\n\n` : ''}
Dans une vraie application, ce fichier serait téléchargé sur votre appareil.
    `);
}

// Fonction pour simuler un élève qui vient de se connecter
function simulateStudentLogin() {
    const demoNames = ['Alice Martin', 'Bob Bernard', 'Claire Dubois', 'David Petit', 'Emma Leroy'];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    
    document.getElementById('studentName').value = randomName;
    saveStudentName();
    
    // Recharger les données
    loadStudentData();
    loadAvailableExams();
    loadAvailableCourses();
    updateStatistics();
}

// Ajouter un bouton de démonstration (optionnel)
document.addEventListener('DOMContentLoaded', function() {
    // Vous pouvez décommenter cette ligne pour tester rapidement
    // setTimeout(simulateStudentLogin, 1000);
});
