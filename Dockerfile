FROM python:2.7-jessie

RUN adduser focus --home /usr/src/focus

WORKDIR /usr/src/focus

COPY requirements.txt requirements.txt

RUN pip install  --no-cache-dir -r requirements.txt

COPY app app

RUN chown -R focus:focus ./
USER focus

EXPOSE 8080

WORKDIR app

CMD [ "python", "./app.py" ]

