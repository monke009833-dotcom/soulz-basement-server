const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let tacoActive = false;
let tacoEndTime = 0;
let announcement = null;

app.get('/', (req, res) => {
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

app.get('/announcement', (req, res) => {
  res.json({ announcement: announcement });
});

app.post('/announcement', (req, res) => {
  const { text, role, sender } = req.body;
  announcement = { text, role, sender, time: Date.now() };
  console.log('Announcement set:', text);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
