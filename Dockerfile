FROM oven/bun:1.0.30

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
COPY bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV DB_FILE_NAME=db.sqlite

# Start the bot
CMD ["bun", "run", "start"]
