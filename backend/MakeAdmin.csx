using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using GiftDelivery.Api.Core.Entities;
using GiftDelivery.Api.Infrastructure.Data;

var dbContextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseNpgsql("Host=localhost;Port=5489;Database=GiftDeliveryDb;Username=postgres;Password=postgres")
    .Options;

using var context = new ApplicationDbContext(dbContextOptions);

var user = context.Users.FirstOrDefault(u => u.Email == "srimon265@gmail.com");
if (user != null)
{
    var role = context.Roles.FirstOrDefault(r => r.Name == "SuperAdmin") ?? context.Roles.FirstOrDefault(r => r.Name == "Admin");
    if (role != null)
    {
        var userRole = new IdentityUserRole<Guid> { UserId = user.Id, RoleId = role.Id };
        if (!context.UserRoles.Any(ur => ur.UserId == user.Id && ur.RoleId == role.Id))
        {
            context.UserRoles.Add(userRole);
            context.SaveChanges();
            Console.WriteLine("Added Admin role to srimon265@gmail.com");
        }
        else 
        {
            Console.WriteLine("User is already an Admin.");
        }
    }
}
else
{
    Console.WriteLine("User not found.");
}
