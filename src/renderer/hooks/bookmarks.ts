import * as React from "react";
import { useQueryClient } from "react-query";

import { Bookmark, Bookmark as BookmarkEntity, WriteBookmark } from "../../main/db/entities/bookmarks";

import { useCreateBookmark, useDeleteBookmark, useGetBookmarks, useUpdateBookmark } from "./ipc";

export type BookmarkView = {
    key: string;
    title: string;
    Bookmark: BookmarkEntity;
};

export const BookmarkS_KEY = "Bookmarks";

export const useBookmarks = () => {
    const { data } = useGetBookmarks();

    const { mutate: createBookmark } = useCreateBookmark();
    const { mutate: updateBookmark } = useUpdateBookmark();
    const { mutate: deleteBookmark } = useDeleteBookmark();

    const [Bookmarks, setBookmarks] = React.useState([]);

    const queryClient = useQueryClient();

    const add = (Bookmark: Bookmark) => {
        const updatedData = [...Bookmarks, Bookmark];
        setBookmarks(updatedData);
    };

    const create = async (Bookmark: Bookmark, onSuccess?: (data: Bookmark) => void) => {
        return createBookmark(
            { ...Bookmark },
            {
                onSuccess: (_data: Bookmark) => {
                    onSuccess && onSuccess(_data);
                    queryClient.invalidateQueries([BookmarkS_KEY]);
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
                    queryClient.invalidateQueries([BookmarkS_KEY]);
                },
                onError: (e: Error) => {
                    console.warn(`An error has occurred: ${e.message}`);
                },
            }
        );
    };

    const remove = (id: number) => {
        const updatedData = [...Bookmarks];
        setBookmarks(updatedData.filter((l: Bookmark) => l.id === id));
    };

    const update = (id: number, input: WriteBookmark) => {
        const updatedData = [...Bookmarks];
        const targetIndex = updatedData.findIndex((l: Bookmark) => l.id === id);

        updatedData[targetIndex] = {
            ...updatedData[targetIndex],
            ...input,
            view: "Bookmark",
        };

        setBookmarks(updatedData);
    };

    const save = (id: number, input: WriteBookmark) => {
        updateBookmark(
            { id, ...input },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries([BookmarkS_KEY]);
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
