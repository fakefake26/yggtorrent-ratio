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
app_ygg_ratio_7432e.attribute_name = {
	'header' : 'data-yggtorrent-ratio-header',
	'data' : 'data-yggtorrent-ratio-data',
};

// main process
app_ygg_ratio_7432e.run = function(tables)
{
	// first for for each tables
	for (var i = tables.length - 1; i >= 0; i--) {
		// we get all rows of that table from the tbody
		// wich contains all the data
		var tbody = tables[i].getElementsByTagName('tbody');
		// tbody ok ?
		if(tbody.length == 0) continue;
		var rows = tbody[0].getElementsByTagName('tr');

		// avoid infinite loop
		if(rows.length == 0) continue;

		// we add the header
		var thead = tables[i].getElementsByTagName('thead');
		// we get the tr of the header
		var thead_rows = tables[i].getElementsByTagName('tr');

		// header present ?
		if (thead_rows.length > 0) {
			app_ygg_ratio_7432e.create_headers(thead_rows[0]);
		}

		// for each row we gonna get the tds values
		// and append a td containing the ratio percentage
		for (var j = rows.length - 1; j >= 0; j--) {
			// we get all the cells, we want to retrieve the seed and leech values
			var cells = rows[j].getElementsByTagName('td');
			// we get the total number of cells
			var number_of_cells = cells.length;

			// some rows have no data relevant for us
			if(number_of_cells == 0) continue;

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

			// we get the tds we want from the data we calculated
			var td_leech_percentage = app_ygg_ratio_7432e.create_percentage_td(leech_percentage, total);
			var td_ratio = app_ygg_ratio_7432e.create_percentage_td(ratio, total);
			// we add the fiability td to quickly see if the percentage is valuable enough
			var td_fiability = app_ygg_ratio_7432e.create_td_fiability(total);

			// we add the tds to the corresponding row
			rows[j].appendChild(td_leech_percentage);
			rows[j].appendChild(td_ratio);
			rows[j].appendChild(td_fiability);
		}
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
			th[' + app_ygg_ratio_7432e.attribute_name.header + '="1"], \
			td[' + app_ygg_ratio_7432e.attribute_name.data + '="1"]'
		);

		// for each element we remove it
		for (var j = 0; j < elements_to_remove.length; j++) {
			elements_to_remove[j].remove();
		}
	}
};

// we create all column headers attached to the thead of the table
app_ygg_ratio_7432e.create_headers = function(thead)
{
	// the headers list
	var titles = [
		// the leech %
		'L%',
		// the ratio %
		'R%',
		// the fiability
		'F'
	];

	// we iterate over the titles and
	// create corresponding 'th' elements
	for (var i = 0; i < titles.length; i++) {
		// we create the th element and assign the text to it
		var th = document.createElement('th');
		th.textContent = titles[i];
		// attribute of the app to recognize it
		th.setAttribute(app_ygg_ratio_7432e.attribute_name.header, "1");
		// we attach the element to the thead of the table
		thead.appendChild(th);
	}
};

// create a td representing a percentage
app_ygg_ratio_7432e.create_percentage_td = function(percentage, total)
{
	// new td !
	var td_percentage = document.createElement('td');
	// attribute of the app to recognize it
	td_percentage.setAttribute(app_ygg_ratio_7432e.attribute_name.data, "1");

	// if total is 0 we dont do any calculus, we put infinite in the td
	// since a calcul would do an infinite result
	if (total == 0) {
		// text of td displayed
		td_percentage.textContent = 'Inf%';

		// we color the text in red
		td_percentage.style.color = app_ygg_ratio_7432e.const.RED;
	} else {
		// we format the data and put it in td
		// we cap it at 1000, it's not relevant above
		if (percentage > 1000) {
			td_percentage.textContent = '>1000%';
		} else {
			td_percentage.textContent = Math.round(percentage) + '%';
		}

		// we style the text to have a quick view of the 'goodness' of the percentage
		td_percentage.style.color = app_ygg_ratio_7432e.get_color_ratio_from_percentage(percentage);
	}

	// we return the td object
	return td_percentage;
};

// create the td representing the fiability of a file
app_ygg_ratio_7432e.create_td_fiability = function(total)
{
	// new td !
	var td_fiability = document.createElement('td');
	// attribute of the app to recognize it
	td_fiability.setAttribute(app_ygg_ratio_7432e.attribute_name.data, "1");

	// if total is 0 we dont do any calculus, it's not relevant
	if (total == 0) {
		// we add a fiability td whose value is not valuable
		td_fiability.textContent = '-';
	} else {
		// the threshold  where we consider fully fiable
		if (total >= 50) {
			td_fiability.textContent = "1";
			td_fiability.style.color = app_ygg_ratio_7432e.const.GREEN;
		} else {
			// we get a value from 0 to 1, 1 is fiable 0 is not at all
			var fiability = total / 50;
			// we style the text to have a quick view of the 'goodness' of the fiability
			if (fiability >= 0.8) { td_fiability.style.color = app_ygg_ratio_7432e.const.GREEN; }
			else if (fiability >= 0.6 && fiability < 0.8) { td_fiability.style.color = app_ygg_ratio_7432e.const.LIGHT_BLUE; }
			else if (fiability >= 0.4 && fiability < 0.6) { td_fiability.style.color = app_ygg_ratio_7432e.const.BLUE; }
			else if (fiability >= 0.2 && fiability < 0.4) { td_fiability.style.color = app_ygg_ratio_7432e.const.ORANGE; }
			else if (fiability < 0.2) { td_fiability.style.color = app_ygg_ratio_7432e.const.RED; }
			td_fiability.textContent = fiability.toFixed(2);
		}
	}

	// we return the td object
	return td_fiability;
};

// get the correct color from pecentage
app_ygg_ratio_7432e.get_color_ratio_from_percentage = function(percentage)
{
	if (percentage < 20) { return app_ygg_ratio_7432e.const.GREEN; }
	else if (percentage >= 20 && percentage < 40) { return app_ygg_ratio_7432e.const.LIGHT_BLUE; }
	else if (percentage >= 40 && percentage < 60) { return app_ygg_ratio_7432e.const.BLUE; }
	else if (percentage >= 60 && percentage < 80) { return app_ygg_ratio_7432e.const.ORANGE; }
	else if (percentage >= 80) { return app_ygg_ratio_7432e.const.RED; }
};

// get all tables of the site
var tables = document.getElementsByClassName('table table-striped');
// we cleanup before running, this way we avoid
// duplicating the data when the site is open in a tab and the extension is
// updated or reloaded (the update of the extension reloads it)
app_ygg_ratio_7432e.cleanup(tables);
// execute the main process
app_ygg_ratio_7432e.run(tables);
