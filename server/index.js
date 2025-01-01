import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Custom files
import { getLocalIPAddress, Logger } from './utils/Helper.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const log = new Logger();

const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Server is working fine :)"
    });
});

io.on('connection', socket => {
    log.info("Socket Client Connected, ID : "+socket.id);

    socket.on('disconnect', () => {
        log.info("Client (ID : "+socket.id+") disconnected");
    })
})

server.listen(PORT, () => {
    log.info("Server is starting...");
    const URL = `http://${getLocalIPAddress()}:${PORT}`;
    log.info(`Server is running on: ${URL}`);
});
