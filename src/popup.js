let all = document.getElementById('all');

function apply () {
    let optionElem = document.getElementById('options').children;
    let newConfig = [];
    for (const e of optionElem) {
        if (!e.querySelector('.name')) continue;
        let newConfigElem = {};
        newConfigElem.id = e.querySelector('.name').textContent;
        console.log(e.querySelector('.name'));
        if (e.dataset.postUrl) newConfigElem.postUrl = e.dataset.postUrl;
        newConfigElem.visible = e.querySelector('#' + newConfigElem.id).checked;
        newConfigElem.text = e.querySelector('.text').value;

        newConfig.push(newConfigElem);
    }

    chrome.storage.sync.set({'config': newConfig}, () => {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            let activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, 'apply');
            window.close();
        });
    });
}

function resetDefault () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        let activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, 'reset');
        window.close();
    });
}

function removeAccessToken () {
    chrome.storage.sync.remove('token');
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        let activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, 'removeToken');
    });
    setupInterface();
}

function drawControls (config) {
    let container = createElemWithClass('div', 'container');
    container.setAttribute('id', 'options');

    let optionElems = config.map(option => createOptionElem(option));
    all.appendChild(appendAll(optionElems, container));

    all.appendChild(createButtons());
}

function createButtons () {
    const buttonElems = [
        createButton('apply', apply),
        createButton('reset to default', resetDefault),
        createButton('Remove stored access token', removeAccessToken)
    ];
    return appendAll(buttonElems, createElemWithClass('div', 'btn-container'));
}

function createButton (text, clickListener) {
    let button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', clickListener);
    return button;
}

function createOptionElem (option) {
    let labelElem = createLabelElem(option.id);

    appendAll([
        createCheckboxElem(option.id, option.visible),
        createElemWithClass('div', 'slider')
    ], labelElem);

    let optionGroupElem = createOptionGroup(option.postUrl);

    appendAll([
        createNameElem(option.id),
        createTextElem(option.text),
        labelElem
    ], optionGroupElem);

    return optionGroupElem;
}

function createOptionGroup (postUrl) {
    let optionGroupElem = createElemWithClass('div', 'option-group');
    optionGroupElem.setAttribute('draggable', 'true');
    addDnDHandlers(optionGroupElem);
    if (postUrl) optionGroupElem.dataset.postUrl = postUrl;
    return optionGroupElem;
}

function createNameElem (content) {
    let nameElem = createElemWithClass('span', 'name');
    nameElem.textContent = content;
    return nameElem;
}

function createTextElem (text) {
    let textElem = createElemWithClass('input', 'text');
    textElem.setAttribute('type', 'text');
    textElem.setAttribute('value', text);
    return textElem;
}

function createLabelElem (_id) {
    let labelElem = createElemWithClass('label', 'switch');
    labelElem.setAttribute('for', _id);
    return labelElem;
}

function createCheckboxElem (_id, visible) {
    let checkboxElem = createElemWithClass('input', 'checkbox');
    checkboxElem.setAttribute('id', _id);
    if (visible) {
        checkboxElem.setAttribute('checked', 'checked');
    }
    return checkboxElem;
}

function createElemWithClass (tag, _class) {
    let elem = document.createElement(tag);
    elem.setAttribute('class', _class);
    return elem;
}

function appendAll (elements, target) {
    for (let element of elements) {
        target.appendChild(element);
    }
    return target;
}

function setupInterface () {
    all.innerHTML = '';
    chrome.storage.sync.get(['config', 'token'], storedConfig => {
        if (!storedConfig.config) {
            chrome.storage.sync.set({'config': defaultConfig});
            setupInterface();
        } else if (storedConfig.token) {
            console.log(storedConfig);
            let config = storedConfig.config;
            drawControls(config);
        } else {
            let token = document.createElement('div');
            token.setAttribute('id', 'token');
            token.setAttribute('class', 'container');

            token.innerHTML = `
                <h2>Setup presonal access token:</h2>
                <ul>
                    <li>Go to the <span id="token-link" class="link">Personal access token</span> page</li>
                    <li>Click on the <span class="hl">Generate new token</span> button</li>
                    <li>Give any name you like to your token</li>
                    <li>Click <span class="hl">Generate token</span> on the bottom of the page</li>
                    <li>Copy and paste the token below:</li>
                </ul>
                <input type="text" name="token" id="token-input" placeholder="Paste token here..."/>
                <div id="error"></div>`;

            let tokenBtn = document.createElement('button');
            tokenBtn.setAttribute('id', 'token-done');
            tokenBtn.addEventListener('click', testToken);
            tokenBtn.textContent = 'done';
            token.appendChild(tokenBtn);
            all.appendChild(token);
            document.getElementById('token-link')
                .addEventListener('click', () => {
                    chrome.tabs.create({url: 'https://github.com/settings/tokens'});
                    return false;
                });
        }
    });
}

function testToken () {
    let token = document.querySelector('#token-input').value;
    document.getElementById('error').textContent = '';

    fetch('https://api.github.com/graphql', {
        method: 'POST',
        body: JSON.stringify({query: '{ rateLimit { limit } }'}),
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + token
        })
    }).then(response => response.json()).then(result => {
        if (result.data) {
            console.log('success');
            chrome.storage.sync.set({'token': token}, () => {
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                    let activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, 'addToken');
                });
                setupInterface();
            });
        } else {
            document.getElementById('error').textContent = 'Couldn\'t validate token. Please try again!';
            document.getElementById('token-input').value = '';
        }
    });
}

setupInterface();

let dragSrcEl = null;

function handleDragStart (e) {
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);

    this.classList.add('dragElem');
}
function handleDragOver (e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    this.classList.add('over');

    e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter (e) {
    // This / e.target is the current hover target.
}

function handleDragLeave (e) {
    this.classList.remove('over'); // This / e.target is previous target element.
}

function handleDrop (e) {
    // This/e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }

    // Don't do anything if dropping the same column we're dragging.
    if (dragSrcEl !== this) {
        // Set the source column's HTML to the HTML of the column we dropped on.
        // Alert(this.outerHTML);
        // DragSrcEl.innerHTML = this.innerHTML;
        // This.innerHTML = e.dataTransfer.getData('text/html');
        this.parentNode.removeChild(dragSrcEl);
        let dropHTML = e.dataTransfer.getData('text/html');
        this.insertAdjacentHTML('beforebegin', dropHTML);
        let dropElem = this.previousSibling;
        addDnDHandlers(dropElem);
    }
    this.classList.remove('over');
    return false;
}

function handleDragEnd (e) {
    this.classList.remove('over');
}

function addDnDHandlers (elem) {
    elem.addEventListener('dragstart', handleDragStart, false);
    elem.addEventListener('dragenter', handleDragEnter, false);
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);
}
