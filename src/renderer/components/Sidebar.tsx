import * as React from "react";
import { Flex, Heading, Text } from "@chakra-ui/react";

import { CloseIcon } from "@chakra-ui/icons";
import { useAppContext } from "../context/AppContextProvider";
import { Bookmark } from "../../main/db/entities/bookmarks";
import { Tab } from "../hooks/tabs";

type SideBarProps = {};

export const Sidebar = ({}: SideBarProps) => {
    const { bookmarks, tabs } = useAppContext();

    const handleRemoveClick = (id: number) => {
        const index = tabs.data.findIndex((t: Tab) => t.data.id === id);
        tabs.remove(index);
        bookmarks._delete(id);
    };

    return (
        <Flex
            direction="column"
            height="100%"
            width="auto"
            borderRight="1px solid"
            borderColor="gray.300"
            overflow="auto"
            justifyContent="space-between"
            py="1rem"
        >
            <Flex direction="column">
                <Flex alignItems="center" justifyContent="center" mb="1rem">
                    <Heading size="md" px={4} py={2} fontWeight="normal">
                        Codex
                    </Heading>
                </Flex>
                <Flex flex="1" alignItems="center" justifyContent="space-between" borderBottom="1px solid" borderBottomColor="gray.200" p={2}>
                    <Heading size="sm" fontWeight="normal">
                        bookmarks
                    </Heading>
                </Flex>
                <Flex direction="column">
                    {bookmarks?.data?.map((bookmark: Bookmark, index: number) => {
                        return (
                            <BookmarkItem
                                key={`bookmark-${bookmark.id}-${index}`}
                                bookmark={bookmark}
                                onRemove={handleRemoveClick}
                                onClick={tabs.add}
                                index={index}
                            />
                        );
                    })}
                </Flex>
            </Flex>
        </Flex>
    );
};

const BookmarkItem = ({ bookmark, onClick, onRemove }: { index: number; bookmark?: Bookmark; onClick: (tab: Tab) => void; onRemove: (id: number) => void }) => {
    return (
        <Flex
            onClick={() =>
                onClick({
                    key: `bookmark-${bookmark.id}`,
                    view: "bookmark",
                    data: bookmark,
                })
            }
            cursor="pointer"
            _hover={{ backgroundColor: "gray.50" }}
            p={2}
            justifyContent="space-between"
            alignItems="center"
        >
            <Text overflow="ellipsis">{bookmark?.name || "Untitled"}</Text>
            <CloseIcon
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(bookmark.id);
                }}
                cursor="pointer"
                fontSize="xs"
                color="gray.300"
                _hover={{
                    color: "blue.500",
                }}
            />
        </Flex>
    );
};
