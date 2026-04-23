const API_MIEMBROS = 'http://localhost:3000/api/miembros';
const API_EVENTOS = 'http://localhost:3000/api/eventos';

const formRegistro = document.getElementById('formRegistro');
const listaMiembros = document.getElementById('listaMiembros');
const btnSubmit = document.getElementById('btnSubmit');
const inputId = document.getElementById('miembroId');

const formEvento = document.getElementById('formEvento');
const listaEventos = document.getElementById('listaEventos');
const participantesDiv = document.getElementById('participantesCheckboxes');
const eventoIdHidden = document.getElementById('eventoId');
const btnRegistrarEvento = document.getElementById('btnRegistrarEvento');
const btnCancelarEdicionEvento = document.getElementById('btnCancelarEdicionEvento');

flatpickr("#fechaNacimiento", {
    dateFormat: "Y-m-d",
    locale: "es",
    altInput: true,
    altFormat: "d/m/Y",
    allowInput: true,
    maxDate: new Date()
});

async function cargarMiembros() {
    try {
        const respuesta = await fetch(API_MIEMBROS);
        const miembros = await respuesta.json();
        listaMiembros.innerHTML = '';
        if (miembros.length === 0) {
            listaMiembros.innerHTML = '<p class="text-center text-gray-400">No hay miembros registrados.</p>';
            return;
        }
        miembros.forEach(miembro => {
            const nombreCompleto = `${miembro.nombre || ''} ${miembro.apellido_paterno || ''} ${miembro.apellido_materno || ''}`.trim();
            const fechaNac = miembro.fecha_nacimiento ? new Date(miembro.fecha_nacimiento).toLocaleDateString('es-ES') : 'No especificada';
            const card = document.createElement('div');
            card.className = 'member-card bg-white/5 border border-white/10 rounded-lg p-5 transition-all hover:bg-white/10';
            card.innerHTML = `
                <h3 class="text-xl font-bold mb-1">${nombreCompleto}</h3>
                <p class="text-gray-400 text-xs uppercase tracking-wider mb-2">${miembro.rol || ''}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Correo:</span> ${miembro.correo || ''}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Teléfono:</span> ${miembro.telefono || 'No especificado'}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Fecha Nac.:</span> ${fechaNac}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Género:</span> ${miembro.genero || 'No especificado'}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Institución:</span> ${miembro.institucion || 'No especificado'}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">No. Control:</span> ${miembro.numero_control || 'No especificado'}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Carrera:</span> ${miembro.carrera || 'No especificado'}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Semestre:</span> ${miembro.semestre || 'No especificado'}</p>
                <p class="text-gray-300 text-sm"><span class="text-gray-500">Año Ingreso:</span> ${miembro.anio_ingreso || 'No especificado'}</p>
                <div class="flex gap-3 mt-4">
                    <button class="btn-edit flex-1 bg-white text-black py-2 rounded text-xs font-semibold hover:opacity-80 transition" onclick="prepararEdicion(${miembro.id})">Editar</button>
                    <button class="btn-delete flex-1 bg-transparent border border-white text-white py-2 rounded text-xs font-semibold hover:bg-red-600 hover:border-red-600 transition" onclick="eliminarMiembro(${miembro.id})">Eliminar</button>
                </div>
            `;
            listaMiembros.appendChild(card);
        });
        cargarParticipantesCheckboxes();
    } catch (error) {
        console.error("Error de comunicación:", error);
    }
}

