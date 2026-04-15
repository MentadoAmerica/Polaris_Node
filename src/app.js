const API_URL = 'http://localhost:3000/api/miembros';

// Elementos de la interfaz
const formRegistro = document.getElementById('formRegistro');
const listaMiembros = document.getElementById('listaMiembros');

// 5. Integración - Obtener y Mostrar los datos en la interfaz
async function cargarMiembros() {
    try {
        const respuesta = await fetch(API_URL);
        const miembros = await respuesta.json();
        
        listaMiembros.innerHTML = ''; // Limpiar listado antes de actualizar
        
        // Crear una tarjeta (card) por cada miembro registrado
        miembros.forEach(miembro => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'col-md-6';
            tarjeta.innerHTML = `
                <div class="card border-primary h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${miembro.nombre}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">Rol: ${miembro.rol}</h6>
                        <p class="card-text">${miembro.correo}</p>
                    </div>
                </div>
            `;
            listaMiembros.appendChild(tarjeta);
        });
    } catch (error) {
        console.error("Error al cargar la lista de miembros:", error);
    }
}

// 5. Integración - Conectar el formulario con el backend para guardar
formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que la página recargue al dar submit

    // Extraer datos del formulario
    const nuevoMiembro = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        rol: document.getElementById('rol').value
    };

    try {
        // Enviar datos por POST
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoMiembro)
        });

        if (respuesta.ok) {
            alert('¡Miembro registrado exitosamente en POLARIS!');
            formRegistro.reset(); // Limpiar el formulario
            cargarMiembros(); // Recargar el listado de tarjetas
        }
    } catch (error) {
        console.error("Error al registrar:", error);
    }
});

// Cargar la lista automáticamente al abrir la página
cargarMiembros();