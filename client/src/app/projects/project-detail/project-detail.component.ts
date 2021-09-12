import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/_models/project';
import { ProjectsService } from 'src/app/_services/projects.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  project: Project;
  constructor(private projectService: ProjectsService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadProject();
  }
  loadProject() {
    this.projectService.getProjectById(Number(this.route.snapshot.paramMap.get('id'))).
    subscribe(project => {
      if (project == null) {
        this.router.navigateByUrl('/not-found')
      }
      this.project = project;
    }, error => {
      this.router.navigateByUrl('/not-found');
    })
  }
}
