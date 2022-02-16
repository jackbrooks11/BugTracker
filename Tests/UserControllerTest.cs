using Xunit;
using System.Threading.Tasks;
using Moq;
using API.Interfaces;
using API.Controllers;
using API.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Tests
{
    public class UserControllerTest
    {
        [Fact]
        public async Task GetUser_WithNullUser_ReturnNull()
        {
            //Arrange
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetUserByUsernameAsync(null))
                .ReturnsAsync((AppUser)null);
            var controller = new UserController(userServiceStub.Object);

            //Act
            var result = await controller.GetUser(null);

            //Assert
            Assert.IsAssignableFrom<NotFoundObjectResult>(result.Result);

        }

        [Fact]
        public async Task GetUser_WithNonexistingUser_ReturnNull()
        {
            //Arrange
            var username = "";
            var userServiceStub = new Mock<IUserService>();
            userServiceStub.Setup(userService => userService.GetUserByUsernameAsync(username))
                .ReturnsAsync((AppUser)null);
            var controller = new UserController(userServiceStub.Object);

            //Act
            var result = await controller.GetUser(username);

            //Assert
            Assert.IsAssignableFrom<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetUser_WithExistingUser_ReturnUser()
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

    }
}
