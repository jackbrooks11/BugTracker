import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-member-photo',
  templateUrl: './member-photo.component.html',
  styleUrls: ['./member-photo.component.css']
})
export class MemberPhotoComponent implements OnInit {

  @Input() roles: string;
  constructor() { }

  ngOnInit(): void {
  }

}
