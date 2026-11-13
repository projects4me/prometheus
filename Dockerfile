# Projects4Me Prometheus: dev and test image (ember serve, ember test).
# Node 22 on Debian bookworm, with Chromium for testem's headless runs.
FROM node:22-bookworm

# testem's "Chrome" launcher looks for `google-chrome` on PATH, hence the link to Debian's Chromium.
RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium fonts-liberation \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/chromium /usr/local/bin/google-chrome

RUN npm install -g ember-cli@6.12.0 \
    && npm cache clean --force

ENV PORT=4200
EXPOSE 4200 7020 7357

WORKDIR /prometheus

# Install dependencies first so the layer is reused while package.json is unchanged.
COPY package.json /prometheus/
RUN npm install --no-audit --no-fund \
    && npm cache clean --force

COPY . /prometheus

CMD ["ember", "serve"]
