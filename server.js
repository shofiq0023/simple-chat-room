const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

const PORT = 9083;
const ON_ONLINE_EVENT = 'is_online';
const ON_OFFLINE_EVENT = 'is_offline';
const ON_MESSAGE_EVENT = 'chat_message';

let ip;

// Getting the IPv4
require('dns').lookup(require('os').hostname(), { family: 4 }, (err, add, fam) => {
    if (!err) {
        ip = add;
    } else {
        console.error(err);
    }
});

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    const protocol = req.protocol;
    const hostname = ip;
    const port = process.env.port | PORT;

    const fullServerUrl = `${protocol}://${hostname}:${port}`;
    res.render('index.ejs', { url: fullServerUrl });
});

const getTime = () => new Date().toLocaleString('en-IN');

io.sockets.on('connection', (socket) => {

    socket.on('username', (username) => {
        socket.username = username;
        const usernameObj = {username: username};
        io.emit(ON_ONLINE_EVENT, usernameObj);
    });

    socket.on(ON_MESSAGE_EVENT, (message) => {
        const messageObj = {
            username: socket.username,
            chatMessage: message,
            time: getTime()
        };

        io.emit(ON_MESSAGE_EVENT, messageObj);
    });

    socket.on('disconnect', () => {
        const usernameObj = {username: socket.username};
        io.emit(ON_OFFLINE_EVENT, usernameObj);
    });
});

const server = http.listen(PORT, () => {
    console.log('Server started on port: ' + PORT);
});