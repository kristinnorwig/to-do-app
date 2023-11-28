// globale Konstanten anlegen
const list = document.querySelector("#todo-list"); // <ul>
const currInput = document.querySelector("#new-todo"); // <input/> type=text
const addBtn = document.querySelector("#add-btn"); // <button>
const filterBtns = document.querySelectorAll('input[type="radio"]'); // alle input types=radio ansprechen querySelectorAll('input[type="radio"]')
const removeBtn = document.querySelector("#remove-btn"); // <button>
const all = document.querySelector("#all-checkbox"); // <input/> type=radio
const open = document.querySelector("#open-checkbox"); // <input/> type=radio
const done = document.querySelector("#done-checkbox"); // <input/> type=radio

// state anlegen (leeres Array)
let state = [];

// Funktion ausführen um API zu laden
getTodosFromAPI();

// todos aus api laden => später in addTodos() ausführen!!
function getTodosFromAPI() {
  //Netzwerkanfrage auf API URL
  fetch("http://localhost:4730/todos")
    // Verarbeitung der Antwort nach Anfrage, interpretation als JSON, enthält geparstes JSON
    // Fragen ob fetch ok, wenn ja return, wenn nein Error
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not OK");
      }
    })
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
    // neues todo in json-Format in body übergeben
    body: JSON.stringify(newTodo),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not OK");
      }
    })
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

function removeFromAPI(id) {
  // id ist der Parameter, später wird Argument mitgegeben todoID in removeDoneTodos()
  return fetch("http://localhost:4730/todos/" + id, {
    // Fetch wird durch das RETURN nach außen gegeben für removeDoneTodos()
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not OK");
      }
    })
    .then(() => {})
    .catch((error) => {
      alert(error.message);
    });
}

// Todos aus Array mit HTML "verknüpfen", mit Funktion JS "sichtbar machen"
function renderTodos() {
  list.innerHTML = "";

  for (const todo of state) {
    let newTodoLi = document.createElement("li");
    let checkbox = document.createElement("input");
    //Klasse vergeben
    checkbox.setAttribute = ("class", "todo-checkbox");
    // type festlegen
    checkbox.type = "checkbox";

    // checked attribute mit key done verbinden
    checkbox.checked = todo.done;

    // Veränderung des Checkbox Status festhalten mit event auf Checkbox, Event-Listener für Änderungen am "done"-Status
    checkbox.addEventListener("change", checkDoneState);

    function checkDoneState(event) {
      // neue const mit info ob geklickte Checkbox angehakt oder nicht
      const todoDoneState = event.target.checked;
      // aktualisierung des todo.done aus state (angehakt = true, andernfalls = false)
      todo.done = todoDoneState;
      console.log(todoDoneState);

      // update todo an API, todo als Argument
      updateTodoToAPI(todo);
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
  const description = currInput.value;

  //Prüfe auf leere Eingabe im input-Feld
  if (description === "") {
    alert("Bitte Beschreibung eingeben!");
    return;
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

  if (isDoubled) {
    alert("Aufgabe existiert bereits!");
    return;
  }

  // Neues Todo-Objekt erstellen und in bestehendes Array pushen
  const newTodo = {
    description: description,
    done: false,
  };

  state.push(newTodo);

  currInput.value = "";

  renderTodos();

  // newTodo in API funktion als Parameter übergeben
  addTodoToAPI(newTodo);
}

// Funktion addTodo auf Button ausführen
addBtn.addEventListener("click", addTodo);

// remove Button  Event auslösen
removeBtn.addEventListener("click", removeDoneTodos);

// Remove done todos function
function removeDoneTodos() {
  const openTodos = [];
  const deleteTodos = [];
  const fetches = [];

  // alle Todos des states durchgehen und abfragen ob nicht abgehakt, dann in neues openTodos pushen, wenn abgehackt dann in deleteTodos
  for (const todo of state) {
    if (todo.done === false) {
      openTodos.push(todo);
    } else {
      deleteTodos.push(todo);
    }
  }

  // alles in deleteTodos in array mit Funktion fetchen
  for (const todo of deleteTodos) {
    const todoID = todo.id;
    fetches.push(removeFromAPI(todoID)); // todoID ist Argument
  }

  // Ansammlung von API Fetches in Arrays, wenn alle promises erfüllt wurden wird methode aufgerufen und array values gespeichert
  Promise.all(fetches).then((values) => {
    // wenn undefined nicht da ist (!= -1 bedeutet index -1 = gibt es nicht)
    if (values.indexOf(undefined) != -1) {
      console.log(values);
      state = openTodos;
      renderTodos();
    }
  });
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
    // Zeige nur offene Todos, die filter Methode filtert alle !todo.done also mit Wert false
    filteredTodos = state.filter(function (todo) {
      return !todo.done;
    });

    // Wenn button done ist checked
  } else if (done.checked) {
    // Zeige nur erledigte Todos, die filter Methode filtert alle todo.done also mit Wert true
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

// schleife um alle radio buttons anzusehen und zu checken ob einer aktiv ist, sodass nur ein Btn aktiv sein kann
for (const oneBtn of filterBtns) {
  // Event-Listener für die Filter-Radio-Buttons
  oneBtn.addEventListener("change", function () {
    // Deaktiviere alle anderen Radio-Button
    for (const otherBtn of filterBtns) {
      // wenn der andere aktive radio button nicht der geklickte radio button ist, dann stelle checked auf false
      if (otherBtn !== oneBtn) {
        otherBtn.checked = false;
      }
    }

    filterTodos();
  });
}
