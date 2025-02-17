const { Staff } = require("../models");


const getUserWithPermissions = async (userId) => {
    try {
        // 🔍 Lấy thông tin user, populate roles và permissions
        const user = await Staff.findById(userId)
            .populate({
                path: "roles",
                populate: {
                    path: "permissions",
                    model: "Permission"
                }
            })
            .lean(); // Dùng .lean() để trả về Object thuần thay vì Mongoose Document

        if (!user) {
            return { status: false, message: "User not found" };
        }

        const permissions = new Set();
        user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                permissions.add(permission.slug);
            });
        });

        return {
            status: true,
            user: {
                ...user,
                permissions: Array.from(permissions)
            }
        };
    } catch (error) {
        console.error("❌ Lỗi lấy thông tin user:", error);
        return { status: false, message: "Internal server error" };
    }
};

module.exports = { getUserWithPermissions };
