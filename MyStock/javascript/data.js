var _globalDataObj = {
    list: [],
    stocks: {},
    stockIds: "",
};
var _globalFilterDataList = [];
var _globalFilterOutList = [];
var _historyDoc = null;
/*URL For Get Data*/
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
    stock_search: "http://suggest3.sinajs.cn/suggest/type=11,12&key=",
    //当前信息, 返回hq_str_sh601006=""
    detail_now: "http://hq.sinajs.cn/list=sh601006",
    //分时图
    timeSharing_plans: "http://image.sinajs.cn/newchart/min/n/",
    //日K图
    k_line_d: "http://image.sinajs.cn/newchart/daily/n/",
    //周K图, 返回weekly_data=""
    k_line_w: "http://image.sinajs.cn/newchart/weekly/n/",
    //月K图, 返回monthly_data=""
    k_line_m: "http://image.sinajs.cn/newchart/monthly/n/",
    //成交明细
    deal_detail: 'http://market.finance.sina.com.cn/downxls.php?date=2011-07-08&symbol=sh600900',
    //分价表
    price_points_table: 'http://market.finance.sina.com.cn/pricehis.php?symbol=sh600900&startdate=2011-08-17&enddate=2011-08-19'
};
/*For Stock Rrecords Modal*/
var _recordColFieldValuMapping = [
    { id: '#sel_Add_Record_Item_Type', key: 'flag', convert: function (value) { return value }, format: function (value) { return value } },
    { id: '#txt_Add_Record_Item_Date', key: 'date', convert: formatDateString, format: function (value) { return value.replace(/-/g, '/') } },
    { id: '#txt_Add_Record_Item_Amount', key: 'amt', convert: function (value) { return value }, format: parseInt },
    { id: '#txt_Add_Record_Item_Price', key: 'price', convert: numberToFixed, format: parseFloat },
    { id: '#txt_Add_Record_Item_Change', key: 'charge', convert: numberToFixed, format: parseFloat },
    { id: '#txt_Add_Record_Item_Tax', key: 'tax', convert: numberToFixed, format: parseFloat },
    { id: '#txt_Add_Record_Item_Fee', key: 'fee', convert: numberToFixed, format: parseFloat }
];
var _editingRecordItem = { obj: null, rowIdx: -1, stockId: '' };
/*For Stock Advises Modal*/
var _adviseColFieldValuMapping = [
    { id: '#txt_Add_Advise_Item_Date', key: 'date', convert: formatDateString, format: function (value) { return value.replace(/-/g, '/') }, items: null },
    {
        id: '#container_Add_Advise_Item_Buy',
        key: 'buyScope',
        convert: null,
        format: null,
        items: [
            { id: '#txt_Add_Advise_Item_Buy_Down', key: 'buyDown', convert: numberToFixed, format: parseFloat },
            { id: '#txt_Add_Advise_Item_Buy_Up', key: 'buyUp', convert: numberToFixed, format: parseFloat }
        ]
    },
    {
        id: '#container_Add_Advise_Item_Sell',
        key: 'stopProfitScope',
        convert: null,
        format: null,
        items: [
            { id: '#txt_Add_Advise_Item_Sell_Down', key: 'stopProfitDown', convert: numberToFixed, format: parseFloat },
            { id: '#txt_Add_Advise_Item_Sell_Up', key: 'stopProfitUp', convert: numberToFixed, format: parseFloat }
        ]
    },
    {
        id: '#container_Add_Advise_Item_Loss',
        key: 'stopLossScope',
        convert: null,
        format: null,
        items: [
            { id: '#txt_Add_Advise_Item_Loss_Down', key: 'stopLossDown', convert: numberToFixed, format: parseFloat },
            { id: '#txt_Add_Advise_Item_Loss_Up', key: 'stopLossUp', convert: numberToFixed, format: parseFloat }
        ]
    },
    { id: '#txt_Add_Advise_Item_Content', key: 'content', convert: function (value) { return value; }, format: function (value) { return value; }, items: null }
];
var _editingAdviseItem = { obj: null, rowIdx: -1, stockId: '' };
/*For Interval Funcitons*/
var _intervalForRefMainTB_Time = 1000;
var _intervalForRefStockInfo_Time = 1000;
var _intervalForRefTimeSharingPlans_Time = 5000;
var _intervalForRefRecordModal_Time = 2000;
var _intervalForRefAdviseModal_Time = 2000;
var _intervalForRefMainTB = null;
var _intervalForRefStockInfo = null;
var _intervalForRefTimeSharingPlans = null;
var _intervalForRefRecordModal = null;
var _intervalForRefAdviseModal = null;

/*Global Functions*/
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

    loadStockData(null, true);
};

function loadStockData(stockIdArr, isInit) {
    var inputArray = [];
    if (typeof stockIdArr == "undefined" || stockIdArr == null) {
        if (_globalFilterDataList.length == 0) {
            _globalFilterDataList = _globalDataObj.list;
        }

        for (var i = 0; i < _globalFilterDataList.length; i++) {
            inputArray.push(_globalFilterDataList[i].id);
        }
    } else {
        inputArray = stockIdArr;
    }

    var tmpArr = inputArray.splice(0, 50);
    if (tmpArr.length > 0) {
        $.ajax({
            url: _dataURL.detail_now + tmpArr.join(','),
            dataType: "script",
            cache: "false",
            type: "GET",
            context: this,
            success: function () {
                if (inputArray.length > 0) {
                    loadStockData(inputArray)
                } else {
                    StockLoader.market();
                    if (isInit) {
                        sortAllStockList();
                        buildMainTable();
                    }

                    updateFooterContent('all');
                }
            },
            error: function () { }
        });
    }
}

function onClickRecordButton(eventObj) {
    var stockId = $(eventObj.currentTarget).attr('data-stockid');
    refereshRecordTitle(stockId);
    refereshRecordDetail(stockId);
    refereshRecordSummary(stockId);
};

function onClickAdviseButton(eventObj) {
    var stockId = $(eventObj.currentTarget).attr('data-stockid');
    refereshAdviseTitle(stockId);
    refereshAdviseDetail(stockId);
    refereshAdviseSummary(stockId);
};

function onClickToTopButton(eventObj) {
    var sourceId = $(eventObj.currentTarget).attr('data-stockid');
    var targetId = $('.main-table-body tr:eq(0)').attr('id').split('_');
    targetId = targetId[targetId.length - 1];
    dragAndDropDataRow(sourceId, targetId);
};

function onClickStockInfoName(eventObj) {
    var tmpId = $(eventObj.currentTarget).attr('data-stockid');
    $('#tab_Header_Stock_Info a').removeClass('active');
    $('#tab_Header_Stock_Info a:first').addClass('active');
    var stockId = tmpId.split('|')[0];
    $('#img_Stock_Info_Time_Sharing').attr('data-target', stockId.split('|')[0]);
    $('#img_Stock_Info_K_Line_Daily').attr('src', _dataURLSina.k_line_d + stockId + '.gif?rnd=' + (new Date()).valueOf());
    $('#img_Stock_Info_K_Line_Weekly').attr('src', _dataURLSina.k_line_w + stockId + '.gif?rnd=' + (new Date()).valueOf());
    $('#img_Stock_Info_K_Line_Monthly').attr('src', _dataURLSina.k_line_m + stockId + '.gif?rnd=' + (new Date()).valueOf());
    startRefereshStockInforModal(tmpId);
    startRefereshKLine();
    _intervalForRefStockInfo = window.setInterval('startRefereshStockInforModal("' + stockId + '")', _intervalForRefStockInfo_Time);
    _intervalForRefTimeSharingPlans = window.setInterval("startRefereshKLine();", _intervalForRefTimeSharingPlans_Time);
};

function onClickStockInfoAlert(eventObj) {
    var stockId = $(eventObj.currentTarget).attr('data-stockid');
};

function buildMainTable() {
    if (_globalFilterDataList.length == 0) {
        _globalFilterDataList = _globalDataObj.list;
    }

    var tmpHTMLArr = [];
    for (var i = 0; i < _globalFilterDataList.length; i++) {
        tmpHTMLArr = tmpHTMLArr.concat(buildStockDataRow(_globalFilterDataList[i].id, i));
    }

    $('.main-table-body').empty();
    $('.main-table-body').append($(tmpHTMLArr.join('')));
    $('.stock_info_cell_alert .fa-bell').click(onClickStockInfoAlert);
    $('.stock-info-btn').click(onClickStockInfoName);
    $('.data-button.record-btn').click(onClickRecordButton);
    $('.data-button.advise-btn').click(onClickAdviseButton);
    $('.data-button.drag-row-btn').click(onClickToTopButton);
    var dataRows = $('.main-table-body tr');
    dataRows.attr('draggable', true);
    for (var i = 0; i < dataRows.length; i++) {
        bindRowDragEvents(dataRows[i], i);
    }

    //startRefereshDataTable();
    _intervalForRefMainTB = window.setInterval("startRefereshDataTable();", _intervalForRefMainTB_Time);
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
    tmpHTMLArr.push('   <td class="stock_info_cell_alert text-center">');
    if (_globalFilterDataList[index].symbol != "" || currData.amount > 0) {
        tmpHTMLArr.push('       <i class="far fa-bell" data-stockid="' + currData.id + '"></i>');
    }

    tmpHTMLArr.push('   </td>');
    tmpHTMLArr.push('   <td class="text-center">');
    tmpHTMLArr.push('       <a href="#" class="stock-info-btn" data-toggle="modal" data-target="#stockInfoModal" data-stockid="' + currData.id + '|' + _globalFilterDataList[index].symbol + '|' + index + '">' + currMarket.name + '</a>');
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
    tmpHTMLArr.push('       <button class="btn btn-sm btn-outline-secondary data-button drag-row-btn" type="button" data-stockid="' + currData.id + '">');
    tmpHTMLArr.push('           <i class="fas fa-arrow-circle-up"></i>');
    tmpHTMLArr.push('       </button>');
    tmpHTMLArr.push('   </td>');
    tmpHTMLArr.push('</tr>');
    return tmpHTMLArr;
};

