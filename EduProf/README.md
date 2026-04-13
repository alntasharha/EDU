# 🎓 EduProf - Plateforme Éducative pour Professeurs

**EduProf** est une application web complète de gestion scolaire pour professeurs, permettant de gérer classes, élèves, examens, notes et ressources pédagogiques.

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Fonctionnalités Principales

### 👨‍🏫 **Pour les Professeurs**
- 📊 **Tableau de bord** avec statistiques en temps réel
- 📝 **Gestion des classes** (création, modification, suppression)
- 📋 **Fiches de cotes** avec calcul automatique des moyennes
- 🧪 **Création d'examens** interactifs avec plusieurs types de questions
- 📚 **Partage de cours** et ressources pédagogiques
- 👤 **Profil personnel** avec avatar personnalisable

### 👨‍🎓 **Pour les Élèves**
- 📝 **Passage d'examens** en ligne
- 📊 **Visualisation des notes** et résultats
- 📚 **Téléchargement des cours**
- 🖼️ **Profil avec photo** personnalisable

### 👨‍💼 **Pour les Administrateurs**
- 📈 **Statistiques globales** de la plateforme
- 👥 **Gestion des utilisateurs**
- 💾 **Sauvegarde et export** des données

## 🚀 Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **Stockage** : LocalStorage (données persistantes côté client)
- **Icônes** : Font Awesome 6
- **Responsive** : Design mobile-first avec media queries

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- 💻 Ordinateurs de bureau
- 📱 Smartphones (iOS & Android)
- 📲 Tablettes

## 🎯 Pages Principales

| Page | Description |
|------|-------------|
| `index.html` | Page d'accueil avec inscription et connexion |
| `dashboard.html` | Tableau de bord professeur |
| `profile.html` | Profil et paramètres utilisateur |
| `grades.html` | Gestion des notes et fiches de cotes |
| `exams.html` | Création et gestion des examens |
| `courses.html` | Gestion des cours |
| `student-home.html` | Espace élève |
| `admin.html` | Panneau d'administration |

## 🛠️ Installation & Utilisation

### 1. Cloner le repository
```bash
git clone https://github.com/[TON_USERNAME]/EduProf.git
cd EduProf
```

### 2. Ouvrir le projet
Ouvrir `index.html` dans un navigateur web moderne.

### 3. Compte Admin par défaut
- **Email** : albinamani10@gmail.com
- **Mot de passe** : password123

## 🌐 Hébergement en Ligne

L'application peut être hébergée gratuitement sur :
- **GitHub Pages**
- **Netlify**
- **Vercel**

## 📝 Structure du Projet

```
EduProf/
├── index.html              # Page d'accueil
├── dashboard.html          # Tableau de bord
├── profile.html            # Profil utilisateur
├── grades.html             # Fiches de cotes
├── exams.html              # Gestion des examens
├── courses.html            # Cours
├── student-home.html       # Espace élève
├── admin.html              # Administration
├── styles.css              # Styles globaux
├── script.js               # Scripts globaux
├── *.js                    # Scripts spécifiques par page
└── *.jpg                   # Photos des étudiants
```

## 🎨 Fonctionnalités Détaillées

### 📊 Compteurs en temps réel
Les compteurs sur la page d'accueil affichent :
- Nombre de professeurs inscrits
- Nombre d'élèves inscrits
- Nombre de classes créées

### 🖼️ Upload d'Avatar
- Les utilisateurs peuvent télécharger leur photo de profil
- Stockage dans le LocalStorage (Base64)

### 📈 Statistiques des Notes
- Moyenne générale de la classe
- Meilleure et pire note
- Graphique de répartition (Excellent/Bien/Moyen/Insuffisant)

## 🔒 Sécurité

- Authentification requise pour les pages protégées
- Données stockées localement (LocalStorage)
- Validation des formulaires côté client

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

**© 2026 EduProf** - Plateforme éducative gratuite pour les professeurs
