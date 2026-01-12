const express = require('express');
const cors = require('cors');
const db = require('./scoredatabase'); // Importamos el pool de conexiones

const app = express();
const PORT = 3000;

// MIDDLEWARES (Se ejecutan antes de llegar a las rutas)
app.use(cors()); // Permite peticiones desde Angular (localhost:4200)
app.use(express.json()); // Permite leer cuerpos de mensaje en formato JSON

//  RUTAS (ENDPOINTS)

// GET: Obtener récords de un usuario específico
// :username es una variable que viene en la URL
app.get('/personal-records/:username', async (req, res) => {
  // a. Para recuperar el parámetro desde la URL, se usa req.params.<nombreParametro>
  const username = req.params.username;

  try {
    /*
      Consulta SQL. Usar '${username}' hace la consulta vulnerable a SQLInjection,
      así que usamos ? y lepasamos el dato envuelto en un array
    */
    const query = `
            SELECT user as username, punctuation, ufos, 
                   disposed_time as disposedTime, record_date as recordDate 
            FROM record 
            WHERE user = ? 
            ORDER BY punctuation DESC 
            LIMIT 10
        `;
    // c. Ejecutamos la consulta.
    // db.execute devuelve un array: [filas, metadatos].
    // Usamos destructuring [rows] para quedarnos solo con las filas.
    const [rows] = await db.execute(query, [username]);

    // d. Devolvemos la respuesta:
    res.json(rows); // Express convierte el array de JS a JSON automáticamente
  } catch (error) {
    // e. Gestión de errores (si falla la BD)
    console.error('Error en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. ARRANCAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`
    🚀 Servidor arrancado correctamente
    -----------------------------------
    URL: http://localhost:${PORT}
    Esperando peticiones...
    `);
});
