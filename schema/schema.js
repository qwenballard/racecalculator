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
  }),
});

const { connectionType: raceConnection } = connectionDefinitions({
  nodeType: RaceType,
});

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
      resolve: (payload) => axios.get(`http://localhost:3000/races/${payload.raceId}`)
        .then((race) => race.data),
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
      resolve: ({ userId }) => axios.get(`http://localhost:3000/users/${userId}`)
        .then((user) => user.data),
    },
  },
  mutateAndGetPayload: ({ id, userId }) => {
    axios.delete(`http://localhost:3000/races/${id}`)
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
      resolve: ({ userId }) => axios.get(`http://localhost:3000/users/${userId}`)
        .then((user) => user.data),
    },
  },
  mutateAndGetPayload: ({
    id, userId, type, date, time,
  }) => axios.patch(`http://localhost:3000/races/${id}`, {
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

