$(document).ready(function() {

    const STORAGE_KEY = 'tasks';
    var items = getFromLocal(STORAGE_KEY);
    var index;
    loadList(items);
    disableEditButtons(true);
    updatePageTitle();

    function disableEditButtons(val) {
        $('#main-button').prop('disabled', val);
        $('#edit-button').prop('disabled', val);
    }

    function updatePageTitle() {
        document.title = items.length + ' Todo';
    }

    // if input is empty disable button
    $('#main-input, #edit-input').keyup(function() {
        if ($(this).val().length !== 0) {
            disableEditButtons(false);
        } else {
            disableEditButtons(true);
        }
    });

    // bind input enter with button submit
    $('#main-input').keypress(function(e) {
        if (e.which === 13) {
            if ($('#main-input').val().length !== 0)
                $('#main-button').click();
        }
    });

    // Create a new task
    $('#main-button').click(function() {
        var newTask = new TodoTxtItem($('#main-input').val());
        newTask.date = new Date();
        items.push(newTask);
        $('#main-input').val('');
        loadList(items);
        storeToLocal(STORAGE_KEY, items);
        disableEditButtons();
    });

    // delete one item
    $('ul').delegate('button.delete-button', 'click', function(event) {
        event.stopPropagation();
        index = $('button.delete-button').index(this);
        $('li.task-item').eq(index).remove();
        items.splice(index, 1);
        storeToLocal(STORAGE_KEY, items);
    });

    // edit panel
    $('ul').delegate('li', 'click', function() {
        index = $('li.task-item').index(this);
        var content = items[index].toString();
        $('#edit-input').val(content);
    });

    $('#edit-button').click(function() {
        var item = new TodoTxtItem();
        item.parse($('#edit-input').val());
        items[index] = item;
        loadList(items);
        storeToLocal(STORAGE_KEY, items);
    });

    // when edit modal is closed keyup main input
    $('#editModal').on('hidden.bs.modal', function() {
        $('#main-input').keyup();
    });

    // loadList
    function loadList(items) {
        $('#task-list li').remove();
        if (items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var taskRow = '<li class="list-group-item task-item" data-toggle="modal" data-target="#editModal"><div class="row"><div class="col-sm-1"><button class="btn btn-default"><span class="glyphicon glyphicon-ok"></span></button></div><div class="col-sm-10"><h5 class="task">' + item.text;
                if (item.date !== null) {
                    taskRow += ' <small>' + item.dateString() + '</small>';
                }
                taskRow += '</h5></div><div class="col-sm-1"><button class="btn btn-danger delete-button"><span class="glyphicon glyphicon-remove"></span></button></div></div></li>';
                $('#task-list').append(taskRow);
            }
        }
    }

    function storeToLocal(key, items) {
        localStorage[key] = JSON.stringify(items);
        updatePageTitle();
    }

    function getFromLocal(key) {
        if (localStorage[key]) {
            var objects = JSON.parse(localStorage[key]);
            var taskItems = [];
            for (var index = 0; index < objects.length; index++) {
                var item = objects[index];
                var task = new TodoTxtItem();
                task.text = item.text;
                task.priority = item.priority;
                task.complete = item.complete;
                task.date = new Date(item.date);
                task.contexts = item.contexts;
                task.projects = item.projects;
                taskItems.push(task);
            }
            return taskItems;
        } else
            return [];
    }

    // save entire list
    $('#export-button').click(function() {
        var output = [];
        items.forEach(function(item) {
            output.push(item.toString() + '\n');
        }, this);
        var file = new File(output, "todo.txt", {
            type: "text/plain;charset=utf-8"
        });
        saveAs(file);
    });
});