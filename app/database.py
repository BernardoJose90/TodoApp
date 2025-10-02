import os
from datetime import date
from sqlalchemy import create_engine, Column, Integer, String, Enum, Date
from sqlalchemy.orm import declarative_base, sessionmaker

# Dynamically choose which secrets module to use(LOCAL or AWS)
if os.getenv("ENV") == "LOCAL":
    from app.secrets import get_secret  # fetches from AWS Secrets Manager
else:
    from app.secrets_local import get_secret  # local testing

# Load database credentials
secret = get_secret()
db_url = f"mysql+pymysql://{secret['username']}:{secret['password']}@{secret['host']}:3306/{secret['dbname']}"

# Create engine and session factory
engine = create_engine(db_url, echo=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

# Declare ORM base
Base = declarative_base()

# ===========================
# Define Task model
# ===========================
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    description = Column(String(255), nullable=False)
    status = Column(Enum("Todo", "In Progress", "Done"), default="Todo", nullable=False)
    priority = Column(Enum("Low", "Medium", "High"), default="Medium", nullable=False)
    due_date = Column(Date, nullable=True)
    position = Column(Integer, nullable=True)  # For drag-and-drop ordering.

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# ===========================
# Database helper functions
# ===========================
def fetch_todo(order_by_position=True, filter_status=None):
    """Fetch all tasks, optionally filtering by status."""
    with SessionLocal() as session:
        query = session.query(Task)
        if filter_status:
            query = query.filter(Task.status == filter_status)
        if order_by_position:
            query = query.order_by(Task.position)
        else:
            query = query.order_by(Task.id)
        return [
            {
                "id": task.id,
                "task": task.description,
                "status": task.status,
                "priority": task.priority,
                "due_date": task.due_date,
                "position": task.position,
            }
            for task in query.all()
        ]

def insert_new_task(description, status="Todo", priority="Medium", due_date=None, position=None):
    """Insert a new task."""
    with SessionLocal() as session:
        if position is None:
            max_pos = session.query(Task.position).order_by(Task.position.desc()).first()
            position = (max_pos[0] or 0) + 1 if max_pos else 1
        task = Task(
            description=description,
            status=status,
            priority=priority,
            due_date=due_date,
            position=position
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task.id

def update_task(task_id, description=None, status=None, priority=None, due_date=None, position=None):
    """Update a task."""
    with SessionLocal() as session:
        task = session.get(Task, task_id)
        if not task:
            return False
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status
        if priority is not None:
            task.priority = priority
        if due_date is not None:
            task.due_date = due_date
        if position is not None:
            task.position = position
        session.commit()
        return True

def remove_task_by_id(task_id):
    """Delete a task."""
    with SessionLocal() as session:
        task = session.get(Task, task_id)
        if not task:
            return False
        session.delete(task)
        session.commit()
        return True

def reorder_tasks(task_list):
    """Reorder tasks based on a list of dicts [{'id': 1, 'position': 2}, ...]."""
    with SessionLocal() as session:
        for task_info in task_list:
            task = session.get(Task, task_info["id"])
            if task:
                task.position = task_info["position"]
        session.commit()
