export interface TicketComment {
    id: number;
    ticketId: number;
    message: string;
    submittedBy: string;
    roles: string;
    created: Date;
}