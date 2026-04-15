const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON

// Base de datos temporal en memoria (El listado inicia vacío)
let miembros = [];

// 4. Backend básico - Ruta GET (Obtener datos - Read)
app.get('/api/miembros', (req, res) => {
    res.json(miembros);
});

// 4. Backend básico - Ruta POST (Guardar datos - Create)
app.post('/api/miembros', (req, res) => {
    const { nombre, correo, rol } = req.body;
    
    // Asignamos un ID único y guardamos
    const nuevoMiembro = { id: Date.now(), nombre, correo, rol };
    miembros.push(nuevoMiembro);
    
    res.status(201).json({ mensaje: "Miembro registrado correctamente", miembro: nuevoMiembro });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de POLARIS corriendo en http://localhost:${PORT}`);
});