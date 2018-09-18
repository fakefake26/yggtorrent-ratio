// app bootstrapping
var app_ygg_ratio_7432e = {};

// all colors for the displayed values
app_ygg_ratio_7432e.const = {
	'GREEN' : 'rgb(0, 218, 0)',
	'LIGHT_BLUE' : 'rgb(0, 221, 212)',
	'BLUE' : 'rgb(20, 29, 216)',
	'ORANGE' : 'rgb(235, 153, 0)',
	'RED' : 'rgb(255, 29, 29)'
};

// all attributes name to easily retrieve the elements we created
app_ygg_ratio_7432e.attributes = {
	'prefs': {
		'leech_percentage' : true,
		'ratio_percentage' : true,
		'fiability' : true
	},
	'attribute_name': {
		'header' : 'data-yggtorrent-ratio-header',
		'data' : 'data-yggtorrent-ratio-data',
		'tr' : 'data-yggtorrent-ratio-tr',
		'thead' : 'data-yggtorrent-ratio-thead'
	}
};

/**
 * Get the closest matching element up the DOM tree.
 * @private
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against
 * @return {Boolean|Element}  Returns null if not match found
 */
var getClosest = function (elem, selector)
{
	// Get closest match
	for ( ; elem && elem !== document; elem = elem.parentNode ) {
		if ( elem.matches( selector ) ) return elem;
	}

	return null;
};

// initiate the data for the program to properly run,
// then runs it.
app_ygg_ratio_7432e.main = function()
{
	// get all tables of the site
	var tables = document.querySelectorAll('div.table-responsive table.table');

	// we cleanup before running, this way we avoid
	// duplicating the data when the site is open in a tab and the extension is
	// updated or reloaded (the update of the extension reloads it)
	app_ygg_ratio_7432e.cleanup(tables);

	// we get the preferences to show or not the different columns we added
	// and then we run our app
	browser.storage.local.get().then(function(preferences){
		// for firefox version prior to 48, the result of a get is an array
		// with one item containing the keys
	    if (Array.isArray(preferences)) {
	    	// if we have something
	    	if (preferences.length !== 0) {
	    		// we set the keys of the object to the current array
	    		preferences = preferences[0];
	    	}
	    }
	    // if we have preferences set, we assign it to our app
	    if ('prefs' in preferences) {
			app_ygg_ratio_7432e.attributes.prefs.leech_percentage = ('leech_percentage' in preferences.prefs) ? preferences.prefs.leech_percentage : app_ygg_ratio_7432e.attributes.prefs.leech_percentage;
			app_ygg_ratio_7432e.attributes.prefs.ratio_percentage = ('ratio_percentage' in preferences.prefs) ? preferences.prefs.ratio_percentage : app_ygg_ratio_7432e.attributes.prefs.ratio_percentage;
			app_ygg_ratio_7432e.attributes.prefs.fiability = ('fiability' in preferences.prefs) ? preferences.prefs.fiability : app_ygg_ratio_7432e.attributes.prefs.fiability;
	    }
	    // adds observer for tables
		app_ygg_ratio_7432e.add_observers(tables);
	    // execute the main process
		app_ygg_ratio_7432e.run(tables);
	}, function(error){
		// error occurred while getting the storage, execute the process anyway
		// adds observer for tables
		app_ygg_ratio_7432e.add_observers(tables);
	    // execute the main process
		app_ygg_ratio_7432e.run(tables);
	});
};

