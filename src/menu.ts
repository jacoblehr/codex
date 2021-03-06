export const menuTemplate = [
    {
        label: "Edit",
        submenu: [
            {
                role: "undo",
            },
            {
                role: "redo",
            },
            {
                type: "separator",
            },
            {
                role: "cut",
            },
            {
                role: "copy",
            },
            {
                role: "paste",
            },
            {
                role: "selectall",
            },
        ],
    },

    {
        label: "View",
        submenu: [
            {
                role: "reload",
            },
            {
                role: "toggledevtools",
            },
            {
                type: "separator",
            },
            {
                role: "resetzoom",
            },
            {
                role: "zoomin",
            },
            {
                role: "zoomout",
            },
            {
                type: "separator",
            },
            {
                role: "togglefullscreen",
            },
        ],
    },

    {
        role: "window",
        submenu: [
            {
                role: "minimize",
            },
            {
                role: "close",
            },
        ],
    },

    {
        role: "help",
        submenu: [
            {
                label: "Learn More",
            },
        ],
    },
] as any;
