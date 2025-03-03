const { BankAccount, BankApi } = require('../models');
  
const getBankAccounts = async (req, res) => {
    try {
        const bankAccounts = await BankAccount.find({ isDeleted: false }).select('bankName bankCode bankAccount bankAccountName binBank');

        res.status(200).json({
            message: 'Bank Accounts fetched successfully',
            data: bankAccounts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createBankAccount = async (req, res) => {
    try {
        const {
            bankId,
            bankAccount,
            bankAccountName,
        } = req.body;

        if (!bankId || !bankAccount || !bankAccountName) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: bankName, bankAccount, bankAccountName'
            });
        }

        const bank = await BankApi.findById(bankId);

        if (!bank) {
            return res.status(400).json({
                success: false,
                message: 'Bank không tồn tại'
            });
        }

        const newBankAccount = new BankAccount({
            bankName: bank.bankName,
            bankCode: bank.bankCode,
            bankAccount,
            bankAccountName,
            binBank: bank.binBank,
        });

        const savedBankAccount = await newBankAccount.save();

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản ngân hàng thành công',
            data: savedBankAccount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo tài khoản ngân hàng',
            error: error.message
        });
    }
};

const updateBankAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            bankId,
            bankAccount,
            bankAccountName,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const bank = await BankApi.findById(bankId);

        if (!bank) {
            return res.status(400).json({
                success: false,
                message: 'Bank không tồn tại'
            });
        }

        const updatedBankAccount = await BankAccount.findByIdAndUpdate(
            id,
            { 
                bankName: bank.bankName,
                bankCode: bank.bankCode,
                bankAccount,
                bankAccountName,
                binBank: bank.binBank,
            },
            { new: true, runValidators: true }
        );

        if (!updatedBankAccount) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản ngân hàng'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật tài khoản ngân hàng thành công',
            data: updatedBankAccount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật tài khoản ngân hàng',
            error: error.message
        });
    }
};

const deleteBankAccount = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const deletedBankAccount = await BankAccount.findByIdAndDelete(id);

        if (!deletedBankAccount) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản ngân hàng'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa tài khoản ngân hàng vĩnh viễn thành công',
            data: deletedBankAccount
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa tài khoản ngân hàng',
            error: error.message
        });
    }
};

module.exports = { 
    getBankAccounts,
    createBankAccount, 
    updateBankAccount,
    deleteBankAccount
};
