using System.Collections.Generic;
using System.Threading.Tasks;
using API.Controllers;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace Tests
{
    public class ProjectControllerTest
    {
        [Fact]
        public async Task GetProject_WithNonexistingId_ReturnNotFound()
        {
            //Arrange
            var id = -1;
            var projectServiceStub = new Mock<IProjectService>();
            projectServiceStub.Setup(projectService => projectService.GetProjectById(id))
                .ReturnsAsync((Project)null);
            var controller = new ProjectController(null, projectServiceStub.Object, null, null);

            //Act
            var response = await controller.GetProject(id);

            //Assert
            Assert.IsAssignableFrom<NotFoundObjectResult>(response.Result);
        }

        [Fact]
        public async Task GetProject_WithExistingId_ReturnProject()
        {
            //Arrange
            var id = 8;
            var projectServiceStub = new Mock<IProjectService>();
            projectServiceStub.Setup(projectService => projectService.GetProjectById(id))
                .ReturnsAsync(new Project { Id = id });
            var controller = new ProjectController(null, projectServiceStub.Object, null, null);

            //Act
            var response = await controller.GetProject(id);

            //Assert
            var result = Assert.IsAssignableFrom<OkObjectResult>(response.Result);
            Assert.IsType<Project>(result.Value);
        }

        [Fact]
        public void GetProjects_WithNoProjects_ReturnNull()
        {
            //Arrange
            var projectServiceStub = new Mock<IProjectService>();
            projectServiceStub.Setup(projectService => projectService.GetProjects())
                .Returns((IEnumerable<Project>)null);
            var controller = new ProjectController(null, projectServiceStub.Object, null, null);

            //Act
            var response = controller.GetProjects();

            //Assert
            Assert.Equal(response, null);
        }

        [Fact]
        public void GetProjects_WithProjects_ReturnProjects()
        {
            //Arrange
            var projectServiceStub = new Mock<IProjectService>();
            projectServiceStub.Setup(projectService => projectService.GetProjects())
                .Returns(new List<Project>());
            var controller = new ProjectController(null, projectServiceStub.Object, null, null);

            //Act
            var response = controller.GetProjects();

            //Assert
            Assert.IsType<List<Project>>(response);
        }

        [Fact]
        public async void GetProjectsPaginated_WithNoProjectParams_ReturnBadRequest()
        {
            //Arrange
            var controller = new ProjectController(null, null, null, null);

            //Act
            var response = await controller.GetProjectsPaginated(null);

            //Assert
            Assert.IsAssignableFrom<BadRequestObjectResult>(response.Result);
        }

        [Fact]
        public async void DeleteProjects_WithNullProjectIds_ReturnBadRequest()
        {
            //Arrange
            var controller = new ProjectController(null, null, null, null);

            //Act
            var response = await controller.DeleteProjects(null);

            //Assert
            Assert.IsAssignableFrom<BadRequestObjectResult>(response);
        }
        
        [Fact]
        public async void DeleteProjects_WithNoProjectIds_ReturnBadRequest()
        {
            //Arrange
            var controller = new ProjectController(null, null, null, null);
            var projectIdsToDelete = new int[] { };

            //Act
            var response = await controller.DeleteProjects(projectIdsToDelete);

            //Assert
            Assert.IsAssignableFrom<BadRequestObjectResult>(response);
        }

        [Fact]
        public async void DeleteProjects_WithProjectIds_ReturnNoContent()
        {
            //Arrange
            var projectIdsToDelete = new int[] { 0, 2, 8 };
            var projectServiceStub = new Mock<IProjectService>();
            projectServiceStub.Setup(projectService => projectService.DeleteProjects(projectIdsToDelete));
            projectServiceStub.Setup(projectService => projectService.SaveAllAsync())
                .ReturnsAsync(true);
            var controller = new ProjectController(null, projectServiceStub.Object, null, null);

            //Act
            var response = await controller.DeleteProjects(projectIdsToDelete);

            //Assert
            Assert.IsAssignableFrom<NoContentResult>(response);
        }
    }
}