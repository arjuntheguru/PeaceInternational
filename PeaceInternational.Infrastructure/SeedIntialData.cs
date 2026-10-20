using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PeaceInternational.Infrastructure
{
    public class SeedIntialData
    {      

        // Passwords come from configuration only ("Seed:AdminPassword", "DemoData:UserPassword"):
        // appsettings.Development.json locally, the app-secret Secret in the cluster. They are used only
        // when an account is first created.
        public static async Task Initialize(
            IServiceProvider serviceProvider,
            bool seedDemoData,
            string demoUserPassword,
            string adminPassword)
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

                if (string.IsNullOrWhiteSpace(adminPassword))
                {
                    throw new InvalidOperationException("Seed:AdminPassword is not configured; it is needed to create the initial admin user.");
                }

                var res = await userManager.CreateAsync(admin, adminPassword);
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
                if (string.IsNullOrWhiteSpace(demoUserPassword))
                {
                    throw new InvalidOperationException("DemoData:UserPassword is not configured; it is needed when DemoData:Enabled is true.");
                }

                await DemoDataSeeder.SeedAsync(db, userManager, admin.Id, demoUserPassword);
            }
        }
    }
}
