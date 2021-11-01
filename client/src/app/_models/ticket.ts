export interface Ticket {
    id: number;
    title: string;
    project: string;
    description: string;
    submitter: string;
    assignee: string;
    priority: string;
    type: string;
    state: string;
    created: string;
    lastEdited: string;
}