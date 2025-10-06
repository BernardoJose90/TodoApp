from flask import Flask
from app import database

def create_app():
    app = Flask(__name__)
    
    # Initialize database (this won't crash the app anymore)
    try:
        database.create_tables()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")
        # App continues to run even if DB fails
    
    # Import and register routes
    from app.routes import bp
    app.register_blueprint(bp)
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    