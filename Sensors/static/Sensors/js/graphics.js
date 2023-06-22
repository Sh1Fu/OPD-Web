function add_listeners()
{
  var sensornames = ['W-520D', 'MQ-135', 'BMP280', 'SW-18015P', 'DHT11', 'BMP180', 'GY-521', 'MQ-5'];
        var list1 = document.getElementById("sensornames_list");
        for(var i = 0; i < sensornames.length; i++) {
            var option = document.createElement('option');
            option.text = option.value = sensornames[i];
            list1.add(option, 0);
        }
        
        list1.addEventListener('click', first_list);
        document.getElementById("parametrs_list").addEventListener('click',second_list);
        document.getElementById("positions_list").addEventListener('click',third_list);
}
async function first_list()
{
  document.getElementById("parametrs_list").innerHTML = "";
  var datatypes = [];
  fetch('api/update_filters',{
            method: 'post',
            headers: {'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value},
            body: JSON.stringify({
              "sensorname": document.getElementById("sensornames_list").value
          })})
          .then(response => response.json())
          .then((data) =>  {
          datatypes = data.datatypes;
          var list2 = document.getElementById("parametrs_list");
          for(var i = 0; i < datatypes.length; i++) {
            var option = document.createElement('option');
            option.text = option.value = datatypes[i];
            list2.add(option, 0);
        }
        document.getElementById("parametrs_list").disabled = "";
  })
}
async function second_list()
{
  document.getElementById("positions_list").innerHTML = "";
  var positions = [];
  fetch('api/update_filters',{
            method: 'post',
            headers: {'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value},
            body: JSON.stringify({
              "sensorname": document.getElementById("sensornames_list").value,
              "datatype": document.getElementById("parametrs_list").value
          })})
          .then(response => response.json())
          .then((data) =>  {
          positions = data.positions;
          var list3 = document.getElementById("positions_list");
          for(var i = 0; i < positions.length; i++) {
            var option = document.createElement('option');
            option.text = option.value = positions[i];
            list3.add(option, 0);
        }
        document.getElementById("positions_list").disabled = "";

  })
}
async function third_list()
{
  getRecords(document.getElementById('sensornames_list').value,
    document.getElementById('positions_list').value,document.getElementById('parametrs_list').value,);
}

function changeDate(datestr) {
    datestr = datestr.replace('T', ' ');
    datestr = datestr.replace('Z', '');
    datestr = datestr.replace(/-/g, '.');
    return datestr;
}

function makeChart(dates,vals){
  var ctx = document.getElementById('line-chart');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels:dates,
      datasets: [
        {
          label: 'Точное значение записи',
          data: vals,
          borderWidth: 3,
          fill:false,
          borderColor: '#36A2EB',
          backgroundColor: '#9BD0F5',
          pointRadius:1
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        xAxes: [ {
          ticks: {
            maxTicksLimit: dates.length % 21
          }
        }]
    }
  },
  })
}

async function getRecords(sensname,pos,type){
  let csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  let dates = [];
  let values = [];
  fetch('api/sensor_records', {
          method: 'post',
      headers: {'X-CSRFToken': csrftoken},
          body: JSON.stringify({
            "sensorname": sensname,
            "position": pos,
            "datatype": type
        })})
        .then(response => response.json())
        .then((data) =>  {
          console.log(data);
          if (data.hasOwnProperty("records") && Array.isArray(data.records) && data.records.length > 0) 
          {
            for(i = 0; i < data.records.length; i++)
            {
                dates.push(changeDate(data.records[i]["date"]));
                values.push(data.records[i]["value"]);
            }
            console.log(dates);
            console.log(values);
            makeChart(dates,values); 
        }
    });
  }

add_listeners();