let all = document.getElementById('all');

function apply() {
    let optionElem = document.getElementById('options').children;
    let newConfig = Array();
    for(const e of optionElem){
        if(!e.querySelector('.name')) continue;
        let newConfigElem = {};
        newConfigElem.id = e.querySelector('.name').textContent;
        console.log(e.querySelector('.name'));
        if(e.dataset.postUrl) newConfigElem.postUrl = e.dataset.postUrl;
        newConfigElem.visible = e.querySelector('#' + newConfigElem.id).checked;
        newConfigElem.text = e.querySelector('.text').value;

        newConfig.push(newConfigElem);
    }

    chrome.storage.sync.set({'config': newConfig}, () => {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, 'apply');
            window.close();
        });
    });

}

function resetDefault(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, 'reset');
        window.close();
    });
}

function drawControls(config){
    let container = document.createElement('div');
    container.setAttribute('id', 'options');
    container.setAttribute('class', 'container');
    for(i of config){
        container.appendChild(createOptionElem(i.id, i.text, i.visible, i.postUrl));
    }

    let removeLink = document.createElement('div');
    removeLink.textContent = 'Remove stored access token';
    removeLink.addEventListener('click', () => {chrome.storage.sync.remove('token'); setupInterface()});
    removeLink.setAttribute('class', 'removeLink');
    container.appendChild(removeLink);
    all.appendChild(container);

    let buttons = document.createElement('div');
    buttons.setAttribute('class', 'btn-container');
    let applyBtn = document.createElement('button');
    applyBtn.textContent = 'apply';
    applyBtn.addEventListener('click', apply);
    let resetBtn = document.createElement('button');
    resetBtn.textContent = 'reset to default'
    resetBtn.addEventListener('click', resetDefault);

    buttons.appendChild(applyBtn);
    buttons.appendChild(resetBtn);

    all.appendChild(buttons);
}

function createOptionElem(name, text, visible, postUrl){
    let wrapperElem = document.createElement('div');
    wrapperElem.setAttribute('class', 'option-group');
    wrapperElem.setAttribute('draggable', 'true');
    addDnDHandlers(wrapperElem);
    if(postUrl) wrapperElem.dataset.postUrl = postUrl;

    let nameElem = document.createElement('span');
    nameElem.setAttribute('class', 'name');
    nameElem.textContent = name;
    wrapperElem.appendChild(nameElem);

    let textElem = document.createElement('input');
    textElem.setAttribute('class', 'text');
    textElem.setAttribute('type', 'text');
    textElem.setAttribute('value', text);
    wrapperElem.appendChild(textElem);

    let labelElem = document.createElement('label');
    labelElem.setAttribute('class', 'switch');
    labelElem.setAttribute('for', name);

    let checkboxElem = document.createElement('div');
    checkboxElem.setAttribute('class', 'slider');

    let inputElem = document.createElement('input');
    inputElem.setAttribute('type', 'checkbox');
    inputElem.setAttribute('id', name);

    if(visible) inputElem.setAttribute('checked', 'checked');
    labelElem.appendChild(inputElem);
    labelElem.appendChild(checkboxElem);
    wrapperElem.appendChild(labelElem);

    return wrapperElem;
}

function setupInterface() {
    all.innerHTML = '';
    chrome.storage.sync.get(['config', 'token'], (storedConfig) => {
        if(storedConfig.token){
            config = storedConfig.config;
            drawControls(config);
        } else {
            let token = document.createElement('div');
            token.setAttribute('id', 'token');
            token.setAttribute('class', 'container');

            token.innerHTML = `
                <h2>Setup presonal access token:</h2>
                <ul>
                    <li>Go to the <a href="#">Personal access token</a> page</li>
                    <li>Click on the <span class="hl">Generate new token</span> button</li>
                    <li>Give any name you like to your token</li>
                    <li>Click <span class="hl">Generate token</span> on the bottom of the page</li>
                    <li>Copy and paste the token below:</li>
                </ul>
                <input type="text" name="token" id="token-input" placeholder="Paste token here..."/>`

            let tokenBtn = document.createElement('button');
            tokenBtn.setAttribute('id', 'token-done');
            tokenBtn.addEventListener('click', testToken);
            tokenBtn.textContent = 'done';
            token.appendChild(tokenBtn);
            all.appendChild(token);
        }
    });
}

function testToken(){
    let token = document.querySelector('#token-input').value;
    fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ rateLimit { limit } }'}),
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + token
        })
    }).then(response => response.json()).then(result => {
        if(result.data) {
            console.log('success');
            chrome.storage.sync.set({'token': token}, () => {
                setupInterface();
            });
        } else {
            console.log('error with credentials');
        }
    });
}

setupInterface();

var dragSrcEl = null;

function handleDragStart(e) {
  // Target (this) element is the source node.
  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);

  this.classList.add('dragElem');
}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  this.classList.add('over');

  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
}

function handleDragLeave(e) {
  this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    //alert(this.outerHTML);
    //dragSrcEl.innerHTML = this.innerHTML;
    //this.innerHTML = e.dataTransfer.getData('text/html');
    this.parentNode.removeChild(dragSrcEl);
    var dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin',dropHTML);
    var dropElem = this.previousSibling;
    addDnDHandlers(dropElem);
    
  }
  this.classList.remove('over');
  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  this.classList.remove('over');

  /*[].forEach.call(cols, function (col) {
    col.classList.remove('over');
  });*/
}

function addDnDHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart, false);
    elem.addEventListener('dragenter', handleDragEnter, false)
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);
}
