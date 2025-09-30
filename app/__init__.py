from flask import Flask
import os
import sqlalchemy

def init_connect_engine():
    pool = sqlalchemy.create_engine(
        sqlalchemy.engine.url.URL(
            drivername="mysql+pymysql",
            username=os.environ.get("MYSQL_USER"),
            password=os.environ.get("MYSQL_PASSWORD"),
            database=os.environ.get("MYSQL_DB"),
            host=os.environ.get("MYSQL_HOST")
        )
    )
    return pool

app = Flask(__name__)
db = init_connect_engine()

from app import routes
