const axios = require('axios');
require('dotenv').config();

/**
 * Gọi API VietQR để tạo link QR
 * @param {Object} payload Dữ liệu để gửi đến API VietQR
 * @returns {Promise<string>} Link QR code
 */
const generateQrCode = async (payload) => {
    try {
        const { accountNo, accountName, acqId, addInfo, amount, template } = payload;

        const response = await axios.post('https://api.vietqr.io/v2/generate', {
            accountNo,
            accountName,
            acqId,
            addInfo,
            amount,
            template: template || 'compact',
        }, {
            headers: {
                'x-client-id': process.env.VIETQR_CLIENT_ID,
                'x-api-key': process.env.VIETQR_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        return response.data.qrCodeUrl; 
    } catch (error) {
        console.error('Error generating QR code:', error.message);
        throw new Error('Failed to generate QR code');
    }
};

module.exports = {
    generateQrCode,
};
