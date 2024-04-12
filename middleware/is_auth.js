const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) =>{

    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Not Authorized!');
        error.statusCode = 401;
        throw error;
    }
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try{
        console.log(process.env.SECRET_KEY);
        decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    }
    catch(err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken){
        const error = new Error('Not Authenticated.');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};