// main process
app_ygg_ratio_7432e.run = function(tables)
{
	// then we hydrate the rows of each table
	for (var i = tables.length - 1; i >= 0; i--) {
		// we get all rows of that table from the tbody
		// which contains all the data
		var tbody = tables[i].getElementsByTagName('tbody');
		// tbody ok ?
		if(tbody.length == 0) continue;
		var rows = tbody[0].getElementsByTagName('tr');

		// avoid infinite loop
		if (rows.length == 0) {
			continue;
		}

		// we create the headers on the table only if
		// there are rows to avoid conflicting with the datatable
		// ajax.
		// Datatable will throw an error because it has a header that
		// it does not know about, so we can't put the headers at the beginning
		app_ygg_ratio_7432e.create_headers(tables[i]);

		// for each row we gonna get the tds values
		// and append a td containing the ratio percentage
		for (var j = rows.length - 1; j >= 0; j--) {
			//  check if it is worked by observers
			if(! rows[j].hasAttribute(app_ygg_ratio_7432e.attributes.attribute_name.tr)) {
				// otherwise go and hydrate it
				app_ygg_ratio_7432e.hydrate_row(rows[j]);
			}
		}
	}
};

// we add the data of the extension to the row
app_ygg_ratio_7432e.hydrate_row = function(row)
{
	// we get all the cells, we want to retrieve the seed and leech values
	var cells = row.getElementsByTagName('td');
	// we get the total number of cells
	var number_of_cells = cells.length;

	// some rows have no data relevant for us
	if(number_of_cells == 0) return false;

	// add attribute to tell that it has been hydrated
	// we put it as soon as possible to avoid
	// race conditions at much as we can
	row.setAttribute(app_ygg_ratio_7432e.attributes.attribute_name.tr, "1");

	// we get the seed and leech values in int,
	// since we want to do a calculus
	var seed = parseInt(cells[number_of_cells - 2].textContent, 10);
	var leech = parseInt(cells[number_of_cells - 1].textContent, 10);

	// handle the case where the content of the tds equals '--'
	if (isNaN(seed)) { seed = 0; }
	if (isNaN(leech)) { leech = 0; }

	// the total numbers of users
	var total = seed + leech;

	// the values we will put in the tds
	// the leech percentage over seeders and leechers
	// If the seeders and leechers are equal, it will be 50%
	var leech_percentage = 0;
	// the ratio between seeders and leechers.
	// If the seeders and leechers are equal, it will be 100%
	var ratio = 0;

	// if we have some leechers/seeders we do the calculus
	if (total != 0) {
		// we do the calculus of the ratio and leech percentage to display in the row
		var leech_percentage = ( leech * 100 ) / total;
		var ratio = ( leech * 100 ) / seed;
	}

	// we get the spans we want from the data we calculated
	var span_leech_percentage = app_ygg_ratio_7432e.create_percentage_span(leech_percentage, total);
	var span_ratio = app_ygg_ratio_7432e.create_percentage_span(ratio, total);
	// we add the fiability span to quickly see if the percentage is valuable enough
	var span_fiability = app_ygg_ratio_7432e.create_fiability_span(total);

	var span_first_separator = app_ygg_ratio_7432e.create_separator_span();
	var span_second_separator = app_ygg_ratio_7432e.create_separator_span();

	var td_data = app_ygg_ratio_7432e.create_data_td();

	// handle visibility of all data elements
	app_ygg_ratio_7432e.handle_preferences(
		td_data,
		span_leech_percentage,
		span_ratio,
		span_fiability,
		span_first_separator,
		span_second_separator,
	);

	// we add the spans
	td_data.appendChild(span_leech_percentage);
	td_data.appendChild(span_first_separator);
	td_data.appendChild(span_ratio);
	td_data.appendChild(span_second_separator);
	td_data.appendChild(span_fiability);

	// add the td to the row
	row.appendChild(td_data);

	return true;
};

