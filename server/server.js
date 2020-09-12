const express = require('express');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
const schema = require('../schema/schema')


const PORT = 3333;

const app = express();
app.use(express.json());

app.get('/gql', expressPlayground({ endpoint: '/graphql' }));

app.use('/build', express.static(path.join(__dirname, '../build')));

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: false
  })
);

app.get('/', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../client/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`)
});
