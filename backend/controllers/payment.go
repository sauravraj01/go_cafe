
package controllers

import (
	"net/http"

	"cafinity/config"
	"cafinity/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func MakePayment(c *gin.Context) {
	orderID := c.Param("id")
	userID := c.GetUint("user_id")

	var order models.Order

	err := config.DB.Where("id = ? AND user_id = ?", orderID, userID).
		First(&order).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Order not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	if order.PaymentStatus == "Paid" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payment already completed",
		})
		return
	}

	order.PaymentStatus = "Paid"

	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Payment update failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Payment successful",
		"order_token":    order.Token,
		"total_amount":   order.TotalAmount,
		"payment_status": order.PaymentStatus,
	})
}
