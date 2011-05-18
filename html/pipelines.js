var visits = new Array()
var workerTable = new Array()

var _displayedVisitId = null
var _displayedRunid = null

var totalDataCount = 0

var runids = new Array()

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
            _displayedVisitId = _visit
            _displayedRunid = _runid
            updateVisitHeader(_visit)
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
            var _runid = getMessageTagContents(message, "RUNID")
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
                    if (_success == "true") {
                        _state = "done"
                    } else {
                        _state = "fail"
                    }
                        
                    
                    if (_displayedVisitId == _visit)
                        _cell.className = _state
                    updateRunidInfo(_runid, _state)
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
            } else if (_status == "job:abandoned") {
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
                    _cell.className = "abandoned"
                updateRunidInfo(_runid, "abandoned")
                updateVisitInfo(_visit,_cellName, "abandoned")
            }
      }
    }
  }
};

var rawCcdAvailableHandler = 
{
    _rawCcdAvailable: function(message) {
        if (message != null) {

            updateVisit(message)

            var _type = getMessageTagContents(message, "TYPE")

            if (_type == "_S") {
                var _originatorid = getMessageTagContents(message, "ORIGINATORID")
                var _status = getMessageTagContents(message, "STATUS")

                if (_status == "available") {
                    updateIncomingDataInfo(message)
                }
            }
        }
    }
};

function updateIncomingDataInfo(message) {
    var _identity = getNode(message, "dataset")
    //var _raft = getMessageTagConents(_identity,"raft")
    var _ids = getNode(_identity, "ids")
    var _visit_raw = getMessageTagContents(_ids,"visit")
    var _runid = getMessageTagContents(message, "RUNID")
    var _visit = "Run: "+_runid+" Visit: "+_visit_raw

   
    var visit = getVisit(_visit)
    if (visit == null) {
        setVisit(_runid, _visit, new DisplayData())
        visit = getVisit(_visit)
    }
        
    var displayData = visit.displayData
    if (displayData == null) {
        return null
    }

    var runidEntry = getRunidInfo(_runid)
    if (runidEntry == null) {
        runidEntry = new RunidInfo(_runid)
        setRunidInfo(runidEntry)
        updateStateDisplay("0.00%", "runidPercentComplete")
        updateStateDisplay("0.00%", "runidPercentAbandoned")
    }

    
    runidEntry.totalJobs = runidEntry.totalJobs + 1
    displayData.visitDataCount = displayData.visitDataCount + 1
    updateVisitStats(displayData)
//    var _div = document.getElementById("totalDataCount") 
//    _div.innerHTML = displayData.totalDataCount
}

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

function VisitInfo(_runid, _visitName, _displayData) {
   this.runid = _runid
   this.visitName = _visitName
   this.displayData = _displayData
}

function setVisit(_runid, _visitName, _displayData) {
    visits.push(new VisitInfo(_runid, _visitName, _displayData))
}

function getVisit(_visitName) {

    if (visits.length == 0) {
        return null
    }
    for (var i = 0; i < visits.length; i++) {
        var storedVisitName = visits[i].visitName
        if (storedVisitName == _visitName) {
            return visits[i]
        }
    }
    return null
}

function RunidInfo(_runid) {
    this.runid = _runid
    this.totalJobs = 0
    this.completeCount = 0
    this.abandonedCount = 0
}

function setRunidInfo(_runidInfo) {
    runids.push(_runidInfo)
}

