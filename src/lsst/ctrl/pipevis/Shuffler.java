package lsst.ctrl.pipevis;

import java.util.Enumeration;

import javax.jms.Connection;
import javax.jms.Destination;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.command.ActiveMQTextMessage;

public class Shuffler implements Runnable {

	private Destination consumerDestination;
	private Connection consumerConnection;
	private Session consumerSession;
	MessageConsumer consumer;

	private Destination producerDestination;
	private Connection producerConnection;
	private Session producerSession;
	MessageProducer producer;

	public static void main(String[] args) {
		Shuffler shuffler = new Shuffler("CcdJob", "CcdJob_ajax", "lsst8.ncsa.uiuc.edu", 61616);

		Thread t = new Thread(shuffler);
		t.run();
		try {
			t.join();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public Shuffler(String topicIn, String topicOut, String brokerHost, int port) {
		createConsumer(topicIn, brokerHost, port);
		createProducer(topicOut, brokerHost, port);
	}

	public void createConsumer(String topic, String host, int port) {
		String brokerURI = "tcp://" + host + ":" + port
				+ "?jms.useAsyncSend=true";

		ActiveMQConnectionFactory connectionFactory = new ActiveMQConnectionFactory(
				brokerURI);

		try {
			consumerConnection = connectionFactory.createConnection();

			consumerConnection.start();

			consumerSession = consumerConnection.createSession(false,
					Session.AUTO_ACKNOWLEDGE);

			consumerDestination = consumerSession.createTopic(topic);

			consumer = consumerSession.createConsumer(consumerDestination);
		} catch (Exception e) {
			System.err.println(e);
		}

	}

	public void createProducer(String topic, String host, int port) {
		String brokerURI = "tcp://" + host + ":" + port
				+ "?jms.useAsyncSend=true";

		ActiveMQConnectionFactory connectionFactory = new ActiveMQConnectionFactory(
				brokerURI);

		try {
			producerConnection = connectionFactory.createConnection();

			producerConnection.start();

			producerSession = producerConnection.createSession(false,
					Session.AUTO_ACKNOWLEDGE);

			producerDestination = producerSession.createTopic(topic);

			producer = producerSession.createProducer(producerDestination);

		} catch (Exception e) {
			System.err.println(e);
		}
	}

	public void run() {
		while (true) {
			try {
				ActiveMQTextMessage msg = getMessage();

				if (msg == null)
					return;

				CcdJobMessage lsstMsg = new CcdJobMessage(msg);

				
//				String payload = "<payload " + lsstMsg.getProperties() + " "+ lsstMsg.getPayload() + "/>";
				String payload = "<payload>" + lsstMsg.getProperties() + " "+ lsstMsg.getPayload() + "</payload>";
				System.out.println(payload);
				TextMessage msg2 = producerSession.createTextMessage();
				msg2.setText(payload);
				Enumeration en = msg.getPropertyNames();

				while (en.hasMoreElements()) {
					String key = (String) en.nextElement();
					msg2.setObjectProperty(key, msg.getProperty(key));
				}

				sendMessage(msg2);
			} catch (Exception e) {
				System.out.println(e);
			}
		}
	}

	/**
	 * Retrieve the next available message from the Reader's data source
	 * 
	 * @return MonitorMessage encapsulating the retrieved message
	 */
	public ActiveMQTextMessage getMessage() {
		ActiveMQTextMessage message = null;
		try {
			message = (ActiveMQTextMessage) consumer.receive();
		} catch (Exception e) {
			System.err.println(e);
		}
		return message;
	}

	public void sendMessage(TextMessage msg) {
		try {
			producer.send(msg);
		} catch (Exception e) {
			System.out.println(e);
		}
	}

}
