
package controllers

import (
    "net/http"

    "cafinity/config"
    "cafinity/models"

    "github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {

    userID := c.GetUint("user_id")

    var user models.User

    if err := config.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "User not found",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "user": gin.H{
            "id": user.ID,
            "name": user.Name,
            "email": user.Email,
            "role": user.Role,
        },
    })
}
