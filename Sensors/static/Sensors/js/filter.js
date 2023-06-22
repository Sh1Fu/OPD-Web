async function sendData(page) {
    let sensornames = getSensornames();
    let datatypes = getDatatypes();
    let dates = getDates();
    if (page == 0) {
      fetch('api/table_filter', {
        method: 'post',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
          "sensornames": sensornames,
          "datatypes": datatypes,
          "order_by": order_by,
          "page": page,
          "start_date": dates[0],
          "end_date": dates[1]
      })})
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    });
    }
    else {
      fetch('api/table_filter', {
        method: 'post',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
          "sensornames": sensornames,
          "datatypes": datatypes,
          "order_by": order_by,
          "page": page,
          "start_date": dates[0],
          "end_date": dates[1]
      })})
      .then(response => response.json())
      .then((data) => {
          if (data.hasOwnProperty("data") && Array.isArray(data.data) && data.data.length > 0) {
            let page_count = document.querySelector('.page_count');
            page_count.innerHTML = `${data.cur_page}/${data.page_count}`;
            console.log(data);            
            let infoTable = data.data;
            infoTable = changeDate(infoTable);
            let tr;
            for (let i = 0; i < infoTable.length; i++) {
              tr = document.getElementById(i);
              for (let key in infoTable[i]) {
                  td = tr.querySelector(`td#${key}`);
                  td.innerText = infoTable[i][key];
              }
            }
          }
          else {
            alert("База данных не содержит данные, подходящие под заданные условия");
          }
       });
    }
    
}


function changeDate(infoTable) {
    for (let i = 0; i < infoTable.length; i++) {
        infoTable[i].date = infoTable[i].date.replace('T', ' ');
        infoTable[i].date = infoTable[i].date.replace('Z', '');
        infoTable[i].date = infoTable[i].date.replace(/-/g, '.');
    }
    return infoTable;
}


function getSensornames() {
    let checkboxes = document.querySelector(".sensornames");
    let checked = checkboxes.querySelectorAll('input[type="checkbox"]:checked');
    let sensors = [];
    for (let i = 0; i < checked.length; i++) {
        sensors.push(checked[i].value);
    }
    return sensors;
}

function getDatatypes() {
    let checkboxes = document.querySelector(".datatypes");
    let checked = checkboxes.querySelectorAll('input[type="checkbox"]:checked');
    let datatypes = [];
    for (let i = 0; i < checked.length; i++) {
        datatypes.push(checked[i].value);
    }
    return datatypes;
}


function getDates() {
    start_date = document.querySelector('input[type="date"].start').value;
    end_date = document.querySelector('input[type="date"].end').value;
    start_time = document.querySelector('input[type="time"].start').value;
    end_time = document.querySelector('input[type="time"].end').value;
    if (start_date == '' || end_date == '' || start_time == '' || end_time == '') return '';
    start = start_date + ' ' + start_time;
    end = end_date + ' ' + end_time;
    dates = [start, end];
    return dates;
}


function title_handler(order) {
  order_by = order;
  let id = document.querySelector(`.sort-by#${order}`).id;
  if (id[0] == '-') {
    document.querySelector(`.sort-by#${order}`).id = order.substring(1);
  }
  else {
    document.querySelector(`.sort-by#${order}`).id = `-${order}`;
  }

  sendData(curPage);
}


let checkboxes = document.querySelectorAll('input[type="checkbox"]');
for (let i = 0; i < checkboxes.length; i++) {
  checkboxes[i].checked = true;
}
var order_by="date";
let applyBtn = document.querySelector('.Apply');
let nextBtn = document.querySelector('.Next');
let prevBtn = document.querySelector('.Prev');
let textInput = document.querySelector('.textInput');
let downloadBtn = document.querySelector('.download-btn');
var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
var curPage = parseInt(document.querySelector('.page_count').innerHTML.split('/')[0]);
setTimeout(500);
sendData(1);

applyBtn.onclick = function() {
    sendData(curPage);
  }

nextBtn.onclick = function() {
    curPage += 1;
    sendData(curPage);
  }

prevBtn.onclick = function() {
  if (curPage === 1) return
    curPage -= 1;
    sendData(curPage);
  }

  downloadBtn.onclick = function() {
    sendData(0);
  }

textInput.addEventListener("change", function(event) {
    if (textInput.value == '') return;
    if (textInput.value == 0) {
      alert("База данных не содержит данные, подходящие под заданные условия");
      return
    }
    curPage = parseInt(textInput.value); 
    sendData(curPage);
  });