const request = require('supertest');

// Create a simple Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running", 
    timestamp: new Date().toISOString()
  });
});

// Simple login endpoint
app.post('/api/login', (req, res) => {
  const { id, mobile } = req.body;
  
  if (!id || !mobile) {
    return res.status(400).json({ 
      success: false, 
      message: "NIC and mobile number are required" 
    });
  }
  
  // Mock successful login
  if (id === '199512345679' && mobile === '94774567890') {
    return res.json({ 
      success: true, 
      message: "OTP sent to your mobile number",
      user: {
        nameWithInitials: 'S.K. Perera',
        nicNumber: '199512345679',
        mobileNumber: '94774567890'
      }
    });
  }
  
  // Mock user not found
  return res.status(404).json({ 
    success: false, 
    message: "Invalid NIC or mobile number" 
  });
});

// Simple OTP verification endpoint
app.post('/api/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  
  if (!mobile || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: "Mobile number and OTP are required" 
    });
  }
  
  // Mock successful OTP verification
  if (otp === '123456') {
    return res.json({ 
      success: true, 
      message: "OTP verified successfully"
    });
  }
  
  // Mock invalid OTP
  return res.status(401).json({ 
    success: false, 
    message: "Invalid OTP" 
  });
});

describe('Basic API Tests (No Database)', () => {
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

  test('POST /api/login should succeed with valid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ id: '199512345679', mobile: '94774567890' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('OTP sent');
    expect(response.body.user.nameWithInitials).toBe('S.K. Perera');
  });

  test('POST /api/verify-otp should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/verify-otp')
      .send({ mobile: '94774567890' });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/verify-otp should succeed with valid OTP', async () => {
    const response = await request(app)
      .post('/api/verify-otp')
      .send({ mobile: '94774567890', otp: '123456' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('OTP verified successfully');
  });
});