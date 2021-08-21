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

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
// app.get('/api/test', (req, res) => {
// });

const fakeUser = {
  id: 1,
  email: 'test@test.com',
  hash: '42r8c24'
};

app.get('/discs', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT discs.id, name, speed, awesome, image, brands.label as brand 
        FROM discs
        JOIN brands
        ON discs.brand = brands.id
      `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/discs/:id', async(req, res) => {
  try {
    const discId = req.params.id;
    const data = await client.query(`
    SELECT discs.id, name, speed, awesome, image, brands.label AS brand 
      FROM discs
      JOIN brands
      ON discs.brand = brands.id
      WHERE discs.name = '${discId}'
    `);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/discs', async(req, res) => {
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
      RETURNING *`, [newDisc.brand, newDisc.name, newDisc.speed, newDisc.awesome, newDisc.image, fakeUser.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/discs/:id', async(req, res) => {
  try {
    const discId = req.params.id;
    const data = await client.query(`
      DELETE FROM discs WHERE discs.id=$1
    `, [discId]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
