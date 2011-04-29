package lsst.ctrl.pipevis;

import javax.jms.Connection;
import javax.jms.Destination;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.command.ActiveMQTextMessage;



public class ShuffleAgent {

	private Destination consumerDestination;
	private Connection consumerConnection;
	private Session consumerSession;
	MessageConsumer consumer;

	private Destination producerDestination;
	private Connection producerConnection;
	private Session producerSession;
	MessageProducer producer;

	public ShuffleAgent(String topicIn, String topicOut, String brokerHost, int port) {
		createConsumer(topicIn, brokerHost, port);
		createProducer(topicOut, brokerHost, port);
	}
	
	public Session getProducerSession() {
		return producerSession;
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
