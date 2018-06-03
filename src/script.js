const delimeter = ' • ';
let config;
let token;
let tokenInited = false;

chrome.storage.sync.get('config', storedConfig => {
    config = storedConfig.config;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request) {
    case 'reset':
        config = defaultConfig;
        chrome.storage.sync.set({'config': defaultConfig});
        window.location.reload();
        break;
    case 'apply':
        chrome.storage.sync.get('config', storedConfig => {
            config = storedConfig.config;
        });
        window.location.reload();
        break;
    case 'removeToken':
        tokenInited = false;
        window.location.reload();
        break;
    case 'addToken':
        tokenInited = true;
        window.location.reload();
        break;
    case 'config':
        config = defaultConfig;
        chrome.storage.sync.set({'config': defaultConfig});
        break;
    }
});

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
    let seconds = Math.floor((new Date() - date) / 1000);
    let timeBorders = [31536000, 2592000, 84400, 3600, 60, 1];
    let timeLabels = [' year', ' month', ' day', ' hour', ' minute', ' second'];
    for (const [index, value] of timeBorders.entries()) {
        let interval = Math.floor(seconds / value);
        if (interval >= 1) {
            return (interval === 1 ? 'a' : interval) + timeLabels[index] + (interval > 1 ? 's' : '') + ' ago';
        }
    }
}

function getUrl (elem) {
    let url = elem.querySelectorAll('h3.r > a')[0];
    if (url === undefined) return;
    url = url.href;

    let regexp = '^http(s)?://github.com(/[-a-zA-Z0-9@:%_+.~#?&=]+){2}$';
    if (url.match(new RegExp(regexp))) {
        let splitUrl = url.split('/');

        if (!token) {
            chrome.storage.sync.get('token', storedToken => {
                token = storedToken.token;
                getGithubInfo(elem, splitUrl[splitUrl.length - 2], splitUrl[splitUrl.length - 1]);
            });
        } else {
            getGithubInfo(elem, splitUrl[splitUrl.length - 2], splitUrl[splitUrl.length - 1]);
        }
    }
}

function getGithubInfo (elem, owner, repo) {
    fetch('https://api.github.com/graphql', requestConfig(owner, repo))
        .then(response => response.json()).then(result => {
            let r = result.data.repository;
            let infos = {
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
    // let inner = '<div style="opacity: 0.6; line-height: 1.6rem"><hr style="margin: 6px 0;">';

    let infoElem = document.createElement('div');
    // infoElem.cssText = 'opacity: 0.6; line-height: 1.6rem';
    infoElem.style.opacity = '0.6';
    infoElem.style.lineHeight = '1.6rem';
    let divideLine = document.createElement('hr');
    divideLine.style.margin = '6px 0';
    infoElem.appendChild(divideLine);

    for (const i of config.filter(prop => prop.visible)) {
        // const displayedText = i.text === '' ? '' : i.text + 'x';
        const appendType = i.postUrl === undefined || info[i.id] === 'n/a' ? 'span' : 'a';
        let appendNode = document.createElement(appendType);
        appendNode.textContent = [i.text, info[i.id]].join(' ');
        infoElem.appendChild(appendNode);
        infoElem.appendChild(document.createTextNode(delimeter));

        // if (i.postUrl === undefined || info[i.id] === 'n/a') {
        //     inner += `<span>${displayedText}${info[i.id]}</span> ${delimeter} `;
        // } else {
        //     inner += `<a style="text-decoration: underline; cursor: pointer"
        //                     href="https://github.com/${info.url + i.postUrl}">
        //                         ${displayedText}${info[i.id]}
        //                     </a> ${delimeter} `;
        // }
    }

    outerElem.appendChild(infoElem);
}

function run () {
    let regexp = '^(http(s)?://)?(www.)?google(.[a-zA-Z]{2,8}){1,2}/search?';
    if (!window.location.href.match(new RegExp(regexp))) {
        console.log(window.location.href);
        return;
    }

    if (!token) {
        chrome.storage.sync.get('token', storedToken => {
            token = storedToken.token;
            if (token) run();
        });
    } else {
        [...document.querySelectorAll('#rso .g')].map(getUrl);
    }
}

run();
