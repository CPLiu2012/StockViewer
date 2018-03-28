var _TSGConst = {
    width: 2400,
    height: 1260,
    top: 30,
    bottom: 150,
    unitV: 210,
    unitH: 300,
    timeAmt: 240
};

var _currCalcResult = { min: 0, max: 0, maxAmt: 0, minAmt: 0, unit: 0, priceYC: 0, datas: [], date: '', name: '' };

var _globalDataObj = { stocks: { sz002419: { market: { name: '天虹股份', priceYC: 20.51 } } } };
/*URL For Get Data*/
var _dataURL = {
    //当前信息, 返回v_sz000858=""
    detail_now: "http://qt.gtimg.cn/q=",
    //当前简要信息, 返回v_s_sz000858=""
    detail_now_simple: "http://qt.gtimg.cn/q=s_sz000001",
    //分时, 返回min_data=""
    timeSharing_plans: "http://data.gtimg.cn/flashdata/hushen/minute/sz002419.js",
    //五天分时图
    timeSharing_plans_5d: "http://data.gtimg.cn/flashdata/hushen/4day/sz/sz000002.js",
    //日K, 返回daily_data_13=""
    k_line_d: "http://data.gtimg.cn/flashdata/hushen/daily/13/sz000002.js",
    //最近日K, 返回latest_daily_data=""
    k_line_d: "http://data.gtimg.cn/flashdata/hushen/latest/daily/sz000002.js",
    //周K, 返回weekly_data=""
    k_line_w: "http://data.gtimg.cn/flashdata/hushen/weekly/",
    //月K, 返回monthly_data=""
    k_line_m: "http://data.gtimg.cn/flashdata/hushen/monthly/",
    //资金流向, 返回v_ff_sz000858=""
    money_flow: "http://qt.gtimg.cn/q=ff_sz000858",
    //盘口信息, 返回v_s_pksz000858=""
    position_analysis: "http://qt.gtimg.cn/q=s_pk",
    //实时成交量明细,返回v_detail_data_sh600519, 参数p为页码
    position_analysis: "http://stock.gtimg.cn/data/index.php?appn=detail&action=data&c=sh600519&p=2"
};

function initEvent() {
    $(".canvas-time-sharing.graph-hover").on('mouseenter', function () {
        $(".canvas-time-sharing.graph-hover").on('mousemove', refereshHoverLabel);
    });

    $(".canvas-time-sharing.graph-hover").on('mouseleave', function () {
        $(".canvas-time-sharing.graph-hover").unbind('mousemove');
    });
};

function refereshHoverLabel(eventObj) {
    var canvas = $(".canvas-time-sharing.graph-hover");
    var tmpY = _TSGConst.height / canvas.height() * eventObj.offsetY;
    var tmpX = _TSGConst.width / canvas.width() * eventObj.offsetX;
    var ctx = canvas[0].getContext("2d");
    canvas.attr('height', _TSGConst.height);
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 5]);
    ctx.strokeStyle = "#000000";//"#e8e8e8";    
    ctx.moveTo(0, tmpY);
    ctx.lineTo(_TSGConst.width, tmpY);
    ctx.moveTo(tmpX, 0);
    ctx.lineTo(tmpX, _TSGConst.height);
    ctx.stroke();

    var tmpDateTime, tmpIdx, tmpData, tmpAvg, tmpRate, tmpColor;
    var tmpValue = (_currCalcResult.max - _currCalcResult.min) / _TSGConst.height;
    tmpValue = _currCalcResult.max - tmpValue * (tmpY);
    var tmpLabel = $('.TSG-canvas-wrap .coord-label-TSG.hover-price-label');
    tmpLabel.text(tmpValue.toFixed(2));
    tmpLabel.css('top', (eventObj.offsetY - 8) + 'px');
    tmpLabel.css('left', '-50px');

    tmpValue = (tmpValue - _currCalcResult.priceYC) / _currCalcResult.priceYC * 100;
    var tmpLabel = $('.TSG-canvas-wrap .coord-label-TSG.hover-rate-label');
    tmpLabel.text(tmpValue.toFixed(2) + '%');
    tmpLabel.css('top', (eventObj.offsetY - 8) + 'px');
    tmpLabel.css('left', (canvas.width() + 10) + 'px');

    var tmpLabel = $('.TSG-canvas-wrap .coord-label-TSG.hover-time-label');
    tmpDateTime = formatHoverTimeLabelText(tmpX);
    tmpLabel.text(tmpDateTime);
    tmpLabel.css('top', canvas.height() + 'px');
    tmpLabel.css('left', (eventObj.offsetX - 70) + 'px');

    var tmpLabel = $('.TSG-canvas-wrap .coord-label-TSG.hover-detail-label');
    tmpLabel.css('left', tmpX < _TSGConst.width / 2 ? '5px' : ((canvas.width() - tmpLabel.width() - 15) + 'px'));

    $('.TSG-hover-detail-table  .TSG-hover-detail-label-name').text(_currCalcResult.name);
    $('.TSG-hover-detail-table  .TSG-hover-detail-label-date').text(tmpDateTime);
    tmpIdx = Math.ceil(_TSGConst.timeAmt / _TSGConst.width * tmpX);
    if (tmpIdx < _currCalcResult.datas.length) {
        tmpData = _currCalcResult.datas[tmpIdx];
        tmpColor = tmpData.price == _currCalcResult.priceYC ? 'rgb(0,0,0)' : tmpData.price > _currCalcResult.priceYC ? 'rgb(241,18,0)' : 'rgb(0,168,0)';
        $('.TSG-hover-detail-table  .TSG-hover-detail-label-price').text(tmpData.price.toFixed(2)).css('color', tmpColor);
        $('.TSG-hover-detail-table  .TSG-hover-detail-label-amount').text(tmpData.amount);
        $('.TSG-hover-detail-table  .TSG-hover-detail-label-average').text(tmpData.avg.toFixed(2));
        tmpValue = tmpData.price - _currCalcResult.priceYC;
        tmpRate = tmpValue / _currCalcResult.priceYC * 100;
        $('.TSG-hover-detail-table  .TSG-hover-detail-label-rate').text(tmpValue.toFixed(2) + ' (' + tmpRate.toFixed(2) + '%)').css('color', tmpColor);
    }
};

