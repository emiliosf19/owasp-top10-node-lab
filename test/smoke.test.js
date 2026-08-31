const request = require('supertest');
const app = require('../app');

describe('Lab OWASP Top 10:2025 — humo', () => {
  test('la página de índice carga', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/OWASP Top 10:2025/);
  });

  test.each(['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10'])(
    'el índice del lab %s responde 200',
    async (lab) => {
      const res = await request(app).get(`/${lab}/`);
      expect(res.status).toBe(200);
    }
  );

  test.each(['a01', 'a05', 'a10'])('la solución de %s se renderiza', async (lab) => {
    const res = await request(app).get(`/solutions/${lab}`);
    expect(res.status).toBe(200);
  });

  test('A05: el login vulnerable acepta el bypass clásico de SQLi', async () => {
    const res = await request(app)
      .post('/a05/login')
      .type('form')
      .send({ username: 'admin', password: "' OR '1'='1" });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Logged in as|Sesión iniciada/i);
  });
});
