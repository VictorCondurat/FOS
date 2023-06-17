var _a;
import { User } from '../models/user.js';
export class UserController {
}
_a = UserController;
UserController.signup = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        const postData = JSON.parse(body);
        if (postData.email && postData.password && postData.uname) {
            const user = await User.create(postData.email, postData.password, postData.uname);
            if (user) {
                res.setHeader('Set-Cookie', `userId=${user.id}; HttpOnly;`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Signup successful' }));
            }
            else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Signup failed' }));
            }
        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request' }));
        }
    });
};
UserController.login = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        const postData = JSON.parse(body);
        const user = await User.getUserByUsername(postData.uname);
        if (user && user.password === postData.pass) {
            res.setHeader('Set-Cookie', `userId=${user.id}; HttpOnly;`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
        }
        else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid username or password' }));
        }
    });
};
