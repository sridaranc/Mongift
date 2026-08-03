using GiftDelivery.Api.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public AdminController(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    // ─── User Management ─────────────────────────────────────────────────────────

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var userList = new List<object>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userList.Add(new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                user.FullAddress,
                user.JobTitle,
                user.CompanyName,
                user.Industry,
                user.IsActive,
                user.CreatedAt,
                Roles = roles
            });
        }
        return Ok(userList);
    }

    [HttpPost("users/{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound();

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);

        return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully.", isActive = user.IsActive });
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        if (await _userManager.FindByEmailAsync(req.Email) != null)
            return BadRequest(new { message = "User already exists." });

        var user = new ApplicationUser
        {
            UserName = req.Email,
            Email = req.Email,
            FirstName = req.FirstName,
            LastName = req.LastName,
            PhoneNumber = req.PhoneNumber,
            FullAddress = req.FullAddress ?? "",
            Pincode = req.Pincode ?? "",
            JobTitle = req.JobTitle ?? "",
            CompanyName = req.CompanyName ?? "",
            EmailConfirmed = true,
            IsActive = true
        };

        if (string.IsNullOrWhiteSpace(user.PhoneNumber))
            return BadRequest(new { message = "Mobile number is required." });


        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded) return BadRequest(new { message = "Failed to create user.", errors = result.Errors });

        if (!string.IsNullOrEmpty(req.Role) && await _roleManager.RoleExistsAsync(req.Role))
        {
            await _userManager.AddToRoleAsync(user, req.Role);
        }

        return Ok(new { message = "User created successfully." });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound();

        await _userManager.DeleteAsync(user);
        return Ok(new { message = "User deleted successfully." });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest req)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound(new { message = "User not found." });

        user.FirstName = req.FirstName ?? user.FirstName;
        user.LastName = req.LastName ?? user.LastName;
        user.PhoneNumber = req.PhoneNumber ?? user.PhoneNumber;
        user.FullAddress = req.FullAddress ?? user.FullAddress;
        user.Pincode = req.Pincode ?? user.Pincode;
        user.JobTitle = req.JobTitle ?? user.JobTitle;
        user.CompanyName = req.CompanyName ?? user.CompanyName;

        await _userManager.UpdateAsync(user);

        // Update role if changed
        if (!string.IsNullOrEmpty(req.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (await _roleManager.RoleExistsAsync(req.Role))
                await _userManager.AddToRoleAsync(user, req.Role);
        }

        return Ok(new { message = "User updated successfully." });
    }

    // ─── Role Management ─────────────────────────────────────────────────────────

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _roleManager.Roles.Select(r => new { r.Id, r.Name, r.Permissions }).ToListAsync();
        return Ok(roles);
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest("Role name is required.");
        
        if (await _roleManager.RoleExistsAsync(req.Name))
            return BadRequest(new { message = $"Role '{req.Name}' already exists." });

        var role = new ApplicationRole(req.Name) { Permissions = req.Permissions ?? "[]" };
        var result = await _roleManager.CreateAsync(role);
        if (!result.Succeeded) return BadRequest(new { message = "Failed to create role.", errors = result.Errors });

        return Ok(new { message = $"Role '{req.Name}' created successfully." });
    }

    [HttpPut("roles/{id}")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] CreateRoleRequest req)
    {
        var role = await _roleManager.FindByIdAsync(id.ToString());
        if (role == null) return NotFound("Role not found");

        role.Name = req.Name;
        role.Permissions = req.Permissions ?? "[]";
        var result = await _roleManager.UpdateAsync(role);
        if (!result.Succeeded) return BadRequest(new { message = "Failed to update role.", errors = result.Errors });

        return Ok(new { message = "Role updated successfully." });
    }

    [HttpDelete("roles/{id}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var role = await _roleManager.FindByIdAsync(id.ToString());
        if (role == null) return NotFound("Role not found");

        // Prevent deleting core roles if needed, or just let it delete
        if (role.Name == "SuperAdmin") return BadRequest("Cannot delete SuperAdmin role.");

        await _roleManager.DeleteAsync(role);
        return Ok(new { message = "Role deleted successfully." });
    }

    [HttpPost("users/{id}/roles")]
    public async Task<IActionResult> AssignRole(Guid id, [FromBody] AssignRoleRequest req)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound("User not found.");

        if (!await _roleManager.RoleExistsAsync(req.RoleName))
            return BadRequest("Role does not exist.");

        await _userManager.AddToRoleAsync(user, req.RoleName);
        return Ok(new { message = $"Role '{req.RoleName}' assigned to user." });
    }

    [HttpDelete("users/{id}/roles/{roleName}")]
    public async Task<IActionResult> RemoveRole(Guid id, string roleName)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound();

        await _userManager.RemoveFromRoleAsync(user, roleName);
        return Ok(new { message = $"Role '{roleName}' removed from user." });
    }

    public record CreateRoleRequest(string Name, string? Permissions);
    public record AssignRoleRequest(string RoleName);
    public record CreateUserRequest(string FirstName, string LastName, string Email, string Password, string Role, string PhoneNumber, string? FullAddress, string? Pincode, string? JobTitle, string? CompanyName);
    public record UpdateUserRequest(string? FirstName, string? LastName, string? PhoneNumber, string? FullAddress, string? Pincode, string? JobTitle, string? CompanyName, string? Role);
}
