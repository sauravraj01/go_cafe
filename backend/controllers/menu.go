
package controllers

import (
	"net/http"
	"strconv"

	"cafinity/config"
	"cafinity/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Get all menu items with optional search and category filter
func GetMenu(c *gin.Context) {

	var items []models.MenuItem

	query := config.DB.Preload("Category")

	// Search by food name
	search := c.Query("search")

	if search != "" {
		query = query.Where("item_name LIKE ?", "%"+search+"%")
	}

	// Filter by category
	categoryID := c.Query("category_id")

	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	// Show available items only by default
	query = query.Where("available = ?", true)

	err := query.Find(&items).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to retrieve menu",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count": len(items),
		"items": items,
	})
}

// Get a single menu item
func GetMenuItem(c *gin.Context) {

	id := c.Param("id")

	var item models.MenuItem

	err := config.DB.Preload("Category").First(&item, id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Food item not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	c.JSON(http.StatusOK, item)
}

// Add a new food item
func AddMenuItem(c *gin.Context) {

	var item models.MenuItem

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid menu item details",
		})
		return
	}

	if item.ItemName == "" || item.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Item name and valid price are required",
		})
		return
	}

	// Check category exists
	var category models.Category

	if err := config.DB.First(&category, item.CategoryID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid category ID",
		})
		return
	}

	if err := config.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to add food item",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Food item added successfully",
		"item":    item,
	})
}

// Update an existing food item
func UpdateMenuItem(c *gin.Context) {

	id := c.Param("id")

	var item models.MenuItem

	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Food item not found",
		})
		return
	}

	var input struct {
		ItemName    string  `json:"item_name"`
		CategoryID  uint    `json:"category_id"`
		Price       float64 `json:"price"`
		Description string  `json:"description"`
		Available   bool    `json:"available"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid update details",
		})
		return
	}

	if input.ItemName == "" || input.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Item name and valid price are required",
		})
		return
	}

	var category models.Category

	if err := config.DB.First(&category, input.CategoryID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid category ID",
		})
		return
	}

	item.ItemName = input.ItemName
	item.CategoryID = input.CategoryID
	item.Price = input.Price
	item.Description = input.Description
	item.Available = input.Available

	if err := config.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to update item",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Food item updated successfully",
		"item":    item,
	})
}

// Delete a food item
func DeleteMenuItem(c *gin.Context) {

	id := c.Param("id")

	var item models.MenuItem

	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Food item not found",
		})
		return
	}

	if err := config.DB.Delete(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to delete item",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Food item deleted successfully",
	})
}

// Get all categories
func GetCategories(c *gin.Context) {

	var categories []models.Category

	if err := config.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to retrieve categories",
		})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// Add a category
func AddCategory(c *gin.Context) {

	var input struct {
		CategoryName string `json:"category_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Category name is required",
		})
		return
	}

	category := models.Category{
		CategoryName: input.CategoryName,
	}

	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to create category",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Category created successfully",
		"category": category,
	})
}

// Validate numeric ID in a request parameter
func ValidateMenuID(c *gin.Context) bool {

	_, err := strconv.ParseUint(c.Param("id"), 10, 64)

	return err == nil
}


func GetAllMenuItems(c *gin.Context) {
    var items []models.MenuItem

    if err := config.DB.Preload("Category").Find(&items).Error; err != nil {
        c.JSON(500, gin.H{"error": "Unable to fetch menu items"})
        return
    }

    c.JSON(200, gin.H{"items": items})
}



func UpdateCategory(c *gin.Context) {
    id := c.Param("id")

    var category models.Category

    if err := config.DB.First(&category, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Category not found"})
        return
    }

    var input struct {
        CategoryName string `json:"category_name"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input"})
        return
    }

    category.CategoryName = input.CategoryName

    config.DB.Save(&category)

    c.JSON(200, gin.H{
        "message": "Category updated successfully",
        "category": category,
    })
}

func DeleteCategory(c *gin.Context) {
    id := c.Param("id")

    var category models.Category

    if err := config.DB.First(&category, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Category not found"})
        return
    }

    var count int64

    if err := config.DB.Model(&models.MenuItem{}).
        Where("category_id = ?", id).
        Count(&count).Error; err != nil {

        c.JSON(500, gin.H{"error": "Unable to check category usage"})
        return
    }

    if count > 0 {
        c.JSON(400, gin.H{
            "error": "Cannot delete category. It is being used by menu items.",
        })
        return
    }

    if err := config.DB.Delete(&category).Error; err != nil {
        c.JSON(500, gin.H{"error": "Unable to delete category"})
        return
    }

    c.JSON(200, gin.H{
        "message": "Category deleted successfully",
    })
}