function formatHoverTimeLabelText(offsetX) {
    var tmpValue = Math.ceil(_TSGConst.timeAmt / _TSGConst.width * offsetX);
    tmpValue = tmpValue < 120 ? 60 * 9 + 30 + tmpValue : 60 * 13 + tmpValue - 120;
    tmpValue = PrefixInteger(Math.floor(tmpValue / 60), 2) + ':' + PrefixInteger(tmpValue % 60, 2);
    var tmpDate = new Date('20' + _currCalcResult.date.substr(0, 2) + '-' + _currCalcResult.date.substr(2, 2) + '-' + _currCalcResult.date.substr(4));
    var tmpDay = '';
    switch (tmpDate.getDay()) {
        case 1:
            tmpDay = ' 一 ';
            break;
        case 2:
            tmpDay = ' 二 ';
            break;
        case 3:
            tmpDay = ' 三 ';
            break;
        case 4:
            tmpDay = ' 四 ';
            break;
        case 5:
            tmpDay = ' 五 ';
            break;
    }

    return tmpDate.toLocaleDateString() + tmpDay + tmpValue;
}

function startRefereshTimeSharing() {
    //var stockId = $('#stockInfoModal').attr('data-stockid');
    $.ajax({
        url: _dataURL.timeSharing_plans,
        dataType: "script",
        cache: "false",
        type: "GET",
        context: this,
        success: function () {
            var calcObj = calcPriceUnit('sz002419');
            refereshCoordLabel(calcObj);
            redrawTimeSharing(calcObj);
        },
        error: function () { }
    });
};

