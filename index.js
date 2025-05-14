import express from 'express';
import person from './person.js';
import openapi from './openapi.js';

const port = process.env.PORT || 3000;
const app = express();

app.use('/api-docs', openapi);  // mount once, don't double route
app.use('/persons', person);

app.get('/', (_, res) => {
  res.redirect('/api-docs');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
