import * as React from "react";
import { Flex } from "@chakra-ui/react";

import { Main } from "./Main";
import { Sidebar } from "../components/Sidebar";

import SplitPane, { Pane } from "react-split-pane";

export const Layout = () => {
	const [width, setWidth] = React.useState(200);

	return (
        <Flex height="100vh">
            <SplitPane split="vertical" defaultSize={300} minSize={300} maxSize={600}>
				<Sidebar />
				<Main />
            </SplitPane>
        </Flex>
    );
};
