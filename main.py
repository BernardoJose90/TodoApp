from flask import Flask
from app import database
from app.routes import bp

app = Flask(__name__, template_folder="app/templates")

# Initialize database
try:
    database.create_tables()
    print("Database initialized successfully")
except Exception as e:
    print(f"Database init warning: {e}")

# Register routes
app.register_blueprint(bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
