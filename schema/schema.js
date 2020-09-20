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

const axios = require('axios');

const URL = 'http://localhost:3000';
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
      return axios.get(`${URL}/users/${id}`)
        .then((res) => res.data);
    }
    if (type === 'Race') {
      return axios.get(`${URL}/races/${id}`)
        .then((res) => res.data);
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
      resolve(parent, args) {
        return axios.get(`${URL}/users/${parent.userId}`)
          .then((res) => res.data);
      },
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
      resolve(parent, args) {
        return axios.get(`${URL}/users/${parent.userId}`)
          .then((res) => res.data);
      },
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
      resolve: (user, args) => axios.get(`${URL}/users/${user.id}/races`)
        .then((res) => connectionFromArray([...res.data], args)),
    },
    goals: {
      type: goalConnection,
      description: 'The goals for a specific user',
      args: connectionArgs,
      resolve: (user, args) => axios.get(`${URL}/users/${user.id}/goals`)
        .then((res) => connectionFromArray([...res.data], args)),
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
      resolve: (parentValue, args) => axios.get(`${URL}/users/${args.id}`)
        .then((res) => res.data),
    },
    race: {
      type: RaceType,
      args: { id: { type: GraphQLInt } },
      resolve: (parent, args) => axios.get(`${URL}/races/${args.id}`)
        .then((res) => res.data),
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
      resolve: (payload) => axios.get(`${URL}/races/${payload.raceId}`)
        .then((race) => race.data),
    },
    user: {
      type: UserType,
      resolve: (payload) => {
        console.log(payload);
        return axios.get(`${URL}/users/${payload.userId}`)
          .then((user) => user.data);
      },
    },
  },
  mutateAndGetPayload: ({
    type, date, time, userId,
  }) => axios.post(`${URL}/races`, {
    userId,
    type,
    time,
    date,
  })
    .then((race) => ({
      raceId: race.data.id,
      userId: race.data.userId,
    }))
    .catch((err) => {
      console.log(err);
    }),
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
      resolve: ({ userId }) => axios.get(`${URL}/users/${userId}`)
        .then((user) => user.data),
    },
  },
  mutateAndGetPayload: ({ id, userId }) => {
    axios.delete(`${URL}/races/${id}`)
      .then((res) => console.log(res.data));
    return { id, userId };
  },
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
      resolve: ({ userId }) => axios.get(`${URL}/users/${userId}`)
        .then((user) => user.data),
    },
  },
  mutateAndGetPayload: ({
    id, userId, type, date, time,
  }) => axios.patch(`${URL}/races/${id}`, {
    id, userId, type, date, time,
  })
    .then((res) => res.data),
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
