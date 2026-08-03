using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiftDelivery.Api.backend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedStaffToGuestOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedStaffId",
                table: "GuestOrders",
                type: "uuid",
                nullable: true);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GuestOrders_AspNetUsers_AssignedStaffId",
                table: "GuestOrders");

            migrationBuilder.DropIndex(
                name: "IX_GuestOrders_AssignedStaffId",
                table: "GuestOrders");

            migrationBuilder.DropColumn(
                name: "AssignedStaffId",
                table: "GuestOrders");
        }
    }
}
