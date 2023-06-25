import { IncomingMessage, ServerResponse } from 'http';
import { FilterModel } from '../models/Filters.js';

export class FilterController {
    static async getFilters(_req: IncomingMessage, res: ServerResponse) {
        try {
            const filters = await FilterModel.getAll();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(filters));
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'A server error occurred' }));
        }
    }
}
