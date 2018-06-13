const DELIMETER = ' • ';
const REGEX = {
    GOOGLE: '^(http(s)?://)?(www.)?google(.[a-zA-Z]{2,8}){1,2}/search?'
};
const infoDomains = [
    {
        name: 'Github',
        regex: new RegExp('^http(s)?://github.com(/[-a-zA-Z0-9@:%_+.~#?&=]+){2}$'),
        getInfo: getGithubInfo
    }
];
let config, token;

function googleScraper () {
    // TODO currently we store the Github token as "storage.token" but later it should be an Object of all the various
    // tokens and giving all tokens to every element as a parameter is not sufficent so restructuring is due
    chrome.storage.sync.get(['token', 'config'], storage => {
        if (!storage.token || !storage.config) return;
        token = storage.token;
        config = storage.config;
        document.querySelectorAll('#rso .g').forEach(elem => parseUrl(elem));
    });
}

function parseUrl (elem) {
    const url = (elem.querySelector('h3.r > a') || {}).href;
    if (!url) return false;
    Array.some(infoDomains.map(i => {
        return url.match(window.location.href.match(i.regex)) ? i.getInfo() : false;
    }));
}

function getGithubInfo (url) {
    const [,,, owner, repo] = url.split('/');
    fetch('https://api.github.com/graphql', requestConfig(owner, repo))
        .then(response => response.json()).then(result => {
            const r = result.data.repository;
            const infos = {
                url: owner + '/' + repo,
                starCount: r.stars.totalCount,
                openIssues: r.openIssues.totalCount,
                commitCount: r.ref.target.commitCount.totalCount,
                latest: timeSince(new Date(r.ref.target.latestCommit)),
                closedIssues: r.closedIssues.totalCount,
                allIssues: r.allIssues.totalCount,
                releaseCount: r.releases.totalCount,
                forkCount: r.forkCount,
                watcherCount: r.watchers.totalCount,
                openPullRequests: r.openPullRequests.totalCount,
                closedPullRequests: r.closedPullRequests.totalCount,
                allPullRequests: r.allPullRequests.totalCount
            };
            infos.license = r.license ? r.license : 'n/a';
            infos.primaryLanguage = r.primaryLanguage ? r.primaryLanguage.name : 'n/a';
            updateGithubInfo(elem, infos);
        });
}

function updateGithubInfo (outerElem, info) {
    const infoElem = document.createElement('div');
    infoElem.style.opacity = '0.6';
    infoElem.style.lineHeight = '1.6rem';
    const divideLine = document.createElement('hr');
    divideLine.style.margin = '6px 0';
    infoElem.appendChild(divideLine);

    for (const i of config.filter(prop => prop.visible)) {
        const appendType = !i.postUrl || info[i.id] === 'n/a' ? 'span' : 'a';
        const appendNode = document.createElement(appendType);

        if (appendType === 'a') {
            appendNode.style.textDecoration = 'underline';
            appendNode.style.cursor = 'pointer';
            appendNode.href = `https://github.com/${info.url + i.postUrl}`;
        }
        appendNode.textContent = [i.text, info[i.id]].join(' ');
        infoElem.appendChild(appendNode);
        infoElem.appendChild(document.createTextNode(DELIMETER));
    }
    // Remove the last delimeter
    infoElem.removeChild(infoElem.lastChild);
    outerElem.appendChild(infoElem);
}

function requestConfig (owner, repo) {
    return {
        method: 'POST',
        body: JSON.stringify({
            query: githubQuery(owner, repo)
        }),
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + token
        })
    };
}

function githubQuery (owner, repo) {
    return `{
        repository(owner: "${owner}", name: "${repo}") {
            stars: stargazers {
                totalCount
            }
            openIssues: issues(states:[OPEN]) {
                totalCount
            }
            allIssues: issues {
                totalCount
            }
            closedIssues: issues(states: [CLOSED]) {
                totalCount
            }
            ref(qualifiedName: "master"){
                target{
                    ... on Commit{
                        commitCount: history {
                            totalCount
                        }
                        latestCommit: authoredDate
                    }
                }
            }
            forkCount
            watchers {
                totalCount
            }
            releases {
                totalCount
            }
            license
            primaryLanguage {
                name
            }
            openPullRequests: pullRequests(states: [OPEN]) {
                totalCount
            }
            closedPullRequests: pullRequests(states: [CLOSED]) {
                totalCount
            }
            allPullRequests: pullRequests {
                totalCount
            }
        }
    }`;
}

function timeSince (date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const timeBorders = [31536000, 2592000, 84400, 3600, 60, 1];
    const timeLabels = [' year', ' month', ' day', ' hour', ' minute', ' second'];
    for (const [index, value] of timeBorders.entries()) {
        const interval = Math.floor(seconds / value);
        if (interval >= 1) {
            return (interval === 1 ? 'a' : interval) + timeLabels[index] + (interval > 1 ? 's' : '') + ' ago';
        }
    }
}

function run () {
    if (!window.location.href.match(new RegExp(REGEX.GOOGLE))) return;

    googleScraper();
}

run();
