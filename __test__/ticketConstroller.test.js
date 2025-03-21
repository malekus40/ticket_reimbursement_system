const request = require('supertest');
const express = require('express');
const ticketController = require('../src/controllers/ticketController');
const ticketService = require('../src/services/ticketService');


jest.mock('../src/util/jwt', () => ({
  authenticateToken: (req, res, next) => {
    
    req.user = global.testUser || {};
    next();
  }
}));


let app;
beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/tickets', ticketController);
});


beforeEach(() => {
  jest.clearAllMocks();
});

describe('Ticket Controller', () => {
  describe('POST /tickets', () => {
    it('should return 403 if the authenticated user is not an employee', async () => {
      global.testUser = { username: 'manager1', role: 'manager' };
      const res = await request(app)
        .post('/tickets')
        .send({ username: 'employee1', amount: 100, description: 'Test ticket' });
      
      expect(res.status).toBe(403);
      expect(res.body).toEqual("Finance Managers cannot send tickets");
    });

    it('should create a ticket and return 201 when valid input is provided by an employee', async () => {
      global.testUser = { username: 'employee1', role: 'employee' };
      const fakeTicket = {
        ticket_id: 'ticket1',
        username: 'employee1',
        amount: 100,
        description: 'Test ticket',
        status: 'pending'
      };

      ticketService.createTicket = jest.fn().mockResolvedValue(fakeTicket);

      const res = await request(app)
        .post('/tickets')
        .send({ username: 'employee1', amount: 100, description: 'Test ticket' });
      
      expect(ticketService.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'employee1',
          amount: 100,
          description: 'Test ticket'
        })
      );
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Ticket created successfully',
        ticket: fakeTicket
      });
    });

    it('should return 400 if ticketService.createTicket returns null', async () => {
      global.testUser = { username: 'employee1', role: 'employee' };
      ticketService.createTicket = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .post('/tickets')
        .send({ username: 'employee1', amount: 100, description: 'Test ticket' });
      
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Ticket creation failed' });
    });
  });

  describe('PATCH /tickets/:username/:ticket_id', () => {
    it('should return 403 if the authenticated user is not a manager', async () => {
      global.testUser = { username: 'employee1', role: 'employee' };
      const res = await request(app)
        .patch('/tickets/employee1/ticket1')
        .send({ newStatus: 'approved' });
      
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: "Employees cannot change status" });
    });

    it('should return 400 if newStatus is not provided', async () => {
      global.testUser = { username: 'manager1', role: 'manager' };
      const res = await request(app)
        .patch('/tickets/employee1/ticket1')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'New status is required' });
    });

    it('should update ticket status and return 200 when valid parameters are provided by a manager', async () => {
      global.testUser = { username: 'manager1', role: 'manager' };
      const fakeUpdatedTicket = {
        ticket_id: 'ticket1',
        username: 'employee1',
        status: 'approved'
      };
      ticketService.updateTicketStatus = jest.fn().mockResolvedValue(fakeUpdatedTicket);

      const res = await request(app)
        .patch('/tickets/employee1/ticket1')
        .send({ newStatus: 'approved' });
      
      expect(ticketService.updateTicketStatus).toHaveBeenCalledWith('employee1', 'ticket1', 'approved');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Ticket status updated successfully',
        ticket: fakeUpdatedTicket
      });
    });

    it('should return 400 if ticketService.updateTicketStatus returns null', async () => {
      global.testUser = { username: 'manager1', role: 'manager' };
      ticketService.updateTicketStatus = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .patch('/tickets/employee1/ticket1')
        .send({ newStatus: 'approved' });
      
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Ticket status update failed' });
    });
  });

  describe('GET /tickets/pending', () => {
    it('should return 403 if the authenticated user is not a manager', async () => {
      global.testUser = { username: 'employee1', role: 'employee' };

      const res = await request(app)
        .get('/tickets/pending');
      
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: "Forbidden Access" });
    });

    it('should return pending tickets for a manager when tickets exist', async () => {
      global.testUser = { username: 'manager1', role: 'manager' };
      const fakePendingTickets = [
        { ticket_id: 'ticket1', username: 'employee1', status: 'pending' },
        { ticket_id: 'ticket2', username: 'employee2', status: 'pending' }
      ];
      ticketService.getPendingTickets = jest.fn().mockResolvedValue(fakePendingTickets);

      const res = await request(app)
        .get('/tickets/pending');
      
      expect(ticketService.getPendingTickets).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Pending tickets retrieved successfully",
        tickets: fakePendingTickets
      });
    });

    it('should return 404 if no pending tickets are found', async () => {
      global.testUser = { username: 'manager1', role: 'manager' };
      ticketService.getPendingTickets = jest.fn().mockResolvedValue([]);

      const res = await request(app)
        .get('/tickets/pending');
      
      expect(ticketService.getPendingTickets).toHaveBeenCalled();
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "No pending tickets found" });
    });
  });

  describe('GET /tickets/:username', () => {
    it('should return tickets for a given username', async () => {
      const fakeTickets = [
        { ticket_id: 'ticket1', username: 'employee1', status: 'pending' },
        { ticket_id: 'ticket2', username: 'employee1', status: 'approved' }
      ];
      ticketService.getTicketsByUser = jest.fn().mockResolvedValue(fakeTickets);
      global.testUser = { username: 'manager1', role: 'manager' };

      const res = await request(app)
        .get('/tickets/employee1');
      
      expect(ticketService.getTicketsByUser).toHaveBeenCalledWith("employee1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Tickets retrieved successfully',
        tickets: fakeTickets
      });
    });

    it('should return 404 if no tickets found for the given username', async () => {
      ticketService.getTicketsByUser = jest.fn().mockResolvedValue([]);
      global.testUser = { username: 'manager1', role: 'manager' };

      const res = await request(app)
        .get('/tickets/employee1');
      
      expect(ticketService.getTicketsByUser).toHaveBeenCalledWith("employee1");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No tickets found for this user' });
    });
  });

  describe('GET /tickets/history/:username', () => {
    it('should return 403 if the authenticated user does not match the requested username', async () => {
      global.testUser = { username: 'employee1', role: 'employee' };

      const res = await request(app)
        .get('/tickets/history/employee2');
      
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: "Forbidden Access" });
    });

    it('should return ticket history if the authenticated user matches the requested username', async () => {
      global.testUser = { username: 'employee1', role: 'employee' };
      const fakeTickets = [
        { ticket_id: 'ticket1', username: 'employee1', status: 'pending' },
        { ticket_id: 'ticket2', username: 'employee1', status: 'approved' }
      ];
      ticketService.getTicketsByUser = jest.fn().mockResolvedValue(fakeTickets);

      const res = await request(app)
        .get('/tickets/history/employee1');
      
      expect(ticketService.getTicketsByUser).toHaveBeenCalledWith("employee1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Tickets retrieved successfully',
        tickets: fakeTickets
      });
    });
  });
});
