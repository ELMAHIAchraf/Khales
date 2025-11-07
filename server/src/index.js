const { generatePassword, generateUsername, isValidDate } = require('../utils/auth');

const express = require('express');
const cors = require('cors'); 
const app = express();
const corsOptions = {
    origin: "http://localhost:5173", 
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
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes de blocage

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

  if (!loginAttempts[username]) {
    loginAttempts[username] = { count: 0, blockedUntil: null };
  }
  const now = Date.now();

  // Vérifier si l'utilisateur est bloqué
  if (loginAttempts[username].blockedUntil && now < loginAttempts[username].blockedUntil) {
    const remaining = Math.ceil((loginAttempts[username].blockedUntil - now) / 1000);
    return res.status(403).json({
      message: `Nombre maximal de tentatives dépassé. Réessayez dans ${remaining} secondes.`
    });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    loginAttempts[username].count++;

    if (loginAttempts[username].count >= MAX_ATTEMPTS) {
      loginAttempts[username].blockedUntil = now + BLOCK_DURATION;
      return res.status(403).json({ message: "Nombre maximal de tentatives dépassé. Accès bloqué." });
    }

    const attemptsLeft = MAX_ATTEMPTS - loginAttempts[username].count;
    return res.status(401).json({
      message: `Identifiants incorrects. Tentatives restantes : ${attemptsLeft}`
    });
  }

  // Si connexion réussie
  loginAttempts[username] = { count: 0, blockedUntil: null };

    res.cookie('user', JSON.stringify({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city
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
        sorties: [],
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



app.post('/joinGroup', (req, res) => {
    const { groupName, password, userId } = req.body;

    if (!groupName || !password || !userId) {
        return res.status(400).json({ error: "Group name, password, and userId are required." });
    }

    const groupsPath = path.join(__dirname, '../db/groups.json');
    let groups = [];
    try {
        groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
    } catch (e) {}

    const group = groups.find(
        g => g.name.toLowerCase() === groupName.toLowerCase()
    );
    if (!group || group.password !== password) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    if (group.members.length >= 3) {
        return res.status(400).json({ error: "Group full" });
    }

    if (group.members.some(m => m.userId === userId)) {
        return res.status(400).json({ error: "You are already a member of this group." });
    }

    group.members.push({ userId, role: "member" });

    fs.writeFileSync(groupsPath, JSON.stringify(groups, null, 2));

    const usersPath = path.join(__dirname, '../db/users.json');
    let users = [];
    try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (e) {}

    const user = users.find(u => u.id === userId);
    if (user) {
        if (!user.group) user.group = [];
        if (!user.group.includes(group.id)) {
            user.group.push(group.id);
            fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        }
    }

    return res.status(200).json({ message: "You have joined the group successfully." });
});


app.get('/userGroups/:userId', (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    const groupsPath = path.join(__dirname, '../db/groups.json');
    const usersPath = path.join(__dirname, '../db/users.json');

    let groups = [];
    let users = [];
    try {
        groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
    } catch (e) {}
    try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    } catch (e) {}

    const userGroups = groups
        .filter(group => group.members.some(m => m.userId === userId))
        .map(group => {
            const userMember = group.members.find(m => m.userId === userId);
            const members = group.members.map(m => {
                const memberUser = users.find(u => u.id === m.userId);
                return {
                    userId: m.userId,
                    name: memberUser ? `${memberUser.firstName} ${memberUser.lastName}` : "Unknown",
                    role: m.role
                };
            });
            return {
                groupId: group.id,
                groupName: group.name,
                yourRole: userMember ? userMember.role : null,
                members
            };
        });

    res.json({ groups: userGroups });
});

app.post('/logout', (req, res) => {
    res.clearCookie('user');
    res.status(200).json({ message: "Logged out successfully." });
});

app.post('/createOuting', (req, res) => {
    const { groupName, outingName, total } = req.body;
  
    if (!groupName || !outingName || typeof total !== "number") {
      return res.status(400).json({ error: "Nom du groupe, nom de sortie et total sont requis." });
    }
  
    const groupsPath = path.join(__dirname, '../db/groups.json');
    let groups = [];
  
    // Lecture du fichier JSON
    try {
      groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
    } catch (e) {
      return res.status(500).json({ error: "Impossible de lire les groupes." });
    }
  
    // Trouver le groupe correspondant par nom
    const group = groups.find(
      g => typeof g.name === "string" && g.name.trim().toLowerCase() === groupName.trim().toLowerCase()
    );
  
    if (!group) {
      return res.status(404).json({ error: "Groupe non trouvé." });
    }
  
    // S'assurer que `group.sorties` est bien un tableau
    if (!Array.isArray(group.sorties)) {
      group.sorties = [];
    }
  
    // Créer une nouvelle sortie
    const newOuting = {
        outingName,
        total,
        members: group.members.map(m => ({
            userId: m.userId,
            amountSpent: 0
        }))
    };
  
    // Ajouter la sortie au tableau des sorties du groupe
    group.sorties.push(newOuting);
  
    // Sauvegarder les modifications dans le fichier
    fs.writeFileSync(groupsPath, JSON.stringify(groups, null, 2));
  
    return res.status(201).json({
      message: "Sortie enregistrée avec succès.",
      group
    });
  });
  
  