function bindRowDragEvents(rowEl) {
    $(rowEl).on('dragenter', function (eventObj) {
        $(this).addClass('current-drag-target-row');
        return true;
    });

    $(rowEl).on('dragover', function (eventObj) {
        eventObj.originalEvent.preventDefault();
        return true;
    });

    $(rowEl).on('dragleave', function (eventObj) {
        $(this).removeClass('current-drag-target-row');
        return true;
    });

    $(rowEl).on('drop', function (eventObj) {
        eventObj.originalEvent.dataTransfer.dropEffect = 'move';
        $(this).removeClass('current-drag-target-row');
        var tmpIdArr = $(this).attr('id').split('_');
        dragAndDropDataRow(eventObj.originalEvent.dataTransfer.getData("text"), tmpIdArr[tmpIdArr.length - 1]);
        return true;
    });

    $(rowEl).on('dragstart', function (eventObj) {
        eventObj.originalEvent.dataTransfer.effectAllowed = "move";
        var tmpIdArr = $(this).attr('id').split('_');
        eventObj.originalEvent.dataTransfer.setData("text", tmpIdArr[tmpIdArr.length - 1]);
        return true;
    });

    $(rowEl).on('dragend', function (eventObj) {
        eventObj.originalEvent.dataTransfer.clearData("text");
        return false
    });
};

function dragAndDropDataRow(sourceId, targetId) {
    var sourceEl = $('#stock_info_row_' + sourceId);
    var targetEl = $('#stock_info_row_' + targetId);
    var sourceIdx = sourceEl.index();
    var targetIdx = targetEl.index();
    if (sourceIdx == targetIdx) {
        return;
    }

    var arrLength = _globalFilterDataList.length;
    var arrPart_1, arrPart_2;
    if (targetIdx == 0) {
        sourceObj = _globalFilterDataList.splice(sourceIdx, 1);
        _globalFilterDataList = sourceObj.concat(_globalFilterDataList);
    } else if (targetIdx == arrLength - 1) {
        sourceObj = _globalFilterDataList.splice(sourceIdx, 1);
        _globalFilterDataList = _globalFilterDataList.concat(sourceObj);
    } else {
        var arrPart_1 = _globalFilterDataList.slice(0, targetIdx + 1);
        var arrPart_2 = _globalFilterDataList.slice(targetIdx + 1);
        var sourceObj = sourceIdx < arrPart_1.length ? arrPart_1.splice(sourceIdx, 1) : arrPart_1.splice(sourceIdx - arrPart_1.length, 1);
        _globalFilterDataList = arrPart_1.concat(sourceObj, arrPart_2);
    }

    if (targetIdx == 0) {
        targetEl.before(sourceEl);
    } else {
        targetEl.after(sourceEl);
    }

    var idxCells = $('.main-table-body tr th');
    var infoLink, tmpId, tmpCell;
    for (var i = 0; i < idxCells.length; i++) {
        try {
            tmpCell = $(idxCells[i]);
            tmpCell.text(i + 1);
            infoLink = $(tmpCell.parent().find('td:eq(2) a')[0]);
            tmpId = infoLink.attr('data-stockid').split("|");
            tmpId[2] = i;
            infoLink.attr('data-stockid', tmpId.join('|'));
        }
        catch (ex) {
            var tempString = '';
        }
    }

    saveData();
};

function addStockToDataTable(stockId) {
    _globalFilterDataList.push({ id: stockId, symbol: '' });
    updateGlobalList();
    var newRow = $(buildStockDataRow(stockId, _globalFilterDataList.length - 1).join(''));
    $('.main-table-body').append(newRow);
    $(newRow.find('.stock_info_cell_alert .fa-bell')).click(onClickStockInfoAlert);
    $(newRow.find('.stock-info-btn')).click(onClickStockInfoName);
    $(newRow.find('.data-button.record-btn')).click(onClickRecordButton);
    $(newRow.find('.data-button.advise-btn')).click(onClickAdviseButton);
    $(newRow.find('.data-button.drag-row-btn')).click(onClickToTopButton);
    bindRowDragEvents(newRow);
};

function checkAdviseScope(stockData) {
    var alertObj = { alert: false, title: '' };
    var advises = stockData.advise;
    var tmpScope;
    if (stockData.amount > 0 && advises.length > 0) {
        if (stockData.buyScope != '') {
            alertObj.alert = checkPriceScope(stockData.buyScope, stockData);
            alertObj.title = alertObj.alert ? "到达买点范围" : alertObj.title;
        }

        if (!alertObj.alert && stockData.stopProfitScope != '') {
            alertObj.alert = checkPriceScope(stockData.buyScope, stockData);
            alertObj.title = alertObj.alert ? "到达止盈范围" : alertObj.title;
        }

        if (!alertObj.alert && stockData.stopLossScope != '') {
            alertObj.alert = checkPriceScope(stockData.buyScope, stockData);
            alertObj.title = alertObj.alert ? "到达止损范围" : alertObj.title;
        }
    }

    return alertObj;
};

