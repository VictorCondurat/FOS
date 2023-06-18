var _a;
import { User } from '../models/user.js';
export class UserController {
}
_a = UserController;
UserController.signup = async (postData, req, res) => {
    console.log("Received signup request with data:", postData);
    if (postData.email && postData.password && postData.uname) {
        console.log("Creating user", postData.email, postData.password, postData.uname);
        const user = await User.create(postData.email, postData.password, postData.uname);
        if (user) {
            console.log("User created successfully");
            res.setHeader('Set-Cookie', `username=${user.username}; HttpOnly;`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Signup successful' }));
        }
        else {
            console.log("User creation failed");
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Signup failed' }));
        }
    }
    else {
        console.log("Invalid request data", postData);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
    }
};
UserController.login = async (postData, req, res) => {
    console.log("Received login request with data:", postData);
    let user;
    user = await User.getUserByUsername(postData.uname);
    if (user) {
        console.log("Comparing user password:", user.password, "with provided password:", postData.pass);
        if (user.password.trim() === postData.pass) {
            res.setHeader('Set-Cookie', `username=${user.username}; HttpOnly;`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
        }
        else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid username or password' }));
        }
    }
    else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid username or password' }));
    }
};
