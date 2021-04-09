var tab = 'unknown';
function indexOnload() {
    tab = 'index';
}
function settingOnload() {
    tab = 'setting';
}
function managerOnload() {
    tab = 'manager';
}

class TableBody {
    constructor(id) {
        this.id = id;
    }

    empty() {
        $('#' + this.id).empty();
    }

}
class SupervisorTable extends TableBody {
    constructor(id) {
        super(id)
    }


    appendRow(arr) {
        var s = '<tr>';
        s = s + `<td id="id${arr[0]}">${arr[0]}</td>`;
        if (arr[1] != 'nc') s = s + `<td id="name${arr[0]}">${arr[1]}</td>`;
        if (arr[2] != 'nc') s = s + `<td id="state${arr[0]}" style="font-weight:bold; color="${arr[2] == '1' ? 'green' : 'black'}";">${arr[2] == 1 ? 'On' : 'Off'}</td>`;
        if (arr[3] != 'nc') s = s + `<td id="current${arr[0]}">${arr[3]}</td>`;
        if (arr[4] != 'nc') s = s + `<td id="duration${arr[0]}">${arr[4]}</td>`;
        s += '</tr>';
        $('#' + this.id).append(s);
    }

    changeRow(arr) {
        if (arr[1] != 'nc') {
            $('#state' + arr[0]).text(arr[1] == 1 ? 'On' : 'Off');
            $('#state' + arr[0]).css('color', arr[1] == '1' ? 'green' : 'black');
        }
        if (arr[2] != 'nc') $('#current' + arr[0]).text(arr[2]);
        if (arr[3] != 'nc') $('#duration' + arr[0]).text(arr[3]);
    }

}

class ManagerTable extends TableBody {
    constructor(id) {
        super(id)
    }

    appendRow(arr) {
        var s = '<tr>';
        s = s + `<td id="id${arr[0]}">${arr[0]}</td>`;
        if (arr[1] != 'nc') s = s + `<td id="name${arr[0]}">${arr[1]}</td>`;
        if (arr[2] != 'nc') s = s + `<td id="duration${arr[0]}">${arr[2]}</td>`;
        if (arr[3] != 'nc') s = s + `<td id="period${arr[0]}">${arr[3]}</td>`;
        s += '</tr>';
        $('#' + this.id).append(s);
    }

    changeRow(arr) {
        if (arr[1] != 'nc') $('#name' + arr[0]).text(arr[1]);
        if (arr[2] != 'nc') $('#duration' + arr[0]).text(arr[2]);
        if (arr[3] != 'nc') $('#period' + arr[0]).text(arr[3]);
    }

}