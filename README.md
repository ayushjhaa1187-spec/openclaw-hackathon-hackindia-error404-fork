# EduSync

**Inter-campus peer-to-peer skill exchange platform powered by a Karma economy.**

EduSync connects students across partner universities to swap skills, share verified academic resources, and build a knowledge network that operates without money — using Karma as the medium of exchange.

> HackIndia 2026 · Team Error404

---

## The Problem

Indian engineering campuses are knowledge silos. A student struggling with VLSI at one institution has no structured way to reach a peer who aced the same subject at another. Paid tutoring platforms are inaccessible to most students. WhatsApp groups do not scale. The knowledge exists — the infrastructure to surface it does not.

EduSync is that infrastructure.

---

## Live Demo

**Deployed:** [edusync.vercel.app](https://openclaw-hackathon-hackindia-error4-six.vercel.app)  
**Design Doc:** [DESIGN_DOC.md](./DESIGN_DOC.md)

---

## Platform Workflow

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
    style C fill:#10B981,color:#fff,stroke:none
    style E fill:#10B981,color:#fff,stroke:none
    style O fill:#10B981,color:#fff,stroke:none
    style S fill:#10B981,color:#fff,stroke:none
    style V fill:#10B981,color:#fff,stroke:none
    style W fill:#10B981,color:#fff,stroke:none
    style P fill:#EF4444,color:#fff,stroke:none
    style T fill:#EF4444,color:#fff,stroke:none
    style U fill:#8B5CF6,color:#fff,stroke:none
```

---

## Karma Economy

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

## Nexus Mode

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

## Admin Moderation Flow

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

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion v11 |
| State | Zustand |
| Data Fetching | TanStack React Query v5 |
| Backend / Auth | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Forms | React Hook Form |
| Notifications | Sonner |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Database Schema

```
campuses          — partner institution registry
profiles          — extends auth.users with campus, role, karma_balance
skills            — skill listings created by mentors
skill_requests    — swap requests between students
skill_reviews     — post-session ratings and comments
resources         — uploaded PDFs, docs, links in the Knowledge Vault
resource_unlocks  — tracks which user unlocked which resource
karma_ledger      — full immutable transaction log of all karma movements
conversations     — chat threads (supports Nexus Bridge flag)
messages          — real-time messages within conversations
notifications     — in-app notification feed per user
reports           — content and user reports for moderation queue
```

All tables have Row Level Security (RLS) enabled. Karma transactions are atomic via Supabase RPC functions — no client-side race conditions.

---

## Project Structure

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

## Navigation Logic

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

## Local Setup

```bash
git clone https://github.com/ayushjhaa1187-spec/openclaw-hackathon-hackindia-error404.git
cd openclaw-hackathon-hackindia-error404
npm install
```

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

Run the SQL schema from `DESIGN_DOC.md` in your Supabase SQL editor before first use.

---

## Partner Campus Network

All campus names in this application are fictional and used for demonstration purposes only. No real institution is represented or implied.

| Short Code | Institution Name |
|---|---|
| NIT-N | Northvale Institute of Technology |
| DEU | Deccan Engineering University |
| VCST | Vistara College of Science & Tech |
| ITU | Indravali Technical University |
| SIAS | Sahyadri Institute of Advanced Studies |

---

## License

MIT — see [LICENSE](./LICENSE)

---

*HackIndia 2026 Submission · Team Error404*
