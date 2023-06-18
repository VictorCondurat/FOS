var _a;
import { User } from '../models/user.js';
export class UserController {
    static async updateUser(postData, req, res) {
        console.log("Received update user request with data:", postData);
        const cookies = req.headers.cookie?.split(';');
        const usernameCookie = cookies?.find((cookie) => cookie.trim().startsWith('username='));
        if (usernameCookie) {
            const username = usernameCookie.trim().split('=')[1];
            const { newUsername, email } = postData;
            console.log("Values before invoking updateUser:", username, email, newUsername);
            try {
                const result = await User.updateUser(username, email, newUsername);
                if (result) {
                    // Update the cookie value
                    const updatedCookie = `username=${newUsername}; HttpOnly;`;
                    res.setHeader('Set-Cookie', updatedCookie);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'User updated successfully' }));
                }
                else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'User not found or update unsuccessful' }));
                }
            }
            catch (err) {
                console.error('Error in updateUser controller:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
            }
        }
        else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    }
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
UserController.getUserInfo = async (req, res) => {
    const cookies = req.headers.cookie?.split(';');
    const usernameCookie = cookies?.find((cookie) => cookie.trim().startsWith('username='));
    if (usernameCookie) {
        const username = usernameCookie.trim().split('=')[1];
        const user = await User.getUserByInfo(username);
        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
        }
    }
    else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
    }
};
