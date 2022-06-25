import { BulkReadOperation, Entity, IDSchema, ReadOperation } from "./entity";
import sqlite from "better-sqlite3";
import { Tag } from "./tags";

export type ReadBookmark = {
    id: number;
    name?: string;
    uri: string;
    created_at: string;
    updated_at: string;
    description?: string;
    tags: Array<Tag>;
};
export type Bookmark = ReadBookmark;
export type WriteBookmark = Omit<ReadBookmark, "id" | "created_at" | "updated_at" | "tags">;

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
		SELECT b.*, IFNULL(t.tags, '[]') AS tags
		FROM bookmarks b
		LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
		LEFT JOIN (
			SELECT _tags.id, json_group_array(
				json_object(
					'id', _tags.id,
					'tag', _tags.tag
				)
			) AS tags
			FROM tags _tags
		) AS t ON t.id = bt.tag_id
		WHERE b.id = @id;
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
		SELECT b.*, IFNULL(t.tags, '[]') AS tags
		FROM bookmarks b
		LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
		LEFT JOIN (
			SELECT _tags.id, json_group_array(
				json_object(
					'id', _tags.id,
					'tag', _tags.tag
				)
			) AS tags
			FROM tags _tags
		) AS t ON t.id = bt.tag_id;
	`;

    public countStatement = `
		SELECT b.id, IFNULL(COUNT(b.id), 0)
		FROM bookmarks b
		LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
		GROUP BY b.id
	`;
}

export default Bookmarks;
