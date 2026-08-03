using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiftDelivery.Api.backend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GuestOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "text", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    RecipientName = table.Column<string>(type: "text", nullable: false),
                    RecipientPhone = table.Column<string>(type: "text", nullable: false),
                    DeliveryAddress = table.Column<string>(type: "text", nullable: false),
                    DeliveryCity = table.Column<string>(type: "text", nullable: false),
                    DeliveryPostalCode = table.Column<string>(type: "text", nullable: false),
                    GiftMessage = table.Column<string>(type: "text", nullable: false),
                    Occasion = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuestOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GuestOrderItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GuestOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuestOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuestOrderItems_GuestOrders_GuestOrderId",
                        column: x => x.GuestOrderId,
                        principalTable: "GuestOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GuestOrderItems_GuestOrderId",
                table: "GuestOrderItems",
                column: "GuestOrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GuestOrderItems");

            migrationBuilder.DropTable(
                name: "GuestOrders");
        }
    }
}
