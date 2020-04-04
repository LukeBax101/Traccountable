const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const morgan = require('morgan');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');
var http = require('http');

const bookshelf = require('./db/bookshelf');
const auth = require('./routes/auth');
const track = require('./routes/track');
const metric = require('./routes/metric');
const reading = require('./routes/reading');

const password = fs.readFileSync(path.join(__dirname,  `../secrets/password`), 'utf8').trim();

const app = express();

app.use(morgan('tiny'));
app.use(cors({credentials: true, origin: 'http://localhost:8080'}));
app.use(bodyParser.json());
app.use(cookieParser(password));

var server = http.createServer(app);
let io = socketIO.listen(server, {
    transports: ['websocket']
});

function authMiddleware(req, res, next) {
  if (req.signedCookies.track_id === req.params.trackId) {
    next();
  } else {
    res.status(401);
    res.send('Unauthorised');
  }
}


app.use('/', express.static(path.join(__dirname, '../frontend/dist'));
app.use('/auth', auth);
app.use('/track/:trackId', authMiddleware, (req, res, next) => {
    req.trackId = req.params.trackId;
    req.socketio = io;
    next();
}, track);
app.use('/track/:trackId/metric', authMiddleware ,function (req, res, next) {
    req.trackId = req.params.trackId;
    req.socketio = io;
    next();
}, metric);
app.use('/track/:trackId/metric/:metricId/reading', authMiddleware, (req, res, next) => {
    req.trackId = req.params.trackId;
    req.metricId = req.params.metricId;
    req.socketio = io;
    next();
}, reading);


const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`listening on ${port}`);
});
