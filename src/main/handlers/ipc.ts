import { dialog, ipcMain } from "electron";
import { Bookmark } from "../../renderer/views/Bookmark";

import db from "../db";
import Entities from "../db/entities";
import { ReadBookmark, WriteBookmark } from "../db/entities/bookmarks";
import { ReadTag, WriteTag } from "../db/entities/tags";
import openGraph from "open-graph-scraper";

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
        const { name, uri, description, image_uri } = args;

        const bookmark = await Entities.bookmarks.create({
            db: db.database,
            input: { name, uri, description, image_uri },
        });

        const addTags = args.tags;
        await Promise.all(
            addTags.map(async (tag: ReadTag) => {
                return await Entities.bookmarkTags.create({
                    db: db.database,
                    input: {
                        tag_id: tag.id,
                        bookmark_id: bookmark.id,
                    },
                });
            })
        );

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
        const { id, name, uri, description, image_uri } = args;

        const bookmark = await Entities.bookmarks.update({
            db: db.database,
            id,
            input: { name, uri, description, image_uri },
        });

        const addTags = args.tags.filter((tag: ReadTag) => !bookmark.tags.find((bookmarkTag: ReadTag) => bookmarkTag.id == tag.id));
        const removeTags = bookmark.tags.filter((bookmarkTag: ReadTag) => !args.tags.find((tag: ReadTag) => tag.id == bookmarkTag.id));

        await Promise.all(
            addTags.map(async (tag: ReadTag) => {
                return await Entities.bookmarkTags.create({
                    db: db.database,
                    input: {
                        tag_id: tag.id,
                        bookmark_id: id,
                    },
                });
            })
        );

        await Entities.bookmarkTags.deleteAll({
            db: db.database,
            where: {
                tag_id: {
                    key: "tag_id",
                    value: removeTags.map((t: ReadTag) => t.id),
                    operation: "in",
                },
            },
        });

        _event.returnValue = bookmark;
        return bookmark;
    });

    ipcMain.handle("delete-bookmark", async (_event: Electron.IpcMainInvokeEvent, args: { id: number }) => {
        const { id } = args;

        await Entities.bookmarkTags.deleteAll({
            db: db.database,
            where: {
                bookmark_id: {
                    key: "bookmark_id",
                    value: id,
                    operation: "=",
                },
            },
        });

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
            where: {},
        });

        _event.returnValue = bookmarks;
        return bookmarks;
    });

    ipcMain.handle("get-tags", async (_event: Electron.IpcMainInvokeEvent, args: Partial<ReadTag>) => {
        const tags = await Entities.tags.findAll({
            db: db.database,
            where: { ...getWhereClause(args) },
        });

        _event.returnValue = tags;
        return tags;
    });

    ipcMain.handle("create-tag", async (_event: Electron.IpcMainInvokeEvent, args: WriteTag) => {
        const tag = await Entities.tags.create({
            db: db.database,
            input: { ...args },
        });

        _event.returnValue = tag;
        return tag;
    });

    ipcMain.handle("update-tag", async (_event: Electron.IpcMainInvokeEvent, args: WriteTag & { id: number }) => {
        const { id, color, tag } = args;

        const bookmark = await Entities.tags.update({
            db: db.database,
            id,
            input: { tag, color },
        });

        _event.returnValue = bookmark;
        return bookmark;
    });
};

const getWhereClause = <T>(args: Partial<T>) => {
    const result: any = {};

    if (!args) {
        return result;
    }

    Object.keys(args).forEach((key: string) => {
        result[key] = {
            key: key,
            value: (args as any)[key],
            operation: "=",
        };
    });

    return result;
};
