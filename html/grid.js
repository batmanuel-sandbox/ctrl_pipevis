table_var = generateTable()
function generateTable() {
    p = generateCapRow(0)
    for (var i = 1; i < 4; i++) {
        p += generateMiddleRow(i)
    }
    p += generateCapRow(4)
    return p
}

function generateCapRow(_i) {
    p = "<table>\n"
    p += "<tr>\n"
    p += generateSmallTable(_i+",0","grid")
    p += generateSmallTable(_i+",1","border_grid")
    p += generateSmallTable(_i+",2","border_grid")
    p += generateSmallTable(_i+",3","border_grid")
    p += generateSmallTable(_i+",4","grid")
    p += "</tr>\n"
    p += "</table>\n"
    return p
}

function generateMiddleRow(_i) {
    p = "<table>\n"
    p += "<tr>\n"
    p += generateSmallTable(_i+",0","border_grid")
    p += generateSmallTable(_i+",1","border_grid")
    p += generateSmallTable(_i+",2","border_grid")
    p += generateSmallTable(_i+",3","border_grid")
    p += generateSmallTable(_i+",4","border_grid")
    p += "</tr>\n"
    p += "</table>\n"
    return p
}

function generateSmallTable(_id, _class) {
    p = "<td>\n"
    p += "<table class=\""+_class+"\">\n";
    for (var i = 0; i < 3; i++) {
        p +="<tr id=\"raft_"+_id+"\">\n"
        for (var j = 0; j < 3; j++) {
                    p += "<td id=\""+_id+"_"+i+","+j+"\" ><br></td>\n";
        }
        p +="</tr>\n"
    }
    p += "</table>\n"
    p += "</td>\n"
    return p
}
