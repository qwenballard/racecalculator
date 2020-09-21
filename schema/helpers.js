const axios = require('axios');

async function getUser(id) {
  return axios.get(`http://localhost:3000/users/${id}`)
    .then((res) => res.data);
}

async function getRace(id) {
  return axios.get(`http://localhost:3000/races/${id}`)
    .then((res) => res.data);
}

async function getRaces(id) {
  return axios.get(`http://localhost:3000/users/${id}/races`)
    .then((res) => res.data);
}

async function getGoals(id) {
  return axios.get(`http://localhost:3000/users/${id}/goals`)
    .then((res) => res.data);
}

async function addRace(type, date, time, userId) {
  return axios.post('http://localhost:3000/races', {
    userId,
    type,
    time,
    date,
  })
    .then((race) => ({
      raceId: race.data.id,
      userId: race.data.userId,
    }));
}
async function editRace(id, userId, type, date, time) {
  return axios.patch(`http://localhost:3000/races${id}`, {
    userId,
    type,
    time,
    date,
  })
    .then((res) => res.data);
}

async function deleteRace(id, userId) {
  await axios.delete(`http://localhost:3000/races/${id}`);
  return { id, userId };
}
module.exports = {
  getUser,
  getRace,
  getRaces,
  getGoals,
  addRace,
  deleteRace,
  editRace,
};
