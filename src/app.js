const API_URL = 'http://localhost:3000/api/miembros';

const formRegistro = document.getElementById('formRegistro');
const listaMiembros = document.getElementById('listaMiembros');
const btnSubmit = document.getElementById('btnSubmit');
const inputId = document.getElementById('miembroId');

async function cargarMiembros() {
    try {
        const respuesta = await fetch(API_URL);
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
    } catch (error) {
        console.error("Error de comunicación con el sistema central:", error);
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
        const url = id ? `${API_URL}/${id}` : API_URL;

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
        console.error("Fallo en la transmisión de datos:", error);
    }
});

window.prepararEdicion = (id, nombre, correo, rol) => {
    inputId.value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('correo').value = correo;
    document.getElementById('rol').value = rol;
    
    btnSubmit.innerText = 'Confirmar Cambios';
    // Estilo para modo edición: Fondo negro, letras blancas
    btnSubmit.style.backgroundColor = '#000000';
    btnSubmit.style.color = '#ffffff';
    btnSubmit.style.border = '1px solid #ffffff';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarMiembro = async (id) => {
    if (confirm("¿Confirmas la eliminación de este registro del sistema?")) {
        try {
            const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (respuesta.ok) {
                cargarMiembros();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
};

// Limpiar
function resetearFormulario() {
    formRegistro.reset();
    inputId.value = '';
    btnSubmit.innerText = 'Registrar en Polaris';
    // Volver al estilo original: Fondo blanco, letras negras
    btnSubmit.style.backgroundColor = '#ffffff';
    btnSubmit.style.color = '#000000';
}

cargarMiembros();