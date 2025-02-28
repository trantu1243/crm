const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const { Staff } = require('../models');
const { saveUserLogToQueue } = require('../services/log.service');

const createAccount = async (req, res) => {
    try {
        const requiredFields = ['name_staff', 'phone_staff', 'email', 'uid_facebook', 'password', 'cf_password'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        let { name_staff, phone_staff, email, uid_facebook, password, cf_password, permission_bank = [] } = req.body;

        if ( password !== cf_password ) return res.status(400).json({ message: "Mật khẩu không khớp!" });

        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        if (!Array.isArray(permission_bank)) {
            return res.status(400).json({ message: "permission_bank phải là một mảng" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await Staff.create({
            name_staff,
            phone_staff,
            email,
            uid_facebook,
            password: hashedPassword,
            permission_bank
        });

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, newStaff._id, "CREATE_STAFF", "Tạo nhân viên", req);

        return res.status(201).json({ message: "Tạo nhân viên thành công!", staff: newStaff });
    } catch (error) {
        console.error("Lỗi khi tạo nhân viên:", error);
        return res.status(500).json({ message: "Lỗi server!" });
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

        let { name_staff, phone_staff, email, uid_facebook, permission_bank = [], password, cf_password } = req.body;

        if (!Array.isArray(permission_bank)) {
            return res.status(400).json({ message: "permission_bank phải là một mảng" });
        }

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
            if ( password !== cf_password ) return res.status(400).json({ message: "Mật khẩu không khớp!" });
            
            const hashedPassword = await bcrypt.hash(password, 10);
            staff.password = hashedPassword;
        }

        await staff.save();

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, staff._id, "UPDATE_STAFF", "Chỉnh sửa nhân viên", req);

        return res.status(200).json({ message: "Cập nhật nhân viên thành công!", staff });
    } catch (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        return res.status(500).json({ message: "Lỗi server!" });
    }
};


const toggleAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        

        const updatedStaff = await Staff.findById(id);
    
        if (!updatedStaff) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (updatedStaff.status === 'active') updatedStaff.status = 'block';
        else updatedStaff.status = 'active';

        await updatedStaff.save();

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, updatedStaff._id, "TOGGLE_STAFF", "Bật/tắt nhân viên", req);
    
        return res.status(200).json({ message: `Account toggle status successfully`, staff: updatedStaff });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
  
const getStaffs = async (req, res) => {
    try {
        const staffs = await Staff.find({ status: 'active' }).select('name_staff email');

        return res.status(200).json({
            message: 'Staffs fetched successfully',
            data: staffs,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllStaffs = async (req, res) => {
    try {
        const staffs = await Staff.find();

        return res.status(200).json({
            message: 'Staffs fetched successfully',
            data: staffs,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findById(id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        return res.status(200).json({
            message: 'Staff fetched successfully',
            data: staff,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
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
