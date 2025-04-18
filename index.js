import express from "express";
import cors from "cors";
import { randomBytes, scrypt, randomUUID } from "node:crypto";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


/*
admin/admin123
*/

const users = [
    {
        username: "admin",
        name: "Gustavo Alfredo Marín Sáez",
        password: "1b6ce880ac388eb7fcb6bcaf95e20083:341dfbbe86013c940c8e898b437aa82fe575876f2946a2ad744a0c51501c7dfe6d7e5a31c58d2adc7a7dc4b87927594275ca235276accc9f628697a4c00b4e01"
        //password: "8771f93670175ca4c9fe70e5d89837b1:8b2fd7943b5222ce7f698dfc11c39fbc88a4df6f08a430d9a7fd6efa889a06362f90353c6948cd784a776f31a59ac96292b2ed9dafcc5826283b69d5242af030"
    }
];

const reminders = [];

const generateToken = () => {
    return randomBytes(48).toString('hex');
};

const hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
};

const verifyPassword = async (password, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const [salt, key] = hashedPassword.split(':');
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex') === key);
        });
    });
};

const verifyAuth = (req, res, next) => {
    const token = req.headers['x-authorization'];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
};

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/api/hash/password", async (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: 'password are required' });
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
        hashedPassword: hashedPassword,
    });
});

app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken();
    user.token = token;

    res.setHeader('x-authorization', token);
    res.status(200).json({
        username: user.username,
        name: user.name,
        token: token
    });
});

app.get("/api/reminders", verifyAuth, (req, res) => {
    const sortedReminders = [...reminders].sort((a, b) => {
        if (a.important !== b.important) {
            return b.important - a.important;
        }
        return b.createdAt - a.createdAt;
    });
    
    res.status(200).json(sortedReminders);
});

app.post("/api/reminders", verifyAuth, (req, res) => {
    const { content, important = false } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0 || content.length > 120) {
        return res.status(400).json({ error: 'Invalid content. Must be a non-empty string with max 120 characters' });
    }

    if (typeof important !== 'boolean') {
        return res.status(400).json({ error: 'Important must be a boolean value' });
    }

    const reminder = {
        id: randomUUID(),
        content: content.trim(),
        createdAt: Date.now(),
        important
    };

    reminders.push(reminder);
    res.status(201).json(reminder);
});

app.patch("/api/reminders/:id", verifyAuth, (req, res) => {
    if (!req.params.id || typeof req.params.id !== "string" || req.params.id.trim() === "") {
        return res.status(400).json({ message: "ID inválido" });
    }

    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "El body debe ser un objeto JSON" });
    }

    const reminder = reminders.find(r => r.id === req.params.id.trim());
    if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
    }

    const { content, important } = req.body;
    
    if (content !== undefined) {
        if (typeof content !== 'string' || content.trim().length === 0 || content.length > 120) {
            return res.status(400).json({ message: 'Invalid content. Must be a non-empty string with max 120 characters' });
        }
        reminder.content = content.trim();
    }

    if (important !== undefined) {
        if (typeof important !== 'boolean') {
            return res.status(400).json({ message: 'Important must be a boolean value' });
        }
        reminder.important = important;
    }

    if (content === undefined && important === undefined) {
        return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
    }

    res.json(reminder);
});

app.delete("/api/reminders/:id", verifyAuth, (req, res) => {
    const { id } = req.params;
    
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    reminders.splice(index, 1);
    res.status(204).send();
});

app.listen(3300, () => {
    console.log("Server is running on port 3300");
});


/*
    curl -X POST http://localhost:3000/api/hash/password -H "Content-Type: application/json" -d "{\"password\": \"1234567890\"}"

    curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"1234567890\"}"

    curl -X GET http://localhost:3000/api/reminders -H "x-authorization: 1234567890"

    curl -X POST http://localhost:3000/api/reminders -H "Content-Type: application/json" -H "x-authorization: "0a7dba3b1e03c645670fcc75ae418182af6e7a457bf5d8221e85aae4280d7cf3fc22d5a3d6086c0a03d34eed8de9a6dd" -d "{\"content\": \"test\", \"important\": true}"

    curl -X PATCH http://localhost:3000/api/reminders/1234567890 -H "Content-Type: application/json" -H "x-authorization: 1234567890" -d "{\"content\": \"test2\", \"important\": false}"

    curl -X DELETE http://localhost:3000/api/reminders/1234567890 -H "x-authorization: 1234567890"

*/