const ticketService = require("../src/services/ticketService");
const ticketDAO = require("../src/repository/ticketDAO");
const uuid = require("uuid");

jest.mock("../src/repository/ticketDAO");

describe("Ticket Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTicket", () => {
    test("should return null if required fields are missing", async () => {
      
      const invalidTicket = { username: "user1", amount: 100 };
      const result = await ticketService.createTicket(invalidTicket);
      expect(result).toBeNull();
    });

    test("should create a ticket when valid input is provided", async () => {
      const validTicket = {
        username: "user1",
        amount: 100,
        description: "Test ticket"
      };

      const fakeTicket = {
        ticket_id: "some-random-id",
        username: validTicket.username,
        amount: validTicket.amount,
        description: validTicket.description,
        status: "pending"
      };

      ticketDAO.createTicket.mockResolvedValue(fakeTicket);

      const result = await ticketService.createTicket(validTicket);

      expect(result).toEqual(fakeTicket); 

      expect(ticketDAO.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          username: validTicket.username,
          amount: validTicket.amount,
          description: validTicket.description,
          ticket_id: expect.any(String)
        })
      );
    });
  });

  describe("getTicketsByUser", () => {
    
    test("should return tickets when a valid username is provided", async () => {
      const fakeTickets = [
        { ticket_id: "t1", username: "user1", amount: 100, description: "Ticket 1" },
        { ticket_id: "t2", username: "user1", amount: 150, description: "Ticket 2" }
      ];

      ticketDAO.getTicketsByUser.mockResolvedValue(fakeTickets);

      const result = await ticketService.getTicketsByUser("user1");
      expect(result).toEqual(fakeTickets);
      expect(ticketDAO.getTicketsByUser).toHaveBeenCalledWith("user1");
    });

    
  });

  describe("updateTicketStatus", () => {
    test("should return null if any required parameter is missing", async () => {
      const result = await ticketService.updateTicketStatus("", "ticket1", "approved");
      expect(result).toBeNull();
    });

    test("should return null if newStatus is invalid", async () => {
      const result = await ticketService.updateTicketStatus("user1", "ticket1", "invalid");
      expect(result).toBeNull();
    });

    test("should update the ticket status and return the updated ticket", async () => {
      const fakeUpdatedTicket = {
        ticket_id: "ticket1",
        username: "user1",
        status: "approved"
      };

      ticketDAO.updateTicketStatus.mockResolvedValue(fakeUpdatedTicket);

      const result = await ticketService.updateTicketStatus("user1", "ticket1", "approved");
      expect(result).toEqual(fakeUpdatedTicket);
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledWith("user1", "ticket1", "approved");
    });

    
  });

  describe("getPendingTickets", () => {
    test("should return pending tickets if DAO resolves", async () => {
      const fakePendingTickets = [
        { ticket_id: "ticket1", username: "user1", status: "pending" },
        { ticket_id: "ticket2", username: "user2", status: "pending" }
      ];
      ticketDAO.getPendingTickets.mockResolvedValue(fakePendingTickets);

      const result = await ticketService.getPendingTickets();
      expect(result).toEqual(fakePendingTickets);
      expect(ticketDAO.getPendingTickets).toHaveBeenCalled();
    });

    test("should return null if DAO.getPendingTickets rejects", async () => {
      ticketDAO.getPendingTickets.mockRejectedValue(new Error("Error"));
      const result = await ticketService.getPendingTickets();
      expect(result).toBeNull();
    });
  });
});