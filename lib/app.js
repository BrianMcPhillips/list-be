const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

app.use('/auth', authRoutes);

app.use('/api', ensureAuth);


app.get('/api/discs', async(req, res) => {
  try {
    const userId = req.userId;
    const data = await client.query(`
      SELECT discs.id, name, speed, awesome, image, owner_id, brands.label as brand 
        FROM discs
        JOIN brands
        ON discs.brand = brands.id
        WHERE discs.owner_id=${userId}
      `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/discs/:id', async(req, res) => {
  try {
    const discId = req.params.id;
    const data = await client.query(`
    SELECT discs.id, name, speed, awesome, image, owner_id, brands.label AS brand 
      FROM discs
      JOIN brands
      ON discs.brand = brands.id
      WHERE discs.name=$1 AND discs.owner_id=$2
    `, [discId, req.userId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/brands', async(req, res) => {
  try {
    const data = await client.query('SELECT * FROM brands');
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/discs', async(req, res) => {
  try {
    const newDisc = {
      brand: req.body.brand,
      name: req.body.name,
      speed: req.body.speed,
      awesome: req.body.awesome,
      image: req.body.image
    };
    const data = await client.query(`
      INSERT INTO discs(brand, name, speed, awesome, image, owner_id)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`, [newDisc.brand, newDisc.name, newDisc.speed, newDisc.awesome, newDisc.image, req.userId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/discs/:id', async(req, res) => {
  try {
    const discId = req.params.id;
    const data = await client.query(`
      DELETE FROM discs WHERE discs.name=$1 AND discs.owner_id=$2
    `, [discId, req.userId]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/discs/:id', async(req, res) => {
  try {
    const discId = req.params.id;
    const updatedDisc = {
      brand: req.body.brand,
      name: req.body.name,
      speed: req.body.speed,
      awesome: req.body.awesome,
      image: req.body.image
    };
    const data = await client.query(`
      UPDATE discs
      SET brand=$1, name=$2, speed=$3, awesome=$4, image=$5
      WHERE discs.id=$6 AND discs.owner_id=$7
      RETURNING *
    `, [updatedDisc.brand, updatedDisc.name, updatedDisc.speed, updatedDisc.awesome, updatedDisc.image, discId, req.body.ownerId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