function calcPriceUnit(stockId) {
    var tmpArr = window.min_data.split('\n');
    var graphData = [];
    var tmpItemArr, tmpPrice, tmpAmount;
    var tmpAvg = _currCalcResult.datas.length == 0 ? 0 : _currCalcResult.datas[_currCalcResult.datas.length - 1].avg;
    var tmpTotal = _currCalcResult.datas.length == 0 ? 0 : _currCalcResult.datas[_currCalcResult.datas.length - 1].totalAmt;
    var totalVal = tmpAvg * tmpTotal;
    for (var i = 2 + _currCalcResult.datas.length; i < tmpArr.length; i++) {
        if (tmpArr[i] != '') {
            tmpItemArr = tmpArr[i].split(' ');
            tmpPrice = parseFloat(tmpItemArr[1]);
            tmpTotal = parseInt(tmpItemArr[2]);
            tmpAmount = tmpTotal - (_currCalcResult.datas.length == 0 ? 0 : _currCalcResult.datas[_currCalcResult.datas.length - 1].totalAmt);
            totalVal += tmpPrice * tmpAmount;
            tmpAvg = totalVal / tmpTotal;
            _currCalcResult.max = _currCalcResult.max == 0 ? tmpPrice : Math.max(_currCalcResult.max, tmpPrice);
            _currCalcResult.min = _currCalcResult.min == 0 ? tmpPrice : Math.min(_currCalcResult.min, tmpPrice);
            _currCalcResult.maxAmt = _currCalcResult.maxAmt == 0 ? tmpAmount : Math.max(_currCalcResult.maxAmt, tmpAmount);
            _currCalcResult.minAmt = _currCalcResult.minAmt == 0 ? tmpAmount : Math.min(_currCalcResult.minAmt, tmpAmount);
            _currCalcResult.datas.push({ time: tmpItemArr[0], price: tmpPrice, amount: tmpAmount, totalAmt: tmpTotal, avg: tmpAvg });
        }
    }

    _currCalcResult.date = _currCalcResult.date == '' ? tmpArr[1].split(':')[1] : _currCalcResult.date;
    _currCalcResult.priceYC = _currCalcResult.priceYC == 0 ? _globalDataObj.stocks[stockId].market.priceYC : _currCalcResult.priceYC;
    _currCalcResult.name = _currCalcResult.name == '' ? _globalDataObj.stocks[stockId].market.name : _currCalcResult.name;
    _currCalcResult.unit = Math.abs((Math.abs(_currCalcResult.max - _currCalcResult.priceYC) > Math.abs(_currCalcResult.priceYC - _currCalcResult.min) ? _currCalcResult.max : _currCalcResult.min) - _currCalcResult.priceYC) / 3;
    _currCalcResult.max = _currCalcResult.priceYC + _currCalcResult.unit * 3;
    _currCalcResult.min = _currCalcResult.priceYC - _currCalcResult.unit * 3;
};

function adjustCoordSize() {
    var table = $('#TSG_Wrap_Table');
    table.width(table.parent().width());
    table.height(table.parent().height());
    var unitW = table.width() / 10;
    var unitH = table.height() / 8;
    $('#TSG_Wrap_Table .TSG-wrap-top-cell').height(unitH);
    $('#TSG_Wrap_Table .TSG-wrap-bottom-cell').height(unitH);
    $('#TSG_Wrap_Table .TSG-coord-label-cell-price').width(unitW);
    $('#TSG_Wrap_Table .TSG-coord-label-cell-rate').width(unitW);
    var priceLabels = $('.TSG-coord-label-wrap .coord-label-TSG.price-label');
    var rateLabels = $('.TSG-coord-label-wrap .coord-label-TSG.rate-label');
    var tmpLineHeight = parseInt($('.coord-label-TSG').css('line-height'));
    var tmpOffset, tmpColor;
    for (var i = 0; i < 7; i++) {
        tmpOffset = i == 0 ? 0 : i == 6 ? (unitH * 6 - tmpLineHeight) : unitH * i - tmpLineHeight / 2;
        tmpColor = i == 3 ? 'rgb(0,0,0)' : i < 3 ? 'rgb(241,18,0)' : 'rgb(0,168,0)';
        $(priceLabels[i]).css('top', tmpOffset + 'px');
        $(priceLabels[i]).text(i + '.' + i + '' + i);
        $(priceLabels[i]).css('color', tmpColor);
        $(rateLabels[i]).css('top', tmpOffset + 'px');
        $(rateLabels[i]).text(i + '.' + i + '' + i + '%');
        $(rateLabels[i]).css('color', tmpColor);
    }

    var timeLabels = $('.TSG-coord-label-wrap .coord-label-TSG.time-label');
    var timeStrs = ['09:30', '10:30', '13:00', '14:00', '15:00'];
    $('.TSG-coord-label-wrap.time-label-wrap').width(unitW * 8).height(unitH).css('top', '0px').css('left', unitW + 'px');
    for (var i = 0; i < 5; i++) {
        tmpOffset = i == 0 ? 0 : i == 4 ? unitW * i * 2 - 35 : unitW * i * 2 - 17;
        $(timeLabels[i]).css('top', '2px');
        $(timeLabels[i]).css('left', tmpOffset + 'px');
        $(timeLabels[i]).text(timeStrs[i]);
    }

    table = $('#TSG_Coord_Table');
    var canvasWrap = $('.TSG-canvas-wrap');
    var width = table.width();
    var height = table.height()
    canvasWrap.width(width);
    canvasWrap.height(height);
    canvasWrap.css('top', unitH + 'px');
    canvasWrap.css('left', unitW + 'px');
    $(".canvas-time-sharing.graph-line").width(width);
    $(".canvas-time-sharing.graph-line").height(height);
    $(".canvas-time-sharing.graph-hover").width(width);
    $(".canvas-time-sharing.graph-hover").height(height);
};

