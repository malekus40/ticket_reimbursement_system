const express = require('express');
const app = express();
const routerUser = require('./controllers/userController');
const routerTicket = require('./controllers/ticketController');

const PORT = 3000;

app.use(express.json());


app.use('/login', routerUser);
app.use('/tickets', routerTicket);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
