from flask import Blueprint, request, jsonify, render_template
from app import database

# Create Blueprint.
bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/health')
def health():
    return jsonify({"status": "healthy"})

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
            description=data.get('task'),
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
            description=data.get('task'),
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