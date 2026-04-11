
<!--
  EDUSYNC — HACKINDIA 2026
  Inter-campus Peer-to-Peer Skill Exchange Platform
  Built by: Team Error404
  Deployed: Vercel | Backend: Supabase | Economy: Karma
-->

<div align="center">

![EduSync Banner](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=220&section=header&text=EDUSYNC&fontSize=80&fontAlignY=38&desc=Swap%20Skills.%20Earn%20Karma.%20Grow%20Together.&descAlignY=58&descAlign=50&fontColor=ffffff&animation=twinkling)

<br/>

<a href="https://openclaw-hackathon-hackindia-error4-rosy.vercel.app/">
  <img src="https://img.shields.io/badge/🌐%20Live%20Demo-edusync.vercel.app-6366f1?style=for-the-badge&labelColor=1e1b4b" />
</a>

<br/><br/>

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth%20%2B%20Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer](https://img.shields.io/badge/Framer%20Motion-v11-EF0070?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Zustand](https://img.shields.io/badge/Zustand-State%20Management-FF8C00?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-HackIndia%202026%20Submission-8B5CF6?style=for-the-badge)](https://github.com/ayushjhaa1187-spec/openclaw-hackathon-hackindia-error404)

<br/>

[🌐 Live Demo](https://openclaw-hackathon-hackindia-error4-rosy.vercel.app/) &nbsp;•&nbsp;
[📋 Design Doc](./DESIGN_DOC.md) &nbsp;•&nbsp;
[🐛 Report Bug](https://github.com/ayushjhaa1187-spec/openclaw-hackathon-hackindia-error404/issues) &nbsp;•&nbsp;
[💡 Request Feature](https://github.com/ayushjhaa1187-spec/openclaw-hackathon-hackindia-error404/issues)

</div>

---

## 📖 Table of Contents

- [What is EduSync?](#-what-is-edusync)
- [The Problem](#-the-problem)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Data Flow Diagrams](#-data-flow-diagrams)
- [Karma Economy](#-karma-economy)
- [Nexus Mode](#-nexus-mode)
- [Admin Moderation](#-admin-moderation-flow)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Navigation Logic](#-navigation-logic)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Partner Campus Network](#-partner-campus-network)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 🎯 What is EduSync?

> **EduSync** is an **inter-campus peer-to-peer skill exchange platform** powered by a **Karma economy**. It connects students across partner universities to swap skills, share verified academic resources, and build a cross-institutional knowledge network — entirely without money.

Think of it as: **Barter for Brains** — where teaching earns you the currency to learn.

```
┌──────────────────────────────────────────────────────────────────────┐
│                      EDUSYNC VALUE PROPOSITION                       │
├───────────────────────┬───────────────────────┬──────────────────────┤
│  Traditional Problem  │     EduSync Solution   │     Outcome          │
├───────────────────────┼───────────────────────┼──────────────────────┤
│ Knowledge trapped in  │ Nexus Mode: cross-     │ Any skill, any       │
│ single campus silos   │ campus skill matching  │ campus               │
├───────────────────────┼───────────────────────┼──────────────────────┤
│ Paid tutoring is      │ Karma economy — earn   │ Free skill access    │
│ inaccessible          │ by teaching others     │ for all students     │
├───────────────────────┼───────────────────────┼──────────────────────┤
│ WhatsApp groups       │ Structured swap        │ Verified, rated      │
│ don't scale           │ requests + reviews     │ mentorship           │
├───────────────────────┼───────────────────────┼──────────────────────┤
│ Resources buried in   │ Knowledge Vault with   │ Peer-verified        │
│ random drives         │ admin moderation       │ resource library     │
└───────────────────────┴───────────────────────┴──────────────────────┘
```

---

## 🔍 The Problem

Indian engineering campuses are knowledge silos. A student struggling with VLSI at one institution has no structured way to reach a peer who aced the same subject at another. Paid tutoring platforms are inaccessible to most students. WhatsApp groups do not scale. The knowledge exists — the infrastructure to surface it does not.

**EduSync is that infrastructure.**

---

## ✨ Core Features

### 🔄 Skill Swap Marketplace
- List skills you can teach with a Karma price and description
- Browse skills by campus or expand via **Nexus Mode** to all partner institutions
- 4-step swap request modal with real-time Karma balance check
- Mentors can accept or reject — Karma is held in escrow until decision

### 💰 Karma Economy
- Every new user starts with **+100 Karma** on signup
- Earn Karma by teaching sessions (+50 to +200), uploading resources (+10 to +50), or receiving 5-star reviews (+25)
- Spend Karma to request skill swaps or unlock Vault resources
- All transactions logged to an **immutable Karma ledger** via Supabase RPC

### 🌐 Nexus Mode
- Default discovery is scoped to your own campus
- Toggle Nexus Mode to search the entire partner institution network
- Cross-campus sessions run through **admin-monitored Nexus Bridge chat channels**

### 📁 Knowledge Vault
- Upload PDFs, docs, and links for peer review
- Resources require admin verification before going live
- Unlock resources with Karma — uploader earns each time someone unlocks

### 💬 Real-time Chat
- In-app messaging created automatically when a swap is accepted
- Nexus Bridge flag on cross-campus conversations for admin oversight
- Powered by **Supabase Realtime** WebSocket subscriptions

### 🛡️ Admin Moderation
- Full moderation dashboard for skills, resources, messages, and user reports
- Actions: Approve, Reject, Warn (strike logged), Ban (account suspended)
- Repeat offenders escalated automatically to ban flow

---

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer — React 18 + Vite 5"]
        LP[Landing Page]
        EX[Explore Skills]
        VT[Knowledge Vault]
        CH[Chat / Nexus Bridge]
        DB[Dashboard]
        PR[Profile & Settings]
        AP[Admin Panel]
    end

    subgraph STATE["⚙️ State & Data Layer"]
        ZS[Zustand Store]
        RQ[TanStack React Query]
        RHF[React Hook Form]
    end

    subgraph BACKEND["☁️ Supabase Backend"]
        SB[(PostgreSQL 15\nRow-Level Security)]
        AUTH[Supabase Auth\nJWT + Institutional Email]
        RT[Supabase Realtime\nWebSocket Subscriptions]
        RPC[Supabase RPC\nAtomic Karma Transactions]
        STORE[Supabase Storage\nVault File Uploads]
    end

    CLIENT -->|Query + Mutation| RQ
    RQ -->|REST / Realtime| SB
    RQ -->|Auth calls| AUTH
    CH -->|WebSocket| RT
    STATE -->|Global UI State| ZS
    RPC -->|Atomic Karma Ops| SB
    VT -->|File upload| STORE

    style CLIENT fill:#1e1b4b,stroke:#6366f1,color:#e0e7ff
    style STATE fill:#172554,stroke:#3b82f6,color:#e0e7ff
    style BACKEND fill:#052e16,stroke:#22c55e,color:#dcfce7
```

### Component Interaction Map

```mermaid
graph LR
    subgraph AUTH["🔐 Auth Flow"]
        IE[Institutional Email] --> SUP_AUTH[Supabase Auth]
        SUP_AUTH --> JWT[JWT Session]
    end

    subgraph CORE["📦 Core Modules"]
        JWT --> SKILLS[Skill Module]
        JWT --> VAULT[Vault Module]
        JWT --> CHAT[Chat Module]
        JWT --> KARMA[Karma Module]
    end

    subgraph DB["🗄️ Data Layer"]
        SKILLS --> PG[(PostgreSQL)]
        VAULT --> PG
        CHAT --> PG
        KARMA --> PG
        PG --> RT[Realtime\nSubscriptions]
        RT --> CHAT
    end

    style AUTH fill:#2d1b69,stroke:#7c3aed,color:#ede9fe
    style CORE fill:#1e3a5f,stroke:#2563eb,color:#dbeafe
    style DB fill:#3b1515,stroke:#dc2626,color:#fee2e2
```

---

## 🔄 Data Flow Diagrams

### Flow 1 — Skill Swap Request

```mermaid
sequenceDiagram
    actor Student
    participant UI as React UI
    participant SB as Supabase RPC
    participant DB as PostgreSQL
    participant CHAT as Realtime Chat

    Student->>UI: Browse skills (local or Nexus Mode)
    UI->>DB: SELECT skills WHERE campus = user_campus
    DB-->>UI: Skill listings
    Student->>UI: Click skill → 4-step swap modal
    UI->>UI: Validate Karma balance (client-side)
    Student->>UI: Confirm swap request
    UI->>SB: CALL submit_swap_request(requester, skill, karma_cost)

    activate SB
    SB->>DB: CHECK karma_balance >= cost
    SB->>DB: DEDUCT karma from requester
    SB->>DB: LOG to karma_ledger
    SB->>DB: INSERT into skill_requests
    SB-->>UI: swap_request_id
    deactivate SB

    DB-->>UI: Mentor receives notification
    alt Mentor Accepts
        UI->>SB: CALL accept_swap(request_id)
        SB->>DB: Transfer Karma to mentor
        SB->>DB: CREATE conversation (Nexus Bridge if cross-campus)
        DB-->>CHAT: Realtime subscription fires
        CHAT-->>Student: Chat created & accessible
    else Mentor Rejects
        UI->>SB: CALL reject_swap(request_id)
        SB->>DB: REFUND karma to requester
        DB-->>UI: Requester notified
    end
```

### Flow 2 — Knowledge Vault Upload & Unlock

```mermaid
sequenceDiagram
    actor Uploader
    actor Learner
    participant UI as React UI
    participant STORE as Supabase Storage
    participant DB as PostgreSQL
    participant ADMIN as Admin Dashboard

    Uploader->>UI: Upload PDF/doc to Vault
    UI->>STORE: Upload file → get public URL
    STORE-->>UI: File URL
    UI->>DB: INSERT resource (status: pending_review)

    DB-->>ADMIN: Resource appears in moderation queue
    ADMIN->>DB: Approve resource
    DB-->>UI: Resource goes live

    Learner->>UI: Browse Knowledge Vault
    DB-->>UI: Resource listings
    Learner->>UI: Click "Unlock" on resource
    UI->>DB: CALL unlock_resource(learner_id, resource_id, karma_cost)
    DB->>DB: Deduct Karma from Learner
    DB->>DB: Credit Karma to Uploader
    DB->>DB: INSERT into resource_unlocks
    DB-->>UI: Resource URL accessible to Learner
```

### Flow 3 — Platform Full Workflow

```mermaid
flowchart TD
    A([User Lands on Platform]) --> B{Has Account?}
    B -->|No| C[Sign Up with Institutional Email]
    B -->|Yes| D[Sign In]
    C --> E[Onboarding Wizard\n5-step profile setup]
    D --> F{Onboarding Complete?}
    F -->|No| E
    F -->|Yes| G([Dashboard])
    E --> G

    G --> H{User Intent}
    H -->|Learn Something| I[Explore Skills\nFilter by campus or Nexus Mode]
    H -->|Teach Something| J[List a Skill\nSet Karma cost and description]
    H -->|Share Resources| K[Upload to Vault\nPending admin verification]
    H -->|Access Resources| L[Unlock from Vault\nSpend Karma]

    I --> M[View Skill Detail\nMentor profile and reviews]
    M --> N{Karma Sufficient?}
    N -->|Yes| O[Submit Swap Request\n4-step modal]
    N -->|No| P[Earn Karma First\nTeach or upload resources]
    P --> J
    P --> K

    O --> Q[Mentor Receives Notification]
    Q --> R{Mentor Decision}
    R -->|Accept| S[Karma Deducted from Requester\nLedger entry created]
    R -->|Reject| T[Karma Refunded\nRequester notified]
    S --> U[Conversation Created in Chat\nNexus Bridge if cross-campus]
    U --> V[Skill Session Happens]
    V --> W[Requester Leaves Review\nMentor earns Karma bonus]
    W --> G

    style A fill:#6366F1,color:#fff,stroke:none
    style G fill:#6366F1,color:#fff,stroke:none
    style B fill:#F59E0B,color:#000,stroke:none
    style F fill:#F59E0B,color:#000,stroke:none
    style H fill:#F59E0B,color:#000,stroke:none
    style N fill:#F59E0B,color:#000,stroke:none
    style R fill:#F59E0B,color:#000,stroke:none
    style O fill:#10B981,color:#fff,stroke:none
    style S fill:#10B981,color:#fff,stroke:none
    style V fill:#10B981,color:#fff,stroke:none
    style W fill:#10B981,color:#fff,stroke:none
    style P fill:#EF4444,color:#fff,stroke:none
    style T fill:#EF4444,color:#fff,stroke:none
    style U fill:#8B5CF6,color:#fff,stroke:none
```

---

## 💰 Karma Economy

The platform runs entirely on Karma — a non-monetary internal currency. No subscriptions, no payments, no barriers.

```mermaid
flowchart LR
    A([New User\n+100 Karma on signup]) --> B{Action}
    B -->|Teaches a skill session| C[+50 to +200 Karma\nbased on session length]
    B -->|Uploads a resource| D[+10 to +50 Karma\nwhen others unlock it]
    B -->|Receives a 5-star review| E[+25 Karma bonus]
    B -->|Requests a skill swap| F[-Karma cost of skill\ndeducted on submission]
    B -->|Unlocks a resource| G[-Karma cost of resource]
    C --> H([Karma Balance\nReal-time via Supabase])
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I{Balance Check}
    I -->|Balance > 0| B
    I -->|Balance = 0| J[Must earn before spending\nTeach or upload to continue]
    J --> B

    style A fill:#6366F1,color:#fff,stroke:none
    style H fill:#6366F1,color:#fff,stroke:none
    style B fill:#F59E0B,color:#000,stroke:none
    style I fill:#F59E0B,color:#000,stroke:none
    style C fill:#10B981,color:#fff,stroke:none
    style D fill:#10B981,color:#fff,stroke:none
    style E fill:#10B981,color:#fff,stroke:none
    style F fill:#EF4444,color:#fff,stroke:none
    style G fill:#EF4444,color:#fff,stroke:none
    style J fill:#EF4444,color:#fff,stroke:none
```

---

## 🌐 Nexus Mode

Local campus discovery is the default. Nexus Mode expands the pool to all partner institutions — enabling cross-campus skill matching with admin-monitored communication channels.

```mermaid
flowchart TD
    A([Student at Campus A]) --> B{Search Skill}
    B -->|Found locally| C[Local Skill Match]
    B -->|Not found locally| D[Toggle Nexus Mode ON]
    D --> E[Cross-campus Skill Pool\nAll partner institutions]
    E --> F[Nexus Skill Match\nDifferent campus]
    C --> G[Standard Swap Flow]
    F --> H[Nexus Swap Flow]
    H --> I[Nexus Bridge Chat Created\nAdmin-monitored channel]
    I --> J[Session Happens Remotely]
    G --> K([Karma Exchange Logged])
    J --> K

    style A fill:#6366F1,color:#fff,stroke:none
    style K fill:#6366F1,color:#fff,stroke:none
    style B fill:#F59E0B,color:#000,stroke:none
    style D fill:#8B5CF6,color:#fff,stroke:none
    style E fill:#8B5CF6,color:#fff,stroke:none
    style F fill:#8B5CF6,color:#fff,stroke:none
    style H fill:#8B5CF6,color:#fff,stroke:none
    style I fill:#8B5CF6,color:#fff,stroke:none
    style C fill:#10B981,color:#fff,stroke:none
    style G fill:#10B981,color:#fff,stroke:none
    style J fill:#10B981,color:#fff,stroke:none
```

---

## 🛡️ Admin Moderation Flow

```mermaid
flowchart TD
    A([Content Submitted\nSkill / Resource / Message]) --> B{Auto-check}
    B -->|Passes| C[Published Immediately\nfor skills]
    B -->|Flagged| D[Enters Moderation Queue]
    C --> E{User Reports?}
    E -->|Yes| D
    E -->|No| F([Live on Platform])
    D --> G[Admin Reviews in Dashboard]
    G --> H{Decision}
    H -->|Approve| F
    H -->|Reject| I[Content Removed\nUploader Notified]
    H -->|Warn| J[Warning Issued to User\nStrike logged]
    H -->|Ban| K[Account Suspended\nAll content removed]
    J --> L{Repeat Offence?}
    L -->|Yes| K
    L -->|No| F

    style A fill:#6366F1,color:#fff,stroke:none
    style F fill:#10B981,color:#fff,stroke:none
    style B fill:#F59E0B,color:#000,stroke:none
    style H fill:#F59E0B,color:#000,stroke:none
    style L fill:#F59E0B,color:#000,stroke:none
    style D fill:#8B5CF6,color:#fff,stroke:none
    style G fill:#8B5CF6,color:#fff,stroke:none
    style I fill:#EF4444,color:#fff,stroke:none
    style J fill:#EF4444,color:#fff,stroke:none
    style K fill:#EF4444,color:#fff,stroke:none
```

---

## 🧩 Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | 18.x | Component-based UI with hooks and concurrent rendering |
| **Vite** | 5.x | Lightning-fast HMR build tooling |
| **Tailwind CSS** | v4 | Utility-first styling with custom design tokens |
| **Framer Motion** | v11 | Page transitions, scroll animations, micro-interactions |
| **Zustand** | Latest | Lightweight global state management |
| **TanStack React Query** | v5 | Server state, caching, and background refetch |
| **React Hook Form** | Latest | Performant form handling with validation |
| **Lucide React** | Latest | Consistent SVG icon library |

### Backend & Infrastructure

| Technology | Role |
|---|---|
| **Supabase (PostgreSQL 15)** | Primary database with Row-Level Security policies |
| **Supabase Auth** | JWT session management + institutional email sign-in |
| **Supabase Realtime** | WebSocket subscriptions for chat and notifications |
| **Supabase Storage** | File upload for Vault resources |
| **Supabase RPC Functions** | Atomic Karma transactions — no client-side race conditions |

### Notifications & UX

| Library | Purpose |
|---|---|
| **Sonner** | Toast notifications for real-time feedback |
| **Vercel** | Zero-config production deployment with edge network |

---

## 🗄️ Database Schema

### Entity Relationship Overview

```mermaid
erDiagram
    CAMPUSES {
        uuid id PK
        text name
        text short_code
        timestamp created_at
    }

    PROFILES {
        uuid id PK
        uuid campus_id FK
        text full_name
        text avatar_url
        text role
        int karma_balance
        boolean onboarding_complete
        timestamp created_at
    }

    SKILLS {
        uuid id PK
        uuid user_id FK
        text title
        text description
        int karma_cost
        text status
        timestamp created_at
    }

    SKILL_REQUESTS {
        uuid id PK
        uuid requester_id FK
        uuid skill_id FK
        int karma_escrowed
        text status
        timestamp created_at
    }

    SKILL_REVIEWS {
        uuid id PK
        uuid request_id FK
        uuid reviewer_id FK
        int rating
        text comment
        timestamp created_at
    }

    RESOURCES {
        uuid id PK
        uuid uploader_id FK
        text title
        text file_url
        int karma_cost
        text status
        timestamp created_at
    }

    KARMA_LEDGER {
        uuid id PK
        uuid user_id FK
        int delta
        text action
        uuid reference_id
        timestamp created_at
    }

    CONVERSATIONS {
        uuid id PK
        boolean is_nexus_bridge
        timestamp created_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        text type
        text payload
        boolean is_read
        timestamp created_at
    }

    REPORTS {
        uuid id PK
        uuid reporter_id FK
        text target_type
        uuid target_id
        text reason
        text status
        timestamp created_at
    }

    PROFILES ||--o{ SKILLS : "lists"
    PROFILES ||--o{ SKILL_REQUESTS : "makes"
    SKILLS ||--o{ SKILL_REQUESTS : "receives"
    SKILL_REQUESTS ||--o| SKILL_REVIEWS : "earns"
    PROFILES ||--o{ RESOURCES : "uploads"
    PROFILES ||--o{ KARMA_LEDGER : "logs"
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    PROFILES ||--o{ NOTIFICATIONS : "receives"
    CAMPUSES ||--o{ PROFILES : "has"
```

### Key SQL: Atomic Karma RPC

```sql
-- Atomic karma deduction on swap request submission
CREATE OR REPLACE FUNCTION submit_swap_request(
  p_requester_id UUID,
  p_skill_id UUID,
  p_karma_cost INT
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- Check balance
  IF (SELECT karma_balance FROM profiles WHERE id = p_requester_id) < p_karma_cost THEN
    RAISE EXCEPTION 'Insufficient Karma balance';
  END IF;

  -- Deduct karma
  UPDATE profiles
  SET karma_balance = karma_balance - p_karma_cost
  WHERE id = p_requester_id;

  -- Log to ledger
  INSERT INTO karma_ledger (user_id, delta, action, reference_id)
  VALUES (p_requester_id, -p_karma_cost, 'swap_request', p_skill_id);

  -- Create request
  INSERT INTO skill_requests (requester_id, skill_id, karma_escrowed)
  VALUES (p_requester_id, p_skill_id, p_karma_cost)
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Key SQL: Row-Level Security

```sql
-- Users can only update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Skill requests: only requester or mentor can view
CREATE POLICY "Swap request visibility"
  ON skill_requests FOR SELECT
  USING (
    auth.uid() = requester_id OR
    auth.uid() = (SELECT user_id FROM skills WHERE id = skill_id)
  );

-- Messages: only conversation participants
CREATE POLICY "Message visibility"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
    )
  );
```

---

## 📡 API Reference

> All data operations go through Supabase client SDK. The following documents the logical API surface of the platform.

### Skills

| Method | Operation | Auth | Description |
|---|---|---|---|
| `SELECT` | `skills` | Public | List all approved skills (filterable by campus / Nexus) |
| `INSERT` | `skills` | 🔐 Required | Create a new skill listing |
| `UPDATE` | `skills` | 🔐 Owner | Update title, description, or Karma cost |
| `DELETE` | `skills` | 🔐 Owner / Admin | Remove skill listing |

### Skill Requests

| Method | Operation | Auth | Description |
|---|---|---|---|
| `RPC` | `submit_swap_request` | 🔐 Required | Atomic swap submission — deducts Karma |
| `RPC` | `accept_swap` | 🔐 Mentor | Accept swap — transfers Karma, creates conversation |
| `RPC` | `reject_swap` | 🔐 Mentor | Reject swap — refunds Karma to requester |

### Knowledge Vault

| Method | Operation | Auth | Description |
|---|---|---|---|
| `SELECT` | `resources` | Public | Browse approved resources |
| `INSERT` | `resources` | 🔐 Required | Upload a new resource (enters moderation) |
| `RPC` | `unlock_resource` | 🔐 Required | Spend Karma to unlock a resource |

### Admin

| Method | Operation | Auth | Description |
|---|---|---|---|
| `UPDATE` | `resources.status` | 🔐 Admin | Approve or reject a Vault resource |
| `UPDATE` | `profiles.role` | 🔐 Admin | Warn or ban a user account |
| `SELECT` | `reports` | 🔐 Admin | View moderation queue |

### Example: Submit Swap Request

```ts
// Atomic swap via Supabase RPC
const { data, error } = await supabase.rpc('submit_swap_request', {
  p_requester_id: user.id,
  p_skill_id: skill.id,
  p_karma_cost: skill.karma_cost
});

if (error) {
  // Handles "Insufficient Karma balance" gracefully
  toast.error(error.message);
} else {
  toast.success('Swap request submitted! Waiting for mentor response.');
}
```

---

## 📁 Project Structure

```
src/
├── pages/           — Landing, Login, Onboarding, Dashboard, Explore,
│                      SkillDetail, Vault, Chat, Admin, Profile, Settings
├── components/
│   ├── ui/          — Button, Card, Modal, Badge, Skeleton, EmptyState
│   ├── layout/      — RootLayout, Navbar, MobileBottomNav, ProtectedRoute
│   └── shared/      — SkillCard, ResourceCard, SwapRequestModal, KarmaChip
├── stores/          — Zustand: authStore, uiStore, onboardingStore
├── hooks/           — useAuth, useSkills, useKarma, useCountUp, useChat
├── services/        — Supabase query functions per domain
├── data/            — mockData.js (dev/demo, fictional campus names only)
└── lib/             — supabase.js, queryClient.js
```

---

## 🗺️ Navigation Logic

```
/ (Landing)
    └── /login
          ├── New user  → /onboarding (5-step wizard, runs once)
          │                    └── /dashboard
          └── Returning → /dashboard
                              ├── /explore
                              │     └── /explore/skill/:id
                              ├── /vault
                              ├── /chat
                              │     └── /chat/:conversationId
                              ├── /profile
                              │     └── /profile/:userId
                              ├── /notifications
                              ├── /settings
                              └── /admin  (role: admin only)
```

Route access is enforced in `ProtectedRoute.jsx`. Users without a completed onboarding profile are redirected to `/onboarding` regardless of the URL they attempt to access. Admin routes reject non-admin roles at the router level, not via CSS visibility.

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ayushjhaa1187-spec/openclaw-hackathon-hackindia-error404.git
cd openclaw-hackathon-hackindia-error404

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# → Fill in your Supabase credentials (see below)

# 4. Run the SQL schema
# → Open DESIGN_DOC.md, copy the full SQL block,
#   and run it in your Supabase SQL Editor

# 5. Start the dev server
npm run dev
# → Open http://localhost:5173
```

### 🔑 Demo Credentials (For Judges)

| Field | Value |
|---|---|
| **Email** | `judge@edusync.edu` |
| **Password** | `edusync2026` |
| **Role** | Full access (Student + Admin view) |

---

## 🔐 Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: App config
VITE_APP_NAME=EduSync
VITE_APP_URL=https://openclaw-hackathon-hackindia-error4-rosy.vercel.app
```

> ⚠️ Never commit `.env.local` to version control. The `.env.example` file serves as a safe reference template.

---

## 🌍 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel Dashboard:
# Settings → Environment Variables → Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
```

### Supabase Production Checklist

```sql
-- 1. Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_ledger ENABLE ROW LEVEL SECURITY;

-- 2. Create production indexes
CREATE INDEX idx_skills_campus ON skills(campus_id);
CREATE INDEX idx_skills_created ON skills(created_at DESC);
CREATE INDEX idx_karma_ledger_user ON karma_ledger(user_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);

-- 3. Enable Realtime for chat tables
-- In Supabase Dashboard → Database → Replication → Add: messages, notifications
```

---

## 🏫 Partner Campus Network

> All campus names in this application are **fictional** and used for demonstration purposes only. No real institution is represented or implied.

| Short Code | Institution Name |
|---|---|
| NIT-N | Northvale Institute of Technology |
| DEU | Deccan Engineering University |
| VCST | Vistara College of Science & Tech |
| ITU | Indravali Technical University |
| SIAS | Sahyadri Institute of Advanced Studies |

---

## 🤝 Contributing

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/openclaw-hackathon-hackindia-error404.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make changes + lint
npm run lint

# 4. Commit with conventional commits
git commit -m "feat: add karma history chart to profile"

# 5. Push and open a PR
git push origin feature/your-feature-name
```

### Commit Convention

| Prefix | Usage |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code restructure |
| `style:` | Formatting, no logic change |
| `chore:` | Build / tooling updates |

---

## 👥 Team

<div align="center">

| Member | Role |
|---|---|
| **Ayush Kumar Jha** | Full-Stack Lead · Supabase Architecture · Karma Engine · UI/UX |

Built with ❤️ for **HackIndia 2026** · Team Error404

</div>

---

## 📄 License

```
MIT License — Copyright (c) 2026 Ayush Kumar Jha · Team Error404
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, and distribute it freely.
```

---

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling)

**EduSync** — *Because every skill you have is a skill someone else needs.*

⭐ Star this repo if it helped you &nbsp;•&nbsp; 🍴 Fork it &nbsp;•&nbsp; 🐛 [Report Issues](https://github.com/ayushjhaa1187-spec/openclaw-hackathon-hackindia-error404/issues)

</div>
