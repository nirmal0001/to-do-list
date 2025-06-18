import "./reset.css"
import "./styles.css"

import "./dilog.js"
import {form } from "./dilog.js"
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
        if (!raw) return [];

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


// - UI Module
//   - display projects, todos, and forms
//   - display only toady todos or upcoming when clcked
//   - chnage project when clicked
//   - delete project by clicking on top delet button
//   - handle click on add delete edit on todos
//   - hanlde click on project add delete
// make a commit befor js