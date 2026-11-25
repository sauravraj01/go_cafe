
package routes

import (
	"net/http"

	"cafinity/controllers"
	"cafinity/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {

	api := r.Group("/api")

	// Public routes
	api.POST("/register", controllers.Register)
	api.POST("/login", controllers.Login)

	// Public menu routes
	api.GET("/menu", controllers.GetMenu)
	api.GET("/menu/:id", controllers.GetMenuItem)
	api.GET("/categories", controllers.GetCategories)

	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())

	protected.POST("/orders", controllers.CreateOrder)
	protected.POST("/orders/:id/pay", controllers.MakePayment)
	protected.GET("/orders/:id", controllers.GetOrder)
	protected.GET("/orders", controllers.GetMyOrders)
	protected.GET("/profile", controllers.GetProfile)

	// Admin-only routes
	admin := protected.Group("/admin")
	admin.Use(middleware.AdminOnly())

	admin.GET("/dashboard", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to CAFINITY Admin Dashboard!",
		})
	})

	admin.POST("/menu", controllers.AddMenuItem)
	admin.PUT("/menu/:id", controllers.UpdateMenuItem)
	admin.DELETE("/menu/:id", controllers.DeleteMenuItem)
	admin.POST("/categories", controllers.AddCategory)
	admin.GET("/orders", controllers.GetAllOrders)
	admin.GET("/menu", controllers.GetAllMenuItems)
	admin.PUT("/orders/:id/status", controllers.UpdateOrderStatus)
	admin.PUT("/categories/:id", controllers.UpdateCategory)
	admin.DELETE("/categories/:id", controllers.DeleteCategory)
}
