FROM python:3-alpine

EXPOSE 8080

ENV DEPLOYMENT_ENV TEST
ENV REDIS_HOST none
ENV REDIS_PORT 1234
ENV REDIS_PASSWORD none

# Create app directory
WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
