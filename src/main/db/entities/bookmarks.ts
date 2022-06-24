import { BulkReadOperation, Entity, IDSchema, ReadOperation } from "./entity";
import sqlite from "better-sqlite3";

export type ReadBookmark = {
    id: number;
    name?: string;
    uri: string;
    created_at: string;
    updated_at: string;
    description?: string;
};
export type Bookmark = ReadBookmark;
export type WriteBookmark = Omit<ReadBookmark, "id" | "created_at" | "updated_at">;

export class Bookmarks extends Entity<ReadBookmark, WriteBookmark> {
    public async find(args: { db: sqlite.Database } & ReadOperation<IDSchema>): Promise<ReadBookmark> {
        const bookmark = await super.find(args);
        return bookmark;
    }

    public async findAll(args: { db: sqlite.Database } & BulkReadOperation<ReadBookmark>): Promise<Array<ReadBookmark>> {
        const bookmarks = await super.findAll(args);
        return bookmarks;
    }

    public initStatement = `
		CREATE TABLE IF NOT EXISTS bookmarks (
			id INTEGER PRIMARY KEY,
			uri TEXT NOT NULL,
			description TEXT,
			name TEXT,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME
		);
		
		CREATE TRIGGER IF NOT EXISTS bookmark_updated
		AFTER UPDATE ON bookmarks
		BEGIN
			UPDATE bookmarks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
		END;
	`;

    public createStatement = `
		INSERT INTO bookmarks (name, uri, description)
		VALUES (@name, @uri, @description);
	`;

    public findStatement = `
		SELECT *
		FROM bookmarks
		WHERE id = @id;
	`;

    public updateStatement = `
		UPDATE bookmarks
		SET
			name = @name,
			uri = @uri,
			description = @description
		WHERE id = @id;
	`;

    public deleteStatement = `
		DELETE
		FROM bookmarks
		WHERE id = @id;
	`;

    public findAllStatement = `
		SELECT *
		FROM bookmarks
	`;

    public findAllGroupedStatement = `
		SELECT bookmark, count(*) 
		FROM bookmarks l
		JOIN tags t ON t.bookmark_id = l.id
	`;
}

export default Bookmarks;
