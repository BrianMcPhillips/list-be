
require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    // let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      // token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns discs', async() => {

      const expectation = [
        {
          name: 'Leopard',
          speed: 6,
          awesome: false,
          image: 'https://m.media-amazon.com/images/I/615MEcHI-dS._AC_SL1280_.jpg',
          brand: 'Innova'
        },
        {
          name: 'Beast',
          speed: 10,
          awesome: true,
          image: 'https://m.media-amazon.com/images/I/61Mtc6A+g0L._AC_SL1001_.jpg',
          brand: 'Innova'
        },
        {
          name: 'Tee-Bird',
          speed: 7,
          awesome: true,
          image: 'https://m.media-amazon.com/images/I/61HUfu-Ky9L._AC_SL1200_.jpg',
          brand: 'Innova'
        },
        {
          name: 'Valkyrie',
          speed: 9,
          awesome: true,
          image: 'https://m.media-amazon.com/images/I/61vV2suCwfL._AC_SL1001_.jpg',
          brand: 'Innova'
        },
        {
          name: 'VROC',
          speed: 4,
          awesome: false,
          image: 'https://m.media-amazon.com/images/I/612HP7JYMvL._AC_SX425_.jpg',
          brand: 'Innova'
        }
      ];

      const data = await fakeRequest(app)
        .get('/discs')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
