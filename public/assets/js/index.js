

let table;
let date = new Date();

var ports = [];
const dayOfWeeks = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

let HOST = location.origin.replace(/^http/, 'ws');
let ws = new WebSocket(HOST);

console.log(tab);
ws.onmessage = (event) => {
    console.log('received:' + event)
    var s = event.data;
    var pt = s.indexOf('(');
    var cmd = s.substring(0, pt);
    var data = s.substring(pt + 1, s.length - 1);
    console.log(`received: ${s}`);
    if (cmd == 'connected') ws.send(tab + '()');
    switch (tab) {
        case 'index':
            table = new SupervisorTable('supervisor-table-body');
            switch (cmd) {
                case 'change-row':
                    table.changeRow(data.split(','));
                    break;
                case 'new-row':
                    table.appendRow(data.split(','));
                    break;
                case 'date':
                    date = new Date(parseInt(data));
                    $('#text-date').text(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}. ${dayOfWeeks[date.getDay()]}, ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`);
                    break;
            }

            break;
        case 'manager':
            table = new ManagerTable('manager-table-body');
            switch (cmd) {
                case 'change-row':
                    table.changeRow(data.split(','));
                    break;
                case 'new-row':
                    console.log('New row added')
                    table.appendRow(data.split(','));
                    break;
                case 'id-not-unique':
                    alert(`Lỗi: Trùng địa chỉ thiết bị`);
                    break;

            }
            break;
        case 'setting':

            switch (cmd) {
                case 'ports':
                    console.log(data);
                    $('#serial-ports').empty();
                    if (data == '//') break;
                    var sp = data.indexOf('//');
                    ports = data.substring(0, sp).split(',');
                    var manufacturers = data.substring(sp + 2, data.length).split(',');

                    ports.forEach((port, i) => {
                        $('#serial-ports').append(`<option value="${i}">${port} - ${manufacturers[i]}</option>`);
                    });
                    break;
                case 'serial-connected':
                    $('#text-serial-status').text(`Trạng thái: Đã kết nối module LoRa qua ${data}`);
                    $('#text-serial-status').css('color', 'green');
                    break;
                case 'serial-disconnected':
                    $('#text-serial-status').text(`Trạng thái: Đã ngắt kết nối ${data}`);
                    $('#text-serial-status').css('color', 'red');
                    break;
            }
    }
};

switch (window.location.pathname) {
    case '/setting.html':
        $('#button-serial-connect').click(() => {

            var i = $('#serial-ports').val();
            if (parseInt(i) > -1) {
                ws.send(`serial-connect(${i})`);
                console.log("Send command to connect serial port");
            }
        });

        $('#button-refresh-ports-list').click(() => {
            console.log("Send refresh command.");
            ws.send(`refreshSerial()`);
        });

        break;
    case '/manager.html':
        $('#button-add-device').click(() => {
            var arr = [$('#input-add-device-id').val(), $('#input-add-device-name').val(), $('#input-add-device-period').val()];
            ws.send(`add-device(${arr[0]},${arr[1]},${arr[2]})`);
            console.log(`Send comand add-device(${arr[0]},${arr[1]},${arr[2]})`);
        });
        break;

}

$(function () {
    let chart = document.querySelector('canvas').chart;
    chart.options.elements.point.radius = 0;
    chart.data.datasets[0].fill = false;
    chart.options.hover.animationDuration = 0;
    chart.options.elements.line.tension = 0;
    chart.options.animation.duration = 0;
    chart.type = 'line';
    chart.data.labels = [1, 2, 3, 4, 5, 6, 7];
    chart.data.datasets[0].data = [10, 60, 10, 60, 10, 60, 30];


    $(document).on('click', function () {
        // When the document is clicked, update the chart 
        // with a random value and animate it.

        for (var i = 0; i < 2; i++) {
            
            chart.data.datasets[0].data[i] = Math.random() * 100;
            chart.update({
                duration: 0
            });
        }
    });
});