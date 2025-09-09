const request = require('supertest');
const mongoose = require('mongoose');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('./test-utils');

// Import your actual server (make sure it exports the app properly)
const app = require('../server');

// Import your models
const Applicant = mongoose.model("Applicant");
const ApplicantModel = require('../server').ApplicantModel; // Adjust based on your export

// Test data
const testUser = {
  nameWithInitials: 'S.K. Perera',
  fullNameEnglish: 'Sunil Kumar Perera',
  nicNumber: '199512345679',
  dateOfBirth: '1995-08-20',
  permanentAddress: '45/3, Main Street, Negombo',
  policeDivision: 'Negombo',
  gnDivision: 'Negombo Central (06-112)',
  mobileNumber: '94774567890',
  email: 'sunil.perera@gmail.com',
  applications: []
};

describe('Real Database Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    // Create test user before each test
    await ApplicantModel.create(testUser);
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test('GET /api/health should return server status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is running');
  });

  test('POST /api/login should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ id: '' });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('NIC and mobile number are required');
  });

  test('POST /api/login should return 404 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ id: '999999999999', mobile: '94770000000' });
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid NIC or mobile number');
  });

  test('POST /api/login should succeed with valid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ id: '199512345679', mobile: '94774567890' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('OTP sent to your mobile number');
    expect(response.body.user).toHaveProperty('nameWithInitials', 'S.K. Perera');
    expect(response.body.user).toHaveProperty('nicNumber', '199512345679');
    expect(response.body.user).toHaveProperty('mobileNumber', '94774567890');
    
    // Verify OTP was stored
    expect(global.otpStore['94774567890']).toBeDefined();
    expect(global.otpStore['94774567890'].otp).toHaveLength(6);
  });

  test('POST /api/verify-otp should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/verify-otp')
      .send({ mobile: '94774567890' });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Mobile number and OTP are required');
  });

  test('POST /api/verify-otp should return 401 for invalid OTP', async () => {
    // First login to generate OTP
    await request(app)
      .post('/api/login')
      .send({ id: '199512345679', mobile: '94774567890' });
    
    const response = await request(app)
      .post('/api/verify-otp')
      .send({ mobile: '94774567890', otp: '999999' });
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid OTP');
  });

  test('POST /api/verify-otp should succeed with valid OTP', async () => {
    // First login to generate OTP
    const loginResponse = await request(app)
      .post('/api/login')
      .send({ id: '199512345679', mobile: '94774567890' });
    
    const otp = global.otpStore['94774567890'].otp;
    
    const response = await request(app)
      .post('/api/verify-otp')
      .send({ mobile: '94774567890', otp: otp });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('OTP verified successfully');
    
    // OTP should be removed after successful verification
    expect(global.otpStore['94774567890']).toBeUndefined();
  });

  test('GET /api/profile/:mobile should return user profile', async () => {
    const response = await request(app).get('/api/profile/94774567890');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toHaveProperty('nameWithInitials', 'S.K. Perera');
    expect(response.body.user).toHaveProperty('mobileNumber', '94774567890');
    expect(response.body.user).toHaveProperty('nicNumber', '199512345679');
  });

  test('GET /api/profile/:mobile should return 404 for non-existent user', async () => {
    const response = await request(app).get('/api/profile/94770000000');
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('User not found');
  });
});