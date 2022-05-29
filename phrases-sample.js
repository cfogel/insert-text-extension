export const phrases = {
    groups: [
        {
            gid: "my-first-group",
            gtitle: "Group 1",
            phrasegroups: [
                {
                    phrases: [
                        {
                            pid: "first-phrase",
                            ptitle: "First Title",
                            ptext: "The text of the first phrase"
                        },
                        {
                            pid: "second-phrase",
                            ptitle: "Second Title",
                            ptext: "The text of the second phrase"
                        }
                    ]
                }
            ]
        },
        {
            gid: "my-second-group",
            gtitle: "Group 2",
            phrasegroups: [
                {
                    pgid: "pg1",
                    pgtitle: "Category 1",
                    phrases: [
                        {
                            pid: "third-phrase",
                            ptitle: "Third Title",
                            ptext: "The text of the third phrase"
                        }
                    ]
                },
                {
                    pgid: "pg2",
                    pgtitle: "Category 2",
                    phrases: [
                        {
                            pid: "fourth-phrase",
                            pgid: "pg2",
                            ptitle: "Fourth Title",
                            ptext: "The text of the fourth phrase"
                        },
                        {
                            pid: "fifth-phrase",
                            pgid: "pg2",
                            ptitle: "Fifth Title",
                            ptext: "The text of the fifth phrase"
                        }
                    ]
                }
            ]
        }
    ]
};
