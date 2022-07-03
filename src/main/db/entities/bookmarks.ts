import { BulkReadOperation, Entity, IDSchema, ReadOperation } from "./entity";
import sqlite from "better-sqlite3";
import { Tag } from "./tags";

export type ReadBookmark = {
    id: number;
    name?: string;
    image_uri?: string;
    uri: string;
    created_at: string;
    updated_at: string;
    description?: string;
    tags: Array<Tag>;
};
export type Bookmark = ReadBookmark;
export type WriteBookmark = Omit<ReadBookmark, "id" | "created_at" | "updated_at" | "tags"> & {
    tags?: Array<Tag>;
};

export class Bookmarks extends Entity<ReadBookmark, WriteBookmark> {
    public async find(args: { db: sqlite.Database } & ReadOperation<IDSchema>): Promise<ReadBookmark> {
        const bookmark = await super.find(args);

        return {
            ...bookmark,
            tags: JSON.parse(bookmark.tags as unknown as string),
        };
    }

    public async findAll(args: { db: sqlite.Database } & BulkReadOperation<ReadBookmark>): Promise<Array<ReadBookmark>> {
        const bookmarks = await super.findAll(args);

        return bookmarks.map((bookmark: Bookmark) => {
            return {
                ...bookmark,
                tags: JSON.parse(bookmark.tags as unknown as string),
            };
        });
    }

    public initStatement = `
		CREATE TABLE IF NOT EXISTS bookmarks (
			id INTEGER PRIMARY KEY,
			uri TEXT NOT NULL,
			name TEXT,
			description TEXT,
			image_uri TEXT,
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
		INSERT INTO bookmarks (name, uri, description, image_uri)
		VALUES (@name, @uri, @description, @image_uri);
	`;

    public findStatement = `
		SELECT b.*, IFNULL(bt.tags, '[]') AS tags
		FROM bookmarks b 
		LEFT JOIN
		(
			SELECT b.id, json_group_array(
				json_object(
					'id', t.id,
					'tag', t.tag,
					'color', t.color
				)
			) AS tags
			FROM bookmarks b
			JOIN bookmark_tags bt ON b.id = bt.bookmark_id
			JOIN tags t ON bt.tag_id = t.id
			GROUP BY b.id
		) AS bt ON bt.id = b.id
		WHERE b.id = @id;
	`;

    public updateStatement = `
		UPDATE bookmarks
		SET
			name = @name,
			uri = @uri,
			description = @description,
			image_uri = @image_uri
		WHERE id = @id;
	`;

    public deleteStatement = `
		DELETE
		FROM bookmarks
		WHERE id = @id;
	`;

    public findAllStatement = `
		SELECT b.*, IFNULL(bt.tags, '[]') AS tags
		FROM bookmarks b 
		LEFT JOIN
		(
			SELECT b.id, json_group_array(
				json_object(
					'id', t.id,
					'tag', t.tag,
					'color', t.color
				)
			) AS tags
			FROM bookmarks b
			JOIN bookmark_tags bt ON b.id = bt.bookmark_id
			JOIN tags t ON bt.tag_id = t.id
			GROUP BY b.id
		) AS bt ON bt.id = b.id
	`;

    public deleteAllStatement = `
		DELETE
		FROM bookmarks
	`;

    public countStatement = `
		SELECT b.id, IFNULL(COUNT(b.id), 0)
		FROM bookmarks b
		LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
		GROUP BY b.id;
	`;
}

export default Bookmarks;
