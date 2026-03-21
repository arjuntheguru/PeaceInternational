using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeaceInternational.Core.Entity;
using PeaceInternational.Core.IRepository;
using PeaceInternational.Models;

namespace PeaceInternational.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ICrudService<Customer> _customerService;
        private readonly ICrudService<Invoice> _invoiceService;
        private readonly ICrudService<ServiceVoucher> _serviceVoucherService;
        private readonly ICrudService<Tourcost> _tourcostService;

        public HomeController(
            ICrudService<Customer> customerService,
            ICrudService<Invoice> invoiceService,
            ICrudService<ServiceVoucher> serviceVoucherService,
            ICrudService<Tourcost> tourcostService)
        {
            _customerService = customerService;
            _invoiceService = invoiceService;
            _serviceVoucherService = serviceVoucherService;
            _tourcostService = tourcostService;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetStats()
        {
            var customers = await _customerService.GetAllAsync();
            var invoices = await _invoiceService.GetAllAsync();
            var vouchers = await _serviceVoucherService.GetAllAsync();
            var tourcosts = await _tourcostService.GetAllAsync();

            return Json(new
            {
                customers = customers.Count(),
                invoices = invoices.Count(),
                vouchers = vouchers.Count(),
                tourcosts = tourcosts.Count()
            });
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