// we create all column headers attached to the thead of the table
app_ygg_ratio_7432e.create_headers = function(table)
{
	// we get the header
	var thead = table.getElementsByTagName('thead');

	if (thead.length == 0) {
		return;
	} else {
		// check right now if it needs a header
	    if (thead[0].hasAttribute(app_ygg_ratio_7432e.attributes.attribute_name.thead)) {
	    	return;
	    }
	}

	// the headers list
	var titles = [
		// the leech %
		{'name' : 'L%', 'show' : app_ygg_ratio_7432e.attributes.prefs.leech_percentage},
		// the ratio %
		{'name' : 'R%', 'show' : app_ygg_ratio_7432e.attributes.prefs.ratio_percentage},
		// the fiability
		{'name' : 'F', 'show' : app_ygg_ratio_7432e.attributes.prefs.fiability}
	];

	var title = "";
	// we iterate over the titles and
	// create corresponding 'th' elements
	for (var i = 0; i < titles.length; i++) {
		if (titles[i].show) {
			title += " | " + titles[i].name;
		}
	}
	// if we have some title, remove the first slash
	if (title) {
		title = title.substring(3);
	}

	// we get the tr of the header
	var thead_rows = thead[0].getElementsByTagName('tr');

	// header present ?
	if (thead_rows.length > 0) {
		// we create the th element and assign the text to it
		var th = document.createElement('th');
		th.textContent = title;
		// attribute of the app to recognize it
		th.setAttribute(app_ygg_ratio_7432e.attributes.attribute_name.header, "1");
		// set the attributes specific to the datatable
		th.className = "no sorting";
		th.tabIndex = 0;
		th.rowSpan = 1;
		th.colSpan = 1;
		// set the style
		// 106 is good to correctly see all
		th.style.width = "106px";
		th.style.paddingLeft = "0";
		th.style.paddingRight = "0";
		// set the visibility from the preferences of the user
		if (! title) { th.style.display = "none" ;}
		// we attach the element to the tr in the thead of the table
		thead_rows[0].appendChild(th);
		// we tell by that attribute that it has been created
		thead[0].setAttribute(app_ygg_ratio_7432e.attributes.attribute_name.thead, "1");
	}
};

// create the headers for ajax filled tables
app_ygg_ratio_7432e.create_async_headers = function(row)
{
	// get the table we are in
	var table = getClosest(row, "table");
	// if we have it, we create the headers, that function will not add another header
	// if there is one still present
	if (table) {
		app_ygg_ratio_7432e.create_headers(table);
	} else {
		// table not found !
	}
};

// create the td containing the data
app_ygg_ratio_7432e.create_data_td = function()
{
	// new td !
	var td_data = document.createElement('td');
	td_data.style.paddingLeft = 0;
	td_data.style.paddingRight = 0;
	// attribute of the app to recognize it
	td_data.setAttribute(app_ygg_ratio_7432e.attributes.attribute_name.data, "1");

	return td_data;
};

// create a span representing a percentage
app_ygg_ratio_7432e.create_percentage_span = function(percentage, total)
{
	// new span !
	var span_percentage = document.createElement('span');

	// if total is 0 we don't do any calculus, we put infinite in the span
	// since a calcul would do an infinite result
	if (total == 0) {
		// text of span displayed
		span_percentage.textContent = 'Inf';

		// we color the text in red
		span_percentage.style.color = app_ygg_ratio_7432e.const.RED;
	} else {
		// we format the data and put it in span
		// we cap it at 1000, it's not relevant above
		if (percentage > 1000) {
			span_percentage.textContent = 'Inf';
		} else {
			span_percentage.textContent = Math.round(percentage);
		}

		// we style the text to have a quick view of the 'goodness' of the percentage
		span_percentage.style.color = app_ygg_ratio_7432e.get_color_ratio_from_percentage(percentage);
	}

	// we return the span object
	return span_percentage;
};

// create the span representing the fiability of a file
app_ygg_ratio_7432e.create_fiability_span = function(total)
{
	// new span !
	var span_fiability = document.createElement('span');

	// if total is 0 we don't do any calculus, it's not relevant
	if (total == 0) {
		// we add a fiability span whose value is not valuable
		span_fiability.textContent = '-';
	} else {
		// the threshold  where we consider fully fiable
		if (total >= 50) {
			span_fiability.textContent = "1";
			span_fiability.style.color = app_ygg_ratio_7432e.const.GREEN;
		} else {
			// we get a value from 0 to 1, 1 is fiable 0 is not at all
			var fiability = total / 50;
			// we style the text to have a quick view of the 'goodness' of the fiability
			if (fiability >= 0.8) { span_fiability.style.color = app_ygg_ratio_7432e.const.GREEN; }
			else if (fiability >= 0.6 && fiability < 0.8) { span_fiability.style.color = app_ygg_ratio_7432e.const.LIGHT_BLUE; }
			else if (fiability >= 0.4 && fiability < 0.6) { span_fiability.style.color = app_ygg_ratio_7432e.const.BLUE; }
			else if (fiability >= 0.2 && fiability < 0.4) { span_fiability.style.color = app_ygg_ratio_7432e.const.ORANGE; }
			else if (fiability < 0.2) { span_fiability.style.color = app_ygg_ratio_7432e.const.RED; }
			span_fiability.textContent = fiability.toFixed(2);
		}
	}

	// we return the span object
	return span_fiability;
};

