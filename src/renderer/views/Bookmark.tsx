import * as React from "react";
import { VStack, Textarea, FormHelperText, Button, ButtonGroup } from "@chakra-ui/react";
import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";

import { Bookmark as TBookmark } from "../../main/db/entities/bookmarks";
import { Form, Formik } from "formik";
import { validateRequired, validateURI } from "../../utils";
import { useAppContext } from "../context/AppContextProvider";
import { TabView } from "../hooks/tabs";
import { CreatableSelect, MultiValue, OptionBase } from "chakra-react-select";
import { Tag } from "../../main/db/entities/tags";

export type bookmarkProps = {
    bookmark?: TBookmark;
    view: TabView;
};

export type FormInput = HTMLInputElement | HTMLTextAreaElement;

export const Bookmark = ({ bookmark, view }: bookmarkProps) => {
    const { bookmarks, tabs, tags } = useAppContext();

    const onSubmit = async (values: any) => {
        switch (view) {
            case "bookmark-create":
                await bookmarks.create({ ...values }, (response: TBookmark) => {
                    tabs.update(tabs.active, {
                        ...tabs.data[tabs.active],
                        key: `bookmark-${response.id}`,
                        data: response,
                        view: "bookmark",
                    });
                });
                break;
            case "bookmark":
                await bookmarks.save(bookmark.id, { ...values }, (response: TBookmark) => {
                    tabs.update(tabs.active, {
                        ...tabs.data[tabs.active],
                        key: `bookmark-${response.id}`,
                        data: response as any,
                        view: "bookmark",
                    });
                });

                break;
            default:
                break;
        }
    };

    return (
        <Flex direction="column" style={{ width: "100%" }}>
            <Formik<TBookmark>
                enableReinitialize={true}
                initialValues={{ ...bookmark }}
                onSubmit={onSubmit}
                validate={(values: TBookmark) => {
                    const requiredErrors = validateRequired(values, ["uri"]);
                    const urlErrors = validateURI(values.uri);

                    return {
                        ...requiredErrors,
                        ...urlErrors,
                    };
                }}
            >
                {({ dirty, values, setFieldValue, errors, submitForm }) => {
                    const handleChange = (key: string, value?: any) => (e: React.ChangeEvent<FormInput>) => {
                        setFieldValue(key, value ?? e.currentTarget.value);
                    };

                    const handleCreateOption = async (newValue: string) => {
                        await tags.create({ tag: newValue }, (tag: Tag) => {
                            setFieldValue("tags", [...(values.tags ?? []), tag]);
                        });
                    };

                    const handleSubmit = () => {
                        if (dirty && !Object.keys(errors).length) {
                            submitForm();
                        }
                    };

                    const handleClose = () => {
                        tabs.remove(tabs.active);
                    };

                    React.useEffect(() => {
                        tabs.setDirty(tabs.active, dirty);
                    }, [dirty]);

                    return (
                        <Form style={{ width: "100%" }} noValidate>
                            <VStack w="100%">
                                <FormControl isRequired>
                                    <FormLabel htmlFor="uri">URI</FormLabel>
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
                                    <CreatableSelect
                                        id={`tags-${tabs.data[tabs.active].data?.id ?? "new"}`}
                                        name="tags"
                                        isMulti={true}
                                        onCreateOption={handleCreateOption}
                                        options={tags.data?.map(getTagOption) ?? []}
                                        onChange={(newValue: MultiValue<TagOption>) => {
                                            setFieldValue("tags", newValue?.map(getOptionTag));
                                        }}
                                        value={values?.tags?.map(getTagOption)}
                                    />
                                </FormControl>
                                <Flex py="1rem">
                                    <ButtonGroup>
                                        <Button onClick={handleClose}>Close</Button>
                                        <Button onClick={handleSubmit}>Save</Button>
                                    </ButtonGroup>
                                </Flex>
                            </VStack>
                        </Form>
                    );
                }}
            </Formik>
        </Flex>
    );
};

const getTagOption = (tag: Tag) => {
    return {
        label: tag.tag,
        value: tag.id,
        colorScheme: tag.color || "gray",
    };
};

const getOptionTag = (option: TagOption) => {
    return {
        id: option.value,
        tag: option.label,
        color: option.colorScheme,
    };
};

interface TagOption extends OptionBase {
    label: string;
    value: number;
}
