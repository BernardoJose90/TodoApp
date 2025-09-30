from app import db

# Handles database CRUD operations(Create, Read, Update, Delete) for tasks

def fetch_todo():
    conn = db.connect()
    query_results = conn.execute("SELECT * FROM tasks;").fetchall()
    conn.close()
    
    todo_list = []
    for result in query_results:
        item = {
            "id": result[0],
            "task": result[1],
            "status": result[2]
        }
        todo_list.append(item)
    return todo_list

def update_task_entry(task_id: int, text: str) -> None:
    conn = db.connect()
    query = f'UPDATE tasks SET task="{text}" WHERE id={task_id};'
    conn.execute(query)
    conn.close()

def update_status_entry(task_id: int, text: str) -> None:
    conn = db.connect()
    query = f'UPDATE tasks SET status="{text}" WHERE id={task_id};'
    conn.execute(query)
    conn.close()

def insert_new_task(text: str) -> int:
    conn = db.connect()
    query = f'INSERT INTO tasks (task, status) VALUES ("{text}", "Todo");'
    conn.execute(query)
    query_results = conn.execute("SELECT LAST_INSERT_ID();").fetchall()
    task_id = query_results[0][0]
    conn.close()
    return task_id

def remove_task_by_id(task_id: int) -> None:
    conn = db.connect()
    query = f'DELETE FROM tasks WHERE id={task_id};'
    conn.execute(query)
    conn.close()
