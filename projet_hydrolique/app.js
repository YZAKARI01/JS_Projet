const express = require('express');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const excelReader = require('./data/excelReader');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');
const session = require('express-session');

const app = express();
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 1000000 }  // Limite de taille de fichier à 1MB
});

// Variable pour stocker le chemin du dernier fichier téléchargé
let latestFilePath = '';

// Connexion à MongoDB
const url = 'mongodb://localhost:27019';
const dbName = 'myDatabase';
const client = new MongoClient(url);

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

async function findDocuments(collectionName, query) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return await collection.find(query).toArray();
}

async function insertDocument(collectionName, document) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return await collection.insertOne(document);
}

// Configuration des sessions
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Middleware pour vérifier l'authentification
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.render('login', { title: 'Connexion' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Créer un compte' });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    await insertDocument('users', { username, password });
    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await findDocuments('users', { username, password });

    if (users.length > 0) {
        req.session.user = users[0];
        res.redirect('/debut');
    } else {
        res.redirect('/login');
    }
});

app.get('/debut', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'debut.html'));
});

app.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        latestFilePath = req.file.path; // Enregistre le chemin du fichier téléchargé
        const data = await excelReader(req.file.path);
        res.json(data);
    } catch (error) {
        res.status(500).send('Failed to process file');
    }
});

app.get('/data', isAuthenticated, async (req, res) => {
    try {
        if (!latestFilePath) {
            return res.status(400).send('No file uploaded yet.');
        }
        const data = await excelReader(latestFilePath);
        res.json(data);
    } catch (error) {
        res.status(500).send('Failed to fetch data');
    }
});

const indexRouter = require('./routes/index');

app.use('/', indexRouter);

const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

let userCount = 0;

io.on('connection', (socket) => {
    userCount++;
    console.log(`User connected: ${socket.id}`);
    console.log(`Total connected users: ${userCount}`);
    
    io.emit('userCount', userCount);

    socket.on('disconnect', () => {
        userCount--;
        console.log(`User disconnected: ${socket.id}`);
        console.log(`Total connected users: ${userCount}`);
        
        io.emit('userCount', userCount);
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
