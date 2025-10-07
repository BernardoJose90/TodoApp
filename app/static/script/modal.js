$(document).ready(function() {
    // DRAG-AND-DROP using Sortable
    new Sortable(document.getElementById('task-table-body'), {
        animation: 150,
        onEnd: function(evt) {
            let order = [];
            $('#task-table-body tr').each(function(index) {
                order.push({ id: $(this).data('id'), position: index });
            });

            // Persist order to backend
            $.ajax({
                url: '/tasks/reorder',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ tasks: order }),
                success: function(response) {
                    console.log('Task order updated!', response);
                },
                error: function(xhr, status, error) {
                    console.error('Error updating order:', error, xhr.responseText);
                }
            });
        }
    });

    // Filter tasks
    $('.filter').on('click', function() {
        const status = $(this).data('status');
        $('#task-table-body tr').each(function() {
            if (status === 'All' || $(this).data('status') === status) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Add/Edit Task Modal
    function setupSubmit(taskId = null) {
        $('#submit-task').off('click').on('click', function() {
            const description = $('#task-desc').val();
            const status = $('#task-status').val();
            const priority = $('#task-priority').val();
            const due_date = $('#task-due-date').val();

            if (!description) {
                alert("Please enter a task!");
                return;
            }

            let url = '/tasks';
            let method = 'POST';
            
            if (taskId) {
                url = `/tasks/${taskId}`;
                method = 'PUT';
            }

            console.log('Sending request:', { url, method, description, status, priority, due_date });

            $.ajax({
                url: url,
                type: method,
                contentType: 'application/json',
                data: JSON.stringify({ 
                    description: description,  // CHANGED: 'task' to 'description'
                    status: status, 
                    priority: priority, 
                    due_date: due_date 
                }),
                success: function(response) {
                    console.log('Success response:', response);
                    $('#task-modal').modal('hide');
                    $('#task-desc').val('');
                    $('#task-status').val('Todo');
                    $('#task-priority').val('Medium');
                    $('#task-due-date').val('');
                    refreshTable();
                },
                error: function(xhr, status, error) {
                    console.error('Error saving task:', error, xhr.responseText);
                    alert("Error saving task: " + (xhr.responseJSON?.error || error));
                }
            });
        });
    }

    // Add new task
    $('#submit-task').off('click'); // reset any previous click
    setupSubmit();

    // Edit task
    $(document).on('click', '.edit', function() {
        const row = $(this).closest('tr');
        const taskId = $(this).data('id');

        $('#task-desc').val(row.find('td:nth-child(2)').text());
        $('#task-status').val(row.find('td:nth-child(3)').text());
        $('#task-priority').val(row.find('td:nth-child(4)').text());
        $('#task-due-date').val(row.find('td:nth-child(5)').text());
        $('#task-modal').modal('show');

        setupSubmit(taskId); // Rebind submit for editing
    });

    // Delete task
    $(document).on('click', '.delete', function() {
        const taskId = $(this).data('id');

        if (!confirm("Are you sure you want to delete this task?")) return;

        $.ajax({
            url: `/tasks/${taskId}`,
            type: 'DELETE',
            success: function(response) {
                console.log('Delete successful:', response);
                refreshTable();
            },
            error: function(xhr, status, error) {
                console.error('Error deleting task:', error, xhr.responseText);
                alert("Error deleting task: " + (xhr.responseJSON?.error || error));
            }
        });
    });

    // Refresh table helper
    function refreshTable() {
        $.get('/tasks', function(tasks) {
            console.log('Tasks loaded:', tasks);
            // You'll need to update this to properly render the table
            // based on your actual HTML structure
            location.reload(); // Simple refresh for now.
        }).fail(function(err) {
            console.error('Error loading tasks:', err);
        });
    }
});
