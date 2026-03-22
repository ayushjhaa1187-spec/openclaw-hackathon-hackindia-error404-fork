# ============================================================================
# EDUSYNC WEB (STUDENT PORTAL) PRODUCTION DOCKERFILE
# Multi-stage build optimized for Next.js
# Final size target: ~200MB
# ============================================================================

# Stage 1: Dependencies installer
FROM node:25-alpine AS deps

WORKDIR /app

# Copy package files (monorepo root and specific packages)
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (npm since monorepo uses npm)
RUN npm install

# ============================================================================
# Stage 2: Builder (Next.js build)
FROM node:25-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build Next.js app (generates .next directory)
RUN npm --workspace=@edusync/web run build

# Remove dev dependencies (keep only production)
RUN rm -rf node_modules && npm install --production=true

# ============================================================================
# Stage 3: Runtime
FROM node:25-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Install runtime tools
RUN apk add --no-cache dumb-init curl

# Copy compiled Next.js app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/package.json ./apps/web/
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/public ./apps/web/public
COPY --chown=nodejs:nodejs package.json ./

# Next.js configuration
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

USER nodejs

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

CMD ["npm", "--workspace=@edusync/web", "start"]
