import sqlite from "better-sqlite3";
import { BulkReadOperation, Entity, IDSchema, ReadOperation } from "./entity";

export type ReadTag = {
    id: number;
    tag: string;
};
export type Tag = ReadTag;
export type WriteTag = Omit<ReadTag, "id">;

export type TagGrouped = {
    tag: string;
    count: number;
};

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

			FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id),
			UNIQUE(tag)
		);
	`;

    public createStatement = `
		INSERT INTO tags (bookmark_id, tag)
		VALUES (@bookmark_id, @tag);
	`;

    public findStatement = `
		SELECT *
		FROM tags
		WHERE id = @id;
	`;

    public updateStatement = `
		UPDATE tags
		SET
			bookmark_id = @bookmark_id,
			tag = @tag
		WHERE id = @id;
	`;

    public deleteStatement = `
		DELETE
		FROM tags
		WHERE id = @id;
	`;

    public findAllStatement = `
		SELECT *
		FROM tags
	`;

    public findAllGroupedStatement = `
		SELECT t.tag, count(*)
		FROM tags t
		GROUP BY t.tag
	`;
}

export default Tags;
