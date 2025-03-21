const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const logger = require("../util/logger");

const client = new DynamoDBClient({ region: "us-west-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'ReimbursementTable';


async function createTicket(ticket) {
  const created_at = new Date().toISOString();
  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${ticket.username}`,
      SK: `TICKET#${ticket.ticket_id}`,
      itemType: 'TICKET',
      amount: ticket.amount,
      description: ticket.description,
      status: 'pending',
      created_at: created_at
    },
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
  };


  try {
    await documentClient.send(new PutCommand(params));
    return params.Item;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

async function updateTicketStatus(username, ticket_id, newStatus) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${username}`,
      SK: `TICKET#${ticket_id}`
    },
    UpdateExpression: 'SET #status = :newStatus',
    ConditionExpression: '#status = :pending',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':pending': 'pending', ':newStatus': newStatus },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await documentClient.send(new UpdateCommand(params));
    return result.Attributes;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

async function getPendingTickets() {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'status-index',
    KeyConditionExpression: '#status = :pending',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':pending': 'pending'
    }
  };

  try {
    const result = await documentClient.send(new QueryCommand(params));
    return result.Items;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

async function getTicketsByUser(username) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :username AND begins_with(SK, :ticketPrefix)',
    ExpressionAttributeValues: {
      ':username': `USER#${username}`,
      ':ticketPrefix': 'TICKET#'
    }
  };

  try {
    const result = await documentClient.send(new QueryCommand(params));
    return result.Items;
  } catch (err) {
    logger.error(err);
    return null;
  }
}



module.exports = {
  createTicket,
  getTicketsByUser,
  updateTicketStatus,
  getPendingTickets,
  
};