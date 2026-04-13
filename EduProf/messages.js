// Variables globales
let currentUser = null;
let conversations = [];
let currentConversation = null;
let messages = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mettre à jour l'interface utilisateur
    updateUserInterface();
    
    // Charger les conversations
    loadConversations();
    
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

function loadConversations() {
    // Charger les conversations depuis localStorage
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    conversations = allConversations.filter(conv => 
        conv.participants.includes(currentUser.id) || conv.participants.includes(currentUser.email)
    );
    
    displayConversations();
    
    // Charger la première conversation si elle existe
    if (conversations.length > 0) {
        selectConversation(conversations[0].id);
    } else {
        showEmptyState();
    }
}

function displayConversations() {
    const container = document.getElementById('conversationsList');
    
    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>Aucune conversation</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = conversations.map(conv => {
        const otherParticipant = getOtherParticipant(conv);
        const lastMessage = conv.messages[conv.messages.length - 1];
        const isUnread = !lastMessage.read && lastMessage.senderId !== currentUser.id;
        
        return `
            <div class="conversation-item ${currentConversation === conv.id ? 'active' : ''}" 
                 onclick="selectConversation(${conv.id})">
                <div class="conversation-header">
                    <div class="conversation-name">
                        ${otherParticipant.name}
                        ${isUnread ? '<span class="unread-indicator"></span>' : ''}
                    </div>
                    <div class="conversation-time">${formatMessageTime(lastMessage.timestamp)}</div>
                </div>
                <div class="conversation-preview">${lastMessage.text}</div>
            </div>
        `;
    }).join('');
}

function getOtherParticipant(conversation) {
    // Pour simplifier, on considère que l'autre participant est un élève
    // Dans une vraie application, il faudrait gérer les profils utilisateurs
    const participantNames = {
        'Alice Martin': 'Alice Martin',
        'Bob Bernard': 'Bob Bernard',
        'Claire Dubois': 'Claire Dubois',
        'David Petit': 'David Petit',
        'Emma Leroy': 'Emma Leroy',
        'parent1@example.com': 'Parent de Martin',
        'parent2@example.com': 'Parent de Dubois'
    };
    
    for (let participant of conversation.participants) {
        if (participant !== currentUser.id && participant !== currentUser.email) {
            return {
                id: participant,
                name: participantNames[participant] || participant
            };
        }
    }
    
    return { id: 'unknown', name: 'Inconnu' };
}

function selectConversation(conversationId) {
    currentConversation = conversationId;
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) return;
    
    // Mettre à jour l'affichage
    displayConversations();
    
    // Afficher l'en-tête de la conversation
    const otherParticipant = getOtherParticipant(conversation);
    document.getElementById('chatHeader').innerHTML = `
        <h3>${otherParticipant.name}</h3>
    `;
    
    // Afficher les messages
    displayMessages(conversation.messages);
    
    // Afficher la zone de saisie
    document.getElementById('messageInputArea').style.display = 'block';
    
    // Marquer les messages comme lus
    markMessagesAsRead(conversation);
}

