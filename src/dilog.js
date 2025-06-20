const dialog = document.querySelector('.task-dialog')
const dialog2 = document.querySelector('.project-dialog')
const createTaskButton = document.querySelector('.create-task-button') 
const createTaskButton2 = document.querySelector('.create-project-button') 
const dialogProjectSelection = document.querySelector('select[name="project"')
const dialogClose = document.querySelector('.dialog-close')
const dialogClose2 = document.querySelector('.dialog-close2')
const form = document.querySelector("form#project-selection")
console.log(dialogProjectSelection)
// createTaskButton.addEventListener('click', (e) => {
//     console.log(e.target.dataset)
//     dialog.showModal()
// }
// )
// createTaskButton2.addEventListener('click', () => dialog2.showModal())

// dialogClose.addEventListener('click', () => {
//     dialog.close()
// })

// dialogClose2.addEventListener('click', () => {
//     dialog2.close()})
// form.addEventListener('submit', (e) => {
//     e.preventDefault()
//     const formData = new FormData(e.target)
//     const data = Object.fromEntries(formData.entries());
//     console.log(data)
//     dialog.close()
// })

export {form}