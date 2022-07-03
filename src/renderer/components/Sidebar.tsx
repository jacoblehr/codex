import * as React from "react";
import { Badge, Flex, Heading, Icon, IconButton, Text, useDisclosure } from "@chakra-ui/react";

import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "@chakra-ui/icons";
import { useAppContext } from "../context/AppContextProvider";
import Bookmarks, { Bookmark } from "../../main/db/entities/bookmarks";
import { Tab } from "../hooks/tabs";
import { ReadTag, Tag } from "../../main/db/entities/tags";

type SideBarProps = {};

export const Sidebar = ({}: SideBarProps) => {
    const { bookmarks, tabs, tags } = useAppContext();

    const handleRemoveClick = (id: number) => {
        const index = tabs.data.findIndex((t: Tab) => t.data.id === id);
        tabs.remove(index);
        bookmarks._delete(id);
    };

    const [isBookmarkViewOpen, setIsBookmarkViewOpen] = React.useState(true);
    const [isTagViewOpen, setIsTagViewOpen] = React.useState(true);

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
                <Flex flex="1" direction="column" alignItems="center" justifyContent="space-between">
                    <Flex
                        cursor="pointer"
                        onClick={() => setIsBookmarkViewOpen(!isBookmarkViewOpen)}
                        width="100%"
                        flex="1"
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottom="1px solid"
                        borderBottomColor="gray.200"
                        p={2}
                    >
                        <Heading size="sm" fontWeight="normal">
                            Bookmarks
                        </Heading>
                        {isBookmarkViewOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </Flex>
                    {isBookmarkViewOpen && (
                        <Flex width="100%" direction="column">
                            {bookmarks?.data?.map((bookmark: Bookmark) => {
                                return (
                                    <BookmarkItem
                                        key={`bookmark-${bookmark.id}`}
                                        bookmark={bookmark}
                                        onClick={tabs.add}
                                        onRemove={() => handleRemoveClick(bookmark.id)}
                                    />
                                );
                            })}
                        </Flex>
                    )}
                </Flex>
                <Flex flex="1" direction="column" alignItems="center" justifyContent="space-between">
                    <Flex
                        cursor="pointer"
                        onClick={() => setIsTagViewOpen(!isTagViewOpen)}
                        width="100%"
                        flex="1"
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottom="1px solid"
                        borderBottomColor="gray.200"
                        p={2}
                        direction="row"
                    >
                        <Heading size="sm" fontWeight="normal">
                            Tags
                        </Heading>
                        {isTagViewOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </Flex>
                    {isTagViewOpen && (
                        <Flex width="100%" direction="column">
                            {tags?.data?.map((tag: Tag, index: number) => {
                                return <TagItem key={`tag-${tag.id}`} tag={tag} onClick={tabs.add} />;
                            })}
                        </Flex>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};

const BookmarkItem = ({ bookmark, onClick, onRemove }: { bookmark?: Bookmark; onClick: (tab: Tab) => void; onRemove: (id: number) => void }) => {
    return (
        <Flex
            direction="row"
            width="100%"
            flex="1"
            onClick={(e) => {
                e.stopPropagation();

                onClick({
                    key: `bookmark-${bookmark.id}`,
                    view: "bookmark",
                    data: bookmark,
                    dirty: false,
                });
            }}
            cursor="pointer"
            _hover={{ fontWeight: "bold" }}
            p={2}
            justifyContent="space-between"
            alignItems="center"
        >
            <Flex flex="1" direction="row" alignItems="center" width="100%">
                <Text fontSize="sm" flex="1" textOverflow="ellipsis">
                    {bookmark?.name || "Untitled"}
                </Text>
                <Badge mr="0.5rem">{bookmark.tags?.length ?? 0}</Badge>
            </Flex>
        </Flex>
    );
};

const TagItem = ({ tag, onClick }: { tag?: ReadTag; onClick: (tab: Tab) => void }) => {
    return (
        <Flex
            cursor="pointer"
            onClick={() =>
                onClick({
                    key: `tag-${tag.id}`,
                    view: "tag",
                    data: tag,
                    dirty: false,
                })
            }
            flex="1"
            direction="column"
            _hover={{ fontWeight: "bold" }}
            p={2}
            justifyContent="space-between"
            alignItems="center"
        >
            <Flex flex="1" direction="row" alignItems="center" width="100%">
                <Text fontSize="sm" flex="1" overflow="ellipsis">
                    {tag?.tag}
                </Text>
                <Badge colorScheme={tag.color || "gray"} mr="0.5rem">
                    {tag.bookmarks?.length ?? 0}
                </Badge>
            </Flex>
        </Flex>
    );
};
