import os
from flask import Flask
from app import database
from app.routes import bp

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app/templates")
app = Flask(__name__, template_folder=template_dir)

# Initialize databases
try:
    database.create_tables()
    print("Database initialized successfully")
except Exception as e:
    print(f"Database init warning: {e}")

# Register routes
app.register_blueprint(bp)

if __name__ == '__main__':
    # CRITICAL: Set debug=False for production/container environments
    app.run(host='0.0.0.0', port=5000, debug=False)