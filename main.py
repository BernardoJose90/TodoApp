import os
from flask import Flask, jsonify, send_from_directory, render_template
import logging
# Minimal logging for errors
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.join(base_dir, "app")
template_dir = os.path.join(app_dir, "templates")
static_dir = os.path.join(app_dir, "static")

# Flask app
app = Flask(
    __name__,
    template_folder=template_dir,
    static_folder=static_dir,
    static_url_path='/static'
)

# Static files route (fallback, optional)
@app.route('/static/<path:subpath>')
def serve_static(subpath):
    try:
        return send_from_directory(static_dir, subpath)
    except Exception as e:
        logger.error(f"Error serving static file {subpath}: {e}")
        return f"Static file not found: {subpath}", 404

# Health check endpoint
@app.route('/health')
def health():
    try:
        from app import database
        tasks = database.fetch_todo()

        return jsonify({
            "status": "healthy",
            "database_tasks": len(tasks),
            "static_files": {
                "modal.js": os.path.exists(os.path.join(static_dir, 'script/modal.js')),
                "custom.css": os.path.exists(os.path.join(static_dir, 'styles/custom.css'))
            },
            "environment": os.getenv("ENV", "Not set")
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "degraded", "error": str(e)}), 500

# Root endpoint
@app.route('/')
def index():
    try:
        
        from app import database

        items = database.fetch_todo()

        return render_template('index.html', items=items)
    except Exception as e:
        logger.error(f"Error in index route: {e}", exc_info=True)
        return f"<h1>Error loading page: {e}</h1>"

# Initialize database
try:
    from app import database
    database.create_tables()

except Exception as e:
    logger.error(f"Database initialization failed: {e}", exc_info=True)

# Register blueprint routes
try:
    from app.routes import bp
    app.register_blueprint(bp)

except Exception as e:
    logger.error(f"Routes registration failed: {e}", exc_info=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
