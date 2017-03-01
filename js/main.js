class Task {
    constructor(priority, title) {
        this.created = moment().format('YYYY-MM-DD');
        this.title = title;
        this.completed = false;
        this.priority = priority;
    }
}

$(document).ready(function() {

    const STORAGE_KEY = 'tasks';
    var items = getFromLocal(STORAGE_KEY);
    var index;
    loadList(items);

    // if input is empty disable button
    $('button').prop('disabled', true);
    $('#export-button').prop('disabled', false);
    $('input').keyup(function() {
        if ($(this).val().length !== 0) {
            $('button').prop('disabled', false);
        } else {
            $('button').prop('disabled', true);
        }
    });

    // bind input enter with button submit
    $('#main-input').keypress(function(e) {
        if (e.which === 13) {
            if ($('#main-input').val().length !== 0)
                $('#main-button').click();
        }
    });

    $('#main-button').click(function() {
        var value = $('#main-input').val();
        items.push(value);
        //console.log(items[0]);
        $('#main-input').val('');
        loadList(items);
        storeToLocal(STORAGE_KEY, items);
        // set button to
        $('button').prop('disabled', true);
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
        var content = items[index];
        console.log(content);
        $('#edit-input').val(content);
    });

    $('#edit-button').click(function() {
        items[index] = $('#edit-input').val();
        loadList(items);
        storeToLocal(STORAGE_KEY, items);
    });

    // loadList
    function loadList(items) {
        $('li').remove();
        if (items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                $('ul').append('<li class= "list-group-item" data-toggle="modal" data-target="#editModal">' + items[i] + '<span class="glyphicon glyphicon-remove"></span</li>');
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
        saveToFile(items);
    });

    function saveToFile(items) {
        var file = new File(items, "test.txt", {
            type: "text/plain;charset=utf-8"
        });
        saveAs(file);
    }
});