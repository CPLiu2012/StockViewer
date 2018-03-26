var _TSGConst = {
    width: 2400,
    height: 1260,
    top: 30,
    bottom: 150,
    unitV: 210,
    unitH: 300,
    timeAmt: 240
};

var _globalDataObj = { stocks: { sz002419: { market: { priceYC: 19.97 } } } };
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
    money_flow: "http://qt.gtimg.cn/q=ff_",
    //盘口信息, 返回v_s_pksz000858=""
    position_analysis: "http://qt.gtimg.cn/q=s_pk",
    //实时成交量明细,返回v_detail_data_sh600519, 参数p为页码
    position_analysis: "http://stock.gtimg.cn/data/index.php?appn=detail&action=data&c=sh600519&p=2"
};

function startRefereshTimeSharing() {
    var stockId = $('#stockInfoModal').attr('data-stockid');
    $.ajax({
        url: _dataURL.timeSharing_plans,
        dataType: "script",
        cache: "false",
        type: "GET",
        context: this,
        success: function () {
            redrawTimeSharing();
        },
        error: function () { }
    });
}

function calcPriceUnit(stockId) {
    var tmpArr = window.min_data.split('\n');
    var graphData = [];
    var tmpItemArr, tmpPrice, tmpAmount;
    var maxPrice = 0, minPrice = 0, maxAmt = 0; minAmt = 0;
    for (var i = 0; i < tmpArr.length; i++) {
        tmpItemArr = tmpArr[i].split(' ');
        if (tmpItemArr.length == 3) {
            tmpPrice = parseFloat(tmpItemArr[1]);
            tmpAmount = parseInt(tmpItemArr[2]);
            maxPrice = Math.max(maxPrice, tmpPrice);
            minPrice = Math.max(minPrice, tmpPrice);
            maxAmt = Math.max(maxAmt, tmpAmount);
            minAmt = Math.max(minAmt, tmpAmount);
            graphData.push({ time: tmpItemArr[0], price: tmpPrice, amount: tmpAmount });
        }
    }

    var stockObj = _globalDataObj.stocks[stockId];
    var priceYC = stockObj.market.priceYC;
    var priceUnit = ((Math.abs(maxPrice - priceYC) > Math.abs(priceYC - minPrice) ? maxPrice : minPrice) - priceYC) / 3;
    maxPrice = priceYC + priceUnit * 3;
    minPrice = priceYC - priceUnit * 3;
    var maxRate = (maxPrice - priceYC) / priceYC * 100;
    var minRate = (priceYC - minPrice) / priceYC * 100;
    return { minP: minPrice, maxP: maxPrice, minR: minRate, maxR: maxRate, unitP: priceUnit };
};

function drawCoordinate() {
    var canvasBg = $(".canvas-time-sharing.graph-bg")[0];
    var cxtBg = canvasBg.getContext("2d");
    cxtBg.lineWidth = 3;
    cxtBg.strokeStyle = "#acacac";//"#e8e8e8";
    var tmpX = 0;
    var tmpY = 0;
    for (var i = 0; i < 7; i++) {
        cxtBg.moveTo(tmpX, tmpY);
        cxtBg.lineTo(tmpX + _TSGConst.width, tmpY);
        tmpY += _TSGConst.unitV;
        cxtBg.stroke();
    }

    var tmpX = _TSGConst.unitH;
    var tmpY = 0;
    for (var i = 0; i < 7; i++) {
        cxtBg.moveTo(tmpX, tmpY);
        cxtBg.lineTo(tmpX, tmpY + _TSGConst.height);
        tmpX += _TSGConst.unitH;
        cxtBg.stroke();
    }
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
    canvasWrap.width(table.width());
    canvasWrap.height(table.height());
    canvasWrap.css('top', unitH + 'px');
    canvasWrap.css('left', unitW + 'px');
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

var _globalTotalMinute = 240;
function redrawTimeSharing() {
    var calcObj = calcPriceUnit($('#stockInfoModal').attr('data-stockid'));
}
