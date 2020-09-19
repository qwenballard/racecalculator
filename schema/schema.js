const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
} = require('graphql');

const {
  mutationWithClientMutationId,
  globalIdField,
  fromGlobalId,
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
  connectionFromArray,
} = require('graphql-relay');

const axios = require('axios');

const {
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
      return getUser(id);
    }
    if (type === 'Race') {
      return getRace(id);
    }
  },
  // we have a one to many relationships so how is this gonna work?
  (obj) => (obj.races ? UserType : RaceType),
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
    id: globalIdField(),
    date: { type: GraphQLString },
    type: { type: GraphQLString },
    time: { type: GraphQLString },
    userId: { type: GraphQLInt },
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
    id: globalIdField(),
    username: { type: GraphQLString, description: 'The name of the user' },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    races: {
      type: raceConnection,
      description: 'The races for a specific user',
      args: connectionArgs,
      resolve: (user, args) => axios.get(`http://localhost:3000/users/${user.id}/races`)
        .then((res) => connectionFromArray([...res.data], args)),
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

const queryType = new GraphQLObjectType({
  // root query allows us to jump into the graph. Entry point to a specific node.
  name: 'Query',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve: (parentValue, args) => axios.get(`http://localhost:3000/users/${args.id}`)
        .then((res) => res.data),
    },
  }),
});

//= ===========================================
/* Mutations need to be updated */
//= ===========================================

// Add User
const AddRaceMutation = mutationWithClientMutationId({
  name: 'addRace',
  inputFields: {
    type: {
      type: new GraphQLNonNull(GraphQLString),
    },
    date: {
      type: new GraphQLNonNull(GraphQLString),
    },
    time: {
      type: new GraphQLNonNull(GraphQLString),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  outputFields: {
    race: {
      type: RaceType,
      resolve: (payload) => {
        return axios.get(`http://localhost:3000/races/${payload.raceId}`)
          .then((race) => race.data);
      },
    },
    user: {
      type: UserType,
      resolve: (payload) => {
        console.log(payload);
        return axios.get(`http://localhost:3000/users/${payload.userId}`)
          .then((user) => user.data);
      },
    },
  },
  mutateAndGetPayload: ({
    type, date, time, userId,
  }) => axios.post('http://localhost:3000/races', {
    userId,
    type,
    time,
    date,
  })
    .then((race) => {
      console.log(race.data.id);
      return {
        raceId: race.data.id,
        userId: race.data.userId,
      };
    })
    .catch((err) => {
      console.log(err);
    }),
});

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

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addRace: AddRaceMutation,
  }),
});

module.exports = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

// go back and put user ID where its needed
