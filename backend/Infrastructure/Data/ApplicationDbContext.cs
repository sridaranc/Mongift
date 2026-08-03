using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using GiftDelivery.Api.Core.Entities;

namespace GiftDelivery.Api.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<DeliverySlot> DeliverySlots { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<OrderHistory> OrderHistories { get; set; }
    public DbSet<GuestOrder> GuestOrders { get; set; }
    public DbSet<GuestOrderItem> GuestOrderItems { get; set; }
    public DbSet<GuestOrderHistory> GuestOrderHistories { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<PromoCode> PromoCodes { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Order>()
            .HasOne(o => o.Payment)
            .WithOne(p => p.Order)
            .HasForeignKey<Payment>(p => p.OrderId);

        builder.Entity<Order>()
            .HasOne(o => o.AssignedDeliveryPerson)
            .WithMany()
            .HasForeignKey(o => o.AssignedDeliveryPersonId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<GuestOrderItem>()
            .HasOne(i => i.GuestOrder)
            .WithMany(o => o.Items)
            .HasForeignKey(i => i.GuestOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<GuestOrderHistory>()
            .HasOne(h => h.GuestOrder)
            .WithMany()
            .HasForeignKey(h => h.GuestOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<GuestOrderHistory>()
            .HasOne(h => h.ChangedBy)
            .WithMany()
            .HasForeignKey(h => h.ChangedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<GuestOrder>()
            .Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<GuestOrderItem>()
            .Property(i => i.UnitPrice)
            .HasColumnType("decimal(18,2)");

        builder.Entity<GuestOrderItem>()
            .Property(i => i.Subtotal)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasColumnType("decimal(18,2)");
            
        builder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasColumnType("decimal(18,2)");

        builder.Entity<PromoCode>()
            .Property(p => p.DiscountPercentage)
            .HasColumnType("decimal(18,2)");

        builder.Entity<PromoCode>()
            .Property(p => p.MaxDiscountAmount)
            .HasColumnType("decimal(18,2)");
    }
}
