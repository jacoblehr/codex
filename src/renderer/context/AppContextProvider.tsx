import * as React from "react";
import { useBookmarks } from "../hooks/bookmarks";
import { useTabs } from "../hooks/tabs";
import { useTags } from "../hooks/tags";

type TabController = ReturnType<typeof useTabs>;
type BookmarksController = ReturnType<typeof useBookmarks>;

export interface AppContext {
    tabs?: TabController;
    bookmarks?: BookmarksController;
}

const AppContext = React.createContext<AppContext>({
    bookmarks: undefined,
    tabs: undefined,
});

export const useAppContext = () => React.useContext<AppContext>(AppContext);

export const AppContextProvider: React.FC = ({ children }) => {
    const bookmarksController = useBookmarks();
    const tabsController = useTabs({
        bookmarks: bookmarksController.data ?? [],
    });
    // const tagsController = useTags();

    const context = {
        tabs: {
            ...tabsController,
            data: [...tabsController.data],
        },
        // bookmarks: {
        //     ...bookmarksController,
        //     data: bookmarksController.data ? [...bookmarksController.data] : [],
        // },
        // tags: {
        //     ...tagsController,
        //     data: tagsController.data ? [...tagsController.data] : [],
        // },
    };

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
