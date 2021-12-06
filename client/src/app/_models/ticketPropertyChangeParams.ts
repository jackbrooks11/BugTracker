export class TicketPropertyChangeParams {
    pageNumber: number = 1;
    pageSize: number = 5;
    orderBy: string = 'changed';
    ascending: boolean = false;
    searchMatch: string = "";
    icons: number[] = [0, 0, 0, 0, 2];
    index: number = 4;
}