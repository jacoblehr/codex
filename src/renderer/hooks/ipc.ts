const { ipcRenderer } = window.require("electron");

import {
	useMutation,
	useQuery,
	QueryKey,
	MutationOptions,
	QueryOptions,
} from "react-query";
import { IDSchema } from "../../main/db/entities/entity";
import { WriteLink, Link, ReadLink } from "../../main/db/entities/links";

export const LINKS_KEY = `links`;

/**
 * Links
 */
export const useCreateLink = (
	options?: MutationOptions<ReadLink, unknown, WriteLink, unknown>
) => {
	const createLink = async (input: WriteLink) => {
		const link = await ipcRenderer.invoke("create-link", {
			...input,
		});

		console.warn("LINKY POO: ", link);

		return link as Link;
	};

	return useMutation<Link, unknown, WriteLink, unknown>(createLink, {
		...options,
	});
};

export const useGetLink = (
	id: number,
	options?: QueryOptions<Link, unknown, ReadLink, QueryKey>
) => {
	const getLink = () => {
		return ipcRenderer.invoke("get-link", {
			id,
		}) as Promise<Link>;
	};

	return useQuery<Link, unknown, unknown, QueryKey>(
		[LINKS_KEY, id.toString()],
		getLink,
		{
			...options,
		}
	);
};

export const useUpdateLink = (
	options?: MutationOptions<unknown, unknown, WriteLink, unknown>
) => {
	const updateLink = (input: IDSchema & WriteLink) => {
		return ipcRenderer.invoke("update-link", {
			...input,
		}) as Promise<Link>;
	};

	return useMutation<Link, unknown, IDSchema & WriteLink, unknown>(
		updateLink,
		{ ...options }
	);
};

export const useDeleteLink = (options?: any) => {
	const deleteLink = (input: IDSchema) => {
		return ipcRenderer.invoke("delete-link", {
			...input,
		});
	};

	return useMutation<Link, unknown, IDSchema, unknown>(deleteLink, {
		...options,
	});
};

export const useGetLinks = (
	options?: QueryOptions<any, {}, Array<Link>, QueryKey>
) => {
	const getLinks = () => {
		return ipcRenderer.invoke("get-links");
	};

	return useQuery<any, unknown, Array<Link>, QueryKey>(
		[LINKS_KEY],
		getLinks,
		{ ...options }
	);
};
