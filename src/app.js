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

function mostrarMensaje(mensaje, tipo = 'exito') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    let icono = '';
    let claseTipo = '';

    switch(tipo) {
        case 'exito':
            claseTipo = 'success';
            icono = '✓';
            break;
        case 'error':
            claseTipo = 'error';
            icono = '✗';
            break;
        case 'advertencia':
            claseTipo = 'warning';
            icono = '⚠';
            break;
        case 'eliminado':
            claseTipo = 'delete';
            icono = '🗑️';
            break;
        default:
            claseTipo = 'success';
            icono = '✓';
    }

    toast.className = `toast-message ${claseTipo} flex items-center gap-3`;
    toast.innerHTML = `
        <div class="icon">${icono}</div>
        <div class="message flex-1">${mensaje}</div>
        <button class="text-lg hover:text-white">&times;</button>
    `;
    container.appendChild(toast);
    toast.querySelector('button').addEventListener('click', () => toast.remove());
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4800);
}

function limpiarErrores(contenedor) {
    const placeholders = contenedor.querySelectorAll('.error-placeholder');
    placeholders.forEach(ph => ph.innerHTML = '');
}

function mostrarErrorCampo(campo, mensaje) {
    const contenedor = campo.closest('.campo-container');
    if (!contenedor) return;
    const placeholder = contenedor.querySelector('.error-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <div class="error-message">
                <span class="icon">⚠️</span>
                <span>${mensaje}</span>
            </div>
        `;
    }
}

function limpiarErrorCampo(campo) {
    const contenedor = campo.closest('.campo-container');
    if (!contenedor) return;
    const placeholder = contenedor.querySelector('.error-placeholder');
    if (placeholder) placeholder.innerHTML = '';
}

function validarCampoMiembro(campo) {
    const id = campo.id;
    const valor = campo.value.trim();
    let error = '';

    switch(id) {
        case 'nombre':
            if (!valor) error = 'Rellena este campo: Nombre(s)';
            break;
        case 'apellidos':
            if (!valor) error = 'Rellena este campo: Apellido(s)';
            break;
        case 'correo':
            if (!valor) error = 'Rellena este campo: Correo Electrónico';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) error = 'Correo electrónico inválido. Ejemplo: usuario@dominio.com';
            break;
        case 'telefono':
            if (!valor) error = 'Rellena este campo: Teléfono Móvil';
            else if (!/^\d{10}$/.test(valor)) error = 'El teléfono debe tener 10 dígitos numéricos';
            break;
        case 'fechaNacimiento':
            if (!valor) error = 'Rellena este campo: Fecha de Nacimiento';
            break;
        case 'genero':
            if (!valor) error = 'Selecciona una opción: Género';
            break;
        case 'institucion':
            if (!valor) error = 'Rellena este campo: Institución Educativa';
            break;
        case 'numeroControl':
            if (!valor) error = 'Rellena este campo: Número de Control';
            else if (!/^\d{8,9}$/.test(valor)) error = 'El número de control debe tener 8 o 9 dígitos';
            break;
        case 'carrera':
            if (!valor) error = 'Selecciona una opción: Carrera';
            break;
        case 'semestre':
            if (!valor) error = 'Selecciona una opción: Semestre';
            break;
        case 'anioIngreso':
            if (!valor) error = 'Rellena este campo: Año de Ingreso';
            break;
        case 'rol':
            if (!valor) error = 'Selecciona una opción: Rol en el equipo';
            break;
        default: return true;
    }

    if (error) {
        mostrarErrorCampo(campo, error);
        return false;
    } else {
        limpiarErrorCampo(campo);
        return true;
    }
}

function validarCampoEvento(campo) {
    const id = campo.id;
    const valor = campo.type === 'select-one' ? campo.value : campo.value.trim();
    let error = '';

    switch(id) {
        case 'eventoNombre':
            if (!valor) error = 'Rellena este campo: Nombre del evento/proyecto';
            break;
        case 'eventoTipo':
            if (!valor) error = 'Selecciona un tipo para el evento';
            break;
        case 'eventoFechaInicio':
            if (!valor) error = 'Rellena este campo: Fecha de inicio';
            break;
        case 'eventoFechaFin':
            if (!valor) error = 'Rellena este campo: Fecha de cierre';
            else {
                const fechaInicio = document.getElementById('eventoFechaInicio').value;
                if (fechaInicio && new Date(valor) < new Date(fechaInicio)) {
                    error = 'La fecha de cierre debe ser igual o posterior a la fecha de inicio.';
                }
            }
            break;
        case 'eventoEstado':
            if (!valor) error = 'Selecciona un estado para el evento';
            break;
        default: return true;
    }

    if (error) {
        mostrarErrorCampo(campo, error);
        return false;
    } else {
        limpiarErrorCampo(campo);
        return true;
    }
}

// Configurar eventos de validación en tiempo real para miembros
function setupRealTimeValidationMiembros() {
    const campos = [
        'nombre', 'apellidos', 'correo', 'telefono', 'fechaNacimiento',
        'genero', 'institucion', 'numeroControl', 'carrera', 'semestre',
        'anioIngreso', 'rol'
    ];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', () => validarCampoMiembro(campo));
            campo.addEventListener('change', () => validarCampoMiembro(campo));
        }
    });
}

function setupRealTimeValidationEventos() {
    const campos = ['eventoNombre', 'eventoTipo', 'eventoFechaInicio', 'eventoFechaFin', 'eventoEstado'];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', () => validarCampoEvento(campo));
            campo.addEventListener('change', () => validarCampoEvento(campo));
        }
    });
    // Validación especial para la fecha de fin si cambia la de inicio
    const fechaInicio = document.getElementById('eventoFechaInicio');
    const fechaFin = document.getElementById('eventoFechaFin');
    if (fechaInicio && fechaFin) {
        fechaInicio.addEventListener('change', () => validarCampoEvento(fechaFin));
    }
}

// ========== INICIALIZACIÓN DE FLATPICKR ==========
flatpickr("#fechaNacimiento", {
    dateFormat: "Y-m-d",
    locale: "es",
    altInput: true,
    altFormat: "d/m/Y",
    allowInput: true,
    maxDate: new Date(),
    theme: "dark"
});

flatpickr(document.getElementById('eventoFechaInicio'), {
    dateFormat: 'Y-m-d',
    locale: 'es',
    minDate: new Date(),
    altInput: true,
    altFormat: 'd/m/Y',
    allowInput: true,
    theme: 'dark',
    closeOnSelect: true,
    onChange: function (selectedDates) {
        if (selectedDates.length) {
            const fechaFinPicker = document.getElementById('eventoFechaFin')._flatpickr;
            if (fechaFinPicker) fechaFinPicker.set('minDate', selectedDates[0]);
            // Re-validar el campo fecha fin si ya tiene valor
            const fechaFin = document.getElementById('eventoFechaFin');
            if (fechaFin.value) validarCampoEvento(fechaFin);
        }
    }
});

flatpickr(document.getElementById('eventoFechaFin'), {
    dateFormat: 'Y-m-d',
    locale: 'es',
    minDate: new Date(),
    altInput: true,
    altFormat: 'd/m/Y',
    allowInput: true,
    theme: 'dark',
    closeOnSelect: true
});

// ========== CRUD MIEMBROS ==========
async function cargarMiembros() {
  try {
    const respuesta = await fetch(API_MIEMBROS);
    const miembros = await respuesta.json();

    listaMiembros.innerHTML = '';

    if (miembros.length === 0) {
      listaMiembros.innerHTML = `
        <div class="col-span-full bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 text-center text-gray-400 shadow-lg">
          No hay miembros registrados.
        </div>
      `;
      return;
    }

    miembros.forEach(miembro => {
      const nombreCompleto = `${miembro.nombre || ''} ${miembro.apellidos || ''}`.trim();
      const fechaNac = miembro.fecha_nacimiento
        ? new Date(miembro.fecha_nacimiento).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'No especificada';

      const inicial = nombreCompleto ? nombreCompleto.charAt(0).toUpperCase() : 'P';

      const card = document.createElement('div');

      card.className =
        'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-white/20 transition-all duration-300 group';

      card.innerHTML = `
        <div class="flex items-start justify-between gap-4 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl font-black text-white">
              ${inicial}
            </div>

            <div>
              <h3 class="text-lg font-bold text-white leading-tight uppercase">
                ${nombreCompleto || 'SIN NOMBRE'}
              </h3>
              <p class="text-xs text-gray-400 mt-1">
                ${miembro.numero_control || 'Sin número de control'}
              </p>
            </div>
          </div>

          <span class="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-gray-200">
            ${miembro.rol || 'SIN ROL'}
          </span>
        </div>

        <div class="space-y-3 text-sm">
          <div class="bg-black/30 border border-white/10 rounded-xl p-3">
            <p class="text-gray-400 text-xs mb-1">Correo</p>
            <p class="text-white break-words">${miembro.correo || 'No especificado'}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-black/30 border border-white/10 rounded-xl p-3">
              <p class="text-gray-400 text-xs mb-1">Teléfono</p>
              <p class="text-white">${miembro.telefono || 'No especificado'}</p>
            </div>

            <div class="bg-black/30 border border-white/10 rounded-xl p-3">
              <p class="text-gray-400 text-xs mb-1">Nacimiento</p>
              <p class="text-white">${fechaNac}</p>
            </div>
          </div>

          <div class="bg-black/30 border border-white/10 rounded-xl p-3">
            <p class="text-gray-400 text-xs mb-1">Institución</p>
            <p class="text-white">${miembro.institucion || 'No especificada'}</p>
          </div>

          <div class="bg-black/30 border border-white/10 rounded-xl p-3">
            <p class="text-gray-400 text-xs mb-1">Carrera</p>
            <p class="text-white">${miembro.carrera || 'No especificada'}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-black/30 border border-white/10 rounded-xl p-3">
              <p class="text-gray-400 text-xs mb-1">Semestre</p>
              <p class="text-white">${miembro.semestre || 'No especificado'}</p>
            </div>

            <div class="bg-black/30 border border-white/10 rounded-xl p-3">
              <p class="text-gray-400 text-xs mb-1">Ingreso</p>
              <p class="text-white">${miembro.anio_ingreso || 'No especificado'}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-5 pt-4 border-t border-white/10">
          <button onclick="prepararEdicion(${miembro.id})"
            class="flex-1 bg-white text-black font-bold py-2 rounded-lg border border-white hover:bg-transparent hover:text-white transition-all duration-300">
            Editar
          </button>

          <button onclick="eliminarMiembro(${miembro.id})"
            class="flex-1 bg-transparent border border-gray-600 text-gray-300 font-bold py-2.5 rounded-lg hover:bg-white/10 hover:border-gray-400 transition-all duration-300">
            Eliminar
          </button>
        </div>
      `;

      listaMiembros.appendChild(card);
    });

    cargarParticipantesCheckboxes();

  } catch (error) {
    console.error(error);
    mostrarMensaje('Error al cargar los miembros.', 'error');
  }
}

async function cargarParticipantesCheckboxes() {
    try {
        const respuesta = await fetch(API_MIEMBROS);
        const miembros = await respuesta.json();
        if (miembros.length === 0) {
            participantesDiv.innerHTML = '<p class="text-gray-400 text-sm text-center py-6">No hay miembros registrados aún.</p>';
            return;
        }
        let html = '<div class="space-y-2">';
        miembros.forEach(m => {
            const nombreCompleto = `${m.nombre || ''} ${m.apellidos || ''}`.trim();
            html += `
                <label class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all group">
                    <input type="checkbox" class="participante-checkbox accent-white w-5 h-5 cursor-pointer" value="${m.id}">
                    <div class="flex-1 min-w-0">
                        <p class="text-white text-sm font-semibold group-hover:text-white transition truncate">${nombreCompleto}</p>
                        <div class="flex gap-2 mt-1">
                            <span class="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-full border border-white/10">${m.numero_control || 'S/N'}</span>
                            <span class="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-full border border-white/10">${m.rol || 'Sin rol'}</span>
                        </div>
                    </div>
                    <span class="text-white text-lg group-hover:scale-110 transition">✓</span>
                </label>
            `;
        });
        html += '</div>';
        participantesDiv.innerHTML = html;
    } catch (error) {
        console.error(error);
        participantesDiv.innerHTML = '<p class="text-red-400 text-sm text-center py-4">Error cargando miembros</p>';
        mostrarMensaje('No se pudieron cargar los participantes.', 'error');
    }
}

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarErrores(formRegistro);

    // Validar todos los campos
    const campos = ['nombre', 'apellidos', 'correo', 'telefono', 'fechaNacimiento', 'genero', 'institucion', 'numeroControl', 'carrera', 'semestre', 'anioIngreso', 'rol'];
    let valido = true;
    for (let id of campos) {
        const campo = document.getElementById(id);
        if (!validarCampoMiembro(campo)) valido = false;
    }
    if (!valido) return;

    const datosMiembro = {
        nombre: document.getElementById('nombre').value.trim().toUpperCase(),
        apellidos: document.getElementById('apellidos').value.trim().toUpperCase(),
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        fecha_nacimiento: document.getElementById('fechaNacimiento').value,
        genero: document.getElementById('genero').value.toUpperCase(),
        institucion: document.getElementById('institucion').value.trim().toUpperCase(),
        numero_control: document.getElementById('numeroControl').value.trim(),
        carrera: document.getElementById('carrera').value.toUpperCase(),
        semestre: document.getElementById('semestre').value.toUpperCase(),
        anio_ingreso: document.getElementById('anioIngreso').value,
        rol: document.getElementById('rol').value.toUpperCase()
    };

    const id = inputId.value;
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_MIEMBROS}/${id}` : API_MIEMBROS;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosMiembro)
        });
        if (respuesta.ok) {
            mostrarMensaje(id ? 'Registro actualizado correctamente.' : 'Tripulante registrado correctamente.', 'exito');
            resetearFormulario();
            cargarMiembros();
        } else {
            const error = await respuesta.json();
            mostrarMensaje(`Error: ${error.mensaje || 'No se pudo guardar'}`, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('Error de conexión con el servidor.', 'error');
    }
});

