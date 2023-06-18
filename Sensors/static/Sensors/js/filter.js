async function sendData(page) {
    let csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let sensornames = getSensornames();
    let datatypes = getDatatypes();
    let dates = getDates();
    fetch('api', {
        method: 'post',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
          "sensornames": sensornames,
          "datatypes": datatypes,
          "order_by": "value",
          "page": page,
          "start_date": dates[0],
          "end_date": dates[1]
      })})
      .then(response => response.json())
      .then((data) => {

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
       });
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
    start = start_date + ' ' + start_time;
    end = end_date + ' ' + end_time;
    dates = [start, end];
    return dates;
}


sendData(1);
let checkboxes = document.querySelectorAll('input[type="checkbox"]');
for (let i = 0; i < checkboxes.length; i++) {
  checkboxes[i].checked = true;
}
let applyBtn = document.querySelector('.Apply');
let nextBtn = document.querySelector('.Next');
let prevBtn = document.querySelector('.Prev');
let textInput = document.querySelector('.textInput');
var curPage = parseInt(document.querySelector('.page_count').innerHTML.split('/')[0]);

applyBtn.onclick = function() {
    sendData(curPage);
  }

nextBtn.onclick = function() {
    curPage += 1;
    sendData(curPage);
  }

prevBtn.onclick = function() {
    curPage -= 1;
    sendData(curPage);
  }

textInput.addEventListener("change", function(event) {
    if (textInput.value == '') return;
    curPage = parseInt(textInput.value);
    sendData(curPage);
  });