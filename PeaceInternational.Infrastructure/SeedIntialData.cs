using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PeaceInternational.Infrastructure
{
    public class SeedIntialData
    {      

        public static async Task Initialize(
            IServiceProvider serviceProvider,
            bool seedDemoData = false,
            string demoUserPassword = "Demo@123")
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var db = serviceProvider.GetRequiredService<ApplicationDbContext>();


            string[] Roles = { "ADMIN", "USER" };

            foreach (string roleName in Roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            var admin = await userManager.FindByNameAsync("admin");
            if (admin == null)
            {
                admin = new IdentityUser()
                {
                    UserName = "admin",
                    Email = "admin@admin.com",
                    PhoneNumber = "4413262"                  
                };

                var res = await userManager.CreateAsync(admin, "Admin@123");
                if (!res.Succeeded)
                {
                    var errors = string.Join("; ", res.Errors.Select(error => error.Description));
                    throw new InvalidOperationException($"Unable to create the initial admin user: {errors}");
                }

                await userManager.SetLockoutEnabledAsync(admin, false);
            }

            if (!await userManager.IsInRoleAsync(admin, "ADMIN"))
            {
                var roleResult = await userManager.AddToRoleAsync(admin, "ADMIN");
                if (!roleResult.Succeeded)
                {
                    var errors = string.Join("; ", roleResult.Errors.Select(error => error.Description));
                    throw new InvalidOperationException($"Unable to assign the ADMIN role: {errors}");
                }
            }

            if (seedDemoData)
            {
                await DemoDataSeeder.SeedAsync(db, userManager, admin.Id, demoUserPassword);
            }
        }
    }
}
