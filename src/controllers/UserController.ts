import http, { IncomingMessage } from 'http';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { sessions } from '../server.js';
import { generateSessionId } from '../server.js';


export class UserController {

    static signup = async (postData: any, res: http.ServerResponse) => {
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
            } else {
                console.log("User creation failed");
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Signup failed' }));
            }
        } else {
            console.log("Invalid request data", postData);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request' }));
        }
    };
    static login = async (postData: any, res: http.ServerResponse) => {
        console.log("Received login request with data:", postData);
        let user: any;
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
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid username or password' }));
            }
        }
        else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid username or password' }));
        }
    };
    static logout = async (req: http.IncomingMessage, res: http.ServerResponse) => {
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

    static getUserInfo = async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const cookies = req.headers.cookie?.split(';');
        const sessionIdCookie = cookies?.find((cookie) => cookie.trim().startsWith('sessionId='));
        if (sessionIdCookie) {
            const sessionId = sessionIdCookie.trim().split('=')[1];
            const username = sessions.get(sessionId);
            let user: any;
            if (username) {
                user = await User.getUserByInfo(username);
                if (user) {
                    const userInfo = {
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        username: user.username,
                        allergens: user.allergens,
                        brands: user.brands,
                        categories: user.categories,
                        countries: user.countries,
                        grades: user.grades,
                        labels: user.labels,
                        places: user.places
                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(userInfo));
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

    static async updateUser(postData: any, req: http.IncomingMessage, res: http.ServerResponse) {
        console.log("Received update user request with data:", postData);

        const cookies = req.headers.cookie?.split(';');
        const sessionIdCookie = cookies?.find((cookie) => cookie.trim().startsWith('sessionId='));

        if (sessionIdCookie) {
            const sessionId = sessionIdCookie.trim().split('=')[1];
            const username = sessions.get(sessionId);
            const { newUsername, email } = postData;

            console.log("Values before invoking updateUser:", username, email, newUsername);

            if (typeof username === 'string') {
                try {
                    const result = await User.updateUser(username, email, newUsername);
                    console.log(result);
                    if (result) {
                        // Update the cookie value
                        sessions.set(sessionId, newUsername);
                        res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly;`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'User updated successfully' }));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'User not found or update unsuccessful' }));
                    }
                } catch (err) {
                    console.error('Error in updateUser controller:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Username not found in session' }));
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    }

    static async updateUserPrefs(postData: any, req: IncomingMessage, res: http.ServerResponse) {
        console.log("Received update user prefs request with data:", postData);

        const cookies = req.headers.cookie?.split(';');
        const sessionIdCookie = cookies?.find((cookie) => cookie.trim().startsWith('sessionId='));

        if (sessionIdCookie) {
            const sessionId = sessionIdCookie.trim().split('=')[1];
            const username = sessions.get(sessionId);
            console.log(username);
            console.log("Values before invoking updateUserPrefs:", username, postData);

            if (typeof username === 'string') {
                try {
                    const result = await User.updateUserPrefs(username, postData);
                    console.log(result);
                    if (result) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'User preferences updated successfully' }));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'User not found or preferences update unsuccessful' }));
                    }
                } catch (err) {
                    console.error('Error in updateUserPrefs controller:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Username not found in session' }));
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    }

    static async getStats(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const cookies = req.headers.cookie?.split(';');
            const sessionIdCookie = cookies?.find((cookie) => cookie.trim().startsWith('sessionId='));

            if (sessionIdCookie) {
                const sessionId = sessionIdCookie.trim().split('=')[1];
                const username = sessions.get(sessionId);

                if (username) {
                    console.log('Retrieving statistics for username:', username);
                    const statistics = await User.getStatistics(username);

                    console.log('Statistics:', statistics);

                    if (statistics) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(statistics));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'User not found' }));
                    }
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                }
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
            }
        } catch (error) {
            console.error('Error retrieving statistics:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    }
}
