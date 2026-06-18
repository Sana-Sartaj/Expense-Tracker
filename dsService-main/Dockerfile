FROM --platform=linux/amd64 python:3.11.4

WORKDIR /app

# Copy requirements first so this layer is cached until requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

# src/ must be on the module search path so gunicorn can import the 'app' package.
ENV PYTHONPATH=/app/src

EXPOSE 8010

# 2 workers: adequate for a low-throughput LLM extraction service.
# 120s timeout: accommodates Mistral API latency under load.
CMD ["gunicorn", "--bind", "0.0.0.0:8010", "--workers", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "app:app"]