# Base image
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
