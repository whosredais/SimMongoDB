# SimMongo Edu 🎓

**Plateforme éducative interactive pour comprendre visuellement l'architecture de MongoDB.**

Simulez un cluster MongoDB complet avec Replica Sets, Sharding, et Chaos Engineering — le tout dans votre navigateur, sans aucune installation de base de données.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat-square)
![Stack](https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=flat-square)
![Stack](https://img.shields.io/badge/Graph-React%20Flow%2012-FF6B6B?style=flat-square)
![Stack](https://img.shields.io/badge/CSS-Tailwind%204-06B6D4?style=flat-square)

---

## 🚀 Démarrage Rapide

### Prérequis

- **Python 3.10+** ([python.org](https://python.org))
- **Node.js 18+** ([nodejs.org](https://nodejs.org))

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

→ API sur `http://localhost:8000` | Swagger : `http://localhost:8000/docs`

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

→ App sur `http://localhost:5173`

> **Note :** Le proxy Vite redirige automatiquement les appels `/api/*` vers le backend FastAPI sur le port 8000.

---

## 📖 Fonctionnalités

### 🏠 Module 1 — Landing Page Éducative
- Présentation visuelle des 3 piliers de MongoDB (Node, Replica Set, Sharding)
- Design SaaS Dark Mode avec animations glassmorphism
- Section "À propos" avec statistiques

### ⚙️ Module 2 — Configurateur (Wizard)
- Choix du nombre de **Shards** (1–4) avec aperçu visuel
- Choix du nombre de **Secondaires** par Replica Set (1–3)
- Sélection de la stratégie de partitionnement :
  - **Hachage (Hash)** — Distribution uniforme via MD5
  - **Intervalle (Range)** — Distribution par clé numérique avec intervalles auto-générés
- Aperçu récapitulatif en temps réel (total nœuds)

### 🎮 Module 3 — Playground Interactif
- **Graphe React Flow** — Visualisation interactive de la topologie (zoom, pan, drag)
- **Console d'insertion** — Insérez des documents et observez le routage (Hash MD5 ou Range)
- **Simulation de pannes** — Bouton "Panne" sur chaque Primaire → élection automatique
- **Réparation** — Remise en service d'un nœud comme Secondaire avec resync
- **Journal pédagogique** — Logs en temps réel expliquant chaque opération en français
- **Info-bulles** — Survol de chaque nœud pour une explication de son rôle

### 📊 Module 4 — Dashboard Métriques
- 4 compteurs animés : Insertions, Pannes, Réparations, Élections
- **Bar chart** horizontal — Distribution des documents par shard
- **Donut chart SVG** — Répartition en pourcentage avec légende
- **Timeline** — Historique des 15 dernières insertions
- Mise à jour en temps réel après chaque opération

### 🔄 Module 5 — Animation de Flux de Données
- Animation SVG en 5 phases lors de chaque insertion :
  1. 🔍 Pulse bleu au routeur (analyse de la clé)
  2. 📦 Particule lumineuse voyageant sur une courbe de Bézier
  3. ✍️ Pulse orange au Primaire cible (écriture)
  4. 🔄 Particules vertes vers les Secondaires (réplication)
  5. ✅ Confirmation visuelle
- Barre de progression et label de phase

### 🎯 Module 6 — Mode Quiz
- **10 questions QCM** couvrant tous les concepts (Sharding, Replica Sets, Élections, Hash/Range, mongos)
- Feedback immédiat (vert/rouge) avec **explication détaillée**
- Score final avec badges : 🥉 Bronze | 🥈 Argent | 🥇 Or | 💎 Platine
- Animation confetti pour les scores ≥ 7/10
- Récapitulatif des réponses + bouton "Recommencer"

---

## 🏗️ Architecture

```
SimMongoDB/
├── backend/
│   ├── main.py                       # FastAPI + Modèles OOP
│   │   ├── Node, ReplicaSet, Shard, Router
│   │   ├── ClusterManager (Singleton)
│   │   └── 6 endpoints REST
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # Point d'entrée React
│   │   ├── App.jsx                   # Routeur (3 routes)
│   │   ├── api.js                    # Client Axios
│   │   ├── index.css                 # Styles + 10 animations CSS
│   │   │
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Page d'accueil
│   │   │   ├── WizardPage.jsx        # Configurateur 3 étapes
│   │   │   └── PlaygroundPage.jsx    # Simulateur principal
│   │   │
│   │   └── components/
│   │       ├── landing/
│   │       │   ├── Hero.jsx
│   │       │   ├── ConceptCard.jsx
│   │       │   └── Footer.jsx
│   │       │
│   │       └── playground/
│   │           ├── ClusterGraph.jsx      # Graphe React Flow
│   │           ├── RouterNode.jsx        # Nœud mongos
│   │           ├── PrimaryNode.jsx       # Nœud primaire
│   │           ├── SecondaryNode.jsx     # Nœud secondaire
│   │           ├── InsertConsole.jsx     # Console d'insertion
│   │           ├── LogPanel.jsx          # Journal pédagogique
│   │           ├── MetricsDashboard.jsx  # 📊 Dashboard métriques
│   │           ├── DataFlowOverlay.jsx   # 🔄 Animation flux
│   │           └── QuizModal.jsx         # 🎯 Quiz 10 questions
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🛠️ Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React | 19.2.6 |
| Bundler | Vite | 8.0.12 |
| Graphe | @xyflow/react (React Flow) | 12.10.2 |
| Routage | React Router DOM | 7.15.0 |
| HTTP Client | Axios | 1.16.0 |
| Icônes | Lucide React | 1.14.0 |
| CSS | Tailwind CSS | 4.3.0 |
| Backend | FastAPI (Python) | latest |
| Serveur ASGI | Uvicorn | latest |
| Validation | Pydantic | latest |

---

## 🎨 Code Couleur

| Élément | Couleur |
|---------|---------|
| Routeur (mongos) | 🔵 Bleu `#3B82F6` |
| Nœud Primaire | 🟡 Ambre `#F59E0B` |
| Nœud Secondaire | 🟢 Émeraude `#10B981` |
| Nœud en Panne | 🔴 Rouge `#EF4444` |
| Fond principal | ⬛ Slate `#0F172A` |
| Accent principal | 🟣 Indigo `#6366F1` |

---

## 📡 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/cluster/create` | Créer un nouveau cluster |
| `GET` | `/api/cluster/state` | Obtenir l'état complet du cluster |
| `POST` | `/api/cluster/insert` | Insérer un document |
| `POST` | `/api/cluster/node/{id}/kill` | Simuler une panne |
| `POST` | `/api/cluster/node/{id}/repair` | Réparer un nœud |
| `POST` | `/api/cluster/reset` | Réinitialiser le cluster |

---

## 📄 Licence

Projet académique — Tous droits réservés.
