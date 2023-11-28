// globale Konstanten anlegen
const list = document.querySelector("#todo-list"); // <ul>
const currInput = document.querySelector("#new-todo");
const description = currInput.value;
const addBtn = document.querySelector("#add-btn");
const filterButtons = document.querySelectorAll('input[type="radio"]'); // alle input types=radio ansprechen querySelectorAll('input[type="radio"]')
const removeBtn = document.querySelector("#remove-btn");
const all = document.querySelector("#all-checkbox");
const open = document.querySelector("#open-checkbox");
const done = document.querySelector("#done-checkbox");

//Variable für Erstellung der ID, nach oben Zählen
let idCounter = 0;

// state anlegen
let state = [];
getTodosFromAPI();

// todos aus api laden
function getTodosFromAPI() {
  fetch("http://localhost:4730/todos")
    .then((request) => request.json())
    // wenn geladen dann zeig die todos aus dem state (state sind geladene jsonData)
    .then((jsonData) => {
      // console.log(jsonData);
      state = jsonData;
      renderTodos();
    });
}

function addTodoToAPI(newTodo) {
  fetch("http://localhost:4730/todos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    // neues todo als json in body übergeben
    body: JSON.stringify(newTodo),
  })
    .then((response) => response.json())
    .then((jsonData) => {
      getTodosFromAPI();
    });
}

function updateTodoToAPI(updatedTodo) {
  const todoID = updatedTodo.id;
  fetch("http://localhost:4730/todos/" + todoID, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(updatedTodo),
  })
    .then((response) => response.json())
    .then((jsonData) => {
      console.log(jsonData);
      renderTodos();
    });
}

/*// lade LocalStorage
if (localStorage.getItem("state")) {
  state = JSON.parse(localStorage.getItem("state"));
} else {
  // wenn der LocalStorage leer ist, zeige folgendes an
  state = {
    todos: [
      { description: "Einkaufen", done: true, id: 1 },
      { description: "Putzen", done: false, id: 2 },
    ],
  };
}*/

// Todos aus Array mit HTML "verknüpfen" mit Funktion JS sichtbar machen
function renderTodos() {
  list.innerHTML = "";

  for (const todo of state) {
    const newTodoLi = document.createElement("li");
    const checkbox = document.createElement("input");
    //Klasse vergeben
    checkbox.setAttribute = ("class", "todo-checkbox");
    // type festlegen
    checkbox.type = "checkbox";

    // checked atrribute mit key done verbinden
    checkbox.checked = todo.done;

    // Veränderung des Checkbox Status festhalten mit event auf Checkbox, Event-Listener für Änderungen am "done"-Status
    checkbox.addEventListener("change", checkDoneState);

    function checkDoneState(event) {
      // neue const mit info ob geklickte Checkbox angehakt oder nicht
      const todoDoneState = event.target.checked;
      // aktualisierung des todo.done aus state (angehakt = true, andernfalls = false)
      todo.done = todoDoneState;
      console.log(todoDoneState);

      // todo an API
      updateTodoToAPI(todo);
      // localStorage.setItem("state", JSON.stringify(state)); // neue done Eigenschaft in localStorage speichern
    }

    const label = document.createElement("label");
    label.textContent = todo.description;
    label.setAttribute("for", todo.id);
    label.setAttribute("class", "todo");

    // checkbox in li anlegen
    newTodoLi.appendChild(checkbox);

    newTodoLi.appendChild(label);

    // neues li in ul einfügen
    list.appendChild(newTodoLi);
  }
}

renderTodos();

function addTodo(event) {
  event.preventDefault(); // Wegen <form>

  // Prüfe auf leere Eingabe im input-Feld
  if (description === "") {
    alert("Bitte Beschreibung eingeben!");
    return;
  }

  if (isDoubled) {
    alert("Aufgabe existiert bereits!"); //error, warn => kein Pop-up
    return;
  }

  // Neues Todo-Objekt erstellen und in bestehendes Array pushen
  const newTodo = {
    description: description,
    done: false,
    id: idGenerator(),
  };

  state.push(newTodo);

  // localStorage.setItem("state", JSON.stringify(state));

  currInput.value = "";

  renderTodos();

  // newTodo in API funktion als Parameter übergeben
  addTodoToAPI(newTodo);
}

// Prüfung auf doppelte Eingabe, ist Todo bereits vorhanden?
function isDescrDoubled(currInput) {
  for (const todo of state) {
    // alle einträge anschauen und mit input vergleichen case-insenstitive!!
    if (todo.description.toLowerCase() === currInput.toLowerCase()) {
      return true; // Duplikat gefunden
    }
  }
  return false; // Kein Duplikat gefunden
}

const isDoubled = isDescrDoubled(description); // Konstante für Funktion mit description (=currInput.value) des todos als Parameter

// Funktion addTodo auf Button ausführen
addBtn.addEventListener("click", addTodo);

// Funktion um ID zu generieren
function idGenerator() {
  return idCounter++;
}

// remove Button  Event auslösen
removeBtn.addEventListener("click", removeDoneTodos);

// Remove done todos function
function removeDoneTodos() {
  const openTodos = [];

  // alle Todos des states durchgehen
  for (const todo of state) {
    if (todo.done === false) {
      openTodos.push(todo);
    }
  }

  state = openTodos;

  // localStorage.setItem("state", JSON.stringify(state));

  renderTodos();
}

//Filter function
function filterTodos() {
  // alle radio buttons ansprechen

  // variable für gefilterte Todos erstellen
  let filteredTodos;

  // Wenn button all ist checked
  if (all.checked) {
    // Zeige alle Todos
    filteredTodos = state;

    // Wenn button open ist checked
  } else if (open.checked) {
    // Zeige nur offene Todos
    filteredTodos = state.filter(function (todo) {
      return !todo.done;
    });

    // Wenn button done ist checked
  } else if (done.checked) {
    // Zeige nur erledigte Todos
    filteredTodos = state.filter(function (todo) {
      return todo.done;
    });
  }

  // Aktualisiere die Anzeige mit den gefilterten Todos, Variable als Parameter mitgeben
  showFilteredTodos(filteredTodos);
}

//function wie addTodos um gefilterte Todos zu zeigen => Parameter mitgeben
function showFilteredTodos(filteredTodos) {
  const list = document.querySelector("#todo-list");
  list.innerHTML = "";

  for (const todo of filteredTodos) {
    const newTodoLi = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;

    checkbox.addEventListener("change", function (event) {
      const todoDoneState = event.target.checked;
      todo.done = todoDoneState;
      //localStorage.setItem("state", JSON.stringify(state));
      filterTodos(); // Filtern erneut aufrufen, um die Anzeige zu aktualisieren
    });

    const label = document.createElement("label");
    label.textContent = todo.description;
    label.setAttribute("for", todo.id);
    label.setAttribute("class", "todo");

    newTodoLi.appendChild(checkbox);
    newTodoLi.appendChild(label);

    list.appendChild(newTodoLi);
  }
}

// schleife um alle radio buttons anzusehen und zu checken ob einer aktiv ist
for (const oneButton of filterButtons) {
  // Event-Listener für die Filter-Radio-Buttons
  oneButton.addEventListener("change", function () {
    // Deaktiviere alle anderen Radio-Button
    for (const otherButton of filterButtons) {
      // wenn der andere aktive radio button nicht der geklickte radio button ist, dann stelle checked auf false
      if (otherButton !== oneButton) {
        otherButton.checked = false;
      }
    }

    filterTodos();
  });
}
