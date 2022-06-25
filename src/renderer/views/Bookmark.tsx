import * as React from "react";
import { VStack, Textarea, FormHelperText } from "@chakra-ui/react";
import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";

import { Bookmark as TBookmark } from "../../main/db/entities/bookmarks";
import { Form, Formik } from "formik";
import { validateRequired } from "../../utils";
import { useAppContext } from "../context/AppContextProvider";
import { TabView } from "../hooks/tabs";
import { CreatableSelect } from "chakra-react-select";

export type bookmarkProps = {
    bookmark?: TBookmark;
    view: TabView;
};

export type FormInput = HTMLInputElement | HTMLTextAreaElement;

export const Bookmark = ({ bookmark, view }: bookmarkProps) => {
    const { bookmarks, tabs, tags } = useAppContext();

    const onSubmit = async (values: any) => {
        console.warn(values);
        if (!bookmark || view === "bookmark-create") {
            await bookmarks.create({ ...values }, (response: TBookmark) => {
                tabs.update(tabs.active, {
                    ...tabs.data[tabs.active],
                    key: `bookmark-${response.id}`,
                    data: response,
                    view: "bookmark",
                });
            });
        } else {
            await bookmarks.save(bookmark.id, { ...values });
        }
    };

    return (
        <Flex direction="column" style={{ width: "100%" }}>
            <Formik<TBookmark>
                enableReinitialize={true}
                initialValues={{ ...bookmark }}
                onSubmit={onSubmit}
                validate={(values: TBookmark) => {
                    return validateRequired(values, ["uri"]);
                }}
            >
                {({ dirty, values, setFieldValue, errors, submitForm }) => {
                    const handleChange = (key: string) => (e: React.ChangeEvent<FormInput>) => {
                        setFieldValue(key, e.currentTarget.value);
                    };

                    React.useEffect(() => {
                        if (dirty && !Object.keys(errors).length) {
                            submitForm();
                        }
                    }, [dirty, errors]);

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
                                    <FormHelperText color="red">{errors.uri}</FormHelperText>
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
                                    <FormHelperText color="red">{errors.name}</FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor="description">Description</FormLabel>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        variant="filled"
                                        placeholder="Enter description"
                                        value={values?.description ?? ""}
                                        onChange={handleChange("description")}
                                    />
                                    <FormHelperText color="red">{errors.description}</FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor="tags">Tags</FormLabel>
                                    <CreatableSelect isMulti={true} options={[]} />
                                </FormControl>
                            </VStack>
                        </Form>
                    );
                }}
            </Formik>
        </Flex>
    );
};
