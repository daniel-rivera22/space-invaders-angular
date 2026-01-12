const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'wd.etsisi.upm.es',
  user: 'class',
  password: 'Class25_26',
  database: 'marsbd',
  port: 1194,
  connectionLimit: 10,
});

// Para que el archivo del servidor pueda pedirle conexiones: module.exports = <variable>
module.exports = pool;
