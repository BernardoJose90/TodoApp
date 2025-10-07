$(document).ready(function() {
    console.log('🔧 modal.js loaded - ENHANCED VERSION');

    // Initialize modal
    let taskModal = null;
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        taskModal = new bootstrap.Modal(document.getElementById('task-modal'));
    }

    // Debug: Check button visibility
    console.log('🔍 Total edit buttons found:', $('.edit').length);
    console.log('🔍 Total delete buttons found:', $('.delete').length);

    // DRAG-AND-DROP
    new Sortable(document.getElementById('task-table-body'), {
        animation: 150,
        handle: '.task-content',
        onEnd: function(evt) {
            let order = [];
            $('#task-table-body tr').each(function(index) {
                order.push({ id: $(this).data('id'), position: index });
            });

            $.ajax({
                url: '/tasks/reorder',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ tasks: order }),
                success: function(response) {
                    console.log('✅ Task order updated');
                },
                error: function(xhr, status, error) {
                    console.error('❌ Error updating order:', error);
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
            if (status === 'All' || $(this).data('status') === status) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        
        updateStats();
    });

    // SUBMIT HANDLER
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
                    console.log('✅ Task saved successfully');
                    hideModal();
                    resetModal();
                    refreshTable();
                },
                error: function(xhr, status, error) {
                    console.error('❌ Error saving task:', error);
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

    // MODAL FUNCTIONS
    function showModal() {
        if (taskModal) {
            taskModal.show();
        } else {
            $('#task-modal').modal('show');
        }
    }

    function hideModal() {
        if (taskModal) {
            taskModal.hide();
        } else {
            $('#task-modal').modal('hide');
        }
    }

    // NEW TASK
    $(document).on('click', '#add-task-btn, #add-task-btn-empty', function(e) {
        console.log('➕ New Task button clicked');
        resetModal();
        setupSubmit();
        showModal();
    });

    // EDIT TASK - ENHANCED VERSION
    $(document).on('click', '.edit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const taskId = $(this).data('id');
        const row = $(this).closest('tr');
        
        console.log('🎯 EDIT BUTTON CLICKED - ID:', taskId);
        console.log('📊 Row data:', row.data());

        // Extract data with multiple fallback methods
        let description = row.find('.fw-semibold').first().text().trim();
        let status = row.data('status');
        let priority = row.find('.badge').first().text().trim();
        let dueDate = row.find('td').eq(4).text().trim();
        
        // Fallback if due date shows "-"
        if (dueDate === '-' || dueDate === 'No due date') {
            dueDate = '';
        }

        console.log('📝 EXTRACTED DATA:', { 
            description, 
            status, 
            priority, 
            dueDate 
        });

        // Populate modal fields using jQuery for consistency
        $('#task-desc').val(description);
        $('#task-status').val(status);
        $('#task-priority').val(priority);
        $('#task-due-date').val(dueDate);
        $('#modal-title').text('Edit Task');

        // Setup submit handler for this specific task
        setupSubmit(taskId);
        
        // Show modal
        showModal();
    });

    // DELETE TASK
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
                console.log('✅ Delete successful');
                refreshTable();
            },
            error: function(xhr, status, error) {
                console.error('❌ Error deleting task:', error);
                alert("Error deleting task: " + error);
            }
        });
    });

    // REFRESH TABLE
    function refreshTable() {
        console.log('🔄 Refreshing table...');
        location.reload();
    }

    // UPDATE STATS
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

    // INITIALIZE
    updateStats();
    console.log('✅ Enhanced modal.js loaded successfully');
});