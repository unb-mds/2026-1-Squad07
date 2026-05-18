FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

FROM base AS final

WORKDIR /app

RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup --home /home/appuser appuser \
    && mkdir -p /home/appuser/.cache \
    && chown -R appuser:appgroup /home/appuser

ENV HOME=/home/appuser

COPY --chown=appuser:appgroup . .

RUN prisma generate --schema=prisma/schema.prisma \
    && chown -R appuser:appgroup /home/appuser /app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host","0.0.0.0", "--port", "8000"]