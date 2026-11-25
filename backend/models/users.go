
package models

import "gorm.io/gorm"

type User struct {
    gorm.Model

    Name         string `gorm:"size:100;not null" json:"name"`
    Email        string `gorm:"size:150;unique;not null" json:"email"`
    PasswordHash string `gorm:"not null" json:"-"`
    Role         string `gorm:"size:20;default:student" json:"role"`
}
