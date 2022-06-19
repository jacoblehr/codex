import * as React from "react";
import {
	QueryClient,
	QueryClientProvider as ReactQueryClientProvider,
} from "react-query";

const queryClient = new QueryClient();

export const QueryClientProvider: React.FC = ({ children }) => {
	return (
		<ReactQueryClientProvider client={queryClient}>
			{children}
		</ReactQueryClientProvider>
	);
};