// create the span containing a slash
app_ygg_ratio_7432e.create_separator_span = function()
{
	// new span !
	var span_separator = document.createElement('span');
	span_separator.textContent = ' | ';
	return span_separator;
};

// get the correct color from percentage
app_ygg_ratio_7432e.get_color_ratio_from_percentage = function(percentage)
{
	if (percentage < 20) { return app_ygg_ratio_7432e.const.GREEN; }
	else if (percentage >= 20 && percentage < 40) { return app_ygg_ratio_7432e.const.LIGHT_BLUE; }
	else if (percentage >= 40 && percentage < 60) { return app_ygg_ratio_7432e.const.BLUE; }
	else if (percentage >= 60 && percentage < 80) { return app_ygg_ratio_7432e.const.ORANGE; }
	else if (percentage >= 80) { return app_ygg_ratio_7432e.const.RED; }
};

// we assign the correct visibility from the preferences of the extension
app_ygg_ratio_7432e.handle_preferences = function(
	td_data,
	span_leech_percentage,
	span_ratio,
	span_fiability,
	span_first_separator,
	span_second_separator
) {
	// if completely disabled, we don't see any data
	if (
		! app_ygg_ratio_7432e.attributes.prefs.leech_percentage
		&& ! app_ygg_ratio_7432e.attributes.prefs.ratio_percentage
		&& ! app_ygg_ratio_7432e.attributes.prefs.fiability
	) {
		td_data.style.display = "none";
	} else {
		// check if all are visible
		if (
			app_ygg_ratio_7432e.attributes.prefs.leech_percentage
			&& app_ygg_ratio_7432e.attributes.prefs.ratio_percentage
			&& app_ygg_ratio_7432e.attributes.prefs.fiability
		) {
			// nothing to do all are visible !
		} else {
			// here we check if one or two are visible
			if (
				(app_ygg_ratio_7432e.attributes.prefs.leech_percentage && ! app_ygg_ratio_7432e.attributes.prefs.ratio_percentage && ! app_ygg_ratio_7432e.attributes.prefs.fiability)
				|| (! app_ygg_ratio_7432e.attributes.prefs.leech_percentage && ! app_ygg_ratio_7432e.attributes.prefs.ratio_percentage && app_ygg_ratio_7432e.attributes.prefs.fiability)
				|| (! app_ygg_ratio_7432e.attributes.prefs.leech_percentage && app_ygg_ratio_7432e.attributes.prefs.ratio_percentage && ! app_ygg_ratio_7432e.attributes.prefs.fiability)
			) {
				// only one value is visible
				// so no separator span
				span_first_separator.style.display = "none";
				span_second_separator.style.display = "none";
			} else {
				// two values are visible
				// so just one visible
				// we have to hide the correct one tho,
				// the one which is between the two values displayed
				if (app_ygg_ratio_7432e.attributes.prefs.leech_percentage) {
					span_second_separator.style.display = "none";
				} else {
					span_first_separator.style.display = "none";
				}
			}
		}
	}

	// for each span we add, we assign a display none value if the preferences
	// set by the user says to not show it
	if (! app_ygg_ratio_7432e.attributes.prefs.leech_percentage) {span_leech_percentage.style.display = "none"; }
	if (! app_ygg_ratio_7432e.attributes.prefs.ratio_percentage) { span_ratio.style.display = "none"; }
	if (! app_ygg_ratio_7432e.attributes.prefs.fiability) { span_fiability.style.display = "none"; }
};

