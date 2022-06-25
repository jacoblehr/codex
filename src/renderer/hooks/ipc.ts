const { ipcRenderer } = window.require("electron");

import { useMutation, useQuery, QueryKey, MutationOptions, QueryOptions } from "react-query";
import { IDSchema } from "../../main/db/entities/entity";
import { WriteBookmark, Bookmark, ReadBookmark } from "../../main/db/entities/bookmarks";
import { Tag } from "../..//main/db/entities/tags";

export const BOOKMARKS_KEY = `bookmarks`;
export const TAGS_KEY = `tags`;

/**
 * Bookmarks
 */
export const useCreateBookmark = (options?: MutationOptions<ReadBookmark, unknown, WriteBookmark, unknown>) => {
    const createBookmark = async (input: WriteBookmark) => {
        const bookmark = await ipcRenderer.invoke("create-bookmark", {
            ...input,
        });

        return bookmark as Bookmark;
    };

    return useMutation<Bookmark, unknown, WriteBookmark, unknown>(createBookmark, {
        ...options,
    });
};

export const useGetBookmark = (id: number, options?: QueryOptions<Bookmark, unknown, ReadBookmark, QueryKey>) => {
    const getBookmark = () => {
        return ipcRenderer.invoke("get-bookmark", {
            id,
        }) as Promise<Bookmark>;
    };

    return useQuery<Bookmark, unknown, unknown, QueryKey>([BOOKMARKS_KEY, id.toString()], getBookmark, {
        ...options,
    });
};

export const useUpdateBookmark = (options?: MutationOptions<unknown, unknown, WriteBookmark, unknown>) => {
    const updateBookmark = (input: IDSchema & WriteBookmark) => {
        return ipcRenderer.invoke("update-bookmark", {
            ...input,
        }) as Promise<Bookmark>;
    };

    return useMutation<Bookmark, unknown, IDSchema & WriteBookmark, unknown>(updateBookmark, { ...options });
};

export const useDeleteBookmark = (options?: any) => {
    const deleteBookmark = (input: IDSchema) => {
        return ipcRenderer.invoke("delete-bookmark", {
            ...input,
        });
    };

    return useMutation<Bookmark, unknown, IDSchema, unknown>(deleteBookmark, {
        ...options,
    });
};

export const useGetBookmarks = (options?: QueryOptions<any, {}, Array<Bookmark>, QueryKey>) => {
    const getBookmarks = async () => {
        const bookmarks = await ipcRenderer.invoke("get-bookmarks");
        console.warn(bookmarks);
        return bookmarks;
    };

    return useQuery<any, unknown, Array<Bookmark>, QueryKey>([BOOKMARKS_KEY], getBookmarks, { ...options });
};

/**
 * Tags
 */
export const useGetTags = (options?: QueryOptions<any, {}, Array<Tag>, QueryKey>) => {
    const getTags = () => {
        return ipcRenderer.invoke("get-tags");
    };

    return useQuery<any, unknown, Array<Tag>, QueryKey>([TAGS_KEY], getTags, { ...options });
};
