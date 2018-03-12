var _globalDataObj = {
    list: [],
    stocks: {},
    stockIds: "",
};

var _historyDoc = null;

var _dataURL = {
    //当前信息, 返回v_sz000858=""
    detail_now: "http://qt.gtimg.cn/q=",
    //当前简要信息, 返回v_s_sz000858=""
    detail_now_simple: "http://qt.gtimg.cn/q=s_sz000001",
    //分时, 返回min_data=""
    timeSharing_plans: "http://data.gtimg.cn/flashdata/hushen/minute/sz000001.js",
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

var _dataURLSina = {
    //关键字查询, 返回suggestvalue=""
    stock_search: "http://suggest3.sinajs.cn/suggest/type=11&key=",
    //当前信息, 返回hq_str_sh601006=""
    detail_now: "http://hq.sinajs.cn/list=sh601006",
    //分时图
    timeSharing_plans: "http://image.sinajs.cn/newchart/min/n/",
    //日K图
    k_line_d: "http://image.sinajs.cn/newchart/daily/n/",
    //周K图, 返回weekly_data=""
    k_line_w: "http://image.sinajs.cn/newchart/weekly/n/",
    //月K图, 返回monthly_data=""
    k_line_m: "http://image.sinajs.cn/newchart/monthly/n/"
};

var _intervalForRefMainTB = '';
var _intervalForRefStockInfo = '';
var _intervalForRefTimeSharingPlans = '';

function _loadStockList() {
    _historyDoc = $(LoadXMLFile('recordData.xml'));
    var stockEls = _historyDoc.find('stock');
    var stockIds = [];
    var stockId, symbol;
    for (var i = 0; i < stockEls.length; i++) {
        stockId = $(stockEls[i]).attr('id');
        symbol = $(stockEls[i]).attr('symbol');
        _globalDataObj.stockIds += _globalDataObj.stockIds.indexOf(stockId) < 0 ? stockId + "," : "";
        _globalDataObj.list.push({ id: stockId, symbol: symbol });
        if (typeof _globalDataObj.stocks[stockId] == 'undefined' || _globalDataObj.stocks[stockId] == null) {
            StockLoader.history(stockId);
        }
    }

    $.ajax({
        url: _dataURL.detail_now + _globalDataObj.stockIds,
        dataType: "script",
        cache: "false",
        type: "GET",
        context: this,
        success: function () {
            StockLoader.market();
            buildMainTable();
        },
        error: function () { }
    });
};

function onClickRecordButton(eventObj) {

};

function onClickAdviseButton(eventObj) {

};

function onDragButtonMouseDown(eventObj) {

};

function onClickStockInfoName(eventObj) {
    var stockId = $(eventObj.currentTarget).attr('data-stockid');
    $('#tab_Header_Stock_Info a').removeClass('active');
    $('#tab_Header_Stock_Info a:first').addClass('active');
    $('#img_Stock_Info_K_Line').attr('data-target', stockId.split('|')[0]);
    $('#img_Stock_Info_K_Line').attr('src', '');
    startRefereshStockInforModal(stockId);
    startRefereshKLine();
    //_intervalForRefTimeSharingPlans = window.setInterval("startRefereshKLine();", 5000);
    //_intervalForRefStockInfo = window.setInterval('startRefereshStockInforModal("' + stockId + '")', 1000);
};

function onClickStockInfoAlert(eventObj) {
    var stockId = $(eventObj.currentTarget).attr('data-stockid');
};

function buildMainTable() {
    var tmpHTMLArr = [];
    for (var i = 0; i < _globalDataObj.list.length; i++) {
        tmpHTMLArr = tmpHTMLArr.concat(buildStockDataRow(_globalDataObj.list[i].id, i));
    }
    $('.main-table-body').empty();
    $('.main-table-body').append($(tmpHTMLArr.join('')));
    $('.stock_info_cell_alert .fa-bell').click(onClickStockInfoAlert);
    $('.stock-info-btn').click(onClickStockInfoName);
    $('.data-button.record-btn').click(onClickRecordButton);
    $('.data-button.advise-btn').click(onClickAdviseButton);
    $('.data-button.drag-row-btn').mousedown(onDragButtonMouseDown);
    //_intervalForRefMainTB = window.setInterval("refereshDataTable();", 1000);
};

function buildStockDataRow(stockId, index) {
    var currData, currMarket, tmpVal, tmpColor;
    var tmpHTMLArr = [];
    currData = _globalDataObj.stocks[stockId];
    currMarket = currData.market;
    tmpColor = (currMarket.rise_fall == 0 ? '' : currMarket.rise_fall > 0 ? 'color: red;' : 'color:green;');
    tmpHTMLArr.push('<tr style="text-align:right;' + tmpColor + '" id="stock_info_row_' + stockId + '">');
    tmpHTMLArr.push('   <th class="stock_info_cell_index text-center" scope="row" style="border:none;">' + (index + 1) + '</th>');
    tmpHTMLArr.push('   <td class="stock_info_cell_symbol text-center"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_alert text-center"><i class="far fa-bell" data-stockid="' + currData.id + '"></i></td>');
    tmpHTMLArr.push('   <td class="text-center">');
    tmpHTMLArr.push('       <a href="#" class="stock-info-btn" data-toggle="modal" data-target="#stockInfoModal" data-stockid="' + currData.id + '|' + _globalDataObj.list[index].symbol + '|' + index + '">' + currMarket.name + '</a>');
    tmpHTMLArr.push('   </td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_priceYC text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_priceTO text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_priceTC text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_rise_fall text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_rise_fall_ratio text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_priceTX text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_priceTM text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_costPrice text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_amount text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_totalValue text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_todayPL text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_totalPL text-right"></td>');
    tmpHTMLArr.push('   <td class="text-center">');
    tmpHTMLArr.push('       <button class="btn btn-sm btn-primary data-button record-btn" type="button" data-toggle="modal" data-target="#recordModal" data-stockid="' + currData.id + '">');
    tmpHTMLArr.push('           <i class="fas fa-sync-alt"></i>');
    tmpHTMLArr.push('       </button>');
    tmpHTMLArr.push('   </td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_advise_buy text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_advise_profit text-right"></td>');
    tmpHTMLArr.push('   <td class="stock_info_cell_advise_loss text-right"></td>');
    tmpHTMLArr.push('   <td class="text-center">');
    tmpHTMLArr.push('       <button class="btn btn-sm btn-primary data-button advise-btn" type="button" data-toggle="modal" data-target="#adviseModal" data-stockid="' + currData.id + '">');
    tmpHTMLArr.push('           <i class="fas fa-hand-point-right"></i>');
    tmpHTMLArr.push('       </button>');
    tmpHTMLArr.push('   </td>');
    tmpHTMLArr.push('   <td class="text-center" style="border:none;">');
    tmpHTMLArr.push('       <button class="btn btn-sm btn-outline-secondary data-button drag-row-btn" type="button" data-rowindex="' + index + '" data-stockid="' + currData.id + '">');
    tmpHTMLArr.push('           <i class="fas fa-align-justify"></i>');
    tmpHTMLArr.push('       </button>');
    tmpHTMLArr.push('   </td>');
    tmpHTMLArr.push('</tr>');
    return tmpHTMLArr;
};

function addStockToDataTable(stockId) {
    var rowHTML = buildStockDataRow(stockId, _globalDataObj.list.length - 1);
    $('.main-table-body').append($(rowHTML.join('')));
    $('.stock_info_cell_alert .fa-bell').unbind();
    $('.stock-info-btn').unbind();
    $('.data-button.record-btn').unbind();
    $('.data-button.advise-btn').unbind();
    $('.data-button.drag-row-btn').unbind();
    $('.stock_info_cell_alert .fa-bell').click(onClickStockInfoAlert);
    $('.stock-info-btn').click(onClickStockInfoName);
    $('.data-button.record-btn').click(onClickRecordButton);
    $('.data-button.advise-btn').click(onClickAdviseButton);
    $('.data-button.drag-row-btn').mousedown(onDragButtonMouseDown);
};

function stopRefereshDataTable() {
    window.clearInterval(_intervalForRefMainTB);
};

function refereshDataTable() {
    var currData, currMarket, tmpVal, tmpColor, stockId, currRowId;
    for (var i = 0; i < _globalDataObj.list.length; i++) {
        stockId = _globalDataObj.list[i].id;
        currData = _globalDataObj.stocks[stockId];
        currMarket = currData.market;
        currRowId = '#stock_info_row_' + stockId;
        tmpColor = (currMarket.rise_fall == 0 ? 'black' : currMarket.rise_fall > 0 ? 'red;' : 'green;');
        $(currRowId).css('color', tmpColor);
        $(currRowId + ' .stock_info_cell_symbol').text(_globalDataObj.list[i].symbol);
        $(currRowId + ' .stock_info_cell_priceYC').text(formatValue(currMarket.priceYC, true));
        $(currRowId + ' .stock_info_cell_priceTO').text(formatValue(currMarket.priceTO, true));
        $(currRowId + ' .stock_info_cell_priceTC').text(formatValue(currMarket.priceTC, true));
        $(currRowId + ' .stock_info_cell_rise_fall').text(formatValue(currMarket.rise_fall, true));
        $(currRowId + ' .stock_info_cell_rise_fall_ratio').text(formatValue(currMarket.rise_fall_ratio, true) + '%');
        $(currRowId + ' .stock_info_cell_priceTX').text(formatValue(currMarket.priceTX, true));
        $(currRowId + ' .stock_info_cell_priceTM').text(formatValue(currMarket.priceTM, true));
        $(currRowId + ' .stock_info_cell_costPrice').text(formatValue(currData.costPrice, true));
        $(currRowId + ' .stock_info_cell_amount').text((currData.amount == 0 ? '-' : currData.amount.toFixed(2)));
        $(currRowId + ' .stock_info_cell_totalValue').text(formatValue(currData.totalValue, true));
        $(currRowId + ' .stock_info_cell_todayPL').text(formatValue(currMarket.rise_fall * currData.amount, true));
        tmpVal = (currMarket.priceTC - currData.costPrice) * currData.amount;
        $(currRowId + ' .stock_info_cell_totalPL').css('color', tmpVal > 0 ? 'red;"' : tmpVal < 0 ? 'green' : 'black');
        $(currRowId + ' .stock_info_cell_totalPL').text(formatValue(tmpVal, true));
        tmpVal = _globalDataObj.stocks[stockId].advise;
        tmpVal = tmpVal.length == 0 ? { buyScope: '-', stopProfitScope: '-', stopLossScope: '-' } : tmpVal[tmpVal.length - 1];
        $(currRowId + ' .stock_info_cell_advise_buy').text(tmpVal.buyScope);
        $(currRowId + ' .stock_info_cell_advise_profit').text(tmpVal.stopProfitScope);
        $(currRowId + ' .stock_info_cell_advise_loss').text(tmpVal.stopLossScope);
        var alertItem = $(currRowId + ' .stock_info_cell_alert .fa-bell');
        var alertObj = checkAdviseScope(currData);
        alertItem.attr('title', alertObj.title);
        if (alertObj.alert && !alertItem.hasClass('fa-spin')) {
            alertItem.addClass('fa-spin');
        } else {
            alertItem.removeClass('fa-spin');
        }
    }
};

function checkAdviseScope(stockDate) {
    var alertObj = { alert: false, title: '' };
    var advises = stockDate.advise;
    if (stockDate.amount > 0 && advises.length > 0) {
        advises = advises[advises.length - 1];
        if ((isNaN(advises.buyDown) || stockDate.market.priceTC >= advises.buyDown) && (isNaN(advises.buyUp) || stockDate.market.priceTC <= advises.buyUp)) {
            alertObj.alert = true;
            alertObj.title = "到达买点范围";
        }

        if ((isNaN(advises.stopLossDown) || stockDate.market.priceTC >= advises.stopLossDown) && (isNaN(advises.stopLossUp) || stockDate.market.priceTC <= advises.stopLossUp)) {
            alertObj.alert = true;
            alertObj.title = "到达止损范围";
        }

        if ((isNaN(advises.stopProfitDown) || stockDate.market.priceTC >= advises.stopProfitDown) && (isNaN(advises.stopProfitUp) || stockDate.market.priceTC <= advises.stopProfitUp)) {
            alertObj.alert = true;
            alertObj.title = "到达止盈范围";

        }
    }

    return alertObj;
};

function formatValue(value, dash) {
    if (typeof dash == 'boolean' && dash) {
        if (value == 0) {
            value = "-";
        } else {
            value = value.toFixed(2);
        }
    } else {
        value = value.toFixed(2)
    }

    return value;
};

function saveData() {
    $.ajax({
        type: 'POST',
        async: false,
        url: 'operation.aspx?rnd=' + Date.now(),
        success: function (xml, status) {
        },
        contentType: 'text/xml',
        dataType: 'text',
        data: writeXMLString(),
        xhrFields: {
            //withCredentials: true
        },
        error: function () {
        }
    });
};

function addStock(stockId) {
    $.ajax({
        url: _dataURL.detail_now + _globalDataObj.stockIds,
        dataType: "script",
        cache: "false",
        type: "GET",
        context: this,
        success: function () {
            StockLoader.history(stockId);
            StockLoader.market();
            addStockToDataTable(stockId);
        },
        error: function () { }
    });
};

function initEvents() {
    $('#btn_AddStock').on('click', function () {
        var stockId = getFormatedStockId();
        if (stockId != "") {
            _globalDataObj.stockIds += stockId + ",";
            _globalDataObj.list.push({ id: stockId, symbol: "" });
            _globalDataObj.stocks[stockId] = { id: stockId, market: {}, records: [], advise: [] };
            addStock(stockId);
        }
    });

    $('#txt_AddStock').on('change', function () {
        var stockId = $(arguments[0].currentTarget).val().trim();
        if (stockId != "" && (typeof _globalDataObj.stocks[stockId] == 'undefined' || _globalDataObj.stocks[stockId] == null)) {
            _globalDataObj.stockIds += stockId + ",";
            _globalDataObj.list.push({ id: stockId, symbol: "" });
            _globalDataObj.stocks[stockId] = { id: stockId, market: {}, records: [], advise: [] };
            addStock(stockId);
        }
    });

    $('#txt_AddStock').on('keypress', function () {
        var value = $('#txt_AddStock').val().trim();
        if (value != "") {
            $.ajax({
                url: _dataURLSina.stock_search + value,
                dataType: "script",
                cache: "false",
                type: "GET",
                context: this,
                success: function () {
                    $('#search_list').empty();
                    var listArr = window.suggestvalue.split(';');
                    var itemArr;
                    for (var i = 0; i < listArr.length; i++) {
                        itemArr = listArr[i].split(',');
                        $('#search_list').append($('<option value="' + itemArr[3] + '">' + itemArr[4] + '</option>'));
                    }
                },
                error: function () { }
            });
        }
    });

    $('#txt_Stock_Info_Advise_Symbol').on("change", function () {
        var index = $(arguments[0].currentTarget).attr('data-target');
        _globalDataObj.list[index].symbol = $('#txt_Stock_Info_Advise_Symbol').val();
    });

    $('#tab_Header_Stock_Info a').on('click', function (eventObj) {
        eventObj.preventDefault();
        var hrefStr = $(eventObj.currentTarget).attr('href');
        var imgEl = $('#img_Stock_Info_K_Line');
        var stockId = imgEl.attr('data-target');
        var tmpURL = '';
        stopRefereshKLine();
        switch (hrefStr) {
            case "#k-line-daily":
                tmpURL = _dataURLSina.k_line_d + stockId;
                break;
            case "#k-line-weekly":
                tmpURL = _dataURLSina.k_line_w + stockId;
                break;
            case "#k-line-monthly":
                tmpURL = _dataURLSina.k_line_m + stockId;
                break;
            case "#time-sharing-plan":
            default:
                tmpURL = _dataURLSina.timeSharing_plans + stockId;
                _intervalForRefTimeSharingPlans = window.setInterval("startRefereshKLine();", 5000);
                break;
        }

        imgEl.attr('src', tmpURL + '.gif?rnd=' + (new Date()).valueOf());
    });
};

function getFormatedStockId() {
    var stockId = $('#txt_AddStock').val().trim();
    var featureCode = stockId.substr(0, 3);
    if (featureCode == "600" || featureCode == "600" || featureCode == "600") {
        stockId = 'sh' + stockId;
    } else if (featureCode == "002" || featureCode == "000" || featureCode == "300") {
        stockId = 'sz' + stockId;
    }

    if (stockId.length < 8 || _globalDataObj.stockIds.indexOf(stockId) > 0) {
        stockId = "";
    }

    return stockId;
};

function initPage() {
    _loadStockList();
    initEvents();
    $('.main-wrap').height($('body').height() - $('header').height() - $('footer').height());
};

/*data item events*/
function stopRefereshStockInfoModal() {
    window.clearInterval(_intervalForRefStockInfo);
};

function startRefereshStockInforModal(stockId) {
    stockId = stockId.split('|');
    var symbol = stockId[1];
    var index = stockId[2];
    stockId = stockId[0];
    var tmpObj = _globalDataObj.stocks[stockId].market;
    $('#txt_Stock_Info_Stock_Name').text(tmpObj.name);
    $('#txt_Stock_Info_Stock_ID').text(tmpObj.id);
    $('#txt_Stock_Info_Advise_Symbol').text(symbol);
    $('#txt_Stock_Info_Advise_Symbol').attr('data-target', index);
    $('#txt_Stock_Info_Current_Price').text(tmpObj.priceTC.toFixed(2));
    $('#txt_Stock_Info_PL_Value').text(tmpObj.rise_fall.toFixed(2));
    $('#txt_Stock_Info_PL_Rate').text(tmpObj.rise_fall_ratio.toFixed(2) + '%');
    $('#txt_Stock_Info_LimitUp_Price').text(tmpObj.priceUL.toFixed(2));
    $('#txt_Stock_Info_LimitDown_Price').text(tmpObj.priceDL.toFixed(2));
    $('#txt_Stock_Info_Referesh_Date').text(tmpObj.datetime.toLocaleDateString());
    $('#txt_Stock_Info_Referesh_Time').text(tmpObj.datetime.toTimeString().substr(0, 8));
    $('#txt_Stock_Info_Opening_Price').text(tmpObj.priceTO.toFixed(2));
    $('#txt_Stock_Info_Turnover').text((tmpObj.deal_A / 10000).toFixed(2));
    $('#txt_Stock_Info_Range').text(tmpObj.range.toFixed(2) + '%');
    $('#txt_Stock_Info_High_Price').text(tmpObj.priceTX.toFixed(2));
    $('#txt_Stock_Info_Turnover_Volume').text((tmpObj.deal_V / 10000).toFixed(2));
    $('#txt_Stock_Info_Turnover_Rate').text(tmpObj.turnover_rate.toFixed(2) + '%');
    $('#txt_Stock_Info_Low_Price').text(tmpObj.priceTM.toFixed(2));
    $('#txt_Stock_Info_Total_Market_Cap').text(tmpObj.total_market_cap.toFixed(2));
    $('#txt_Stock_Info_PriceBook_Value_Ratio').text(tmpObj.price_book_value_ratio.toFixed(2));
    $('#txt_Stock_Info_Closing_Price').text(tmpObj.priceYC.toFixed(2));
    $('#txt_Stock_Info_Negotiable_Market_Cap').text(tmpObj.negotiable_market_cap.toFixed(2));
    $('#txt_Stock_Info_Price_Earning_Ratio').text(tmpObj.price_earning_ratio.toFixed(2));
    $('#img_Stock_Info_K_Line');
    $('#txt_Stock_Info_Price_Arrow').empty();
    if (tmpObj.rise_fall == 0) {
        $('.rise-fall-item').css('color', 'black');
        $('#txt_Stock_Info_Price_Arrow').html('<i class="fas fa-stop-circle"></i>');
    } else if (tmpObj.rise_fall > 0) {
        $('.rise-fall-item').css('color', 'red');
        $('#txt_Stock_Info_Price_Arrow').html('<i class="fas fa-arrow-circle-up"></i>');
    } else {
        $('.rise-fall-item').css('color', 'green');
        $('#txt_Stock_Info_Price_Arrow').html('<i class="fas fa-arrow-circle-down"></i>');
    }
};

function stopRefereshKLine() {
    window.clearInterval(_intervalForRefTimeSharingPlans);
};

function startRefereshKLine() {
    var imgEl = $('#img_Stock_Info_K_Line');
    if (imgEl.attr('src') == '') {
        imgEl.attr('src', _dataURLSina.timeSharing_plans + imgEl.attr('data-target') + '.gif');
    }

    imgEl.attr('src', imgEl.attr('src').split('?')[0] + '?rnd=' + (new Date()).valueOf());
}

/*
1. 0: 未知 
2. 1: 名字 
3. 2: 代码 
4. 3: 当前价格 
5. 4: 昨收 
6. 5: 今开 
7. 6: 成交量（手） 
8. 7: 外盘 
9. 8: 内盘 
10. 9: 买一 
11. 10: 买一量（手） 
12. 11-18: 买二 买五 
13. 19: 卖一 
14. 20: 卖一量 
15. 21-28: 卖二 卖五 
16. 29: 最近逐笔成交 
17. 30: 时间 
18. 31: 涨跌 
19. 32: 涨跌% 
20. 33: 最高 
21. 34: 最低 
22. 35: 价格/成交量（手）/成交额 
23. 36: 成交量（手） 
24. 37: 成交额（万） 
25. 38: 换手率 
26. 39: 市盈率 
27. 40: 
28. 41: 最高 
29. 42: 最低 
30. 43: 振幅 
31. 44: 流通市值 
32. 45: 总市值 
33. 46: 市净率 
34. 47: 涨停价 
35. 48: 跌停价
*/
var StockLoader = {};

StockLoader.marketKeys = [
    { idx: '00', key: 'unknow_1', type: 't', empty: '-' },
    { idx: '01', key: 'name', type: 't', empty: '-' },
    { idx: '02', key: 'id', type: 't', empty: '-' },
    { idx: '03', key: 'priceTC', type: 'f', empty: '-' },
    { idx: '04', key: 'priceYC', type: 'f', empty: '-' },
    { idx: '05', key: 'priceTO', type: 'f', empty: '-' },
    { idx: '06', key: 'amountCT', type: 'i', empty: '-' },
    { idx: '07', key: 'amountBuy', type: 'i', empty: '-' },
    { idx: '08', key: 'amountSell', type: 'i', empty: '-' },
    { idx: '09', key: 'bid_1_P', type: 'f', empty: '-' },
    { idx: '10', key: 'bid_1_A', type: 'i', empty: '-' },
    { idx: '11', key: 'bid_2_P', type: 'f', empty: '-' },
    { idx: '12', key: 'bid_2_A', type: 'i', empty: '-' },
    { idx: '13', key: 'bid_3_P', type: 'f', empty: '-' },
    { idx: '14', key: 'bid_3_A', type: 'i', empty: '-' },
    { idx: '15', key: 'bid_4_P', type: 'f', empty: '-' },
    { idx: '16', key: 'bid_4_A', type: 'i', empty: '-' },
    { idx: '17', key: 'bid_5_P', type: 'f', empty: '-' },
    { idx: '18', key: 'bid_5_A', type: 'i', empty: '-' },
    { idx: '19', key: 'auc_1_P', type: 'f', empty: '-' },
    { idx: '20', key: 'auc_1_A', type: 'i', empty: '-' },
    { idx: '21', key: 'auc_2_P', type: 'f', empty: '-' },
    { idx: '22', key: 'auc_2_A', type: 'i', empty: '-' },
    { idx: '23', key: 'auc_3_P', type: 'f', empty: '-' },
    { idx: '24', key: 'auc_3_A', type: 'i', empty: '-' },
    { idx: '25', key: 'auc_4_P', type: 'f', empty: '-' },
    { idx: '26', key: 'auc_4_A', type: 'i', empty: '-' },
    { idx: '27', key: 'auc_5_P', type: 'f', empty: '-' },
    { idx: '28', key: 'auc_5_A', type: 'i', empty: '-' },
    { idx: '29', key: 'recent', type: 'a', empty: [] },
    { idx: '30', key: 'datetime', type: 'd', empty: '-' },
    { idx: '31', key: 'rise_fall', type: 'f', empty: '-' },
    { idx: '32', key: 'rise_fall_ratio', type: 'f', empty: '-' },
    { idx: '33', key: 'priceTX', type: 'f', empty: '-' },
    { idx: '34', key: 'priceTM', type: 'f', empty: '-' },
    { idx: '35', key: 'lastes_deal', type: 'a', empty: [] },
    { idx: '36', key: 'deal_A', type: 'i', empty: '-' },
    { idx: '37', key: 'deal_V', type: 'f', empty: '-' },
    { idx: '38', key: 'turnover_rate', type: 'f', empty: '-' },
    { idx: '39', key: 'price_earning_ratio', type: 'f', empty: '-' },
    { idx: '40', key: 'unknow_2', type: 't', empty: '-' },
    { idx: '41', key: 'priceTX_2', type: 'f', empty: '-' },
    { idx: '42', key: 'priceTM_2', type: 'f', empty: '-' },
    { idx: '43', key: 'range', type: 'f', empty: '-' },
    { idx: '44', key: 'negotiable_market_cap', type: 'f', empty: '-' },
    { idx: '45', key: 'total_market_cap', type: 'f', empty: '-' },
    { idx: '46', key: 'price_book_value_ratio', type: 'f', empty: '-' },
    { idx: '47', key: 'priceUL', type: 'f', empty: '-' },
    { idx: '48', key: 'priceDL', type: 'f', empty: '-' }
];

StockLoader.market = function () {
    var dataArr, tmpVal, tmpKey, tmpType, tmpDefVal, tmpArray;
    for (var key in _globalDataObj.stocks) {
        dataArr = window['v_' + key].split('~');
        for (var i = 0; i < StockLoader.marketKeys.length; i++) {
            tmpVal = (typeof dataArr[i] != 'undefined' ? dataArr[i] : '-');
            tmpKey = StockLoader.marketKeys[i].key;
            tmpType = StockLoader.marketKeys[i].type;
            tmpDefVal = StockLoader.marketKeys[i].empty;
            if (tmpType == 'f') {
                tmpVal = !isNaN(tmpVal) ? parseFloat(tmpVal) : tmpDefVal;
            } else if (tmpType == 'i') {
                tmpVal = !isNaN(tmpVal) ? parseInt(tmpVal) : tmpDefVal;
            } else if (tmpType == 'a') {
                tmpArray = tmpVal.split('/');
                if (tmpKey == "lastes_deal") {
                    tmpVal = tmpArray.length == 3 ? tmpArray : [];
                } else {
                    tmpVal = [];
                    for (var j = 0; j < tmpArray.length; j += 5) {
                        var tmpSubObj = {
                            time: (j == 0 ? tmpArray[j] : tmpArray[j].split('|')[1]),
                            price: tmpArray[j + 1],
                            amount: tmpArray[j + 2],
                            flag: tmpArray[j + 3],
                            value: tmpArray[j + 4]
                        };

                        tmpVal.push(tmpSubObj);
                    }
                }
            } else if (tmpType == 'd') {
                var tmpDate = new Date();
                tmpDate.setYear(tmpVal.substr(0, 4));
                tmpDate.setMonth(tmpVal.substr(4, 2));
                tmpDate.setDate(tmpVal.substr(6, 2));
                tmpDate.setHours(tmpVal.substr(8, 2));
                tmpDate.setMinutes(tmpVal.substr(10, 2));
                tmpDate.setSeconds(tmpVal.substr(12, 2));
                tmpVal = tmpDate;
            }

            _globalDataObj.stocks[key].market[tmpKey] = tmpVal;
        }
    }
};

StockLoader.history = function (stockId) {
    _globalDataObj.stocks[stockId] = {
        id: stockId,
        market: {},
        records: [],
        advise: [],
        amount: 0,
        costPrice: 0,
        totalValue: 0
    };
    StockLoader.record(stockId);
    StockLoader.advise(stockId);
    StockLoader.calcCostPrice(stockId);
};

StockLoader.record = function (stockId) {
    var recEls = _historyDoc.find('stock[id="' + stockId + '"] recs i');
    var currRec;
    for (var i = 0; i < recEls.length; i++) {
        currRec = $(recEls[i]);
        _globalDataObj.stocks[stockId].records.push({
            date: currRec.attr('d'),
            time: currRec.attr('t'),
            price: isNaN(currRec.attr('p')) ? 0 : parseFloat(currRec.attr('p')),
            amt: isNaN(currRec.attr('a')) ? 0 : parseInt(currRec.attr('a')),
            flag: currRec.attr('f'),
            charge: isNaN(currRec.attr('c')) ? 0 : parseFloat(currRec.attr('c')),
            tax: isNaN(currRec.attr('x')) ? 0 : parseFloat(currRec.attr('x')),
            fee: isNaN(currRec.attr('e')) ? 0 : parseFloat(currRec.attr('e')),
        });
    }
};

StockLoader.formatAdviseScope = function (down, up, isProfit) {
    down = isNaN(down) ? '' : down;
    up = isNaN(up) ? '' : up;
    var retVal = '';
    if (isProfit) {
        if (down != '') {
            if (up != '') {
                retVal = parseFloat(down).toFixed(2) + '--' + parseFloat(up).toFixed(2);
            } else {
                retVal = '>' + parseFloat(down).toFixed(2);
            }
        }
    } else {
        if (up != '') {
            if (down != '') {
                retVal = parseFloat(down).toFixed(2) + '--' + parseFloat(up).toFixed(2);
            } else {
                retVal = '<' + parseFloat(up).toFixed(2);
            }
        }
    }

    return retVal;
};

StockLoader.advise = function (stockId) {
    var advEls = _historyDoc.find('stock[id="' + stockId + '"] advise i');
    var curradv;
    for (var i = 0; i < advEls.length; i++) {
        curradv = $(advEls[i]);
        var newAdviseObj = {
            date: curradv.attr('d'),
            time: curradv.attr('t'),
            buyDown: parseTextToFloat(curradv.attr('bd')),
            buyUp: parseTextToFloat(curradv.attr('bu')),
            stopProfitDown: parseTextToFloat(curradv.attr('sd')),
            stopProfitUp: parseTextToFloat(curradv.attr('su')),
            stopLossDown: parseTextToFloat(curradv.attr('ld')),
            stopLossUp: parseTextToFloat(curradv.attr('lu')),
            buyScope: '',
            stopProfitScope: '',
            stopLossScope: '',
            content: curradv.text()
        };

        newAdviseObj.buyScope = StockLoader.formatAdviseScope(newAdviseObj.buyDown, newAdviseObj.buyUp, false);
        newAdviseObj.stopProfitScope = StockLoader.formatAdviseScope(newAdviseObj.stopProfitDown, newAdviseObj.stopProfitUp, true);
        newAdviseObj.stopLossScope = StockLoader.formatAdviseScope(newAdviseObj.stopLossDown, newAdviseObj.stopLossUp, false);
        _globalDataObj.stocks[stockId].advise.push(newAdviseObj);
    }
};

StockLoader.calcCostPrice = function (stockId) {
    var recs = _globalDataObj.stocks[stockId].records;
    var price, amount, flag, cost, tax, fee;
    var totalAmount = 0;
    var totalValue = 0;
    for (var i = 0; i < recs.length; i++) {
        if (recs[i].flag == "b") {
            totalAmount += recs[i].amt;
            totalValue += recs[i].amt * recs[i].price + recs[i].charge + recs[i].fee;
        } else {
            totalAmount -= recs[i].amt;
            totalValue -= recs[i].amt * recs[i].price - recs[i].charge - recs[i].tax - recs[i].fee;
        }
    }

    _globalDataObj.stocks[stockId].amount = totalAmount;
    _globalDataObj.stocks[stockId].costPrice = (totalAmount == 0 ? 0 : totalValue / totalAmount);
    _globalDataObj.stocks[stockId].totalValue = totalValue;
};

function writeXMLString() {
    var xmlStrArr = [];
    xmlStrArr.push('<root>');
    for (var i = 0; i < _globalDataObj.list.length; i++) {
        xmlStrArr.push('<stock id="' + _globalDataObj.list[i].id + '" symbol="' + _globalDataObj.list[i].symbol + '">');
        xmlStrArr.push('<recs>');
        var recs = _globalDataObj.stocks[_globalDataObj.list[i].id].records;
        for (var j = 0; j < recs.length; j++) {
            xmlStrArr.push('<i ');
            xmlStrArr.push('d="' + recs[j].date + '" ');
            xmlStrArr.push('t="' + recs[j].time + '" ');
            xmlStrArr.push('p="' + recs[j].price + '" ');
            xmlStrArr.push('a="' + recs[j].amt + '" ');
            xmlStrArr.push('f="' + recs[j].flag + '" ');
            xmlStrArr.push('c="' + recs[j].charge + '" ');
            xmlStrArr.push('x="' + recs[j].tax + '" ');
            xmlStrArr.push('e="' + recs[j].fee + '"/>');
        }
        xmlStrArr.push('</recs>');
        xmlStrArr.push('<advise>');
        var advise = _globalDataObj.stocks[_globalDataObj.list[i].id].advise;
        for (var j = 0; j < advise.length; j++) {
            xmlStrArr.push('<i ');
            xmlStrArr.push('d="' + advise[j].date + '" ');
            xmlStrArr.push('t="' + advise[j].time + '" ');
            xmlStrArr.push('bu="' + (isNaN(advise[j].buyUp) ? '' : advise[j].buyUp) + '" ');
            xmlStrArr.push('bd="' + (isNaN(advise[j].buyDown) ? '' : advise[j].buyDown) + '" ');
            xmlStrArr.push('su="' + (isNaN(advise[j].stopProfitUp) ? '' : advise[j].stopProfitUp) + '" ');
            xmlStrArr.push('sd="' + (isNaN(advise[j].stopProfitDown) ? '' : advise[j].stopProfitDown) + '" ');
            xmlStrArr.push('lu="' + (isNaN(advise[j].stopLossUp) ? '' : advise[j].stopLossUp) + '" ');
            xmlStrArr.push('ld="' + (isNaN(advise[j].stopLossDown) ? '' : advise[j].stopLossDown) + '">');
            xmlStrArr.push(advise[j].content);
            xmlStrArr.push('</i>');
        }

        xmlStrArr.push('</advise>');
        xmlStrArr.push('</stock>');
    }
    xmlStrArr.push('</root>');
    return xmlStrArr.join('');
};

function parseTextToFloat(value) {
    if (typeof value == 'string') {
        if (value != '' && !isNaN(value)) {
            return parseFloat(value);
        }
    }

    return Number.NaN;
}