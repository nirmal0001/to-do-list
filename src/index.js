import "./reset.css"
import "./styles.css"

import "./dilog.js"
import {form } from "./dilog.js"
import projectIcon from "./assets/icons/projects.svg"
import { parse as dateParse , format} from "date-fns"
// Classes:
// - Todo
//   - properties: title, desc, date, priority[high, low, medium color based], notes, checklist[]
//   - methods: markDone(), edit(), export()
class Todo{
    constructor(title, desc, date, priority, notes, checklist = [], done = false){
        this.title = title
        this.desc = desc
        this.date = this.setDate(date)
        this.priority = priority
        this.notes = notes
        this.checklist = checklist
        this.done = done
    }

    setDate(date){
        if (date instanceof Date && !isNaN(date)) {
            return date;
        }

        try {
            return dateParse(date, 'yyyy-MM-dd', new Date())
        } catch (error) {
            throw new Error("Invalid date format");
        }
    }
    markDone(){
        this.done = !this.done;
    }

    addChecklistItem(text, checked = false) {
        this.checklist.push({ text, checked });
    }

    removeChecklistItem(index) {
        this.checklist.splice(index, 1);
    }

    edit({ title, desc, date, priority, notes } = {}) {
        if (title !== undefined) this.title = title;
        if (desc !== undefined) this.desc = desc;
        if (date !== undefined) this.date = this.setDate(date);
        if (priority !== undefined) this.priority = priority;
        if (notes !== undefined) this.notes = notes;
    }

    
    export() {
        return {
            title: this.title,
            desc: this.desc,
            date: format(this.date, 'yyyy-MM-dd'), // or format() if you want string date
            priority: this.priority,
            notes: this.notes,
            checklist: this.checklist,
            done: this.done
        };
    }
}



// - Project
//   - properties: name, todos[]
//   - methods: addTodo(), deleteTodo(), export()
class Project {
    constructor(name, todos = []) {
        this.name = name;
        this.todos = this.restoreTodos(todos);
    }

    restoreTodos(todos) {
        if (!Array.isArray(todos) || todos.length === 0) return [];
        return todos.map(todo =>
            new Todo(
                todo.title,
                todo.desc,
                todo.date,
                todo.priority,
                todo.notes,
                todo.checklist,
                todo.done
            )
        );
    }

    addTodo(title, desc, date, priority, notes) {
        this.todos.push(new Todo(title, desc, date, priority, notes));
    }

    deleteTodo(index) {
        this.todos.splice(index, 1);
    }

    export() {
        return JSON.stringify({
            name: this.name,
            todos: this.todos.map(todo => todo.export())
        });
    }
}



// Modules:
// - Logic Module
//   - create/edit/delete todos & projects
class ProjectManager {
    constructor() {
        this.projects = this.restoreProjects();
    }

    restoreProjects() {
        let raw = localStorage.getItem('Projects');
        if (!raw) return [new Project('default')];

        try {
            let parsed = JSON.parse(raw);
            return parsed.map(e => new Project(e.name, e.todos));
        } catch (err) {
            console.error("Failed to parse projects from storage:", err);
            return [];
        }
    }

    createProject(name) {
        if (this.projects.find(e => e.name === name)) return;
        this.projects.push(new Project(name));
        this.save();
    }

    deleteProject(name) {
        this.projects = this.projects.filter(p => p.name !== name);
        this.save();
    }

    resetProject(name) {
        this.projects = this.projects.find(p => p.name === name);
        this.projects.todos = [];
        this.save();
    }

    save() {
        const exportData = this.projects.map(e => {
            return {
                name: e.name,
                todos: e.todos.map(t => t.export())
            };
        });
        localStorage.setItem('Projects', JSON.stringify(exportData));
    }
}

class UiManager{
    constructor(){
        // nav bar tasks buttons
        this.createTaskButton = document.querySelector('.create-task-button')
        this.toadyTaskButton = document.querySelector('.toady-task')
        this.upcomingTaskButton = document.querySelector('.upcoming-task')

        // nav bar projects buttons
        this.createProjectButton = document.querySelector('.create-project-button')
        this.projectSelectionUl = document.querySelector('.project-selection-button')

        // project delete button
        this.projectDeleteButton = document.querySelector('#delete-project')

        // main content
        this.contentDiv = document.querySelector('.content')

        // manager
        this.projectManager = new ProjectManager()

        // forms and dilog
        this.taskFormButton = document.querySelector('.task-selection')
        this.taskDialog = document.querySelector('.task-dialog')
        this.taskDialogClose = document.querySelector('.dialog-close')
        this.projectFormButton = document.querySelector('..project-selection')
        this.projectDialog = document.querySelector('.project-dialog')
        this.projectDialogClose = document.querySelector('.dialog-close2')
    }

    init(){
        this.render()
    }

    render(project='default', filter='all'){
        // update data for nav tasks
        this.toadyTaskButton.dataset.project = project
        this.upcomingTaskButton.dataset.project = project

        // update project selection button
        this.renderSidebar()


    }

    renderContent(project='default', filter='all'){
        // render notes + update delete project button
        this.projectDeleteButton.dataset.project = project

        let empty
    }

    renderSidebar(){
        this.projectSelectionUl.innerHTML = ''
        for (const project of this.projectManager.projects){
            let projectName = project.name
            let liElement = document.createElement('li')
            let imgElement = document.createElement('img')
            liElement.dataset.type = 'select'
            liElement.dataset.selected = projectName
            imgElement.src = projectIcon
            imgElement.alt = 'project icon'
            imgElement.width = '24'
            liElement.appendChild(imgElement)
            liElement.append(projectName)
            liElement.addEventListener('click', () => this.render(projectName))
            this.projectSelectionUl.appendChild(liElement)
        }
    }

    assignEvent(){
        this.toadyTaskButton.addEventListener('click', (e) => {
            let data = e.target.dataset
            this.renderContent(data.project, 'today')
        })

        this.upcomingTaskButton.addEventListener('click', (e) => {
            let data = e.target.dataset
            this.renderContent(data.project, 'upcoming')
        })

        this.deleteProject.addEventListener('click', (e) => {
            let projectName = e.target.dataset.project
            if (projectName == 'default'){
                let answer = confirm('default project cant be deleted only reset\nOk to reset and Cancel to close')
                if (answer === true){
                    this.projectManager.resetProject(projectName)
                }
                return
            }
            this.projectManager.deleteProject(projectName)
        })

        // assign dialog and formus

    }
}

const manager = new UiManager()
manager.init()
// - UI Module
//   - takes default project name to re render page full
//   - display projects, todos, and forms
//   - display only toady todos or upcoming when clcked
//   - chnage project when clicked
//   - delete project by clicking on top delet button
//   - handle click on add delete edit on todos
//   - hanlde click on project add delete
// make a commit befor js