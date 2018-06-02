const defaultConfig = [
    {
        id: 'starCount',
        visible: true,
        text: 'Stars:'
    },
    {
        id: 'openIssues',
        visible: true,
        text: 'Open issues:',
        postUrl: '/issues?q=is%3Aissue+is%3Aopen'
    },
    {
        id: 'commitCount',
        visible: true,
        text: 'Commits:',
        postUrl: '/commits'
    },
    {
        id: 'latest',
        visible: true,
        text: 'Latest commit:'
    },
    {
        id: 'primaryLanguage',
        visible: true,
        text: 'Language:'
    },
    {
        id: 'license',
        visible: false,
        text: 'License:',
        postUrl: '?'
    },
    {
        id: 'closedIssues',
        visible: false,
        text: 'Closed issues:',
        postUrl: '/issues?q=is%3Aissue+is%3Aclosed'
    },
    {
        id: 'allIssues',
        visible: false,
        text: 'All issues:',
        postUrl: '/issues?q=is%3Aissue'
    },
    {
        id: 'releaseCount',
        visible: false,
        text: 'Releases:',
        postUrl: '/releases'
    },
    {
        id: 'forkCount',
        visible: false,
        text: 'Forks:',
        postUrl: '/network'
    },
    {
        id: 'watcherCount',
        visible: false,
        text: 'Watchers:',
        postUrl: '/watchers'
    },
    {
        id: 'openPullRequests',
        visible: false,
        text: 'Open PRs:',
        postUrl: '/pulls?utf8=✓&q=is%3Apr+is%3Aopen'
    },
    {
        id: 'closedPullRequests',
        visible: false,
        text: 'Closed PRs:',
        postUrl: '/pulls?utf8=✓&q=is%3Apr+is%3Aclosed'
    },
    {
        id: 'allPullRequests',
        visible: false,
        text: 'All PRs:',
        postUrl: '/pulls?utf8=✓&q=is%3Apr'
    }
];
