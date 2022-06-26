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
        return tag;
    }

    public async findAll(args: { db: sqlite.Database } & BulkReadOperation<ReadTag>): Promise<Array<ReadTag>> {
        const tags = await super.findAll(args);
        return tags;
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
		SELECT *
		FROM tags
		WHERE id = @id
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
		SELECT *
		FROM tags
	`;

    public countStatement = `
		SELECT t.id, IFNULL(COUNT(t.id), 0)
		FROM tags t
		LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
		GROUP BY t.id;
	`;
}

export default Tags;
