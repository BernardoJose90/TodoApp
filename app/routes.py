from flask import Blueprint, request, jsonify, render_template
from app import database

# Create Blueprint.
bp = Blueprint('main', __name__)

@bp.route('/debug/db-status')
def debug_db_status():
    try:
        from app import database
        from app.database import get_session
        
        # Test database connection
        with get_session() as session:
            result = session.execute("SELECT 1").fetchone()
            
        return jsonify({
            "database_connection": "SUCCESS",
            "test_query": str(result),
            "environment": os.getenv("ENV", "Not set")
        })
    except Exception as e:
        return jsonify({
            "database_connection": "FAILED",
            "error": str(e),
            "environment": os.getenv("ENV", "Not set")
        }), 500

@bp.route('/')
def index():
    try:
        items = database.fetch_todo()
        logger.info(f"DEBUG: Rendering template with {len(items)} items")
        logger.info(f"DEBUG: Items data: {items}")
        return render_template('index.html', items=items)
    except Exception as e:
        logger.error(f"Error in index route: {e}")
        return render_template('index.html', items=[])

@bp.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = database.fetch_todo()
        return jsonify(tasks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/tasks', methods=['POST'])
def add_task():
    try:
        data = request.get_json()
        task_id = database.insert_new_task(
            description=data.get('description'),  # CHANGED: 'task' to 'description'
            status=data.get('status', 'Todo'),
            priority=data.get('priority', 'Medium'),
            due_date=data.get('due_date')
        )
        if task_id:
            return jsonify({"id": task_id}), 201
        else:
            return jsonify({"error": "Failed to create task"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        success = database.update_task(
            task_id=task_id,
            description=data.get('description'),  # CHANGED: 'task' to 'description'
            status=data.get('status'),
            priority=data.get('priority'),
            due_date=data.get('due_date')
        )
        if success:
            return jsonify({"message": "Task updated"})
        else:
            return jsonify({"error": "Task not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        success = database.remove_task_by_id(task_id)
        if success:
            return jsonify({"message": "Task deleted"})
        else:
            return jsonify({"error": "Task not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/tasks/reorder', methods=['POST'])
def reorder_tasks():
    try:
        data = request.get_json()
        success = database.reorder_tasks(data.get('tasks', []))
        if success:
            return jsonify({"message": "Tasks reordered"})
        else:
            return jsonify({"error": "Failed to reorder tasks"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500