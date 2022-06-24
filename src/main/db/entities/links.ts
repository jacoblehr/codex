import { BulkReadOperation, Entity, IDSchema, ReadOperation } from "./entity";
import sqlite from "better-sqlite3";
import Tags, { ReadTag } from "./tags";

export type ReadLink = {
    id: number;
    name?: string;
    uri: string;
    created_at: string;
    updated_at: string;
    description?: string;
    tags: Array<ReadTag>;
};
export type Link = ReadLink;
export type WriteLink = Omit<ReadLink, "id" | "created_at" | "updated_at">;

export class Links extends Entity<ReadLink, WriteLink> {
    public async find(args: { db: sqlite.Database } & ReadOperation<IDSchema>): Promise<ReadLink> {
        const link = await super.find(args);
        const tags = await new Tags().findAll({
            db: args.db,
            where: {
                link_id: link.id,
            },
        });

        link.tags = tags;
        return link;
    }

    public async findAll(args: { db: sqlite.Database } & BulkReadOperation<ReadLink>): Promise<Array<ReadLink>> {
        const links = await super.findAll(args);
        const tags = await new Tags().findAll({
            db: args.db,
            where: {},
        });

        links.forEach((link: ReadLink) => {
            link.tags = tags.filter((t: ReadTag) => t.link_id === link.id);
        });

        return links;
    }

    public initStatement = `
		CREATE TABLE IF NOT EXISTS links (
			id INTEGER PRIMARY KEY,
			uri TEXT NOT NULL,
			description TEXT,
			name TEXT,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME
		);
		
		CREATE TRIGGER IF NOT EXISTS link_updated
		AFTER UPDATE ON links
		BEGIN
			UPDATE links SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
		END;
	`;

    public createStatement = `
		INSERT INTO links (name, uri, description)
		VALUES (@name, @uri, @description);
	`;

    public findStatement = `
		SELECT *
		FROM links
		WHERE id = @id;
	`;

    public updateStatement = `
		UPDATE links
		SET
			name = @name,
			uri = @uri,
			description = @description
		WHERE id = @id;
	`;

    public deleteStatement = `
		DELETE
		FROM links
		WHERE id = @id;
	`;

    public findAllStatement = `
		SELECT *
		FROM links
	`;

    public findAllGroupedStatement = `
		SELECT link, count(*) 
		FROM links l
		JOIN tags t ON t.link_id = l.id
	`;
}

export default Links;
