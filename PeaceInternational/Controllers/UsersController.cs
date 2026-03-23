using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PeaceInternational.Web.Models;

namespace PeaceInternational.Web.Controllers
{
    [Authorize(Roles = "ADMIN")]
    public class UsersController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;

        public UsersController(
            UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        //GET Users
        [HttpGet]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                if (id == null)
                {
                    var result = await _userManager.GetUsersInRoleAsync("USER");

                    var users = new List<object>();
                    foreach (var u in result)
                    {
                        var roles = await _userManager.GetRolesAsync(u);
                        users.Add(new { u.Id, u.UserName, u.Email, u.PhoneNumber, role = roles.FirstOrDefault() });
                    }

                    return Json(users);
                }
                else
                {
                    var result = await _userManager.FindByIdAsync(id);
                    return Json(result);
                }
            }
            catch
            {
                throw;
            }
        }

        //Update User
        [HttpPost]
        public async Task<IActionResult> Update(string id, string username, string email, string phoneNumber)
        {
            try
            {
                var notification = new Notification();
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    notification.Type = "error";
                    notification.Message = "User not found.";
                    return Json(notification);
                }

                user.UserName = username;
                user.Email = email;
                user.PhoneNumber = phoneNumber;
                await _userManager.UpdateAsync(user);

                notification.Type = "success";
                notification.Message = "User updated successfully.";
                return Json(notification);
            }
            catch
            {
                return Json(new Notification("error", "User update failed."));
            }
        }

        //Save User
        [HttpPost]
        public async Task<IActionResult> Save(CreateUserDTO newUser)
        {
            try
            {
                var notification = new Notification();

                if (!ModelState.IsValid)
                {
                    notification.Type = "error";
                    notification.Message = string.Join(" ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                    return Json(notification);
                }

                var user = new IdentityUser()
                {
                    UserName = newUser.Username,
                    Email = newUser.Email,
                    PhoneNumber = newUser.PhoneNumber
                };

                var res = await _userManager.CreateAsync(user, newUser.Password);
                await _userManager.SetLockoutEnabledAsync(user, false);
                if (res.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, newUser.Role);
                    notification.Type = "success";
                    notification.Message = "User successfully created.";
                }
                else
                {
                    notification.Type = "error";
                    notification.Message = string.Join(" ", res.Errors.Select(e => e.Description));
                }

                return Json(notification);
            }
            catch
            {
                return Json(new Notification("error", "User creation failed"));
            }
        }

        //Delete User
        [HttpPost]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var notification = new Notification();
                notification = await DeleteHotel(id);

                return Json(notification);
            }
            catch
            {
                return Json(new Notification("error", "User deletion failed."));
            }
        }

        //Change Password
        [HttpPost]
        public async Task<IActionResult> ChangePassword(ChangePasswordDTO changePassword)
        {
            try
            {
                var notification = new Notification();
                var user = await _userManager.FindByIdAsync(changePassword.UserId);

                var newPasswordHash = _userManager.PasswordHasher.HashPassword(user, changePassword.NewPassword);
                user.PasswordHash = newPasswordHash;
                var res = await _userManager.UpdateAsync(user);

                notification.Type = "success";
                notification.Message = "Password successfully changed.";

                return Json(notification);
            }
            catch
            {
                return Json(new Notification("error", "Failed to change password."));
            }
        }

        private async Task<Notification> DeleteHotel(string id)
        {
            try
            {
                var record = await _userManager.FindByIdAsync(id);
                await _userManager.DeleteAsync(record);

                return new Notification("success", "User deleted successfully.");
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return new Notification("error", "Failed to delete user.");
            }
        }

    }
}