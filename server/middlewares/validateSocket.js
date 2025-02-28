const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifySocketConnection = async (socket, next) => { 
    try {
        const { initDataUnsafe } = socket.handshake.query;

        const initData = JSON.parse(initDataUnsafe);
    
        if (!initData) {
            console.log("Invalid data")
            return next(new Error("Invalid data"));
        }
    
        const token = initData.token && initData.token.split(' ')[1];
        if (!token) {
                return res.status(401).json({ message: 'Access token is required' });
        }
    
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            
            next(); 
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    verifySocketConnection
}