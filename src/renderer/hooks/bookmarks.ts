import * as React from "react";
import { useQueryClient } from "react-query";

import { Bookmark, Bookmark as BookmarkEntity, WriteBookmark } from "../../main/db/entities/bookmarks";

import { TAGS_KEY, useCreateBookmark, useDeleteBookmark, useGetBookmarks, useUpdateBookmark } from "./ipc";

export type BookmarkView = {
    key: string;
    title: string;
    Bookmark: BookmarkEntity;
};

export const BOOKMARKS_KEY = "bookmarks";

export const useBookmarks = () => {
    const { data } = useGetBookmarks();

    const { mutate: createBookmark } = useCreateBookmark();
    const { mutate: updateBookmark } = useUpdateBookmark();
    const { mutate: deleteBookmark } = useDeleteBookmark();

    const [bookmarks, setBookmarks] = React.useState([]);

    const queryClient = useQueryClient();

    const add = (Bookmark: Bookmark) => {
        const updatedData = [...bookmarks, Bookmark];
        setBookmarks(updatedData);
    };

    const create = async (bookmark: WriteBookmark, onSuccess?: (data: Bookmark) => void) => {
        return createBookmark(
            { ...bookmark },
            {
                onSuccess: (_data: Bookmark) => {
                    onSuccess && onSuccess(_data);
                    queryClient.invalidateQueries([BOOKMARKS_KEY]);
                    queryClient.invalidateQueries([TAGS_KEY]);
                },
                onError: (e: Error) => {
                    console.warn(`An error has occurred: ${e.message}`);
                },
            }
        );
    };

    const _delete = (id: number) => {
        deleteBookmark(
            { id },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries([BOOKMARKS_KEY]);
                    queryClient.invalidateQueries([TAGS_KEY]);
                },
                onError: (e: Error) => {
                    console.warn(`An error has occurred: ${e.message}`);
                },
            }
        );
    };

    const remove = (id: number) => {
        const updatedData = [...bookmarks];
        setBookmarks(updatedData.filter((l: Bookmark) => l.id === id));
    };

    const update = (id: number, input: WriteBookmark) => {
        const updatedData = [...bookmarks];
        const targetIndex = updatedData.findIndex((l: Bookmark) => l.id === id);

        updatedData[targetIndex] = {
            ...updatedData[targetIndex],
            ...input,
            view: "bookmark",
        };

        setBookmarks(updatedData);
    };

    const save = (id: number, input: WriteBookmark, onSuccess?: (data: Bookmark) => void) => {
        return updateBookmark(
            { id, ...input },
            {
                onSuccess: (_data: Bookmark) => {
                    queryClient.invalidateQueries([BOOKMARKS_KEY]);
                    queryClient.invalidateQueries([TAGS_KEY]);
                    onSuccess && onSuccess(_data);
                },
                onError: (e: Error) => {
                    console.warn(`An error has occurred: ${e.message}`);
                },
            }
        );
    };

    return {
        data: data,
        add,
        create,
        remove,
        _delete,
        update,
        save,
    };
};
