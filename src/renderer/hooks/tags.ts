import * as React from "react";
import { useQueryClient } from "react-query";

import { Tag, WriteTag } from "../../main/db/entities/tags";
import { BOOKMARKS_KEY } from "./bookmarks";

import { useCreateTag, useGetTags, useUpdateTag } from "./ipc";

export type TagView = {
    key: string;
    title: string;
    tag: Tag;
};

export const TAGS_KEY = "tags";

export const useTags = () => {
    const { data } = useGetTags();
    const [tags, setTags] = React.useState([]);

    const { mutate: createTag } = useCreateTag();
    const { mutate: updateTag } = useUpdateTag();

    const queryClient = useQueryClient();

    const create = async (tag: WriteTag, onSuccess?: (data: Tag) => void) => {
        return await createTag(
            { ...tag },
            {
                onSuccess: (_data: Tag) => {
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

    const update = (id: number, input: WriteTag) => {
        const updatedData = [...tags];
        const targetIndex = updatedData.findIndex((t: Tag) => t.id === id);

        updatedData[targetIndex] = {
            ...updatedData[targetIndex],
            ...input,
            view: "tag",
        };

        setTags(updatedData);
    };

    const save = (id: number, input: WriteTag, onSuccess?: (data: Tag) => void) => {
        return updateTag(
            { id, ...input },
            {
                onSuccess: (_data: Tag) => {
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
        create: create,
        update,
        save,
    };
};