function checkPriceScope(scopeStr, stockData) {
    var upVal = 0;
    var downVal = 0;
    var tmpValArr = [];
    var retVal = false;
    if (scopeStr.indexOf('--') > 0) {
        tmpValArr = scopeStr.split('--');
        upVal = tmpValArr[1];
        downVal = tmpValArr[0];
    } else if (scopeStr.indexOf('>') >= 0) {
        tmpValArr = scopeStr.split('>');
        downVal = tmpValArr[1];
    } else if (scopeStr.indexOf('<') >= 0) {
        tmpValArr = scopeStr.split('<');
        downVal = tmpValArr[1];
    }

    if (upVal != 0 && downVal != 0) {
        if (stockData.market.priceTC <= upVal && stockData.market.priceTC >= downVal) {
            retVal = true;
        }
    } else if (upVal == 0 && downVal != 0) {
        if (stockData.market.priceTC >= downVal) {
            retVal = true;
        }
    } else if (upVal != 0 && downVal == 0) {
        if (stockData.market.priceTC <= upVal) {
            retVal = true;
        }
    }
    return retVal;
}

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
            saveData();
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
        _globalFilterDataList[index].symbol = $('#txt_Stock_Info_Advise_Symbol').val();
        saveData();
    });

    $('#tab_Header_Stock_Info a').on('click', function (eventObj) {
        eventObj.preventDefault();
        var hrefStr = $(eventObj.currentTarget).attr('href');
        if (hrefStr == '#tab_KLine_Time_Sharing' && _intervalForRefTimeSharingPlans == null) {
            var imgEl = $('#img_Stock_Info_Time_Sharing');
            var stockId = imgEl.attr('data-target');
            //imgEl.attr('src', _dataURLSina.timeSharing_plans + stockId + '.gif?rnd=' + (new Date()).valueOf());
            _intervalForRefTimeSharingPlans = window.setInterval("startRefereshKLine();", _intervalForRefTimeSharingPlans);
        } else {
            stopRefereshKLine();
        }
    });

    $('#btn_View_All').on('click', function (eventObj) {
        stopRefereshDataTable();
        filterStocksByType('all');
        sortAllStockList();
        buildMainTable();
        updateGlobalList();
    });

    $('#btn_View_Focus').on('click', function (eventObj) {
        stopRefereshDataTable();
        filterStocksByType('focus');
        sortAllStockList(true);
        buildMainTable();
        updateGlobalList();
    });

    $('#btn_View_Position').on('click', function (eventObj) {
        stopRefereshDataTable();
        filterStocksByType('position');
        buildMainTable();
        updateGlobalList()
    });

    $('#btn_View_Loss').on('click', function (eventObj) {
        stopRefereshDataTable();
        filterStocksByType('loss');
        _globalFilterDataList.sort(function (a, b) {
            return _globalDataObj.stocks[b.id].totalPL - _globalDataObj.stocks[a.id].totalPL;
        });

        buildMainTable();
        updateGlobalList()
    });

    $('#btn_View_Profit').on('click', function (eventObj) {
        stopRefereshDataTable();
        filterStocksByType('profit');
        _globalFilterDataList.sort(function (a, b) {
            return _globalDataObj.stocks[a.id].totalPL - _globalDataObj.stocks[b.id].totalPL;
        });

        buildMainTable();
        updateGlobalList()
    });

    $('#stockInfoModal').on('shown.bs.modal', function (e) {        
        $('#tab_Header_Stock_Info a:first').tab('show');
        $('#stockInfoModal .tab-content .tab-pane').removeClass('show').removeClass('active');
        $('#stockInfoModal .tab-content .tab-pane:first').addClass('show').addClass('active');
    });

    $('#stockInfoModal').on('hidden.bs.modal', function (e) {
        stopRefereshStockInfoModal();
        stopRefereshKLine();
    });

    $('#recordModal').on('hidden.bs.modal', function (e) {
        $('.record-item-list-tbody').empty();
        stopRefereshRecordModal();
    });

    $('#adviseModal').on('hidden.bs.modal', function (e) {
        $('.advise-item-list-tbody').empty();
        stopRefereshAdviseModal();
    });

    $('#btn_Record_Add_Item').on('click', function () {
        startEditRecordItem($(arguments[0].currentTarget).attr('data-target'));
    });

    $('.btn-reomve-record-item-Cancel').on('click', function () {
        $('.alert-remove-record-item-mask').hide();
    });

    $('.btn-reomve-record-item-OK').on('click', function () {
        $('.alert-remove-record-item-mask').hide();
        var tmpStr = $(arguments[0].currentTarget).attr("data-target");
        var stockId = tmpStr.split('|')[0];
        var recordIndex = parseInt(tmpStr.split('|')[1]);
        var recordList = _globalDataObj.stocks[stockId].records;
        var tmpHTML, recObj;
        if (recordList.length > recordIndex && recordIndex >= 0) {
            recordList.splice(recordIndex, 1);
        }

        refereshRecordTitle(stockId);
        refereshRecordDetail(stockId);
        refereshRecordSummary(stockId);
        saveData()
    });

    $('#btn_Advise_Add_Item').on('click', function () {
        startEditAdviseItem($(arguments[0].currentTarget).attr('data-target'));
    });

    $('.btn-reomve-advise-item-Cancel').on('click', function () {
        $('.alert-remove-advise-item-mask').hide();
    });

    $('.btn-reomve-advise-item-OK').on('click', function () {
        $('.alert-remove-advise-item-mask').hide();
        var tmpStr = $(arguments[0].currentTarget).attr("data-target");
        var stockId = tmpStr.split('|')[0];
        var adviseIndex = parseInt(tmpStr.split('|')[1]);
        var adviseList = _globalDataObj.stocks[stockId].advise;
        var tmpHTML, advObj;
        if (adviseList.length > adviseIndex && adviseIndex >= 0) {
            adviseList.splice(adviseIndex, 1);
        }

        refereshAdviseDetail(stockId);
    });

    $('#txt_Advise_Fundamentals').on('change', function () {
        var stockId = $('#txt_Advise_Fundamentals').attr('data-target');
        _globalDataObj.stocks[stockId].fundamentals = $('#txt_Advise_Fundamentals').val();
    });

    $('#txt_Advise_Technical').on('change', function () {
        var stockId = $('#txt_Advise_Technical').attr('data-target');
        _globalDataObj.stocks[stockId].technical = $('#txt_Advise_Technical').val();
    });
};

function filterStock_Position() {
    _globalFilterDataList = [];
    _globalFilterOutList = [];
    var tmpStock;
    for (var i = 0; i < _globalDataObj.list.length; i++) {
        tmpStock = _globalDataObj.stocks[_globalDataObj.list[i].id];
        if (tmpStock.amount > 0) {
            _globalFilterDataList.push({ id: _globalDataObj.list[i].id, symbol: _globalDataObj.list[i].symbol });
        } else {
            _globalFilterOutList.push({ id: _globalDataObj.list[i].id, symbol: _globalDataObj.list[i].symbol });
        }
    }
};

function filterStock_ProfitLoss(flag) {
    var tmpStock;
    _globalFilterDataList = [];
    _globalFilterOutList = [];
    for (var i = 0; i < _globalDataObj.list.length; i++) {
        tmpStock = _globalDataObj.stocks[_globalDataObj.list[i].id];
        if (tmpStock.amount == 0) {
            if (tmpStock.records.length > 0 && ((flag == 1 && tmpStock.totalPL >= 0) || (flag == -1 && tmpStock.totalPL < 0))) {
                _globalFilterDataList.push({ id: _globalDataObj.list[i].id, symbol: _globalDataObj.list[i].symbol });
            } else {
                _globalFilterOutList.push({ id: _globalDataObj.list[i].id, symbol: _globalDataObj.list[i].symbol });
            }
        } else {
            _globalFilterOutList.push({ id: _globalDataObj.list[i].id, symbol: _globalDataObj.list[i].symbol });
        }
    }
}

function filterStock_Focus() {
    _globalFilterDataList = [];
    _globalFilterOutList = [];
    var tmpStock;
    for (var i = 0; i < _globalDataObj.list.length; i++) {
        tmpStock = _globalDataObj.stocks[_globalDataObj.list[i].id];
        if (_globalDataObj.list[i].symbol != "" || tmpStock.amount > 0) {
            _globalFilterDataList.push({ id: _globalDataObj.list[i].id, symbol: _globalDataObj.list[i].symbol });
        } else {
            _globalFilterOutList.push({ id: _globalDataObj.list[i].id, symbol: _globalDataObj.list[i].symbol });
        }
    }
};

function filterStocksByType(type) {
    switch (type) {
        case 'position':
            filterStock_Position();
            break;
        case 'profit':
        case 'loss':
            filterStock_ProfitLoss(type == "loss" ? -1 : 1);
            break;
        case 'all':
            _globalFilterDataList = _globalDataObj.list;
            _globalFilterOutList = [];
            break;
        case 'focus':
            filterStock_Focus();
            break;
    }

    updateFooterContent();
};

function updateGlobalList() {
    _globalDataObj.list = _globalFilterDataList.concat(_globalFilterOutList);
};

function updateFooterContent(type) {
    var profitCount = 0;
    var lossCount = 0;
    var totalProfit = 0;
    var totalLoss = 0;
    var totalAmount = 0;
    var positionCount = 0;
    var totalValue = 0;
    var tmpObj = null;
    for (var i = 0; i < _globalFilterDataList.length; i++) {
        tmpObj = _globalDataObj.stocks[_globalFilterDataList[i].id];
        if (tmpObj.totalPL > 0) {
            totalProfit += tmpObj.totalPL;
            profitCount++;
        } else {
            totalLoss += tmpObj.totalPL;
            lossCount++;
        }

        if (tmpObj.amount > 0) {
            positionCount++;
            totalAmount += tmpObj.amount;
            totalValue += tmpObj.market.priceTC == 0 ? tmpObj.amount * tmpObj.market.priceYC : tmpObj.amount * tmpObj.market.priceTC;
        }
    }

    var tmpHTMLArr = [];
    switch (type) {
        case 'position':
            tmpHTMLArr.push('总计持有: <span class="text-info">' + _globalFilterDataList.length + "</span>支股票");
            tmpHTMLArr.push('持仓数量: <span class="text-info">' + totalAmount + "</span>股");
            tmpHTMLArr.push('持仓市值: <span class="text-info">' + totalValue.toFixed(2) + "</span>股");
            tmpHTMLArr.push('其中盈利: <span class="text-danger">' + profitCount + '</span>支');
            tmpHTMLArr.push('共计:<span class="text-danger">' + totalProfit.toFixed(2) + "</span>");
            tmpHTMLArr.push('其中亏损: <span class="text-success">' + lossCount + '</span>支');
            tmpHTMLArr.push('共计:<span class="text-success">' + Math.abs(totalLoss).toFixed(2) + "</span>");
            tmpHTMLArr.push('总计' + (totalProfit + totalLoss > 0 ? '盈利' : '亏损') + ':<span class="' + (totalProfit + totalLoss > 0 ? 'text-danger' : 'text-success') + '">' + Math.abs(totalProfit + totalLoss).toFixed(2) + "</span>");
            break;
        case 'profit':
            tmpHTMLArr.push('总计: <span class="text-danger">' + _globalFilterDataList.length + '</span>支股票盈利, 盈利总额:<span class="text-danger">' + (totalProfit + totalLoss).toFixed(2) + "</span>");
            break;
        case 'loss':
            tmpHTMLArr.push('总计: <span class="text-success">' + _globalFilterDataList.length + '</span>支股票亏损, 亏损总额:<span class="text-success">' + Math.abs(totalProfit + totalLoss).toFixed(2)) + "</span>";
            break;
        case 'all':
        default:
            tmpHTMLArr.push('总计: <span class="text-info">' + _globalFilterDataList.length + "</span>支股票");
            tmpHTMLArr.push('总计持有: <span class="text-info">' + positionCount + "</span>支股票");
            tmpHTMLArr.push('持仓数量: <span class="text-info">' + totalAmount + "</span>股");
            tmpHTMLArr.push('持仓市值: <span class="text-info">' + totalValue.toFixed(2) + "</span>股");
            tmpHTMLArr.push('其中盈利: <span class="text-danger">' + profitCount + '</span>支');
            tmpHTMLArr.push('共计:<span class="text-danger">' + totalProfit.toFixed(2) + "</span>");
            tmpHTMLArr.push('其中亏损: <span class="text-success">' + lossCount + '</span>支');
            tmpHTMLArr.push('共计:<span class="text-success">' + Math.abs(totalLoss).toFixed(2) + "</span>");
            tmpHTMLArr.push('总计' + (totalProfit + totalLoss > 0 ? '盈利' : '亏损') + ':<span class="' + (totalProfit + totalLoss > 0 ? 'text-danger' : 'text-success') + '">' + Math.abs(totalProfit + totalLoss).toFixed(2) + "</span>");
            break;
    }

    $('#footer_Data_View').html(tmpHTMLArr.join(','));
}

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

