const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const Payment = require('../models/payment');

const JWT_SECRET = '3sIueX5FbB9B1G4vX9+OwI7zFt/P9FPW3sLd0R9MxHQ=';
exports.register = async (req, res) => {
    const { username, email, password, phone, balance } = req.body;
    console.log(username + email + password + phone + balance);

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            phone,
            balance
        });

        res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {

    console.error('Registration error:', error);
    res.status(400).json({ error: 'User registration failed!' });
  }
};
    
exports.login = async (req,res) => {
    const { email, password } = req.body;

    try{
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
         
        if(!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials!'});
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: '1h',
          });
      
          res.status(200).json({ token, userId: user._id });
        } catch (error) {
          res.status(400).json({ error: 'Login failed!' });
          console.error('Login error:', error);
        }
};

exports.getUserData = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found!' });
      }
  
      res.status(200).json({
        name: user.username,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        payments: user.payments,
        receipts: user.receipts,
      });
    } catch (error) {
      console.error('Get data error:', error);
      res.status(401).json({ error: 'Unauthorized!' });
    }
  };

exports.update = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    const { email, currentPassword, newName, newPassword, newPhone } = req.body;
    
    console.log('Incoming request:', { email, currentPassword, newName, newPassword, newPhone});
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found!' });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect!' });
      }
  
      if (newName) {
        user.username = newName;
        console.log('Name updated:', newName);
      }
  
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        console.log('Password updated:', newPassword);
      }
  
      if (newPhone) {
        user.phone = newPhone;
        console.log('Phone updated:', newPhone);
      }
  
      await user.save({ fields: ['name', 'password', 'phone'] });
  
        res.status(200).json({
        message: 'User information updated successfully!',
        userId: user._id,
        updatedDetails: {
          name: user.username,
          email: user.email,
          password: user.password,
          phone: user.phone,
        }
      });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid or expired token!' });
        }
            console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user information!' });
    }
  };

  exports.sendMoney = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const senderId = decoded.id;
        const { recipientEmail, amount } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const sender = await User.findById(senderId);
        const recipient = await User.findOne({ email: recipientEmail });

        if (!sender || !recipient) {
            return res.status(404).json({ error: 'User not found!' });
        }

        if (Number(sender.balance) < Number(amount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

      
        sender.balance = Number(sender.balance) - Number(amount);
        recipient.balance = Number(recipient.balance) + Number(amount);

        const payment = await Payment.create({
            amount: Number(amount),
            senderId: sender._id,
            receiverId: recipient._id,
            date: new Date()
        });

        sender.payments.push({
            paymentId: payment._id,
            recipientName: recipient.username
        });

        recipient.receipts.push({
            paymentId: payment._id,
            senderName: sender.username
        });
        
        await sender.save();
        await recipient.save();

        res.status(200).json({
            message: `Successfully sent ${amount} to ${recipientEmail}`,
            transaction: {
                paymentId: payment._id,
                amount: payment.amount,
                senderEmail: sender.email,
                recipientEmail: recipientEmail
            },
            sender: {
                email: sender.email,
                balance: sender.balance
            },
            recipient: {
                email: recipientEmail,
                balance: recipient.balance
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid or expired token!' });
        }
        console.error('Error transferring money:', error);
        res.status(500).json({ error: 'Failed to send money' });
    }
};
