import sqlite from "better-sqlite3";
import Entities from "./entities";

export class Database {
    public database: sqlite.Database;

    constructor() {
        this.init();
    }

    public init(): sqlite.Database {
        this.database = new sqlite(":memory:");
        return this.database;
    }

    public async close(): Promise<void> {
        await this.database.close();
        return;
    }

    public async migrate(): Promise<void> {
        await Entities.bookmarks.init(this.database);
        await Entities.tags.init(this.database);
        await Entities.bookmarkTags.init(this.database);

        const bookmark = await Entities.bookmarks.create({
            db: this.database,
            input: { name: "HOHOHO", uri: "teehee", description: "HAA" },
        });

        const bookmark2 = await Entities.bookmarks.create({
            db: this.database,
            input: { name: "HOHOHO", uri: "teehee", description: "HAA" },
        });

        const t1 = await Entities.tags.create({
            db: this.database,
            input: { tag: `tag-${new Date().getTime() + 10}` },
        });

        const t2 = await Entities.tags.create({
            db: this.database,
            input: { tag: `tag-${new Date().getTime() + 20}` },
        });

        const t3 = await Entities.tags.create({
            db: this.database,
            input: { tag: `tag-${new Date().getTime() + 30}` },
        });

        await Entities.bookmarkTags.create({
            db: this.database,
            input: {
                bookmark_id: bookmark.id,
                tag_id: t1.id,
            },
        });

        await Entities.bookmarkTags.create({
            db: this.database,
            input: {
                bookmark_id: bookmark.id,
                tag_id: t2.id,
            },
        });

        await Entities.bookmarkTags.create({
            db: this.database,
            input: {
                bookmark_id: bookmark.id,
                tag_id: t3.id,
            },
        });

        return;
    }

    public async save(filename: string): Promise<sqlite.BackupMetadata> {
        return await this.database.backup(filename);
    }

    public async load(filename: string): Promise<void> {
        const workspace = new sqlite(filename, { fileMustExist: true });

        const workspaceBuffer = workspace.serialize() as Buffer;
        await workspace.close();

        const newWorkspace = new sqlite(workspaceBuffer.toString());

        await this.database.close();
        this.database = newWorkspace;

        return;
    }
}

export default new Database();
