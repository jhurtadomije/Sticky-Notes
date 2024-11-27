

function crearNota(content = "", timestamp = Date.now()) {
    const nota = document.createElement("div");
    nota.classList.add("nota");
    nota.setAttribute("draggable", "true");

    let fechaCreacion = new Date(timestamp);
    let fechaCreacionFormat = fechaCreacion.toLocaleString();
    let fechaModificacionFormat = fechaCreacionFormat; // Inicialmente igual a la fecha de creación

    nota.innerHTML = `<textarea class="espacioDeNotas">${content}</textarea>
                      <div class="fechas"> 
                        <div class="fechaCreacion">Creado: ${fechaCreacionFormat}</div> 
                        <div class="fechaModificacion">Modificado: ${fechaModificacionFormat}</div> 
                      </div>
                      <button class="borrar-nota">Eliminar</button>`;

    const textarea = nota.querySelector(".espacioDeNotas");
    const fechaModificacionElement = nota.querySelector(".fechaModificacion");

    // Actualizamos la fecha de modificación cuando el textarea se modifique
    textarea.addEventListener("input", () => {
        const nuevaFechaModificacion = new Date().toLocaleString();
        fechaModificacionElement.textContent = `Modificado: ${nuevaFechaModificacion}`;
        guardarNotas();
    });

    textarea.addEventListener("mouseup", () => {
        nota.style.width = `${textarea.offsetWidth}px`;
        nota.style.height = `${textarea.offsetHeight + 30}px`;
    });

    // Evento para eliminar la nota
    nota.querySelector(".borrar-nota").addEventListener("click", () => {
        nota.remove();
        guardarNotas();
    });

    nota.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.id);
        setTimeout(() => {
            nota.style.opacity = "0.5";
        }, 0);
    });

    nota.addEventListener("dragend", (e) => {
        nota.style.opacity = "1";
    });

    nota.id = `nota-${timestamp}`;
    return nota;
}


// Funcion que se encarga de evitar que las notas se superpongan unas con otras.
function obtenerPosicionNota() {
    const espacioNotas = document.querySelectorAll(".nota");

    //creamos la nota en una posicion inicial.
    let x = 20;
    let y = 20;

    //incrementamos la posicion para evitar que al crear una nueva, aparezca encima de la anterior
    espacioNotas.forEach(nota => {
        const coordNotas = nota.getBoundingClientRect(); // devuelve un objeto con información sobre el tamaño y posición de un elemento relativo a la ventana del navegador

                //comprobamos la posicion
        if(coordNotas.left === x && coordNotas.top === y) {
            x += 20; //incrementamos en el eje x y en el eje y
            y += 20;
        }

    });
    return {x, y};
}



// Función para guardar las notas en el LocalStorage
function guardarNotas() {
    const notas = [];
    document.querySelectorAll(".nota").forEach((nota) => {
        const textarea = nota.querySelector(".espacioDeNotas");
        const fechaCreacion = nota.querySelector(".fechaCreacion").textContent.split(": ")[1];
        const fechaModificacion = nota.querySelector(".fechaModificacion").textContent.split(": ")[1];
        const rect = nota.getBoundingClientRect();
        notas.push({
            content: textarea.value,
            left: rect.left,
            top: rect.top,
            fechaCreacion: fechaCreacion,
            fechaModificacion: fechaModificacion,
            id: nota.id
        });
    });
    localStorage.setItem("stickyNotes", JSON.stringify(notas));
}


// Función para cargar las notas desde el LocalStorage
function cargarNotas() {
    const notasGuardadas = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    notasGuardadas.forEach((datos) => {
        const nota = crearNota(datos.content, parseInt(datos.id.split('-')[1]));
        document.body.appendChild(nota);
        nota.style.position = "absolute";
        nota.style.left = `${datos.left}px`;
        nota.style.top = `${datos.top}px`;

        // Actualizar las fechas guardadas
        nota.querySelector(".fechaCreacion").textContent = `Creado: ${datos.fechaCreacion}`;
        nota.querySelector(".fechaModificacion").textContent = `Modificado: ${datos.fechaModificacion}`;
    });
}



function allowDrop(event) {
    event.preventDefault();
}

function drop(event){
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    const nota = document.getElementById(id);
    const x = event.clientX;
    const y = event.clientY;


    nota.style.position = "absolute";
    nota.style.left = `${x}px`;
    nota.style.top = `${y}px`;

    guardarNotas();
}


window.onload = function () {
    const agregarNota = document.getElementById("añadirNota");

    document.body.addEventListener("dragover", allowDrop);
    document.body.addEventListener("drop", drop);
    // Cargamos notas al iniciar la página
    cargarNotas();

    // Evento para añadir una nueva nota
    agregarNota.addEventListener("click", () => {
        const nota = crearNota("", Date.now());
        document.body.appendChild(nota);
        // Guardamos las notas solo después de añadir una nueva
        guardarNotas();
    });
};