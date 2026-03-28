const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('Task manager backend is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3000`);
});
