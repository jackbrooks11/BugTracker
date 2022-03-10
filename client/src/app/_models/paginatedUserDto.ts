export interface PaginatedUserDto {
    username: string;
    email: string;
    emailConfirmed: boolean;
    id: number;
    roles: string[];
}