var _a;
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { sessions } from '../server.js';
import { generateSessionId } from '../server.js';
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
UserController.signup = async (postData, res) => {
    console.log("Received signup request with data:", postData);
    if (postData.email && postData.password && postData.uname) {
        console.log("Creating user", postData.email, postData.password, postData.uname);
        const user = await User.create(postData.email, postData.password, postData.uname);
        if (user) {
            console.log("User created successfully");
            const sessionId = generateSessionId();
            sessions.set(sessionId, user.username);
            res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly;`);
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
UserController.login = async (postData, res) => {
    console.log("Received login request with data:", postData);
    let user;
    user = await User.getUserByUsername(postData.uname);
    if (user) {
        console.log("Comparing user password:", user.password, "with provided password:", postData.pass);
        const match = await bcrypt.compare(postData.pass, user.password);
        if (match) {
            const sessionId = generateSessionId();
            sessions.set(sessionId, user.username);
            res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly;`);
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
UserController.logout = async (req, res) => {
    const cookies = req.headers.cookie?.split(';');
    const sessionCookie = cookies?.find((cookie) => cookie.trim().startsWith('sessionId='));
    if (sessionCookie) {
        const sessionId = sessionCookie.trim().split('=')[1];
        sessions.delete(sessionId);
    }
    res.setHeader('Set-Cookie', `sessionId=; HttpOnly; Max-Age=0;`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Logout successful' }));
};
UserController.getUserInfo = async (req, res) => {
    const cookies = req.headers.cookie?.split(';');
    const sessionIdCookie = cookies?.find((cookie) => cookie.trim().startsWith('sessionId='));
    if (sessionIdCookie) {
        const sessionId = sessionIdCookie.trim().split('=')[1];
        const username = sessions.get(sessionId);
        let user;
        if (username) {
            user = await User.getUserByInfo(username);
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
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
        }
    }
    else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
    }
};
