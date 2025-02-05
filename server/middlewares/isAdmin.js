const { Staff } = require("../models");

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await Staff.findById(userId);

        if (!user || user.is_admin !== 1) {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = isAdmin;
