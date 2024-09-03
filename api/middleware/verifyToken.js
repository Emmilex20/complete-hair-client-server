const jwt = require('jsonwebtoken');
  
  // verify jwt token
  // middleware

const verifyToken = (req, res, next) => {
    // console.log(req.headers.authorization);
    if (!req.headers.authorization) {
      return res.status(401).send({ message: "Unauthorized Access." });
    }

    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Invalid token." });
      }
      req.decoded = decoded;
      next();
    });
  }

  module.exports = verifyToken;