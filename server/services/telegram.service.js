const axios = require('axios');
require('dotenv').config();

const sendMessage = async (message) => {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.CHAT_ID;
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
        });
    } catch (error) {
        console.error('Lỗi kết nối:', error.message);
    }
};

module.exports = {
    sendMessage
}