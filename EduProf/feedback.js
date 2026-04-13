// Variables globales
let selectedPriority = 'medium';

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializePrioritySelector();
    initializeForms();
    loadRecentFeedback();
});

function initializePrioritySelector() {
    const priorityOptions = document.querySelectorAll('.priority-option');
    
    priorityOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Désélectionner toutes les options
            priorityOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Sélectionner l'option cliquée
            this.classList.add('selected');
            selectedPriority = this.dataset.priority;
        });
    });
}

function initializeForms() {
    // Formulaire de suggestion
    document.getElementById('suggestionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitSuggestion();
    });
    
    // Formulaire de contact
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitContact();
    });
}

function submitSuggestion() {
    const name = document.getElementById('suggestionName').value.trim();
    const email = document.getElementById('suggestionEmail').value.trim();
    const title = document.getElementById('suggestionTitle').value.trim();
    const description = document.getElementById('suggestionDescription').value.trim();
    const category = document.getElementById('suggestionCategory').value;
    
    if (!name || !email || !title || !description) {
        showMessage('suggestionError', 'Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Créer l'objet suggestion
    const suggestion = {
        id: Date.now(),
        type: 'suggestion',
        name: name,
        email: email,
        title: title,
        description: description,
        priority: selectedPriority,
        category: category,
        timestamp: new Date().toISOString(),
        status: 'new'
    };
    
    // Sauvegarder la suggestion
    saveFeedback(suggestion);
    
    // Envoyer l'email de notification
    sendEmailNotification('suggestion', suggestion);
    
    // Afficher le message de succès
    showMessage('suggestionSuccess', 'Votre suggestion a été envoyée avec succès!');
    
    // Réinitialiser le formulaire
    document.getElementById('suggestionForm').reset();
    
    // Réinitialiser la priorité
    document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.priority-option[data-priority="medium"]').classList.add('selected');
    selectedPriority = 'medium';
    
    // Recharger les suggestions récentes
    loadRecentFeedback();
}

function submitContact() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const project = document.getElementById('contactProject').value;
    const budget = document.getElementById('contactBudget').value;
    const message = document.getElementById('contactMessage').value.trim();
    
    if (!name || !email || !project || !message) {
        showMessage('contactError', 'Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Créer l'objet contact
    const contact = {
        id: Date.now(),
        type: 'contact',
        name: name,
        email: email,
        phone: phone,
        project: project,
        budget: budget,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'new'
    };
    
    // Sauvegarder la demande de contact
    saveFeedback(contact);
    
    // Envoyer l'email de notification
    sendEmailNotification('contact', contact);
    
    // Afficher le message de succès
    showMessage('contactSuccess', 'Votre demande a été envoyée! Nous vous contacterons bientôt.');
    
    // Réinitialiser le formulaire
    document.getElementById('contactForm').reset();
    
    // Recharger les suggestions récentes
    loadRecentFeedback();
}

function saveFeedback(feedback) {
    const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
    allFeedback.push(feedback);
    localStorage.setItem('feedback', JSON.stringify(allFeedback));
}

function sendEmailNotification(type, data) {
    // Simuler l'envoi d'email (dans une vraie application, cela utiliserait un service backend)
    const emailContent = generateEmailContent(type, data);
    
    // Créer une notification email dans localStorage pour simulation
    const emailNotifications = JSON.parse(localStorage.getItem('emailNotifications') || '[]');
    
    const notification = {
        id: Date.now(),
        type: type,
        to: 'albinamani25@gmail.com',
        from: data.email,
        subject: getEmailSubject(type, data),
        content: emailContent,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    emailNotifications.push(notification);
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
    
    // Simuler l'envoi (dans la réalité, cela appellerait un service backend)
    console.log('EMAIL NOTIFICATION SENT:', notification);
    
    // Afficher une notification dans la console pour le débogage
    console.log(`📧 Email envoyé à albinamani25@gmail.com`);
    console.log(`📋 Sujet: ${notification.subject}`);
    console.log(`📝 Contenu: ${emailContent}`);
}

function generateEmailContent(type, data) {
    if (type === 'suggestion') {
        return `
Nouvelle suggestion d'amélioration pour EduProf!

👤 Nom: ${data.name}
📧 Email: ${data.email}
📝 Titre: ${data.title}
🏷️ Catégorie: ${getCategoryLabel(data.category)}
⭐ Priorité: ${getPriorityLabel(data.priority)}

📄 Description:
${data.description}

📅 Date: ${new Date(data.timestamp).toLocaleString('fr-FR')}

---
Cet email a été généré automatiquement depuis le formulaire de suggestions d'EduProf.
        `;
    } else if (type === 'contact') {
        return `
Nouvelle demande de site web!

👤 Nom: ${data.name}
📧 Email: ${data.email}
📱 Téléphone: ${data.phone || 'Non spécifié'}
🏗️ Type de projet: ${getProjectLabel(data.project)}
💰 Budget: ${data.budget || 'Non spécifié'}

📄 Message:
${data.message}

📅 Date: ${new Date(data.timestamp).toLocaleString('fr-FR')}

---
Cet email a été généré automatiquement depuis le formulaire de contact d'EduProf.
        `;
    }
}

function getEmailSubject(type, data) {
    if (type === 'suggestion') {
        return `🎯 Nouvelle suggestion: ${data.title}`;
    } else if (type === 'contact') {
        return `🌐 Nouvelle demande de site: ${getProjectLabel(data.project)}`;
    }
}

function getCategoryLabel(category) {
    const labels = {
        feature: 'Nouvelle fonctionnalité',
        improvement: 'Amélioration existante',
        bug: 'Correction de bug',
        design: 'Design/Interface',
        performance: 'Performance',
        other: 'Autre'
    };
    return labels[category] || category;
}

function getPriorityLabel(priority) {
    const labels = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute'
    };
    return labels[priority] || priority;
}

function getProjectLabel(project) {
    const labels = {
        education: 'Plateforme éducative',
        ecommerce: 'Site e-commerce',
        corporate: 'Site institutionnel',
        portfolio: 'Portfolio personnel',
        blog: 'Blog/Média',
        other: 'Autre projet'
    };
    return labels[project] || project;
}

function loadRecentFeedback() {
    const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
    const recentFeedback = allFeedback
        .filter(item => item.type === 'suggestion')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    const container = document.getElementById('recentFeedback');
    
    if (recentFeedback.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Aucune suggestion pour le moment</h3>
                <p>Soyez le premier à proposer une idée pour améliorer EduProf!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentFeedback.map(item => `
        <div class="feedback-item">
            <div class="feedback-header-info">
                <div class="feedback-author">${item.name}</div>
                <div class="feedback-date">${formatDate(item.timestamp)}</div>
            </div>
            <div class="feedback-content">
                <strong>${item.title}</strong>
                <p>${item.description}</p>
            </div>
            <div class="feedback-meta">
                <span class="feedback-type">${getCategoryLabel(item.category)}</span>
                <span class="feedback-priority priority-badge-${item.priority}">
                    ${getPriorityLabel(item.priority)}
                </span>
            </div>
        </div>
    `).join('');
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

function showMessage(messageId, text) {
    const messageElement = document.getElementById(messageId);
    messageElement.style.display = 'block';
    
    // Faire disparaître le message après 5 secondes
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Notification d'inscription
function notifyNewRegistration(userData) {
    const notification = {
        id: Date.now(),
        type: 'registration',
        to: 'albinamani25@gmail.com',
        from: userData.email,
        subject: `👨‍🏫 Nouvelle inscription: ${userData.prenom} ${userData.nom}`,
        content: `
Nouveau professeur inscrit sur EduProf!

👤 Nom: ${userData.prenom} ${userData.nom}
📧 Email: ${userData.email}
🏫 Établissement: ${userData.etablissement}
📚 Matière: ${userData.matiere}

📅 Date d'inscription: ${new Date().toLocaleString('fr-FR')}

---
Cet email a été généré automatiquement depuis le formulaire d'inscription d'EduProf.
        `,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    const emailNotifications = JSON.parse(localStorage.getItem('emailNotifications') || '[]');
    emailNotifications.push(notification);
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
    
    console.log('📧 Email d\'inscription envoyé à albinamani25@gmail.com');
    console.log(`👋 Bienvenue ${userData.prenom} ${userData.nom}!`);
}

// Fonction pour être appelée depuis d'autres pages
window.notifyNewRegistration = notifyNewRegistration;
window.sendEmailNotification = sendEmailNotification;
