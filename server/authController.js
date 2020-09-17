const userDB = require('./db.json');

module.exports = {

  login(req, res, next) {
    console.log('i am in auth login')
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send("Missing login or password");

    const user = userDB.users.filter(account => {
     return account.username === username && account.password === password
    });

    if(!user[0]){
        return res.status(403).send("check credentials");
    } else {
        res.locals.user = user[0];
        return next();
    }
    // for (let account of userDB.users){
    //   if (account.username === username && account.password === password) {
    //     res.locals.id = account.id;
    //     return next();
    // }
    },

  setCookie(req, res, next) {
    console.log('I am in setCookie')
    const { id } = res.locals.user;
    console.log('id', id);
    res.cookie("token", id , { httpOnly: true, maxAge: 600000 });
    return next();
    },

  verify(req, res, next) {
    console.log('i am in verify')
    const { token } = req.cookies;
    res.locals.user = token;
    console.log(token);
    if (!token) return res.status(403).send('not authorized to view this page');
    return next();
    }
}
