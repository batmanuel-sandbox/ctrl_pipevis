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
          var _visit_raw = getMessageTagContents(_ids,"visit")
          var _runid = getMessageTagContents(message, "RUNID")
          var _visit = "Run: "+_runid+" Visit: "+_visit_raw
          // only change the display header if this is the first time through
          if (_displayedVisitId == null) {
            _displayedVisitId = _visit;
            updateVisitHeader(_visit);
          }

          var _cellName = _raft+"_"+_sensor
          if (_cellName != "0_0") {
                var _cell = document.getElementById(_cellName)
                if (_cell == null)
                    alert("cell: "+_raft+"_"+_sensor)
                else {
                    if (_displayedVisitId == _visit)
                        _cell.className = "run"
                    setWorkerInfo(_destinationid, _visit, _cellName)
                    updateVisitInfo(_visit, _cellName, "run")
                }
          }
      } else if (_type == "_S") {
            var _originatorid = getMessageTagContents(message, "ORIGINATORID")
            var _status = getMessageTagContents(message, "STATUS")
            if (_status == "job:done") {
                var worker = getWorkerInfo(_originatorid)
                // if worker is null, we never saw the command for it
                // to start working

                if (worker == null)
                    return
                var _cellName = worker.cellName
                var _visit = worker.visit

                var _cell = document.getElementById(_cellName)
                if (_cell == null)
                    ; // alert("cell null: "+_cellName)
                else {
                    var _success = getMessageTagContents(message, "success")
                    var _state = null
                    if (_success == "true")
                        _state = "done"
                    else
                        _state = "fail"
                        
                    
                    if (_displayedVisitId == _visit)
                        _cell.className = _state
                    updateVisitInfo(_visit, _cellName, _state)
                }
            } else if (_status == "job:rescheduling") {
                var _identity = getNode(message, "identity")
                var _ids = getNode(_identity, "ids")
                var _raft = getMessageTagContents(_ids,"raft")
                var _sensor = getMessageTagContents(_ids,"sensor")
                var _visit_raw = getMessageTagContents(_ids,"visit")
                var _runid = getMessageTagContents(message, "RUNID")
                var _visit = "Run: "+_runid+" Visit: "+_visit_raw

                var _cellName = _raft+"_"+_sensor
                var _cell = document.getElementById(_cellName)
                if (_displayedVisitId == _visit)
                    _cell.className = "rescheduling"
                updateVisitInfo(_visit,_cellName, "rescheduling")
            }
      }
    }
  }
};

function setWorkerInfo(_destinationId, _visit, _cellName) {
    for (var i = 0; i < workerTable.length; i++) {
        if (workerTable[i].id == _destinationId) {
            workerTable[i].visit = _visit;
            workerTable[i].cellName = _cellName;
            return;
        }
    }
    workerTable.push(new Worker(_destinationId, _visit, _cellName))
}

function getWorkerInfo(_id) {
    for (var i = 0; i < workerTable.length; i++) {
        if (workerTable[i].id == _id) {
            return workerTable[i];
        }
    }
    return null;
}

function VisitInfo(_visitName, _displayData) {
   this.visitName = _visitName
   this.displayData = _displayData
}

function setVisit(_visitName, _displayData) {
    visits.push(new VisitInfo(_visitName, _displayData))
}

function getVisit(_visitName) {

    if (visits.length == 0)
        return null
    for (var i = 0; i < visits.length; i++) {
        var storedVisitName = visits[i].visitName
        if (storedVisitName == _visitName)
            return visits[i]
    }
    return null
}

function setFocalPlaneCellState(_fp, _cellName, _state) {
    
    if (_fp.length != 0) {
            var i = 0
   
            for (i = 0; i < _fp.length; i++) {
  
                var fpData = _fp[i]
                var storedCellName  = fpData.cellName
                if (storedCellName == _cellName) {
                    fpData.state = _state
                    return
                }
            }
    }
    var fpData = new FocalPlaneData()
    fpData.cellName = _cellName
    fpData.state = _state

    _fp.push(fpData)
}

