const bcrypt = require('bcrypt');
const { Staff } = require('../models');

const createAccount = async (req, res) => {
    try {
        const { name_staff, phone_staff, address_staff, email, password, is_admin } = req.body;

        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await Staff.create({
            name_staff,
            phone_staff,
            address_staff,
            email,
            password: hashedPassword,
            is_admin: is_admin || 0, 
        });

        res.status(201).json({ message: 'Account created successfully', staff: newStaff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateAccount = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = req.body;
    
        if (updateData.email || updateData.password) {
            return res.status(400).json({ message: 'Cannot update email or password via this endpoint' });
        }
    
        const updatedStaff = await Staff.findByIdAndUpdate(id, updateData, { new: true });
    
        if (!updatedStaff) {
            return res.status(404).json({ message: 'Account not found' });
        }
    
        res.status(200).json({ message: 'Account updated successfully', staff: updatedStaff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
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
  

module.exports = { 
    createAccount,
    updateAccount,
    toggleAccountStatus
};
