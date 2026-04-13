// Variables globales
let currentExam = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let timer = null;
let timeRemaining = 0;
let examStartTime = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID de l'examen depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('exam');
    
    if (!examId) {
        alert('Aucun examen spécifié');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Charger l'examen
    loadExam(examId);
});

function loadExam(examId) {
    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    const exam = exams.find(e => e.id == examId);
    
    if (!exam) {
        alert('Examen non trouvé');
        window.location.href = 'dashboard.html';
        return;
    }
    
    if (exam.status !== 'published') {
        alert('Cet examen n\'est pas encore disponible');
        window.location.href = 'dashboard.html';
        return;
    }
    
    currentExam = exam;
    examStartTime = new Date();
    
    // Initialiser les réponses utilisateur
    exam.questions.forEach(question => {
        userAnswers[question.id] = null;
    });
    
    // Afficher les informations de l'examen
    displayExamInfo();
    
    // Charger la première question
    loadQuestion(0);
    
    // Démarrer le timer
    startTimer();
    
    // Mettre à jour la progression
    updateProgress();
}

function displayExamInfo() {
    document.getElementById('examTitle').textContent = currentExam.title;
    document.getElementById('examSubject').textContent = currentExam.subject;
    document.getElementById('examDuration').textContent = `${currentExam.duration} min`;
    
    // Nom de l'élève (simulation)
    const studentName = localStorage.getItem('studentName') || 'Élève Demo';
    document.getElementById('studentName').textContent = studentName;
    
    // Instructions
    const instructionsText = currentExam.instructions || 
        'Lisez attentivement chaque question avant de répondre. Vous avez un temps limité pour compléter l\'examen.';
    document.getElementById('instructionsText').textContent = instructionsText;
}

function loadQuestion(index) {
    if (index < 0 || index >= currentExam.questions.length) {
        return;
    }
    
    currentQuestionIndex = index;
    const question = currentExam.questions[index];
    
    // Mettre à jour le compteur de questions
    document.getElementById('questionCounter').textContent = 
        `Question ${index + 1} sur ${currentExam.questions.length}`;
    
    // Créer le HTML de la question
    const questionHtml = createQuestionHtml(question);
    document.getElementById('questionsContainer').innerHTML = questionHtml;
    
    // Restaurer la réponse précédente si elle existe
    restoreAnswer(question);
    
    // Mettre à jour les boutons de navigation
    updateNavigationButtons();
    
    // Mettre à jour la progression
    updateProgress();
}

function createQuestionHtml(question) {
    let html = `
        <div class="question-card">
            <div class="question-header">
                <span class="question-number">Q${currentQuestionIndex + 1}</span>
            </div>
            <div class="question-text">${question.text}</div>
    `;
    
    switch (question.type) {
        case 'multiple':
            html += createMultipleChoiceHtml(question);
            break;
        case 'checkbox':
            html += createCheckboxHtml(question);
            break;
        case 'text':
            html += createTextHtml(question);
            break;
        case 'truefalse':
            html += createTrueFalseHtml(question);
            break;
    }
    
    html += '</div>';
    return html;
}

