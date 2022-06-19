import * as React from "react";
import { Button, VStack, Textarea, FormHelperText } from "@chakra-ui/react";
import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";

import { Link as TLink } from "../../main/db/entities/links";
import { Form, Formik } from "formik";
import { validateRequired } from "../../utils";
import { useAppContext } from "../context/AppContextProvider";
import { TabView } from "../hooks/tabs";

export type LinkProps = {
	link?: TLink;
	view: TabView;
};

export type FormInput = HTMLInputElement | HTMLTextAreaElement;

export const Link = ({ link, view }: LinkProps) => {
	const { links, tabs } = useAppContext();

	const onSubmit = async (values: any) => {
		if (!link || view === "link-create") {
			await links.create({ ...values }, (response: TLink) => {
				tabs.update(tabs.active, {
					...tabs.data[tabs.active],
					key: `link-${response.id}`,
					data: response,
					view: "link",
				});
			});
		} else {
			await links.save(link.id, { ...values });
		}
	};

	return (
		<Flex direction="column" style={{ width: "100%" }}>
			<Formik<TLink>
				enableReinitialize={true}
				initialValues={{ ...link }}
				onSubmit={onSubmit}
				validate={(values: TLink) => {
					return validateRequired(values, ["uri"]);
				}}
			>
				{({ dirty, values, setFieldValue, errors, submitForm }) => {
					const handleChange =
						(key: string) => (e: React.ChangeEvent<FormInput>) => {
							setFieldValue(key, e.currentTarget.value);
						};

					React.useEffect(() => {
						if (dirty) {
							submitForm();
						}
					}, [dirty]);

					return (
						<Form style={{ width: "100%" }} noValidate>
							<VStack w="100%">
								<FormControl isRequired>
									<FormLabel htmlFor="url">URI</FormLabel>
									<Input
										as={Input}
										id="uri"
										name="uri"
										type="text"
										variant="filled"
										placeholder="Enter URI"
										value={values?.uri ?? ""}
										onChange={handleChange("uri")}
									/>
									<FormHelperText color="red">
										{errors.uri}
									</FormHelperText>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor="name">Name</FormLabel>
									<Input
										as={Input}
										id="name"
										name="name"
										type="text"
										variant="filled"
										placeholder="Untitled"
										value={values?.name ?? ""}
										onChange={handleChange("name")}
									/>
									<FormHelperText color="red">
										{errors.name}
									</FormHelperText>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor="description">
										Description
									</FormLabel>
									<Textarea
										id="description"
										name="description"
										variant="filled"
										placeholder="Enter description"
										value={values?.description ?? ""}
										onChange={handleChange("description")}
									/>
									<FormHelperText color="red">
										{errors.description}
									</FormHelperText>
								</FormControl>
							</VStack>
						</Form>
					);
				}}
			</Formik>
		</Flex>
	);
};
