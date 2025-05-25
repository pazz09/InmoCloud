import { loginRoute } from './routes/login.js'
import { userRoute } from './routes/user.js'
import express from 'express';

const app = express()
app.use(express.json());

const port = 3000





app.use('/login', loginRoute);
// app.use('/users', userRoute);



app.get('/users', (req, res) => {
  res.send('Hello world');
})

app.get('/payments', (req, res) => {
  res.send('Hello world');
})

app.get('/properties', (req, res) => {
  res.send('Hello world');
})

app.listen(port, () => {
  console.log("Listening on port " + port);
})
