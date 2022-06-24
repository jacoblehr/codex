import { dialog, ipcMain } from "electron";

import db from "../db";
import Entities from "../db/entities";
import { ReadLink, WriteLink } from "../db/entities/links";
import { ReadTag, WriteTag } from "../db/entities/tags";

export const registerHandlers = () => {
    /**
     * Workspace Operations
     */
    ipcMain.handle("open-workspace", async (_event: Electron.IpcMainInvokeEvent) => {
        const openResult: Electron.OpenDialogReturnValue = await dialog.showOpenDialog({
            filters: [{ name: "Codex Workspace", extensions: [".cdx"] }],
        });

        const { canceled, filePaths } = openResult;
        if (canceled) {
            return;
        }

        const workspace = await db.load(filePaths[0]);
        _event.returnValue = workspace;
    });

    ipcMain.handle("save-workspace", async (_event: Electron.IpcMainInvokeEvent) => {
        const saveResult: Electron.SaveDialogReturnValue = await dialog.showSaveDialog({
            filters: [{ name: "Codex Workspace", extensions: [".cdx"] }],
        });

        const { canceled, filePath } = saveResult;
        if (canceled) {
            return;
        }

        const workspace = await db.save(filePath);
        _event.returnValue = workspace;
    });

    /**
     * Database Operations
     */

    /* Links */

    ipcMain.handle("create-link", async (_event: Electron.IpcMainInvokeEvent, args: WriteLink) => {
        const { name, uri, description } = args;

        const link = await Entities.links.create({
            db: db.database,
            input: { name, uri, description, tags: [] },
        });

        const tags = await Promise.all(
            args.tags.map(async (t: WriteTag) => {
                return await Entities.tags.create({
                    db: db.database,
                    input: {
                        link_id: link.id,
                        tag: t.tag,
                    },
                });
            })
        );

        link.tags = tags;

        _event.returnValue = link;
        return link;
    });

    ipcMain.handle("get-link", async (_event: Electron.IpcMainInvokeEvent, args: { id: number }) => {
        const { id } = args;

        const link = await Entities.links.find({
            db: db.database,
            id,
        });

        _event.returnValue = link;
        return link;
    });

    ipcMain.handle("update-link", async (_event: Electron.IpcMainInvokeEvent, args: WriteLink & { id: number }) => {
        const { id, name, uri, description } = args;

        const link = await Entities.links.update({
            db: db.database,
            id,
            input: { name, uri, description },
        });

        const existingTags = await Entities.tags.findAll({
            db: db.database,
            where: {
                link_id: link.id,
            },
        });

        const addTags = args.tags.filter((wt: WriteTag) => !tags.find((rt: ReadTag) => rt.tag === wt.tag));
        const removeTags = existingTags.filter((rt: ReadTag) => !args.tags.find((wt: WriteTag) => rt.tag === wt.tag));

        await Promise.all(
            addTags.map(async (tag: WriteTag) => {
                await Entities.tags.create({
                    db: db.database,
                    input: {
                        link_id: link.id,
                        tag: tag.tag,
                    },
                });
            })
        );

        await Promise.all(
            removeTags.map(async (tag: ReadTag) => {
                await Entities.tags.delete({
                    db: db.database,
                    id: tag.id,
                });
            })
        );

        const tags = await Entities.tags.findAll({
            db: db.database,
            where: {
                link_id: link.id,
            },
        });

        link.tags = tags;

        _event.returnValue = link;
        return link;
    });

    ipcMain.handle("delete-link", async (_event: Electron.IpcMainInvokeEvent, args: { id: number }) => {
        const { id } = args;

        const result = await Entities.links.delete({
            db: db.database,
            id,
        });

        _event.returnValue = result;
        return result;
    });

    ipcMain.handle("get-links", async (_event: Electron.IpcMainInvokeEvent, args: Partial<ReadLink>) => {
        const links = await Entities.links.findAll({
            db: db.database,
            where: { ...args },
        });

        _event.returnValue = links;
        return links;
    });

    /* Tags */
    ipcMain.handle("get-tags", async (_event: Electron.IpcMainInvokeEvent) => {
        const tags = await Entities.tags.findAllGrouped({
            db: db.database,
        });

        _event.returnValue = tags;
        return tags;
    });
};
