import * as React from "react";
import { Flex, Heading, Text } from "@chakra-ui/react";

import { CloseIcon } from "@chakra-ui/icons";
import { useAppContext } from "../context/AppContextProvider";
import { Link } from "../../main/db/entities/links";
import { Tab } from "../hooks/tabs";

type SideBarProps = {};

export const Sidebar = ({}: SideBarProps) => {
	const { links, tabs } = useAppContext();

	const handleRemoveClick = (id: number) => {
		const index = tabs.data.findIndex((t: Tab) => t.data.id === id);
		tabs.remove(index);
		links._delete(id);
	};

	return (
		<Flex
			direction="column"
			height="100%"
			width="auto"
			minWidth="300px"
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
				<Flex
					flex="1"
					alignItems="center"
					justifyContent="space-between"
					borderBottom="1px solid"
					borderBottomColor="gray.200"
					p={2}
				>
					<Heading size="sm" fontWeight="normal">
						Links
					</Heading>
				</Flex>
				<Flex direction="column">
					{links?.data?.map((link: Link, index: number) => {
						return (
							<LinkItem
								key={`link-${link.id}-${index}`}
								link={link}
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

const LinkItem = ({
	link,
	onClick,
	onRemove,
}: {
	index: number;
	link?: Link;
	onClick: (tab: Tab) => void;
	onRemove: (id: number) => void;
}) => {
	return (
		<Flex
			onClick={() =>
				onClick({
					key: `link-${link.id}`,
					view: "link",
					data: link,
				})
			}
			cursor="pointer"
			_hover={{ backgroundColor: "gray.50" }}
			p={2}
			justifyContent="space-between"
			alignItems="center"
		>
			<Text>
				{link?.name || "Untitled"} - {link?.uri}
			</Text>
			<CloseIcon
				onClick={(e) => {
					e.stopPropagation();
					onRemove(link.id);
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
