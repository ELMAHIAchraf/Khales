const { generatePassword, generateUsername, isValidDate } = require('../utils/auth');

const express = require('express');
const cors = require('cors'); 
const app = express();
const corsOptions = {
    origin: "http://localhost:5173", 
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json())

const PORT = 3000;

const bcrypt = require('bcrypt');


app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);
app.get('/', (req, res) => {
    res.send('Hello World!');
});

const fs = require('fs');
const path = require('path');

app.post('/signup', (req, res) => {
    const { firstName, lastName, dateOfBirth, city, tel } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !city || !tel) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!isValidDate(dateOfBirth)) {
        return res.status(400).json({ error: 'Date of birth must be valid and earlier than today (dd/mm/yyyy).' });
    }

    const usersPath = path.join(__dirname, '../db/users.json');
    const dbDir = path.dirname(usersPath);

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    let users = [];
    try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (e) {}

    const username = generateUsername(firstName, lastName, dateOfBirth, users);

    const plainPassword = generatePassword();
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    const newUser = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        firstName,
        lastName,
        dateOfBirth,
        city,
        tel,
        username,
        password: hashedPassword,
        group: []
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    let groupInfo = "No group";
    if (newUser.group && newUser.group.length > 0) {
        groupInfo = `Group: ${newUser.group.join(', ')}`;
    }

    res.cookie('user', JSON.stringify({
            id: newUser.id,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            city: newUser.city
        }), {
            maxAge: 60 * 60 * 1000,
            httpOnly: false,
            secure: false
        });

        res.status(201).json({
            message: "Account created successfully.",
            username,
            password: plainPassword,
            groupInfo
        });
});



app.post('/createGroup', (req, res) => {
    const { name, password, creatorId } = req.body;

    if (!name || !password || !creatorId) {
        return res.status(400).json({ error: "Group name, password, and creatorId are required." });
    }

    const groupsPath = path.join(__dirname, '../db/groups.json');
    let groups = [];
    try {
        groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
    } catch (e) {}

    if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ error: "Group name already exists." });
    }

    const usersPath = path.join(__dirname, '../db/users.json');
    let users = [];
    try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (e) {}

    const creator = users.find(u => u.id === creatorId);
    if (!creator) {
        return res.status(400).json({ error: "Creator user not found." });
    }


    const newGroup = {
        id: groups.length ? Math.max(...groups.map(g => g.id)) + 1 : 1,
        name,
        password: password,
        members: [
            { userId: creatorId, role: "admin" }
        ],
        createdBy: creatorId,
        createdAt: new Date().toISOString()
    };

    if (newGroup.members.length > 15) {
        return res.status(400).json({ error: "A group can have a maximum of 15 members." });
    }
    const adminCount = newGroup.members.filter(m => m.role === "admin").length;
    if (adminCount > 3) {
        return res.status(400).json({ error: "A group can have up to 3 admins." });
    }

    groups.push(newGroup);
    fs.writeFileSync(groupsPath, JSON.stringify(groups, null, 2));

    return res.status(201).json({ message: "Group created successfully", group: newGroup });
});