const axios = require('axios');

function getRaces(id) {
  const races = axios.get(`http://localhost:3000/users/${id}/races`)
    .then(res => res.data);
  return races;
}

function getUser(id) {
  const user = axios.get(`http://localhost:3000/users/${id}`)
    .then(res => res.data);
  return user;
}

function getRace(id) {
  const race = axios.get(`http://localhost:3000/races/${id}`)
    .then(res => res.data);
  return race;
}

module.exports = {
  getRaces,
  getUser,
  getRace,
}