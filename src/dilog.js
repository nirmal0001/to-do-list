const dialog = document.querySelector('.task-dialog')
const createTaskButton = document.querySelector('.create-task-button') 
const dialogProjectSelection = document.querySelector('select[name="project"')
const dialogClose = document.querySelector('.dialog-close')
const form = document.querySelector("form#project-selection")
console.log(dialogProjectSelection)
createTaskButton.addEventListener('click', (e) => {
    console.log(e.target.dataset)
    dialog.showModal()
}
)

dialogClose.addEventListener('click', () => dialog.close())

// form.addEventListener('submit', (e) => {
//     e.preventDefault()
//     const formData = new FormData(e.target)
//     const data = Object.fromEntries(formData.entries());
//     console.log(data)
//     dialog.close()
// })

export {form}