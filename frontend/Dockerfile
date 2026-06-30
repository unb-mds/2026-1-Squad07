FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Test stage
FROM base AS test

CMD ["npm", "run", "test:coverage"]

# Production stage
FROM base AS production

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
