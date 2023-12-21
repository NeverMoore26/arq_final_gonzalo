const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'arq_parcial',
    password: ''
});

const db = pool.promise();



// Crear un usuario
async function crearUsuario(nombre, correo, pass, usu) {
    let resultado = { usuarioId: null, accesoId: null };

    // Inicia una transacción
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Inserta en TBL_USUARIOS
        const [usuario] = await connection.query(
            'INSERT INTO TBL_USUARIOS (USU_NOMBRE, USU_CORREO) VALUES (?, ?);',
            [nombre, correo]
        );
        resultado.usuarioId = usuario.insertId;

        // Inserta en TBL_ACCESOS
        const [acceso] = await connection.query(
            'INSERT INTO TBL_ACCESOS (ACC_PASS, ACC_USU) VALUES (?, ?);',
            [pass, usu]
        );
        resultado.accesoId = acceso.insertId;

        // Inserta en TBL_RELACIONES
        await connection.query(
            'INSERT INTO TBL_RELACIONES (USU_ID, ACC_ID) VALUES (?, ?);',
            [resultado.usuarioId, resultado.accesoId]
        );

        // Si todo va bien, confirma la transacción
        await connection.commit();
    } catch (error) {
        // Si hay un error, revierte la transacción
        await connection.rollback();
        throw error; // Y luego propaga el error
    } finally {
        // Cierra la conexión
        await connection.release();
    }

    return resultado;
}


// Leer todos los usuarios
async function obtenerUsuarios() {
    const [usuarios] = await db.query('SELECT * FROM TBL_USUARIOS');
    return usuarios;
}

// Leer un usuario por ID
async function obtenerUsuarioPorId(id) {
    const [usuario] = await db.query('SELECT * FROM TBL_USUARIOS WHERE USU_ID = ?', [id]);
    return usuario;
}

// Actualizar un usuario por ID
async function actualizarUsuario(id, nombre, correo) {
    await db.query('UPDATE TBL_USUARIOS SET USU_NOMBRE = ?, USU_CORREO = ? WHERE USU_ID = ?', [nombre, correo, id]);
}

// Eliminar un usuario por ID
async function eliminarUsuario(id) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Primero, obtén los ACC_ID relacionados con el USU_ID
        const [relaciones] = await connection.query('SELECT ACC_ID FROM TBL_RELACIONES WHERE USU_ID = ?', [id]);

        // Eliminar relaciones en TBL_RELACIONES
        await connection.query('DELETE FROM TBL_RELACIONES WHERE USU_ID = ?', [id]);

        // Eliminar accesos en TBL_ACCESOS para cada ACC_ID obtenido
        for (const rel of relaciones) {
            await connection.query('DELETE FROM TBL_ACCESOS WHERE ACC_ID = ?', [rel.ACC_ID]);
        }

        // Eliminar el usuario en TBL_USUARIOS
        await connection.query('DELETE FROM TBL_USUARIOS WHERE USU_ID = ?', [id]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.release();
    }
}

module.exports = {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
};
