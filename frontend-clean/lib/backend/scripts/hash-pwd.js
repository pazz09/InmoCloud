#!/usr/bin/node
import { genSalt, hash as _hash } from 'bcryptjs';

// Replace this with your password input
const password = process.argv[2]
console.log("Hashing " + password);

// Hash the password
genSalt(10, (err, salt) => {
  if (err) throw err;

  _hash(password, salt, (err, hash) => {
    if (err) throw err;

    console.log('Hashed password:', hash);
  });
});

