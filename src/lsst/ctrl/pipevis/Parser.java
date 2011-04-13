package lsst.ctrl.pipevis;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;


public class Parser {

	Tokenizer t = null;
	LinkedHashMap lhm = null;
	
	
	public Parser(String s) {
		this.t = new Tokenizer(s);
		lhm = new LinkedHashMap();
	}
	
	public String getWord() {
		String token = t.nextToken();
		if (token == null)
			return null;
		return token;
	}
	
	public String getColon() {
		String token = t.nextToken();
		if (token == null)
			return null;
		if (token.equals(":") == false) {
			System.out.println("Expected colon, got "+token);
		}
		return token;
	}
	
	public LinkedHashMap resolve() {
		LinkedHashMap<String, Object> result = new LinkedHashMap<String, Object>();
		
		String token = null;
		String colon = null;
		while (true) {
			String word = t.nextToken();
			if (word == null)
				return result;
			if (word.equals("}"))
				return result;
			colon = getColon();
			if (colon == null)
				return result;
			token = t.nextToken();
			if (token.equals("{")) {
				LinkedHashMap ret = resolve();
				result.put(word, ret);
			} else {
				result.put(word, token);
			}
		}
	}
	
	public String toXML() {
		LinkedHashMap map = resolve();
		return toXML(map);
	}
	
	public String toXML(LinkedHashMap map) {
		String ret = "";
		Set<String> set = map.keySet();
		for (String key : set) {
			ret = ret + "<"+key+">";
			Object obj = map.get(key);
			if (obj instanceof String) {
				String s1 = obj.toString().replace("\"", "");
				ret = ret + s1;
			} else
				ret = ret + toXML((LinkedHashMap)map.get(key));
			ret = ret + "</"+key+">";
		}
		return ret;
	}
	public static void main(String[] args) {
		Parser p = new Parser("database: {\n authInfo: {\n host: lsst10.ncsa.uiuc.edu\nuser: srp\npassword: \"stuff\"\nport: 3306\n}\n}\n");
		System.out.println(p.toXML());
	}
}