function createMultipleChoiceHtml(question) {
    let html = '<div class="options-container">';
    
    question.options.forEach((option, index) => {
        const optionId = `option_${index}`;
        html += `
            <div class="option-item" onclick="selectOption(${index}, 'multiple')">
                <input type="radio" name="question_${question.id}" value="${index}" id="${optionId}">
                <span class="option-label">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function createCheckboxHtml(question) {
    let html = '<div class="options-container">';
    
    question.options.forEach((option, index) => {
        const optionId = `checkbox_${index}`;
        html += `
            <div class="option-item" onclick="selectOption(${index}, 'checkbox')">
                <input type="checkbox" name="question_${question.id}" value="${index}" id="${optionId}">
                <span class="option-label">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function createTextHtml(question) {
    return `
        <div class="text-answer-container">
            <textarea 
                class="text-answer" 
                id="text_answer_${question.id}"
                placeholder="Écrivez votre réponse ici..."
                onchange="saveTextAnswer('${question.id}', this.value)"
            ></textarea>
        </div>
    `;
}

function createTrueFalseHtml(question) {
    return `
        <div class="true-false-container">
            <div class="true-false-option true-option" onclick="selectTrueFalse(true)">
                <i class="fas fa-check"></i> Vrai
            </div>
            <div class="true-false-option false-option" onclick="selectTrueFalse(false)">
                <i class="fas fa-times"></i> Faux
            </div>
        </div>
    `;
}

function selectOption(optionIndex, questionType) {
    const question = currentExam.questions[currentQuestionIndex];
    
    if (questionType === 'multiple') {
        // Désélectionner toutes les options
        document.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Sélectionner l'option cliquée
        const optionItems = document.querySelectorAll('.option-item');
        optionItems[optionIndex].classList.add('selected');
        
        // Cocher le radio button
        const radioButton = document.querySelector(`input[name="question_${question.id}"][value="${optionIndex}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
        
        // Sauvegarder la réponse
        userAnswers[question.id] = optionIndex;
        
    } else if (questionType === 'checkbox') {
        const optionItems = document.querySelectorAll('.option-item');
        const checkbox = document.querySelector(`input[name="question_${question.id}"][value="${optionIndex}"]`);
        
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            optionItems[optionIndex].classList.toggle('selected');
            
            // Sauvegarder la réponse
            if (!userAnswers[question.id]) {
                userAnswers[question.id] = [];
            }
            
            if (checkbox.checked) {
                userAnswers[question.id].push(optionIndex);
            } else {
                userAnswers[question.id] = userAnswers[question.id].filter(i => i !== optionIndex);
            }
        }
    }
    
    updateProgress();
}

function selectTrueFalse(value) {
    const question = currentExam.questions[currentQuestionIndex];
    
    // Désélectionner toutes les options
    document.querySelectorAll('.true-false-option').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Sélectionner l'option cliquée
    const optionItems = document.querySelectorAll('.true-false-option');
    optionItems[value ? 0 : 1].classList.add('selected');
    
    // Sauvegarder la réponse
    userAnswers[question.id] = value;
    
    updateProgress();
}

function saveTextAnswer(questionId, value) {
    userAnswers[questionId] = value;
    updateProgress();
}

function restoreAnswer(question) {
    const answer = userAnswers[question.id];
    
    if (answer === null || answer === undefined) {
        return;
    }
    
    switch (question.type) {
        case 'multiple':
            const radioButton = document.querySelector(`input[name="question_${question.id}"][value="${answer}"]`);
            if (radioButton) {
                radioButton.checked = true;
                const optionItems = document.querySelectorAll('.option-item');
                optionItems[answer].classList.add('selected');
            }
            break;
            
        case 'checkbox':
            if (Array.isArray(answer)) {
                answer.forEach(optionIndex => {
                    const checkbox = document.querySelector(`input[name="question_${question.id}"][value="${optionIndex}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        const optionItems = document.querySelectorAll('.option-item');
                        optionItems[optionIndex].classList.add('selected');
                    }
                });
            }
            break;
            
        case 'text':
            const textArea = document.getElementById(`text_answer_${question.id}`);
            if (textArea) {
                textArea.value = answer;
            }
            break;
            
        case 'truefalse':
            const optionItems = document.querySelectorAll('.true-false-option');
            optionItems[answer ? 0 : 1].classList.add('selected');
            break;
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        loadQuestion(currentQuestionIndex - 1);
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentExam.questions.length - 1;
}

function updateProgress() {
    const answeredQuestions = Object.keys(userAnswers).filter(key => {
        const answer = userAnswers[key];
        return answer !== null && answer !== undefined && 
               (Array.isArray(answer) ? answer.length > 0 : answer !== '');
    }).length;
    
    const totalQuestions = currentExam.questions.length;
    const progress = Math.round((answeredQuestions / totalQuestions) * 100);
    
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Progression: ${progress}% (${answeredQuestions}/${totalQuestions} questions répondues)`;
    
    // Mettre à jour le compteur dans le modal
    document.getElementById('answeredCount').textContent = answeredQuestions;
    document.getElementById('totalQuestions').textContent = totalQuestions;
}

function startTimer() {
    timeRemaining = currentExam.duration * 60; // Convertir en secondes
    
    timer = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        const timerElement = document.getElementById('timer');
        const timerContainer = document.getElementById('timerContainer');
        
        timerElement.textContent = `Temps restant: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Changer la couleur du timer selon le temps restant
        timerContainer.classList.remove('warning', 'danger');
        if (timeRemaining <= 300) { // 5 minutes
            timerContainer.classList.add('danger');
        } else if (timeRemaining <= 600) { // 10 minutes
            timerContainer.classList.add('warning');
        }
        
        // Soumettre automatiquement si le temps est écoulé
        if (timeRemaining <= 0) {
            clearInterval(timer);
            submitExam();
        }
    }, 1000);
}

