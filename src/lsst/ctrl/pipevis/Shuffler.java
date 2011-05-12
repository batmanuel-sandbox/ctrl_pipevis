package lsst.ctrl.pipevis;

import java.util.ArrayList;
import java.util.Enumeration;

import javax.jms.TextMessage;

import org.apache.activemq.command.ActiveMQTextMessage;

public class Shuffler implements Runnable {

	ShuffleAgent shufflePair = null;

	public static void main(String[] args) {
		
		Shuffler shuffler1 = new Shuffler(new ShuffleAgent("CcdJob", "CcdJob_ajax",
				"lsst8.ncsa.uiuc.edu", 61616));

		Shuffler shuffler2 = new Shuffler(new ShuffleAgent("JobOfficeStatus", "JobOfficeStatus_ajax",
				"lsst8.ncsa.uiuc.edu", 61616));

		Shuffler shuffler3 = new Shuffler(new ShuffleAgent("RawCcdAvailable", "RawCcdAvailable_ajax",
				"lsst8.ncsa.uiuc.edu", 61616));
		
		ArrayList<Thread> list = new ArrayList<Thread>();


		Thread t = new Thread(shuffler1);
		t.start();
		list.add(t);


		Thread t2 = new Thread(shuffler2);
		t2.start();
		
		list.add(t2);

		Thread t3 = new Thread(shuffler3);
		t3.start();
		
		list.add(t2);
		
		
		for (int i = 0; i < list.size(); i++) {
			Thread joinThread = (Thread)list.get(i);
			try {
				joinThread.join();
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

	}

	public Shuffler(ShuffleAgent pair) {
		shufflePair = pair;
	}

	public void run() {
		while (true) {

				try {
					ActiveMQTextMessage msg = shufflePair.getMessage();

					if (msg == null)
						return;
					

					String runid = (String) msg.getProperty("RUNID");
/*
					if (runid.startsWith("srp") == false)
						continue;
*/			

					LsstXMLMessage lsstMsg = new LsstXMLMessage(msg);

					
					// String payload = "<payload " + lsstMsg.getProperties() +
					// " "+ lsstMsg.getPayload() + "/>";
					String payload = "<payload>" + lsstMsg.getProperties()
							+ " " + lsstMsg.getPayload() + "</payload>";
					System.out.println(payload);
					TextMessage msg2 = shufflePair.getProducerSession()
							.createTextMessage();
					msg2.setText(payload);
					Enumeration en = msg.getPropertyNames();

					while (en.hasMoreElements()) {
						String key = (String) en.nextElement();
						msg2.setObjectProperty(key, msg.getProperty(key));
					}

					shufflePair.sendMessage(msg2);
				} catch (Exception e) {
					System.out.println(e);
				}
		}
	}



}
