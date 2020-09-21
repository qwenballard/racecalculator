const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
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

const {
  getUser, getRaces, getGoals, getRace, addRace, deleteRace, editRace,
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
    user: {
      type: UserType,
      resolve: async (parent) => getUser(parent.userId),
    },
  }),
});

const { connectionType: raceConnection } = connectionDefinitions({
  nodeType: RaceType,
});

const GoalType = new GraphQLObjectType({
  name: 'Goal',
  description: 'A runner\'s goal',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
    type: { type: GraphQLString, description: 'Type of race, i.e. 5k, 10, half-marathon...' },
    userId: { type: GraphQLString },
    time: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: async (parent) => getUser(parent.userId),
    },
  }),
});

const { connectionType: goalConnection } = connectionDefinitions({
  nodeType: GoalType,
});

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
      resolve: async (user, args) => {
        const userRaces = await getRaces(user.id);
        return connectionFromArray([...userRaces], args);
      },
    },
    goals: {
      type: goalConnection,
      description: 'The goals for a specific user',
      args: connectionArgs,
      resolve: async (user, args) => {
        const userGoals = await getGoals(user.id);
        return connectionFromArray([...userGoals], args);
      },
    },
  }),
});

const queryType = new GraphQLObjectType({
  // root query allows us to jump into the graph. Entry point to a specific node.
  name: 'Query',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve: (parent, args) => getUser(args.id),
    },
    race: {
      type: RaceType,
      args: { id: { type: GraphQLInt } },
      resolve: (parent, args) => getRace(args.id),
    },
  }),
});

//= ===========================================
/* Mutations need to be updated */
//= ===========================================

const AddRaceMutation = mutationWithClientMutationId({
  name: 'addRace',
  inputFields: {
    type: { type: new GraphQLNonNull(GraphQLString) },
    date: { type: new GraphQLNonNull(GraphQLString) },
    time: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLInt) },
  },
  outputFields: {
    race: {
      type: RaceType,
      resolve: (payload) => getRace(payload.raceId),
    },
    user: {
      type: UserType,
      resolve: (payload) => getUser(payload.userId),
    },
  },
  mutateAndGetPayload: ({
    type, date, time, userId,
  }) => addRace(type, date, time, userId),
});

const DeleteRaceMutation = mutationWithClientMutationId({
  name: 'deleteRace',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(GraphQLInt) },
  },
  outputFields: {
    deletedRaceId: {
      type: RaceType,
      resolve: ({ id }) => id,
    },
    user: {
      type: UserType,
      resolve: ({ userId }) => getUser(userId),
    },
  },
  mutateAndGetPayload: ({ id, userId }) => deleteRace(id, userId),
});

const EditRaceMutation = mutationWithClientMutationId({
  name: 'editRace',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(GraphQLInt) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    date: { type: new GraphQLNonNull(GraphQLString) },
    time: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    editedRace: {
      type: RaceType,
      resolve: (payload) => payload,
    },
    user: {
      type: UserType,
      resolve: ({ userId }) => getUser(userId),
    },
  },
  mutateAndGetPayload: ({
    id, userId, type, date, time,
  }) => editRace(id, userId, type, date, time),
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addRace: AddRaceMutation,
    deleteRace: DeleteRaceMutation,
    editRace: EditRaceMutation,
  }),
});

module.exports = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});