function sortAllStockList(useTmpList) {
    var tmpList = _globalDataObj.list;
    if (typeof useTmpList != 'undefined' && useTmpList === true) {
        tmpList = _globalFilterDataList;
    }

    var symbolList = [];
    var positionList = [];
    var otherList = [];
    var tmpObj = null;
    for (var i = 0; i < tmpList.length; i++) {
        if (tmpList[i].symbol != "") {
            symbolList.push(tmpList[i]);
        } else if (_globalDataObj.stocks[tmpList[i].id].amount > 0) {
            positionList.push(tmpList[i]);
        } else {
            otherList.push(tmpList[i]);
        }
    }

    symbolList.sort(function (a, b) {
        return parseInt(a.symbol.substr(2)) - parseInt(b.symbol.substr(2));
    });

    positionList.sort(function (a, b) {
        return _globalDataObj.stocks[a.id].amount - _globalDataObj.stocks[b.id].amount;
    });

    otherList.sort(function (a, b) {
        return _globalDataObj.stocks[a.id].totalPL - _globalDataObj.stocks[b.id].totalPL;
    });

    _globalFilterDataList = symbolList.concat(positionList, otherList);
}

function initPage() {
    _loadStockList();
    initEvents();
    $('.main-wrap').height($('body').height() - $('header').height() - $('footer').height() - 5);
};

/*Referesh Interval Function*/
function stopRefereshStockInfoModal() {
    window.clearInterval(_intervalForRefStockInfo);
    _intervalForRefStockInfo = null;
};

function startRefereshStockInforModal(stockId) {
    stockId = stockId.split('|');
    var symbol = stockId[1];
    var index = stockId[2];
    stockId = stockId[0];
    var tmpObj = _globalDataObj.stocks[stockId].market;
    $('#txt_Stock_Info_Stock_Name').text(tmpObj.name);
    $('#txt_Stock_Info_Stock_ID').text(tmpObj.id);
    $('#txt_Stock_Info_Advise_Symbol').val(symbol);
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

    var tmpPrice;
    var tmpTotalBuy = 0;
    var tmpTotalSell = 0;
    for (var i = 1; i < 6; i++) {
        tmpPrice = tmpObj['bid_' + i + '_P'];
        $('.five-position-table .position-b-' + i + '-p').text(tmpPrice.toFixed(2)).css('color', tmpPrice == tmpObj.priceYC ? "black" : tmpPrice > tmpObj.priceYC ? 'red' : 'green');
        $('.five-position-table .position-b-' + i + '-a').text(tmpObj['bid_' + i + '_A']);
        tmpPrice = tmpObj['auc_' + i + '_P'];
        $('.five-position-table .position-s-' + i + '-p').text(tmpPrice.toFixed(2)).css('color', tmpPrice == tmpObj.priceYC ? "black" : tmpPrice > tmpObj.priceYC ? 'red' : 'green');
        $('.five-position-table .position-s-' + i + '-a').text(tmpObj['auc_' + i + '_A'])
        tmpTotalBuy += tmpObj['bid_' + i + '_A'];
        tmpTotalSell += tmpObj['auc_' + i + '_A'];
    }

    $('.five-position-table .position-deal-p').text(tmpObj.priceTC.toFixed(2)).css('color', tmpObj.priceTC == tmpObj.priceYC ? "black" : tmpObj.priceTC > tmpObj.priceYC ? 'red' : 'green');
    $('.five-position-table .inner-disc').text(tmpObj.amountSell);
    $('.five-position-table .outer-disc').text(tmpObj.amountBuy);
    tmpPrice = tmpTotalBuy - tmpTotalSell;
    $('.five-position-table .entrust-rate').text(Math.abs(tmpPrice / (tmpTotalBuy + tmpTotalSell) * 100).toFixed(2) + '%').css('color', tmpPrice == 0 ? "black" : tmpPrice > 0 ? 'red' : 'green');
    $('.five-position-table .entrust-deviation').text(Math.abs(tmpPrice)).css('color', tmpPrice == 0 ? "black" : tmpPrice > 0 ? 'red' : 'green');
};

function stopRefereshKLine() {
    window.clearInterval(_intervalForRefTimeSharingPlans);
    _intervalForRefTimeSharingPlans = null;
    $('#img_Stock_Info_Time_Sharing').attr('src', '');
};

function startRefereshKLine() {
    $('#img_Stock_Info_Time_Sharing').attr('src', _dataURLSina.timeSharing_plans + $('#img_Stock_Info_Time_Sharing').attr('data-target') + '.gif');
};

function stopRefereshDataTable() {
    window.clearInterval(_intervalForRefMainTB);
    _intervalForRefMainTB = null;
};

function startRefereshDataTable() {
    loadStockData(null, false);
    var currData, currMarket, tmpVal, tmpColor, stockId, currRowId, alertItem, alertObj;
    var todayTotal = 0;
    var allTotal = 0;
    try {
        for (var i = 0; i < _globalFilterDataList.length; i++) {
            stockId = _globalFilterDataList[i].id;
            currData = _globalDataObj.stocks[stockId];
            currMarket = currData.market;
            currRowId = '#stock_info_row_' + stockId;
            tmpColor = (currMarket.rise_fall == 0 ? 'black' : currMarket.rise_fall > 0 ? 'red' : 'green');
            $(currRowId).css('color', tmpColor);
            $(currRowId + ' .stock_info_cell_symbol').text(_globalFilterDataList[i].symbol);
            //$(currRowId + ' .stock_info_cell_alert').text(_globalFilterDataList[i].symbol);
            $(currRowId + ' .stock_info_cell_priceYC').text(formatValue(currMarket.priceYC, true));
            $(currRowId + ' .stock_info_cell_priceTO').text(formatValue(currMarket.priceTO, true));
            $(currRowId + ' .stock_info_cell_priceTC').text(formatValue(currMarket.priceTC, true));
            tmpVal = (currMarket.priceYC == currMarket.priceTC) ? "0.00" : formatValue(currMarket.rise_fall, true);
            $(currRowId + ' .stock_info_cell_rise_fall').text(tmpVal);
            tmpVal = (currMarket.priceYC == currMarket.priceTC) ? "0.00" : formatValue(currMarket.rise_fall_ratio, true);
            $(currRowId + ' .stock_info_cell_rise_fall_ratio').text(tmpVal + '%');
            $(currRowId + ' .stock_info_cell_priceTX').text(formatValue(currMarket.priceTX, true));
            $(currRowId + ' .stock_info_cell_priceTM').text(formatValue(currMarket.priceTM, true));
            $(currRowId + ' .stock_info_cell_costPrice').text(formatValue(currData.costPrice, true));
            $(currRowId + ' .stock_info_cell_amount').text((currData.amount == 0 ? '-' : currData.amount.toFixed(2)));
            $(currRowId + ' .stock_info_cell_totalValue').text(currData.amount == 0 ? '-' : formatValue(currData.totalCost, true));
            $(currRowId + ' .stock_info_cell_todayPL').text(currData.amount == 0 ? '-' : formatValue(currMarket.rise_fall * currData.amount, true));
            todayTotal += currData.amount == 0 ? 0 : currMarket.rise_fall * currData.amount;
            tmpVal = currData.amount == 0 ? currData.totalPL : (currMarket.priceTC - currData.costPrice) * currData.amount;
            allTotal += tmpVal;
            $(currRowId + ' .stock_info_cell_totalPL').text(formatValue(tmpVal, true)).css('color', tmpVal != 0 ? (tmpVal > 0 ? "red" : "green") : "black");
            tmpVal = _globalDataObj.stocks[stockId].advise;
            tmpVal = tmpVal.length == 0 ? { buyScope: '-', stopProfitScope: '-', stopLossScope: '-' } : tmpVal[tmpVal.length - 1];
            $(currRowId + ' .stock_info_cell_advise_buy').text(_globalDataObj.stocks[stockId].buyScope == '' ? '-' : _globalDataObj.stocks[stockId].buyScope);
            $(currRowId + ' .stock_info_cell_advise_profit').text(_globalDataObj.stocks[stockId].stopProfitScope == '' ? '-' : _globalDataObj.stocks[stockId].stopProfitScope);
            $(currRowId + ' .stock_info_cell_advise_loss').text(_globalDataObj.stocks[stockId].stopLossScope == '' ? '-' : _globalDataObj.stocks[stockId].stopLossScope);
            alertItem = $(currRowId + ' .stock_info_cell_alert .fa-bell');
            alertObj = checkAdviseScope(currData);
            alertItem.attr('title', alertObj.title);
            if (alertObj.alert && !alertItem.hasClass('fa-spin')) {
                alertItem.attr('data-prefix', 'fas');
                alertItem.addClass('fa-spin').css('font-size', '15px');
            } else if (!alertObj.alert) {
                alertItem.attr('data-prefix', 'far');
                alertItem.removeClass('fa-spin').css('font-size', '12px');
            }
        }

        $('#text_Today_PL_Total').text(todayTotal.toFixed(2)).css('color', todayTotal != 0 ? (todayTotal > 0 ? "red" : "green") : "black");
        $('#text_All_PL_Total').text(allTotal.toFixed(2)).css('color', allTotal != 0 ? (allTotal > 0 ? "red" : "green") : "black");
    }
    catch (ex) {
        console.log(stockId);
    }
};

