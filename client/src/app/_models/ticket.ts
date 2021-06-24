export interface Ticket {
    id: number;
    title: string;
    project: string;
    description: string;
    submittedBy: string;
    assignedTo: string;
    priority: string;
    type: string;
    state: string;
    created: string;
    lastEdited: string;
}