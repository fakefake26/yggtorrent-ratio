// save the preferences
function saveOptions(e)
{
    e.preventDefault();
    browser.storage.local.set({
        "prefs" : {
            "leech_percentage": document.querySelector("#leech_percentage").checked,
            "ratio_percentage": document.querySelector("#ratio_percentage").checked,
            "fiability": document.querySelector("#fiability").checked
        }
    });
}

// restore the preferences on page load
function restoreOptions()
{
    // set the preferences in local storage
    function setCurrentPreferences(result) {
        // if we have the preferences we load them
        if ('prefs' in result) {
            document.querySelector("#leech_percentage").checked = result.prefs.leech_percentage;
            document.querySelector("#ratio_percentage").checked = result.prefs.ratio_percentage;
            document.querySelector("#fiability").checked = result.prefs.fiability;
        }
    };

    // promise to show errors
    function onError(error) {
        console.log(`Error: ${error}`);
    };

    // get the preferences
    var preferences = browser.storage.local.get();

    // set them on the form
    preferences.then(setCurrentPreferences, onError);
}

// rstore prefs on load
document.addEventListener("DOMContentLoaded", restoreOptions);
// on submit of form save them
document.querySelector("form").addEventListener("submit", saveOptions);
