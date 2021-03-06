### What it is:
A chrome extension that extends your Google search results with customizable information about Github repositories.
<p align="center"><a href="https://chrome.google.com/webstore/detail/extended-search-results/ileojhhpfbcpegbcejekooedcgagggoo"><img src ="https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_340x96.png" /><a></p>

### How it looks:
![img alt](screenshots/screenshot1.png)

### Features:
- You can switch on or off every info field
- Customizable label for every information
- Additional hyperlink to infos (e.g. when you click on `Open issues` it will open the open issues page)
- Available info fields:
    - Number of stars
    - Open/Closed/All issues
    - Number of commits
    - Time since latest commit
    - Primary language
    - License
    - Number of releases
    - Number of forks
    - Number of watchers
    - Open/Closed/All pull requests

### How to get started:
- Install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/extended-search-results/ileojhhpfbcpegbcejekooedcgagggoo)
- Go to [google.com](https://google.com)
- Click on the extension icon
- Provide a Presonal Access Token like so:
![token gif](screenshots/token.gif)
- Customize the displayed info
- Check the results by searching for a Github repo

### TODO/Roadmap:
- Port it to other browsers
- Add config file where users can provide their own CSS
- Add more supported sites like Reddit, Stackexchange, Youtube, etc.
- Look into OAuth instead of Personal Access Token
- Insert the additional information with a smooth animation

### Misc:
- [Licensed under the GPLv3](LICENSE.md)
- For bug reports, feature requests, suggestions and contribution questions please open an issue
- You can also contact me via email: [balazs.saros@gmail.com](mailto:balazs.saros@gmail.com)
