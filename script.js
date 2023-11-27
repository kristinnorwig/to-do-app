// state anlegen für spätere Arbeit mit Backend-Daten

let state;

//lade LocalStorage
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
}

showTodos();

// Todos aus Array mit HTML "verknüpfen" mit Funktion = JS sichtbar machen
function showTodos() {
  const list = document.querySelector("#todo-list"); // <ul>
  list.innerHTML = "";

  for (const todo of state.todos) {
    const newTodoLi = document.createElement("li");

    const checkbox = document.createElement("input");
    //Klasse vergeben
    checkbox.setAttribute = ("class", "todo-checkbox");
    // type festlegen
    checkbox.type = "checkbox";

    // checked atrribute mit key done verbinden
    checkbox.checked = todo.done;

    // Veränderung des Checkbox Status festhalten mit event auf Checkbox, Event-Listener für Änderungen am "done"-Status
    checkbox.addEventListener("change", function (event) {
      const todoDoneState = event.target.checked;
      todo.done = todoDoneState;
      localStorage.setItem("state", JSON.stringify(state)); // neue done Eigenschaft in localStorage speichern
    });

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

showTodos();

function addTodo(event) {
  event.preventDefault(); // Wegen <form>
  const currInput = document.querySelector("#new-todo");
  const description = currInput.value;

  // Prüfe auf leere Eingabe im input-Feld
  if (description === "") {
    alert("Bitte  Beschreibung eingeben!");
    return;
  }

  // Prüfung auf doppelte Eingabe, ist Todo bereits vorhanden?
  function isDescrDoubled(currInput) {
    for (const todo of state.todos) {
      // alle einträge anschauen und mit input vergleichen case-insenstitive!!
      if (todo.description.toLowerCase() === currInput.toLowerCase()) {
        return true; // Duplikat gefunden
      }
    }
    return false; // Kein Duplikat gefunden
  }

  const isDoubled = isDescrDoubled(description); // Konstante für Funktion mit description (=currInput.value) des todos als Parameter

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

  state.todos.push(newTodo);

  localStorage.setItem("state", JSON.stringify(state));

  currInput.value = "";

  showTodos();
}

// Funktion addTodo auf Button ausführen
const addBtn = document.querySelector("#add-btn");
addBtn.addEventListener("click", addTodo);

//Variable für Erstellung der ID, nach oben Zählen
let idCounter = 0;

function idGenerator() {
  return idCounter++;
}

// Remove done todos function
const removeBtn = document.querySelector("#remove-btn");
removeBtn.addEventListener("click", removeDoneTodos);

function removeDoneTodos() {
  const openTodos = [];

  // alle Todos des states durchgehen
  for (const todo of state.todos) {
    if (todo.done === false) {
      openTodos.push(todo);
    }
  }

  state.todos = openTodos;

  localStorage.setItem("state", JSON.stringify(state));

  showTodos();
}

//Filter function
function filterTodos() {
  // alle radio buttons ansprechen
  const all = document.querySelector("#all-checkbox");
  const open = document.querySelector("#open-checkbox");
  const done = document.querySelector("#done-checkbox");

  // variable für gefilterte Todos erstellen
  let filteredTodos;

  // Wenn button all ist checked
  if (all.checked) {
    // Zeige alle Todos
    filteredTodos = state.todos;

    // Wenn button open ist checked
  } else if (open.checked) {
    // Zeige nur offene Todos
    filteredTodos = state.todos.filter(function (todo) {
      return !todo.done;
    });

    // Wenn button done ist checked
  } else if (done.checked) {
    // Zeige nur erledigte Todos
    filteredTodos = state.todos.filter(function (todo) {
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
      localStorage.setItem("state", JSON.stringify(state));
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

// alle input types=radio ansprechen querySelectorAll('input[type="radio"]')
const filterRadioButtons = document.querySelectorAll('input[type="radio"]');

// schleife um alle radio buttons anzusehen und zu checken ob einer aktiv ist
for (const radioButton of filterRadioButtons) {
  // Event-Listener für die Filter-Radio-Buttons
  radioButton.addEventListener("change", function () {
    // Deaktiviere alle anderen Radio-Button
    for (const otherRadioButton of filterRadioButtons) {
      // wenn der andere aktive radio button nicht der geklickte radio button ist, dann stelle checked auf false
      if (otherRadioButton !== radioButton) {
        otherRadioButton.checked = false;
      }
    }

    filterTodos();
  });
}
