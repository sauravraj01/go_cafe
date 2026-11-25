package models

import "gorm.io/gorm"

type Order struct {
    gorm.Model

    UserID        uint    `json:"user_id"`
    Token         string  `gorm:"unique;not null" json:"token"`
    TotalAmount   float64 `json:"total_amount"`
    Status        string  `gorm:"default:Placed" json:"status"`
    PaymentStatus string  `gorm:"default:Pending" json:"payment_status"`

    Items []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}