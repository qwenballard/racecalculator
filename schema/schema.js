const graphql = require('graphql');
const axios = require('axios');
const { globalIdField } = require('graphql-relay');

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList
} = graphql;


/**
 * We get the node interface and field from the relay library.
 *
 * The first method is the way we resolve an ID to its object. The second is the
 * way we resolve an object that implements node to its type.
 */

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    if (type === "User") {
      return getUser(id);
    }
    if (type === "Race") {
      return getRace(id);
    }
    if (type === "Goal") {
      return getGoal(id);
    }
  },
  //we have two one to many relationships so how is this gonna work?
  (obj) => (obj.ships ? factionType : shipType)
);


/**
 * We define our basic user type.
 *
 * This implements the following type system shorthand:
 *   type Ship : Node {
 *     id: String!
 *     name: String
 *   }
 */


//User Type
const UserType = new GraphQLObjectType({ 
  name: 'User',
  description: 'A user who loves to run',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
    username: { type: GraphQLString, description: 'The name of the user' },
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

/**
 * We define a connection between a user and its races.
 * We define a connection between a faction and its ships.
 *
 * connectionType implements the following type system shorthand:
 *   type ShipConnection {
 *     edges: [ShipEdge]
 *     pageInfo: PageInfo!
 *   }
 *
 * connectionType has an edges field - a list of edgeTypes that implement the
 * following type system shorthand:
 *   type ShipEdge {
 *     cursor: String!
 *     node: Ship
 *   }
 */

 const { connectionType: raceConnection } = connectionDefinitions({
   nodeType: raceType,
 });

 const { connectionType: goalConnection } = connectionDefinitions({
   nodeType: goalType,
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