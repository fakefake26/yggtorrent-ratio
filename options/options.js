// save the preferences
function saveOptions(e)
{
    // if the event is on a checkbox we want
    if (e.target && e.target.matches("input.checkbox_option")) {
        // we get the data of the checkbox we want to store
        // the checkbox contains the name of the key in wich we want to store
        var key_storage = e.target.dataset.key;
        var checkbox_is_checked = e.target.checked;

        // since we got namespaced keys in storage, we have to get the complete object
        // to update just the key we received in the event and not deleting the other keys
        browser.storage.local.get().then(function(result){
            // for firefox version prior to 48, the result of a get is an array
            // with one item containing the keys
            if (Array.isArray(result)) {
                // if we have something
                if (result.length !== 0) {
                    // we set the keys of the object to the current array
                    result = result[0];
                }
            }

            // clone result that we gonna store from what we retrieved
            var preferences = result;

            // if we don't have initial preferences we create the prefs key
            // containing the values
            if (! ('prefs' in preferences)) {
                preferences["prefs"] = {};
            }

            // prepare data to store
            preferences["prefs"][key_storage] = checkbox_is_checked;

            // store it and log error if there are
            browser.storage.local.set(preferences).then(null, function(error) {
                console.log('Error on setting prefs: ' + error);
            });;
        });
    }
}

// restore the preferences on page load
function restoreOptions()
{
    // set the preferences in local storage
    function setCurrentPreferences(result) {
        // for firefox version prior to 48, the result of a get is an array
        // with one item containing the keys
        if (Array.isArray(result)) {
            // if we have something
            if (result.length !== 0) {
                // we set the keys of the object to the current array
                result = result[0];
            }
        }
        // if we have the preferences we load them
        if ('prefs' in result) {
            document.querySelector("#leech_percentage").checked = result.prefs.leech_percentage !== undefined ? result.prefs.leech_percentage : true;
            document.querySelector("#ratio_percentage").checked = result.prefs.ratio_percentage !== undefined ? result.prefs.ratio_percentage : true;
            document.querySelector("#fiability").checked = result.prefs.fiability !== undefined ? result.prefs.fiability : true;
            document.querySelector("#ratio").checked = result.prefs.ratio !== undefined ? result.prefs.ratio : true;
        }
    };

    // get the preferences and set them on the form
    browser.storage.local.get().then(setCurrentPreferences, function (error) {
        console.log('Error on getting prefs: ' + error);
    });
}

// restore preferencess on load
document.addEventListener("DOMContentLoaded", restoreOptions);
// event delegated to get all the change events of the checkboxes
// and save options on that event
document.querySelector("#main").addEventListener("change", saveOptions);

// set the labels string for internationalization
document.getElementById('label_leech_percentage').textContent = browser.i18n.getMessage("pagePreferencesLeechPercentage");
document.getElementById('label_ratio_percentage').textContent = browser.i18n.getMessage("pagePreferencesRatioPercentage");
document.getElementById('label_fiability').textContent = browser.i18n.getMessage("pagePreferencesFiability");
document.getElementById('label_ratio').textContent = browser.i18n.getMessage("pagePreferencesRatio");
