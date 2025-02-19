import { io } from 'socket.io-client';
import { SERVER_URL } from './url';

let socket = null;

export const getSocket = (initData) => {
    if (!socket) {
        socket = io(SERVER_URL, {
            query: {
                initDataUnsafe: JSON.stringify(initData),
            },
        });
    }
    return socket;
};

export const closeSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default socket;