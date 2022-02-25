import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  editForm: FormGroup;
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
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  initializeForm() {
    this.editForm = this.fb.group({
      title: [this.project.title, Validators.compose([Validators.pattern('[a-zA-Z]+[a-zA-Z ]*'), Validators.required])],
      description: [this.project.description, Validators.required]
    })
  }

  loadProject() {
    this.projectService
      .getProjectById(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((project) => {
        this.project = project;
        this.project.title = this.toTitleCase(this.project.title);
        this.initializeForm();
      });
  }

  updateProject() {
    this.finalizeProject();
    this.projectService.updateProject(this.project).subscribe(() => {
      this.toastr.success('Project updated successfully');
      this.project.title = this.toTitleCase(this.project.title);
      this.editForm.reset(this.project);
    });
  }

  finalizeProject() {
    this.project.title = this.editForm.value.title.toLowerCase();
    this.project.description = this.editForm.value.description;
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}
