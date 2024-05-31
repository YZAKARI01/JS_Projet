const sendFile = (_, res, fileName) => {
    const options = {
                       root: 'public',
                       headers: {
                         'x-timestamp': Date.now(),
                         'x-sent': true
                       }
                     };
    res.sendFile(fileName, options);
 }
 
 module.exports.sendFile = sendFile;

