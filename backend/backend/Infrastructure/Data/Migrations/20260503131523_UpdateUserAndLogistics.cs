using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiftDelivery.Api.backend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserAndLogistics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GuestOrders_AspNetUsers_AssignedStaffId",
                table: "GuestOrders");

            migrationBuilder.DropTable(
                name: "InventoryTransactions");

            migrationBuilder.DropIndex(
                name: "IX_GuestOrders_AssignedStaffId",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "CostPrice",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MinStockLevel",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "AssignedStaffId",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "CurrentLat",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "CurrentLng",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "TrackingDeviceId",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "VehicleId",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "TrackingDeviceId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "VehicleId",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CostPrice",
                table: "Products",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "MinStockLevel",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedStaffId",
                table: "GuestOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CurrentLat",
                table: "GuestOrders",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CurrentLng",
                table: "GuestOrders",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrackingDeviceId",
                table: "GuestOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleId",
                table: "GuestOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrackingDeviceId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InventoryTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PerformedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    QuantityChange = table.Column<int>(type: "integer", nullable: false),
                    TransactionType = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_AspNetUsers_PerformedByUserId",
                        column: x => x.PerformedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GuestOrders_AssignedStaffId",
                table: "GuestOrders",
                column: "AssignedStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_PerformedByUserId",
                table: "InventoryTransactions",
                column: "PerformedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_ProductId",
                table: "InventoryTransactions",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_GuestOrders_AspNetUsers_AssignedStaffId",
                table: "GuestOrders",
                column: "AssignedStaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
