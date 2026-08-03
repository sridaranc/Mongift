using Microsoft.AspNetCore.Identity;

namespace GiftDelivery.Api.Infrastructure.Security;

public class BCryptPasswordHasher<TUser> : IPasswordHasher<TUser> where TUser : class
{
    public string HashPassword(TUser user, string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public PasswordVerificationResult VerifyHashedPassword(TUser user, string hashedPassword, string providedPassword)
    {
        var isValid = BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword);

        if (isValid && BCrypt.Net.BCrypt.PasswordNeedsRehash(hashedPassword, 11))
        {
            return PasswordVerificationResult.SuccessRehashNeeded;
        }

        return isValid ? PasswordVerificationResult.Success : PasswordVerificationResult.Failed;
    }
}
