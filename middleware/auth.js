const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utlis/config');
const User = require('../models/user');

// middleware to check if the user is authenticated
const isAuthenticated = async (request, response, next) => {
    // get the token from the cookies
    const token = request.cookies && request.cookies.token;
    
    // if there is no token, return a 401 response with message "User is not authenticated"
    if (!token) {
        return response.status(401).json({ message: "User is not authenticated" });
    }

    try {
        // if there is a token, verify it using jwt.verify() method
        const decoded = jwt.verify(token, JWT_SECRET);

        // if the token is valid, get the userId from the token payload
        const userId = decoded.userId;

        // add the userId to the request object for further use in the next middleware or route handler
        request.userId = userId;

        // call the next middleware or route handler
        next();
    } catch (e) {
        return response.status(401).json({ message: "Unauthorized access" });
    }
}

// middleware to check if the user has the required role(s)
const allowRoles = (roles) => {
    return async (request, response, next) => {
        // get the userId from the request object
        const userId = request.userId;

        // get the user from the database using the userId
        const user = await User.findById(userId);

        // check if the user exists
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // check if the user's role is included in the allowed roles
        // if not, return a 403 response with message "Forbidden: You do not have the required role(s) to access this resource"
        if (!roles.includes(user.role)) {
            return response.status(403).json({ message: "Forbidden: You do not have the required role(s) to access this resource" });
        }

        // add the user object to the request object for further use in the next middleware or route handler
        request.user = user;

        // if yes, call the next middleware or route handler
        next();
    }
}

// export the middleware functions
module.exports = {
    isAuthenticated,
    allowRoles
}