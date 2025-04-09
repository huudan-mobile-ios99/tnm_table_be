const express = require('express')
const body_parser = require('body-parser')
const cors = require('cors')
const app = express();
const router = express.Router();
const http = require('http').createServer(app);  // Use the same http instance for express and socket.io
const io = require('socket.io')(http);
const path =require('path');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())
app.use(cors())


const routerAPI = require('./api')
app.use('/api', routerAPI)
//USE MONGODB DATABASE
require('./mongodb/mongo_config').connectDB();

//RANKING ROUTE
const rankingRoutes = require('./mongodb/mongo_operation');
app.use('/api', rankingRoutes);
//SETTING ROUTE
const settingRoutes = require('./mongodb/mongo_operation.settings');
app.use('/api/setting', settingRoutes);
//TIME ROUTE
const timeRoutes = require('./mongodb/mongo_operation.time');
app.use('/api/time', timeRoutes);
//STREAM ROUTE
const streamRoutes = require('./mongodb/mongo_operation.stream');
app.use('/api/stream', streamRoutes);
//JACKPOT ROUTE
const jackpotRoutes = require('./mongodb/mongo_operation.jackpot');
app.use('/api/jackpot',jackpotRoutes);
const memberRoutes = require('./mongodb/mongo_operation_member');
app.use('/api/member',memberRoutes);
const deviceRoutes = require('./mongodb/mongo_operation_device');
app.use('/api/device',deviceRoutes);
//JACKPOT DROP  ROUTE
const jackpotDropRoutes = require('./mongodb/mongo_operation.jackpot_drop');
app.use('/api/jackpot_drop',jackpotDropRoutes);



const port = process.env.PORT || 8083;
http.listen(port, () => {
    console.log('app running at port: ' + port);
});

//DEFAULT WEB
app.use(express.static('public-flutter'));
app.use(express.static('public-flutter/assets'));
router.get('/', (request, response) => {
    response.sendFile(path.resolve('./public-flutter/index.html'));
});

//USE SOCKET IO
const socketHandler = require('./socket/socket_handler');
socketHandler.handleSocketIO(io);

// RUN WEB
const compression = require('compression');
app.use(compression());
const oneDay = 86400000; // 24 hours in milliseconds
app.use(express.static(path.join(__dirname, 'public-flutter'), { maxAge: oneDay }));
// app.use(express.static(path.join(__dirname, 'public-flutter')));
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'public-flutter', 'index.html'));
});

