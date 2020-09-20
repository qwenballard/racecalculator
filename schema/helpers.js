const axios = require('axios');

function getRaces(id) {
  return axios.get(`http://localhost:3000/users/${id}/races`)
    .then((res) => res.data);
}

function getUser(id) {
  return axios.get(`http://localhost:3000/users/${id}`)
    .then((res) => res.data);
}

function getRace(id) {
  return axios.get(`http://localhost:3000/races/${id}`)
    .then((res) => res.data);
}
function editRace({
  id, userId, type, date, time,
}) {
  console.log(id);
  return axios.patch(`http://localhost:3000/races/${id}`, {
    type,
    date,
    time,
  })
    .then((res) => console.log(res.data));
}

module.exports = {
  getRaces,
  getUser,
  getRace,
};
