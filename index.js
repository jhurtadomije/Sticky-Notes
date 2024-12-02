function crearNota(title = "Sin Título", content = "", timestamp = Date.now()) {
    const nota = document.createElement("div");
    nota.classList.add("nota");
    nota.setAttribute("draggable", "true");

    const fechaCreacion = new Date(timestamp);
    const fechaCreacionFormat = fechaCreacion.toLocaleString();
    const fechaModificacionFormat = fechaCreacionFormat; // Inicialmente igual a la fecha de creación

    nota.innerHTML = `<input type="text" class="tituloDeNotas" value="${title}" placeholder="Título">
                      <textarea class="espacioDeNotas">${content}</textarea>
                      <div class="fechas"> 
                        <div class="fechaCreacion">Creado: ${fechaCreacionFormat}</div> 
                        <div class="fechaModificacion">Modificado: ${fechaModificacionFormat}</div> 
                        <div class="tiempoTranscurrido">Tiempo transcurrido: 0 minutos</div>
                      </div>
                      <button class="borrar-nota">Eliminar</button>`;

    const textarea = nota.querySelector(".espacioDeNotas");
    const titulo = nota.querySelector(".tituloDeNotas");
    const fechaModificacionElement = nota.querySelector(".fechaModificacion");
    const tiempoTranscurridoElement = nota.querySelector(".tiempoTranscurrido");

    // Actualizamos la fecha de modificación cuando el textarea o el título se modifiquen
    const actualizarFechaModificacion = () => {
        const nuevaFechaModificacion = new Date().toLocaleString();
        fechaModificacionElement.textContent = `Modificado: ${nuevaFechaModificacion}`;
        guardarNotas();
    };

    textarea.addEventListener("input", actualizarFechaModificacion);
    titulo.addEventListener("input", actualizarFechaModificacion);

    // Evento para ajustar el tamaño de la nota
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

    // Actualizamos el tiempo transcurrido desde la creación
    const actualizarTiempoTranscurrido = () => {
        const ahora = new Date();
        const minutosTranscurridos = Math.floor((ahora - fechaCreacion) / 60000);
        tiempoTranscurridoElement.textContent = `Tiempo transcurrido: ${minutosTranscurridos} minutos`;
    };

    actualizarTiempoTranscurrido();
    setInterval(actualizarTiempoTranscurrido, 60000); // Actualiza cada minuto

    nota.id = `nota-${timestamp}`;
    return nota;
}

// Función para guardar las notas en el LocalStorage
function guardarNotas() {
    const notas = [];
    document.querySelectorAll(".nota").forEach((nota) => {
        const titulo = nota.querySelector(".tituloDeNotas").value;
        const textarea = nota.querySelector(".espacioDeNotas").value;
        const fechaCreacionElement = nota.querySelector(".fechaCreacion");
        const fechaModificacionElement = nota.querySelector(".fechaModificacion");

        if (!fechaCreacionElement || !fechaModificacionElement) {
            console.warn('Falta el elemento de fecha en la nota:', nota);
            return;
        }

        const fechaCreacion = fechaCreacionElement.textContent.split(": ")[1] || new Date().toLocaleString();
        const fechaModificacion = fechaModificacionElement.textContent.split(": ")[1] || new Date().toLocaleString();
        const rect = nota.getBoundingClientRect();

        notas.push({
            titulo: titulo,
            contenido: textarea,
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
        if (!datos.titulo || !datos.contenido || !datos.id || !datos.left || !datos.top) {
            console.warn('Datos incompletos:', datos);
            return;
        }

        const nota = crearNota(datos.titulo, datos.contenido, parseInt(datos.id.split('-')[1]));
        document.body.appendChild(nota);
        nota.style.position = "absolute";
        nota.style.left = `${datos.left}px`;
        nota.style.top = `${datos.top}px`;

        // Actualizar las fechas guardadas, asegurarse de que las fechas existen antes de acceder a ellas
        if (datos.fechaCreacion && datos.fechaModificacion) {
            nota.querySelector(".fechaCreacion").textContent = `Creado: ${datos.fechaCreacion}`;
            nota.querySelector(".fechaModificacion").textContent = `Modificado: ${datos.fechaModificacion}`;
        } else {
            console.warn(`Datos incompletos para la nota con id ${datos.id}`);
            nota.querySelector(".fechaCreacion").textContent = `Creado: Desconocido`;
            nota.querySelector(".fechaModificacion").textContent = `Modificado: Desconocido`;
        }
    });
}

// Función para permitir el arrastre de notas
function allowDrop(event) {
    event.preventDefault();
}

// Función para soltar notas en una nueva posición
function drop(event) {
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

// Inicialización de la aplicación
window.onload = function () {
    const agregarNota = document.getElementById("añadirNota");

    document.body.addEventListener("dragover", allowDrop);
    document.body.addEventListener("drop", drop);

    // Cargamos notas al iniciar la página
    cargarNotas();

    // Evento para añadir una nueva nota
    agregarNota.addEventListener("click", () => {
        const nota = crearNota("Sin Título", "", Date.now());
        document.body.appendChild(nota);
        // Guardamos las notas solo después de añadir una nueva
        guardarNotas();
    });
};
