import * as React from "react";
import { useLinks } from "../hooks/links";
import { useTabs } from "../hooks/tabs";

type TabController = ReturnType<typeof useTabs>;
type LinkController = ReturnType<typeof useLinks>;

export interface AppContext {
	tabs?: TabController;
	links?: LinkController;
}

const AppContext = React.createContext<AppContext>({
	links: undefined,
	tabs: undefined,
});

export const useAppContext = () => React.useContext<AppContext>(AppContext);

export const AppContextProvider: React.FC = ({ children }) => {
	const linksController = useLinks();
	const tabsController = useTabs({
		links: linksController.data ?? [],
	});

	const context = {
		tabs: {
			...tabsController,
			data: [...tabsController.data],
		},
		links: {
			...linksController,
			data: linksController.data ? [...linksController.data] : [],
		},
	};

	return (
		<AppContext.Provider value={context}>{children}</AppContext.Provider>
	);
};
