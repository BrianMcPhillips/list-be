const client = require('../lib/client');
// import our seed data:
const discs = require('./discs.js');
const usersData = require('./users.js');
const brandsData = require('./brands');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      brandsData.map(brand => {
        return client.query(`
                      INSERT INTO brands (label)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [brand.label]);
      })
    );

    await Promise.all(
      discs.map(disc => {
        return client.query(`
                    INSERT INTO discs (brand, name, speed, awesome, image, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [disc.brand, disc.name, disc.speed, disc.awesome, disc.image, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
