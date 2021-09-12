export class TicketForProjectParams {
    pageNumber: number = 1;
    pageSize: number = 5;
    orderBy: string = 'created';
    ascending: boolean = false;
    searchMatch: string = "";
    icons: number[] = [0, 0, 2];
    index: number = 2;
}