import sqlite from "better-sqlite3";

export type CreateOperation<T> = {
	input: Omit<T, "id">;
};

export type ReadOperation<T> = {
	id: number;
};

export type UpdateOperation<T> = {
	id: number;
	input: Omit<T, "id">;
};

export type DeleteOperation<T> = {
	id: number;
};

export type BulkReadOperation<T> = {
	where?: Partial<T>;
};

export type IDSchema = {
	id: number;
};

export abstract class Entity<ReadSchema, WriteSchema> {
	public abstract initStatement: string;

	public abstract createStatement: string;
	public abstract findStatement: string;
	public abstract updateStatement: string;
	public abstract deleteStatement: string;

	public abstract findAllStatement: string;

	public async init(db: sqlite.Database): Promise<void> {
		await db.exec(this.initStatement);
	}

	public async create(
		args: { db: sqlite.Database } & CreateOperation<WriteSchema>
	): Promise<ReadSchema> {
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
			throw new Error(`Failed to create entity`);
		}
	}

	public async find(
		args: { db: sqlite.Database } & ReadOperation<IDSchema>
	): Promise<ReadSchema> {
		const { db, id } = args;

		// Find the entity
		const selectStatement = db.prepare<{ id: number }>(this.findStatement);
		const entity = await selectStatement.get({ id });
		if (!entity) {
			throw new Error(`Failed to find entity with id ${id}`);
		}

		return entity as ReadSchema;
	}

	public async update(
		args: { db: sqlite.Database } & UpdateOperation<WriteSchema>
	): Promise<ReadSchema> {
		const { db, id, input } = args;

		// Ensure that the entity exists
		await this.find({ db, id });

		// Update the entity
		const updateStatement = await db.prepare<{ id: number } & WriteSchema>(
			this.updateStatement
		);
		await updateStatement.run({ id, ...input });

		// Re-read the entity
		const updatedEntity = await this.find({ db, id });
		return updatedEntity as ReadSchema;
	}

	public async delete(
		args: { db: sqlite.Database } & DeleteOperation<IDSchema>
	): Promise<void> {
		const { db, id } = args;

		// Ensure that the entity exists
		await this.find({ db, id });

		// Delete the entity
		const deleteStatement = await db.prepare<{ id: number }>(
			this.deleteStatement
		);
		await deleteStatement.run({ id });
	}

	public async findAll(
		args: { db: sqlite.Database } & BulkReadOperation<ReadSchema>
	): Promise<Array<ReadSchema>> {
		const { db, where } = args;

		const readStatementRaw = this.findAllStatement;

		const readStatement = await db.prepare<Partial<ReadSchema>>(`
			${readStatementRaw}
			${
				where
					? Object.keys(where)
							.map((key: string, index: number) => {
								return `
					${index === 0 ? "WHERE" : "AND"} ${key} = @${key}
				`;
							})
							.join("\n")
					: ""
			}
		`);

		const result = await readStatement.all(where ?? {});

		return result;
	}
}
