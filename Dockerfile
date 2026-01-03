FROM node:24-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

ENV NODE_ENV=development
EXPOSE 3000

# Use Node's built-in watch mode for dev live-reload
CMD ["npm", "run", "dev"]
