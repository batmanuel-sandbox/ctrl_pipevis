package lsst.ctrl.pipevis;

public class Tokenizer {

	String _punctuation = ".,\"";
	int pos = 0;
	String _s;

	public Tokenizer(String s) {
		this._s = s;
		pos = 0;
	}
	
	public boolean isPunctuation(char c) {

		if (_punctuation.indexOf(c) >= 0)
			return true;
		return false;
	}

	public String nextToken() {
		String ret = "";
		if (pos >= _s.length())
			return null;
		char c = _s.charAt(pos);
		while ((c == ' ') || (c == '\n')) {
			pos++;
			if (pos >= _s.length())
				return ret;
			c = _s.charAt(pos);
		}
		if ((c == ':') || (c == '{') || (c == '}')) {
			pos++;
			return "" + c;
		}
		while (Character.isLetterOrDigit(c) || isPunctuation(c)) {
			ret += c;
			pos++;
			if (pos >= _s.length())
				return ret;
			c = _s.charAt(pos);
		}
		if ((c == ' ') || (c == '\n')) {
			pos++;
			return ret;
		}
		return ret;
	}
	
	public static void main(String[] args) {
		Tokenizer t = new Tokenizer("database: {\n authInfo: {\n host: lsst10.ncsa.uiuc.edu\nuser: srp\npassword: mypass\nport: 3306\n}\n}\n");
		while (true) {
			String token = t.nextToken();
			if ((token == null) || (token.isEmpty()))
				return;
			System.out.println(token);
		}
	}
}
