const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let miembros = [];
let eventos = [];

app.get('/api/miembros', (req, res) => {
    res.json(miembros);
});

app.post('/api/miembros', (req, res) => {
    const { nombre, correo, rol } = req.body;
    const nuevoMiembro = { 
        id: Date.now(),
        nombre, 
        correo, 
        rol 
    };
    miembros.push(nuevoMiembro);
    res.status(201).json({ mensaje: "Registro exitoso", miembro: nuevoMiembro });
});

app.put('/api/miembros/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;
    
    const index = miembros.findIndex(m => m.id == id);
    if (index !== -1) {
        miembros[index] = { id: Number(id), nombre, correo, rol };
        res.json({ mensaje: "Datos actualizados en el sistema", miembro: miembros[index] });
    } else {
        res.status(404).json({ mensaje: "Miembro no localizado en el radar" });
    }
});

app.delete('/api/miembros/:id', (req, res) => {
    const { id } = req.params;
    miembros = miembros.filter(m => m.id != id);
    res.json({ mensaje: "Registro eliminado de la base" });
});

app.get('/api/eventos', (req, res) => {
    res.json(eventos);
});

app.post('/api/eventos', (req, res) => {
    const { nombre, tipo, descripcion, fecha_inicio, fecha_fin, estado, participantes } = req.body;
    
    if (!nombre || !tipo || !fecha_inicio || !fecha_fin || !estado) {
        return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }
    
    const nuevoEvento = {
        id: Date.now(),
        nombre,
        tipo,
        descripcion: descripcion || '',
        fecha_inicio,
        fecha_fin,
        estado,
        participantes: participantes || []
    };
    
    eventos.push(nuevoEvento);
    res.status(201).json({ mensaje: "Evento registrado", evento: nuevoEvento });
});

app.listen(PORT, () => {
    console.log(`🚀 Sistema POLARIS activo en http://localhost:${PORT}`);
});