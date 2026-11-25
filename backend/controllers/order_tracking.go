
package controllers

import (
	"net/http"

	"cafinity/config"
	"cafinity/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Student views their own order
func GetOrder(c *gin.Context) {
	orderID := c.Param("id")
	userID := c.GetUint("user_id")

	var order models.Order

	err := config.DB.Preload("Items").
		Where("id = ? AND user_id = ?", orderID, userID).
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

	c.JSON(http.StatusOK, gin.H{
		"order": order,
	})
}

// Admin updates order status
func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")

	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Status is required",
		})
		return
	}

	validStatuses := map[string]bool{
		"Preparing": true,
		"Ready":     true,
		"Collected": true,
	}

	if !validStatuses[input.Status] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid order status",
		})
		return
	}

	var order models.Order

	if err := config.DB.First(&order, orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Order not found",
		})
		return
	}

	if order.PaymentStatus != "Paid" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Order must be paid before processing",
		})
		return
	}

	order.Status = input.Status

	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not update order status",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Order status updated successfully",
		"order":   order,
	})
}

func GetAllOrders(c *gin.Context) {

    var orders []models.Order

    if err := config.DB.
        Preload("Items").
        Order("created_at DESC").
        Find(&orders).Error; err != nil {

        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Unable to fetch orders",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "orders": orders,
    })
}


func GetMyOrders(c *gin.Context) {
    userID := c.GetUint("user_id")

    var orders []models.Order

    if err := config.DB.
        Where("user_id = ?", userID).
        Preload("Items").
        Order("created_at DESC").
        Find(&orders).Error; err != nil {

        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Unable to fetch your orders",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "orders": orders,
    })
}


