const API_MIEMBROS = 'http://localhost:3000/api/miembros';
const API_EVENTOS = 'http://localhost:3000/api/eventos';

const formRegistro = document.getElementById('formRegistro');
const listaMiembros = document.getElementById('listaMiembros');
const btnSubmit = document.getElementById('btnSubmit');
const inputId = document.getElementById('miembroId');

const formEvento = document.getElementById('formEvento');
const listaEventos = document.getElementById('listaEventos');
const participantesDiv = document.getElementById('participantesCheckboxes');

async function cargarMiembros() {
    try {
        const respuesta = await fetch(API_MIEMBROS);
        const miembros = await respuesta.json();
        
        listaMiembros.innerHTML = ''; 
        
        miembros.forEach(miembro => {
            const card = document.createElement('div');
            card.className = 'member-card';
            card.innerHTML = `
                <h3>${miembro.nombre}</h3>
                <p class="member-role">${miembro.rol}</p>
                <p class="member-email">${miembro.correo}</p>
                <div class="card-btns">
                    <button class="btn-edit" onclick="prepararEdicion(${miembro.id}, '${miembro.nombre}', '${miembro.correo}', '${miembro.rol}')">Editar</button>
                    <button class="btn-delete" onclick="eliminarMiembro(${miembro.id})">Eliminar</button>
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
            participantesDiv.innerHTML = '<p style="color:#aaa;">No hay miembros registrados aún.</p>';
            return;
        }
        
        let html = '';
        miembros.forEach(m => {
            html += `
                <label>
                    <input type="checkbox" value="${m.id}" class="participante-checkbox">
                    ${m.nombre} (${m.rol})
                </label>
            `;
        });
        participantesDiv.innerHTML = html;
    } catch (error) {
        console.error("Error al cargar miembros para participantes:", error);
        participantesDiv.innerHTML = '<p style="color:#f00;">Error cargando miembros</p>';
    }
}

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = inputId.value;
    const datosMiembro = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        rol: document.getElementById('rol').value
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
        }
    } catch (error) {
        console.error("Fallo en la transmisión:", error);
    }
});

window.prepararEdicion = (id, nombre, correo, rol) => {
    inputId.value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('correo').value = correo;
    document.getElementById('rol').value = rol;
    
    btnSubmit.innerText = 'Confirmar Cambios';
    btnSubmit.style.backgroundColor = '#000000';
    btnSubmit.style.color = '#ffffff';
    btnSubmit.style.border = '1px solid #ffffff';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    btnSubmit.style.backgroundColor = '#ffffff';
    btnSubmit.style.color = '#000000';
}

async function cargarEventos() {
    try {
        const respuesta = await fetch(API_EVENTOS);
        const eventos = await respuesta.json();
        
        const resMiembros = await fetch(API_MIEMBROS);
        const miembros = await resMiembros.json();
        
        listaEventos.innerHTML = '';
        
        if (eventos.length === 0) {
            listaEventos.innerHTML = '<p style="text-align:center; color:#94a3b8;">No hay eventos registrados aún.</p>';
            return;
        }
        
        eventos.forEach(evento => {
            const fechaInicio = new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            const fechaFin = new Date(evento.fecha_fin).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            
            const participantesNombres = evento.participantes.map(id => {
                const miembro = miembros.find(m => m.id === id);
                return miembro ? `${miembro.nombre} (${miembro.rol})` : `ID ${id}`;
            }).join(', ');
            
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <h3>${evento.nombre}</h3>
                <div>
                    <span class="event-badge">${evento.tipo}</span>
                    <span class="event-badge ${evento.estado === 'abierto' ? 'event-status-abierto' : 'event-status-cerrado'}">
                        ${evento.estado === 'abierto' ? '✅ ABIERTO' : '🔒 CERRADO'}
                    </span>
                </div>
                <p style="margin: 0.5rem 0; font-size:0.85rem;">
                    📅 ${fechaInicio} → ${fechaFin}
                </p>
                <p>${evento.descripcion || 'Sin descripción'}</p>
                <div class="participant-list">
                    👥 Participantes: ${participantesNombres || 'Ninguno'}
                </div>
            `;
            listaEventos.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar eventos:", error);
    }
}

formEvento.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
    
    const eventoData = {
        nombre,
        tipo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado,
        participantes
    };
    
    try {
        const respuesta = await fetch(API_EVENTOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventoData)
        });
        
        if (respuesta.ok) {
            alert('Evento / Proyecto registrado exitosamente');
            formEvento.reset();
            document.querySelectorAll('.participante-checkbox').forEach(cb => cb.checked = false);
            cargarEventos();
        } else {
            const error = await respuesta.json();
            alert('Error: ' + error.mensaje);
        }
    } catch (error) {
        console.error("Error al registrar evento:", error);
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