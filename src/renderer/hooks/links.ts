import * as React from "react";
import { useQueryClient } from "react-query";

import {
	Link,
	Link as LinkEntity,
	WriteLink,
} from "../../main/db/entities/links";

import {
	useCreateLink,
	useDeleteLink,
	useGetLinks,
	useUpdateLink,
} from "./ipc";

export type LinkView = {
	key: string;
	title: string;
	link: LinkEntity;
};

export const LINKS_KEY = "links";

export const useLinks = () => {
	const { data } = useGetLinks();

	const { mutate: createLink } = useCreateLink();
	const { mutate: updateLink } = useUpdateLink();
	const { mutate: deleteLink } = useDeleteLink();

	const [links, setLinks] = React.useState([]);

	const queryClient = useQueryClient();

	const add = (link: Link) => {
		const updatedData = [...links, link];
		setLinks(updatedData);
	};

	const create = async (link: Link, onSuccess?: (data: Link) => void) => {
		return createLink(
			{ ...link },
			{
				onSuccess: (_data: Link) => {
					onSuccess && onSuccess(_data);
					queryClient.invalidateQueries([LINKS_KEY]);
				},
				onError: (e: Error) => {
					console.warn(`An error has occurred: ${e.message}`);
				},
			}
		);
	};

	const _delete = (id: number) => {
		deleteLink(
			{ id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries([LINKS_KEY]);
				},
				onError: (e: Error) => {
					console.warn(`An error has occurred: ${e.message}`);
				},
			}
		);
	};

	const remove = (id: number) => {
		const updatedData = [...links];
		setLinks(updatedData.filter((l: Link) => l.id === id));
	};

	const update = (id: number, input: WriteLink) => {
		const updatedData = [...links];
		const targetIndex = updatedData.findIndex((l: Link) => l.id === id);

		updatedData[targetIndex] = {
			...updatedData[targetIndex],
			...input,
			view: "link",
		};

		setLinks(updatedData);
	};

	const save = (id: number, input: WriteLink) => {
		updateLink(
			{ id, ...input },
			{
				onSuccess: () => {
					queryClient.invalidateQueries([LINKS_KEY]);
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
