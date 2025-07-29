# # 1. Installer stage for production dependencies
# FROM node:20-alpine AS deps
# RUN apk add --no-cache libc6-compat
# WORKDIR /app
# RUN corepack enable
# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install --prod --frozen-lockfile

# # 2. Builder stage for building the application
# FROM node:20-alpine AS builder
# WORKDIR /app
# RUN corepack enable
# COPY . .
# RUN pnpm install --frozen-lockfile
# RUN pnpm build

# # 3. Runner stage for production
# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV production

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json

# USER nextjs

# EXPOSE 3000

# CMD ["pnpm", "start"]


FROM node:20-alpine AS build
 
WORKDIR /src
 
ARG NEXT_PUBLIC_API_URL
 
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
 
RUN corepack enable

COPY package.json pnpm-lock.yaml* ./
 
RUN pnpm install --frozen-lockfile
 
COPY . .
 
RUN pnpm build
 
FROM build AS production
 
COPY --from=build /src/.next ./.next
 
COPY --from=build /src/node_modules ./node_modules
 
COPY --from=build /src/package.json ./package.json
 
COPY --from=build /src/public ./public
 
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
 
CMD [ "pnpm","start" ]