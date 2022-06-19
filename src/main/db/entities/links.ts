import { Entity } from "./entity";

export type ReadLink = {
	id: number;
	name?: string;
	uri: string;
	created_at: string;
	updated_at: string;
	description?: string;
};
export type Link = ReadLink;
export type WriteLink = Omit<ReadLink, "id" | "created_at" | "updated_at">;

export class Links extends Entity<ReadLink, WriteLink> {
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
}

export default Links;
