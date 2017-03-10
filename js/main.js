$(document).ready(function() {

    const STORAGE_KEY = 'tasks';
    var items = getFromLocal(STORAGE_KEY);
    loadLists(items);
    disableEditButtons(true);
    updatePageTitle();

    function disableEditButtons(val) {
        $('#main-button').prop('disabled', val);
        $('#edit-button').prop('disabled', val);
    }

    function updatePageTitle() {
        document.title = items.length + ' Todo';
    }

    // If input is empty disable button
    $('#main-input, #edit-input').keyup(function() {
        if ($(this).val().length !== 0) {
            disableEditButtons(false);
        } else {
            disableEditButtons(true);
        }
    });

    // Bind input enter with button submit
    $('#main-input').keypress(function(e) {
        if (e.which === 13) {
            if ($('#main-input').val().length !== 0)
                $('#main-button').click();
        }
    });

    // Create a new task
    $(document).on('click', '#main-button', function() {
        var newTask = new TodoTxtItem($('#main-input').val());
        newTask.date = new Date();
        items.push(newTask);
        $('#main-input').val('');
        loadLists(items);
        storeToLocal(STORAGE_KEY, items);
        disableEditButtons();
    });

    // Delete a task
    $(document).on('click', 'button.delete-button', function(event) {
        event.stopPropagation();
        var index = $('button.delete-button').index(this);
        $('li.task-item').eq(index).remove();
        items.splice(index, 1);
        storeToLocal(STORAGE_KEY, items);
        loadLists(items);
    });

    // Open edit modal
    $(document).on('click', 'li.task-item', function() {
        var index = this.getAttribute('data-task-index');
        $('#edit-input').val(items[index].toString());
        $('#edit-input')[0].setAttribute('data-task-index', index);
    });

    // Save changes
    $('#edit-button').click(function() {
        var item = new TodoTxtItem();
        item.parse($('#edit-input').val());
        items[$('#edit-input')[0].getAttribute('data-task-index')] = item;
        loadLists(items);
        storeToLocal(STORAGE_KEY, items);
    });

    // when edit modal is closed keyup main input
    $('#editModal').on('hidden.bs.modal', function() {
        $('#main-input').keyup();
    });

    // Load lists for each unique project
    function loadLists(tasks) {
        $('#project-nav li').remove();
        $('#project-nav').append('<li class="active"><a href="#all-projects-tab" data-toggle="tab">All</a></li>');
        $('#project-tabs div').remove();

        $('#project-tabs').append('<div class="tab-pane active" id="all-projects-tab"></div>');
        $('#all-projects-tab').append('<ul class="list-group" id="task-list-project-all"></ul>');
        $('#task-list-project-all').append(buildTaskList(tasks));
        var projects = getUniqueProjects(tasks);
        for (var i = 0; i < projects.length; i++) {
            initialiseTab(projects[i], getTasksForProject(projects[i], tasks));
        }
    }

    // Get all unique projects for all tasks
    function getUniqueProjects(tasks) {
        var projects = [];
        if (tasks.length > 0) {
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                if (task.projects !== null && task.projects.length > 0) {
                    for (var j = 0; j < task.projects.length; j++) {
                        var project = task.projects[j];
                        if (projects.indexOf(project) == -1) {
                            projects.push(project);
                        }
                    }
                }
            }
        }
        return projects.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    }

    // Load a tab for a project
    function initialiseTab(project, tasks) {
        $('#project-nav').append('<li><a href="#project-' + project + '-tab" data-toggle="tab">' + project + '</a></li>');
        $('#project-tabs').append('<div class="tab-pane" id="project-' + project + '-tab"></div>');
        $('#project-' + project + '-tab').append('<ul class="list-group" id="task-list-project-' + project + '"></ul>');
        $('#task-list-project-' + project).append(buildTaskList(tasks));
    }

    function buildTaskList(tasks) {
        var list = '';
        if (tasks.length > 0) {
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                list += '<li class="list-group-item task-item" data-toggle="modal" data-target="#editModal" data-task-index="' + items.indexOf(task) + '"><div class="row"><div class="col-sm-1"><button class="btn btn-default"><span class="glyphicon glyphicon-ok"></span></button></div><div class="col-sm-10"><h5 class="task">' + task.text;
                if (task.date !== null) {
                    list += ' <small>' + task.dateString() + '</small>';
                }
                list += '</h5></div><div class="col-sm-1"><button class="btn btn-danger delete-button"><span class="glyphicon glyphicon-remove"></span></button></div></div></li>';
            }
        }
        return list;
    }

    function getTasksForProject(thisProject, allTasks) {
        var tasks = [];
        for (var i = 0; i < allTasks.length; i++) {
            var task = allTasks[i];
            if (task.projects !== null && task.projects.length > 0) {
                for (var j = 0; j < task.projects.length; j++) {
                    if (thisProject == task.projects[j]) {
                        tasks.push(task);
                    }
                }
            }
        }
        return tasks;
    }

    function storeToLocal(key, items) {
        localStorage[key] = JSON.stringify(items);
        updatePageTitle();
    }

    function getFromLocal(key) {
        if (localStorage[key]) {
            var objects = JSON.parse(localStorage[key]);
            var taskItems = [];
            for (var i = 0; i < objects.length; i++) {
                var item = objects[i];
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