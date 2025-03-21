const request = require('supertest');
const express = require('express');
const routerUser = require('../src/controllers/userController'); 
const userService = require('../src/services/userService');
const { generateAccessToken } = require('../src/util/jwt');

jest.mock('../src/services/userService');
jest.mock('../src/util/jwt');

describe('User Controller', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.use('/users', routerUser);
  });

  describe('POST /users/register', () => {
    it('should return 201 and the created user when valid data is provided', async () => {
      const fakeUser = { username: 'johndoe', role: 'employee' };
      
      userService.createUser.mockResolvedValue(fakeUser);

      const res = await request(app)
        .post('/users/register')
        .send({ username: 'johndoe', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.user).toEqual(fakeUser);
      expect(userService.createUser).toHaveBeenCalledWith({
        username: 'johndoe',
        password: expect.any(String)
      });
    });


    
  });

  describe('POST /users (login)', () => {
    it('should return 200 and a token when valid credentials are provided', async () => {
      const fakeUser = { username: 'johndoe', role: 'employee', password: 'hashed' };
      userService.validateLogin.mockResolvedValue(fakeUser);
     
      generateAccessToken.mockReturnValue('fakeToken');

      const res = await request(app)
        .post('/users')
        .send({ username: 'johndoe', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBe('fakeToken');
      expect(userService.validateLogin).toHaveBeenCalledWith('johndoe', 'password123');
    });

    it('should return 401 when credentials are invalid (validateLogin returns null)', async () => {
      userService.validateLogin.mockResolvedValue(null);

      const res = await request(app)
        .post('/users')
        .send({ username: 'johndoe', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    
  });
});
