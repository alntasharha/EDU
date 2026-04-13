// Gestion de la navigation mobile
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
});

// Gestion du modal de connexion
const modal = document.getElementById('loginModal');
const loginBtn = document.querySelector('a[href="#connexion"]');
const closeBtn = document.querySelector('.close');

loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Gestion du formulaire d'inscription
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Validation des mots de passe
    if (data.password !== data.confirmPassword) {
        alert('Les mots de passe ne correspondent pas!');
        return;
    }
    
    // Validation de la force du mot de passe
    if (data.password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères!');
        return;
    }
    
    // Sauvegarder l'utilisateur (simulation)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Vérifier si l'email existe déjà
    if (users.find(user => user.email === data.email)) {
        alert('Cet email est déjà utilisé!');
        return;
    }
    
    // Créer l'utilisateur
    const newUser = {
        id: Date.now(),
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password: data.password,
        matiere: data.matiere,
        etablissement: data.etablissement,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Envoyer la notification email
    if (window.notifyNewRegistration) {
        window.notifyNewRegistration(newUser);
    }
    
    // Sauvegarder l'utilisateur courant
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Réinitialiser le formulaire
    this.reset();
    
    // Afficher un modal de succès avec choix
    showSuccessModal(newUser);
});

// Gestion du formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Vérifier l'utilisateur
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === email && u.password === password);
    
    // Admin par défaut
    if (email === 'albinamani10@gmail.com' && password === 'password123') {
        if (!user) {
            user = {
                id: Date.now(),
                nom: 'Mani',
                prenom: 'Albina',
                email: 'albinamani10@gmail.com',
                etablissement: 'Ecole Demo',
                matiere: 'maths',
                password: 'password123',
                isAdmin: true,
                createdAt: new Date().toISOString()
            };
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    
    if (user) {
        // Sauvegarder la session
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Afficher le message de succès
        alert('Connexion réussie!');
        
        // Fermer le modal et rediriger
        modal.style.display = 'none';
        this.reset();
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        alert('Email ou mot de passe incorrect!');
    }
});

// Navigation smooth
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animation smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') !== '#connexion') {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Validation en temps réel des formulaires
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (password.length < 8) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = '#27ae60';
    }
    
    if (confirmPassword.value && password !== confirmPassword.value) {
        confirmPassword.style.borderColor = '#e74c3c';
    } else if (confirmPassword.value && password === confirmPassword.value) {
        confirmPassword.style.borderColor = '#27ae60';
    }
});

document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (password !== confirmPassword) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = '#27ae60';
    }
});

// Animation des statistiques au scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 1s ease-out';
        }
    });
}, observerOptions);

document.querySelectorAll('.stat').forEach(stat => {
    observer.observe(stat);
});

// Animation des feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
});

// Gestion du bouton "Mot de passe oublié"
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    const email = prompt('Entrez votre email pour réinitialiser votre mot de passe:');
    if (email) {
        alert(`Un email de réinitialisation a été envoyé à ${email}`);
    }
});

// Compteur de professeurs (simulation dynamique)
function updateTeacherCount() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const statNumber = document.querySelector('.stat-number');
    if (statNumber && statNumber.textContent === '500') {
        const remaining = Math.max(0, 500 - users.length);
        statNumber.textContent = remaining;
        document.querySelector('.stat-label').textContent = 'Places restantes';
    }
}

// Mettre à jour le compteur au chargement
updateTeacherCount();

// Sauvegarder l'état de la navigation
window.addEventListener('beforeunload', function() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
});

// Gestion des erreurs de formulaire
function showFieldError(field, message) {
    field.style.borderColor = '#e74c3c';
    
    // Créer ou mettre à jour le message d'erreur
    let errorDiv = field.parentNode.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '5px';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearFieldError(field) {
    field.style.borderColor = '#e1e8ed';
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validation email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validation temps réel de l'email
document.getElementById('email').addEventListener('blur', function() {
    if (!validateEmail(this.value)) {
        showFieldError(this, 'Veuillez entrer un email valide');
    } else {
        clearFieldError(this);
    }
});

// Effet parallaxe sur le hero
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Optimisation des performances
let ticking = false;
function requestTick() {
    if (!ticking) {
        window.requestAnimationFrame(updateAnimations);
        ticking = true;
    }
}

function updateAnimations() {
    // Mettre à jour les animations ici
    ticking = false;
}

window.addEventListener('scroll', requestTick);

// Modal de succès après inscription
function showSuccessModal(user) {
    // Créer le modal
    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.4s ease;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 2.5rem;
                color: white;
            ">
                <i class="fas fa-check"></i>
            </div>
            <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.8rem;">
                Bienvenue, ${user.prenom} ${user.nom} !
            </h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 1.1rem;">
                Votre inscription a été réussie. Que souhaitez-vous faire maintenant ?
            </p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="dashboard.html" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 30px;
                    border-radius: 30px;
                    text-decoration: none;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-th-large"></i> Tableau de Bord
                </a>
                <a href="profile.html" style="
                    background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
                    color: #2c3e50;
                    padding: 15px 30px;
                    border-radius: 30px;
                    text-decoration: none;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-user"></i> Voir Mon Profil
                </a>
            </div>
            <p style="margin-top: 20px; color: #999; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> Vous pourrez modifier vos informations dans votre profil
            </p>
        </div>
    `;
    
    // Ajouter les styles d'animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Ajouter le modal au body
    document.body.appendChild(modal);
    
    // Empêcher la fermeture en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            e.preventDefault();
        }
    });
}
