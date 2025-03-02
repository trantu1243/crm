const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifySocketConnection = async (socket, next) => { 
    try {
        const { initDataUnsafe } = socket.handshake.query;

        if (!initDataUnsafe) {
            console.log("Invalid data");
            return next(new Error("Invalid data"));
        }

        let initData;
        try {
            initData = JSON.parse(initDataUnsafe);
        } catch (error) {
            console.log("Failed to parse initData");
            return next(new Error("Invalid data format"));
        }

        const token = initData.token && initData.token.split(' ')[1];
        if (!token) {
            console.log("Access token is required");
            return next(new Error("Access token is required"));
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log("Invalid or expired token");
                return next(new Error("Invalid or expired token"));
            }

            // Nếu token hợp lệ, lưu thông tin user vào socket
            socket.user = user;
            next(); 
        });

    } catch (error) {
        console.error("Socket authentication error:", error);
        return next(new Error("Internal server error"));
    }
};

module.exports = {
    verifySocketConnection
};
