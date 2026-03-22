# ============================================================================
# EDUSYNC ADMIN PRODUCTION DOCKERFILE
# Identical structure to web app (Next.js)
# Final size target: ~200MB
# ============================================================================

# Stage 1: Dependencies
FROM node:25-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

# ============================================================================
# Stage 2: Builder
FROM node:25-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY package.json package-lock.json ./
COPY apps/admin ./apps/admin
COPY packages/shared ./packages/shared

RUN npm --workspace=@edusync/admin run build
RUN rm -rf node_modules && npm install --production=true

# ============================================================================
# Stage 3: Runtime
FROM node:25-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN apk add --no-cache dumb-init curl

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder --chown=nodejs:nodejs /app/apps/admin/package.json ./apps/admin/
COPY --from=builder --chown=nodejs:nodejs /app/apps/admin/public ./apps/admin/public
COPY --chown=nodejs:nodejs package.json ./

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3002/ || exit 1

USER nodejs

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

CMD ["npm", "--workspace=@edusync/admin", "start"]
