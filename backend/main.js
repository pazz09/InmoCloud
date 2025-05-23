import express from 'express';

// const express = require("express");

const app = express()
const port = 3000

app.get('/login', (req, res) => {
  res.send('Hello world');
})

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
