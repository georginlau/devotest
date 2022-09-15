var ourRequest = new XMLHttpRequest();
var ourRequest2 = new XMLHttpRequest();
var ourRequest3 = new XMLHttpRequest();
var data1 = "";
var data2 = "";
var data3 = "";
var finaldata = "";
var partitionedById = "";
var result1 = "";
var result2 = "";
var result3 = "";
var result4 = "";

f1(function (results) {
	console.log("----- Print concat data -----");
	// merge datasets
	finaldata = results.concat(finaldata);

	// create new key of cat-myDate
	finaldata.forEach(obj => {
		obj['temp'] = obj['cat'] + ' - ' + obj['myDate']
	});

	console.log(finaldata);

	// merge and add val 	
	var pieData = _(finaldata)
		.groupBy('cat')
		.map((p) => {
			return {
				name: p[0].cat,
				val: _.sumBy(p, 'val')
			}
		})
		.value();

	pieData = pieData.filter(data => data.name != undefined);

	// merge and add val 	
	var t = _(finaldata)
		.groupBy('temp')
		.map((p) => {
			return {
				cat: p[0].cat,
				myDate: p[0].myDate,
				name: p[0].temp,
				val: _.sumBy(p, 'val')
			}
		})
		.value();

	// parse myDate into epoch
	t.forEach(obj => toEpoch(obj, 'myDate', 'epochtime'));

	// sort by cat then epochtime
	t = _.sortBy(t, ['cat', 'epochtime']);

	// convert date to yyyy/mm/dd format
	// console.log("----------------");
	// finaldata = JSON.stringify(t).replace(/\-/g, '/'); //convert to JSON string
	// finaldata = JSON.parse(finaldata); //convert back to array
	// console.log(finaldata);

	// split into series per cat, time
	var partitionedById = _(t).groupBy('cat').values().value();

	var result1 = partitionedById[0].map(i => ([i.epochtime, i.val]))
	var result2 = partitionedById[1].map(i => ([i.epochtime, i.val]))
	var result3 = partitionedById[2].map(i => ([i.epochtime, i.val]))
	var result4 = partitionedById[3].map(i => ([i.epochtime, i.val]))

	console.log("--------print result--------");
	console.log(result1);

	// split into series per cat, time
	pieData = pieData.map(i => ([i.name, i.val]))

	console.log("--------print pie data --------");
	console.log(pieData);

	localStorage["partitionedById"] = JSON.stringify(partitionedById);
	localStorage["result1"] = JSON.stringify(result1);
	localStorage["result2"] = JSON.stringify(result2);
	localStorage["result3"] = JSON.stringify(result3);
	localStorage["result4"] = JSON.stringify(result4);
	localStorage["pieData"] = JSON.stringify(pieData);
});


function f1(callback) {
	// dataset 1
	ourRequest.open('GET', 'http://s3.amazonaws.com/logtrust-static/test/test/data1.json');

	ourRequest.onload = function () {
		if (ourRequest.status >= 200 && ourRequest.status < 400) {
			//var ourData = JSON.parse(ourRequest.responseText);
			// replace category values with upper case
			data1 = JSON.parse(ourRequest.responseText, (key, value) => {
				if (key === 'cat') {
					return value.toUpperCase();
				}
				return value;
			});
			// rename d key
			data1.forEach(obj => renameKey(obj, 'value', 'val'));
			data1.forEach(obj => convertEpoch(obj, 'd', 'myDate'));
			console.log("----- Print data1.json -----");
			console.log(data1);
			callback(data1);
		}
		else {
			console.log('We connected to the server but it returned an error');
		}
	};

	ourRequest.onerror = function () {
		console.log('Connection Error');
	};

	ourRequest.send();


	// dataset 2
	ourRequest2.open('GET', 'http://s3.amazonaws.com/logtrust-static/test/test/data2.json');

	ourRequest2.onload = function () {
		if (ourRequest2.status >= 200 && ourRequest2.status < 400) {
			//var ourData = JSON.parse(ourRequest2.responseText);
			data2 = JSON.parse(ourRequest2.responseText);
			// rename categ key
			data2.forEach(obj => renameKey(obj, 'categ', 'cat'));
			console.log("----- Print data2.json -----");
			console.log(data2);
			callback(data2);
		}
		else {
			console.log('We connected to the server but it returned an error');
		}
	};

	ourRequest2.onerror = function () {
		console.log('Connection Error');
	};

	ourRequest2.send();


	// dataset 3
	ourRequest3.open('GET', 'http://s3.amazonaws.com/logtrust-static/test/test/data3.json');

	ourRequest3.onload = function () {
		if (ourRequest3.status >= 200 && ourRequest3.status < 400) {
			//var ourData = JSON.parse(ourRequest3.responseText);
			// parse myDate and cat
			data3 = JSON.parse(ourRequest3.responseText, (key, value) => {
				if (key === 'raw') {
					var match = value.match(/.*(\d{4}\-\d{2}\-\d{2}).*#(\w+\s\d)#/);
					value = match[1] + '&&' + match[2];
					return value;
				}
				return value;
			});
			// split raw into myDate and cat
			data3.forEach(obj => splitField(obj, 'raw', '&&', 'myDate', 'cat'));
			console.log("----- Print data3.json -----");
			console.log(data3);
			callback(data3);
		}
		else {
			console.log('We connected to the server but it returned an error');
		}
	};

	ourRequest3.onerror = function () {
		console.log('Connection Error');
	};

	ourRequest3.send();
}



function renameKey(obj, oldKey, newKey) {
	obj[newKey] = obj[oldKey];
	delete obj[oldKey];
}

function convertEpoch(obj, timestamp, newdate) {
	var a = new Date(obj[timestamp]);
	// console.log(a instanceof Date);
	// console.log(a.toLocaleString());
	var formatted = a.toISOString().split('T')[0];
	obj[newdate] = formatted;
	delete obj[timestamp];
}

function splitField(obj, field, delim, f1, f2) {
	var myArray = obj[field].split(delim);
	obj[f1] = myArray[0];
	obj[f2] = myArray[1];
	delete obj[field];
}


function toEpoch(obj, timestamp, newdate) {
	var a = new Date(obj[timestamp]);
	var epochtime = Date.parse(a);
	obj[newdate] = epochtime;
	delete obj[timestamp];
}

// for(let i = 0; i < json.length; i++) {
//     let obj = json[i];
//     console.log(obj.id);
// }

// json.forEach(function(obj) { console.log(obj.id); });
