import * as React from "react";
import { useQueryClient } from "react-query";

import { Tag, Tag as TagEntity, WriteTag } from "../../main/db/entities/tags";

import { useCreateTag, useGetTags } from "./ipc";

export type TagView = {
    key: string;
    title: string;
    tag: TagEntity;
};

export const TAGS_KEY = "tags";

export const useTags = () => {
    const { data } = useGetTags();
    const [tags, setTags] = React.useState([]);

    const { mutate: createTag } = useCreateTag();

    const queryClient = useQueryClient();

    const create = async (tag: WriteTag, onSuccess?: (data: Tag) => void) => {
        return await createTag(
            { ...tag },
            {
                onSuccess: (_data: Tag) => {
                    onSuccess && onSuccess(_data);
                    queryClient.invalidateQueries([TAGS_KEY]);
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
    };
};