function getFocalPlaneCellState(_visit, _cellName) {
    var displayData = getVisit(_visit)
    if (displayData == null)
        return null

    var focalplane = displayData.focalplane

    for (var i = 0; i < focalplane.length; i++) {
        var fpData = focalplane[i]
        if (fpData.cellName == _cellName)
            return focalplane[i].state
    }
    return null
}

function updateDisplay(visit) {
    
    _displayedVisitId = visit
    var _table = generateTable()
    var _div = document.getElementById("focalplane") 
    _div.innerHTML = _table
    updateVisitHeader(visit)

    var visitInfo = getVisit(visit)
    if (visitInfo == null)
        return
    var displayData = visitInfo.displayData
    var focalplane = displayData.focalplane

    updateStateDisplay(displayData.run, "run")
    updateStateDisplay(displayData.fail, "fail")
    updateStateDisplay(displayData.rescheduling, "rescheduling")
    updateStateDisplay(displayData.completed, "done")
    updateStateDisplay(displayData.abandoned, "abandoned")

    var i = 0

    if (focalplane.length != 0) {
            for (i = 0; i < focalplane.length; i++) {
                var fpData = focalplane[i]
                var cell = document.getElementById(fpData.cellName)
                cell.className = fpData.state
            }
    }
}

function updateStateDisplay(_val, _state) {
    var _div = document.getElementById(_state+"Count")

    if (_val == 0)
        _div.innerHTML = "<br>"
    else
        _div.innerHTML = _val
}

/*
function updateStateDisplay(_stateTable, _state) {
    var _div = document.getElementById(_state+"Count")
    if (_stateTable[_state] != null) {
        _div.innerHTML = _stateTable[_state]
    }
}
*/

function FocalPlaneData() {
    this.cellName = null
    this.state = null
}


function DisplayData() {
    this.visitName = null
    this.focalplane = new Array()
    this.run = 0
    this.fail = 0
    this.rescheduling = 0
    this.completed = 0
    this.abandoned = 0
}

function getStateTableValue(_displayData, _name) {
    if (_name == "run")
        return _displayData.run
    if (_name == "fail")
        return _displayData.fail
    if (_name == "rescheduling")
        return _displayData.rescheduling
    if (_name == "done")
        return _displayData.completed
    if (_name == "abandoned")
        return _displayData.abandoned
}

function setStateTableValue(_displayData, _name, _val) {
    if (_name == "run")
        _displayData.run = _val
    else if (_name == "fail")
        _displayData.fail = _val
    else if (_name == "rescheduling")
        _displayData.rescheduling = _val
    else if (_name == "done")
        _displayData.completed = _val
    else if (_name == "abandoned")
        _displayData.abandoned = _val
}

function Worker(_id, _visit, _cellName) {
    this.id = _id
    this.visit = _visit
    this.cellName = _cellName
}

function updateVisitInfo(_visit, _cellName, _state) {
    var retVisit = getVisit(_visit)
    var displayData = retVisit.displayData
    if (displayData != null) {
        var focalplane = displayData.focalplane
    
        setFocalPlaneCellState(focalplane, _cellName, _state)

        var val = getStateTableValue(displayData, _state);
        if (val == 0) {
            val = 1
        } else {
            val = val+1
        }
       setStateTableValue(displayData, _state, val)
        if (_displayedVisitId == _visit) {
            var _div = document.getElementById(_state+"Count")
            _div.innerHTML = val
        }
    }
}

function getVisitId(message) {
    var _identity = getNode(message, "identity")
    var _ids = getNode(_identity, "ids")
    var _visit = getMessageTagContents(_ids,"visit")
    return _visit
}

function updateVisit(message) {
    var _runid = getMessageTagContents(message, "RUNID")
    var _visit_raw = getVisitId(message)
    var _visit = "Run: "+_runid+" Visit: "+_visit_raw
    var list = document.visits.list

    var _displayData = getVisit(_visit)

    if (_displayData == null) {

        
        setVisit(_visit, new DisplayData())
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
