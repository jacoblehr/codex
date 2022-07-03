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
