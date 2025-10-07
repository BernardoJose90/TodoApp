$(document).ready(function() {
    console.log('🔧 modal.js loaded');

    // DRAG-AND-DROP using Sortable
    new Sortable(document.getElementById('task-table-body'), {
        animation: 150,
        onEnd: function(evt) {
            let order = [];
            $('#task-table-body tr').each(function(index) {
                order.push({ id: $(this).data('id'), position: index });
            });

            console.log('🔄 Reordering tasks:', order);

            $.ajax({
                url: '/tasks/reorder',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ tasks: order }),
                success: function(response) {
                    console.log('✅ Task order updated:', response);
                },
                error: function(xhr, status, error) {
                    console.error('❌ Error updating order:', error, xhr.responseText);
                    alert("Error updating task order: " + (xhr.responseJSON?.error || error));
                }
            });
        }
    });

    // Filter tasks
    $('.filter').on('click', function() {
        const status = $(this).data('status');
        console.log('🔍 Filtering by status:', status);
        
        $('#task-table-body tr').each(function() {
            if (status === 'All' || $(this).data('status') === status) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        
        updateStats();
    });

    // Add/Edit Task Modal
    function setupSubmit(taskId = null) {
        $('#submit-task').off('click').on('click', function() {
            const description = $('#task-desc').val();
            const status = $('#task-status').val();
            const priority = $('#task-priority').val();
            const due_date = $('#task-due-date').val();

            console.log('💾 Saving task:', { taskId, description, status, priority, due_date });

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

            $.ajax({
                url: url,
                type: method,
                contentType: 'application/json',
                data: JSON.stringify({ 
                    description: description,
                    status: status, 
                    priority: priority, 
                    due_date: due_date 
                }),
                success: function(response) {
                    console.log('✅ Task saved successfully:', response);
                    $('#task-modal').modal('hide');
                    resetModal();
                    refreshTable();
                },
                error: function(xhr, status, error) {
                    console.error('❌ Error saving task:', {
                        error: error,
                        status: xhr.status,
                        response: xhr.responseText,
                        request: { url, method, data: { description, status, priority, due_date } }
                    });
                    alert("Error saving task: " + (xhr.responseJSON?.error || error));
                }
            });
        });
    }

    // Reset modal
    function resetModal() {
        $('#task-desc').val('');
        $('#task-status').val('Todo');
        $('#task-priority').val('Medium');
        $('#task-due-date').val('');
        $('#modal-title').text('Add New Task');
        $('#submit-task').off('click');
    }

    // Add new task
    $('#task-modal').on('show.bs.modal', function() {
        resetModal();
        setupSubmit();
    });

    // Edit task
    $(document).on('click', '.edit', function() {
        const row = $(this).closest('tr');
        const taskId = $(this).data('id');
        
        console.log('✏️ Editing task ID:', taskId);

        $('#task-desc').val(row.find('td:nth-child(2) .fw-semibold').text());
        $('#task-status').val(row.find('.status-badge').text().trim());
        $('#task-priority').val(row.find('.badge').text().trim());
        
        // Get due date from the small text
        const dueDateText = row.find('td:nth-child(2) small').text().replace('⏰', '').trim();
        $('#task-due-date').val(dueDateText);
        
        $('#modal-title').text('Edit Task');
        $('#task-modal').modal('show');

        setupSubmit(taskId);
    });

    // Delete task
    $(document).on('click', '.delete', function() {
        const taskId = $(this).data('id');
        console.log('🗑️ Deleting task ID:', taskId);

        if (!confirm("Are you sure you want to delete this task?")) return;

        $.ajax({
            url: `/tasks/${taskId}`,
            type: 'DELETE',
            success: function(response) {
                console.log('✅ Delete successful:', response);
                refreshTable();
            },
            error: function(xhr, status, error) {
                console.error('❌ Error deleting task:', error, xhr.responseText);
                alert("Error deleting task: " + (xhr.responseJSON?.error || error));
            }
        });
    });

    // Refresh table helper
    function refreshTable() {
        console.log('🔄 Refreshing table...');
        $.get('/tasks')
            .done(function(tasks) {
                console.log('✅ Tasks loaded:', tasks);
                // For now, use simple reload
                location.reload();
            })
            .fail(function(err) {
                console.error('❌ Error loading tasks:', err);
                alert('Error loading tasks. Check console for details.');
            });
    }

    // Update stats
    function updateStats() {
        const total = $('#task-table-body tr:visible').length;
        const todo = $('#task-table-body tr[data-status="Todo"]:visible').length;
        const progress = $('#task-table-body tr[data-status="In Progress"]:visible').length;
        const done = $('#task-table-body tr[data-status="Done"]:visible').length;
        
        $('#total-tasks').text(total);
        $('#todo-tasks').text(todo);
        $('#progress-tasks').text(progress);
        $('#done-tasks').text(done);
        
        $('#empty-state').toggle(total === 0);
    }

    // Initialize stats
    updateStats();
});
