$(document).ready(function() {
    console.log('🔧 modal.js loaded - FINAL WORKING VERSION');

    // SIMPLE MODAL FUNCTIONS
    function showModal() {
        console.log('🔄 Showing modal...');
        const modal = document.getElementById('task-modal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            
            console.log('✅ Modal shown');
        }
    }

    function hideModal() {
        console.log('🔄 Hiding modal...');
        const modal = document.getElementById('task-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
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

    // NEW TASK
    $(document).on('click', '#add-task-btn', function(e) {
        console.log('➕ New Task button clicked');
        resetModal();
        setupSubmit();
        showModal();
    });

    // EDIT TASK - SIMPLE AND RELIABLE
    $(document).on('click', '.edit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const taskId = $(this).data('id');
        const row = $(this).closest('tr');
        
        console.log('🎯 EDIT BUTTON CLICKED - ID:', taskId);

        // SIMPLE DATA EXTRACTION - Using the working method from debug
        const description = row.find('td').eq(1).find('.fw-semibold').text().trim();
        const status = row.data('status');
        const priority = row.find('td').eq(3).find('.badge').text().trim();
        let dueDate = row.find('td').eq(4).text().trim();
        if (dueDate === '-') dueDate = '';

        console.log('📝 EXTRACTED DATA:', { description, status, priority, dueDate, taskId });

        // POPULATE MODAL - With small delay to ensure DOM is ready
        setTimeout(() => {
            $('#task-desc').val(description);
            $('#task-status').val(status);
            $('#task-priority').val(priority);
            $('#task-due-date').val(dueDate);
            $('#modal-title').text('Edit Task');
            
            console.log('✅ Modal populated with:', {
                desc: $('#task-desc').val(),
                status: $('#task-status').val(), 
                priority: $('#task-priority').val(),
                dueDate: $('#task-due-date').val()
            });
        }, 50);

        // Setup submit handler
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

    // CLOSE MODAL
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
    console.log('✅ modal.js fully loaded and ready');
});

// Emergency modal population test
function emergencyPopulate() {
    console.log('🚨 Emergency modal population test');
    
    // Clear and set values manually
    $('#task-desc').val('TEST DESCRIPTION');
    $('#task-status').val('Todo');
    $('#task-priority').val('Medium');
    $('#task-due-date').val('2024-12-31');
    $('#modal-title').text('Edit Task');
    
    // Show modal
    const modal = document.getElementById('task-modal');
    modal.style.display = 'block';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.appendChild(document.createElement('div')).className = 'modal-backdrop fade show';
    
    console.log('✅ Emergency modal shown with test data');
    console.log('Current form values:', {
        desc: $('#task-desc').val(),
        status: $('#task-status').val(),
        priority: $('#task-priority').val(),
        dueDate: $('#task-due-date').val()
    });
}

// Run the test
emergencyPopulate();