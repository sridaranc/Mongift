using Microsoft.AspNetCore.Identity;

namespace GiftDelivery.Api.Core.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public string Pincode { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;
    
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class ApplicationRole : IdentityRole<Guid>
{
    public ApplicationRole() : base() { }
    public ApplicationRole(string roleName) : base(roleName) { }
    
    // Store JSON array of permissions e.g. ["CanManageOrders", "CanManageUsers"]
    public string Permissions { get; set; } = "[]";
}
