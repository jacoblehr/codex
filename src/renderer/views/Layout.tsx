import * as React from "react";
import { Flex } from "@chakra-ui/react";

import { Main } from "./Main";
import { Sidebar } from "../components/Sidebar";

export const Layout = () => {
	return (
		<Flex height="100vh">
			<Sidebar />
			<Main />
		</Flex>
	);
};
