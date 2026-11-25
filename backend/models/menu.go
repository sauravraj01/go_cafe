
package models

import "gorm.io/gorm"

type MenuItem struct {
    gorm.Model

    ItemName    string  `gorm:"size:150;not null" json:"item_name"`
    CategoryID  uint    `json:"category_id"`
    Price       float64 `gorm:"not null" json:"price"`
    Description string  `gorm:"type:text" json:"description"`
    Available   bool    `gorm:"default:true" json:"available"`

    Category Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}