function displayMessages(conversationMessages) {
    const container = document.getElementById('messagesList');
    
    if (conversationMessages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment"></i>
                <p>Aucun message dans cette conversation</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = conversationMessages.map(msg => {
        const isSent = msg.senderId === currentUser.id || msg.senderId === currentUser.email;
        const messageClass = isSent ? 'sent' : 'received';
        
        return `
            <div class="message ${messageClass}">
                <div class="message-bubble">
                    ${msg.text}
                    <div class="message-time">${formatMessageTime(msg.timestamp)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroller en bas
    container.scrollTop = container.scrollHeight;
}

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffTime < 60000) { // Moins d'une minute
        return 'À l\'instant';
    } else if (diffTime < 3600000) { // Moins d'une heure
        return `Il y a ${Math.floor(diffTime / 60000)} min`;
    } else if (diffTime < 86400000) { // Moins d'un jour
        return `Il y a ${Math.floor(diffTime / 3600000)} h`;
    } else if (diffDays === 1) {
        return 'Hier';
    } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
    } else {
        return date.toLocaleDateString('fr-FR');
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text || !currentConversation) return;
    
    const conversation = conversations.find(c => c.id === currentConversation);
    if (!conversation) return;
    
    // Créer le nouveau message
    const newMessage = {
        id: Date.now(),
        senderId: currentUser.id,
        senderName: `${currentUser.prenom} ${currentUser.nom}`,
        text: text,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Ajouter le message à la conversation
    conversation.messages.push(newMessage);
    
    // Sauvegarder la conversation
    saveConversations();
    
    // Vider le champ de saisie
    input.value = '';
    
    // Afficher le message
    displayMessages(conversation.messages);
    
    // Mettre à jour la liste des conversations
    displayConversations();
    
    // Simuler une réponse (pour démonstration)
    if (Math.random() > 0.7) {
        setTimeout(() => simulateResponse(conversation), 2000);
    }
}

function simulateResponse(conversation) {
    const responses = [
        'Merci professeur, je comprends mieux maintenant.',
        'Pouvez-vous m\'expliquer ce point en détail?',
        'Je vais faire les exercices ce soir.',
        'Est-ce qu\'il y aura un contrôle sur ce chapitre?',
        'J\'ai une question sur le dernier cours.',
        'Très bien, je vais réviser cela.',
        'Merci pour votre aide!'
    ];
    
    const otherParticipant = getOtherParticipant(conversation);
    
    const responseMessage = {
        id: Date.now(),
        senderId: otherParticipant.id,
        senderName: otherParticipant.name,
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        read: false
    };
    
    conversation.messages.push(responseMessage);
    saveConversations();
    
    if (currentConversation === conversation.id) {
        displayMessages(conversation.messages);
        displayConversations();
    }
}

function markMessagesAsRead(conversation) {
    conversation.messages.forEach(msg => {
        if (msg.senderId !== currentUser.id && msg.senderId !== currentUser.email) {
            msg.read = true;
        }
    });
    saveConversations();
}

function startNewConversation() {
    const participantName = prompt('Entrez le nom de la personne avec qui vous voulez discuter:');
    if (!participantName) return;
    
    const participantId = participantName.toLowerCase().replace(' ', '_');
    
    // Vérifier si la conversation existe déjà
    const existingConv = conversations.find(conv => 
        conv.participants.includes(participantId) || 
        conv.participants.includes(participantName)
    );
    
    if (existingConv) {
        selectConversation(existingConv.id);
        return;
    }
    
    // Créer une nouvelle conversation
    const newConversation = {
        id: Date.now(),
        participants: [currentUser.id, participantId],
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    conversations.push(newConversation);
    saveConversations();
    
    // Sélectionner la nouvelle conversation
    selectConversation(newConversation.id);
}

function handleMessageKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function saveConversations() {
    // Charger toutes les conversations
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    // Mettre à jour les conversations de l'utilisateur courant
    conversations.forEach(conv => {
        const existingIndex = allConversations.findIndex(c => c.id === conv.id);
        if (existingIndex !== -1) {
            allConversations[existingIndex] = conv;
        } else {
            allConversations.push(conv);
        }
    });
    
    localStorage.setItem('conversations', JSON.stringify(allConversations));
}

function showEmptyState() {
    document.getElementById('chatHeader').innerHTML = '<h3>Sélectionnez une conversation</h3>';
    document.getElementById('messagesList').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments"></i>
            <h3>Bienvenue dans les messages!</h3>
            <p>Commencez une nouvelle conversation pour communiquer avec vos élèves ou leurs parents.</p>
        </div>
    `;
    document.getElementById('messageInputArea').style.display = 'none';
}

function initializeEventHandlers() {
    // Ajuster la hauteur du textarea automatiquement
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
}

function initializeDemoData() {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    // Vérifier si des conversations de démonstration existent déjà
    const hasDemoConversations = allConversations.some(conv => 
        conv.participants.includes('Alice Martin') || 
        conv.participants.includes('Bob Bernard')
    );
    
    if (hasDemoConversations) return;
    
    // Créer des conversations de démonstration
    const demoConversations = [
        {
            id: Date.now() + 1,
            participants: [currentUser.id, 'Alice Martin'],
            messages: [
                {
                    id: Date.now() + 10,
                    senderId: 'Alice Martin',
                    senderName: 'Alice Martin',
                    text: 'Bonjour professeur, je n\'ai pas bien compris le chapitre sur les fractions.',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    read: true
                },
                {
                    id: Date.now() + 11,
                    senderId: currentUser.id,
                    senderName: `${currentUser.prenom} ${currentUser.nom}`,
                    text: 'Bonjour Alice! Pas de problème, je peux vous expliquer. Quelle partie vous pose problème?',
                    timestamp: new Date(Date.now() - 86000000).toISOString(),
                    read: true
                },
                {
                    id: Date.now() + 12,
                    senderId: 'Alice Martin',
                    senderName: 'Alice Martin',
                    text: 'C\'est surtout la division des fractions que je trouve difficile.',
                    timestamp: new Date(Date.now() - 85000000).toISOString(),
                    read: false
                }
            ],
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: Date.now() + 2,
            participants: [currentUser.id, 'Bob Bernard'],
            messages: [
                {
                    id: Date.now() + 20,
                    senderId: 'Bob Bernard',
                    senderName: 'Bob Bernard',
                    text: 'Merci pour le cours d\'aujourd\'hui, c\'était très clair!',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: true
                },
                {
                    id: Date.now() + 21,
                    senderId: currentUser.id,
                    senderName: `${currentUser.prenom} ${currentUser.nom}`,
                    text: 'Merci Bob! N\'hésitez pas si vous avez d\'autres questions.',
                    timestamp: new Date(Date.now() - 3000000).toISOString(),
                    read: true
                }
            ],
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    ];
    
    allConversations.push(...demoConversations);
    localStorage.setItem('conversations', JSON.stringify(allConversations));
    
    // Recharger les conversations
    loadConversations();
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}
