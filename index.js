var createError = require('http-errors');
var express = require('express');
var app = express();
var port = 8000;
var users = [
    { "id": 1, "name": "Brayan", "active": true },
    { "id": 2, "name": "Phanye", "active": true },
    { "id": 3, "name": "Nieves", "active": true },
    { "id": 4, "name": "Eugenio", "active": true },
    { "id": 5, "name": "Rafael", "active": true }
];
app.param('lookForId', function (req, res, next, id) {
    req.id = id;
    req.user = users[id];
    if (req.user && users[id].active === true) {
        next();
    }
    else {
        next(createError(404, "User with id: ".concat(id, " not found!")));
    }
});
app.param('lookForUser', function (req, res, next, username) {
    for (var i = 0; i < users.length; ++i) {
        if (username == users[i].name && users[i].active === true) {
            req.id = i + 1;
            req.user = username;
            break;
        }
    }
    if (req.user) {
        next();
    }
    else {
        next(createError(404, "User with name: ".concat(username, " not found!")));
    }
});
app.param('addUser', function (req, res, next, username) {
    for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
        var user = users_1[_i];
        if (user.name === username) {
            next(createError(400, "User: ".concat(username, " already exists.")));
        }
    }
    req.id = users.length + 1;
    req.user = username;
    if (req.user) {
        next();
    }
    else {
        next(createError(500, "User: ".concat(username, " could not be created.")));
    }
});
app.param('removeUser', function (req, res, next, username) {
    var exists = false;
    for (var i = 0; i < users.length; ++i) {
        if (username === users[i].name) {
            req.id = i;
            req.user = username;
            exists = true;
            break;
        }
    }
    if (exists) {
        next();
    }
    else {
        next(createError(404, "User: ".concat(username, " does not exist.")));
    }
});
app.param('updateId', function (req, res, next, id) {
    var index = parseInt(id);
    if (isNaN(index) || index < 0 || index >= (users.length)) {
        next(createError(404, "ID: ".concat(id, " is invalid.")));
    }
    req.id = index;
    next();
});
app.param('updateName', function (req, res, next, username) {
    var index = -1;
    for (var i = 0; i < users.length; ++i) {
        if (username === users[i].name) {
            index = i;
            break;
        }
    }
    if (index < 0) {
        next(createError(404, "There's no user called ".concat(username, ".")));
    }
    req.id = index;
    req.user = users[index].name;
    next();
});
app.param('newUsername', function (req, res, next, username) {
    req.user = username;
    next();
});
app.get('/', function (req, res) {
    var html = "\n<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" contents=\"width=device-width initial-scale=1.0\">\n        <title>Brayan's API</title>\n        <style>\n            table, tr {\n                border: 1px solid;\n            }\n            tr:nth-of-type(even) {\n                background-color: #ccc;\n            }\n        </style>\n    </head>\n    <body>\n        <h1>Welcome to Brayan's API!</h1>\n        <p>These are the available endpoints:</p>\n        <table>\n            <tr>\n                <th>Endpoint</th>\n                <th>Description</th>\n            </tr>\n\n            <tr>\n                <td>/list</td>\n                <td>Get an html formatted list of all users.</td>\n            </tr>\n\n            <tr>\n                <td>/list/raw</td>\n                <td>Get a Json-formatted list of all users.</td>\n            </tr>\n\n            <tr>\n                <td>/id/userid</td>\n                <td>Returns the username whose ID is userid.</td>\n            </tr>\n\n            <tr>\n                <td>/id/userid/raw</td>\n                <td>Returns the username whose ID is userid.</td>\n            </tr>\n\n            <tr>\n                <td>/user/username</td>\n                <td>Returns the ID associated with username.</td>\n            </tr>\n\n            <tr>\n                <td>/addUser/&ltusername&gt</td>\n                <td>Adds username to the list of users.</td>\n            </tr>\n\n            <tr>\n                <td>/remove/username</td>\n                <td>Removes username if exists.</td>\n            </tr>\n\n            <tr>\n                <td>/updateById/userid/newUsername</td>\n                <td>Update the username of that whose ID is userid.</td>\n            </tr>\n\n            <tr>\n                <td>/updateByName/username/newUsername</td>\n                <td>Update the username of that whose username is username.</td>\n            </tr>\n        </table>\n    </body>\n</html>";
    res.send(html);
});
app.get('/id/:lookForId', function (req, res) {
    var html = "\n<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" contents=\"width=device-width initial-scale=1.0\">\n        <title>Looking for Users</title>\n    </head>\n    <body>\n        <p>User with ID: ".concat(req.id, " is ").concat(req.user.name, "</p>\n    </body>\n</html>");
    res.send(html);
});
app.get('/id/:lookForId/raw', function (req, res) {
    res.send(req.user.name);
});
app.get('/user/:lookForUser', function (req, res) {
    var html = "\n<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" contents=\"width=device-width initial-scale=1.0\">\n        <title>Looking for Users</title>\n    </head>\n    <body>\n        <p>".concat(req.user, "'s ID is ").concat(req.id, "</p>\n    </body>\n</html>");
    res.send(html);
});
app.get('/user/:lookForUser/raw', function (req, res) {
    res.send("".concat(req.id));
});
app.get('/add/:addUser', function (req, res) {
    var addedBy = req.header('X-Real-IP');
    users.push({ "id": req.id, "name": req.user, "active": true });
    res.send("User ID: ".concat(req.id, ", Username: ").concat(req.user));
});
app.get('/remove/:removeUser', function (req, res) {
    users[req.id].active = false;
    res.send("User: ".concat(req.user, " sucessfully removed!"));
});
app.get('/updateById/:updateId/:newUsername', function (req, res) {
    var oldUser = users[req.id].name;
    users[req.id].name = req.user;
    res.send("Old username: ".concat(oldUser, ", new username: ").concat(req.user));
});
app.get('/updateByName/:updateName/:newUsername', function (req, res) {
    var oldUser = users[req.id].name;
    users[req.id].name = req.user;
    res.send("Old username: ".concat(oldUser, ", new username: ").concat(req.user));
});
app.get('/list', function (req, res) {
    var html = "\n<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" contents=\"width=device-width initial-scale=1.0\">\n        <title>Looking for Users</title>\n        <style>\n            table, tr {\n                border: 1px solid;\n            }\n            tr:nth-of-type(even) {\n                background-color: #ccc;\n            }\n        </style>\n    </head>\n    <body>\n        <table>\n            <tr>\n                <th>ID</th>\n                <th>Username</th>\n                <th>Is active?</th>\n            </tr>\n            ";
    for (var _i = 0, users_2 = users; _i < users_2.length; _i++) {
        var user = users_2[_i];
        html += "\n            <tr>\n                <td>".concat(user.id, "</td>\n                <td>").concat(user.name, "</td>\n                <td>").concat(user.active, "</td>\n            </tr>\n        ");
    }
    html += "\n        </table>\n    </body>\n</html>";
    res.send(html);
});
app.get('/list/raw', function (req, res) {
    res.send(users);
});
app.listen(port, function () {
    console.log("Listening on port ".concat(port, "."));
});
