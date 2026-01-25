# Use the official Playwright image which has all required dependencies
FROM mcr.microsoft.com/playwright:v1.58.0-noble
RUN npm install -g npm@11.8.0

WORKDIR /app

COPY package.json yarn.lock* ./

# Install dependencies (npm will use package-lock.json if present)
RUN yarn install

# Copy the rest of your project (including tests) into the container
COPY . .

# Default command: run your Playwright tests
CMD ["npx", "playwright", "test"]