const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Habilita CORS
app.use(express.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'proyect-ticket'
});

// Conectar a la base de datos
db.connect(err => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Endpoint para crear cliente y su ticket de mantenimiento
app.post('/api/clientes', (req, res) => {
  const { nombre, contacto, email, computadora, problema, diagnostico } = req.body;
  
  // 1. Insertar cliente
  const sqlCliente = `INSERT INTO clientes (Nombre_del_cliente, Contacto, Email, Computadora) 
                      VALUES (?, ?, ?, ?)`;
  
  db.query(sqlCliente, [nombre, contacto, email, computadora], (err, resultCliente) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const idCliente = resultCliente.insertId;
    
    // 2. Insertar mantenimiento para ese cliente
    const sqlMantenimiento = `INSERT INTO mantenimiento (problema, diagnostico, id_cliente) 
                              VALUES (?, ?, ?)`;
    
    db.query(sqlMantenimiento, [problema, diagnostico, idCliente], (err, resultMantenimiento) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({ 
        idCliente: idCliente,
        idMantenimiento: resultMantenimiento.insertId,
        message: 'Cliente y ticket creados exitosamente'
      });
    });
  });
});

// Endpoint para obtener todos los clientes con sus tickets
app.get('/api/clientes', (req, res) => {
  const sql = `
    SELECT 
      c.id_cliente,
      c.Nombre_del_cliente AS nombre, 
      c.Contacto, 
      c.Email, 
      c.Computadora,
      m.problema,
      m.diagnostico
    FROM clientes c
    JOIN mantenimiento m ON c.id_cliente = m.id_cliente
    ORDER BY c.id_cliente DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});