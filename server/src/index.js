const { generatePassword, generateUsername, isValidDate } = require('../utils/auth');

const express = require('express');
const cors = require('cors'); 
const app = express();
const corsOptions = {
    origin: "http://localhost:5174", 
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

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



const MAX_ATTEMPTS = 3;

const loginAttempts = {};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const usersPath = path.join(__dirname, '../db/users.json');


  if (!username || !password) {
    return res.status(400).json({ message: "Veuillez fournir le nom d'utilisateur et le mot de passe." });
  }

  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (e) {
    return res.status(500).json({ message: "Impossible de lire les utilisateurs." });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect." });
  }

  if (!loginAttempts[username]) loginAttempts[username] = 0;

  if (loginAttempts[username] >= MAX_ATTEMPTS) {
    return res.status(403).json({ message: "Compte bloqué après 3 tentatives échouées." });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    loginAttempts[username] += 1;
    const attemptsLeft = MAX_ATTEMPTS - loginAttempts[username];
    return res.status(401).json({ message: `Mot de passe incorrect. Tentatives restantes: ${attemptsLeft}` });
  }

    loginAttempts[username] = 0;
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

  return res.status(200).json({
    message: "Connexion réussie",
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName
  });
})