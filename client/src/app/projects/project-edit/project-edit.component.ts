import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Project } from 'src/app/_models/project';
import { ProjectsService } from 'src/app/_services/projects.service';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css'],
})
export class ProjectEditComponent implements OnInit {
  project: Project;
  @ViewChild('editForm') editForm: NgForm;
  @HostListener('window:beforeunload', ['$event']) unloadNotifcation(
    $event: any
  ) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }
  constructor(
    private projectService: ProjectsService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject() {
    this.projectService
      .getProjectById(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((project) => {
        this.project = project;
      });
  }

  updateProject() {
    this.projectService.updateProject(this.project).subscribe(() => {
      this.toastr.success('Project updated successfully');
      this.editForm.reset(this.project);
    });
  }
}
