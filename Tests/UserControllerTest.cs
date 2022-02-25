using Xunit;
using System.Threading.Tasks;
using Moq;
using API.Interfaces;
using API.Controllers;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Tests
{
    public class UserControllerTest
    {
        [Fact]
        public async Task GetUser_WithNullUsername_ReturnNotFound()
        {
            //Arrange
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetUserByUsernameAsync(null))
                .ReturnsAsync((AppUser)null);
            var controller = new UserController(userServiceStub.Object);

            //Act
            var response = await controller.GetUser(null);

            //Assert
            Assert.IsAssignableFrom<NotFoundObjectResult>(response.Result);

        }

        [Fact]
        public async Task GetUser_WithNonexistingUsername_ReturnNotFound()
        {
            //Arrange
            var username = "";
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetUserByUsernameAsync(username))
                .ReturnsAsync((AppUser)null);
            var controller = new UserController(userServiceStub.Object);

            //Act
            var response = await controller.GetUser(username);

            //Assert
            Assert.IsAssignableFrom<NotFoundObjectResult>(response.Result);
        }

        [Fact]
        public async Task GetUser_WithExistingUsername_ReturnUser()
        {
            //Arrange
            var username = "admin";
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetUserByUsernameAsync(username))
                .ReturnsAsync(new AppUser {UserName = username});
            var controller = new UserController(userServiceStub.Object);

            //Act
            var response = await controller.GetUser(username);

            //Assert
            var result = Assert.IsAssignableFrom<OkObjectResult>(response.Result);
            Assert.IsType<AppUser>(result.Value);

        }

        [Fact]
        public async Task GetUserRoles_WithNullUsername_ReturnNull()
        {
            //Arrange
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetRoles(null))
                .ReturnsAsync((List<string>)null);
            var controller = new UserController(userServiceStub.Object);

            //Act
            var response = await controller.GetUserRoles(null);

            //Assert
            Assert.IsAssignableFrom<NotFoundObjectResult>(response.Result);
        }

        [Fact]
        public async Task GetUserRoles_WithNonexistingUsername_ReturnNull()
        {
            //Arrange
            var username = "";
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetRoles(username))
                .ReturnsAsync((List<string>)null);
            var controller = new UserController(userServiceStub.Object);

            //Act
            var response = await controller.GetUserRoles(username);

            //Assert
            Assert.IsAssignableFrom<NotFoundObjectResult>(response.Result);
        }

        [Fact]
        public async Task GetUserRoles_WithExistingUsername_ReturnRoles()
        {
            //Arrange
            var username = "admin";
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetRoles(username))
                .ReturnsAsync(new List<string> {"Admin"});
            var controller = new UserController(userServiceStub.Object);

            //Act
            var response = await controller.GetUserRoles(username);

            //Assert
            var result = Assert.IsAssignableFrom<OkObjectResult>(response.Result);
            Assert.IsType<List<string>>(result.Value);
        }
    }
}
