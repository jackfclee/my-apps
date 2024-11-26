function onLoaded() {
  if (typeof urls === 'undefined') {
    alert("ERROR: urls variable is not ready. Please check HK_StockQuote3_data.js.");
    return;
  }
  if (typeof categories === 'undefined') {
    alert("ERROR: categories variable is not ready. Please check HK_StockQuote3_data.js.");
    return;
  }
  createList("chartlist", urls);
  createList("stocklist", categories);
  document.getElementById("chartlist").selectedIndex = 3;
  document.getElementById("stocklist").selectedIndex = 1;
  onChanged();
}

function onChanged() {
  var x = document.getElementById("chartlist");
  var y = document.getElementById("stocklist");
  if (x.selectedIndex == 0) {
    y.disabled = true;
  } else {
    y.disabled = false;
    if (y.selectedIndex > 0) {
      var id = document.getElementById("resultpanel");
      if (typeof categories[y.selectedIndex-1].stocks  !== 'undefined') {
        generateCharts(id,
          urls[x.selectedIndex-1].url,
          categories[y.selectedIndex-1].stocks);
      }
    }
  }
}

function createList(id, data) {
  var i;
  var x = document.getElementById(id);
  for (i=0; i<data.length; i++) {
    var o = document.createElement("option");
    if (data[i].name == "---") {
      o.text = "------------------";
    } else {
      o.text = data[i].name;
    }
    x.add(o);
  }
}

function generateCharts(id, url, stocks) {
  var result = '';
  for (i=0; i<stocks.length; i++) {
    result += '<img src="' + url + stocks[i] + '"/>';
  }
  id.innerHTML = result;
}