// add observers to check for the dynamic rows that are added by ajax
app_ygg_ratio_7432e.add_observers = function(tables)
{
	// this callback get executed each time a children has been added or
	// removed from the table. It will check that it is a row of data
	// that has not been hydrated yet and then hydrate it the latter is true.
	var callback = function(mutationsList) {
		// for every mutation we have received
	    for(var mutation of mutationsList) {
	    	// if this mutation concerns an element that has been added or removed
	        if (mutation.type == 'childList') {
	        	// we will iterate through the addedNodes of that mutation
	            for(var addedNode of mutation.addedNodes) {
	            	// if the node is an element and a row
	            	if (addedNode.nodeType === Node.ELEMENT_NODE && addedNode.nodeName === "TR") {
	            		// we check if it has been hydrated by this attribute that is added
	            		// for every row hydrated
	            		if(! addedNode.hasAttribute(app_ygg_ratio_7432e.attributes.attribute_name.tr)) {
	            			// ok this row is not hydrated so we hydrate it.
	            			app_ygg_ratio_7432e.hydrate_row(addedNode);
	            			// since we can't add form the start the headers,
	            			// we need to check if there is the header and if not
	            			// create it
	            			app_ygg_ratio_7432e.create_async_headers(addedNode);
	            		}
	            	} else {
	            		// not a tr, nothing to do
	            	}
	            }
	        } else {
	            // not a childlist mutation, we don't care
	        }
	    }
	};

	// Observer options, we observe the children node changes, and we tell him by
	// the subtree option that we want to observe
	// all the tree of the node and not just the direct children
	var config = {childList: true, subtree: true};

	// for each tables we gonna add an observer
	for (var i = tables.length - 1; i >= 0; i--) {
		// create observer instance linked to the callback function
		var observer = new MutationObserver(callback);

		// Begin observing the target node for the mutations we configured earlier
		observer.observe(tables[i], config);

		// shutdown observer
		// observer.disconnect();
	}
};


// we remove all the elements we added
app_ygg_ratio_7432e.cleanup = function(tables)
{
	// for each tables we gonna search for the elements we added
	for (var i = tables.length - 1; i >= 0; i--) {
		// the elements have all specific data attributes
		// we get them. no need to check beforehand if they exist, since it will
		// already be a search in the table tree
		var elements_to_remove = tables[i].querySelectorAll('\
			th[' + app_ygg_ratio_7432e.attributes.attribute_name.header + '="1"], \
			td[' + app_ygg_ratio_7432e.attributes.attribute_name.data + '="1"]'
		);

		// for each element we remove it
		for (var j = 0; j < elements_to_remove.length; j++) {
			elements_to_remove[j].remove();
		}

		// we also remove the tr attribute that tells it has been hydrated
		var elements_attribute_to_remove = tables[i].querySelectorAll('\
			tr[' + app_ygg_ratio_7432e.attributes.attribute_name.tr + '="1"]'
		);

		// for each element we remove its attribute
		for (var j = 0; j < elements_attribute_to_remove.length; j++) {
			elements_attribute_to_remove[j].removeAttribute(app_ygg_ratio_7432e.attributes.attribute_name.tr);
		}

		// and we remove the thead attribute that tells it has a header
		var elements_attribute_to_remove = tables[i].querySelectorAll('\
			thead[' + app_ygg_ratio_7432e.attributes.attribute_name.thead + '="1"]'
		);

		// for each element we remove its attribute
		for (var j = 0; j < elements_attribute_to_remove.length; j++) {
			elements_attribute_to_remove[j].removeAttribute(app_ygg_ratio_7432e.attributes.attribute_name.thead);
		}
	}
};

// initiate app and runs it
app_ygg_ratio_7432e.main();

// when the user changes preferences on the option page, we reload the app
browser.storage.onChanged.addListener(function(changes, area){
	// initiate app and runs it
	app_ygg_ratio_7432e.main();
});
