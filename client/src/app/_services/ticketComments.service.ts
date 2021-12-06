import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TicketComment } from '../_models/ticketComment';

@Injectable({
  providedIn: 'root',
})
export class TicketCommentsService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  addCommentToTicket(comment: TicketComment, id: number) {
    return this.http
      .post(this.baseUrl + 'ticketComments/' + id + '/comments/create', comment)
      .pipe(map(() => {}));
  }

  deleteCommentFromTicket(commentIdsToDelete: number[], id: number) {
    return this.http
      .post(
        this.baseUrl + 'ticketComments/' + id + '/comments/delete',
        commentIdsToDelete
      )
      .pipe(map(() => {}));
  }
}
