FROM python:3.11-slim

# osnovne varijable okruženja
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# instalacija sistemskih zavisnosti (za psycopg2, bcrypt, itd.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# kopiraj kod
COPY . .

# expose port
EXPOSE 5000

# koristi Gunicorn za pokretanje Flask factory-ja
CMD ["gunicorn", "-w", "3", "-b", "0.0.0.0:5000", "app:create_app()"]