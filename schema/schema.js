
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLEnumType
} = require('graphql');

const {
  mutationWithClientMutationId,
  globalIdField,
  fromGlobalId,
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
  connectionFromArray,
  connectionFromPromisedArray
} = require('graphql-relay');

const axios = require('axios');
const {
  getRaces,
  getUser,
  getRace,
} = require('./helpers');
/**
 * We get the node interface and field from the relay library.
 *
 * The first method is the way we resolve an ID to its object. The second is the
 * way we resolve an object that implements node to its type.
 */

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    if (type === 'User') {
      // this is where we need interact with our database to grab information
      // return getUser(id);
      return getUser(id);
    }
    if (type === 'Race') {
      // this is where we need interact with our database to grab information
      // return getRace(id);
      return getRace(id);
    }
    // if (type === "Goal") {
    //   return getGoal(id);
    // }
  },
  // we have a one to many relationships so how is this gonna work?
  (obj) => (obj.type ? UserType : RaceType),
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

// const GoalType = new GraphQLObjectType({
//   name: "Goal",
//   description: 'A goal for a specific user',
//   interfaces: [nodeInterface],
//   fields: () => ({
//     userId: { type: GraphQLInt },
//     id: globalIdField(),
//     type: { type: GraphQLString },
//     time: { type: GraphQLString },
//   })
// });

// We need to make sure this type is connected to our User object
const RaceType = new GraphQLObjectType({
  name: 'Race',
  description: 'A race for a specific user',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField('Race', (obj) => obj.id),
    date: { type: GraphQLString },
    type: { type: GraphQLString },
    time: { type: GraphQLString },
  }),
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
  nodeType: RaceType,
});

//  const { connectionType: goalConnection } = connectionDefinitions({
//    nodeType: goalType,
//  });

/**
 * We define our basic user type.
 *
 * This implements the following type system shorthand:
 *   type Ship : Node {
 *     id: String!
 *     name: String
 *   }
 */

// User Type
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'A user who loves to run',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField('User', (obj) => obj.id),
    username: { type: GraphQLString, description: 'The name of the user' },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    races: {
      type: raceConnection,
      description: 'The races for a specific user',
      args: connectionArgs,
      resolve: (user, args) => {
        connectionFromArray(user.races.map(getRace), args);
      },
    },
  }),
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

const queryType = new GraphQLObjectType({ // root query allows us to jump into the graph. Entry point to a specific node.
  name: 'Query',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve: (parentValue, args) => axios.get(`http://localhost:3000/users/${args.id}`)
        .then((res) => res.data),
    },
    node: nodeField,
  }),
});

//= ===========================================
/* Mutations need to be updated */
//= ===========================================

// Add User
// const AddUserMutation = mutationWithClientMutationId({
//   name: "addUser",
//   inputFields: {
//     id: {
//       type: new GraphQLNonNull(GraphQLString),
//     },
//     username: {
//       type: new GraphQLNonNull(GraphQLString),
//     },
//     email: {
//       type: new GraphQLNonNull(GraphQLString),
//     },
//     password: {
//       type: new GraphQLNonNull(GraphQLString),
//     },
//   },
//   outputFields: {
//     username: {
//       type: UserType,
//       resolve: (payload) => getUser(payload.userId),
//     },
//     email: {
//       type: RaceType,
//       resolve: (payload) => getRace(payload.raceId),
//     },
//   },
//   mutateAndGetPayload: ({ shipName, factionId }) => {
//     const newShip = createShip(shipName, factionId);
//     return {
//       shipId: newShip.id,
//       factionId,
//     };
//   },
// });

// //Delete User
// const RemoveUserMutation = mutationWithClientMutationId({
//   name: "removeUser",
//   inputFields: {
//     shipName: {
//       type: new GraphQLNonNull(GraphQLString),
//     },
//     factionId: {
//       type: new GraphQLNonNull(GraphQLID),
//     },
//   },
//   outputFields: {
//     ship: {
//       type: shipType,
//       resolve: (payload) => getShip(payload.shipId),
//     },
//     faction: {
//       type: factionType,
//       resolve: (payload) => getFaction(payload.factionId),
//     },
//   },
//   mutateAndGetPayload: ({ shipName, factionId }) => {
//     const newShip = createShip(shipName, factionId);
//     return {
//       shipId: newShip.id,
//       factionId,
//     };
//   },
// });

// const mutationType = new GraphQLObjectType({
//   name: "Mutation",
//   fields: () => ({
//     addUser: AddUserMutation,
//     removeUser: RemoveUserMutation,
//   }),
// });

module.exports = new GraphQLSchema({
  query: queryType,
  // mutation: mutationType
});

// go back and put user ID where its needed
