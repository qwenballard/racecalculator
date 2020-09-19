const express = require('express');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const schema = require('../schema/schema');

const PORT = 3333;

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const authController = require('./authController');

app.get('/gql', expressPlayground({ endpoint: '/graphql' }));

app.use('/build', express.static(path.join(__dirname, '../build')));

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: false,
  }),
);

app.post('/login', authController.login, authController.setCookie, (req, res) => {
  // console.log('iam in login endpoint')
  res.redirect('/profile');
});

app.get('/profile', authController.verify, (req, res) => {
  res.status(200).json(res.locals.user); // can we grab from the cookie?
});

app.get('/', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../client/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
