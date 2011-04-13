package lsst.ctrl.pipevis;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * Class MultiMap operates much like a HashMap, except that it allows the same key to
 * hold multiple values.
 */
public class MultiMap {
	Map<String, List<Object>> map = null;

    /**
     * Class constructor
     */
	public MultiMap() {
		map = new HashMap<String, List<Object>>();
	}
	
    /**
     * Adds the contents of the given Map to this MultiMap.
     */
	public void setMap(Map m) {
		Set keys = m.keySet();
		Iterator it = keys.iterator();
		while (it.hasNext()) {
			String key = (String)it.next();
			put(key, m.get(key));
		}
		
	}
	
	// The following series of "put" methods might seem redundant, but it is
	// in place to enforce retaining the types of each of the objects so they
	// can be serialized with type information later.
	
    /**
     * Adds a key/Object pair to the MultiMap
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void put(String key, Object value) {
		List<Object> l = map.get(key);
		if (l == null)
			map.put(key, l = new ArrayList<Object>());
		l.add(value);
	}

	
    /**
     * Adds a key/int pair to the MultiMap
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void put(String key, int value) {
		put(key, new Integer(value));
	}
	
    /**
     * Adds a key/float pair to the MultiMap
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void put(String key, float value) {
		put(key, new Float(value));
	}
	
    /**
     * Adds a key/double pair to the MultiMap
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void put(String key, double value) {
		put(key, new Double(value));
	}
	
    /**
     * Adds a key/long pair to the MultiMap
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void put(String key, long value) {
		put(key, new Long(value));
	}

	/**
     * Replaces a key/Object pair in the MultiMap.  If any other values exist,
     * they are deleted and are replaced with this key/Object pair. 
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void replace(String key, Object value) {
		List<Object> l = map.remove(key);
		map.put(key, l = new ArrayList<Object>());
		l.add(value);
	}	
	
    /**
     * Replaces a key/int pair to the MultiMap.  All other values are deleted.
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void replace(String key, int value) {
		put(key, new Integer(value));
	}
	
    /**
     * Replaces a key/float pair in the MultiMap.  All other values are deleted.
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void replace(String key, float value) {
		put(key, new Float(value));
	}
	
    /**
     * Replaces a key/double pair in the MultiMap.  All other values are deleted.
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void replace(String key, double value) {
		put(key, new Double(value));
	}
	
    /**
     * Replaces a key/long pair in the MultiMap.  All other values are deleted.
     * @param key the key to use as an look up value
     * @param value the value to store
     */
	public void replace(String key, long value) {
		put(key, new Long(value));
	}	
	
    /**
     * Retrieves all the values in this MultiMap
     * @return a set of all values in this MultiMap
     */
	public Set entrySet() {
		return map.entrySet();
	}
	
    /**
     * Retrieves all the key in this MultiMap
     * @return a set of all keys in this MultiMap
     */
	public Set keySet() {
		return map.keySet();
	}

    /**
     * Retrieve values for a key as a Collection
     * @param key The key to use to retrieve values
     * @return the collection of values for this key
     */
	public Collection getAll(String key) {
		return map.get(key);
	}

    /**
     * Retrieve the first value that matches a key, regardless of how many
     * values are stored.
     *
     * @param key The key to use to retrieve values
     * @return the collection of values for this key
     */
	public Object get(String key) {
		List l = map.get(key);
		if (l == null)
			return null;
		return l.get(0);
	}
	
    /**
     * Retrieve values for a key as a List
     * @param key The key to use to retrieve values
     * @return the List of values for this key
     */
	public List getList(String key) {
		List l = map.get(key);
		return l;
	}
	
    /**
     * Create a clone of this MultiMap
     * @return the clone of this MultiMap
     */
	public MultiMap clone() {
		MultiMap clonedMap = new MultiMap();
		Set keys = keySet();
		Iterator it = keys.iterator();
		while (it.hasNext()) {
			String key = (String)it.next();
			List list = getList(key);
			for (int i = 0; i < list.size(); i++) {
				clonedMap.put(key, list.get(i));
			}
		}
		return clonedMap;
	}
}

