import * as React from "react";
import { VStack, FormHelperText, ButtonGroup, Button } from "@chakra-ui/react";
import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";

import { Bookmark, WriteBookmark } from "../../main/db/entities/bookmarks";
import { Form, Formik } from "formik";
import { validateRequired } from "../../utils";
import { useAppContext } from "../context/AppContextProvider";
import { TabView } from "../hooks/tabs";
import { CreatableSelect, OptionBase, Select } from "chakra-react-select";
import { Tag as TTag } from "../../main/db/entities/tags";

export type TagProps = {
    tag?: TTag;
    view: TabView;
};

export type FormInput = HTMLInputElement | HTMLTextAreaElement;

export const Tag = ({ tag, view }: TagProps) => {
    const { bookmarks, tabs, tags } = useAppContext();

    const onSubmit = async (values: any) => {
        switch (view) {
            case "tag":
                await tags.save(tag.id, { ...values }, (response: TTag) => {
                    tabs.update(tabs.active, {
                        ...tabs.data[tabs.active],
                        key: `tag-${response.id}`,
                        data: response as any,
                        view: "tag",
                    });
                });

                break;
            default:
                break;
        }
    };

    return (
        <Flex direction="column" style={{ width: "100%" }}>
            <Formik<TTag>
                enableReinitialize={true}
                initialValues={{ ...tag }}
                onSubmit={onSubmit}
                validate={(values: TTag) => {
                    const requiredErrors = validateRequired(values, ["tag"]);

                    return {
                        ...requiredErrors,
                    };
                }}
            >
                {({ dirty, values, setFieldValue, errors, submitForm }) => {
                    const handleChange = (key: string, value?: any) => (e: React.ChangeEvent<FormInput>) => {
                        setFieldValue(key, value ?? e.currentTarget.value);
                    };

                    const handleCreateOption = async (newValue: string) => {
                        await bookmarks.create({ uri: newValue }, (bookmark: WriteBookmark) => {
                            setFieldValue("bookmarks", [...values.bookmarks, bookmark]);
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

                    return (
                        <Form style={{ width: "100%" }} noValidate>
                            <VStack w="100%">
                                <FormControl isRequired>
                                    <FormLabel htmlFor="tag">Tag</FormLabel>
                                    <Input
                                        as={Input}
                                        id="uri"
                                        name="uri"
                                        type="text"
                                        variant="filled"
                                        placeholder="Enter tag"
                                        value={values?.tag ?? ""}
                                        onChange={handleChange("uri")}
                                    />
                                    <FormHelperText color="red">{errors.tag}</FormHelperText>
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor="bookmarks">Bookmarks</FormLabel>
                                    <CreatableSelect
                                        id={`bookmarks-${tags.data[tabs.active]?.id ?? "new"}`}
                                        name="bookmarks"
                                        isMulti={true}
                                        onCreateOption={handleCreateOption}
                                        options={bookmarks.data?.map(getBookmarkOption) ?? []}
                                        onChange={(options: Array<BookmarkOption>) => handleChange("bookmarks", options?.map(getOptionTag) ?? [])}
                                        value={values?.bookmarks?.map(getBookmarkOption)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel htmlFor="color">Color</FormLabel>
                                    <Select
                                        id={`color-${tags.data[tabs.active]?.id ?? "new"}`}
                                        name="color"
                                        options={COLOR_OPTIONS}
                                        onChange={(option: ColorOption) => setFieldValue("color", option.value)}
                                        value={getColorOption(values?.color as ColorKey)}
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

const getBookmarkOption = (bookmark: Bookmark) => {
    return {
        label: bookmark.name ?? "Untitled",
        value: bookmark.id,
    };
};

const getOptionTag = (option: BookmarkOption) => {
    return {
        id: option.value,
        tag: option.label,
    };
};

interface BookmarkOption extends OptionBase {
    label: string;
    value: number;
}

const getColorOption = (color: ColorKey) => {
    if (!color) {
        return undefined;
    }

    return {
        label: COLOR_MAP[color].label,
        value: COLOR_MAP[color].value,
    };
};

const getColorTag = (option: ColorOption) => {
    return option.value;
};

interface ColorOption extends OptionBase {
    label: string;
    value: string;
}

export type ColorKey = "gray" | "white" | "yellow" | "orange" | "red" | "purple" | "blue" | "green";

export const COLOR_MAP: { [key in ColorKey]: ColorOption } = {
    gray: {
        label: "Gray",
        value: "gray",
    },
    white: {
        label: "White",
        value: "white",
    },
    yellow: {
        label: "Yellow",
        value: "yellow",
    },
    orange: {
        label: "Orange",
        value: "orange",
    },
    red: {
        label: "Red",
        value: "red",
    },
    purple: {
        label: "Purple",
        value: "purple",
    },
    blue: {
        label: "Blue",
        value: "blue",
    },
    green: {
        label: "Green",
        value: "green",
    },
};

export const COLOR_OPTIONS = [
    COLOR_MAP.gray,
    COLOR_MAP.white,
    COLOR_MAP.yellow,
    COLOR_MAP.orange,
    COLOR_MAP.red,
    COLOR_MAP.purple,
    COLOR_MAP.blue,
    COLOR_MAP.green,
];
