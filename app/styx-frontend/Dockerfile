FROM ubuntu:20.04

# Install Node.js
RUN apt-get update
RUN apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install --yes nodejs
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install --yes build-essential yarn

ADD ./client /app/client
ADD ./shared /app/shared
# COPY .eslintrc.js /app/client
COPY .eslintrc.js /app/shared
COPY .prettierrc.js /app/client
COPY .prettierrc.js /app/shared

WORKDIR /app/shared
RUN yarn

WORKDIR /app/client
RUN yarn

# Expose server
EXPOSE 8080

