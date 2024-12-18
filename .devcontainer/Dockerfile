FROM node:18-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    sudo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Install global npm packages
RUN npm install -g typescript@latest ts-node@latest

# Verify installations
RUN tsc --version && \
    ts-node --version

# Keep root as the user since this is just for development
USER root