window.prepararEdicion = async (id) => {
    try {
        const respuesta = await fetch(`${API_MIEMBROS}/${id}`);
        if (!respuesta.ok) throw new Error('Miembro no encontrado');
        const miembro = await respuesta.json();
        inputId.value = miembro.id;
        document.getElementById('nombre').value = miembro.nombre || '';
        document.getElementById('apellidos').value = miembro.apellidos || '';
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
        mostrarMensaje('Cargando datos del miembro para edición.', 'advertencia');
    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo cargar los datos del miembro.', 'error');
    }
};

window.eliminarMiembro = async (id) => {
    if (!confirm('⚠️ ¿Estás seguro de eliminar este miembro? Esta acción no se puede deshacer.')) return;
    try {
        const respuesta = await fetch(`${API_MIEMBROS}/${id}`, { method: 'DELETE' });
        if (respuesta.ok) {
            mostrarMensaje('Miembro eliminado correctamente.', 'eliminado');
            cargarMiembros();
        } else {
            mostrarMensaje('No se pudo eliminar el miembro.', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('Error de conexión al eliminar.', 'error');
    }
};

function resetearFormulario() {
    formRegistro.reset();
    inputId.value = '';
    btnSubmit.innerText = 'Registrar en Polaris';
    btnSubmit.classList.add('bg-white', 'text-black');
    btnSubmit.classList.remove('bg-black', 'text-white', 'border-white');
    limpiarErrores(formRegistro);
}

// ========== CRUD EVENTOS ==========
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
                    const nombreCompleto = `${miembro.nombre || ''} ${miembro.apellidos || ''}`.trim();
                    return `<span class="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-semibold hover:bg-white/20 transition">${nombreCompleto}</span>`;
                }
                return `<span class="bg-white/10 text-gray-300 border border-white/10 px-3 py-1 rounded-full text-xs">ID ${id}</span>`;
            }).join('');
            const tipoIcono = { 'Proyecto': '◇', 'Evento': '✦', 'Competencia': '⬡', 'Actividad': '●' }[evento.tipo] || '◇';
            const estadoBadge = evento.estado === 'abierto'
                ? '<span class="inline-flex items-center gap-1 bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-semibold"><span class="w-2 h-2 bg-white rounded-full"></span>ABIERTO</span>'
                : '<span class="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full text-xs font-semibold"><span class="w-2 h-2 bg-red-400 rounded-full"></span>CERRADO</span>';
            const card = document.createElement('div');
            card.className = 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-white/20 transition-all duration-300 group';
            card.innerHTML = `
                <div class="flex justify-between items-start gap-3 mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-2xl text-white">${tipoIcono}</span>
                            <h3 class="text-xl font-bold text-white group-hover:text-white transition">${evento.nombre.toUpperCase()}</h3>
                        </div>
                        <p class="text-sm text-gray-400">${evento.tipo}</p>
                    </div>
                    <div>${estadoBadge}</div>
                </div>
                <div class="border-b border-white/10 pb-4 mb-4">
                    <p class="text-sm text-gray-300 leading-relaxed">${evento.descripcion || '<span class="text-gray-500 italic">Sin descripción</span>'}</p>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div class="bg-white/5 rounded-lg p-3 border border-white/5">
                        <p class="text-gray-400 text-xs mb-1">Inicio</p>
                        <p class="text-white font-semibold">${fechaInicio}</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-3 border border-white/5">
                        <p class="text-gray-400 text-xs mb-1">Cierre</p>
                        <p class="text-white font-semibold">${fechaFin}</p>
                    </div>
                </div>
                <div class="mb-5">
                    <p class="text-sm font-semibold text-white mb-3">Participantes (${evento.participantes.length})</p>
                    <div class="flex flex-wrap gap-2">${participantesHTML || '<span class="text-gray-400 text-sm italic">Sin participantes asignados</span>'}</div>
                </div>
                <div class="flex gap-2 pt-4 border-t border-white/10">
                    <button onclick="editarEvento(${evento.id})" class="flex-1 bg-white text-black font-semibold px-3 py-2 rounded-lg transition hover:opacity-80 text-sm">Editar</button>
                    <button onclick="eliminarEvento(${evento.id})" class="flex-1 bg-white/10 hover:bg-red-500/20 text-white font-semibold px-3 py-2 rounded-lg transition border border-white/10 hover:border-red-400/50 text-sm">Eliminar</button>
                </div>
            `;
            listaEventos.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudieron cargar los eventos.', 'error');
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
        checkboxes.forEach(cb => { cb.checked = evento.participantes.includes(parseInt(cb.value)); });
        document.getElementById('modoEdicion').classList.remove('hidden');
        btnRegistrarEvento.innerText = 'Actualizar Evento';
        btnRegistrarEvento.classList.remove('bg-black', 'text-white', 'border-white');
        btnRegistrarEvento.classList.add('bg-white', 'text-black');
        btnCancelarEdicionEvento.classList.remove('hidden');
        document.getElementById('formEvento').scrollIntoView({ behavior: 'smooth', block: 'center' });
        mostrarMensaje('Modo edición activado.', 'advertencia');
    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo cargar el evento para editar.', 'error');
    }
};

