const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList
} = graphql;


//User Type
const UserType = new GraphQLObjectType({ 
  name: 'User',
  fields: () => ({
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    races: {
      type: new GraphQLList(RaceType),
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/users/${parentValue.id}/races`)
        .then(res => res.data);
      }
    },
    goals: {
      type: new GraphQLList(GoalType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${parentValue.id}/goals`)
        .then(res => res.data);
      }
    }
  })
});

const GoalType = new GraphQLObjectType({
  name: 'Goal',
  fields: () => ({
    userId: { type: GraphQLInt },
    id: { type: GraphQLInt },
    type: { type: GraphQLString },
    time: { type: GraphQLString },
    user: {
      type : UserType,
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/users/${parentValue.id}`)
        .then(res => res.data);
      }
    }
  })
});

const RaceType = new GraphQLObjectType({
  name: 'Race',
  fields: () => ({
    id: { type: GraphQLInt },
    date: { type: GraphQLString },
    type: { type: GraphQLString },
    time: { type: GraphQLString },
    user: {
      type: UserType,
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/users/${parentValue.id}`)
        .then(res => res.data);
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({ //root query allows us to jump into the graph. Entry point to a specific node.
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve(parentValue, args) { //purpose is to actually get out there and get the data
        // explore fetch vs axios here... we used pg when dealing with postgres... returned as a promise
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(res => res.data);
      }
    }
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { username, email, password }) {
        return axios.post(`http://localhost:3000/users`, { username, email, password })
          .then(res => res.data)
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, args) {
        console.log(args)
        return axios.delete(`http://localhost:3000/users/${args.id}`)
          .then(res => {
            return res.data;
          })
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});