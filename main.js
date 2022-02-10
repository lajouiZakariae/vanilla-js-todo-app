/**
 * HELPERS
 */
function _select(selecor, all = false) {
  return all
    ? [].slice.call(document.querySelectorAll(selecor))
    : document.querySelector(selecor);
}
function _create(tag) {
  return document.createElement(tag);
}
function _button(btnClass, content = "") {
  let button = _create("button");
  button.className = `btn btn-${btnClass}`;
  button.textContent = content;
  return button;
}

/* LocalStorage Actions */
function getLocal(key = "todos") {
  return JSON.parse(localStorage.getItem(key));
}
function saveLocal(key = "todos", data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function clearLocal(key = "todos") {
  localStorage.setItem(key, "[]");
}

/**
 * The @function renderTodo creates a card component (styled by bootstrap)
 * icluding two buttons , attache the events and pass the id todo's id (one for editing, one for deleting)
 *
 * @param {HTMLElement} container
 * @param {object} param1
 */
/* RENDERING UI ELEMENTS */
function renderTodo(container, { title, todoId }) {
  let card = _create("div");
  card.className = "card border rounded mx-auto w-75 p-2 mb-2";

  let cardBody = _create("div");
  cardBody.className = "card-body";
  let cardText = _create("p");
  cardText.textContent = title;
  cardBody.append(cardText);

  let cardFooter = _create("div");
  cardFooter.className = "card-footer";

  let deleteButton = _button("danger", "delete");
  deleteButton.onclick = () => deleteEvent(todoId);
  let editButton = _button("info ml-2", "edit");
  editButton.onclick = function () {
    editEvent(this, this.parentElement.parentElement.children[0], todoId);
  };

  cardFooter.append(deleteButton);
  cardFooter.append(editButton);

  card.append(cardBody);
  card.append(cardFooter);

  container.append(card);
}

/**
 * @function renderTodos takes a localStorage key as a parameter
 * to define wich list (array) of todos to render
 * @param {string} target
 */
function renderTodos(target = "todos") {
  let container = _select(".todos-list"); //- Todos Container
  let todos = getLocal(target); // fetch All todos from

  for (let todo of todos) {
    renderTodo(container, todo); // render each element
  }
}

/**
 * @function clearTodos Removes the todos from the DOM
 */
function clearTodos() {
  let children = [].slice.call(_select(".todos-list").children);
  for (let child of children) {
    _select(".todos-list").removeChild(child);
  }
}

function rerenderTodos(target = "todos", data) {
  saveLocal(target, data);
  clearTodos();
  renderTodos(target);
}

// Program Initialize
if (!getLocal()) {
  saveLocal("todos", []);
}

let todos = getLocal();

if (todos.length) {
  renderTodos(); // Render only if at least one todo exists
} else {
  disableSearchInput(true);
}

function disableSearchInput(cond) {
  if (cond) {
    _select("#searchInput").disabled = true;
  } else {
    _select("#searchInput").disabled = false;
  }
}

// Attach Event Listeners
_select(".btn-danger").onclick = function () {
  clearTodos();
  clearLocal();
  _select("#searchInput").value = "";
  disableSearchInput(true);
};

_select("#addTodo").onsubmit = function (ev) {
  ev.preventDefault();

  let todo = {
    title: this.title.value,
    todoId: Math.floor(Math.random() * 10000),
  };
  this.title.value = "";
  let todos = getLocal();
  disableSearchInput(false);
  rerenderTodos("todos", [...todos, todo]);
};

function deleteEvent(id) {
  let todos = getLocal();

  let filteredTodos = todos.filter(({ todoId }) => todoId != id);
  if (!filteredTodos.length) disableSearchInput(true);
  rerenderTodos("todos", filteredTodos);
}
/**
 *
 * @param {} id
 * @param {*} button
 * @param {*} cardBody
 */
function editEvent(button, cardBody, id) {
  let content = cardBody.textContent;
  let input = _create("input");
  input.className = "form-control";
  input.value = content;

  let validateButton = _button("success ml-2", "Valid");

  cardBody.parentElement.replaceChild(input, cardBody);
  let editButton = button.parentElement.replaceChild(validateButton, button);

  validateButton.onclick = function () {
    validateEvent(this, editButton, cardBody, input, id);
  };
}
/**
 * @function validateEvent takes 5 arguments :)
 * the first two are the validate button and the edit button
 * in order to switch between them to edit the title
 * the third parameter is the cardBody of the post and th forth is the input
 * on the edit mode the function replace the input (after retrieving the value) with the cardBody,
 * and the validate button with the edit button.
 * the last argument is the id of the todo that needs to be updated.
 * @param {HTMLButtonElement} mainButton
 * @param {HTMLButtonElement} editButton
 * @param {HTMLDivElement} div
 * @param {HTMLInputElement} input
 * @param {number} id
 */
function validateEvent(mainButton, editButton, div, input, id) {
  div.textContent = input.value;
  input.parentElement.replaceChild(div, input);
  mainButton.parentElement.replaceChild(editButton, mainButton);

  let todos = getLocal();
  let editedTodos = todos.map((todo) => {
    if (todo.todoId == id) {
      todo.title = input.value;
      return todo; // Edited!
    } else {
      return todo;
    }
  });

  rerenderTodos("todos", editedTodos);
}

/* fliter the todos and save it on search LocalStorage */
_select("#searchInput").onkeyup = function (ev) {
  if (!localStorage.getItem("search")) {
    localStorage.setItem("search", "[]");
  }

  if (!this.value) {
    clearTodos();
    renderTodos();
  } else {
    let todos = getLocal();
    let searchResult = todos.filter(({ title }) => title.includes(this.value));

    rerenderTodos("search", searchResult);
  }
};
