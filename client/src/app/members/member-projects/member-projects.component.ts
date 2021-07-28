import { Component, OnInit } from '@angular/core';
import { Pagination } from 'src/app/_models/pagination';
import { Project } from 'src/app/_models/project';
import { ProjectParams } from 'src/app/_models/projectParams';
import { ProjectsService } from 'src/app/_services/projects.service';

@Component({
  selector: 'app-member-projects',
  templateUrl: './member-projects.component.html',
  styleUrls: ['./member-projects.component.css']
})
export class MemberProjectsComponent implements OnInit {
  projects: Project[];
  pagination: Pagination;
  projectParams: ProjectParams;


  constructor(private projectService: ProjectsService) {
    this.projectParams = this.projectService.getProjectForUserParams();
   }

  ngOnInit(): void {
    this.loadProjects();
  }

  updateTable(toggle: boolean, index: number) {
    if (toggle) {
      this.changeIcon(index);
      //New column has been clicked
      if (this.projectParams.index != index) {
        //Set old icon to double arrows
        this.projectParams.icons[this.projectParams.index] = 0;
        //New index for column clicked
        this.projectParams.index = index;
        this.projectParams.ascending = true;
      }
      //Still on same column
      else {
        this.toggleAscending();
      }
    }
    this.projectParams.searchMatch = this.projectParams.searchMatch.toLowerCase();
    this.projectService.setProjectForUserParams(this.projectParams);
  }

  loadProjects(
    toggle: boolean = false,
    index: number = this.projectParams.index
  ) {
    this.updateTable(toggle, index);
    this.projectService
      .getProjectsForUser(this.projectParams)
      .subscribe((response) => {
        this.projects = response.result;
        this.pagination = response.pagination;
      });
  }

  pageChanged(event: any) {
    this.projectParams.pageNumber = event.page;
    this.projectService.setProjectForUserParams(this.projectParams);
    this.loadProjects();
  }

  toggleAscending() {
    this.projectParams.ascending = !this.projectParams.ascending;
  }

  changeIcon(index: number) {
    if (this.projectParams.icons[index] == 2) {
      --this.projectParams.icons[index];
    } else {
      ++this.projectParams.icons[index];
    }
  }

}
