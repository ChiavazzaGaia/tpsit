const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const multer = require('multer');

const app = express();
const port = 3000;
const ACCOUNTS_FILE = 'accountsLogin.txt';
const DATA_FILE = 'data.txt';

const folders = ['./public/uploads', './public/avatars'];
folders.forEach(f => { if (!fs.existsSync(f)) fs.mkdirSync(f, { recursive: true }); });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, file.fieldname === 'avatar' ? './public/avatars/' : './public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'social-secret-key',
    resave: false,
    saveUninitialized: false
}));

const getAccounts = () => {
    if (!fs.existsSync(ACCOUNTS_FILE)) return [];
    return fs.readFileSync(ACCOUNTS_FILE, 'utf8').split('\n').filter(l => l).map(l => JSON.parse(l));
};

const getPosts = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return fs.readFileSync(DATA_FILE, 'utf8').split('\n').filter(l => l).map(l => JSON.parse(l));
};

app.get('/status', (req, res) => {
    const user = getAccounts().find(a => a.username === req.session.user);
    res.json({ user: user ? { username: user.username, pfp: user.pfp, bio: user.bio } : null });
});

app.post('/account', (req, res) => {
    const { username, password, action } = req.body;
    const accounts = getAccounts();
    const userFound = accounts.find(a => a.username === username);

    if (action === 'signup') {
        if (userFound) return res.status(400).json({ error: 'Taken' });
        const newUser = { username, password, bio: "", pfp: `https://ui-avatars.com/api/?name=${username}` };
        fs.appendFileSync(ACCOUNTS_FILE, JSON.stringify(newUser) + '\n');
        req.session.user = username;
        return res.json({ success: true });
    }
    if (userFound && userFound.password === password) {
        req.session.user = username;
        return res.json({ success: true });
    }
    res.status(401).json({ error: 'Denied' });
});

app.post('/update-profile', upload.single('avatar'), (req, res) => {
    if (!req.session.user) return res.status(401).send();
    let accounts = getAccounts();
    const index = accounts.findIndex(a => a.username === req.session.user);
    if (index !== -1) {
        if (req.body.bio) accounts[index].bio = req.body.bio;
        if (req.file) accounts[index].pfp = `/avatars/${req.file.filename}`;
        fs.writeFileSync(ACCOUNTS_FILE, accounts.map(a => JSON.stringify(a)).join('\n') + '\n');
        res.json(accounts[index]);
    }
});

app.post('/submit', upload.single('image'), (req, res) => {
    if (!req.session.user) return res.status(401).send();
    const post = {
        id: Date.now().toString(),
        username: req.session.user,
        data: req.body.data,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        timestamp: new Date().toLocaleString()
    };
    fs.appendFileSync(DATA_FILE, JSON.stringify(post) + '\n');
    res.json(post);
});

app.get('/data', (req, res) => {
    const query = req.query.search ? req.query.search.toLowerCase() : "";
    const accounts = getAccounts();
    const posts = getPosts()
        .filter(p => p.data.toLowerCase().includes(query))
        .map(p => {
            const author = accounts.find(a => a.username === p.username);
            p.pfp = author ? author.pfp : `https://ui-avatars.com/api/?name=${p.username}`;
            return p;
        }).reverse();
    res.json(posts);
});

app.delete('/post/:id', (req, res) => {
    if (!req.session.user) return res.status(401).send();
    let posts = getPosts();
    const post = posts.find(p => p.id === req.params.id);
    if (post && post.username === req.session.user) {
        posts = posts.filter(p => p.id !== req.params.id);
        fs.writeFileSync(DATA_FILE, posts.map(p => JSON.stringify(p)).join('\n') + '\n');
        return res.json({ success: true });
    }
    res.status(403).send();
});

app.put('/post/:id', (req, res) => {
    if (!req.session.user) return res.status(401).send();
    let posts = getPosts();
    const index = posts.findIndex(p => p.id === req.params.id && p.username === req.session.user);
    if (index !== -1) {
        posts[index].data = req.body.data;
        fs.writeFileSync(DATA_FILE, posts.map(p => JSON.stringify(p)).join('\n') + '\n');
        return res.json({ success: true });
    }
    res.status(403).send();
});

app.get('/api/user/:username', (req, res) => {
    const user = getAccounts().find(a => a.username === req.params.username);
    if (user) {
        const { password, ...publicData } = user;
        res.json(publicData);
    } else res.status(404).send();
});

app.post('/logout', (req, res) => { req.session.destroy(); res.json({ success: true }); });

app.listen(port, () => console.log(`Server: http://localhost:${port}`));