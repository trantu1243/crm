const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { Staff } = require('../models');
const { saveUserLogToQueue } = require('../services/log.service');
require('dotenv').config();

const login = async (req, res) => {
    try {
        const requiredFields = ['email', 'password'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `Chưa nhập ${field}` });
            }
        }
        const { email, password } = req.body;

        const user = await Staff.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }
     
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        const accessToken = jwt.sign(
            { id: user._id, is_admin: user.is_admin },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '240h' }
        );

        await saveUserLogToQueue(user._id, user._id, "LOGIN", "User logged in", req);

        res.json({ 
            message: 'Đăng nhập thành công', 
            token: accessToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const authToken = async (req, res) => {
    try {
        const user = await Staff.findById(req.user.id).select('name_staff email uid_facebook avatar is_admin permission_bank roles phone_staff').populate(
            [
                { path: 'permission_bank', select: 'bankName bankCode bankAccount bankAccountName binBank' }
            ]
        );
        res.json({ 
            message: 'Login successful', 
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const changePassword = async (req, res) => {
    try {
     
        const { oldPassword, newPassword } = req.body;
    
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
        }
    
        const user = await Staff.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
    
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
        }
    
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
        user.password = hashedNewPassword;
        await user.save();
    
        return res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports = { 
    login,
    authToken,
    changePassword
};
