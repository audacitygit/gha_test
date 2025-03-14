# --- Stage 1: Build ---
FROM node:23-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install all dependencies (not just production)
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the app (assumes a frontend build process)
RUN npm run build


# --- Stage 2: Run ---
FROM node:23-alpine

# Set the working directory
WORKDIR /app

# Copy only the built files from the build stage
COPY --from=build /app/dist ./dist

# Copy server.js separately since it's not inside dist
COPY --from=build /app/server.js ./server.js

# Copy package.json for potential runtime dependency resolution
COPY package*.json ./

# Install dependencies again (in case some are runtime-only)
RUN npm install

# Expose the port your app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "server.js"]
