import * as React from "react";

import { Link, WriteLink } from "../../main/db/entities/links";

export type TabView = "link" | "link-create";

export type Tab = {
	key: string;
	view: TabView;
	data?: Link;
};

export type UseTabsArgs = {
	links: Array<Link>;
};

export const useTabs = ({ links }: UseTabsArgs) => {
	const [active, setActive] = React.useState<number>(-1);
	const [data, setData] = React.useState<Array<Tab>>(new Array<Tab>());

	React.useEffect(() => {
		data.forEach((t: Tab, i: number) => {
			const link = links.find((l: Link) => l.id === t.data?.id);
			t.data = link;
			update(i, t);
		});
	}, [links]);

	const add = (tab: Tab, index?: number) => {
		const tabIndex = data.findIndex((t: Tab) => t.key === tab.key);
		if (tabIndex !== -1) {
			setActive(tabIndex);
			return;
		}

		const updatedData = [...data];
		updatedData.splice(index ?? data.length, 0, tab);

		setData(updatedData);
		setActive(index ?? data.length);
	};

	const remove = (index: number) => {
		const updatedData = [...data];
		updatedData.splice(index, 1);

		if (active > index) {
			setActive(active - 1);
		} else if (index === active) {
			if (index > 0 && active + 1 > updatedData.length) {
				setActive(active - 1);
			} else if (index < 0) {
				setActive(active + 1);
			}
		}

		setData(updatedData);
	};

	const update = (index: number, tab: Tab) => {
		const updatedData = [...data];
		updatedData[index] = {
			...updatedData[index],
			...tab,
		};

		setData(updatedData);
	};

	const removeByKey = (key: string) => {
		const tabIndex = data.findIndex((t: Tab) => t.key === key);
		if (tabIndex === -1) {
			return;
		}

		remove(tabIndex);
	};

	return {
		active,
		data,
		setActive,
		setData,
		add,
		remove,
		removeByKey,
		update,
	};
};