function getRunidInfo(_runid) {
    if (runids.length == 0)
        return null
    for (var i = 0; i < runids.length; i++) {
        var storedRunid = runids[i].runid
        if (storedRunid == _runid) {
            return runids[i]
        }
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
    var visit = getVisit(_visit)
    var displayData = visit.displayData
    if (displayData == null) {
        return null
    }


    var focalplane = displayData.focalplane

    if (focalplane == null)
        return null
    for (var i = 0; i < focalplane.length; i++) {
        var fpData = focalplane[i]
        if (fpData.cellName == _cellName) {
            return fpData.state
        }
    }

    return null
}

function updateStatistics(_visitInfo, _displayedRunid) {

    var displayData = _visitInfo.displayData
    var runid = _visitInfo.runid
    if (displayData == undefined)
        return

    var _visitDataCount = displayData.visitDataCount
    var _totalRunCount = displayData.totalRunCount
    var _rescheduling = displayData.rescheduling
    var _completed = displayData.completed
    var _abandoned = displayData.abandoned

    updateStateDisplay(displayData.run, "runCount")
    //updateStateDisplay(displayData.fail, "fail")
    updateStateDisplay(_rescheduling, "reschedulingCount")
    updateStateDisplay(_completed, "doneCount")
    updateStateDisplay(_abandoned, "abandonedCount")
    
    updateStateDisplay(_completed, "visitCompleted")
    updateStateDisplay(_visitDataCount, "visitDataCount")

    updateStatePercentDisplay(_completed, _visitDataCount, "visitPercentComplete")
        
    // updateStatePercentDisplay(_rescheduling, _totalRunCount, "visitPercentRescheduled")

    updateStateDisplay(_abandoned, "visitAbandoned")
    updateStatePercentDisplay(_abandoned, _visitDataCount, "visitPercentAbandoned")

    if (runid == _displayedRunid) {
        var runidEntry = getRunidInfo(runid)
        if (runidEntry == null) 
            return

        updateStateDisplay(runidEntry.totalJobs, "runidDataCount")
        updateStateDisplay(runidEntry.completeCount,"runidComplete")
        updateStateDisplay(runidEntry.abandonedCount,"runidAbandoned")
        updateStatePercentDisplay(runidEntry.completeCount,runidEntry.totalJobs, "runidPercentComplete")
        updateStatePercentDisplay(runidEntry.abandonedCount,runidEntry.totalJobs, "runidPercentAbandoned")
    }
}

function updateDisplay(visit) {
    
    _displayedVisitId = visit
    var _table = generateTable()
    var _div = document.getElementById("focalplane") 
    _div.innerHTML = _table
    updateVisitHeader(visit)

    var visitInfo = getVisit(visit)
    if (visitInfo == null) {
        alert("visitInfo was null")
        return
    }
    var displayData = visitInfo.displayData
    var focalplane = displayData.focalplane
    updateStatistics(visitInfo, getRunidFromString(visit))


    var i = 0

    if (focalplane.length != 0) {
            for (i = 0; i < focalplane.length; i++) {
                var fpData = focalplane[i]
                var cell = document.getElementById(fpData.cellName)
                cell.className = fpData.state
            }
    }
}

function updateVisitStats(displayData) {
    updateStateDisplay(displayData.visitDataCount, "visitDataCount")
}

function updateStatePercentDisplay(_val, _total, _state) {
    if (_total != 0) {
        var _percent = (_val/_total) * 100
        _percent = _percent.toFixed(2) + "%"
        updateStateDisplay(_percent, _state)
    } else
        updateStateDisplay("0.00%", _state)
}

function updateStateDisplay(_val, _state) {
    var _div = document.getElementById(_state)
    if (_div == undefined)
       return

    if (_val == 0)
        _div.innerHTML = "<br>"
    else
        _div.innerHTML = _val
}

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
    this.totalRunCount = 0
    this.visitDataCount = 0
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
    if (_name == "run") {
        _displayData.run = _val
    } else if (_name == "fail")
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

function updateRunidInfo(_runid, _state) {
    runidInfo = getRunidInfo(_runid)
    if (runidInfo == null)
        return
    if (_state == "done") {
        runidInfo.completeCount = runidInfo.completeCount  + 1
        if (_runid == _displayedRunid) {
            updateStateDisplay(runidInfo.completeCount, "runidComplete")
            if (runidInfo.totalJobs > 0) 
                updateStatePercentDisplay(runidInfo.completeCount,runidInfo.totalJobs, "runidPercentComplete")
        }
    } else if (_state == "abandoned") {
        runidInfo.abandonedCount = runidInfo.abandonedCount + 1
        if (_runid == _displayedRunid) {
            updateStateDisplay(runidInfo.abandonedCount, "runidAbandoned")
            if (runidInfo.totalJobs > 0) 
                updateStatePercentDisplay(runidInfo.abandonedCount,runidInfo.totalJobs, "runidPercentAbandoned")
        }
    }
}

function updateVisitInfo(_visit, _cellName, _state) {
    var retVisit = getVisit(_visit)
    var displayData = retVisit.displayData
    if (displayData != null) {
        var focalplane = displayData.focalplane
    

        var cur_state = getFocalPlaneCellState(_visit, _cellName)

        if (cur_state == "run") {
            var cur_val = getStateTableValue(displayData, cur_state)
            cur_val = cur_val - 1
            setStateTableValue(displayData, cur_state, cur_val)
            if (_displayedVisitId == _visit) {
                var _div = document.getElementById(cur_state+"Count")
                if (cur_val == 0)
                    _div.innerHTML = "<br>"
                else
                    _div.innerHTML = cur_val
            }
        }

        setFocalPlaneCellState(focalplane, _cellName, _state)

        var val = getStateTableValue(displayData, _state)
        displayData.totalRunCount = displayData.totalRunCount + 1
        if (val == 0) {
            val = 1
        } else {
            val = val+1
        }
       setStateTableValue(displayData, _state, val)
        if (_displayedVisitId == _visit) {
            var _div = document.getElementById(_state+"Count")
            if (_div != undefined)
                _div.innerHTML = val
        }
    }
    if (_displayedVisitId == _visit)
        updateStatistics(retVisit, getRunidFromString(_visit))
}

function getRunidFromString(_visit) {
    // Assumes "Run: " is the first part of the string
    var a = _visit.indexOf(" ",5)   
    var sub = _visit.substring(5,a)
    return sub
}

function getVisitId(message) {
    var _identity = getNode(message, "identity")
    if (_identity != null) {
            var _ids = getNode(_identity, "ids")
            var _visit = getMessageTagContents(_ids,"visit")
            return _visit
    }
    var _dataset = getNode(message, "dataset")
    if (_dataset != null) {
            var _ids = getNode(_dataset, "ids")
            var _visit = getMessageTagContents(_ids,"visit")
            return _visit
    }
    return null
}

function updateVisit(message) {
    var _runid = getMessageTagContents(message, "RUNID")
    var _visit_raw = getVisitId(message)
    var _visit = "Run: "+_runid+" Visit: "+_visit_raw
    var list = document.visits.list

    var _displayData = getVisit(_visit)

    if (_displayData == null) {
        setVisit(_runid, _visit, new DisplayData())
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

function rawCcdAvailablePoll(first)
{
   if (first)
   {
     amq.addListener('rawCcdAvailable','topic://RawCcdAvailable_ajax',rawCcdAvailableHandler._rawCcdAvailable);
   }
}

amq.addPollHandler(ccdjobPoll);
/*
amq.addPollHandler(jobofficeStatusPoll);
*/
amq.addPollHandler(rawCcdAvailablePoll);


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
