
package main

import (
	"log"
	"os"

	"cafinity/config"
	"cafinity/models"
	"cafinity/routes"
	"cafinity/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET is missing")
	}

	err = config.ConnectDB()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}

	err = config.DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.MenuItem{},
		&models.Order{},
    	&models.OrderItem{},
	)

	if err != nil {
		log.Fatal("Migration failed:", err)
	}

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	routes.SetupRoutes(r)

	log.Println("CAFINITY server running on port 8080")

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
