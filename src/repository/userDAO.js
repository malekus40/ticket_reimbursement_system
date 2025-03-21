const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const logger = require("../util/logger")
const client = new DynamoDBClient({ region: "us-west-1" });

const documentClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'ReimbursementTable';


async function createUser(user) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${user.username}`,
      SK: 'PROFILE',
      itemType: 'USER',
      username: user.username,
      password: user.hashedPassword,
      role: 'employee',
      created_at: new Date().toISOString()
    },
    ConditionExpression: 'attribute_not_exists(#pk)',
    ExpressionAttributeNames: { '#pk': 'PK' }

  };
  try {
    await documentClient.send(new PutCommand(params));
    return params.Item;
  } catch (err) {
    logger.error(err);
    return null
  }

}

async function getUserByUsername(username) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${username}`,
      SK: 'PROFILE'
    }
  };
  try {
    const result = await documentClient.send(new GetCommand(params));
    return result.Item;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

// async function updateUserRole(username, newRole) {
//   const params = {
//     TableName: TABLE_NAME,
//     Key: {
//       PK: `USER#${username}`,
//       SK: 'PROFILE'
//     },
//     UpdateExpression: 'SET #role = :newRole',
//     ExpressionAttributeNames: { '#role': 'role' },
//     ExpressionAttributeValues: { ':newRole': newRole },
//     ReturnValues: 'ALL_NEW'
//   };

//   try {
//     const result = await documentClient.send(new UpdateCommand(params));
//     return result.Attributes;
//   } catch (err) {
//     logger.error(err);
//     return null;
//   }
// }


module.exports = {
  createUser,
  getUserByUsername,
  //updateUserRole
};