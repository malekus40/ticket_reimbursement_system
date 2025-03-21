const express = require('express');
const routerTicket = express.Router();
const ticketService = require('../services/ticketService');
const logger = require("../util/logger");

const { authenticateToken } = require("../util/jwt");

routerTicket.use(authenticateToken);

routerTicket.post('/', async (req, res) => {
    try {
        const ticketData = req.body;

        if (req.user.role !== "employee") {
            res.status(403).json("Finance Managers cannot send tickets")
        }

        const newTicket = await ticketService.createTicket(ticketData);
        if (newTicket) {
            res.status(201).json({
                message: 'Ticket created successfully',
                ticket: newTicket
            });
        } else {
            res.status(400).json({ message: 'Ticket creation failed' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});




routerTicket.patch('/:username/:ticket_id', async (req, res) => {
    try {
        const { username, ticket_id } = req.params;
        const { newStatus } = req.body;

        if (req.user.role != "manager") {
            return res.status(403).json({ message: "Employees cannot change status" });
        }

        if (!newStatus) {
            return res.status(400).json({ message: 'New status is required' });
        }

        const updatedTicket = await ticketService.updateTicketStatus(username, ticket_id, newStatus);
        if (updatedTicket) {
            res.status(200).json({
                message: 'Ticket status updated successfully',
                ticket: updatedTicket
            });
        } else {
            res.status(400).json({ message: 'Ticket status update failed' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

routerTicket.get('/pending', async (req, res) => {
    try {
        
        if (req.user.role !== "manager") {
            return res.status(403).json({ message: "Forbidden Access" });
        }

        const pendingTickets = await ticketService.getPendingTickets();

        if (pendingTickets && pendingTickets.length > 0) {
            res.status(200).json({
                message: "Pending tickets retrieved successfully",
                tickets: pendingTickets
            });
        } else {
            res.status(404).json({ message: "No pending tickets found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

routerTicket.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const tickets = await ticketService.getTicketsByUser(username);
        if (tickets && tickets.length > 0) {
            res.status(200).json({
                message: 'Tickets retrieved successfully',
                tickets: tickets
            });
        } else {
            res.status(404).json({ message: 'No tickets found for this user' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

routerTicket.get('/history/:username', async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
         return res.status(403).json({ message: "Forbidden Access" });
      }
      
      const { username } = req.params;
      const tickets = await ticketService.getTicketsByUser(username);
      if (tickets && tickets.length > 0) {
        res.status(200).json({
          message: 'Tickets retrieved successfully',
          tickets: tickets
        });
      } else {
        res.status(404).json({ message: 'No tickets found for this user' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  });


module.exports = routerTicket;