function buildTSGCoordTable() {
    var tbody = $('#TSG_Coord_Table tbody');
    var tmpHTMLArr = [];
    for (var i = 0; i < 6; i++) {
        tmpHTMLArr.push(i == 0 ? '<tr class="coord-first-row">' : i == 3 ? '<tr class="coord-middle-row">' : i == 5 ? '<tr class="coord-last-row">' : '<tr>');
        for (var j = 0; j < 8; j++) {
            tmpHTMLArr.push(j == 7 ? '<td class="coord-cell coord-end-cell"></td>' : '<td class="coord-cell"></td>');
        }
        tmpHTMLArr.push('</tr>');
    }

    tbody.append($(tmpHTMLArr.join('')));
    $('#TSG_Coord_Table .coord-cell').width($('#TSG_Coord_Table').width() / 8);
    $('#TSG_Coord_Table .coord-cell').height($('#TSG_Coord_Table').height() / 6);
};

function refereshCoordLabel() {
    var priceLabels = $('#TSG_Wrap_Table .TSG-coord-label-wrap .coord-label-TSG.price-label');
    var rateLabels = $('#TSG_Wrap_Table .TSG-coord-label-wrap .coord-label-TSG.rate-label');
    var tmpValue;
    for (var i = 0; i < 7; i++) {
        tmpValue = _currCalcResult.max - _currCalcResult.unit * i;
        $(priceLabels[i]).text(tmpValue.toFixed(2));
        tmpValue = (tmpValue - _currCalcResult.priceYC) / _currCalcResult.priceYC * 100;
        $(rateLabels[i]).text(tmpValue.toFixed(2) + '%');
    }
};

function redrawTimeSharing() {
    var unitH = Math.floor(_TSGConst.height / ((_currCalcResult.max - _currCalcResult.min) * 100));
    var unitW = Math.floor(_TSGConst.width / _TSGConst.timeAmt);
    var canvas = $(".canvas-time-sharing.graph-line");
    canvas.attr('height', _TSGConst.height);
    var ctx = canvas[0].getContext("2d");
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.strokeStyle = "#3798d4";
    var tmpX = 0;
    var tmpY = _TSGConst.height - Math.floor((_currCalcResult.datas[0].price - _currCalcResult.min) * 100) * unitH;
    ctx.moveTo(tmpX, tmpY);
    for (var i = 0; i < _currCalcResult.datas.length; i++) {
        tmpX = unitW * i;
        tmpY = _TSGConst.height - Math.floor((_currCalcResult.datas[i].price - _currCalcResult.min) * 100) * unitH;
        ctx.lineTo(tmpX, tmpY);
    }

    ctx.stroke();
    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.strokeStyle = '#2d2d2d';//'#f11200','#00a800';
    tmpX = 0;
    tmpY = _TSGConst.height - Math.floor((_currCalcResult.datas[0].avg - _currCalcResult.min) * 100) * unitH;
    ctx.moveTo(tmpX, tmpY);
    for (var i = 0; i < _currCalcResult.datas.length; i++) {
        tmpX = unitW * i;
        tmpY = _TSGConst.height - Math.floor((_currCalcResult.datas[i].avg - _currCalcResult.min) * 100) * unitH;
        ctx.lineTo(tmpX, tmpY);
    }

    ctx.stroke();
    ctx.beginPath();
    var barWidth = _TSGConst.width / _TSGConst.timeAmt / 2;
    var maxAmt = Math.ceil(_currCalcResult.maxAmt / 100) * 100;
    var unitAmt = _TSGConst.height / 6 * 2 / maxAmt;
    var tmpOffset = _TSGConst.height / canvas.height() * 3;
    ctx.fillStyle = "#dddddd";
    for (var i = 0; i < _currCalcResult.datas.length; i++) {
        ctx.fillRect(unitW * i, _TSGConst.height - unitAmt * _currCalcResult.datas[i].amount, barWidth, unitAmt * _currCalcResult.datas[i].amount-tmpOffset);
    }
};

function PrefixInteger(num, length) {
    return (Array(length).join('0') + num).slice(-length);
}
