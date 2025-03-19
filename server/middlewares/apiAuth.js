require('dotenv').config();

const apiAuthMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    const secretToken = `Bearer ${process.env.SECRET_TOKEN}`;

    if (!token || token !== secretToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
};

module.exports = apiAuthMiddleware;
