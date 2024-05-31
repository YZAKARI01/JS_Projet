const sendFile = require('./send').sendFile;

const sendDebut = (req, res) => sendFile(req, res, 'debut.html');
const sendGraphique = (req, res) => sendFile(req, res, 'graphs.html');

module.exports.sendDebut = sendDebut;
module.exports.sendGraphique = sendGraphique;
