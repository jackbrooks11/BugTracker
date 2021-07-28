import { Ticket } from "./ticket";

export interface Project {
    id: number;
    title: string;
    description: string;
    tickets: Ticket[];
    created: string;
    lastEdited: string;
}