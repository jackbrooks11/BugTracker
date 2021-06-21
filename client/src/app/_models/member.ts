import { Ticket } from "./ticket";

export interface Member {
    id: number;
    userName: string;
    created: Date;
    lastActive: Date;
    tickets: Ticket[];
}