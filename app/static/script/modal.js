$(document).ready(function() {
    const DEBUG = false; // Set true to enable debug logs

    let taskModal = null;
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        taskModal = new bootstrap.Modal(document.getElementById('task-modal'));
    }

    function log(...args) {
        if (DEBUG) console.log(...args);
    }

    // DRAG-AND-DROP
    new Sortable(document.getElementById('task-table-body'), {
        animation: 150,
        handle: '.task-content',
        onEnd: function() {
            const order = [];
            $('#task-table-body tr').each(function(index) {
                order.push({ id: $(this).data('id'), position: index });
            });

            $.ajax({
                url: '/tasks/reorder',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ tasks: order }),
                error: function(xhr, status, error) {
                    alert("Error updating task order: " + error);
                }
            });
        }
    });

    // FILTER TASKS
    $('.filter-btn').on('click', function() {
        const status = $(this).data('status');
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        
        $('#task-table-body tr').each(function() {
            $(this).toggle(status === 'All' || $(this).data('status') === status);
        });

        updateStats();
    });

    // SUBMIT HANDLER
    function setupSubmit(taskId = null) {
        $('#submit-task').off('click').on('click', function() {
            const data = {
                description: $('#task-desc').val(),
                status: $('#task-status').val(),
                priority: $('#task-priority').val(),
                due_date: $('#task-due-date').val()
            };

            if (!data.description) {
                alert("Please enter a task!");
                return;
            }

            const url = taskId ? `/tasks/${taskId}` : '/tasks';
            const method = taskId ? 'PUT' : 'POST';

            $.ajax({
                url: url,
                type: method,
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(response) {
                    hideModal();
                    resetModal();
                    updateTaskRow(response, taskId);
                },
                error: function(xhr, status, error) {
                    alert("Error saving task: " + error);
                }
            });
        });
    }

    // RESET MODAL
    function resetModal() {
        $('#task-desc').val('');
        $('#task-status').val('Todo');
        $('#task-priority').val('Medium');
        $('#task-due-date').val('');
        $('#modal-title').text('Add New Task');
        $('#submit-task').off('click');
    }

    function showModal() {
        if (taskModal) taskModal.show();
        else $('#task-modal').modal('show');
    }

    function hideModal() {
        if (taskModal) taskModal.hide();
        else $('#task-modal').modal('hide');
    }

    // NEW TASK
    $(document).on('click', '#add-task-btn, #add-task-btn-empty', function() {
        resetModal();
        setupSubmit();
        showModal();
    });

    // EDIT TASK
    $(document).on('click', '.edit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const taskId = $(this).data('id');
        const row = $(this).closest('tr');

        const description = row.find('.fw-semibold').first().text().trim();
        const status = row.data('status');
        const priority = row.find('.badge').first().text().trim();
        let dueDate = row.find('td').eq(4).text().trim();
        if (dueDate === '-' || dueDate === 'No due date') dueDate = '';

        $('#task-desc').val(description);
        $('#task-status').val(status);
        $('#task-priority').val(priority);
        $('#task-due-date').val(dueDate);
        $('#modal-title').text('Edit Task');

        setupSubmit(taskId);
        showModal();
    });

    // DELETE TASK
    $(document).on('click', '.delete', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const taskId = $(this).data('id');
        
        if (!confirm("Are you sure you want to delete this task?")) return;

        $.ajax({
            url: `/tasks/${taskId}`,
            type: 'DELETE',
            success: function() {
                $(`#task-table-body tr[data-id="${taskId}"]`).remove();
                updateStats();
            },
            error: function(xhr, status, error) {
            
                alert("Error deleting task: " + error);
            }
        });
    });

    // UPDATE OR ADD TASK ROW
    function updateTaskRow(task, taskId = null) {
        let row = taskId ? $(`#task-table-body tr[data-id="${taskId}"]`) : null;

        const html = `
            <tr data-id="${task.id}" data-status="${task.status}">
                <td class="task-content fw-semibold">${task.description}</td>
                <td>${task.status}</td>
                <td><span class="badge bg-primary">${task.priority}</span></td>
                <td>${task.due_date || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary edit" data-id="${task.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete" data-id="${task.id}">Delete</button>
                </td>
            </tr>
        `;

        if (row && row.length) {
            row.replaceWith(html);
        } else {
            $('#task-table-body').append(html);
        }

        updateStats();
    }

    // UPDATE STATS
    function updateStats() {
        const total = $('#task-table-body tr:visible').length;

        $('#total-tasks').text(total);
        $('#todo-tasks').text($('#task-table-body tr[data-status="Todo"]:visible').length);
        $('#progress-tasks').text($('#task-table-body tr[data-status="In Progress"]:visible').length);
        $('#done-tasks').text($('#task-table-body tr[data-status="Done"]:visible').length);
        $('#empty-state').toggle(total === 0);
    }

    // INITIALIZE
    updateStats();

});

