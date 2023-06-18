import db from '../db.js';

export class User {
    id: number;
    email: string;
    password: string;
    username: string;

    constructor(id: number, email: string, password: string, username: string) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.username = username;
    }

    static async create(email: string, password: string, username: string) {
        try {
            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existingUser.length > 0) {
                throw new Error('User with this email already exists');
            }

            const result = await db.query('INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id', [email, password, username]);
            console.log('Running query:', 'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id', [email, password, username]);
            console.log('Result:', result);

            if (result.length > 0) {
                const row = result[0];
                return new User(row.id, email, password, username);
            } else {
                throw new Error('User not created');
            }
        } catch (err: unknown) {
            console.error('Error during user creation:', err);
            return null;
        }
    }


    static async getUserByUsername(username: string) {
        try {
            const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
            console.log('getUserByUsername result:', result);
            if (result.length > 0) {
                const row = result[0];
                return new User(row.iid, row.email, row.password, row.username);
            } else {
                return null;
            }
        } catch (err: unknown) {
            console.error('Error in getUserByUsername:', err);
            return null;
        }
    }


}
