const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

let tacoRainActive = false;
let tacoRainEndTime = 0;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.emit('tacoStatus', {
    active: tacoRainActive,
    endTime: tacoRainEndTime
  });
  
  socket.on('startTaco', (data) => {
    tacoRainActive = true;
    tacoRainEndTime = Date.now() + 60000;
    console.log('Taco rain started!');
    
    io.emit('tacoStart', {
      endTime: tacoRainEndTime
    });
  });
  
  socket.on('stopTaco', () => {
    tacoRainActive = false;
    console.log('Taco rain stopped!');
    
    io.emit('tacoStop');
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

setInterval(() => {
  if(tacoRainActive && Date.now() > tacoRainEndTime) {
    tacoRainActive = false;
    io.emit('tacoStop');
    console.log('Taco rain auto-stopped');
  }
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
