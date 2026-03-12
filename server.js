const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let tacoRainActive = false;
let tacoRainEndTime = 0;

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/status', (req, res) => {
  res.json({
    active: tacoRainActive && Date.now() < tacoRainEndTime,
    endTime: tacoRainEndTime
  });
});

app.post('/status', (req, res) => {
  const { active } = req.body;
  if(active) {
    tacoRainActive = true;
    tacoRainEndTime = Date.now() + 60000;
    console.log('Taco rain started!');
  } else {
    tacoRainActive = false;
    console.log('Taco rain stopped!');
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
