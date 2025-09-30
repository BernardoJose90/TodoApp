from app import db

def fetch_todo():
    conn = db.connect()
    query_results = conn.execute("SELECT * FROM tasks").fetchall()
    conn.close()
    todo_list = [{"id": r[0], "task": r[1], "status": r[2]} for r in query_results]
    return todo_list

def insert_new_task(text):
    conn = db.connect()
    conn.execute('INSERT INTO tasks (task, status) VALUES ("{}", "Todo")'.format(text))
    task_id = conn.execute("SELECT LAST_INSERT_ID()").fetchone()[0]
    conn.close()
    return task_id

def remove_task_by_id(task_id):
    conn = db.connect()
    conn.execute('DELETE FROM tasks WHERE id={}'.format(task_id))
    conn.close()

def update_task_entry(task_id, text):
    conn = db.connect()
    conn.execute('UPDATE tasks SET task="{}" WHERE id={}'.format(text, task_id))
    conn.close()

def update_status_entry(task_id, text):
    conn = db.connect()
    conn.execute('UPDATE tasks SET status="{}" WHERE id={}'.format(text, task_id))
    conn.close()
