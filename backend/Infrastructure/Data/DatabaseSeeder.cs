using GiftDelivery.Api.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GiftDelivery.Api.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roles = { "Admin", "Customer", "Delivery" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new ApplicationRole(role));
            }
        }

        var admins = new[] { 
            Environment.GetEnvironmentVariable("AdminSetup__Email") ?? "admin@gift.com",
            "srimon265@gmail.com"
        };
        var adminPassword = Environment.GetEnvironmentVariable("AdminSetup__Password") ?? "AdminPassword123!";
        
        foreach (var email in admins)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FirstName = "Super",
                    LastName = "Admin",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(user, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Admin");
                    Console.WriteLine($"Admin created: {email}");
                }
                else
                {
                    Console.WriteLine($"Failed to create admin {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                // Ensure they have the Admin role and reset password to match provided credentials
                if (!await userManager.IsInRoleAsync(user, "Admin"))
                {
                    await userManager.AddToRoleAsync(user, "Admin");
                }
                
                var token = await userManager.GeneratePasswordResetTokenAsync(user);
                await userManager.ResetPasswordAsync(user, token, adminPassword);
                Console.WriteLine($"Admin password reset for: {email}");
            }
        }

        var db = serviceProvider.GetRequiredService<ApplicationDbContext>();

        // Seed Categories
        if (!db.Categories.Any())
        {
            Console.WriteLine("Seeding categories...");
            var categories = new List<Category>
            {
                new Category { Name = "Luxury Hampers", Description = "Curated gift baskets", ImageUrl = "https://picsum.photos/id/102/400/400", IsActive = true },
                new Category { Name = "Floral Arrangements", Description = "Freshly picked flowers", ImageUrl = "https://picsum.photos/id/152/400/400", IsActive = true },
                new Category { Name = "Sweet Treats", Description = "Artisanal chocolates", ImageUrl = "https://picsum.photos/id/429/400/400", IsActive = true }
            };
            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();
            Console.WriteLine("Categories seeded successfully.");
        }

        // Seed Products
        if (!db.Products.Any())
        {
            Console.WriteLine("Seeding products...");
            var categories = await db.Categories.ToListAsync();
            if (categories.Any())
            {
                var luxuryHamper = categories.FirstOrDefault(c => c.Name == "Luxury Hampers") ?? categories[0];
                var floral = categories.FirstOrDefault(c => c.Name == "Floral Arrangements") ?? categories[0];
                var sweets = categories.FirstOrDefault(c => c.Name == "Sweet Treats") ?? categories[0];

                db.Products.AddRange(new List<Product>
                {
                    new Product { 
                        Name = "Executive Gourmet Hamper", 
                        Description = "Premium selection of cheeses and wines.", 
                        Price = 129.99m, 
                        StockQuantity = 15, 
                        CategoryId = luxuryHamper.Id, 
                        ImageUrl = "https://picsum.photos/id/493/600/400", 
                        IsActive = true 
                    },
                    new Product { 
                        Name = "Midnight Velvet Roses", 
                        Description = "A dozen deep red roses.", 
                        Price = 85.00m, 
                        StockQuantity = 25, 
                        CategoryId = floral.Id, 
                        ImageUrl = "https://picsum.photos/id/629/600/400", 
                        IsActive = true 
                    },
                    new Product { 
                        Name = "Artisanal Truffle Box", 
                        Description = "Hand-crafted chocolates.", 
                        Price = 45.50m, 
                        StockQuantity = 50, 
                        CategoryId = sweets.Id, 
                        ImageUrl = "https://picsum.photos/id/425/600/400", 
                        IsActive = true 
                    }
                });
                await db.SaveChangesAsync();
                Console.WriteLine("Products seeded successfully.");
            }
        }
    }
}