async function cargarParticipantesCheckboxes() {
    try {
        const respuesta = await fetch(API_MIEMBROS);
        const miembros = await respuesta.json();
        if (miembros.length === 0) {
            participantesDiv.innerHTML = '<p class="text-gray-400 text-sm">No hay miembros registrados aún.</p>';
            return;
        }
        let html = '';
        miembros.forEach(m => {
            const nombreCompleto = `${m.nombre || ''} ${m.apellido_paterno || ''} ${m.apellido_materno || ''}`.trim();
            html += `
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" value="${m.id}" class="participante-checkbox w-4 h-4">
                    <span>${nombreCompleto} (${m.rol || ''})</span>
                </label>
            `;
        });
        participantesDiv.innerHTML = html;
    } catch (error) {
        console.error("Error al cargar miembros para participantes:", error);
        participantesDiv.innerHTML = '<p class="text-red-400 text-sm">Error cargando miembros</p>';
    }
}

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = inputId.value;
    const telefono = document.getElementById('telefono').value;
    if (!/^\d{10}$/.test(telefono)) {
        alert('El teléfono debe contener exactamente 10 dígitos numéricos.');
        return;
    }
    const numControl = document.getElementById('numeroControl').value;
    if (!/^\d{8,9}$/.test(numControl)) {
        alert('El número de control debe tener 8 o 9 dígitos numéricos.');
        return;
    }
    
    // Convertir a mayúsculas todos los campos de texto (excepto correo)
    const datosMiembro = {
        nombre: document.getElementById('nombre').value.toUpperCase(),
        apellido_paterno: document.getElementById('apellidoPaterno').value.toUpperCase(),
        apellido_materno: document.getElementById('apellidoMaterno').value.toUpperCase(),
        correo: document.getElementById('correo').value, // correo se mantiene como se escribe
        telefono: telefono,
        fecha_nacimiento: document.getElementById('fechaNacimiento').value,
        genero: document.getElementById('genero').value.toUpperCase(),
        institucion: document.getElementById('institucion').value.toUpperCase(),
        numero_control: numControl,
        carrera: document.getElementById('carrera').value.toUpperCase(),
        semestre: document.getElementById('semestre').value.toUpperCase(),
        anio_ingreso: document.getElementById('anioIngreso').value,
        rol: document.getElementById('rol').value.toUpperCase()
    };
    try {
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_MIEMBROS}/${id}` : API_MIEMBROS;
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosMiembro)
        });
        if (respuesta.ok) {
            alert(id ? '¡Registro actualizado!' : '¡Tripulante registrado!');
            resetearFormulario();
            cargarMiembros();
        } else {
            const error = await respuesta.json();
            alert('Error: ' + error.mensaje);
        }
    } catch (error) {
        console.error("Fallo en la transmisión:", error);
        alert('Error de conexión con el servidor');
    }
});

window.prepararEdicion = async (id) => {
    try {
        const respuesta = await fetch(`${API_MIEMBROS}/${id}`);
        const miembro = await respuesta.json();
        inputId.value = miembro.id;
        // Al cargar para editar, mostramos los valores actuales (ya están en mayúsculas)
        document.getElementById('nombre').value = miembro.nombre || '';
        document.getElementById('apellidoPaterno').value = miembro.apellido_paterno || '';
        document.getElementById('apellidoMaterno').value = miembro.apellido_materno || '';
        document.getElementById('correo').value = miembro.correo || '';
        document.getElementById('telefono').value = miembro.telefono || '';
        document.getElementById('fechaNacimiento').value = miembro.fecha_nacimiento || '';
        document.getElementById('genero').value = miembro.genero || '';
        document.getElementById('institucion').value = miembro.institucion || '';
        document.getElementById('numeroControl').value = miembro.numero_control || '';
        document.getElementById('carrera').value = miembro.carrera || '';
        document.getElementById('semestre').value = miembro.semestre || '';
        document.getElementById('anioIngreso').value = miembro.anio_ingreso || '';
        document.getElementById('rol').value = miembro.rol || '';
        btnSubmit.innerText = 'Confirmar Cambios';
        btnSubmit.classList.add('bg-black', 'text-white', 'border-white');
        btnSubmit.classList.remove('bg-white', 'text-black');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error("Error al cargar miembro para editar:", error);
        alert('No se pudo cargar los datos del miembro');
    }
};

window.eliminarMiembro = async (id) => {
    if (confirm("¿Confirmas la eliminación?")) {
        try {
            const respuesta = await fetch(`${API_MIEMBROS}/${id}`, { method: 'DELETE' });
            if (respuesta.ok) {
                cargarMiembros();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
};

function resetearFormulario() {
    formRegistro.reset();
    inputId.value = '';
    btnSubmit.innerText = 'Registrar en Polaris';
    btnSubmit.classList.add('bg-white', 'text-black');
    btnSubmit.classList.remove('bg-black', 'text-white', 'border-white');
}

async function cargarEventos() {
    try {
        const respuesta = await fetch(API_EVENTOS);
        const eventos = await respuesta.json();
        const resMiembros = await fetch(API_MIEMBROS);
        const miembros = await resMiembros.json();
        listaEventos.innerHTML = '';
        if (eventos.length === 0) {
            listaEventos.innerHTML = '<p class="text-center text-gray-400">No hay eventos registrados aún.</p>';
            return;
        }
        eventos.forEach(evento => {
            const fechaInicio = new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            const fechaFin = new Date(evento.fecha_fin).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            const participantesNombres = evento.participantes.map(id => {
                const miembro = miembros.find(m => m.id === id);
                if (miembro) {
                    const nombreCompleto = `${miembro.nombre || ''} ${miembro.apellido_paterno || ''} ${miembro.apellido_materno || ''}`.trim();
                    return `${nombreCompleto} (${miembro.rol || ''})`;
                }
                return `ID ${id}`;
            }).join(', ');
            const card = document.createElement('div');
            card.className = 'bg-white/5 border border-white/10 rounded-lg p-5';
            card.innerHTML = `
                <h3 class="text-xl font-bold mb-2">${evento.nombre.toUpperCase()}</h3>
                <div class="mb-3">
                    <span class="event-badge">${evento.tipo.toUpperCase()}</span>
                    <span class="event-badge ${evento.estado === 'abierto' ? 'event-status-abierto' : 'event-status-cerrado'}">
                        ${evento.estado === 'abierto' ? '✅ ABIERTO' : '🔒 CERRADO'}
                    </span>
                </div>
                <p class="text-sm text-gray-300 mb-2">📅 ${fechaInicio} → ${fechaFin}</p>
                <p class="mb-3">${evento.descripcion || 'Sin descripción'}</p>
                <div class="participant-list">👥 Participantes: ${participantesNombres || 'Ninguno'}</div>
                <div class="flex gap-3 mt-4">
                    <button class="btn-edit flex-1 bg-white text-black py-2 rounded text-xs font-semibold hover:opacity-80" onclick="editarEvento(${evento.id})">Editar Evento</button>
                    <button class="btn-delete flex-1 bg-transparent border border-white text-white py-2 rounded text-xs font-semibold hover:bg-red-600 hover:border-red-600" onclick="eliminarEvento(${evento.id})">Eliminar Evento</button>
                </div>
            `;
            listaEventos.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar eventos:", error);
    }
}

window.editarEvento = async (id) => {
    try {
        const respuesta = await fetch(`${API_EVENTOS}/${id}`);
        if (!respuesta.ok) throw new Error('Evento no encontrado');
        const evento = await respuesta.json();
        eventoIdHidden.value = evento.id;
        document.getElementById('eventoNombre').value = evento.nombre;
        document.getElementById('eventoTipo').value = evento.tipo;
        document.getElementById('eventoDescripcion').value = evento.descripcion;
        document.getElementById('eventoFechaInicio').value = evento.fecha_inicio;
        document.getElementById('eventoFechaFin').value = evento.fecha_fin;
        document.getElementById('eventoEstado').value = evento.estado;
        const checkboxes = document.querySelectorAll('.participante-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = evento.participantes.includes(parseInt(cb.value));
        });
        btnRegistrarEvento.innerText = 'Actualizar Evento';
        btnRegistrarEvento.classList.add('bg-black', 'text-white', 'border-white');
        btnRegistrarEvento.classList.remove('bg-white', 'text-black');
        btnCancelarEdicionEvento.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error("Error al cargar evento para editar:", error);
        alert('No se pudo cargar el evento para editar');
    }
};

window.eliminarEvento = async (id) => {
    if (confirm('¿Estás seguro de eliminar este evento/proyecto?')) {
        try {
            const respuesta = await fetch(`${API_EVENTOS}/${id}`, { method: 'DELETE' });
            if (respuesta.ok) {
                alert('Evento eliminado correctamente');
                cargarEventos();
                if (eventoIdHidden.value == id) {
                    resetearFormularioEvento();
                }
            } else {
                alert('Error al eliminar el evento');
            }
        } catch (error) {
            console.error("Error al eliminar evento:", error);
            alert('Error de conexión');
        }
    }
};

function resetearFormularioEvento() {
    formEvento.reset();
    eventoIdHidden.value = '';
    btnRegistrarEvento.innerText = 'Registrar Evento';
    btnRegistrarEvento.classList.add('bg-white', 'text-black');
    btnRegistrarEvento.classList.remove('bg-black', 'text-white', 'border-white');
    btnCancelarEdicionEvento.classList.add('hidden');
    document.querySelectorAll('.participante-checkbox').forEach(cb => cb.checked = false);
}

btnCancelarEdicionEvento.addEventListener('click', () => {
    resetearFormularioEvento();
});

formEvento.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = eventoIdHidden.value;
    const nombre = document.getElementById('eventoNombre').value;
    const tipo = document.getElementById('eventoTipo').value;
    const descripcion = document.getElementById('eventoDescripcion').value;
    const fecha_inicio = document.getElementById('eventoFechaInicio').value;
    const fecha_fin = document.getElementById('eventoFechaFin').value;
    const estado = document.getElementById('eventoEstado').value;
    const checkboxes = document.querySelectorAll('.participante-checkbox:checked');
    const participantes = Array.from(checkboxes).map(cb => parseInt(cb.value));
    if (!nombre || !tipo || !fecha_inicio || !fecha_fin || !estado) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    const eventoData = { nombre, tipo, descripcion, fecha_inicio, fecha_fin, estado, participantes };
    try {
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_EVENTOS}/${id}` : API_EVENTOS;
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventoData)
        });
        if (respuesta.ok) {
            alert(id ? 'Evento actualizado correctamente' : 'Evento registrado exitosamente');
            resetearFormularioEvento();
            cargarEventos();
        } else {
            const error = await respuesta.json();
            alert('Error: ' + error.mensaje);
        }
    } catch (error) {
        console.error("Error al guardar evento:", error);
        alert('Error de conexión con el servidor');
    }
});

flatpickr(document.getElementById('eventoFechaInicio'), {
    dateFormat: 'Y-m-d',
    locale: 'es',
    minDate: new Date(),
    enableTime: false,
    altInput: true,
    altFormat: 'd/m/Y',
    allowInput: true,
    theme: 'dark'
});

flatpickr(document.getElementById('eventoFechaFin'), {
    dateFormat: 'Y-m-d',
    locale: 'es',
    minDate: new Date(),
    enableTime: false,
    altInput: true,
    allowInput: true,
    theme: 'dark'
});

cargarMiembros();
cargarEventos();