using System.ComponentModel.DataAnnotations;

namespace GiftDelivery.Api.Core.Entities;

public class PromoCode
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;
    
    public decimal DiscountPercentage { get; set; } // e.g., 10 for 10%
    public decimal MaxDiscountAmount { get; set; } // Max cap on discount
    
    public DateTime ValidUntil { get; set; }
    public bool IsActive { get; set; } = true;
    public int UsageLimit { get; set; } = 100;
    public int TimesUsed { get; set; } = 0;
}
