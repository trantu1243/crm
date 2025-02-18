const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const { Staff } = require('../models');

const createAccount = async (req, res) => {
    try {
        const requiredFields = ['name_staff', 'phone_staff', 'email', 'uid_facebook', 'password'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        let { name_staff, phone_staff, email, uid_facebook, password, permission_bank = [] } = req.body;

        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        if (!Array.isArray(permission_bank)) {
            return res.status(400).json({ message: "permission_bank phải là một mảng" });
        }

        permission_bank = permission_bank.map(id => mongoose.isValidObjectId(id) ? mongoose.Types.ObjectId(id) : null).filter(Boolean);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await Staff.create({
            name_staff,
            phone_staff,
            email,
            uid_facebook,
            password: hashedPassword,
            permission_bank
        });

        await newStaff.save();

        res.status(201).json({ message: "Tạo nhân viên thành công!", staff: newStaff });
    } catch (error) {
        console.error("Lỗi khi tạo nhân viên:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const requiredFields = ['name_staff', 'phone_staff', 'email', 'uid_facebook'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        let { name_staff, phone_staff, email, uid_facebook, permission_bank = [], password } = req.body;

        if (!Array.isArray(permission_bank)) {
            return res.status(400).json({ message: "permission_bank phải là một mảng" });
        }

        permission_bank = permission_bank.map(id => mongoose.isValidObjectId(id) ? mongoose.Types.ObjectId(id) : null).filter(Boolean);


        // Kiểm tra xem nhân viên có tồn tại không
        const staff = await Staff.findById(id);
        if (!staff) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên!" });
        }

        // Cập nhật thông tin
        staff.name_staff = name_staff || staff.name_staff;
        staff.phone_staff = phone_staff || staff.phone_staff;
        staff.email = email || staff.email;
        staff.uid_facebook = uid_facebook || staff.uid_facebook;
        staff.permission_bank = permission_bank || staff.permission_bank;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            staff.password = hashedPassword;
        }

        await staff.save();

        res.status(200).json({ message: "Cập nhật nhân viên thành công!", staff });
    } catch (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};


const toggleAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
    
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use "active" or "inactive".' });
        }
    
        const updatedStaff = await Staff.findByIdAndUpdate(id, { status }, { new: true });
    
        if (!updatedStaff) {
            return res.status(404).json({ message: 'Account not found' });
        }
    
        res.status(200).json({ message: `Account ${status} successfully`, staff: updatedStaff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
  
const getStaffs = async (req, res) => {
    try {
        const staffs = await Staff.find({ status: 'active' }).select('name_staff email');

        res.status(200).json({
            message: 'Staffs fetched successfully',
            data: staffs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllStaffs = async (req, res) => {
    try {
        const staffs = await Staff.find({ status: 'active' });

        res.status(200).json({
            message: 'Staffs fetched successfully',
            data: staffs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findById(id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({
            message: 'Staff fetched successfully',
            data: staff,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = { 
    createAccount,
    updateAccount,
    toggleAccountStatus,
    getStaffs,
    getById,
    getAllStaffs
};
