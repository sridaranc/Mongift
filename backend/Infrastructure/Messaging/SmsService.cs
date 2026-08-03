using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace GiftDelivery.Api.Infrastructure.Messaging;

public interface ISmsService
{
    Task SendSmsAsync(string to, string message);
}

public class SmsService : ISmsService
{
    private readonly TwilioSettings _settings;

    public SmsService(IOptions<TwilioSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendSmsAsync(string to, string message)
    {
        if (string.IsNullOrEmpty(_settings.AccountSid))
        {
            Console.WriteLine($"[MOCK SMS] To: {to} | Message: {message}");
            return;
        }

        try
        {
            TwilioClient.Init(_settings.AccountSid, _settings.AuthToken);

            await MessageResource.CreateAsync(
                body: message,
                from: new Twilio.Types.PhoneNumber(_settings.FromNumber),
                to: new Twilio.Types.PhoneNumber(to)
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SMS ERROR] Failed to send SMS to {to}: {ex.Message}");
            throw;
        }
    }
}
