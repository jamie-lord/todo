class Task {
    constructor(priority, title) {
        this.created = moment().format('YYYY-MM-DD');
        this.title = title;
        this.completed = false;
        this.lastUpdated = null;
        this.priority = priority;
    }
}

$(document).ready(function() {

    const STORAGE_KEY = 'tasks';
    var items = getFromLocal(STORAGE_KEY);
    var index;
    loadList(items);
    disableEditButtons();

    function disableEditButtons() {
        $('button').prop('disabled', true);
        $('#export-button').prop('disabled', false);
    }

    // if input is empty disable button
    $('#main-input, #edit-input').keyup(function() {
        if ($(this).val().length !== 0) {
            $('button').prop('disabled', false);
        } else {
            $('button').prop('disabled', true);
        }
        $('#export-button').prop('disabled', false);
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
        var taskTitle = $('#main-input').val();
        items.push(new Task('A', taskTitle));
        $('#main-input').val('');
        loadList(items);
        storeToLocal(STORAGE_KEY, items);
        disableEditButtons();
    });

    // delete one item
    $('ul').delegate("span", "click", function(event) {
        event.stopPropagation();
        index = $('span').index(this);
        $('li').eq(index).remove();
        items.splice(index, 1);
        storeToLocal(STORAGE_KEY, items);
    });

    // edit panel
    $('ul').delegate('li', 'click', function() {
        index = $('li').index(this);
        var content = items[index].title;
        $('#edit-input').val(content);
    });

    $('#edit-button').click(function() {
        items[index].title = $('#edit-input').val();
        items[index].lastUpdated = moment().format('YYYY-MM-DD');
        loadList(items);
        storeToLocal(STORAGE_KEY, items);
    });

    // when edit modal is closed keyup main input
    $('#editModal').on('hidden.bs.modal', function() {
        $('#main-input').keyup();
    });

    // loadList
    function loadList(items) {
        $('li').remove();
        if (items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var taskRow = '<li class="list-group-item" data-toggle="modal" data-target="#editModal"><h5 class="task">' + item.title;
                if (item.created !== null) {
                    taskRow += ' <small>' + item.created + '</small>';
                }
                if (item.lastUpdated !== null && item.lastUpdated !== item.created) {
                    taskRow += ' <small>Updated ' + item.lastUpdated + '</small>'
                }
                taskRow += '<span class="glyphicon glyphicon-remove pull-right"></span></h5></li>';
                $('ul').append(taskRow);
            }
        }
    };

    function storeToLocal(key, items) {
        localStorage[key] = JSON.stringify(items);
    }

    function getFromLocal(key) {
        if (localStorage[key])
            return JSON.parse(localStorage[key]);
        else
            return [];
    }

    // save entire list
    $('#export-button').click(function() {
        var output = [];
        items.forEach(function(item) {
            var task = '';
            if (item.completed) {
                task += 'x ';
            }
            task += '(' + item.priority + ') ' + item.created + ' ' + item.title + '\r\n';
            output.push(task);
        }, this);
        var file = new File(output, "todo.txt", {
            type: "text/plain;charset=utf-8"
        });
        saveAs(file);
    });
});