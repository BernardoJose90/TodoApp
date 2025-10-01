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
                url: '/reorder',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(order),
                success: function(response) {
                    if(response.success) console.log('Task order updated!');
                },
                error: function(err) {
                    console.error('Error updating order:', err);
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

            let url = '/create';
            if (taskId) url = `/edit/${taskId}`;

            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ description, status, priority, due_date }),
                success: function(response) {
                    if(response.success) {
                        $('#task-modal').modal('hide');
                        $('#task-desc').val('');
                        $('#task-status').val('Todo');
                        $('#task-priority').val('Medium');
                        $('#task-due-date').val('');
                        refreshTable();
                    }
                },
                error: function(err) {
                    alert("Error saving task!");
                    console.error(err);
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
            url: `/delete/${taskId}`,
            type: 'POST',
            success: function(response) {
                if (response.success) refreshTable();
            },
            error: function(err) {
                alert("Error deleting task!");
                console.error(err);
            }
        });
    });

    // Refresh table helper
    function refreshTable() {
        $.get('/', function(data) {
            const newTableBody = $(data).find('tbody').html();
            $('#task-table-body').html(newTableBody);
        });
    }
});
