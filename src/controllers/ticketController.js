const express = require('express');
const routerTicket = express.Router();
const ticketService = require('../services/ticketService');
const logger = require("../util/logger");
const { authenticateToken } = require("../util/jwt");

routerTicket.use(authenticateToken);

// Create a new ticket (only employees can send tickets)
routerTicket.post('/', async (req, res) => {
  try {
    const ticketData = req.body;

    if (req.user.role !== "employee") {
      return res.status(403).json("Finance Managers cannot send tickets");
    }

    const newTicket = await ticketService.createTicket(ticketData);
    if (newTicket) {
      return res.status(201).json({
        message: 'Ticket created successfully',
        ticket: newTicket
      });
    } else {
      return res.status(400).json({ message: 'Ticket creation failed' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get ticket history (only the owner can see their ticket history)
routerTicket.get('/history/:username', async (req, res) => {
  try {
    if (req.user.username !== req.params.username) {
      return res.status(403).json({ message: "Forbidden Access" });
    }
    
    const { username } = req.params;
    const tickets = await ticketService.getTicketsByUser(username);
    if (tickets && tickets.length > 0) {
      return res.status(200).json({
        message: 'Tickets retrieved successfully',
        tickets: tickets
      });
    } else {
      return res.status(404).json({ message: 'No tickets found for this user' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Update ticket status (only managers can update status)
routerTicket.patch('/:username/:ticket_id', async (req, res) => {
  try {
    const { username, ticket_id } = req.params;
    const { newStatus } = req.body;

    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Employees cannot change status" });
    }

    if (!newStatus) {
      return res.status(400).json({ message: 'New status is required' });
    }

    const updatedTicket = await ticketService.updateTicketStatus(username, ticket_id, newStatus);
    if (updatedTicket) {
      return res.status(200).json({
        message: 'Ticket status updated successfully',
        ticket: updatedTicket
      });
    } else {
      return res.status(400).json({ message: 'Ticket status update failed' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get all pending tickets (only accessible by managers)
routerTicket.get('/pending', async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden Access" });
    }

    const pendingTickets = await ticketService.getPendingTickets();
    if (pendingTickets && pendingTickets.length > 0) {
      return res.status(200).json({
        message: "Pending tickets retrieved successfully",
        tickets: pendingTickets
      });
    } else {
      return res.status(404).json({ message: "No pending tickets found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Get tickets for a given username (generic route, should be declared last)
routerTicket.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const tickets = await ticketService.getTicketsByUser(username);
    if (tickets && tickets.length > 0) {
      return res.status(200).json({
        message: 'Tickets retrieved successfully',
        tickets: tickets
      });
    } else {
      return res.status(404).json({ message: 'No tickets found for this user' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = routerTicket;
