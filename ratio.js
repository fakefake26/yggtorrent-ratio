// get all tables
var tables = document.getElementsByClassName('table table-striped');

const GREEN = 'rgb(0, 218, 0)';
const LIGHT_BLUE = 'rgb(0, 221, 212)';
const BLUE = 'rgb(20, 29, 216)';
const ORANGE = 'rgb(235, 153, 0)';
const RED = 'rgb(255, 29, 29)';

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
		// we create the td element for the leech %
		var th = document.createElement('th');
		th.textContent = 'L%';
		thead_rows[0].appendChild(th);

		// we create the td element for fiability
		var th = document.createElement('th');
		th.textContent = 'F%';
		thead_rows[0].appendChild(th);
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
		// the total
		var total = seed + leech;

		// we create the tds elements
		var td_ratio = document.createElement('td');
		var td_fiability = document.createElement('td');

		// we get the ratio percentage for the leech
		if (total == 0) {
			// 0 so infinite percentage
			// we avoid a division per zero
			td_ratio.textContent = 'Inf%';

			// we color the text
			td_ratio.style.color = RED;

			// we add a fiability td whose value is not valuable
			td_fiability.textContent = '-';

			// we add the tds to the corresponding row
			rows[j].appendChild(td_ratio);
			rows[j].appendChild(td_fiability);
		} else {
			var leech_percentage = ( leech * 100 ) / total;
			var ratio = ( leech * 100 ) / seed;
			td_ratio.textContent = Math.round(ratio) + '%';

			// we style the text to have a quick view of the 'goodness' of the ratio
			if (ratio < 20) { td_ratio.style.color = GREEN; }
			else if (ratio >= 20 && ratio < 40) { td_ratio.style.color = LIGHT_BLUE; }
			else if (ratio >= 40 && ratio < 60) { td_ratio.style.color = BLUE; }
			else if (ratio >= 60 && ratio < 80) { td_ratio.style.color = ORANGE; }
			else if (ratio >= 80) { td_ratio.style.color = RED; }

			// we add a fiability to quickly see if the percentage is valuable enough
			// more than 50 ? ok
			if (total >= 50) {
				td_fiability.textContent = "1";
				td_fiability.style.color = GREEN;
			} else {
				// the fiability revolve around the 50 total seed/leech
				var fiability = total / 50;
				// we style the text to have a quick view of the 'goodness' of the fiability
				if (fiability >= 0.8) { td_fiability.style.color = GREEN; }
				else if (fiability >= 0.6 && fiability < 0.8) { td_fiability.style.color = LIGHT_BLUE; }
				else if (fiability >= 0.4 && fiability < 0.6) { td_fiability.style.color = BLUE; }
				else if (fiability >= 0.2 && fiability < 0.4) { td_fiability.style.color = ORANGE; }
				else if (fiability < 0.2) { td_fiability.style.color = RED; }
				td_fiability.textContent = fiability.toFixed(2);
			}

			// we add the tds to the corresponding row
			rows[j].appendChild(td_ratio);
			rows[j].appendChild(td_fiability);
		}
	}
}