window.eliminarEvento = async (id) => {
    if (!confirm('⚠️ ¿Estás seguro de eliminar este evento/proyecto? Esta acción no se puede deshacer.')) return;
    try {
        const respuesta = await fetch(`${API_EVENTOS}/${id}`, { method: 'DELETE' });
        if (respuesta.ok) {
            mostrarMensaje('Evento eliminado correctamente.', 'eliminado');
            cargarEventos();
            if (eventoIdHidden.value == id) resetearFormularioEvento();
        } else {
            mostrarMensaje('Error al eliminar el evento.', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('Error de conexión al eliminar.', 'error');
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
    limpiarErrores(formEvento);
}

btnCancelarEdicionEvento.addEventListener('click', () => {
    resetearFormularioEvento();
    mostrarMensaje('Edición cancelada.', 'advertencia');
});

function actualizarEstadoVisual() {
    const estadoSelect = document.getElementById('eventoEstado');
    if (!estadoSelect) return;
    const valor = estadoSelect.value;
    estadoSelect.classList.remove('estado-abierto', 'estado-cerrado');
    if (valor === 'abierto') {
        estadoSelect.classList.add('estado-abierto');
        estadoSelect.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        estadoSelect.style.borderColor = '#ffffff';
        estadoSelect.style.color = '#ffffff';
    } else if (valor === 'cerrado') {
        estadoSelect.classList.add('estado-cerrado');
        estadoSelect.style.backgroundColor = 'rgba(229, 231, 235, 0.2)';
        estadoSelect.style.borderColor = '#e5e7eb';
        estadoSelect.style.color = '#f3f4f6';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const estadoSelect = document.getElementById('eventoEstado');
    if (estadoSelect) {
        estadoSelect.addEventListener('change', actualizarEstadoVisual);
        actualizarEstadoVisual();
    }
});

formEvento.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarErrores(formEvento);

    // Validar todos los campos del evento
    const camposEvento = ['eventoNombre', 'eventoTipo', 'eventoFechaInicio', 'eventoFechaFin', 'eventoEstado'];
    let valido = true;
    for (let id of camposEvento) {
        const campo = document.getElementById(id);
        if (!validarCampoEvento(campo)) valido = false;
    }
    if (!valido) return;

    const participantesCheck = document.querySelectorAll('.participante-checkbox:checked');
    const participantes = Array.from(participantesCheck).map(cb => parseInt(cb.value));

    const eventoData = {
        nombre: document.getElementById('eventoNombre').value.trim(),
        tipo: document.getElementById('eventoTipo').value,
        descripcion: document.getElementById('eventoDescripcion').value.trim(),
        fecha_inicio: document.getElementById('eventoFechaInicio').value,
        fecha_fin: document.getElementById('eventoFechaFin').value,
        estado: document.getElementById('eventoEstado').value,
        participantes
    };

    const id = eventoIdHidden.value;
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_EVENTOS}/${id}` : API_EVENTOS;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventoData)
        });
        if (respuesta.ok) {
            mostrarMensaje(id ? 'Evento actualizado correctamente.' : 'Evento registrado exitosamente.', 'exito');
            resetearFormularioEvento();
            cargarEventos();
        } else {
            const error = await respuesta.json();
            mostrarMensaje(`Error: ${error.mensaje || 'No se pudo guardar'}`, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('Error de conexión con el servidor.', 'error');
    }
});

// Inicializar validaciones en tiempo real
setupRealTimeValidationMiembros();
setupRealTimeValidationEventos();

cargarMiembros();
cargarEventos();
actualizarEstadoVisual();