import { User } from "./user";

export class UserParams {
    pageNumber: number = 1;
    pageSize: number = 5;
    orderBy: string = 'username';
    ascending: boolean = true;
    searchMatch: string = "";
    icons: number[] = [1, 0];
    index: number = 0;
}