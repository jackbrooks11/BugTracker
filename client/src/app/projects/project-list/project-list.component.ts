import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { concatMap, mergeMap, switchMap } from 'rxjs/operators';
import { ProjectModalComponent } from 'src/app/modals/project-modal/project-modal.component';
import { Pagination } from 'src/app/_models/pagination';
import { Project } from 'src/app/_models/project';
import { ProjectParams } from 'src/app/_models/projectParams';
import { MembersService } from 'src/app/_services/members.service';
import { ProjectsService } from 'src/app/_services/projects.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  projects: Project[];
  pagination: Pagination;
  projectParams: ProjectParams = new ProjectParams();
  bsModalRef: BsModalRef;
  checkAll: boolean = false;
  projectIdsToDelete: number[] = [];
  constructor(
    private projectService: ProjectsService,
    private modalService: BsModalService,
    private memberService: MembersService
  ) {
    this.projectParams = this.projectService.getProjectParams();
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
    this.projectParams.searchMatch =
      this.projectParams.searchMatch.toLowerCase();
    this.projectService.setProjectParams(this.projectParams);
  }

  loadProjects(
    toggle: boolean = false,
    index: number = this.projectParams.index
  ) {
    this.updateTable(toggle, index);
    this.projectService
      .getProjects(this.projectParams)
      .subscribe((response) => {
        this.projects = response.result;
        this.pagination = response.pagination;
        if (this.checkAll) {
          this.projectIdsToDelete = [];
          this.projects.forEach((val) => this.projectIdsToDelete.push(val.id));
        }
      });
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

  pageChanged(event: any) {
    this.projectParams.pageNumber = event.page;
    this.projectService.setProjectParams(this.projectParams);
    this.loadProjects();
  }

  openProjectModal() {
    const config = {
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ProjectModalComponent, config);
    this.bsModalRef.content.submitted.subscribe((value) => {
      const submitted = value;
      if (submitted) {
        this.createProject();
      }
    });
  }

  createProject() {
    this.projectService
      .createProject(this.bsModalRef.content.createProjectForm.value).subscribe(() => {
        this.loadProjects();
      })
  }

  deleteProjects() {
    if(confirm("Are you sure to delete the selected project(s)?")) {
      this.projectService
      .deleteProjects(this.projectIdsToDelete)
      .subscribe((value) => {
        this.projectIdsToDelete = [];
        this.loadProjects();
      });
    }
  }

  toggleCheckAll = (evt) => {
    this.checkAll = !this.checkAll;
    if (evt.target.checked == true) {
      this.projects.forEach((val) => this.projectIdsToDelete.push(val.id));
    } else {
      this.projectIdsToDelete.length = 0;
    }
  }

  changed = (evt, id: number) => {
    if (evt.target.checked == true) {
      this.projectIdsToDelete.push(id);
    } else {
      this.projectIdsToDelete.splice(this.projectIdsToDelete.indexOf(id), 1);
    }
  }
}
