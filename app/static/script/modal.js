$(document).ready(function () {
    $('#submit-task').click(function () {
        let desc = $('#task-desc').val();
        $.ajax({
            type: 'POST',
            url: '/create',
            contentType: 'application/json',
            data: JSON.stringify({description: desc}),
            success: function() { location.reload(); }
        });
    });

    $('.delete').click(function () {
        let id = $(this).data('id');
        $.post('/delete/' + id, {}, function(){ location.reload(); });
    });
});
