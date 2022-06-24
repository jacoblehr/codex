const { ipcRenderer } = window.require("electron");

import { useMutation, useQuery, QueryKey, MutationOptions, QueryOptions } from "react-query";
import { IDSchema } from "../../main/db/entities/entity";
import { WriteBookmark, Bookmark, ReadBookmark } from "../../main/db/entities/bookmarks";
import { TagGrouped } from "../../main/db/entities/tags";

export const bookmarkS_KEY = `bookmarks`;
export const TAGS_KEY = `tags`;

/**
 * bookmarks
 */
export const useCreateBookmark = (options?: MutationOptions<ReadBookmark, unknown, WriteBookmark, unknown>) => {
    const createbookmark = async (input: WriteBookmark) => {
        const bookmark = await ipcRenderer.invoke("create-bookmark", {
            ...input,
        });

        return bookmark as Bookmark;
    };

    return useMutation<Bookmark, unknown, WriteBookmark, unknown>(createbookmark, {
        ...options,
    });
};

export const useGetbookmark = (id: number, options?: QueryOptions<Bookmark, unknown, ReadBookmark, QueryKey>) => {
    const getbookmark = () => {
        return ipcRenderer.invoke("get-bookmark", {
            id,
        }) as Promise<Bookmark>;
    };

    return useQuery<Bookmark, unknown, unknown, QueryKey>([bookmarkS_KEY, id.toString()], getbookmark, {
        ...options,
    });
};

export const useUpdateBookmark = (options?: MutationOptions<unknown, unknown, WriteBookmark, unknown>) => {
    const updatebookmark = (input: IDSchema & WriteBookmark) => {
        return ipcRenderer.invoke("update-bookmark", {
            ...input,
        }) as Promise<Bookmark>;
    };

    return useMutation<Bookmark, unknown, IDSchema & WriteBookmark, unknown>(updatebookmark, { ...options });
};

export const useDeleteBookmark = (options?: any) => {
    const deletebookmark = (input: IDSchema) => {
        return ipcRenderer.invoke("delete-bookmark", {
            ...input,
        });
    };

    return useMutation<Bookmark, unknown, IDSchema, unknown>(deletebookmark, {
        ...options,
    });
};

export const useGetBookmarks = (options?: QueryOptions<any, {}, Array<Bookmark>, QueryKey>) => {
    const getbookmarks = () => {
        return ipcRenderer.invoke("get-bookmarks");
    };

    return useQuery<any, unknown, Array<Bookmark>, QueryKey>([bookmarkS_KEY], getbookmarks, { ...options });
};

export const useGetTags = (options?: QueryOptions<any, {}, Array<TagGrouped>, QueryKey>) => {
    const getTags = () => {
        return ipcRenderer.invoke("get-tags");
    };

    return useQuery<any, unknown, Array<TagGrouped>, QueryKey>([TAGS_KEY], getTags, { ...options });
};
