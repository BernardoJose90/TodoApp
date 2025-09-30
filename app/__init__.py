from flask import Flask
import sqlalchemy
from app.secrets import get_secret

app = Flask(__name__)

# Pulls secrets from AWS Secrets Manager via secrets.py
secrets = get_secret()
username = secrets['username']
password = secrets['password']
host = secrets['host']
dbname = secrets['dbname']

# Connects to MySQL database using SQLAlchemy
db = sqlalchemy.create_engine(
    sqlalchemy.engine.url.URL(
        drivername="mysql+pymysql",
        username=username,
        password=password,
        database=dbname,
        host=host
    )
)

from app import routes
