# SimMongo Edu 🎓

**Plateforme éducative interactive pour comprendre visuellement l'architecture de MongoDB.**

Simulez un cluster MongoDB complet avec Replica Sets, Sharding, et Chaos Engineering — le tout dans votre navigateur, sans aucune installation de base de données.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React%20+%20Vite-61DAFB?style=flat-square)
![Stack](https://img.shields.io/badge/Graph-React%20Flow-FF6B6B?style=flat-square)

---

## 🚀 Démarrage Rapide

### Prérequis

- **Python 3.10+** ([python.org](https://python.org))
- **Node.js 18+** ([nodejs.org](https://nodejs.org))

### 1. Backend (FastAPI)

```bash
# Depuis la racine du projet
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur (port 8000)
python main.py
```

Le serveur API sera accessible sur : `http://localhost:8000`

Documentation Swagger automatique : `http://localhost:8000/docs`

### 2. Frontend (React + Vite)

```bash
# Depuis la racine du projet
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement (port 5173)
npm run dev
```

L'application sera accessible sur : `http://localhost:5173`

> **Note :** Le proxy Vite redirige automatiquement les appels `/api/*` vers le backend FastAPI sur le port 8000.

---

## 📖 Fonctionnalités

### Module 1 : Landing Page Éducative
- Présentation visuelle des 3 concepts clés de MongoDB
- Design SaaS en Dark Mode avec animations

### Module 2 : Configurateur (Wizard)
- Choix du nombre de Shards (1–4)
- Choix du nombre de Secondaires par Replica Set (1–3)
- Sélection de la stratégie de partitionnement :
  - **Hachage (Hash)** : Distribution via MD5
  - **Intervalle (Range)** : Distribution par clé numérique

### Module 3 : Playground Interactif
- **Graphe React Flow** : Visualisation dynamique de la topologie
- **Console d'insertion** : Insérez des documents et observez le routage
- **Journal pédagogique** : Explications en temps réel de chaque opération
- **Chaos Engineering** : Simulez des pannes et observez l'élection automatique

---

## 🏗️ Architecture

```
SimMongoDB/
├── backend/
│   ├── main.py              # FastAPI + Classes OOP (Node, ReplicaSet, Shard, Router, ClusterManager)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js            # Client Axios
│   │   ├── App.jsx           # Router React
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── WizardPage.jsx
│   │   │   └── PlaygroundPage.jsx
│   │   └── components/
│   │       ├── landing/
│   │       └── playground/
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🎨 Code Couleur

| Élément | Couleur |
|---------|---------|
| Routeur (mongos) | 🔵 Bleu `#3B82F6` |
| Nœud Primaire | 🟡 Ambre `#F59E0B` |
| Nœud Secondaire | 🟢 Émeraude `#10B981` |
| Nœud en Panne | 🔴 Rouge `#EF4444` |
| Fond | ⬛ Slate `#0F172A` |

---

## 📡 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/cluster/create` | Créer un nouveau cluster |
| `GET` | `/api/cluster/state` | Obtenir l'état du cluster |
| `POST` | `/api/cluster/insert` | Insérer un document |
| `POST` | `/api/cluster/node/{id}/kill` | Simuler une panne |
| `POST` | `/api/cluster/node/{id}/repair` | Réparer un nœud |
| `POST` | `/api/cluster/reset` | Réinitialiser le cluster |
