'use strict';

var tab = 'unknown';

/// mqtt client
const mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://mqtt-sever.herokuapp.com:1883')

client.on('connect', function () {
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  console.log(message.toString())
  client.end()
})


// email
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Haule98dz@gmail.com',
    pass: 'hrconvbqnjhconxf'
  }
});

var mailOptions = {
  from: 'Haule98dz@gmail.com',
  to: '1621060001@student.humg.edu.vn',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};
/*
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
*/

//-----------serial
const SerialPort = require('serialport');

let serial;
let listPorts = [];
let manufacturers = [];
var port;

let com = {
  cmd: "",
  buffer: "",
  param: []
};

/*
Port:  {
  path: 'COM3',
  manufacturer: 'Arduino LLC (www.arduino.cc)',
  serialNumber: '55437333437351E09162',
  pnpId: 'USB\\VID_2341&PID_0043\\55437333437351E09162',    
  locationId: 'Port_#0001.Hub_#0002',
  vendorId: '2341',
  productId: '0043'
}
*/
// = new SerialPort('COM3', {
//  baudRate: 9600
//});
/*
serial.on('data', function (data) {
  console.log('Data:', data.toString());
});*/

//--------express---------
const express = require('express');
const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static('public'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

//----------sqlite-----------
var numberOfDevices = 0;
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

db.run(`CREATE TABLE IF NOT EXISTS "Devices" (
	"ID"	INTEGER,
	"Name"	TEXT NOT NULL UNIQUE,
	"Duration"	INTEGER,
	"Period"	INTEGER,
	PRIMARY KEY("ID")
);`);

//try {
db.get(`SELECT COUNT(*) count FROM Devices;`, [], (err, result) => {
  if (err) {
    console.log(err.message);
  }
  numberOfDevices = result.count;
});
//} catch(err) {
// console.log(err.message);
//}

//-------------websocket----------
const { Server } = require('ws');
const wss = new Server({ server }); //Khởi tạo Websocket sever

wss.on('connection', (ws) => {      //Bắt sự kiện khi kết nối thành công với một client
  console.log('Client connected');

  ws.on('message', (msg) => {
    console.log('received:' + msg)
    var pt = msg.indexOf('(');
    var cmd = msg.substring(0, pt);
    var data = msg.substring(pt + 1, msg.length - 1);
    switch (cmd) {
      case 'index':
        tab = 'index';
        db.each(`SELECT ID id, Name name, Duration duration FROM Devices ORDER BY ID;`, [], (err, row) => {
          if (err) {
            throw err;
          }
          ws.send('new-row(' + row.id + ',' + row.name + ',--,--,' + row.duration + ')');
        });

        break;
      case 'manager':
        tab = 'manager';
        db.each(`SELECT ID id, Name name, Duration duration, Period period FROM Devices ORDER BY ID;`, [], (err, row) => {
          if (err) {
            throw err;
          }
          ws.send(`new-row(${row.id},${row.name},${row.duration},${row.period})`);
        });

        break;
      case 'setting':
        tab = 'setting';
        SerialPort.list().then(function (ports) {
          ports.forEach(el => {
            listPorts = [];
            manufacturers = [];
            listPorts.push(el.path);
            manufacturers.push(el.manufacturer);
          });
          ws.send(`ports(${listPorts.toString()}//${manufacturers.toString()})`);
        });

        break;
      case 'serial-connect':
        var comport = listPorts[parseInt(data)];
        console.log(comport);
        serial = new SerialPort(comport, {
          baudRate: 9600
        });
        serial.on('open', () => {
          ws.send(`serial-connected(${comport}})`);
          setInterval(() => {
            serial.write(`get(1);`);
            console.log('Send get cmd to serial');
          }, 1000);
        });

        serial.on('close', () => {
          ws.send(`serial-disconnected(${comport}})`);
        });
        serial.on('data', function (serialData) {    //receiving data
          com.buffer += serialData;
          console.log(com.buffer);
          var p2 = com.buffer.indexOf(';');
          if (p2 != -1) {
            var p1 = com.buffer.indexOf('(');
            if (p1 != -1) {

              com.cmd = com.buffer.substring(0, p1);
              com.param = com.buffer.substring(p1 + 1, p2 - 1).split(',')
              switch (com.buffer.substring(0, p1)) {
                case 'stt':
                  /*var sql = `UPDATE Devices
                  SET  = (?)
                  WHERE id = id_value;`;
                  db.run(sql, params, function(err){
                    // 
                  });*/

                  if (tab == 'index') {
                    wss.clients.forEach((ws) => {
                      ws.send(`change-row(${com.param[0]},${com.param[1] == 0 ? 0 : 1},${com.param[1]})`);
                    });
                    console.log('change-row');
                  }
              }
            }
            com.buffer = com.buffer.substring(p2 + 1, com.buffer.length)
          }
        });

        console.log(`serial open: ${comport}`);
        serial.on('error', function (err) {          // error occur
          console.log('Error: ', err.message);
          ws.send(`serial-error(${err.message})`);
        })

        break;
      case 'refreshSerial':
        SerialPort.list().then(function (ports) {
          ports.forEach(el => {
            listPorts = [];
            manufacturers = [];
            listPorts.push(el.path);
            manufacturers.push(el.manufacturer);
          });
          ws.send(`ports(${listPorts.toString()}//${manufacturers.toString()})`);
        });
        break;
      case 'add-device':
        var arr = data.split(',');
        console.log(arr.toString())
        db.run(`INSERT INTO Devices(ID, Name, Duration, Period) VALUES((?),(?),(?),(?))`, [arr[0], arr[1], 0, arr[2]], function (err) {
          if (err) {
            if (err.message == 'SQLITE_CONSTRAINT: UNIQUE constraint failed: Devices.ID') {
              ws.send(`id-not-unique(${arr[0]})`);
            }
            return console.log(err.message);
          } else {
            console.log(`A row has been inserted with id ${arr[0]}`);
            console.log(arr.toString());
            ws.send(`new-row(${arr[0]},${arr[1]},0,${arr[2]})`)
          }
        });
        break;

    }

  });
  ws.send('connected()');
  ws.on('close', () => console.log('Client disconnected'));  //Bắt sự kiện khi client đó ngắt kết nối
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(`date(${new Date().getTime()})`);


  });
}, 1000);
