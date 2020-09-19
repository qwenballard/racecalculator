const axios = require('axios');

function getRaces(id) {
  // console.log('helper getraces', id)
  const result = [];
  const races = [
    {
      userId: 1,
      id: 1,
      date: 'Aug 1, 2021',
      type: '5k',
      time: '21min',
    },
    {
      userId: 1,
      id: 2,
      date: 'Sept 1, 2028',
      type: 'half marathon',
      time: '22min',
    },
    {
      userId: 3,
      id: 3,
      date: 'Dec 1, 2020',
      type: '10k',
      time: '23min',
    },
    {
      userId: 3,
      id: 4,
      date: 'June 1, 2021',
      type: '1 mile',
      time: '21min',
    },
    {
      userId: 3,
      id: 5,
      date: 'April 1, 2021',
      type: 'marathon',
      time: '60min',
    },
    {
      userId: 2,
      id: 6,
      date: 'July 1, 2021',
      type: '5k',
      time: '20min',
    },
    {
      userId: 2,
      id: 7,
      date: 'Dec 1, 2021',
      type: '5k',
      time: '20min',
    },
  ];
  races.forEach(race => {
    if (race.userId === id) {
      result.push(race.type);
    }
  })
  return result;
}

function getUser(id) {
  const user = axios.get(`http://localhost:3000/users/${id}`)
    .then((res) => res.data);
  return user;
}

function getRace(id) {
  const race = axios.get(`http://localhost:3000/races/${id}`)
    .then((res) => res.data);
  return race;
}

module.exports = {
  getRaces,
  getUser,
  getRace,
};
