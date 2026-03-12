const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let tacoActive = false;

app.get('/', (req, res) => {
  res.json({ active: tacoActive });
});

app.post('/start', (req, res) => {
  tacoActive = true;
  console.log('Taco rain started');
  res.json({ success: true });
});

app.post('/stop', (req, res) => {
  tacoActive = false;
  console.log('Taco rain stopped');
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