/*Stock Data Loader*/
//1. 0: 未知 
//2. 1: 名字 
//3. 2: 代码 
//4. 3: 当前价格 
//5. 4: 昨收 
//6. 5: 今开 
//7. 6: 成交量（手） 
//8. 7: 外盘 
//9. 8: 内盘 
//10. 9: 买一 
//11. 10: 买一量（手） 
//12. 11-18: 买二 买五 
//13. 19: 卖一 
//14. 20: 卖一量 
//15. 21-28: 卖二 卖五 
//16. 29: 最近逐笔成交 
//17. 30: 时间 
//18. 31: 涨跌 
//19. 32: 涨跌% 
//20. 33: 最高 
//21. 34: 最低 
//22. 35: 价格/成交量（手）/成交额 
//23. 36: 成交量（手） 
//24. 37: 成交额（万） 
//25. 38: 换手率 
//26. 39: 市盈率 
//27. 40: 
//28. 41: 最高 
//29. 42: 最低 
//30. 43: 振幅 
//31. 44: 流通市值 
//32. 45: 总市值 
//33. 46: 市净率 
//34. 47: 涨停价 
//35. 48: 跌停价
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
        if (key.indexOf('sz') == 0 || key.indexOf('sh') == 0) {
            if (!window['v_' + key]) {
                console.log(key);
                continue;
            }
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

        StockLoader.calcCostPrice(key);
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
        totalCost: 0,
        totalPL: 0
    };
    StockLoader.record(stockId);
    StockLoader.advise(stockId);
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
            amt: isNaN(currRec.attr('a')) ? 0 : Math.abs(parseInt(currRec.attr('a'))),
            flag: currRec.attr('f'),
            charge: isNaN(currRec.attr('c')) ? 0 : parseFloat(currRec.attr('c')),
            tax: isNaN(currRec.attr('x')) ? 0 : parseFloat(currRec.attr('x')),
            fee: isNaN(currRec.attr('e')) ? 0 : parseFloat(currRec.attr('e')),
        });
    }
};

StockLoader.advise = function (stockId) {
    var advRoot = _historyDoc.find('stock[id="' + stockId + '"] advise');
    var advEls = advRoot.find('i');
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

        newAdviseObj.buyScope = formatAdviseScope(newAdviseObj.buyDown, newAdviseObj.buyUp, false);
        newAdviseObj.stopProfitScope = formatAdviseScope(newAdviseObj.stopProfitDown, newAdviseObj.stopProfitUp, true);
        newAdviseObj.stopLossScope = formatAdviseScope(newAdviseObj.stopLossDown, newAdviseObj.stopLossUp, false);
        _globalDataObj.stocks[stockId].advise.push(newAdviseObj);
        _globalDataObj.stocks[stockId].fundamentals = $(advRoot.find('fundamentals')[0]).text();
        _globalDataObj.stocks[stockId].technical = $(advRoot.find('technical')[0]).text();
        if (newAdviseObj.buyScope != '') {
            _globalDataObj.stocks[stockId].buyScope = newAdviseObj.buyScope;
        }

        if (newAdviseObj.stopProfitScope != '') {
            _globalDataObj.stocks[stockId].stopProfitScope = newAdviseObj.stopProfitScope;
        }

        if (newAdviseObj.stopLossScope != '') {
            _globalDataObj.stocks[stockId].stopLossScope = newAdviseObj.stopLossScope;
        }
    }
};

StockLoader.calcCostPrice = function (stockId) {
    var stockObj = _globalDataObj.stocks[stockId];
    var tmpData = StockLoader.calcSummaryData(stockId);
    stockObj.amount = tmpData.amount;
    stockObj.totalCost = tmpData.cost;
    stockObj.costPrice = tmpData.price;
    stockObj.totalPL = tmpData.PL;
};

StockLoader.calcSummaryData = function (stockId) {
    var stockObj = _globalDataObj.stocks[stockId];
    var recs = stockObj.records;
    var price, amount, flag, cost, tax, fee;
    var totalAmount = 0;
    var totalBuy = 0;
    var totalSell = 0;
    var totalFee = 0;
    for (var i = 0; i < recs.length; i++) {
        if (recs[i].flag == "b") {
            totalFee += recs[i].charge + recs[i].fee + recs[i].tax;
            totalAmount += recs[i].amt;
            totalBuy += recs[i].amt * recs[i].price;
        } else if (recs[i].flag == "s") {
            totalFee += recs[i].charge + recs[i].fee + recs[i].tax;
            totalAmount -= recs[i].amt;
            totalSell += recs[i].amt * recs[i].price;
        } else if (recs[i].flag == "r") {
            totalAmount += recs[i].amt;
        } else if (recs[i].flag == "d") {
            totalFee -= recs[i].fee;
        } else if (recs[i].flag == "t") {
            totalFee += recs[i].fee;
        }
    }

    var totalCost = totalBuy - totalSell + totalFee;
    var costPrice = (totalAmount == 0 ? 0 : totalCost / totalAmount);
    return {
        amount: totalAmount,
        cost: (totalAmount == 0 ? 0 : totalCost),
        price: (totalAmount == 0 ? 0 : costPrice),
        PL: totalAmount == 0 ? totalSell - totalBuy - totalFee + (stockObj.market.priceTC - costPrice) * totalAmount : ((stockObj.market.priceTC == 0 ? stockObj.market.priceYC : stockObj.market.priceTC) - costPrice) * totalAmount
    }
}

/*Record Modal*/
function startRefereshRecordModal(stockId) {
    var dataObj = _globalDataObj.stocks[stockId].market;
    $('#recordModal .stock-info-row .current-price').text(dataObj.priceTC);
    $('#recordModal .stock-info-row .current-price').css('color', (dataObj.priceTC == dataObj.priceYC ? "black" : dataObj.priceTC > dataObj.priceYC ? "red" : "green"));
    refereshRecordSummary(stockId);
};

function stopRefereshRecordModal() {
    window.clearInterval(_intervalForRefRecordModal);
};

function refereshRecordTitle(stockId) {
    var dataObj = _globalDataObj.stocks[stockId].market;
    $('#recordModal .stock-info-row .stock-name').text(dataObj.name);
    $('#recordModal .stock-info-row .stock-code').text('(' + dataObj.id + ')');
    $('#recordModal .stock-info-row .current-price').text(dataObj.priceTC);
    $('#btn_Record_Add_Item').attr("data-target", stockId);
    _intervalForRefRecordModal = window.setInterval('startRefereshRecordModal("' + stockId + '");', _intervalForRefRecordModal_Time);
};

function refereshRecordSummary(stockId) {
    UpdatePositionDetailRow(stockId, '#recordModal');
};

