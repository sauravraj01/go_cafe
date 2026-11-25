
package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"gorm.io/gorm"

	"cafinity/config"
	"cafinity/models"

	"github.com/gin-gonic/gin"
)

type OrderItemInput struct {
	MenuItemID uint `json:"menu_item_id" binding:"required"`
	Quantity   int  `json:"quantity" binding:"required"`
}

type CreateOrderInput struct {
	Items []OrderItemInput `json:"items" binding:"required,min=1"`
}

func generateOrderToken() (string, error) {
	bytes := make([]byte, 4)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return "CAF-" + strings.ToUpper(hex.EncodeToString(bytes)), nil
}

func CreateOrder(c *gin.Context) {
	var input CreateOrderInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid order data",
		})
		return
	}

	userID := c.GetUint("user_id")

	token, err := generateOrderToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not generate order token",
		})
		return
	}

	var order models.Order

	err = config.DB.Transaction(func(tx *gorm.DB) error {

		order = models.Order{
			UserID:        userID,
			Token:         token,
			Status:        "Placed",
			PaymentStatus: "Pending",
		}

		for _, item := range input.Items {

			if item.Quantity <= 0 {
				return fmt.Errorf("quantity must be greater than zero")
			}

			var menuItem models.MenuItem

			if err := tx.First(&menuItem, item.MenuItemID).Error; err != nil {
				return fmt.Errorf("menu item %d not found", item.MenuItemID)
			}

			if !menuItem.Available {
				return fmt.Errorf("%s is currently unavailable", menuItem.ItemName)
			}

			subtotal := menuItem.Price * float64(item.Quantity)

			order.TotalAmount += subtotal

			order.Items = append(order.Items, models.OrderItem{
				MenuItemID: menuItem.ID,
				ItemName:   menuItem.ItemName,
				Price:      menuItem.Price,
				Quantity:   item.Quantity,
				Subtotal:   subtotal,
			})
		}

		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// for i := range order.Items {
		// 	order.Items[i].OrderID = order.ID

		// 	if err := tx.Create(&order.Items[i]).Error; err != nil {
		// 		return err
		// 	}
		// }

		return nil
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Order placed successfully",
		"order":   order,
	})
}
