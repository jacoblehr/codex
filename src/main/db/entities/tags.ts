import sqlite from "better-sqlite3";
import { Bookmark } from "./bookmarks";
import { BulkReadOperation, Entity, IDSchema, ReadOperation } from "./entity";

export type ReadTag = {
    id: number;
    tag: string;
    bookmarks?: Array<Omit<Bookmark, "tags">>;
};
export type Tag = ReadTag;
export type WriteTag = Omit<ReadTag, "id" | "bookmarks">;

export class Tags extends Entity<ReadTag, WriteTag> {
    public async find(args: { db: sqlite.Database } & ReadOperation<IDSchema>): Promise<ReadTag> {
        const tag = await super.find(args);
        return {
            ...tag,
            bookmarks: JSON.parse(tag.bookmarks as unknown as string),
        };
    }

    public async findAll(args: { db: sqlite.Database } & BulkReadOperation<ReadTag>): Promise<Array<ReadTag>> {
        const tags = await super.findAll(args);
        return tags.map((tag: Tag) => {
            return {
                ...tag,
                bookmarks: JSON.parse(tag.bookmarks as unknown as string),
            };
        });
    }

    public initStatement = `
		CREATE TABLE IF NOT EXISTS tags (
			id INTEGER PRIMARY KEY,
			tag TEXT NOT NULL,

			UNIQUE(tag)
		);
	`;

    public createStatement = `
		INSERT INTO tags (tag)
		VALUES (@tag);
	`;

    public findStatement = `
		SELECT t.*, IFNULL(bt.bookmarks, '[]') AS bookmarks
		FROM tags t
		LEFT JOIN
		(
			SELECT t.id, json_group_array(
				json_object(
					'id', b.id,
					'uri', b.uri,
					'description', b.description,
					'name', b.name,
					'created_at', b.created_at,
					'updated_at', b.updated_at
				)
			) AS bookmarks
			FROM tags t
			JOIN bookmark_tags bt ON t.id = bt.tag_id
			JOIN bookmarks b ON bt.bookmark_id = b.id
			GROUP BY t.id
		) AS bt ON bt.id = t.id
		WHERE t.id = @id;
	`;

    public updateStatement = `
		UPDATE tags
		SET
			tag = @tag
		WHERE id = @id;
	`;

    public deleteStatement = `
		DELETE
		FROM tags
		WHERE id = @id;
	`;

    public deleteAllStatement = `
		DELETE 
		FROM tags
	`;

    public findAllStatement = `
		SELECT t.*, IFNULL(bt.bookmarks, '[]') AS bookmarks
		FROM tags t
		LEFT JOIN
		(
			SELECT t.id, json_group_array(
				json_object(
					'id', b.id,
					'uri', b.uri,
					'description', b.description,
					'name', b.name,
					'created_at', b.created_at,
					'updated_at', b.updated_at
				)
			) AS bookmarks
			FROM tags t
			JOIN bookmark_tags bt ON t.id = bt.tag_id
			JOIN bookmarks b ON bt.bookmark_id = b.id
			GROUP BY t.id
		) AS bt ON bt.id = t.id
	`;

    public countStatement = `
		SELECT t.id, IFNULL(COUNT(t.id), 0)
		FROM tags t
		LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
		GROUP BY t.id;
	`;
}

export default Tags;
