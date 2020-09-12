const faker = require("faker");

const helpers = {};

helpers.addUser =  function () {
    const user = {};
    user.username = faker.internet.userName();
    user.email = faker.internet.email();
    user.password = faker.internet.password();
    user.id = faker.random.uuid();

    return user;
}

module.exports = helpers;
