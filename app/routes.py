from flask import render_template, request, jsonify
from ap import app
from app import database as db_helper

@app.route("/")
def homepage():
    items = db_helper.fetch_todo()
    return render_template("index.html", items=items)

@app.route("/create", methods=["POST"])
def create():
    data = request.get_json()
    db_helper.insert_new_task(
        description=data.get("description"),
        status=data.get("status", "Todo"),
        priority=data.get("priority", "Medium"),
        due_date=data.get("due_date")
    )
    return jsonify({"success": True})

@app.route("/edit/<int:task_id>", methods=["POST"])
def edit(task_id):
    data = request.get_json()
    db_helper.update_task(
        task_id,
        description=data.get("description"),
        status=data.get("status"),
        priority=data.get("priority"),
        due_date=data.get("due_date")
    )
    return jsonify({"success": True})

@app.route("/delete/<int:task_id>", methods=["POST"])
def delete(task_id):
    db_helper.remove_task_by_id(task_id)
    return jsonify({"success": True})

@app.route("/reorder", methods=["POST"])
def reorder():
    data = request.get_json()  # Expects: [{"id": 1, "position": 0}, ...]
    db_helper.reorder_tasks(data)
    return jsonify({"success": True})
