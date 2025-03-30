const ticketDAO = require("../repository/ticketDAO");
const uuid = require("uuid");

const validStatuses = ["pending", "approved", "denied"];

async function createTicket(ticket) {
    if (!ticket.username || !ticket.amount || !ticket.description) {
        return null;
    }
    const ticketId = uuid.v4();

    const newTicket = {
        ticket_id: ticketId,
        username: ticket.username,
        amount: ticket.amount,
        description: ticket.description
    };
    const result = await ticketDAO.createTicket(newTicket);
    return result;
}

async function updateTicketStatus(username, ticket_id, newStatus) {
    if (!username || !ticket_id || !newStatus) {
        return null;
    }
    if (!validStatuses.includes(newStatus)) {
        return null;
    }

    try {
        const updatedTicket = await ticketDAO.updateTicketStatus(username, ticket_id, newStatus);
        return updatedTicket;
    } catch (err) {
        console.error("Error updating ticket status:", err);
        return null;
    }
}

async function getPendingTickets() {
    try {
        const tickets = await ticketDAO.getPendingTickets();
        return tickets;
    } catch (err) {
        console.error("Error in service while retrieving pending tickets:", err);
        return null;
    }
}

async function getTicketsByUser(username) {
    if (!username) {
        return null;
    }
    try {
        const tickets = await ticketDAO.getTicketsByUser(username);
        return tickets;
    } catch (err) {
        console.error("Error retrieving tickets:", err);
        return null;
    }
}

module.exports = {
    createTicket,
    getTicketsByUser,
    updateTicketStatus,
    getPendingTickets
};
