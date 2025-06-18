import "./reset.css"
import "./styles.css"

import "./dilog.js"

import { parse as dateParse } from "date-fns"
// Classes:
// - Todo
//   - properties: title, desc, date, priority[high, low, medium color based], notes, checklist[]
//   - methods: markDone(), edit(), export()

// - Project
//   - properties: name, todos[]
//   - methods: addTodo(), deleteTodo(), export()

// Modules:
// - Logic Module
//   - create/edit/delete todos & projects

// - UI Module
//   - display projects, todos, and forms
// make a commit befor js