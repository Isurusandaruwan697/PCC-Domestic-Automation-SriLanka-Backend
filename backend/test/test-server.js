const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: "Test server is running", 
    timestamp: new Date().toISOString()
  });
});

// Mock login endpoint for testing
app.post('/api/login', async (req, res) => {
  try {
    const { id, mobile } = req.body;
    
    if (!id || !mobile) {
      return res.status(400).json({ 
        success: false, 
        message: "NIC and mobile number are required" 
      });
    }
    
    // Mock user validation
    if (id === '199512345679' && mobile === '94774567890') {
      // Generate OTP (6 digits)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in memory for testing
      global.otpStore = global.otpStore || {};
      global.otpStore[mobile] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000
      };
      
      return res.json({ 
        success: true, 
        message: "OTP sent to your mobile number",
        user: {
          nameWithInitials: 'S.K. Perera',
          fullNameEnglish: 'Sunil Kumar Perera',
          nicNumber: '199512345679',
          mobileNumber: '94774567890',
          dateOfBirth: '1995-08-20',
          permanentAddress: '45/3, Main Street, Negombo',
          policeDivision: 'Negombo',
          gnDivision: 'Negombo Central (06-112)',
          email: 'sunil.perera@gmail.com'
        }
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid NIC or mobile number" 
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Mock OTP verification
app.post('/api/verify-otp', (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Mobile number and OTP are required" 
      });
    }
    
    global.otpStore = global.otpStore || {};
    const storedOtpData = global.otpStore[mobile];
    
    if (storedOtpData && storedOtpData.expires > Date.now()) {
      if (storedOtpData.otp === otp) {
        delete global.otpStore[mobile];
        return res.json({ 
          success: true, 
          message: "OTP verified successfully"
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid OTP" 
        });
      }
    } else {
      return res.status(401).json({ 
        success: false, 
        message: "OTP has expired or is invalid" 
      });
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Mock profile endpoint
app.get('/api/profile/:mobile', (req, res) => {
  const { mobile } = req.params;
  
  if (mobile === '94774567890') {
    res.json({ 
      success: true, 
      user: {
        nameWithInitials: 'S.K. Perera',
        fullNameEnglish: 'Sunil Kumar Perera',
        nicNumber: '199512345679',
        mobileNumber: '94774567890',
        dateOfBirth: '1995-08-20',
        permanentAddress: '45/3, Main Street, Negombo',
        policeDivision: 'Negombo',
        gnDivision: 'Negombo Central (06-112)',
        email: 'sunil.perera@gmail.com',
        applications: []
      }
    });
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
});

module.exports = app;