require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('routes', () => {
  let token;

  const newDisc = {
    id: 6,
    brand: 1,
    name: 'CoolDisc',
    speed: 3,
    awesome: true,
    image: 'https://m.media-amazon.com/images/I/61Mtc6A+g0L._AC_SL1001_.jpg'
  };

  beforeAll(async done => {
    execSync('npm run setup-db');
  
    client.connect();
  
    const signInData = await fakeRequest(app)
      .post('/auth/signup')
      .send({
        email: 'jon@user.com',
        password: '1234'
      });
      
    token = signInData.body.token; // eslint-disable-line
  
    return done();
  });
  
  afterAll(done => {
    return client.end(done);
  });

  test('returns created disc', async(done) => {
    const data = await fakeRequest(app)
      .post('/api/discs')
      .send(newDisc)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(newDisc);
    done();
  });
});
