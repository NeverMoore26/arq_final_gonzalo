const express = require('express');
const db = require('./database');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/form', (req, res) => {
    res.sendFile(__dirname + '/form.html');
});
// Crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, correo, pass, usu } = req.body;
        const usuarioId = await db.crearUsuario(nombre, correo, pass, usu);
        res.status(201).json({ mensaje: 'Usuario creado', id: usuarioId, nombre: nombre });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Leer todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await db.obtenerUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leer un usuario por ID
app.get('/usuarios/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const usuario = await db.obtenerUsuarioPorId(id);
        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json(usuario[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Actualizar un usuario por ID
app.put('/usuarios/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, correo, pass, usu } = req.body;
        await db.actualizarUsuario(id, nombre, correo, pass, usu);
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Actualizar un usuario por ID
app.put('/usuarios/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, correo, pass, usu } = req.body;
        await db.actualizarUsuario(id, nombre, correo, pass, usu);
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Eliminar un usuario por ID
app.delete('/usuarios/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.eliminarUsuario(id);
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar el usuario' });
    }
});




app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
