import { Ticket } from "./ticket";
export interface User {
    id: number;
    userName: string;
    company: string;
    about: string;
    fullName: string;
    created: Date;
    lastActive: Date;
    tickets: Ticket[];
    roles: string[];
}