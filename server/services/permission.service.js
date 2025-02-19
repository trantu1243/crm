const { Staff } = require("../models");

const getPermissions = async (userId) => {
   
    const user = await Staff.findById(userId)
        .populate({
            path: 'roles', // Populate role của user
            populate: {
                path: 'permissions', // Populate tiếp permissions trong roles
                model: 'Permission'
            }
        })
        .lean();

    if (!user) {
        return { status: false, message: "User not found" };
    }

    // 📌 Lấy tất cả permissions từ các roles của user
    const permissions = user.roles.flatMap(role => role.permissions);

    return permissions;
};

module.exports = {
    getPermissions
};
