// on click on the icon in the address bar, we open the preferences on the add-on page
function handleClick()
{
    browser.runtime.openOptionsPage();
}

// we add the listener onclick on the icon on the address bar
browser.pageAction.onClicked.addListener(handleClick);

// we show the icon in the address bar only when we are on the yggtorrent sites
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.match('^https?://([0-9a-zA-Z\-]+\.)?yggtorrent\.li/.*$')) {
        browser.pageAction.show(tab.id);
    }
});
