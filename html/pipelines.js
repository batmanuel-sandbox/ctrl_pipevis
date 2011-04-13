var visits = new Array()
var workerTable = new Array()

var _displayedVisitId = null

var ccdjobHandler = 
{
  _ccdjob: function(message) 
  {
    if (message != null) {

      var _type = getMessageTagContents(message, "TYPE")
      if (_type == "_C") {
          updateVisit(message)
          var _destinationid = getMessageTagContents(message, "DESTINATIONID")
          var _identity = getNode(message, "identity")
          //var _raft = getMessageTagConents(_identity,"raft")
          var _ids = getNode(_identity, "ids")
          var _raft = getMessageTagContents(_ids,"raft")
          var _sensor = getMessageTagContents(_ids,"sensor")
          var _visit = getMessageTagContents(_ids,"visit")
          
          // only change the display header if this is the first time through
          if (_displayedVisitId == null) {
            _displayedVisitId = _visit;
            updateVisitHeader(_visit);
          }

          var _cellname = _raft+"_"+_sensor
          if (_cellname != "0_0") {
                var _cell = document.getElementById(_cellname)
                if (_cell == null)
                    alert("cell: "+_raft+"_"+_sensor)
                else {
                    if (_displayedVisitId == _visit)
                        _cell.className = "run"
                    workerTable[_destinationid] = new Worker(_visit, _cellname)
                    updateVisitInfo(_visit, _cellname, "run")
                }
          }
      } else if (_type == "_S") {
            var _originatorid = getMessageTagContents(message, "ORIGINATORID")
            var _status = getMessageTagContents(message, "STATUS")
            if (_status == "job:done") {
                var _cellname = workerTable[_originatorid].cellname
                var _visit = workerTable[_originatorid].visit
                var _cell = document.getElementById(_cellname)
                if (_cell == null)
                    ; // alert("cell null: "+_cellname)
                else {
                    var _success = getMessageTagContents(message, "success")
                    var _state = null
                    if (_success == "true")
                        _state = "done"
                    else
                        _state = "fail"
                        
                    
                    if (_displayedVisitId == _visit)
                        _cell.className = _state
                    updateVisitInfo(_visit, _cellname, _state)
                }
            }
      }
    }
  }
};

function updateDisplay(visit) {
    
    _displayedVisitId = visit
    var _table = generateTable()
    var _div = document.getElementById("focalplane") 
    _div.innerHTML = _table
    updateVisitHeader(visit)

    var _stateTable = visits[visit]
    console.log(_stateTable)
    for (_cellname in _stateTable) {
        var _cell = document.getElementById(_cellname)
        _cell.className = _stateTable[_cellname]
    }
}

function Worker(_visit, _cellname) {
    this.visit = _visit
    this.cellname = _cellname
}

function updateVisitInfo(_visit, _cellname, state) {
    var info = visits[_visit]
    if (info != null) {
        var _table = info
        _table[_cellname] = state
    }
}

function getVisitId(message) {
    var _identity = getNode(message, "identity")
    var _ids = getNode(_identity, "ids")
    var _visit = getMessageTagContents(_ids,"visit")
    return _visit
}

function updateVisit(message) {
    var _visit = getVisitId(message)
    var list = document.visits.list

    var _table = visits[_visit]

    if (_table == null) {

        visits[_visit] = new Array()
        list.options.add(new Option(_visit, _visit))
    }
}

function updateVisitHeader(visit) {
    var _header = document.getElementById("visitHeaderName")
    _header.innerHTML = visit
}

/* HTML routines */

function getNode(message, tag) {
    var _foo = message.getElementsByTagName(tag)
    if (_foo != undefined) {
        var _foo_value = _foo[0]
        return _foo_value
    }
    return null
}

function getMessageTagContents(message, tag) {
    var _foo = message.getElementsByTagName(tag)
    if (_foo != undefined) {
        var _foo_value = _foo[0].childNodes[0].nodeValue
        return _foo_value
    }
    return null
}

function ccdjobPoll(first)
{
   if (first)
   {
     amq.addListener('joboffice','topic://CcdJob_ajax',ccdjobHandler._ccdjob);
   }
}

amq.addPollHandler(ccdjobPoll);


/**
 * Return number as fixed number of digits. 
 */
function fixedDigits(t, digits) {
    return (t.toFixed) ? t.toFixed(digits) : this
}

/** 
 * Find direct child of an element, by id. 
 */
function find(t, id) {
    for (i = 0; i < t.childNodes.length; i++) {
        var child = t.childNodes[i]
        if (child.id == id) {
            return child
        }
    }
    return null
}
