using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PeaceInternational.Core.Entity;
using PeaceInternational.Core.IRepository;
using PeaceInternational.Web.Models;

namespace PeaceInternational.Web.Controllers
{
    [Authorize]
    public class TransportController : Controller
    {
        private readonly ICrudService<Transport> _transportCrudService;
        private readonly UserManager<IdentityUser> _userManager;

        public TransportController(
            ICrudService<Transport> transportCrudService,
            UserManager<IdentityUser> userManager)
        {
            _transportCrudService = transportCrudService;
            _userManager = userManager;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        //GET Transport
        [HttpGet]
        public async Task<IActionResult> Get(int? id)
        {
            try
            {
                if (id == null)
                {
                    var result = await _transportCrudService.GetAllAsync();
                    return Json(result);
                }
                else
                {
                    var result = _transportCrudService.Get(id);
                    return Json(result);
                }
            }
            catch
            {
                throw;
            }
        }
        //Save Transport
        [HttpPost]
        public async Task<IActionResult> Save(Transport transport)
        {
            try
            {
                var user = _userManager.GetUserAsync(HttpContext.User).Result;
                var notification = new Notification();

                if (transport.Id > 0)
                {

                    notification = await EditTransport(transport, user);
                }
                else
                {
                    await _transportCrudService.InsertAsync(new Transport
                    {
                        Name = transport.Name,
                        MinPAX = transport.MinPAX,
                        MaxPAX = transport.MaxPAX,
                        CreatedBy = user.Id
                    });

                    notification.Type = "success";
                    notification.Message = "Transport created successfully.";
                }

                return Json(notification);
            }
            catch
            {
                return Json(new Notification("error", "Transport creation failed."));
            }
        }

        [HttpPost]
        public IActionResult Delete(int id)
        {
            try
            {
                var notification = new Notification();
                notification = DeleteTransport(id);

                return Json(notification);
            }
            catch
            {
                return Json(new Notification("error", "Transport deletion failed."));
            }
        }

        private async Task<Notification> EditTransport(Transport transport, IdentityUser user)
        {
            try
            {
                var record = await _transportCrudService.GetAsync(transport.Id);

                record.Name = transport.Name;
                record.MinPAX = transport.MinPAX;
                record.MaxPAX = transport.MaxPAX;              
                record.ModifiedBy = user.Id;
                record.ModifiedDate = DateTime.Now;

                _transportCrudService.Update(record);

                return new Notification("success", "Transport updated successfully.");
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return new Notification("error", "Transport update failed.");
            }
        }

        private Notification DeleteTransport(int id)
        {
            try
            {
                var record = _transportCrudService.Get(id);
                _transportCrudService.Delete(record);

                return new Notification("success", "Transport deleted successfully.");
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return new Notification("error", "Failed to delete transport.");
            }
        }
    }
}