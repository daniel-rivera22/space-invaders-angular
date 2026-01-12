const express = require('express');
const cors = require('cors');
const db = require('./profiledatabase');

const app = express();
const PORT = 3000;

// MIDDLEWARES (Se ejecutan antes de llegar a las rutas)
app.use(cors());
app.use(express.json());

app.patch('/profile/:username', async (req, res) => {
  console.log(req.body);
  const user = req.params.username;
  const password = req.body.password;

  try {
    const query = `UPDATE user SET password=md5('${password}') WHERE user='${user}';`;
    
    const answer = await db.execute(query);
    res.status(204);
    res.json(answer);
  } catch (error) {
    // e. Gestión de errores (si falla la BD)
    console.error('Error en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. ARRANCAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`
    Servidor arrancado correctamente
    -----------------------------------
    URL: http://localhost:${PORT}
    Esperando peticiones...
    `);
});
