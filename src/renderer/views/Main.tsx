import * as React from "react";
import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { useAppContext } from "../context/AppContextProvider";
import { Tab as AppTab } from "../hooks/tabs";
import { Bookmark } from "./Bookmark";
import { getRandomID } from "../../utils";
import { ReadBookmark } from "../../main/db/entities/bookmarks";
import { ReadTag } from "../../main/db/entities/tags";

type MainProps = {};

export const Main = ({}: MainProps) => {
    const { tabs } = useAppContext();

    const handleTabChange = (index: number) => {
        tabs.setActive(index);
    };

    const addTab = () => {
        tabs.add(
            {
                key: getRandomID(),
                view: "bookmark-create",
            },
            tabs.data.length
        );
    };

    return (
        <Flex flex="1" flexDirection="row" width="100%" height="100%" justifyContent="space-between">
            <Tabs
                borderBottom="1px solid"
                borderColor="gray.300"
                display="flex"
                flex="1"
                flexDirection="column"
                isManual
                index={tabs.active}
                width="100%"
                variant="enclosed-colored"
                maxHeight="100vh"
            >
                <TabList mb="1em">
                    {tabs?.data.map((t: AppTab, index: number) => {
                        return (
                            <Tab
                                _focus={{ outline: "none" }}
                                alignItems="center"
                                display="flex"
                                justifyContent="space-between"
                                minWidth="160px"
                                flexWrap="nowrap"
                                isTruncated={true}
                                key={`tab-${t.key}`}
                                overflow="auto"
                                onClick={() => handleTabChange(index)}
                            >
                                {(t.data as any)?.name ?? (t.data as any)?.tag}
                                <CloseIcon
                                    marginLeft="0.5rem"
                                    fontSize="0.6rem"
                                    color="gray.300"
                                    cursor="pointer"
                                    _hover={{
                                        color: "blue.500",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        tabs.remove(index);
                                    }}
                                />
                            </Tab>
                        );
                    })}
                    <Tab
                        _focus={{ outline: "none" }}
                        alignItems="center"
                        display="flex"
                        flexWrap="nowrap"
                        isTruncated={true}
                        key={`tab-new}`}
                        overflow="auto"
                        onClick={addTab}
                    >
                        <AddIcon
                            color="gray.300"
                            cursor="pointer"
                            _hover={{
                                color: "blue.500",
                            }}
                        />
                    </Tab>
                </TabList>
                <TabPanels display="flex" flex="1" flexDirection="column" justifyContent="center" position="relative" width="100%">
                    {tabs?.data.map((t: AppTab, index: number) => {
                        return (
                            <TabPanel key={`tab-panel-${index}-${t.data.id}`} display="flex" flex="1" justifyContent="center">
                                {(t.view === "bookmark" || t.view === "bookmark-create") && <Bookmark bookmark={t.data as ReadBookmark} view={t.view} />}
                                {t.view === "tag" && <Tag tag={t.data as ReadTag} />}
                            </TabPanel>
                        );
                    })}
                </TabPanels>
            </Tabs>
        </Flex>
    );
};

export const Tag = ({ tag }: { tag: ReadTag }) => {
    return <div />;
};
