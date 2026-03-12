const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let tacoActive = false;
let tacoEndTime = 0;

app.get('/', (req, res) => {
  if(tacoActive && Date.now() > tacoEndTime) {
    tacoActive = false;
  }
  res.json({ active: tacoActive });
});

app.post('/start', (req, res) => {
  tacoActive = true;
  tacoEndTime = Date.now() + 60000;
  console.log('Taco started');
  res.json({ success: true });
});

app.post('/stop', (req, res) => {
  tacoActive = false;
  console.log('Taco stopped');
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
