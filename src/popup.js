let all = document.getElementById('all');

const noTokenTemplate = `
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

function apply () {
    const optionElems = document.querySelector('#options').children;
    const newConfig = Array.from(optionElems).filter(e => e.querySelector('.name')).map(createConfigElem);

    chrome.storage.sync.set({'config': newConfig}, () => {
        reloadActiveTab();
        window.close();
    });
}

function createConfigElem (e) {
    const id = e.querySelector('.name').textContent;
    return {
        id: id,
        text: e.querySelector('.text').value,
        postUrl: e.dataset.postUrl || '',
        visible: e.querySelector('#' + id).checked
    };
}

function resetDefault () {
    chrome.storage.sync.set({'config': defaultConfig}, () => {
        reloadActiveTab();
        window.close();
    });
}

function removeAccessToken () {
    chrome.storage.sync.remove('token');
    reloadActiveTab();
    setupInterface();
}

function reloadActiveTab () {
    chrome.tabs.reload();
}

function drawControls (config) {
    const container = createElemWithClass('div', 'container');
    container.setAttribute('id', 'options');

    const optionElems = config.map(option => createOptionElem(option));
    all.appendChild(appendAll(optionElems, container));

    all.appendChild(createButtons());
}

function createButtons () {
    const buttonElems = [
        createButton('Apply', apply),
        createButton('Reset to default', resetDefault),
        createButton('Remove stored access token', removeAccessToken)
    ];
    return appendAll(buttonElems, createElemWithClass('div', 'btn-container'));
}

function createButton (text, clickListener) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', clickListener);
    return button;
}

function createOptionElem (option) {
    const labelElem = createLabelElem(option.id);

    appendAll([
        createCheckboxElem(option.id, option.visible),
        createElemWithClass('div', 'slider')
    ], labelElem);

    const optionGroupElem = createOptionGroup(option.postUrl);

    appendAll([
        createNameElem(option.id),
        createTextElem(option.text),
        labelElem
    ], optionGroupElem);

    return optionGroupElem;
}

function createOptionGroup (postUrl) {
    const optionGroupElem = createElemWithClass('div', 'option-group');
    optionGroupElem.setAttribute('draggable', 'true');
    addDnDHandlers(optionGroupElem);
    if (postUrl) optionGroupElem.dataset.postUrl = postUrl;
    return optionGroupElem;
}

function createNameElem (content) {
    const nameElem = createElemWithClass('span', 'name');
    nameElem.textContent = content;
    return nameElem;
}

function createTextElem (text) {
    const textElem = createElemWithClass('input', 'text');
    textElem.setAttribute('type', 'text');
    textElem.setAttribute('value', text);
    return textElem;
}

function createLabelElem (_id) {
    const labelElem = createElemWithClass('label', 'switch');
    labelElem.setAttribute('for', _id);
    return labelElem;
}

function createCheckboxElem (_id, visible) {
    const checkboxElem = createElemWithClass('input', 'checkbox');
    checkboxElem.setAttribute('type', 'checkbox');
    checkboxElem.setAttribute('id', _id);
    if (visible) {
        checkboxElem.setAttribute('checked', 'checked');
    }
    return checkboxElem;
}

function appendAll (elements, target) {
    for (const element of elements) {
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
            drawControls(storedConfig.config);
        } else {
            const token = createNoTokenElem();
            all.appendChild(token);
            makeTokenLinkClickable();
        }
    });
}

function createNoTokenElem () {
    const token = createElemWithClass('div', 'container');
    token.setAttribute('id', 'token');
    token.innerHTML = noTokenTemplate;
    token.appendChild(createSaveTokenBtn());
    return token;
}

function makeTokenLinkClickable () {
    document.getElementById('token-link')
        .addEventListener('click', () => {
            chrome.tabs.create({url: 'https://github.com/settings/tokens'});
            return false;
        });
}

function createSaveTokenBtn () {
    const tokenBtn = document.createElement('button');
    tokenBtn.setAttribute('id', 'token-done');
    tokenBtn.addEventListener('click', testToken);
    tokenBtn.textContent = 'done';
    return tokenBtn;
}

function createElemWithClass (tag, _class) {
    const elem = document.createElement(tag);
    elem.setAttribute('class', _class);
    return elem;
}

function testToken () {
    const token = document.querySelector('#token-input').value;
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
                reloadActiveTab();
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
