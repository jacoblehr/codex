import sqlite from "better-sqlite3";

export type CreateOperation<T> = {
    input: Omit<T, "id">;
};

export type ReadOperation<T> = {
    id: number;
};

export type UpdateOperation<T> = {
    id?: number;
    input: Omit<T, "id">;
};

export type DeleteOperation<T> = {
    id: number;
};

export type BulkUpdateOperation<T> = {
    where?: WhereClause<T>;
    input: Omit<T, "id">;
};

export type BulkDeleteOperation<T> = {
    where?: WhereClause<T>;
};

export type BulkReadOperation<T> = {
    where?: WhereClause<T>;
};

export type IDSchema = {
    id: number;
};

export type WhereClause<T> = {
    [key in keyof T]?: {
        key: string;
        value: any;
        operation?: WhereOperation;
    };
};

export type WhereOperation = "eq" | "=" | "in";

export abstract class Entity<ReadSchema, WriteSchema> {
    public abstract initStatement: string;

    public abstract createStatement: string;
    public abstract findStatement: string;
    public abstract updateStatement: string;
    public abstract deleteStatement: string;

    public abstract findAllStatement: string;
    public abstract deleteAllStatement: string;
    public abstract countStatement: string;

    public async init(db: sqlite.Database): Promise<void> {
        await db.exec(this.initStatement);
    }

    public async create(args: { db: sqlite.Database } & CreateOperation<WriteSchema>): Promise<ReadSchema> {
        const { db, input } = args;

        // Create the entity
        const insertStatement = db.prepare(this.createStatement);
        const createResponse = await insertStatement.run({ ...input });

        // Re-read the object
        try {
            const entity = await this.find({
                db,
                id: Number(createResponse.lastInsertRowid),
            });
            return entity as ReadSchema;
        } catch (e) {
            console.warn(e);
            throw new Error(`Failed to create entity`);
        }
    }

    public async find(args: { db: sqlite.Database } & ReadOperation<IDSchema>): Promise<ReadSchema> {
        const { db, id } = args;

        // Find the entity
        const selectStatement = db.prepare<{ id: number }>(this.findStatement);
        const entity = await selectStatement.get({ id });
        if (!entity) {
            throw new Error(`Failed to find entity with id ${id}`);
        }

        return entity as ReadSchema;
    }

    public async update(args: { db: sqlite.Database } & UpdateOperation<WriteSchema>): Promise<ReadSchema> {
        const { db, id, input } = args;

        // Ensure that the entity exists
        await this.find({ db, id });

        // Update the entity
        const updateStatement = await db.prepare<{ id: number } & WriteSchema>(this.updateStatement);
        await updateStatement.run({ id, ...input });

        // Re-read the entity
        const updatedEntity = await this.find({ db, id });
        return updatedEntity as ReadSchema;
    }

    public async delete(args: { db: sqlite.Database } & DeleteOperation<IDSchema>): Promise<void> {
        const { db, id } = args;

        // Ensure that the entity exists
        await this.find({ db, id });

        // Delete the entity
        const deleteStatement = await db.prepare<{ id: number }>(this.deleteStatement);
        await deleteStatement.run({ id });
    }

    public async deleteAll(args: { db: sqlite.Database } & BulkDeleteOperation<WriteSchema>): Promise<void> {
        const { db } = args;

        // Delete the entities that match the where clause
        const deleteStatement = await db.prepare<Partial<WhereClause<WriteSchema>> & WriteSchema>(`
			${this.deleteAllStatement}
			${this.where(args.where)}`);

        console.warn(deleteStatement);

        await deleteStatement.run({ ...(this.whereParams(args.where) as any) });
    }

    public async findAll(args: { db: sqlite.Database } & BulkReadOperation<ReadSchema>): Promise<Array<ReadSchema>> {
        const { db, where } = args;

        const readStatementRaw = this.findAllStatement;

        const readStatement = db.prepare<Partial<ReadSchema>>(`
			${readStatementRaw}
			${this.where(where)}
		`);

        const result = await readStatement.all((this.whereParams(where) as Partial<ReadSchema>) ?? {});

        return result;
    }

    public async count(args: { db: sqlite.Database }): Promise<Array<ReadSchema>> {
        const { db } = args;

        const countStatement = db.prepare<Partial<ReadSchema>>(`
			${this.countStatement}
		`);

        const result = await countStatement.all({});

        return result;
    }

    private where(where?: WhereClause<any>): string {
        return `${
            where
                ? Object.keys(where)
                      .map((key: string, index: number) => {
                          console.warn(where[key]);
                          console.warn(this.whereOperation(where[key].operation));
                          return `
					${index === 0 ? "WHERE" : "AND"} 
					${key} ${this.whereOperation(where[key].operation)} ${this.whereValue(key, where[key].operation || "=")}
				`;
                      })
                      .join("\n")
                : ""
        }`;
    }

    private whereParams(where?: WhereClause<any>): Record<string, any> {
        const result: any = {};

        if (!where) {
            return result;
        }

        Object.keys(where).forEach((key: string) => {
            if (!result[key]) {
                result[key] = null;
            } else {
                result[key] = Array.isArray(where[key].value) ? `${where[key].value.join(",")}` : where[key].value;
            }
        });

        return result;
    }

    private whereOperation(op: WhereOperation): string {
        switch (op) {
            case "=":
            case "eq":
                return "=";
            case "in":
                return "in";
        }
    }

    private whereValue(key: string, operation: WhereOperation): string {
        switch (operation) {
            case "in":
                return `(@${key})`;
            default:
                return `@${key}`;
        }
    }
}
