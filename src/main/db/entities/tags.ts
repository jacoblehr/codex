import sqlite from "better-sqlite3";
import { BulkReadOperation, Entity, IDSchema, ReadOperation } from "./entity";
import Links, { ReadLink } from "./links";

export type ReadTag = {
    id: number;
    link_id: number;
    tag: string;
    link?: ReadLink;
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
        const link = await new Links().find({
            db: args.db,
            id: tag.link_id,
        });

        tag.link = link;
        return tag;
    }

    public async findAll(args: { db: sqlite.Database } & BulkReadOperation<ReadTag>): Promise<Array<ReadTag>> {
        const tags = await super.findAll(args);
        const links = await new Links().findAll({
            db: args.db,
            where: {},
        });

        tags.forEach((tag: ReadTag) => {
            tag.link = links.find((l: ReadLink) => l.id === tag.link_id);
        });

        return tags;
    }

    public initStatement = `
		CREATE TABLE IF NOT EXISTS tags (
			id INTEGER PRIMARY KEY,
			link_id INTEGER NOT NULL,
			tag TEXT NOT NULL,

			FOREIGN KEY (link_id) REFERENCES links(id),
			UNIQUE(link_id, tag)
		);
	`;

    public createStatement = `
		INSERT INTO tags (link_id, tag)
		VALUES (@link_id, @tag);
	`;

    public findStatement = `
		SELECT *
		FROM tags
		WHERE id = @id;
	`;

    public updateStatement = `
		UPDATE tags
		SET
			link_id = @link_id,
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
