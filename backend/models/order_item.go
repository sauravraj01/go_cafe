package models

import "gorm.io/gorm"

type OrderItem struct {
    gorm.Model

    OrderID    uint    `json:"order_id"`
    MenuItemID uint    `json:"menu_item_id"`
    ItemName   string  `json:"item_name"`
    Price      float64 `json:"price"`
    Quantity   int     `json:"quantity"`
    Subtotal   float64 `json:"subtotal"`
}