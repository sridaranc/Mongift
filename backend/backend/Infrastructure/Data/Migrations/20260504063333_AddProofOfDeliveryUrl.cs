using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiftDelivery.Api.backend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProofOfDeliveryUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProofOfDeliveryUrl",
                table: "GuestOrders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProofOfDeliveryUrl",
                table: "GuestOrders");
        }
    }
}
