
package middleware

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {

        origin := c.GetHeader("Origin")

        if origin == "http://localhost:5500" ||
            origin == "http://127.0.0.1:5500" {

            c.Header("Access-Control-Allow-Origin", origin)
            c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        }

        if c.Request.Method == http.MethodOptions {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }

        c.Next()
    }
}