function refereshRecordDetail(stockId) {
    var tbody = $('#recordModal .record-item-list-tbody');
    tbody.empty();
    var recordList = _globalDataObj.stocks[stockId].records;
    var tmpHTML, recObj;
    for (var i = 0; i < recordList.length; i++) {
        tmpHTML = [];
        recObj = recordList[i];

        tmpHTML.push('<tr>')
        tmpHTML.push('  <th scope="row">' + (i + 1) + '</th>');
        tmpHTML.push('  <td>' + (recObj.flag == "b" ? '买入' : recObj.flag == "s" ? '卖出' : recObj.flag == "r" ? "红股" : recObj.flag == "d" ? "股息" : "利税") + '</td>');
        tmpHTML.push('  <td>' + formatDateString(recObj.date) + '</td>');
        tmpHTML.push('  <td class="text-right">' + recObj.amt + '</td>');
        tmpHTML.push('  <td class="text-right">' + recObj.price.toFixed(2) + '</td>');
        tmpHTML.push('  <td class="text-right">' + recObj.charge.toFixed(2) + '</td>');
        tmpHTML.push('  <td class="text-right">' + recObj.tax.toFixed(2) + '</td>');
        tmpHTML.push('  <td class="text-right">' + recObj.fee.toFixed(2) + '</td>');
        tmpHTML.push('  <td>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-primary btn-record-item-edit" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-edit"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-warning btn-record-item-remove" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-trash-alt"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-danger btn-record-item-edit-cancel" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-times"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-success btn-record-item-edit-ok" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-check"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('  </td>');
        tmpHTML.push('</tr>');
        tbody.append($(tmpHTML.join('')));
    }

    bindRecordItemEvents();
};

function bindRecordItemEvents() {
    $('#recordModal .record-item-list-tbody .btn-record-item-edit').unbind();
    $('#recordModal .record-item-list-tbody .btn-record-item-remove').unbind();
    $('#recordModal .record-item-list-tbody .btn-record-item-edit-cancel').unbind();
    $('#recordModal .record-item-list-tbody .btn-record-item-edit-ok').unbind();
    $('#recordModal .record-item-list-tbody .btn-record-item-edit').click(startEditRecordItem);
    $('#recordModal .record-item-list-tbody .btn-record-item-remove').click(removeRecordItem);
    $('#recordModal .record-item-list-tbody .btn-record-item-edit-cancel').click(cancelEditRecordItem);
    $('#recordModal .record-item-list-tbody .btn-record-item-edit-ok').click(confirmEditRecordItem);
};

function adjustRecordOptBtnStatus(isEdit, rowIndex) {
    if (isEdit) {
        $('.record-item-list-tbody tr:eq(' + rowIndex + ') td .btn-record-item-edit').hide();
        $('.record-item-list-tbody tr:eq(' + rowIndex + ') td .btn-record-item-remove').hide();
        $('.record-item-list-tbody tr:eq(' + rowIndex + ') td .btn-record-item-edit-cancel').show();
        $('.record-item-list-tbody tr:eq(' + rowIndex + ') td .btn-record-item-edit-ok').show();
    } else {
        $('#recordModal .record-item-list-tbody .btn-record-item-edit').show();
        $('#recordModal .record-item-list-tbody .btn-record-item-remove').show();
        $('#recordModal .record-item-list-tbody .btn-record-item-edit-cancel').hide();
        $('#recordModal .record-item-list-tbody .btn-record-item-edit-ok').hide();
    }
}

function stopEditRecordItem() {
    adjustRecordOptBtnStatus(false);
    var tmpMapItem, tmpVal;
    var container = $('.record-item-list-container');
    for (var i = 0; i < _recordColFieldValuMapping.length; i++) {
        tmpMapItem = _recordColFieldValuMapping[i];
        container.append($(tmpMapItem.id).hide());
    }

    if (_editingRecordItem.obj != null) {
        if ((_editingRecordItem.obj.amt == 0 || _editingRecordItem.obj.price == 0) && _editingRecordItem.stockId != '') {
            if (_globalDataObj.stocks[_editingRecordItem.stockId].records.length < $('.record-item-list-tbody tr').length) {
                $('.record-item-list-tbody tr:last').remove();
                return;
            }
        }

        var cells = $('.record-item-list-tbody tr:eq(' + _editingRecordItem.rowIdx + ') td');
        for (var i = 0; i < _recordColFieldValuMapping.length; i++) {
            tmpMapItem = _recordColFieldValuMapping[i];
            tmpVal = _editingRecordItem.obj[tmpMapItem.key];
            if (i == 0) {
                $(cells[i]).text(tmpVal == "b" ? '买入' : tmpVal == "s" ? '卖出' : tmpVal == "r" ? "红股" : tmpVal == "d" ? "股息" : "利税");
            } else {
                $(cells[i]).text(tmpMapItem.convert(tmpVal));
            }
        }

        _editingRecordItem = { obj: null, rowIdx: -1, stockId: '' };
    }
};

function startEditRecordItem(arg) {
    stopEditRecordItem();
    var recIdx = 0;
    var stockId = '';
    var currRec = null;
    if (typeof arg != "string") {
        var tmpStr = $(arg.currentTarget).attr("data-target");
        stockId = tmpStr.split('|')[0];
        recIdx = parseInt(tmpStr.split('|')[1]);
        currRec = _globalDataObj.stocks[stockId].records[recIdx];
    } else {
        var rows = $('.record-item-list-tbody').find('tr');
        recIdx = rows.length;
        stockId = arg;
        buildNewRecordItemRow(stockId, recIdx);
        currRec = { date: (new Date()).toLocaleDateString(), time: "00:00:00", price: 0, amt: 0, flag: 'b', charge: 0, tax: 0, fee: 0 };
    }

    _editingRecordItem = { obj: currRec, rowIdx: recIdx, stockId: stockId };
    adjustRecordOptBtnStatus(true, recIdx);
    var cells = $('.record-item-list-tbody tr:eq(' + recIdx + ') td');
    var tmpMapItem, tmpVal;
    for (var i = 0; i < cells.length - 1; i++) {
        tmpMapItem = _recordColFieldValuMapping[i];
        $(cells[i]).text("").append($(tmpMapItem.id).show());
        $(tmpMapItem.id).val(tmpMapItem.convert(currRec[tmpMapItem.key]));
    }
}

function cancelEditRecordItem() {
    var tmpStr = $(arguments[0].currentTarget).attr("data-target");
    var stockId = tmpStr.split('|')[0];
    var recIdx = parseInt(tmpStr.split('|')[1]);
    var recList = _globalDataObj.stocks[stockId].records;
    stopEditRecordItem();
    if (typeof recList[recIdx] != 'undefined' && recList[recIdx] != null) {
        _editingRecordItem = { obj: recList[recIdx], rowIdx: recIdx, stockId: stockId };
    } else if ($('.record-item-list-tbody tr:eq(' + recIdx + ')').length > 0) {
        _editingRecordItem = { obj: null, rowIdx: -1, stockId: '' };
        $('.record-item-list-tbody tr:eq(' + recIdx + ')').remove();
    }
};

function confirmEditRecordItem() {
    var tmpStr = $(arguments[0].currentTarget).attr("data-target");
    var stockId = tmpStr.split('|')[0];
    var recIdx = parseInt(tmpStr.split('|')[1]);
    var recList = _globalDataObj.stocks[stockId].records;
    var currRec = null;
    if (recIdx >= recList.length) {
        currRec = { date: (new Date()).toLocaleDateString(), time: "00:00:00", price: 0, amt: 0, flag: 'b', charge: 0, tax: 0, fee: 0 };
        recList.push(currRec);
    } else {
        currRec = recList[recIdx];
    }

    var tmpMapItem;
    for (var i = 0; i < _recordColFieldValuMapping.length; i++) {
        tmpMapItem = _recordColFieldValuMapping[i];
        currRec[tmpMapItem.key] = tmpMapItem.format($(tmpMapItem.id).val());
    }

    saveData();

    _editingRecordItem = { obj: currRec, rowIdx: recIdx, stockId: stockId };
    stopEditRecordItem();
    refereshRecordSummary(stockId);
};

function buildNewRecordItemRow(stockId, recIdx) {
    tmpHTML = [];
    tmpHTML.push('<tr>')
    tmpHTML.push('  <th scope="row">' + (recIdx + 1) + '</th>');
    tmpHTML.push('  <td></td>');
    tmpHTML.push('  <td></td>');
    tmpHTML.push('  <td class="text-right"></td>');
    tmpHTML.push('  <td class="text-right"></td>');
    tmpHTML.push('  <td class="text-right"></td>');
    tmpHTML.push('  <td class="text-right"></td>');
    tmpHTML.push('  <td class="text-right"></td>');
    tmpHTML.push('  <td>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-primary btn-record-item-edit" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-edit"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-warning btn-record-item-remove" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-trash-alt"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-danger btn-record-item-edit-cancel" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-times"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-success btn-record-item-edit-ok" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-check"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('  </td>');
    tmpHTML.push('</tr>');
    $('.record-item-list-tbody').append($(tmpHTML.join('')));
    bindRecordItemEvents();
};

function removeRecordItem(eventObj) {
    var tmpStr = $(eventObj.currentTarget).attr("data-target");
    var stockId = tmpStr.split('|')[0];
    var recordIndex = parseInt(tmpStr.split('|')[1]);
    var tbody = $('#alert_Remove_Record_Item .remove-record-item-tbody');
    tbody.empty();
    var recordList = _globalDataObj.stocks[stockId].records;
    var tmpHTML, recObj;
    if (recordList.length > recordIndex && recordIndex >= 0) {
        tmpHTML = [];
        recObj = recordList[recordIndex];
        tmpHTML.push('<tr class="text-center">')
        tmpHTML.push('  <td>' + (recObj.flag == "b" ? '买入' : recObj.flag == "s" ? '卖出' : recObj.flag == "r" ? "红股" : recObj.flag == "d" ? "股息" : "利税") + '</td>');
        tmpHTML.push('  <td>' + formatDateString(recObj.date) + '</td>');
        tmpHTML.push('  <td>' + recObj.amt + '</td>');
        tmpHTML.push('  <td>' + recObj.price.toFixed(2) + '</td>');
        tmpHTML.push('  <td>' + recObj.charge.toFixed(2) + '</td>');
        tmpHTML.push('  <td>' + recObj.tax.toFixed(2) + '</td>');
        tmpHTML.push('  <td>' + recObj.fee.toFixed(2) + '</td>');
        tmpHTML.push('</tr>');
        tbody.append($(tmpHTML.join('')));
    }

    $('.btn-reomve-record-item-OK').attr('data-target', tmpStr);
    $('.alert-remove-record-item-mask').show();
};

/*Advise Modal*/
function startRefereshAdviseModal(stockId) {
    var dataObj = _globalDataObj.stocks[stockId].market;
    $('#adviseModal .stock-info-row .current-price').text(dataObj.priceTC);
    $('#adviseModal .stock-info-row .current-price').css('color', (dataObj.priceTC == dataObj.priceYC ? "black" : dataObj.priceTC > dataObj.priceYC ? "red" : "green"));
    refereshAdviseSummary(stockId);
};

function stopRefereshAdviseModal() {
    window.clearInterval(_intervalForRefAdviseModal);
};

function refereshAdviseTitle(stockId) {
    var dataObj = _globalDataObj.stocks[stockId].market;
    $('#adviseModal .stock-info-row .stock-name').text(dataObj.name);
    $('#adviseModal .stock-info-row .stock-code').text('(' + dataObj.id + ')');
    $('#adviseModal .stock-info-row .current-price').text(dataObj.priceTC);
    $('#btn_Advise_Add_Item').attr("data-target", stockId);
    $('#txt_Advise_Fundamentals').attr("data-target", stockId);
    $('#txt_Advise_Technical').attr("data-target", stockId);
    $('#txt_Advise_Fundamentals').val(_globalDataObj.stocks[stockId].fundamentals);
    $('#txt_Advise_Technical').val(_globalDataObj.stocks[stockId].technical);
    _intervalForRefAdviseModal = window.setInterval('startRefereshAdviseModal("' + stockId + '");', _intervalForRefAdviseModal_Time);
};

function refereshAdviseSummary(stockId) {
    UpdatePositionDetailRow(stockId, '#adviseModal');
};

function refereshAdviseDetail(stockId) {
    var tbody = $('#adviseModal .advise-item-list-tbody');
    tbody.empty();
    var adviseList = _globalDataObj.stocks[stockId].advise;
    var tmpHTML, advObj;
    for (var i = 0; i < adviseList.length; i++) {
        tmpHTML = [];
        advObj = adviseList[i];
        tmpHTML.push('<tr>')
        tmpHTML.push('  <th scope="row">' + (i + 1) + '</th>');
        tmpHTML.push('  <td>' + formatDateString(advObj.date) + '</td>');
        tmpHTML.push('  <td>' + advObj.buyScope + '</td>');
        tmpHTML.push('  <td>' + advObj.stopProfitScope + '</td>');
        tmpHTML.push('  <td>' + advObj.stopLossScope + '</td>');
        tmpHTML.push('  <td style="width:230px;"><marquee class="advise-item-content" align="left" behavior="scroll" direction="left" loop="-1" onMouseOut="this.stop()" onMouseOver="this.start()">' + advObj.content + '</marquee></td>');
        tmpHTML.push('  <td>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-primary btn-advise-item-edit" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-edit"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-warning btn-advise-item-remove" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-trash-alt"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-danger btn-advise-item-edit-cancel" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-times"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('       <button class="btn btn-sm btn-outline-success btn-advise-item-edit-ok" type="button" data-target="' + stockId + '|' + i + '">');
        tmpHTML.push('           <i class="fas fa-check"></i>');
        tmpHTML.push('       </button>');
        tmpHTML.push('  </td>');
        tmpHTML.push('</tr>');
        tbody.append($(tmpHTML.join('')));
    }

    bindAdviseItemEvents();
};

function bindAdviseItemEvents() {
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit').unbind();
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-remove').unbind();
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit-cancel').unbind();
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit-ok').unbind();
    $('#adviseModal .advise-item-list-tbody .advise-item-content').unbind();
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit').click(startEditAdviseItem);
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-remove').click(removeAdviseItem);
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit-cancel').click(cancelEditAdviseItem);
    $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit-ok').click(confirmEditAdviseItem);
    $('#adviseModal .advise-item-list-tbody .advise-item-content').click(function () {
        alert($(arguments[0].currentTarget).text());
    });
};

function adjustAdviseOptBtnStatus(isEdit, rowIndex) {
    if (isEdit) {
        $('#adviseModal .advise-item-list-tbody tr:eq(' + rowIndex + ') td .btn-advise-item-edit').hide();
        $('#adviseModal .advise-item-list-tbody tr:eq(' + rowIndex + ') td .btn-advise-item-remove').hide();
        $('#adviseModal .advise-item-list-tbody tr:eq(' + rowIndex + ') td .btn-advise-item-edit-cancel').show();
        $('#adviseModal .advise-item-list-tbody tr:eq(' + rowIndex + ') td .btn-advise-item-edit-ok').show();
    } else {
        $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit').show();
        $('#adviseModal .advise-item-list-tbody .btn-advise-item-remove').show();
        $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit-cancel').hide();
        $('#adviseModal .advise-item-list-tbody .btn-advise-item-edit-ok').hide();
    }
}

function stopEditAdviseItem() {
    adjustAdviseOptBtnStatus(false);
    var tmpMapItem, tmpVal;
    var container = $('.advise-item-list-container');
    for (var i = 0; i < _adviseColFieldValuMapping.length; i++) {
        tmpMapItem = _adviseColFieldValuMapping[i];
        container.append($(tmpMapItem.id).hide());
    }

    if (_editingAdviseItem.obj != null) {
        var tmpObj = _editingAdviseItem.obj;
        if (typeof tmpObj.isnew != 'undefined' && tmpObj.isnew === true) {
            if (_globalDataObj.stocks[_editingAdviseItem.stockId].advise.length < $('.advise-item-list-tbody tr').length) {
                $('.advise-item-list-tbody tr:last').remove();
                return;
            }
        }

        var cells = $('.advise-item-list-tbody tr:eq(' + _editingAdviseItem.rowIdx + ') td');
        for (var i = 0; i < _adviseColFieldValuMapping.length; i++) {
            tmpMapItem = _adviseColFieldValuMapping[i];
            tmpVal = _editingAdviseItem.obj[tmpMapItem.key];
            tmpVal = tmpMapItem.convert == null ? tmpVal : tmpMapItem.convert(tmpVal);
            if (tmpMapItem.key == 'content') {
                $($(cells[i]).find('marquee')).text(tmpVal).show();
            } else {
                $(cells[i]).text(tmpVal);
            }
        }

        _editingAdviseItem = { obj: null, rowIdx: -1, stockId: '' };
    }
};

function startEditAdviseItem(arg) {
    stopEditAdviseItem();
    var advIdx = 0;
    var stockId = '';
    var currAdv = null;
    if (typeof arg != "string") {
        var tmpStr = $(arg.currentTarget).attr("data-target");
        stockId = tmpStr.split('|')[0];
        advIdx = parseInt(tmpStr.split('|')[1]);
        currAdv = _globalDataObj.stocks[stockId].advise[advIdx];
    } else {
        var rows = $('.advise-item-list-tbody').find('tr');
        advIdx = rows.length;
        stockId = arg;
        buildNewAdviseItemRow(stockId, advIdx);
        currAdv = {
            date: (new Date()).toLocaleDateString(),
            time: "00:00:00",
            buyDown: 0,
            buyUp: 0,
            stopProfitDown: 0,
            stopProfitUp: 0,
            stopLossDown: 0,
            stopLossUp: 0,
            buyScope: '',
            stopProfitScope: '',
            stopLossScope: '',
            content: '',
            isnew: true
        };
    }

    _editingAdviseItem = { obj: currAdv, rowIdx: advIdx, stockId: stockId };
    adjustAdviseOptBtnStatus(true, advIdx);
    var cells = $('.advise-item-list-tbody tr:eq(' + advIdx + ') td');
    var tmpMapItem, tmpVal;
    for (var i = 0; i < cells.length - 1; i++) {
        tmpMapItem = _adviseColFieldValuMapping[i];
        if (tmpMapItem.key == 'content') {
            $($(cells[i]).find('marquee')).text("").hide();
            $(cells[i]).append($(tmpMapItem.id).show());
        } else {
            $(cells[i]).text("").append($(tmpMapItem.id).show());
        }

        if (tmpMapItem.items != null) {
            for (var j = 0; j < tmpMapItem.items.length; j++) {
                $(tmpMapItem.items[j].id).val(tmpMapItem.items[j].convert(currAdv[tmpMapItem.items[j].key]));
            }
        } else {
            $(tmpMapItem.id).val(tmpMapItem.convert == null ? currAdv[tmpMapItem.key] : tmpMapItem.convert(currAdv[tmpMapItem.key]));
        }
    }
}

function cancelEditAdviseItem() {
    var tmpStr = $(arguments[0].currentTarget).attr("data-target");
    var stockId = tmpStr.split('|')[0];
    var advIdx = parseInt(tmpStr.split('|')[1]);
    var advList = _globalDataObj.stocks[stockId].advise;
    stopEditAdviseItem();
    if (typeof advList[advIdx] != 'undefined' && advList[advIdx] != null) {
        _editingAdviseItem = { obj: advList[advIdx], rowIdx: advIdx, stockId: stockId };
    } else if ($('.advise-item-list-tbody tr:eq(' + advIdx + ')').length > 0) {
        _editingAdviseItem = { obj: null, advIdx: -1, stockId: '' };
        $('.advise-item-list-tbody tr:eq(' + advIdx + ')').remove();
    }
};

function confirmEditAdviseItem() {
    var tmpStr = $(arguments[0].currentTarget).attr("data-target");
    var stockId = tmpStr.split('|')[0];
    var advIdx = parseInt(tmpStr.split('|')[1]);
    var advList = _globalDataObj.stocks[stockId].advise;
    var currAdv = null;
    if (advIdx >= advList.length) {
        currAdv = {
            date: (new Date()).toLocaleDateString(),
            time: "00:00:00",
            buyDown: 0,
            buyUp: 0,
            stopProfitDown: 0,
            stopProfitUp: 0,
            stopLossDown: 0,
            stopLossUp: 0,
            buyScope: '',
            stopProfitScope: '',
            stopLossScope: '',
            content: ''
        };
        advList.push(currAdv);
    } else {
        currAdv = advList[advIdx];
    }

    var tmpMapItem;
    for (var i = 0; i < _adviseColFieldValuMapping.length; i++) {
        tmpMapItem = _adviseColFieldValuMapping[i];
        currAdv[tmpMapItem.key] = tmpMapItem.format == null ? '' : tmpMapItem.format($(tmpMapItem.id).val());
        if (tmpMapItem.items != null) {
            for (var j = 0; j < tmpMapItem.items.length; j++) {
                currAdv[tmpMapItem.items[j].key] = tmpMapItem.items[j].format($(tmpMapItem.items[j].id).val());
            }
        }
    }

    currAdv.buyScope = formatAdviseScope(currAdv.buyDown, currAdv.buyUp, false);
    currAdv.stopProfitScope = formatAdviseScope(currAdv.stopProfitDown, currAdv.stopProfitUp, true);
    currAdv.stopLossScope = formatAdviseScope(currAdv.stopLossDown, currAdv.stopLossUp, false);

    saveData();

    _editingAdviseItem = { obj: currAdv, rowIdx: advIdx, stockId: stockId };
    $('.advise-item-list-tbody tr:eq(' + advIdx + ')').attr('data-symbol', '');
    stopEditAdviseItem();
};

function buildNewAdviseItemRow(stockId, recIdx) {
    tmpHTML = [];
    tmpHTML.push('<tr data-symbol="new">')
    tmpHTML.push('  <th scope="row">' + (recIdx + 1) + '</th>');
    tmpHTML.push('  <td></td>');
    tmpHTML.push('  <td></td>');
    tmpHTML.push('  <td></td>');
    tmpHTML.push('  <td></td>');
    tmpHTML.push('  <td style="width:230px;"><marquee align="left" behavior="scroll" direction="left" loop="-1" onMouseOut="this.stop()" onMouseOver="this.start()"></marquee></td>');
    tmpHTML.push('  <td>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-primary btn-advise-item-edit" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-edit"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-warning btn-advise-item-remove" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-trash-alt"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-danger btn-advise-item-edit-cancel" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-times"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('       <button class="btn btn-sm btn-outline-success btn-advise-item-edit-ok" type="button" data-target="' + stockId + '|' + recIdx + '">');
    tmpHTML.push('           <i class="fas fa-check"></i>');
    tmpHTML.push('       </button>');
    tmpHTML.push('  </td>');
    tmpHTML.push('</tr>');
    $('.advise-item-list-tbody').append($(tmpHTML.join('')));
    bindAdviseItemEvents();
};

function removeAdviseItem(eventObj) {
    var tmpStr = $(eventObj.currentTarget).attr("data-target");
    var stockId = tmpStr.split('|')[0];
    var adviseIndex = parseInt(tmpStr.split('|')[1]);
    var tbody = $('#alert_Remove_Advise_Item .remove-advise-item-tbody');
    tbody.empty();
    var adviseList = _globalDataObj.stocks[stockId].advise;
    var tmpHTML, advObj;
    if (adviseList.length > adviseIndex && adviseIndex >= 0) {
        tmpHTML = [];
        advObj = adviseList[adviseIndex];
        tmpHTML.push('<tr class="text-center">')
        tmpHTML.push('  <td>' + advObj.date + '</td>');
        tmpHTML.push('  <td>' + advObj.buyScope + '</td>');
        tmpHTML.push('  <td>' + advObj.stopProfitScope + '</td>');
        tmpHTML.push('  <td>' + advObj.stopLossScope + '</td>');
        tmpHTML.push('  <td>' + advObj.content + '</td>');
        tmpHTML.push('</tr>');
        tbody.append($(tmpHTML.join('')));
    }

    $('.btn-reomve-advise-item-OK').attr('data-target', tmpStr);
    $('.alert-remove-advise-item-mask').show();
};
/*Common Function*/
function writeXMLString() {
    updateGlobalList();
    var existList = [];
    var existFlag = false;
    var xmlStrArr = [];
    xmlStrArr.push('<root>');
    for (var i = 0; i < _globalDataObj.list.length; i++) {
        existFlag = false;
        for (var j0; j < existList.length; j++) {
            if (existList[j] == _globalDataObj.list[i].id) {
                existFlag = true;
                break;
            }
        }

        xmlStrArr.push('<stock id="' + _globalDataObj.list[i].id + '" symbol="' + _globalDataObj.list[i].symbol + '">');
        xmlStrArr.push('<recs>');
        if (!existFlag) {
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
        }
        xmlStrArr.push('</recs>');
        xmlStrArr.push('<advise>');
        if (!existFlag) {
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

            xmlStrArr.push('<fundamentals>');
            xmlStrArr.push(_globalDataObj.stocks[_globalDataObj.list[i].id].fundamentals);
            xmlStrArr.push('</fundamentals>');
            xmlStrArr.push('<technical>');
            xmlStrArr.push(_globalDataObj.stocks[_globalDataObj.list[i].id].technical);
            xmlStrArr.push('</technical>');
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
};

function formatDateString(source) {
    var tmpArr = source.split('/');
    var retVal = tmpArr[0] + '-' + (Array(2).join('0') + tmpArr[1]).slice(-2) + '-' + (Array(2).join('0') + tmpArr[2]).slice(-2);
    return retVal;
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

function numberToFixed(value, length) {
    var len = typeof length == "undefined" ? 2 : length;
    return value.toFixed(len);
};

function UpdatePositionDetailRow(stockId, modalId) {
    var stockObj = _globalDataObj.stocks[stockId].market;
    var summaryObj = StockLoader.calcSummaryData(stockId);
    if (summaryObj.amount > 0) {
        var tmpPLUnit = stockObj.priceTC - summaryObj.price;
        $(modalId + ' .position-detail-row .cell-cost-price').text(summaryObj.price.toFixed(2));
        $(modalId + ' .position-detail-row .cell-amount').text(summaryObj.amount);
        $(modalId + ' .position-detail-row .cell-current-total-value').text(stockObj.priceTC * summaryObj.amount);
        $(modalId + ' .position-detail-row .cell-profit-loss-unit').text(tmpPLUnit.toFixed(2));
        //var tmpColor = stockObj.priceTC == stockObj.priceYC ? "black" : stockObj.priceTC > stockObj.priceYC ? "red" : "green";
        var tmpColor = summaryObj.price > stockObj.priceTC ? "green" : "red";
        $(modalId + ' .position-detail-row .cell-profit-loss-position').text((tmpPLUnit * summaryObj.amount).toFixed(2)).css('color', tmpColor);
        $(modalId + ' .position-detail-row .cell-profit-loss-total').text('-').css('color', tmpColor);
        $(modalId + ' .position-detail-row .cell-profit-loss-rate').text((tmpPLUnit / summaryObj.price * 100).toFixed(2) + '%').css('color', tmpColor);
    } else {
        $(modalId + ' .position-detail-row .cell-cost-price').text('-');
        $(modalId + ' .position-detail-row .cell-amount').text('-');
        $(modalId + ' .position-detail-row .cell-current-total-value').text('-');
        $(modalId + ' .position-detail-row .cell-profit-loss-unit').text('-');
        $(modalId + ' .position-detail-row .cell-profit-loss-position').text('-');
        $(modalId + ' .position-detail-row .cell-profit-loss-total').text(summaryObj.PL.toFixed(2)).css('color', summaryObj.PL.value < 0 ? "green" : "red");
        $(modalId + ' .position-detail-row .cell-profit-loss-rate').text('-');
    }
};

function formatAdviseScope(down, up, isProfit) {
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