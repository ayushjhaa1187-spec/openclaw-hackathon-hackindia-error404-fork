# ============================================================================
# EDUSYNC API PRODUCTION DOCKERFILE
# Multi-stage build for optimal image size and security
# Final size target: ~180MB
# ============================================================================

# Stage 1: Builder (compile TypeScript, install dependencies)
FROM node:25-alpine AS builder

WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++ gcc

# Copy monorepo lock files
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (including devDependencies)
RUN npm install

# Copy all source code
COPY packages/api ./packages/api
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared

# Compile TypeScript to JavaScript
RUN npm --workspace=@edusync/api run build

# Prune dev dependencies (keep only production)
RUN npm prune --production=true

# ============================================================================
# Stage 2: Runtime (final image with only what's needed)
FROM node:25-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Install runtime dependencies (dumb-init for proper signal handling)
RUN apk add --no-cache dumb-init curl

# Copy only compiled code and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages/api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/api/package.json ./package.json

# Environment configuration
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Port that API listens on
EXPOSE 3001

# Health check (every 30s, timeout 10s, start wait 40s)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Run as non-root user
USER nodejs

# Use dumb-init to handle signals (docker stop → SIGTERM)
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Start server
CMD ["node", "dist/server.js"]
