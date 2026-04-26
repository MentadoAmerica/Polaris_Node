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
    maxDate: new Date(),
    theme: "dark"
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
      participantesDiv.innerHTML = `
        <p class="text-gray-400 text-sm text-center py-6">📭 No hay miembros registrados aún.</p>
      `;
      return;
    }

    let html = '<div class="space-y-2">';

    miembros.forEach(m => {
      const nombreCompleto = `${m.nombre || ''} ${m.apellido_paterno || ''} ${m.apellido_materno || ''}`.trim();
      const rolColor = {
        'ADMINISTRADOR': 'bg-purple-500/20 text-purple-300 border-purple-400/30',
        'DESARROLLADOR': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        'DISEÑADOR': 'bg-pink-500/20 text-pink-300 border-pink-400/30'
      }[m.rol] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';

      html += `
        <label class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 hover:border-blue-400/30 transition-all group">
          <input type="checkbox" class="participante-checkbox accent-blue-500 w-5 h-5 cursor-pointer" value="${m.id}">
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-semibold group-hover:text-blue-300 transition truncate">${nombreCompleto}</p>
            <div class="flex gap-2 mt-1">
              <span class="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-300 rounded-full border border-gray-400/20">
                ${m.numero_control || 'S/N'}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full border ${rolColor}">
                ${m.rol || 'Sin rol'}
              </span>
            </div>
          </div>
          <span class="text-lg group-hover:scale-110 transition">✓</span>
        </label>
      `;
    });

    html += '</div>';
    participantesDiv.innerHTML = html;

  } catch (error) {
    console.error("Error al cargar miembros para participantes:", error);
    participantesDiv.innerHTML = `
      <p class="text-red-400 text-sm text-center py-4">❌ Error cargando miembros</p>
    `;
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
            
            const participantesHTML = evento.participantes.map(id => {
                const miembro = miembros.find(m => m.id === id);
                if (miembro) {
                    const nombreCompleto = `${miembro.nombre || ''} ${miembro.apellido_paterno || ''} ${miembro.apellido_materno || ''}`.trim();
                    return `
                        <span class="bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-500/30 transition">
                            ${nombreCompleto}
                        </span>
                    `;
                }
                return `
                    <span class="bg-gray-500/20 text-gray-300 border border-gray-400/20 px-3 py-1 rounded-full text-xs">
                        ID ${id}
                    </span>
                `;
            }).join('');

            const tipoIcono = {
                'Proyecto': '◆',
                'Evento': '✦',
                'Competencia': '⬢',
                'Actividad': '●'
            }[evento.tipo] || '◈';

            const estadoBadge = evento.estado === 'abierto' 
                ? '<span class="inline-flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-400/30 px-3 py-1 rounded-full text-xs font-semibold"><span class="w-2 h-2 bg-green-400 rounded-full"></span>ABIERTO</span>'
                : '<span class="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full text-xs font-semibold"><span class="w-2 h-2 bg-red-400 rounded-full"></span>CERRADO</span>';

            const card = document.createElement('div');
            card.className = 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-white/20 transition-all duration-300 group';

            card.innerHTML = `
                <div class="flex justify-between items-start gap-3 mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-2xl">${tipoIcono}</span>
                            <h3 class="text-xl font-bold text-white group-hover:text-blue-300 transition">${evento.nombre.toUpperCase()}</h3>
                        </div>
                        <p class="text-sm text-gray-400">${evento.tipo}</p>
                    </div>
                    <div>
                        ${estadoBadge}
                    </div>
                </div>

                <div class="border-b border-white/10 pb-4 mb-4">
                    <p class="text-sm text-gray-300 leading-relaxed">
                        ${evento.descripcion || '<span class="text-gray-500 italic">Sin descripción</span>'}
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div class="bg-white/5 rounded-lg p-3 border border-white/5">
                        <p class="text-gray-400 text-xs mb-1">📅 Inicio</p>
                        <p class="text-white font-semibold">${fechaInicio}</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-3 border border-white/5">
                        <p class="text-gray-400 text-xs mb-1">📅 Cierre</p>
                        <p class="text-white font-semibold">${fechaFin}</p>
                    </div>
                </div>

                <div class="mb-5">
                    <p class="text-sm font-semibold text-white mb-3">👥 Participantes (${evento.participantes.length})</p>
                    <div class="flex flex-wrap gap-2">
                        ${participantesHTML || '<span class="text-gray-400 text-sm italic">Sin participantes asignados</span>'}
                    </div>
                </div>

                <div class="flex gap-2 pt-4 border-t border-white/10">
                    <button onclick="editarEvento(${evento.id})" class="flex-1 bg-white/10 hover:bg-blue-500/20 text-white font-semibold px-3 py-2 rounded-lg transition border border-white/10 hover:border-blue-400/50 text-sm">
                        ✏️ Editar
                    </button>
                    <button onclick="eliminarEvento(${evento.id})" class="flex-1 bg-white/10 hover:bg-red-500/20 text-white font-semibold px-3 py-2 rounded-lg transition border border-white/10 hover:border-red-400/50 text-sm">
                        🗑️ Eliminar
                    </button>
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
        actualizarEstadoVisual();
        const checkboxes = document.querySelectorAll('.participante-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = evento.participantes.includes(parseInt(cb.value));
        });
        
        // Mostrar indicador de edición
        document.getElementById('modoEdicion').classList.remove('hidden');
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
    const confirmDialog = confirm('⚠️ ¿Estás seguro de eliminar este evento/proyecto?\n\nEsta acción no se puede deshacer.');
    if (confirmDialog) {
        try {
            const respuesta = await fetch(`${API_EVENTOS}/${id}`, { method: 'DELETE' });
            if (respuesta.ok) {
                alert('✅ Evento eliminado correctamente');
                cargarEventos();
                if (eventoIdHidden.value == id) {
                    resetearFormularioEvento();
                }
            } else {
                alert('❌ Error al eliminar el evento');
            }
        } catch (error) {
            console.error("Error al eliminar evento:", error);
            alert('❌ Error de conexión');
        }
    }
};

function resetearFormularioEvento() {
    formEvento.reset();
    eventoIdHidden.value = '';
    document.getElementById('modoEdicion').classList.add('hidden');
    btnRegistrarEvento.innerText = 'Registrar Evento';
    btnRegistrarEvento.classList.add('bg-white', 'text-black');
    btnRegistrarEvento.classList.remove('bg-black', 'text-white', 'border-white');
    btnCancelarEdicionEvento.classList.add('hidden');
    document.querySelectorAll('.participante-checkbox').forEach(cb => cb.checked = false);
    actualizarEstadoVisual();
}

btnCancelarEdicionEvento.addEventListener('click', () => {
    resetearFormularioEvento();
});

// Actualizar clase de estado visual
function actualizarEstadoVisual() {
    const estadoSelect = document.getElementById('eventoEstado');
    if (!estadoSelect) return;
    
    const valor = estadoSelect.value;
    estadoSelect.classList.remove('estado-abierto', 'estado-cerrado');
    
    if (valor === 'abierto') {
        estadoSelect.classList.add('estado-abierto');
        estadoSelect.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        estadoSelect.style.borderColor = '#3b82f6';
        estadoSelect.style.color = '#93c5fd';
    } else if (valor === 'cerrado') {
        estadoSelect.classList.add('estado-cerrado');
        estadoSelect.style.backgroundColor = 'rgba(229, 231, 235, 0.2)';
        estadoSelect.style.borderColor = '#e5e7eb';
        estadoSelect.style.color = '#f3f4f6';
    }
}

// Listener para cambios en el select de estado
document.addEventListener('DOMContentLoaded', function() {
    const estadoSelect = document.getElementById('eventoEstado');
    if (estadoSelect) {
        estadoSelect.addEventListener('change', actualizarEstadoVisual);
        actualizarEstadoVisual();
    }
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
    theme: 'dark',
    closeOnSelect: true,
    onChange: function(selectedDates) {
        if (selectedDates.length > 0) {
            const fechaFin = document.getElementById('eventoFechaFin');
            if (fechaFin && fechaFin._flatpickr) {
                fechaFin._flatpickr.set('minDate', selectedDates[0]);
            }
        }
    }
});

flatpickr(document.getElementById('eventoFechaFin'), {
    dateFormat: 'Y-m-d',
    locale: 'es',
    minDate: new Date(),
    enableTime: false,
    altInput: true,
    altFormat: 'd/m/Y',
    allowInput: true,
    theme: 'dark',
    closeOnSelect: true
});

cargarMiembros();
cargarEventos();
actualizarEstadoVisual();