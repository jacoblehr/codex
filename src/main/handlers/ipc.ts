import { dialog, ipcMain } from "electron";

import db from "../db";
import Entities from "../db/entities";
import { Link } from "../db/entities/links";

export const registerHandlers = () => {
	/**
	 * Workspace Operations
	 */
	ipcMain.handle(
		"open-workspace",
		async (_event: Electron.IpcMainInvokeEvent) => {
			const openResult: Electron.OpenDialogReturnValue =
				await dialog.showOpenDialog({
					filters: [
						{ name: "Codex Workspace", extensions: [".cdx"] },
					],
				});

			const { canceled, filePaths } = openResult;
			if (canceled) {
				return;
			}

			const workspace = await db.load(filePaths[0]);
			_event.returnValue = workspace;
		}
	);

	ipcMain.handle(
		"save-workspace",
		async (_event: Electron.IpcMainInvokeEvent) => {
			const saveResult: Electron.SaveDialogReturnValue =
				await dialog.showSaveDialog({
					filters: [
						{ name: "Codex Workspace", extensions: [".cdx"] },
					],
				});

			const { canceled, filePath } = saveResult;
			if (canceled) {
				return;
			}

			const workspace = await db.save(filePath);
			_event.returnValue = workspace;
		}
	);

	/**
	 * Database Operations
	 */

	ipcMain.handle(
		"create-link",
		async (_event: Electron.IpcMainInvokeEvent, args: Link) => {
			const { name, uri, description } = args;

			const link = await Entities.links.create({
				db: db.database,
				input: { name, uri, description },
			});

			_event.returnValue = link;
			return link;
		}
	);

	ipcMain.handle(
		"get-link",
		async (_event: Electron.IpcMainInvokeEvent, args: { id: number }) => {
			const { id } = args;

			const link = await Entities.links.find({
				db: db.database,
				id,
			});

			_event.returnValue = link;
			return link;
		}
	);

	ipcMain.handle(
		"update-link",
		async (_event: Electron.IpcMainInvokeEvent, args: Link) => {
			const { id, name, uri, description } = args;

			const link = await Entities.links.update({
				db: db.database,
				id,
				input: { name, uri, description },
			});

			_event.returnValue = link;
			return link;
		}
	);

	ipcMain.handle(
		"delete-link",
		async (_event: Electron.IpcMainInvokeEvent, args: { id: number }) => {
			const { id } = args;

			const result = await Entities.links.delete({
				db: db.database,
				id,
			});

			_event.returnValue = result;
			return result;
		}
	);

	ipcMain.handle(
		"get-links",
		async (_event: Electron.IpcMainInvokeEvent, args: Partial<Link>) => {
			const links = await Entities.links.findAll({
				db: db.database,
				where: { ...args },
			});

			_event.returnValue = links;
			return links;
		}
	);
};
