import { dialog, ipcMain } from "electron";

import db from "../db";
import Entities from "../db/entities";
import { ReadBookmark, WriteBookmark } from "../db/entities/bookmarks";
import { ReadTag } from "../db/entities/tags";

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

    /* Bookmarks */

    ipcMain.handle("create-bookmark", async (_event: Electron.IpcMainInvokeEvent, args: WriteBookmark) => {
        const { name, uri, description } = args;

        const bookmark = await Entities.bookmarks.create({
            db: db.database,
            input: { name, uri, description },
        });

        _event.returnValue = bookmark;
        return bookmark;
    });

    ipcMain.handle("get-bookmark", async (_event: Electron.IpcMainInvokeEvent, args: { id: number }) => {
        const { id } = args;

        const bookmark = await Entities.bookmarks.find({
            db: db.database,
            id,
        });

        _event.returnValue = bookmark;
        return bookmark;
    });

    ipcMain.handle("update-bookmark", async (_event: Electron.IpcMainInvokeEvent, args: WriteBookmark & { id: number }) => {
        const { id, name, uri, description } = args;

        const bookmark = await Entities.bookmarks.update({
            db: db.database,
            id,
            input: { name, uri, description },
        });

        // const existingTags = await Entities.tags.findAll({
        //     db: db.database,
        //     where: {
        //         bookmark_id: bookmark.id,
        //     },
        // });

        // const addTags = args.tags.filter((wt: WriteTag) => !tags.find((rt: ReadTag) => rt.tag === wt.tag));
        // const removeTags = existingTags.filter((rt: ReadTag) => !args.tags.find((wt: WriteTag) => rt.tag === wt.tag));

        // await Promise.all(
        //     addTags.map(async (tag: WriteTag) => {
        //         await Entities.tags.create({
        //             db: db.database,
        //             input: {
        //                 bookmark_id: bookmark.id,
        //                 tag: tag.tag,
        //             },
        //         });
        //     })
        // );

        // await Promise.all(
        //     removeTags.map(async (tag: ReadTag) => {
        //         await Entities.tags.delete({
        //             db: db.database,
        //             id: tag.id,
        //         });
        //     })
        // );

        // const tags = await Entities.tags.findAll({
        //     db: db.database,
        //     where: {
        //         bookmark_id: bookmark.id,
        //     },
        // });

        // bookmark.tags = tags;

        _event.returnValue = bookmark;
        return bookmark;
    });

    ipcMain.handle("delete-bookmark", async (_event: Electron.IpcMainInvokeEvent, args: { id: number }) => {
        const { id } = args;

        const result = await Entities.bookmarks.delete({
            db: db.database,
            id,
        });

        _event.returnValue = result;
        return result;
    });

    ipcMain.handle("get-bookmarks", async (_event: Electron.IpcMainInvokeEvent, args: Partial<ReadBookmark>) => {
        const bookmarks = await Entities.bookmarks.findAll({
            db: db.database,
            where: { ...args },
        });

        _event.returnValue = bookmarks;
        return bookmarks;
    });

    ipcMain.handle("get-tags", async (_event: Electron.IpcMainInvokeEvent, args: Partial<ReadTag>) => {
        const tags = await Entities.tags.findAll({
            db: db.database,
            where: { ...args },
        });

        _event.returnValue = tags;
        return tags;
    });
};
