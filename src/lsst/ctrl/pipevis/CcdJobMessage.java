package lsst.ctrl.pipevis;

import java.util.List;
import java.util.Set;

import javax.jms.Message;

public class CcdJobMessage extends LsstMessage {

	public CcdJobMessage(Message msg) {
		super(msg);
	}

	public String getPayload() {
		String s = "";
		Set<String> set = map.keySet();
		for (String key : set) {
			if (key.equals("identity") || key.equals("outputs") || key.equals("inputs")) {
				s = s + parseList(key);
			} else {
				List list = (List) map.getList(key);
				for (int i = 0; i < list.size(); i++) {
					Object obj = (Object) list.get(i);
					String elem = obj.toString();
					s = s + "<" + key + ">" + elem + "</" + key + ">";
				}
			}
		}
		return s;
	}

	public String parseString(String s) {
		String ret = "";

		return ret;
	}

	public String parseList(String key) {
		List<String> list = map.getList(key);
		String ret = "";

		for (String s : list) {
			Parser p = new Parser(s);
			ret = ret + "<"+key+">"+ p.toXML() + "</"+key+">";
		}
		return ret;
	}
}
