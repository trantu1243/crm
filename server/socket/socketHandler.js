let io;

const initSocket = (serverIo) => {
    io = serverIo;
    io.on('connection', async (socket) => {
        
        socket.on('disconnect', () => {
            
        });
    });
};

const getSocket = () => {
    if (!io) {
        throw new Error('Socket.IO chưa được khởi tạo!');
    }
    return io;
};

module.exports = {
    initSocket,
    getSocket,
};