import { Ticket } from "./ticket";

export interface Member {
    id: number;
    userName: string;
    company: string;
    about: string;
    fullName: string;
    created: Date;
    lastActive: Date;
    tickets: Ticket[];
}