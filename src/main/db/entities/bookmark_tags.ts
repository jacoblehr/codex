import { ReadBookmark } from "electron";
import { Entity } from "./entity";

export type ReadBookmarkTag = {
    id: number;
    bookmark_id: number;
    tag_id: number;
};
export type BookmarkTag = ReadBookmark;
export type WriteBookmarkTag = Omit<ReadBookmarkTag, "id">;

export class BookmarkTags extends Entity<ReadBookmarkTag, WriteBookmarkTag> {
    public initStatement = `
		CREATE TABLE IF NOT EXISTS bookmark_tags (
			id INTEGER PRIMARY KEY,
			bookmark_id INTEGER NOT NULL,
			tag_id INTEGER NOT NULL,

			FOREIGN KEY (bookmark_id) REFERENCES bookmarks (id),
			FOREIGN KEY (tag_id) REFERENCES tags (id),
			UNIQUE(bookmark_id, tag_id)
		);
	`;

    public createStatement = `
		INSERT INTO bookmark_tags (bookmark_id, tag_id)
		VALUES (@bookmark_id, @tag_id);
	`;

    public findStatement = `
		SELECT *
		FROM bookmark_tags
		WHERE id = @id;
	`;

    public updateStatement = `
		UPDATE bookmark_tags
		SET
			bookmark_id = @bookmark_id,
			tag_id = @tag_id
		WHERE id = @id;
	`;

    public deleteStatement = `
		DELETE
		FROM bookmark_tags
		WHERE id = @id;
	`;

    public deleteAllStatement = `
		DELETE
		FROM bookmark_tags
	`;

    public findAllStatement = `
		SELECT *
		FROM bookmark_tags
	`;

    public countStatement = `
		SELECT bt.id, count(*)
		FROM bookmark_tags
		GROUP BY bt.id;
	`;
}

export default BookmarkTags;
