const graphql = require('graphql');
const axios = require('axios');
const { globalIdField, connectionArgs, connectionFromArray } = require('graphql-relay');

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
 * We define our basic  goal, race, (ship) type.
 *
 * This implements the following type system shorthand:
 *   type Ship : Node {
 *     id: String!
 *     name: String
 *   }
 */

const GoalType = new GraphQLObjectType({
  name: "Goal",
  description: 'A goal for a specific user',
  interfaces: [nodeInterface],
  fields: () => ({
    userId: { type: GraphQLInt },
    id: globalIdField(),
    type: { type: GraphQLString },
    time: { type: GraphQLString },
  })
});

const RaceType = new GraphQLObjectType({
  name: "Race",
  description: 'A race for a specific user',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalId(),
    date: { type: GraphQLString },
    type: { type: GraphQLString },
    time: { type: GraphQLString },
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
      type: raceConnection,
      description: 'The races for a specific user',
      args: connectionArgs,
      resolve: (user, args) =>
       connectionFromArray(user.races.map(getRace), args),
    },
    goals: {
      type: goalConnection,
      description: 'The goals for a specific user',
      args: connectionArgs,
      resolve: (parentValue, args) =>
        connectionFromArray(user.goals.map(getGoal), args),
    },
  })
});

/**
 * This is the type that will be the root of our query, and the
 * entry point into our schema.
 *
 * This implements the following type system shorthand:
 *   type Query {
 *     rebels: Faction
 *     empire: Faction
 *     node(id: String!): Node
 *   }
 */

const queryType = new GraphQLObjectType({ //root query allows us to jump into the graph. Entry point to a specific node.
  name: 'Query',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve: (parentValue, args) => { //purpose is to actually get out there and get the data
        // explore fetch vs axios here... we used pg when dealing with postgres... returned as a promise
        //They are doing something slightly different. Ask Qwen and Liz
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(res => res.data);
      }
    },
    node: nodeField,
  })
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { username, email, password }) {
        return axios
          .post(`http://localhost:3000/users`, { username, email, password })
          .then((res) => res.data);
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        console.log(args);
        return axios
          .delete(`http://localhost:3000/users/${args.id}`)
          .then((res) => {
            return res.data;
          });
      },
    },
  },
});

// const mutation = new GraphQLObjectType({
//   name: 'Mutation',
//   fields: {
//     addUser: {
//       type: UserType,
//       args: {
//         username: { type: new GraphQLNonNull(GraphQLString) },
//         email: { type: new GraphQLNonNull(GraphQLString) },
//         password: { type: new GraphQLNonNull(GraphQLString) },
//       },
//       resolve(parent, { username, email, password }) {
//         return axios.post(`http://localhost:3000/users`, { username, email, password })
//           .then(res => res.data)
//       }
//     },
//     deleteUser: {
//       type: UserType,
//       args: {
//         id: { type: new GraphQLNonNull(GraphQLInt) }
//       },
//       resolve(parent, args) {
//         console.log(args)
//         return axios.delete(`http://localhost:3000/users/${args.id}`)
//           .then(res => {
//             return res.data;
//           })
//       }
//     }
//   }
// })


// const Mutation = new Gr

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});