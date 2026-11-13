FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends bash ca-certificates libgomp1 python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ai_service/requirements.txt ./ai_service/requirements.txt
RUN python3 -m venv /opt/ai-venv \
    && /opt/ai-venv/bin/pip install --no-cache-dir -r ai_service/requirements.txt

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV AI_SERVICE_URL=http://127.0.0.1:8001

EXPOSE 5000

CMD ["bash", "/app/start.sh"]
