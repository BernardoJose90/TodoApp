$(document).ready(function() {
    console.log('🔧 modal.js loaded - EMERGENCY FIX VERSION');

    // EMERGENCY MODAL FUNCTIONS - GUARANTEED TO WORK
    function showModal() {
        console.log('🔄 Showing modal...');
        const modal = document.getElementById('task-modal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Add backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            
            console.log('✅ Modal shown manually');
            return true;
        }
        console.log('❌ Modal element not found');
        return false;
    }

    function hideModal() {
        console.log('🔄 Hiding modal...');
        const modal = document.getElementById('task-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            // Remove backdrop
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            
            console.log('✅ Modal hidden');
        }
    }

    // DRAG-AND-DROP
    new Sortable(document.getElementById('task-table-body'), {
        animation: 150,
        handle: '.task-content',
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

    // FILTER TASKS
    $('.filter-btn').on('click', function() {
        const status = $(this).data('status');
        console.log('🔍 Filtering by status:', status);
        
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
                    console.log('✅ Task saved successfully:', response);
                    hideModal();
                    resetModal();
                    refreshTable();
                },
                error: function(xhr, status, error) {
                    console.error('❌ Error saving task:', error);
                    alert("Error saving task: " + (xhr.responseJSON?.error || error));
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

    // NEW TASK - USING BOOTSTRAP'S BUILT-IN FUNCTIONALITY
    // The button already has data-bs-toggle="modal" so it should work automatically
    // But we'll also add a JavaScript fallback
    $(document).on('click', '#add-task-btn', function(e) {
        console.log('➕ New Task button clicked via JavaScript');
        resetModal();
        setupSubmit();
        // Don't call showModal() here - let Bootstrap handle it
    });

    // EDIT TASK - SIMPLE AND RELIABLE
    $(document).on('click', '.edit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const taskId = $(this).data('id');
        const row = $(this).closest('tr');
        
        console.log('🎯 EDIT BUTTON CLICKED - ID:', taskId);

        // Extract data
        const description = row.find('.fw-semibold').first().text().trim();
        const status = row.data('status');
        const priority = row.find('.badge').first().text().trim();
        
        let dueDate = '';
        const dueDateCell = row.find('td').eq(4);
        if (dueDateCell.length && dueDateCell.text().trim() !== '-') {
            dueDate = dueDateCell.text().trim();
        }
        
        if (!dueDate) {
            const dueDateSmall = row.find('small');
            if (dueDateSmall.length) {
                dueDate = dueDateSmall.text().replace('⏰', '').trim();
            }
        }

        console.log('📝 Extracted data:', { description, status, priority, dueDate, taskId });

        // Populate modal
        $('#task-desc').val(description);
        $('#task-status').val(status);
        $('#task-priority').val(priority);
        $('#task-due-date').val(dueDate);
        $('#modal-title').text('Edit Task');

        // Setup submit and show modal
        setupSubmit(taskId);
        showModal(); // Use our guaranteed showModal function
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
                console.log('✅ Delete successful:', response);
                refreshTable();
            },
            error: function(xhr, status, error) {
                console.error('❌ Error deleting task:', error);
                alert("Error deleting task: " + (xhr.responseJSON?.error || error));
            }
        });
    });

    // CLOSE MODAL HANDLERS
    $('#task-modal .btn-close, #task-modal .btn-secondary').on('click', function() {
        hideModal();
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
    console.log('✅ Emergency modal.js loaded successfully');

    // TEST: Make manual modal function available
    window.manualShowModal = showModal;
    window.manualHideModal = hideModal;
});

