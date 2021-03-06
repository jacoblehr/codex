const crypto = window.require("crypto");

export const getRandomID = () => {
    return crypto.randomBytes(16).toString("hex");
};

export const validateRequired = <T extends { [key: string]: any }>(values: T, required: (keyof T)[]) => {
    const errors: Partial<Record<keyof T, string>> = {};

    required.forEach((req: keyof T) => {
        if (!values[req]) {
            errors[req] = "This field is required";
        }
    });

    return errors;
};

export const validateURI = (uri: string) => {
    let errors: { uri?: string } = {};

    try {
        new URL(uri);
    } catch (e) {
        errors["uri"] = "Invalid URI";
    }

    return errors;
};
