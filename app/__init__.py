from flask import Flask

# Initialize Flask app
app = Flask(__name__)

# Import routes after app creation
from app import routes
