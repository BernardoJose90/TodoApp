from flask import render_template, request, jsonify
from app import app
from app import database as db_helper

# Defines HTTP endpoints (URLs) for the app.
# Connects database operations to HTTP requests.

@app.route("/")
def homepage():
    items = db_helper.fetch_todo()
    return render_template("index.html", items=items)

@app.route("/create", methods=["POST"])
def create():
    data = request.get_json()
    db_helper.insert_new_task(data["description"])
    return jsonify({"success": True})

@app.route("/delete/<int:task_id>", methods=["POST"])
def delete(task_id):
    db_helper.remove_task_by_id(task_id)
    return jsonify({"success": True})

@app.route("/edit/<int:task_id>", methods=["POST"])
def update(task_id):
    data = request.get_json()
    if "status" in data:
        db_helper.update_status_entry(task_id, data["status"])
    elif "description" in data:
        db_helper.update_task_entry(task_id, data["description"])
    return jsonify({"success": True})
