// au click sur l'icone dans la barre d'adresse, on ouvre les preferences sur la page add-on
function handleClick()
{
    browser.runtime.openOptionsPage();
}

// on ajoute le listener au click sur l'icone dans la barre d'adresse
browser.pageAction.onClicked.addListener(handleClick);

// on montre l'icone dans la barre d'adresse si on est sur yggtorrent et pas dans une page about:
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url.match(/^about:/)) {
        browser.pageAction.show(tab.id);
    }
});
