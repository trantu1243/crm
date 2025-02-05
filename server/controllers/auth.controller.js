const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Staff } = require('../models');
require('dotenv').config();

const login = async (req, res) => {
    try {
        const requiredFields = ['email', 'password'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }
        const { email, password } = req.body;

        const user = await Staff.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
     
        const isPasswordValid = bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign(
            { id: user._id, is_admin: user.is_admin },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '240h' }
        );

        res.json({ 
            message: 'Login successful', 
            token: accessToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const authToken = async (req, res) => {
    try {
        const user = await Staff.findById(req.user.id).select('name_staff email uid_facebook avatar');
        res.json({ 
            message: 'Login successful', 
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { 
    login,
    authToken
};
