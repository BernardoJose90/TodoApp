import os
from flask import Flask
from app import database

def create_app():
    app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), 'app', 'templates'))
    
    # Initialize database
    try:
        database.create_tables()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")
    
    # Register routes
    from app.routes import bp
    app.register_blueprint(bp)
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
