$(document).ready(function() {
    console.log('🔧 modal.js loaded - EDIT FIXED VERSION');

    // Remove the duplicate Sortable initialization - keep only one
    // DRAG-AND-DROP using Sortable
    new Sortable(document.getElementById('task-table-body'), {
        animation: 150,
        handle: '.task-content', // Only allow dragging by the task content
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
    $('.filter-btn').on('click', function() {
        const status = $(this).data('status');
        console.log('🔍 Filtering by status:', status);
        
        // Update active state
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        
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
    $('#task-modal').on('show.bs.modal', function(e) {
        // Only reset if it's not an edit operation
        if (!$(e.relatedTarget).hasClass('edit')) {
            resetModal();
            setupSubmit();
        }
    });

    // Edit task - SIMPLIFIED AND FIXED
    $(document).on('click', '.edit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const taskId = $(this).data('id');
        const row = $(this).closest('tr');
        
        console.log('✏️ Editing task ID:', taskId);
        console.log('📊 Row data:', row.data());

        // Get data directly from data attributes and elements
        const description = row.find('.fw-semibold').first().text().trim();
        const status = row.data('status');
        const priority = row.find('.badge').first().text().trim();
        
        // Get due date - try multiple locations
        let dueDate = '';
        const dueDateCell = row.find('td').eq(4); // 5th column (0-indexed)
        if (dueDateCell.length && dueDateCell.text().trim() !== '-') {
            dueDate = dueDateCell.text().trim();
        }
        
        // Fallback to small text in description column
        if (!dueDate) {
            const dueDateSmall = row.find('small');
            if (dueDateSmall.length) {
                dueDate = dueDateSmall.text().replace('⏰', '').trim();
            }
        }

        console.log('📝 Extracted data:', { 
            description, 
            status, 
            priority, 
            dueDate,
            taskId 
        });

        // Populate modal fields
        $('#task-desc').val(description);
        $('#task-status').val(status);
        $('#task-priority').val(priority);
        $('#task-due-date').val(dueDate);
        
        $('#modal-title').text('Edit Task');
        
        // Show modal
        $('#task-modal').modal('show');
        
        // Setup submit handler for this task
        setupSubmit(taskId);
    });

    // Delete task
    $(document).on('click', '.delete', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
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
        // Use location reload for now to ensure clean state
        location.reload();
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

    // Debug: Check if edit buttons are properly bound
    console.log('🔍 Edit buttons found:', $('.edit').length);
    $('.edit').each(function(i) {
        console.log(`  Edit button ${i}:`, {
            id: $(this).data('id'),
            text: $(this).find('i').attr('class')
        });
    });
});