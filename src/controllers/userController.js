const express = require('express');
const routerUser = express.Router();
const userService = require('../services/userService');
const { generateAccessToken, authenticateToken } = require('../util/jwt');
const logger = require('../util/logger');

routerUser.post('/register', async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        if (newUser) {
            res.status(201).json({
                message: 'User created successfully',
                user: newUser
            });
        } else {
            res.status(400).json({ message: 'User creation failed' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

routerUser.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userService.validateLogin(username, password);
        if (user) {
            
            const token = generateAccessToken({
                username: user.username,
                role: user.role
            });
            res.status(200).json({
                message: 'Login successful',
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

// routerUser.patch('/:username/role', authenticateToken, async (req, res) => {
//   try {
//     // Only allow managers to change roles
//     if (req.user.role !== "manager") {
//       return res.status(403).json({ message: "Forbidden Access: Only managers can change roles" });
//     }
    
//     const { username } = req.params;
//     const { newRole } = req.body;
//     if (!newRole) {
//       return res.status(400).json({ message: 'New role is required' });
//     }
    
//     const updatedUser = await userService.updateUserRole(username, newRole);
//     if (updatedUser) {
//       res.status(200).json({
//         message: 'User role updated successfully',
//         user: updatedUser
//       });
//     } else {
//       res.status(400).json({ message: 'User role update failed' });
//     }
//   } catch (err) {
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// });

module.exports = routerUser;