function showConfirmation() {
    document.getElementById('confirmationModal').style.display = 'block';
}

function hideConfirmation() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function submitExam() {
    hideConfirmation();
    
    // Arrêter le timer
    if (timer) {
        clearInterval(timer);
    }
    
    // Calculer le temps pris
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - examStartTime) / 1000); // en secondes
    
    // Créer le résultat
    const result = {
        id: Date.now(),
        examId: currentExam.id,
        examTitle: currentExam.title,
        studentName: localStorage.getItem('studentName') || 'Élève Demo',
        studentId: 'demo_student',
        answers: userAnswers,
        timeTaken: timeTaken,
        submittedAt: endTime.toISOString(),
        score: calculateScore(),
        status: 'submitted'
    };
    
    // Sauvegarder le résultat
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    results.push(result);
    localStorage.setItem('examResults', JSON.stringify(results));
    
    // Afficher le message de confirmation
    showResults(result);
}

function calculateScore() {
    let correctAnswers = 0;
    let totalQuestions = currentExam.questions.length;
    
    currentExam.questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        const correctAnswer = question.correctAnswer;
        
        if (question.type === 'multiple' || question.type === 'truefalse') {
            if (userAnswer === correctAnswer) {
                correctAnswers++;
            }
        } else if (question.type === 'checkbox') {
            if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
                const userSet = new Set(userAnswer);
                const correctSet = new Set(correctAnswer);
                
                if (userSet.size === correctSet.size && 
                    [...userSet].every(x => correctSet.has(x))) {
                    correctAnswers++;
                }
            }
        } else if (question.type === 'text') {
            // Pour les réponses textuelles, on ne peut pas automatiser la correction
            // On pourrait implémenter une correspondance de chaînes ou des mots-clés
            // Pour l'instant, on considère que toute réponse non vide mérite des points partiels
            if (userAnswer && userAnswer.trim().length > 0) {
                correctAnswers += 0.5; // Points partiels
            }
        }
    });
    
    return {
        correct: correctAnswers,
        total: totalQuestions,
        percentage: Math.round((correctAnswers / totalQuestions) * 100)
    };
}

function showResults(result) {
    const score = result.score;
    const timeTaken = Math.floor(result.timeTaken / 60);
    
    const resultsHtml = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-check-circle" style="font-size: 4rem; color: #27ae60; margin-bottom: 20px;"></i>
            <h2 style="color: #27ae60; margin-bottom: 20px;">Examen soumis avec succès!</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Résultats</h3>
                <p><strong>Score:</strong> ${score.correct}/${score.total} (${score.percentage}%)</p>
                <p><strong>Temps:</strong> ${timeTaken} minutes</p>
                <p><strong>Date:</strong> ${new Date(result.submittedAt).toLocaleString('fr-FR')}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4>Récapitulatif des réponses</h4>
                ${generateAnswerSummary()}
            </div>
            
            <button onclick="window.location.href='dashboard.html'" style="background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                Retour au tableau de bord
            </button>
        </div>
    `;
    
    document.querySelector('.exam-container').innerHTML = resultsHtml;
}

function generateAnswerSummary() {
    let summary = '<ul style="list-style: none; padding: 0;">';
    
    currentExam.questions.forEach((question, index) => {
        const userAnswer = userAnswers[question.id];
        let answerText = 'Non répondue';
        
        if (userAnswer !== null && userAnswer !== undefined) {
            switch (question.type) {
                case 'multiple':
                    answerText = question.options[userAnswer] || 'Non valide';
                    break;
                case 'checkbox':
                    if (Array.isArray(userAnswer) && userAnswer.length > 0) {
                        answerText = userAnswer.map(i => question.options[i]).join(', ');
                    }
                    break;
                case 'text':
                    answerText = userAnswer.length > 50 ? userAnswer.substring(0, 50) + '...' : userAnswer;
                    break;
                case 'truefalse':
                    answerText = userAnswer ? 'Vrai' : 'Faux';
                    break;
            }
        }
        
        summary += `<li style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px;">
            <strong>Q${index + 1}:</strong> ${answerText}
        </li>`;
    });
    
    summary += '</ul>';
    return summary;
}

// Fermer le modal si on clique à l'extérieur
window.onclick = function(event) {
    const modal = document.getElementById('confirmationModal');
    if (event.target === modal) {
        hideConfirmation();
    }
}
