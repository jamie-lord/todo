$(document).ready(function() {

    const STORAGE_KEY = 'tasks';
    const DATA_TASK_INDEX = 'data-task-index';
    var items = getFromLocal(STORAGE_KEY);
    loadLists(items);
    disableEditButtons(true);
    updatePageTitle();

    function disableEditButtons(val) {
        $('#main-button').prop('disabled', val);
        $('#edit-button').prop('disabled', val);
    }

    function updatePageTitle() {
        document.title = getIncompleteTasks().length + ' todo';
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
    $(document).on('click', '.delete-button', function(event) {
        event.stopPropagation();
        var index = $(this).parents('li.task-item')[0].getAttribute(DATA_TASK_INDEX);
        $('li.task-item').eq(index).remove();
        items.splice(index, 1);
        storeToLocal(STORAGE_KEY, items);
        loadLists(items);
    });

    // Open edit modal
    $(document).on('click', 'li.task-item', function() {
        var index = this.getAttribute(DATA_TASK_INDEX);
        $('#edit-input').val(items[index].toString());
        $('#edit-input')[0].setAttribute(DATA_TASK_INDEX, index);
    });

    // Save changes to edited task
    $('#edit-button').click(function() {
        var item = new TodoTxtItem();
        item.parse($('#edit-input').val());
        items[$('#edit-input')[0].getAttribute(DATA_TASK_INDEX)] = item;
        loadLists(items);
        storeToLocal(STORAGE_KEY, items);
    });

    // When edit modal is closed keyup main input
    $('#editModal').on('hidden.bs.modal', function() {
        $('#main-input').keyup();
    });

    // Mark task as complete
    $(document).on('click', '.complete-button', function(event) {
        event.stopPropagation();
        var index = $(this).parents('li.task-item')[0].getAttribute(DATA_TASK_INDEX);
        items[index].complete = true;
        items[index].completed = new Date();
        loadLists(items);
        storeToLocal(STORAGE_KEY, items);
    });

    // Load lists for each unique project
    function loadLists(tasks) {
        $('#project-nav li').remove();
        $('#project-tabs div').remove();
        if (tasks.length < 1) {
            return;
        }
        // If there are any tasks that are not complete
        if (tasks.filter(function(t) { return !t.complete; }).length > 0) {
            buildProjectNav('all-projects-tab', 'All', true);
            buildProjectTab('all-projects-tab', true);
            buildTaskList('task-list-project-all', 'all-projects-tab');
            var incompleteTasks = getIncompleteTasks(tasks);
            $('#task-list-project-all').append(buildTasks(incompleteTasks));
            var projects = getUniqueProjects(incompleteTasks);
            for (var i = 0; i < projects.length; i++) {
                initialiseTab(projects[i], getTasksForProject(projects[i], incompleteTasks));
            }
        }
        initialiseCompletedTab();
    }

    // Setup complete task tab
    function initialiseCompletedTab() {
        var complete = [];
        for (var i = 0; i < items.length; i++) {
            var task = items[i];
            if (task.complete) {
                complete.push(task);
            }
        }
        if (complete.length < 1) {
            return;
        }
        buildProjectNav('complete-tasks-tab', 'Complete', false);
        buildProjectTab('complete-tasks-tab', false);
        buildTaskList('task-list-complete', 'complete-tasks-tab');
        $('#task-list-complete').append(buildTasks(complete));
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

    // Get all unique contexts for all tasks
    function getUniqueContexts(tasks) {
        var contexts = [];
        if (tasks.length > 0) {
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                if (task.contexts !== null && task.contexts.length > 0) {
                    for (var j = 0; j < task.contexts.length; j++) {
                        var context = task.contexts[j];
                        if (contexts.indexOf(context) == -1) {
                            contexts.push(context);
                        }
                    }
                }
            }
        }
        return contexts.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    }

    // Load a tab for a project
    function initialiseTab(project, tasks) {
        let tabName = 'project-' + project + '-tab';
        buildProjectNav(tabName, project, false);
        buildProjectTab(tabName, false);
        buildTaskList('task-list-project-' + project, tabName);
        $('#task-list-project-' + project).append(buildTasks(tasks));
    }

    // Build and return a HTML list for an array of tasks
    function buildTasks(tasks) {
        var list = '';
        if (tasks.length > 0) {
            const taskTemplate = getHtmlTemplate('template-task-item');
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                let taskDate = (task.date) ? task.dateString() : '';
                let meta = '';
                if (task.priority) {
                    meta += '<span class="label label-primary">' + task.priority + '</span>\n';
                }
                if (task.contexts) {
                    for (var c = 0; c < task.contexts.length; c++) {
                        meta += '<span class="label label-default">' + task.contexts[c] + '</span>\n';
                    }
                }
                if (task.completed) {
                    meta += '<small>' + task.completedString() + '</small>';
                }
                list += taskTemplate.replace(/{{data-task-index}}/g, DATA_TASK_INDEX)
                    .replace(/{{index}}/g, items.indexOf(task))
                    .replace(/{{task-text}}/g, task.text)
                    .replace(/{{task-date}}/g, taskDate)
                    .replace(/{{task-meta}}/g, meta);
            }
        }
        return list;
    }

    function buildProjectNav(projectTabId, projectTitle, isActive) {
        let li = '';
        let active = (isActive) ? 'active' : '';
        const navTemplate = getHtmlTemplate('template-project-nav');
        li += navTemplate.replace(/{{is-active}}/g, active)
            .replace(/{{project-tab-id}}/g, projectTabId)
            .replace(/{{project-title}}/g, projectTitle);
        $('#project-nav').append(li);
    }

    function buildProjectTab(projectTabId, isActive) {
        let div = '';
        let active = (isActive) ? 'active' : '';
        const tabTemplate = getHtmlTemplate('template-project-tab');
        div += tabTemplate.replace(/{{project-tab-id}}/g, projectTabId)
            .replace(/{{is-active}}/g, active);
        $('#project-tabs').append(div);
    }

    function buildTaskList(taskListId, projectTabId) {
        let ul = '';
        const listTemplate = getHtmlTemplate('template-task-list');
        ul += listTemplate.replace(/{{task-list-id}}/g, taskListId);
        $('#' + projectTabId).append(ul);
    }

    function getTasksForProject(thisProject, allTasks) {
        return allTasks.filter(function(task) {
            return task.projects.filter(function(project) {
                return project == thisProject;
            });
        });
    }

    // Get only incomplete tasks
    function getIncompleteTasks() {
        return items.filter(function(task) {
            return !task.complete;
        });
    }

    // Get a HTML template
    function getHtmlTemplate(name) {
        var template = document.getElementById(name);
        return template.innerHTML;
    }

    // Autocomplete for eisting projects and contexts
    $('#main-input').textcomplete([{ // Projects
            id: 'task-projects',
            words: getUniqueProjects(items),
            match: /[\+](\w{1,})$/,
            search: function(term, callback) {
                callback($.map(this.words, function(word) {
                    return word.toLowerCase().indexOf(term.toLowerCase()) === 0 ? word : null;
                }));
            },
            index: 1,
            replace: function(word) {
                return '+' + word + ' ';
            }
        },
        { // Contexts
            id: 'task-contexts',
            words: getUniqueContexts(items),
            match: /[\@](\w{1,})$/,
            search: function(term, callback) {
                callback($.map(this.words, function(word) {
                    return word.toLowerCase().indexOf(term.toLowerCase()) === 0 ? word : null;
                }));
            },
            index: 1,
            replace: function(word) {
                return '@' + word + ' ';
            }
        }
    ], {
        onKeydown: function(e, commands) {
            if (e.ctrlKey && e.keyCode === 74) { // CTRL-J
                return commands.KEY_ENTER;
            }
        }
    });

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
                task.completed = (item.completed) ? new Date(item.completed) : null;
                task.date = (item.date) ? new Date(item.date) : null;
                task.contexts = item.contexts;
                task.projects = item.projects;
                taskItems.push(task);
            }
            return taskItems;
        } else
            return [];
    }

    // Save all tasks to text file
    $('#export-button').click(function() {
        var output = [];
        items.forEach(function(item) {
            output.push(item.toString() + '\n');
        }, this);
        var file = new File(output, 'todo-' + new Date().toISOString() + '.txt', {
            type: "text/plain;charset=utf-8"
        });
        saveAs(file);
    });

    document.getElementById('import-button').addEventListener('change', importEventHandler);

    addEventListener('dragover', function(e) { e.preventDefault(); });
    addEventListener('drop', function(e) {
        importEventHandler.call((e.dataTransfer || e.clipboardData));
        e.preventDefault();
    });

    function importEventHandler() {
        let file = this.children[0].files[0];
        let reader = new FileReader();
        reader.onloadend = function callback(e) {
            let input = e.target.result.split('\n');
            let tasks = [];
            for (var i = 0; i < input.length; i++) {
                var t = input[i];
                if (t === '') continue;
                tasks.push(new TodoTxtItem(t));
            }
            items = tasks;
            loadLists(items);
            storeToLocal(STORAGE_KEY, items);
        };
        reader.readAsText(file);
        if (this.id) { //only run if this is the input
            let id = this.id;
            this.outerHTML = this.outerHTML; //this resets the input
            document.getElementById(id).addEventListener('change', importEventHandler);
        }
    }
});