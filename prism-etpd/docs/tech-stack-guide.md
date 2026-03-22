# Recommended Tech Stack for PRISM

While PRISM is entirely technology-agnostic (it works equally well for Python, Go, Node, or Rust), identifying a unified tech stack accelerates the 10-phase methodology.

## Frontend Architectures

**1. Next.js 15 + React 19 (The Standard)**
- **Why:** Built-in Server-Side Rendering (SSR), API routes, and static generation.
- **Styling:** Tailwind CSS (utility-first) or CSS Modules.
- **State:** Zustand or React Context for global state, React Query for server state.
- **Best for:** SEO-critical platforms, SaaS applications, dashboards.

**2. Vite + React / Vue 3 (Single Page Applications)**
- **Why:** Lightning-fast HMR and build times.
- **Best for:** Heavily interactive, client-side heavy dashboards where SEO does not matter.

## Backend Platforms

**1. Node.js with Express / NestJS**
- **Why:** Ability to share TypeScript types between the frontend and backend.
- **Validation:** Zod for immutable, runtime-safe request validation.

**2. Python with FastAPI**
- **Why:** Extreme speed for development, incredible documentation autogeneration via OpenAPI.
- **Best for:** AI-integrated workflows or data-heavy platforms.

## Database Technologies

**1. PostgreSQL (Relational)**
- **Why:** ACID compliance, complex relational queries, and strict schemas.
- **ORM:** Prisma or Drizzle ORM (TypeScript), SQLAlchemy (Python).

**2. MongoDB (Document / NoSQL)**
- **Why:** Schema flexibility, faster time to market for heterogeneous data structures.
- **ODM:** Mongoose.

## Infrastructure & DevOps

**1. AWS ECS Fargate + RDS**
- **Why:** Scalable, serverless container execution without instance management.
- **IaC:** Terraform or AWS CloudFormation (scripted via AWS CLI).

**2. Vercel / Netlify**
- **Why:** Effortless frontend and serverless function deployment.
