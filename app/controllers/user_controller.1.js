var dbUtils = require('../helpers/db_utils');
var Users = require('../models/users');

module.exports.getAllUsers = async (req, res, next) => {

    try {
        var user = new Users(dbUtils.getSession());
        let users = await user.getAllUsers();
        res.send(users);
    } catch (err) {
        console.log('zzzzzzzzzzlogging error');
        console.log(err);
        next(err);
    }
}

module.exports.addNewUser = function (req, res) {

    var user = new Users(dbUtils.getSession());

    user.addUser(req.body.id, req.body.username, req.body.email, req.body.password).then(function (user) {
        res.send(user);
    });

}

module.exports.getUser = function (req, res) {

    var user = new Users(dbUtils.getSession());

    user.getUser(req.params.userID).then(function (user) {

        res.send(JSON.stringify(user));
    });
}