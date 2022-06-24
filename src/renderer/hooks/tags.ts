import * as React from "react";
import { useQueryClient } from "react-query";

import { Tag, Tag as TagEntity, WriteTag } from "../../main/db/entities/tags";

import { useGetTags } from "./ipc";

export type TagView = {
    key: string;
    title: string;
    tag: TagEntity;
};

export const TAGS_KEY = "tags";

export const useTags = () => {
    const { data } = useGetTags();
    const [tags, setTags] = React.useState([]);

    const queryClient = useQueryClient();

    return {
        data: data,
    };
};
