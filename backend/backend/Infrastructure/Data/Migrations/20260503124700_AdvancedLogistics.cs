using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiftDelivery.Api.backend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdvancedLogistics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PerformedByUserId",
                table: "InventoryTransactions",
                type: "uuid",
                nullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_PerformedByUserId",
                table: "InventoryTransactions",
                column: "PerformedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestOrders_AssignedStaffId",
                table: "GuestOrders",
                column: "AssignedStaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_GuestOrders_AspNetUsers_AssignedStaffId",
                table: "GuestOrders",
                column: "AssignedStaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_AspNetUsers_PerformedByUserId",
                table: "InventoryTransactions",
                column: "PerformedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GuestOrders_AspNetUsers_AssignedStaffId",
                table: "GuestOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTransactions_AspNetUsers_PerformedByUserId",
                table: "InventoryTransactions");

            migrationBuilder.DropIndex(
                name: "IX_InventoryTransactions_PerformedByUserId",
                table: "InventoryTransactions");

            migrationBuilder.DropIndex(
                name: "IX_GuestOrders_AssignedStaffId",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "PerformedByUserId",
                table: "InventoryTransactions");

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
    }
}
