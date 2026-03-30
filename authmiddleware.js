const chalk = require('chalk');
const jwt = require('jsonwebtoken');


function authMiddleWare(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        return res.status(404).json({
            message: "Uauthorized. No token found"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const userId = decoded.userId;
        
        if (!userId) {
            return res.status(401).json({
                message: "malformed token"
            })
        } else {
            req.userId = userId;
            next()
        }
    } catch (error) {
        console.log(chalk.red('Authorization error:'));
        console.log(error);
        return res.status(401).json({
            message: "Invalid or malformed token"
        })
    }
}


module.exports = {
    authMiddleWare: authMiddleWare
}