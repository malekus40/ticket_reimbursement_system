const { DynamoDBDocumentClient, PutCommand, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const mockDocumentClient = {
  send: jest.fn()
};


jest.mock("@aws-sdk/lib-dynamodb", () => {
  const actual = jest.requireActual("@aws-sdk/lib-dynamodb");
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: jest.fn(() => mockDocumentClient)
    }
  };
});

const ticketDAO = require("../src/repository/ticketDAO");

describe("ticketDAO", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTicket", () => {
    it("should return the ticket item when PutCommand resolves", async () => {
      mockDocumentClient.send.mockResolvedValue({});

      const ticket = {
        username: "user1",
        ticket_id: "abc123",
        amount: 100,
        description: "Test description"
      };

      const result = await ticketDAO.createTicket(ticket);

      
      expect(result).toHaveProperty("PK", "USER#user1");
      expect(result).toHaveProperty("SK", "TICKET#abc123");
      expect(result).toHaveProperty("itemType", "TICKET");
      expect(result).toHaveProperty("amount", 100);
      expect(result).toHaveProperty("description", "Test description");
      expect(result).toHaveProperty("status", "pending");
      expect(result).toHaveProperty("created_at");
    });

    it("should return null if PutCommand rejects", async () => {

      mockDocumentClient.send.mockRejectedValue(new Error("Put error"));

      const ticket = {
        username: "user1",
        ticket_id: "abc123",
        amount: 100,
        description: "Test description"
      };


      const result = await ticketDAO.createTicket(ticket);


      expect(result).toBeNull();
    });
  });

  describe("updateTicketStatus", () => {
    it("should return updated attributes when UpdateCommand resolves", async () => {
      const fakeAttributes = {
        PK: "USER#user1",
        SK: "TICKET#abc123",
        status: "approved"
      };

      mockDocumentClient.send.mockResolvedValue({ Attributes: fakeAttributes });

      const result = await ticketDAO.updateTicketStatus("user1", "abc123", "approved");
 

      expect(result).toEqual(fakeAttributes);
    });

    it("should return null if UpdateCommand rejects", async () => {
      mockDocumentClient.send.mockRejectedValue(new Error("Update error"));
      const result = await ticketDAO.updateTicketStatus("user1", "abc123", "approved");
      expect(result).toBeNull();
    });
  });

  describe("getPendingTickets", () => {
    it("should return pending tickets when QueryCommand resolves", async () => {
      const fakeItems = [
        { PK: "USER#user1", SK: "TICKET#abc123", status: "pending" }
      ]; 

      mockDocumentClient.send.mockResolvedValue({ Items: fakeItems });

      const result = await ticketDAO.getPendingTickets();

      expect(result).toEqual(fakeItems);
    });

    it("should return null if QueryCommand rejects for getPendingTickets", async () => {
      mockDocumentClient.send.mockRejectedValue(new Error("Query error"));
      const result = await ticketDAO.getPendingTickets();
      expect(result).toBeNull();
    });
  });

  describe("getTicketsByUser", () => {
    it("should return tickets for the given username when QueryCommand resolves", async () => {
      const fakeItems = [
        { PK: "USER#user1", SK: "TICKET#abc123", status: "pending" },
        { PK: "USER#user1", SK: "TICKET#def456", status: "approved" }
      ];
      mockDocumentClient.send.mockResolvedValue({ Items: fakeItems });

      const result = await ticketDAO.getTicketsByUser("user1");

      expect(result).toEqual(fakeItems);
    });

    it("should return null if QueryCommand rejects for getTicketsByUser", async () => {
      mockDocumentClient.send.mockRejectedValue(new Error("Query error"));
      const result = await ticketDAO.getTicketsByUser("user1");
      expect(result).toBeNull();
    });
  });
});
