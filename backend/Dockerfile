FROM python:3.10-slim

WORKDIR /backend

COPY backend/requirements.txt /backend/requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /backend/requirements.txt \
    && pip install -q -U google-genai \
    && rm -rf /root/.cache/pip

COPY backend /backend

EXPOSE 8002

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]