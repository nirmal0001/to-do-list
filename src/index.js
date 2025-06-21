import "./reset.css"
import "./styles.css"

import projectIcon from "./assets/icons/projects.svg"
import deleteIcon from "./assets/icons/delete.svg"
import addCircleIcon from "./assets/icons/add-circle.svg"
import { parse as dateParse , format} from "date-fns"
// Classes:
// - Todo
//   - properties: title, desc, date, priority[high, low, medium color based], notes, checklist[]
//   - methods: markDone(), edit(), export()
class Todo{
    constructor(title, desc, date, priority, notes, checklist = [], done = false){
        this.title = title
        this.desc = desc
        this.date = ''
        this.priority = priority
        this.notes = notes
        this.checklist = checklist
        this.done = done
        this.setDate(date)
    }

    setDate(date){
        if (date instanceof Date && !isNaN(date)) {
            this.date = date;
        }

        try {
            this.date = dateParse(date, 'yyyy-MM-dd', new Date())
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
        let defaultProject = this.projects.find(p => p.name === name);
        defaultProject.todos = [];
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
        this.contentDiv = document.querySelector('.cards')

        // manager
        this.projectManager = new ProjectManager()
        window.projectM = this.projectManager

        // forms and dialog
        // TODO assign edit form and dialog
        this.taskFormButton = document.querySelector('#task-selection')
        this.taskDialog = document.querySelector('.task-dialog')
        this.taskDialogClose = document.querySelector('.dialog-close')
        this.taskProjectSelection = document.querySelector('select[name="project"')
        this.projectFormButton = document.querySelector('#project-selection')
        this.projectDialog = document.querySelector('.project-dialog')
        this.projectDialogClose = document.querySelector('.dialog-close2')
    }

    init(){
        this.render()
        this.assignEvent()
    }

    render(project='default', filter='all'){
        // update data for nav tasks
        this.toadyTaskButton.dataset.project = project
        this.upcomingTaskButton.dataset.project = project
        this.projectDeleteButton.dataset.project = project
        // update project selection button
        this.renderSidebar()
        this.renderTaskSelection()
        this.renderTasks(project, filter)


    }

    renderTasks(project='default', filter='all'){
        // empty the content
        this.contentDiv.innerHTML = ''
        // render notes + update delete project button
        this.projectDeleteButton.dataset.project = project
        let projectData = this.projectManager.projects.find(p => p.name == project)
        let filterData
        switch (filter){
            case 'today':
                const today = new Date();
                filterData = projectData.todos.filter(p => p.date.getDate() === today.getDate())
                break

            case 'upcoming':
                filterData = projectData.todos.filter(p => p.date > new Date())
                break

            default:
                filterData = projectData.todos
        }
        filterData.forEach((p, taskIndex) => {
            // create outer div 
            let card = document.createElement('div')
            card.dataset.group = project
            card.dataset.taskId = taskIndex
            card.className = 'card'

            // create title
            let title = document.createElement('h3')
            title.className = "card-title"
            title.innerText = p.title
            card.appendChild(title)

            // create main div
            let mainCard = document.createElement('div')
            mainCard.className = 'card-main'
            card.appendChild(mainCard)

            // create desc and note
            let desc = document.createElement('div')
            let note = document.createElement('div')
            desc.className = 'desc'
            desc.innerText = p.desc
            note.className = 'note'
            note.innerText = p.notes
            mainCard.appendChild(desc)
            mainCard.appendChild(note)
            
            // create checklist
            let checklist = document.createElement('div')
            checklist.className = 'checklist'

            let checklistList = document.createElement('ul')
            checklistList.className = 'checklist-list'

            p.checklist.forEach((p, index) => {
                let li = document.createElement('li')
                let input = document.createElement('input')
                input.type = "checkbox"
                input.checked = p.checked
                let span = document.createElement('span')
                span.innerText = p.text
                let img = document.createElement('img')
                img.src = deleteIcon
                img.width = '16'
                img.alt = "delete checklist icon"
                img.dataset.project = project               
                li.appendChild(input)
                li.appendChild(span)
                li.appendChild(img)
                checklistList.appendChild(li)
                input.addEventListener('click', (e) => {
                    filterData[taskIndex].checklist[index].checked = e.currentTarget.checked
                    this.projectManager.save()
                    this.renderTasks(project, filter)
                })
                img.addEventListener('click', (e) => {
                    filterData[taskIndex].removeChecklistItem(index)
                    this.projectManager.save()
                    this.renderTasks(project, filter)
                })

            })
            let addCheckList = document.createElement('div')
            addCheckList.className = 'add-checklist'
            let addCheckListInput = document.createElement('input')
            let addCheckListButton = document.createElement('button')
            let addCheckListImg  = document.createElement('img')
            addCheckListImg.src = addCircleIcon
            addCheckListImg.width = 24
            addCheckListImg.alt = 'add checklist item button'

            addCheckListButton.addEventListener('click', (e) => {
                const value = addCheckListInput.value
                filterData[taskIndex].addChecklistItem(value)
                this.projectManager.save()
                this.renderTasks(project, filter)
            })
            addCheckListButton.appendChild(addCheckListImg)
            addCheckList.appendChild(addCheckListInput)
            addCheckList.appendChild(addCheckListButton)
            checklist.appendChild(checklistList)
            checklist.appendChild(addCheckList)
            mainCard.appendChild(checklist)
            
            // make and assign buttons
            const buttonsDiv = document.createElement('div')
            buttonsDiv.className = 'buttons'
            
            const buttonsInput = document.createElement('input')
            buttonsInput.value = format(p.date, 'yyyy-MMM-dd')
            buttonsInput.disabled = true
            
            const sideButtons = document.createElement('div')
            const select = document.createElement('select')
            for (const name of ['High', 'Medium', 'Low']){
                const option = document.createElement('option')
                option.value = name
                option.innerText = name
                option.selected = p.priority == name
                select.appendChild(option)
            }
            select.addEventListener('change', (e) =>{
                const priority = e.target.value
                filterData[taskIndex].edit({priority})
                this.projectManager.save()
                this.renderTasks()

            })
            const deleteTask = document.createElement('button')
            let deleteTaskImg = document.createElement('img')
            deleteTaskImg.src = deleteIcon
            deleteTaskImg.width = '24'
            deleteTaskImg.alt = "delete Task icon" 
            deleteTask.addEventListener('click', (e) => {
                let todo = filterData[taskIndex]
                let index = projectData.todos.indexOf(todo)
                projectData.deleteTodo(index)
                this.projectManager.save()
                this.renderTasks()
            })
            deleteTask.appendChild(deleteTaskImg)
            sideButtons.appendChild(select)
            sideButtons.appendChild(deleteTask)
            buttonsDiv.appendChild(buttonsInput)
            buttonsDiv.appendChild(sideButtons)
            card.appendChild(buttonsDiv)
            // make button div and assign all functionS
            this.contentDiv.appendChild(card)
        });


        // TODO complete this
        // assign all button event
        // assign dialog and edit form data function
        // need to make update todo using edit function in todo
        // save the project and render
    }

    renderSidebar(){
        this.projectSelectionUl.innerHTML = ''
        for (const project of this.projectManager.projects){
            const projectName = project.name
            const liElement = document.createElement('li')
            const imgElement = document.createElement('img')
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
            let data = e.currentTarget.dataset
            this.renderTasks(data.project, 'today')
        })

        this.upcomingTaskButton.addEventListener('click', (e) => {
            let data = e.currentTarget.dataset
            this.renderTasks(data.project, 'upcoming')
        })

        this.projectDeleteButton.addEventListener('click', (e) => {
            const projectName = e.currentTarget.dataset.project;

            if (projectName === 'default') {
                const answer = confirm('The default project cannot be deleted.\nPress OK to reset it or Cancel to close.');
                if (answer === true) {
                    this.projectManager.resetProject(projectName);
                }
            } else {
                const answer = confirm(`Press OK to delete the project: "${projectName}".`);
                if (answer === true) {
                    this.projectManager.deleteProject(projectName);
                    this.render('default')              
                }
            }
        });

        this.createTaskButton.addEventListener('click', () => this.taskDialog.showModal())
        this.taskDialogClose.addEventListener('click', () => this.taskDialog.close())
        this.createProjectButton.addEventListener('click', () => this.projectDialog.showModal())
        this.projectDialogClose.addEventListener('click', () => this.projectDialog.close())
        this.taskFormButton.addEventListener('submit', (e) => this.handleTaskForm(e))
        this.projectFormButton.addEventListener('submit', (e) => this.handleProjectForm(e))
    }

    handleTaskForm(e){
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries());
        console.log(data)
        this.taskDialog.close()
        const projectName = data.project
        if (this.projectManager.projects.find(p => p.name == projectName)){
            let project = this.projectManager.projects.find(p => p.name == projectName)
            let date =  dateParse(data.date, 'yyyy-MM-dd', new Date())
            if (date < new Date()){
                alert('Tasks cant be made in past sorry')
                return
            }
            project.addTodo(data.title, data.desc, data.date, data.priority, data.notes) 
            this.projectManager.save()
            this.renderTasks(projectName, 'all')
            return
        }
        alert('project does not exists')
    }

    handleProjectForm(e){
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries());
        const projectName = data.title
        this.projectDialog.close()
        if (this.projectManager.projects.find(p => p.name == projectName)){
            alert('project already exists')
        }
        this.projectManager.createProject(projectName)
        this.render()
    }

    renderTaskSelection(){
        this.taskProjectSelection.innerHTML = ''
        for (const project  of this.projectManager.projects){
            const projectName = project.name
            const option = document.createElement('option')
            option.innerText= projectName
            option.value = projectName
            this.taskProjectSelection.appendChild(option)
        }
    }
}

const manager = new UiManager()
manager.init()
