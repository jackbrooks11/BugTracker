export interface Ticket {
    id: number;
    title: string;
    description: string;
    submittedByUserName: string;
    assignedToUserName: string;
    priority: string;
    type: string;
    state: string;
    created: string;
    lastEdited: string;
}