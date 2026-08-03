using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiftDelivery.Api.backend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPincodeToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Pincode",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Pincode",
                table: "AspNetUsers");
        }
    }
}
