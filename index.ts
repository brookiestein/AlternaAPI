const createError = require('http-errors');
const path = require('path');
const bodyParser = require('body-parser');
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.param('lookForId', (req, res, next, id) => {
    req.id = parseInt(id);
    if (isNaN(req.id)) {
        next(createError(500, `ID: ${id} is not valid.`));
    }

    req.user = users[req.id - 1];
    if (req.user && users[req.id - 1].active === true) {
        next();
    } else {
        next(createError(404, `User with id: ${id} not found!`));
    }
});

app.param('lookForUser', (req, res, next, username) => {
    for (let i = 0; i < users.length; ++i) {
        if (username == users[i].name && users[i].active === true) {
            req.id = i;
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

app.param('deleteUser', (req, res, next, username) => {
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
    if (isNaN(index) || index < 1 || index > (users.length)) {
        next(createError(404, `ID: ${id} is invalid.`));
    }

    req.id = index - 1;
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
    const options = {root: path.join(__dirname)};
    res.sendFile('index.html', options);
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

app.post('/add', (req, res) => {
    if (!req.body.username) {
        res.json({error: "Username wasn't specified."});
        return;
    }

    for (const user of users) {
        if (req.body.username === user.name) {
            res.json({error: `User: ${user.name} already exists.`});
            return;
        }
    }

    const newUser = {"id": users.length + 1, "name": req.body.username, "active": true};
    users.push(newUser);
    res.json({id: newUser.id, username: newUser.name});
});

app.delete('/delete/:deleteUser', (req, res) => {
    users[req.id].active = false;
    res.json({ message: `User: ${req.user} sucessfully removed!`});
});

app.put('/updateById/:updateId/:newUsername', (req, res) => {
    const oldUser: string = users[req.id].name;
    users[req.id].name = req.user;
    res.json({oldUsername: oldUser, newUsername: req.user});
});

app.put('/updateByName/:updateName/:newUsername', (req, res) => {
    const oldUser: string = users[req.id].name;
    users[req.id].name = req.user;
    res.json({oldUsername: oldUser, newUsername: req.user});
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
});
