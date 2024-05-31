const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index.controller');

// Middleware pour vérifier l'authentification
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/debut', isAuthenticated, indexController.sendDebut);
router.get('/graphs', isAuthenticated, indexController.sendGraphique);

module.exports = router;
