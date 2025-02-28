
const mongoose = require('mongoose');
const { Role, Staff } = require('../models');
const { saveUserLogToQueue } = require('../services/log.service');
  
const getRoles = async (req, res) => {
    try {
        const roles = await Role.aggregate([
            {
                $lookup: {
                    from: "staffs",
                    localField: "_id",
                    foreignField: "roles",
                    as: "staffs"
                }
            },
            {
                $project: {
                    name: 1,
                    status: 1,
                    permissions: 1,
                    staffs: { $map: { input: "$staffs", as: "staff", in: "$$staff._id" } }
                }
            }
        ]);

        res.status(200).json({
            message: 'Role fetched successfully',
            data: roles,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 📌 1. Tạo Role mới
const createRole = async (req, res) => {
    try {
        const requiredFields = ['name'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }
        let { name, permissions = [], staffId = [] } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ message: "Permissions phải là một mảng" });
        }

        if (!Array.isArray(staffId)) {
            return res.status(400).json({ message: "staffId phải là một mảng" });
        }

        const role = await Role.create({
            name,
            permissions
        });

        await Staff.updateMany(
            { _id: { $in: staffId } },
            { $addToSet: { roles: role._id } } 
        );

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, role._id, "CREATE_ROLE", "Tạo role", req);

        return res.json({ status: true, message: "Tạo role thành công", role });
    } catch (error) {
        console.error("❌ Lỗi khi tạo role:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// 📌 2. Chỉnh sửa Role (Cập nhật danh sách quyền và nhân viên)
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, permissions = [], staffId = [] } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ message: "Permissions phải là một mảng" });
        }

        const role = await Role.findByIdAndUpdate(
            id,
            { name, permissions },
            { new: true }
        );

        if (!role) {
            return res.status(404).json({ status: false, message: "Không tìm thấy Role" });
        }

        await Staff.updateMany(
            { roles: id },
            { $pull: { roles: id } }
        );

        if (staffId.length > 0) {
            await Staff.updateMany(
                { _id: { $in: staffId } },
                { $addToSet: { roles: id } } 
            );
        }

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, role._id, "UPDATE_ROLE", "Chỉnh sửa role", req);

        return res.json({ status: true, message: "Cập nhật Role thành công", role });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật Role:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// 📌 3. Xóa Role
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra Role có tồn tại không
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ status: false, message: "Không tìm thấy Role" });
        }

        // Xóa Role khỏi danh sách roles của Staff
        await Staff.updateMany({}, { $pull: { roles: id } });

        // Xóa Role
        await Role.findByIdAndDelete(id);

        const user = await Staff.findById(req.user.id);
        await saveUserLogToQueue(user._id, role._id, "DELETE_ROLE", "Xóa role", req);

        return res.json({ status: true, message: "Xóa Role thành công" });
    } catch (error) {
        console.error("❌ Lỗi khi xóa Role:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { 
    createRole,
    updateRole,
    deleteRole,
    getRoles,
};
