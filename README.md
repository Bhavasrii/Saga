# Saga — Stories worth telling

A real, production-quality editorial publishing platform designed for curious readers, independent writers, and publication editors. Saga emphasizes calm, distraction-free reading, thoughtful typography, and robust content workflow tools.

---

## Table of Contents
1. [Product Overview](#product-overview)
2. [Core Features](#core-features)
3. [Technology Stack](#technology-stack)
4. [Repository Structure](#repository-structure)
5. [Local Development Setup](#local-development-setup)
6. [Connecting the Database](#connecting-the-database)
7. [Environment Variables](#environment-variables)
8. [Demo Logins](#demo-logins)
9. [REST API Endpoints](#rest-api-endpoints)
10. [Entity Relationship Diagram](#entity-relationship-diagram)
11. [Deployment Guide](#deployment-guide)

---

## Product Overview

Saga is built around an editorial aesthetic inspired by traditional print journals and modern digital publications like *Substack* and *Medium*. It provides distinct, role-tailored workflows:
- **Readers** explore curated stories, browse by topics and tags, search by keywords, and engage in thoughtful discussions through community responses.
- **Writers** compose essays with rich content, summary excerpts, cover imagery, and manage their portfolio through a dedicated writer dashboard.
- **Editors** manage publication topics and tags, schedule future publications, curate cover imagery in the media library, and moderate community discussion queues.
- **Admins** oversee editorial operations, manage member roles, and monitor engagement through real-time MongoDB aggregation metrics on the Insights dashboard.

---

## Core Features

- **Authentication & Role-Based Workflows**: Secure JWT authentication with BCrypt password hashing. Strict role segregation (`admin`, `editor`, `author`, `reader`).
- **Editorial Writing & Drafts**: Story creation supporting custom titles, topics, tag associations, custom excerpts, cover image selection, and status transitions (`draft`, `pending`, `scheduled`, `published`).
- **Scheduled Publishing**: Background cron scheduler running every 60 seconds that transitions scheduled stories whose target time has arrived to published status.
- **Reading Experience**: SOURCE SERIF 4 and INTER typography hierarchy, dynamic reading time calculation (`Math.ceil(words / 200)`), incrementing view count analytics, and responsive layout across mobile and desktop.
- **Community Responses with Editorial Queue**: Readers can submit responses that are held in a moderation queue until approved or rejected by editors.
- **Topic & Tag Taxonomy**: Hierarchical categorization by topics (e.g., Technology, Design, Career, Productivity) and flexible keyword tags.
- **Media Library**: Curated repository of high-resolution imagery for story covers with one-click copy and picker integration.
- **Insights Dashboard**: Real-time aggregation pipelines computing story status distribution, member role ratios, moderation backlog, and top-read stories.

---

## Technology Stack

- **Frontend**: React 18 (Plain JavaScript / ES Modules), Vite, React Router DOM v6, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js v20+, Express.js, MongoDB Atlas with Mongoose ODM, Node-Cron, Express-Validator, JSONWebToken, BCryptJS.
- **Architecture**: Decoupled Client-Server REST architecture with strict CORS isolation and centralized error handling.

---

## Repository Structure

```
.
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile
│   │   ├── categoryController.js # Topic CRUD operations
│   │   ├── commentController.js  # Comment submission and moderation
│   │   ├── mediaController.js    # Media library management
│   │   ├── postController.js     # Story CRUD, filters, and searches
│   │   ├── reportController.js   # Insights aggregation summary
│   │   ├── tagController.js      # Keyword tag management
│   │   └── userController.js     # Member administration
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification and optional auth
│   │   ├── errorMiddleware.js    # 404 and central error handling
│   │   ├── roleMiddleware.js     # Role authorization guard
│   │   └── validate.js           # Express-validator wrapper
│   ├── models/
│   │   ├── Category.js           # Topic schema and auto-slug
│   │   ├── Comment.js            # Responses with moderation status
│   │   ├── Media.js              # Media asset schema
│   │   ├── Post.js               # Story schema with text index
│   │   ├── Tag.js                # Keyword tag schema
│   │   └── User.js               # Member schema with password hashing
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── mediaRoutes.js
│   │   ├── postRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── tagRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── scheduler.js          # Node-cron job for scheduled publishing
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   ├── seeder.js                 # Production database seeder
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios client with bearer interceptor
│   │   ├── components/
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── MediaPickerModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── StoryCard.jsx
│   │   │   └── TopicBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context provider
│   │   ├── pages/
│   │   │   ├── AllStories.jsx    # Editorial story management
│   │   │   ├── CommentsManage.jsx# Comment review queue
│   │   │   ├── Home.jsx          # Landing page with featured story
│   │   │   ├── Insights.jsx      # Metrics and aggregation charts
│   │   │   ├── MediaLibrary.jsx  # Asset repository
│   │   │   ├── MembersManage.jsx # Member role management
│   │   │   ├── NotFound.jsx      # 404 page
│   │   │   ├── SignIn.jsx        # Login page
│   │   │   ├── SignUp.jsx        # Registration page
│   │   │   ├── Stories.jsx       # Public story discovery & filters
│   │   │   ├── StoryDetail.jsx   # Article reading view & comments
│   │   │   ├── StoryEditor.jsx   # Story composition and editing
│   │   │   ├── TagsManage.jsx    # Tag management
│   │   │   ├── TopicsManage.jsx  # Topic management
│   │   │   └── YourStories.jsx   # Writer story dashboard
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx# Role-aware route guard
│   │   ├── App.jsx               # Application routes
│   │   ├── index.css             # Tailwind and typography imports
│   │   └── main.jsx              # React DOM entry point
│   ├── .env.example              # Frontend environment variables template
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json               # SPA routing rewrite configuration
│   └── vite.config.js            # Vite configuration with /api proxy
├── .gitignore
└── README.md
```

---

## Local Development Setup

### 1. Clone & Dependencies
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs at `http://localhost:3000` and proxies `/api` calls directly to `http://localhost:5000`.

---

## Connecting the Database

1. Copy the environment configuration template in the `backend` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Replace `YOUR_PASSWORD` in `MONGO_URI` with your MongoDB Atlas database user password. Ensure the URI points to `/saga` as the database name:
   ```env
   MONGO_URI=mongodb+srv://Saga:YOUR_PASSWORD@cluster0.o6shd8y.mongodb.net/saga?retryWrites=true&w=majority
   ```
3. If your password contains special characters (e.g. `@`, `#`, `:`, `!`), ensure they are URL-encoded (e.g. `@` becomes `%40`).
4. In your MongoDB Atlas dashboard under **Network Access**, ensure IP access list allows `0.0.0.0/0` (Allow Access from Anywhere) or your server IP.
5. Launch the backend server. Look for the confirmation log in your terminal:
   ```
   MongoDB connected: cluster0.o6shd8y.mongodb.net
   ```
   *Note: If `MONGO_URI` is not defined in local development, the backend automatically boots an in-memory MongoDB instance so you can develop immediately.*

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP port for Express | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://Saga:...@cluster0.o6shd8y.mongodb.net/saga?retryWrites=true&w=majority` |
| `JWT_SECRET` | Cryptographic secret for signing JWT tokens | `your_long_random_secret` |
| `CLIENT_URL` | Allowed origin for Cross-Origin Resource Sharing (CORS) | `http://localhost:3000` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend API requests (leave empty in local dev to use proxy) | `http://localhost:5000/api` |

---

## Demo Logins

The database seeder automatically seeds the following accounts with sample stories, topics, tags, and comments. 

**Default Password for all accounts:** `password123`

| Name | Role | Email | Capabilities |
| :--- | :--- | :--- | :--- |
| **Eleanor Vance** | Admin | `admin@saga.com` | Full administrative control, member role management, insights, publishing, moderation |
| **Julian Croft** | Editor | `editor@saga.com` | Edit any story, publish, schedule stories, topic/tag management, comment moderation |
| **Elena Rostova** | Writer | `elena@saga.com` | Create and edit own stories, save drafts, submit for review, media uploads |
| **Marcus Chen** | Writer | `marcus@saga.com` | Create and edit own stories, save drafts, submit for review, media uploads |
| **Sarah Jenkins** | Reader | `sarah@saga.com` | Browse published stories, search, submit comments |

To manually re-run the seeder:
```bash
cd backend
npm run seed
```

---

## REST API Endpoints

### Authentication
- `POST /api/auth/register` — Create a new reader account
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/me` — Retrieve current authenticated member session
- `PUT /api/auth/me` — Update name or password

### Stories (`/api/posts`)
- `GET /api/posts` — List stories (supports `page`, `limit`, `search`, `category`, `tag`, `status`, `sort`, `author`, `mine`)
- `GET /api/posts/:slug` — Retrieve story by slug (increments view count)
- `POST /api/posts` — Create a new story (`draft`, `pending`, `published`, `scheduled`)
- `PUT /api/posts/:id` — Update an existing story
- `DELETE /api/posts/:id` — Remove a story and associated comments

### Topics (`/api/categories`)
- `GET /api/categories` — List topics with published story counts
- `GET /api/categories/:slug` — Retrieve topic details
- `POST /api/categories` — Create topic (Editor/Admin)
- `PUT /api/categories/:id` — Update topic (Editor/Admin)
- `DELETE /api/categories/:id` — Remove topic if unassigned (Editor/Admin)

### Tags (`/api/tags`)
- `GET /api/tags` — List tags with story counts
- `POST /api/tags` — Create tag (Editor/Admin)
- `PUT /api/tags/:id` — Update tag (Editor/Admin)
- `DELETE /api/tags/:id` — Remove tag (Editor/Admin)

### Responses & Moderation (`/api/comments`)
- `GET /api/comments/post/:postId` — Get approved responses for a story
- `GET /api/comments` — Editorial response review queue (Editor/Admin)
- `POST /api/comments` — Submit response (Held for review)
- `PUT /api/comments/:id/status` — Approve or reject response (Editor/Admin)
- `DELETE /api/comments/:id` — Delete response

### Media Library (`/api/media`)
- `GET /api/media` — List media assets
- `POST /api/media` — Save media item with URL and title
- `DELETE /api/media/:id` — Remove media item

### Members (`/api/users`)
- `GET /api/users` — Member directory with search & role filter (Admin)
- `PUT /api/users/:id/role` — Update member role (Admin)
- `DELETE /api/users/:id` — Remove member (Admin)

### Insights (`/api/reports`)
- `GET /api/reports/summary` — Aggregated KPI metrics and chart datasets (Editor/Admin)

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ POST : "authors"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ MEDIA : "uploads"
    CATEGORY ||--o{ POST : "categorizes"
    POST ||--o{ COMMENT : "receives"
    POST }o--o{ TAG : "tagged_with"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "admin | editor | author | reader"
        Date createdAt
    }

    POST {
        ObjectId _id PK
        string title
        string slug UK
        string content
        string excerpt
        string coverImage
        ObjectId author FK
        ObjectId category FK
        ObjectId[] tags FK
        string status "draft | pending | scheduled | published"
        Date publishAt
        number views
        Date createdAt
    }

    CATEGORY {
        ObjectId _id PK
        string name UK
        string slug UK
        string description
    }

    TAG {
        ObjectId _id PK
        string name UK
        string slug UK
    }

    COMMENT {
        ObjectId _id PK
        ObjectId post FK
        ObjectId user FK
        string text
        string status "pending | approved | rejected"
        Date createdAt
    }

    MEDIA {
        ObjectId _id PK
        string title
        string url
        string altText
        ObjectId uploadedBy FK
        Date createdAt
    }
```

---

## Deployment Guide

### 1. MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with Read and Write privileges.
3. Under **Network Access**, add `0.0.0.0/0` to allow connections from cloud hosts.
4. Copy the connection string and paste it into the `MONGO_URI` environment variable.

### 2. Backend Deployment (Render)
1. Link your Git repository on [Render](https://render.com) and create a new **Web Service**.
2. Set Root Directory to `backend`.
3. Set Build Command to `npm install`.
4. Set Start Command to `npm start`.
5. Add the Environment Variables:
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A long random secret string
   - `CLIENT_URL`: Your production Vercel frontend URL (e.g., `https://saga-stories.vercel.app`)
6. Deploy the service and note your live backend URL (e.g., `https://saga-api.onrender.com`).

### 3. Frontend Deployment (Vercel)
1. Import your Git repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Framework Preset: **Vite**.
4. Add the Environment Variable:
   - `VITE_API_URL`: Your Render backend API address ending with `/api` (e.g., `https://saga-api.onrender.com/api`).
5. Deploy. `vercel.json` will automatically route client-side URLs to `index.html`.
