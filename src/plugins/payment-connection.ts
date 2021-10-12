import { Connection, ConnectionManager, createConnection, getConnectionManager, getConnectionOptions } from 'typeorm'

/**
 * PaymentConnection manager class
 */
export default class PaymentConnection {
  private connectionManager: ConnectionManager

  constructor() {
    this.connectionManager = getConnectionManager()
  }

  public async getConnection(): Promise<Connection> {
    const CONNECTION_NAME = `payment_connection`

    let connection: Connection

    if (this.connectionManager.has(CONNECTION_NAME)) {
      console.log(`PaymentConnection.getConnection()-using existing connection ...`)
      connection = this.connectionManager.get(CONNECTION_NAME)

      if (!connection.isConnected) {
        connection = await connection.connect()
      }
    } else {
      console.log(`PaymentConnection.getConnection()-creating connection ...`)
      const connectionOptions = await getConnectionOptions();
      Object.assign(connectionOptions, {
        database: process.env.PAYMENT_DB || "payment_service",
        name: CONNECTION_NAME
      });
      connection = await createConnection(connectionOptions);
    }

    return connection
  }
}
