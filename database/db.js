//realizamos la conexion
const mysql = require('mysql');
const connection = mysql.createConnection({
    //Con variables de entorno
    host     : process.env.MYSQL_ADDON_HOST,
    user     : process.env.MYSQL_ADDON_USER,
    password : process.env.MYSQL_ADDON_PASSWORD,
    database : process.env.MYSQL_ADDON_DB,
});

connection.connect((error)=>{
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('¡Conectado a la Base de Datos!');
  });

  module.exports = connection;