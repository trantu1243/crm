
const { Permission } = require('../models');
  
const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find({});

        res.status(200).json({
            message: 'Permission fetched successfully',
            data: permissions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { 
    getPermissions,
};
