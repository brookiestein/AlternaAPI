const createError = require('http-errors');
const express = require('express');
const app = express();
const port: number = 8000;

let users = [
    {"id": 1, "name": "Brayan", "active": true},
    {"id": 2, "name": "Phanye", "active": true},
    {"id": 3, "name": "Nieves", "active": true},
    {"id": 4, "name": "Eugenio", "active": true},
    {"id": 5, "name": "Rafael", "active": true}
];

app.param('lookForId', (req, res, next, id) => {
    req.id = id;
    req.user = users[id];
    if (req.user && users[id].active === true) {
        next();
    } else {
        next(createError(404, `User with id: ${id} not found!`));
    }
});

app.param('lookForUser', (req, res, next, username) => {
    for (let i = 0; i < users.length; ++i) {
        if (username == users[i].name && users[i].active === true) {
            req.id = i + 1;
            req.user = username;
            break;
        }
    }

    if (req.user) {
        next();
    } else {
        next(createError(404, `User with name: ${username} not found!`));
    }
});

app.param('addUser', (req, res, next, username) => {
    for (let user of users) {
        if (user.name === username) {
            next(createError(400, `User: ${username} already exists.`));
        }
    }

    req.id = users.length + 1;
    req.user = username;
    if (req.user) {
        next();
    } else {
        next(createError(500, `User: ${username} could not be created.`));
    }
});

app.param('removeUser', (req, res, next, username) => {
    let exists: boolean = false;
    for (let i = 0; i < users.length; ++i) {
        if (username === users[i].name) {
            req.id = i;
            req.user = username;
            exists = true;
            break;
        }
    }

    if (exists) {
        next();
    } else {
        next(createError(404, `User: ${username} does not exist.`));
    }
});

app.param('updateId', (req, res, next, id) => {
    const index = parseInt(id);
    if (isNaN(index) || index < 0 || index >= (users.length)) {
        next(createError(404, `ID: ${id} is invalid.`));
    }

    req.id = index;
    next();
});

app.param('updateName', (req, res, next, username) => {
    let index: number = -1;
    for (let i = 0; i < users.length; ++i) {
        if (username === users[i].name) {
            index = i;
            break;
        }
    }

    if (index < 0) {
        next(createError(404, `There's no user called ${username}.`));
    }

    req.id = index;
    req.user = users[index].name;
    next();
});

app.param('newUsername', (req, res, next, username) => {
    req.user = username;
    next();
});

app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" contents="width=device-width initial-scale=1.0">
        <title>Brayan's API</title>
        <style>
            table, tr {
                border: 1px solid;
            }
            tr:nth-of-type(even) {
                background-color: #ccc;
            }
        </style>
    </head>
    <body>
        <h1>Welcome to Brayan's API!</h1>
        <p>These are the available endpoints:</p>
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Description</th>
            </tr>

            <tr>
                <td>/list</td>
                <td>Get an html formatted list of all users.</td>
            </tr>

            <tr>
                <td>/list/raw</td>
                <td>Get a Json-formatted list of all users.</td>
            </tr>

            <tr>
                <td>/id/userid</td>
                <td>Returns the username whose ID is userid.</td>
            </tr>

            <tr>
                <td>/id/userid/raw</td>
                <td>Returns the username whose ID is userid.</td>
            </tr>

            <tr>
                <td>/user/username</td>
                <td>Returns the ID associated with username.</td>
            </tr>

            <tr>
                <td>/addUser/&ltusername&gt</td>
                <td>Adds username to the list of users.</td>
            </tr>

            <tr>
                <td>/remove/username</td>
                <td>Removes username if exists.</td>
            </tr>

            <tr>
                <td>/updateById/userid/newUsername</td>
                <td>Update the username of that whose ID is userid.</td>
            </tr>

            <tr>
                <td>/updateByName/username/newUsername</td>
                <td>Update the username of that whose username is username.</td>
            </tr>
        </table>
    </body>
</html>`;
    res.send(html);
});

app.get('/id/:lookForId', (req, res) => {
    const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" contents="width=device-width initial-scale=1.0">
        <title>Looking for Users</title>
    </head>
    <body>
        <p>User with ID: ${req.id} is ${req.user.name}</p>
    </body>
</html>`;
    res.send(html);
});

app.get('/id/:lookForId/raw', (req, res) => {
    res.send(req.user.name);
});

app.get('/user/:lookForUser', (req, res) => {
    const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" contents="width=device-width initial-scale=1.0">
        <title>Looking for Users</title>
    </head>
    <body>
        <p>${req.user}'s ID is ${req.id}</p>
    </body>
</html>`;
    res.send(html);
});

app.get('/user/:lookForUser/raw', (req, res) => {
    res.send(`${req.id}`);
});

app.get('/add/:addUser', (req, res) => {
    const addedBy: string = req.header('X-Real-IP');
    users.push({"id": req.id, "name": req.user, "active": true});
    res.send(`User ID: ${req.id}, Username: ${req.user}`);
});

app.get('/remove/:removeUser', (req, res) => {
    users[req.id].active = false;
    res.send(`User: ${req.user} sucessfully removed!`);
});

app.get('/updateById/:updateId/:newUsername', (req, res) => {
    const oldUser: string = users[req.id].name;
    users[req.id].name = req.user;
    res.send(`Old username: ${oldUser}, new username: ${req.user}`);
});

app.get('/updateByName/:updateName/:newUsername', (req, res) => {
    const oldUser: string = users[req.id].name;
    users[req.id].name = req.user;
    res.send(`Old username: ${oldUser}, new username: ${req.user}`);
});

app.get('/list', (req, res) => {
    let html: string = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" contents="width=device-width initial-scale=1.0">
        <title>Looking for Users</title>
        <style>
            table, tr {
                border: 1px solid;
            }
            tr:nth-of-type(even) {
                background-color: #ccc;
            }
        </style>
    </head>
    <body>
        <table>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Is active?</th>
            </tr>
            `;

    for (const user of users) {
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.active}</td>
            </tr>
        `;
    }

    html += `
        </table>
    </body>
</html>`;

    res.send(html);
});

app.get('/list/raw', (req, res) => {
    res.send(users);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
})
