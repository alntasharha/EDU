// Variables globales
let currentExam = {
    title: '',
    class: '',
    subject: '',
    duration: 60,
    date: '',
    instructions: '',
    questions: []
};

let questionCounter = 0;

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
    loadExams(currentUser);
    
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
    const classSelect = document.getElementById('examClass');
    const classes = getClassesForUser(user.id);
    
    classSelect.innerHTML = '<option value="">Sélectionner une classe</option>';
    
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

function loadExams(user) {
    const exams = getExamsForUser(user.id);
    displayExams(exams);
}

function getExamsForUser(userId) {
    const allExams = JSON.parse(localStorage.getItem('exams') || '[]');
    return allExams.filter(exam => exam.teacherId === userId);
}

function displayExams(exams) {
    const container = document.getElementById('examsList');
    
    if (exams.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>Aucun examen</h3>
                <p>Commencez par créer votre premier examen</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = exams.map(exam => {
        const statusClass = getStatusClass(exam.status);
        const statusText = getStatusText(exam.status);
        
        return `
            <div class="exam-card" data-id="${exam.id}">
                <div class="exam-header">
                    <div class="exam-title">${exam.title}</div>
                    <div class="exam-status ${statusClass}">${statusText}</div>
                </div>
                <div class="exam-info">
                    <div class="exam-info-item">
                        <i class="fas fa-users"></i>
                        <span>${exam.className || 'Non assignée'}</span>
                    </div>
                    <div class="exam-info-item">
                        <i class="fas fa-book"></i>
                        <span>${exam.subject}</span>
                    </div>
                    <div class="exam-info-item">
                        <i class="fas fa-clock"></i>
                        <span>${exam.duration} min</span>
                    </div>
                    <div class="exam-info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(exam.date)}</span>
                    </div>
                    <div class="exam-info-item">
                        <i class="fas fa-question-circle"></i>
                        <span>${exam.questions ? exam.questions.length : 0} questions</span>
                    </div>
                </div>
                <div class="exam-actions">
                    <button class="btn-small btn-view" onclick="viewExam(${exam.id})">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                    <button class="btn-small btn-edit" onclick="editExam(${exam.id})">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    ${exam.status === 'draft' ? `
                        <button class="btn-small btn-publish" onclick="publishExam(${exam.id})">
                            <i class="fas fa-share"></i> Publier
                        </button>
                    ` : ''}
                    <button class="btn-small btn-delete" onclick="deleteExam(${exam.id})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusClass(status) {
    const classes = {
        draft: 'status-draft',
        published: 'status-published',
        closed: 'status-closed'
    };
    return classes[status] || 'status-draft';
}

function getStatusText(status) {
    const texts = {
        draft: 'Brouillon',
        published: 'Publié',
        closed: 'Terminé'
    };
    return texts[status] || 'Brouillon';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function toggleExamForm() {
    const form = document.getElementById('examForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    
    if (form.style.display === 'block') {
        // Réinitialiser le formulaire
        document.getElementById('createExamForm').reset();
        currentExam = {
            title: '',
            class: '',
            subject: '',
            duration: 60,
            date: '',
            instructions: '',
            questions: []
        };
        questionCounter = 0;
        document.getElementById('questionsList').innerHTML = '';
    }
}

function addQuestion() {
    questionCounter++;
    const questionId = `question_${questionCounter}`;
    
    const questionHtml = `
        <div class="question-item" id="${questionId}">
            <div class="question-header">
                <span class="question-number">Question ${questionCounter}</span>
                <div>
                    <select class="question-type" onchange="updateQuestionType('${questionId}')">
                        <option value="multiple">Choix multiple</option>
                        <option value="checkbox">Cases à cocher</option>
                        <option value="text">Réponse textuelle</option>
                        <option value="truefalse">Vrai/Faux</option>
                    </select>
                    <button class="btn-remove" onclick="removeQuestion('${questionId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="question-text">
                <input type="text" class="option-input" placeholder="Texte de la question..." onchange="updateQuestionText('${questionId}', this.value)">
            </div>
            <div class="options-container" id="options_${questionId}">
                ${generateMultipleChoiceOptions(questionId)}
            </div>
        </div>
    `;
    
    document.getElementById('questionsList').insertAdjacentHTML('beforeend', questionHtml);
    
    // Ajouter la question à l'objet currentExam
    currentExam.questions.push({
        id: questionId,
        type: 'multiple',
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    });
}

function generateMultipleChoiceOptions(questionId) {
    let optionsHtml = '';
    for (let i = 0; i < 4; i++) {
        optionsHtml += `
            <div class="option-item">
                <input type="radio" name="correct_${questionId}" value="${i}" onchange="setCorrectAnswer('${questionId}', ${i})">
                <input type="text" class="option-input" placeholder="Option ${i + 1}" onchange="updateOption('${questionId}', ${i}, this.value)">
            </div>
        `;
    }
    return optionsHtml;
}

function updateQuestionType(questionId) {
    const questionElement = document.getElementById(questionId);
    const typeSelect = questionElement.querySelector('.question-type');
    const optionsContainer = document.getElementById(`options_${questionId}`);
    const question = currentExam.questions.find(q => q.id === questionId);
    
    question.type = typeSelect.value;
    
    let optionsHtml = '';
    
    switch (typeSelect.value) {
        case 'multiple':
            optionsHtml = generateMultipleChoiceOptions(questionId);
            break;
        case 'checkbox':
            for (let i = 0; i < 4; i++) {
                optionsHtml += `
                    <div class="option-item">
                        <input type="checkbox" onchange="updateCheckboxAnswer('${questionId}', ${i}, this.checked)">
                        <input type="text" class="option-input" placeholder="Option ${i + 1}" onchange="updateOption('${questionId}', ${i}, this.value)">
                    </div>
                `;
            }
            break;
        case 'text':
            optionsHtml = `
                <div class="option-item">
                    <input type="text" class="option-input" placeholder="Réponse attendue..." onchange="updateTextAnswer('${questionId}', this.value)">
                </div>
            `;
            break;
        case 'truefalse':
            optionsHtml = `
                <div class="option-item">
                    <input type="radio" name="correct_${questionId}" value="true" onchange="updateTrueFalseAnswer('${questionId}', true)">
                    <label>Vrai</label>
                </div>
                <div class="option-item">
                    <input type="radio" name="correct_${questionId}" value="false" onchange="updateTrueFalseAnswer('${questionId}', false)">
                    <label>Faux</label>
                </div>
            `;
            break;
    }
    
    optionsContainer.innerHTML = optionsHtml;
}

function removeQuestion(questionId) {
    const questionElement = document.getElementById(questionId);
    questionElement.remove();
    
    // Retirer de l'objet currentExam
    currentExam.questions = currentExam.questions.filter(q => q.id !== questionId);
}

function updateQuestionText(questionId, text) {
    const question = currentExam.questions.find(q => q.id === questionId);
    if (question) {
        question.text = text;
    }
}

function updateOption(questionId, optionIndex, value) {
    const question = currentExam.questions.find(q => q.id === questionId);
    if (question && question.options) {
        question.options[optionIndex] = value;
    }
}

function setCorrectAnswer(questionId, answerIndex) {
    const question = currentExam.questions.find(q => q.id === questionId);
    if (question) {
        question.correctAnswer = answerIndex;
    }
}

function updateCheckboxAnswer(questionId, optionIndex, checked) {
    const question = currentExam.questions.find(q => q.id === questionId);
    if (question) {
        if (!question.correctAnswers) {
            question.correctAnswers = [];
        }
        if (checked) {
            question.correctAnswers.push(optionIndex);
        } else {
            question.correctAnswers = question.correctAnswers.filter(i => i !== optionIndex);
        }
    }
}

function updateTextAnswer(questionId, value) {
    const question = currentExam.questions.find(q => q.id === questionId);
    if (question) {
        question.correctAnswer = value;
    }
}

function updateTrueFalseAnswer(questionId, value) {
    const question = currentExam.questions.find(q => q.id === questionId);
    if (question) {
        question.correctAnswer = value;
    }
}

function saveExam() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Valider le formulaire
    const title = document.getElementById('examTitle').value;
    const classId = document.getElementById('examClass').value;
    const subject = document.getElementById('examSubject').value;
    const duration = document.getElementById('examDuration').value;
    const date = document.getElementById('examDate').value;
    const instructions = document.getElementById('examInstructions').value;
    
    if (!title || !classId || !subject || !duration || !date) {
        alert('Veuillez remplir tous les champs obligatoires!');
        return;
    }
    
    if (currentExam.questions.length === 0) {
        alert('Veuillez ajouter au moins une question!');
        return;
    }
    
    // Valider les questions
    for (let question of currentExam.questions) {
        if (!question.text) {
            alert('Toutes les questions doivent avoir un texte!');
            return;
        }
        
        if (question.type === 'multiple' || question.type === 'checkbox') {
            if (question.options.filter(opt => opt.trim()).length < 2) {
                alert('Les questions à choix multiples doivent avoir au moins 2 options!');
                return;
            }
        }
    }
    
    // Créer l'examen
    const exam = {
        id: Date.now(),
        title: title,
        classId: classId,
        className: getClassName(classId),
        subject: subject,
        duration: parseInt(duration),
        date: date,
        instructions: instructions,
        questions: currentExam.questions,
        teacherId: currentUser.id,
        status: 'draft',
        createdAt: new Date().toISOString()
    };
    
    // Sauvegarder l'examen
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    exams.push(exam);
    localStorage.setItem('exams', JSON.stringify(exams));
    
    // Ajouter l'activité
    addActivity(currentUser.id, 'add', `Nouvel examen créé: ${exam.title}`);
    
    // Recharger les examens
    loadExams(currentUser);
    
    // Masquer le formulaire
    toggleExamForm();
    
    alert('Examen créé avec succès!');
}

function getClassName(classId) {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const cls = classes.find(c => c.id == classId);
    return cls ? `${cls.name} - ${cls.level}` : 'Inconnue';
}

function viewExam(examId) {
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const exam = exams.find(e => e.id === examId);
    
    if (exam) {
        let examDetails = `EXAMEN: ${exam.title}\n\n`;
        examDetails += `Classe: ${exam.className}\n`;
        examDetails += `Matière: ${exam.subject}\n`;
        examDetails += `Durée: ${exam.duration} minutes\n`;
        examDetails += `Date: ${formatDate(exam.date)}\n\n`;
        
        if (exam.instructions) {
            examDetails += `Instructions:\n${exam.instructions}\n\n`;
        }
        
        examDetails += `QUESTIONS (${exam.questions.length}):\n\n`;
        
        exam.questions.forEach((question, index) => {
            examDetails += `${index + 1}. ${question.text}\n`;
            
            if (question.type === 'multiple' || question.type === 'checkbox') {
                question.options.forEach((option, optIndex) => {
                    examDetails += `   ${String.fromCharCode(65 + optIndex)}) ${option}\n`;
                });
            } else if (question.type === 'truefalse') {
                examDetails += `   ☐ Vrai\n   ☐ Faux\n`;
            } else if (question.type === 'text') {
                examDetails += `   Réponse: ___________________\n`;
            }
            examDetails += '\n';
        });
        
        alert(examDetails);
    }
}

function editExam(examId) {
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const exam = exams.find(e => e.id === examId);
    
    if (exam) {
        // Charger l'examen dans le formulaire
        currentExam = JSON.parse(JSON.stringify(exam));
        
        document.getElementById('examTitle').value = exam.title;
        document.getElementById('examClass').value = exam.classId;
        document.getElementById('examSubject').value = exam.subject;
        document.getElementById('examDuration').value = exam.duration;
        document.getElementById('examDate').value = exam.date;
        document.getElementById('examInstructions').value = exam.instructions || '';
        
        // Charger les questions
        document.getElementById('questionsList').innerHTML = '';
        questionCounter = 0;
        
        exam.questions.forEach(question => {
            questionCounter++;
            const questionId = question.id || `question_${questionCounter}`;
            question.id = questionId;
            
            const questionHtml = `
                <div class="question-item" id="${questionId}">
                    <div class="question-header">
                        <span class="question-number">Question ${questionCounter}</span>
                        <div>
                            <select class="question-type" onchange="updateQuestionType('${questionId}')">
                                <option value="multiple" ${question.type === 'multiple' ? 'selected' : ''}>Choix multiple</option>
                                <option value="checkbox" ${question.type === 'checkbox' ? 'selected' : ''}>Cases à cocher</option>
                                <option value="text" ${question.type === 'text' ? 'selected' : ''}>Réponse textuelle</option>
                                <option value="truefalse" ${question.type === 'truefalse' ? 'selected' : ''}>Vrai/Faux</option>
                            </select>
                            <button class="btn-remove" onclick="removeQuestion('${questionId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="question-text">
                        <input type="text" class="option-input" value="${question.text}" onchange="updateQuestionText('${questionId}', this.value)">
                    </div>
                    <div class="options-container" id="options_${questionId}">
                        <!-- Options will be loaded by updateQuestionType -->
                    </div>
                </div>
            `;
            
            document.getElementById('questionsList').insertAdjacentHTML('beforeend', questionHtml);
            
            // Mettre à jour le type de question pour charger les options
            setTimeout(() => updateQuestionType(questionId), 100);
        });
        
        // Afficher le formulaire
        const form = document.getElementById('examForm');
        form.style.display = 'block';
        
        // Changer le gestionnaire de sauvegarde
        document.querySelector('.btn-save').onclick = function() {
            updateExam(examId);
        };
    }
}

function updateExam(examId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Valider et mettre à jour l'examen (similaire à saveExam)
    const title = document.getElementById('examTitle').value;
    const classId = document.getElementById('examClass').value;
    const subject = document.getElementById('examSubject').value;
    const duration = document.getElementById('examDuration').value;
    const date = document.getElementById('examDate').value;
    const instructions = document.getElementById('examInstructions').value;
    
    if (!title || !classId || !subject || !duration || !date) {
        alert('Veuillez remplir tous les champs obligatoires!');
        return;
    }
    
    if (currentExam.questions.length === 0) {
        alert('Veuillez ajouter au moins une question!');
        return;
    }
    
    // Mettre à jour l'examen
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const examIndex = exams.findIndex(e => e.id === examId);
    
    if (examIndex !== -1) {
        exams[examIndex] = {
            ...exams[examIndex],
            title: title,
            classId: classId,
            className: getClassName(classId),
            subject: subject,
            duration: parseInt(duration),
            date: date,
            instructions: instructions,
            questions: currentExam.questions,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('exams', JSON.stringify(exams));
        
        // Ajouter l'activité
        addActivity(currentUser.id, 'edit', `Examen modifié: ${title}`);
        
        // Recharger les examens
        loadExams(currentUser);
        
        // Masquer le formulaire
        toggleExamForm();
        
        // Restaurer le gestionnaire de sauvegarde
        document.querySelector('.btn-save').onclick = saveExam;
        
        alert('Examen mis à jour avec succès!');
    }
}

function publishExam(examId) {
    if (!confirm('Êtes-vous sûr de vouloir publier cet examen? Les élèves pourront y répondre.')) {
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const exam = exams.find(e => e.id === examId);
    
    if (exam) {
        exam.status = 'published';
        exam.publishedAt = new Date().toISOString();
        
        localStorage.setItem('exams', JSON.stringify(exams));
        
        // Ajouter l'activité
        addActivity(currentUser.id, 'share', `Examen publié: ${exam.title}`);
        
        // Recharger les examens
        loadExams(currentUser);
        
        alert('Examen publié avec succès!');
    }
}

function deleteExam(examId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen?')) {
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const exam = exams.find(e => e.id === examId);
    
    if (exam) {
        // Supprimer l'examen
        const updatedExams = exams.filter(e => e.id !== examId);
        localStorage.setItem('exams', JSON.stringify(updatedExams));
        
        // Ajouter l'activité
        addActivity(currentUser.id, 'delete', `Examen supprimé: ${exam.title}`);
        
        // Recharger les examens
        loadExams(currentUser);
        
        alert('Examen supprimé avec succès!');
    }
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

function initializeEventHandlers() {
    // Initialiser la date par défaut à demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('examDate').min = tomorrow.toISOString().slice(0, 16);
}

function initializeDemoData(user) {
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const userExams = exams.filter(exam => exam.teacherId === user.id);
    
    if (userExams.length === 0) {
        const demoExam = {
            id: Date.now(),
            title: 'Évaluation sur les fractions',
            classId: 'demo',
            className: '3ème A - 3ème',
            subject: 'maths',
            duration: 60,
            date: new Date(Date.now() + 86400000 * 3).toISOString(),
            instructions: 'Répondez à toutes les questions. Lisez attentivement chaque question avant de répondre.',
            questions: [
                {
                    id: 'demo_q1',
                    type: 'multiple',
                    text: 'Quelle est la forme simplifiée de 12/18?',
                    options: ['2/3', '3/4', '4/6', '6/9'],
                    correctAnswer: 0
                },
                {
                    id: 'demo_q2',
                    type: 'truefalse',
                    text: 'Le nombre 0.5 est égal à 1/2',
                    correctAnswer: true
                }
            ],
            teacherId: user.id,
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        exams.push(demoExam);
        localStorage.setItem('exams', JSON.stringify(exams));
        
        // Recharger les examens
        loadExams(user);
    }
}
