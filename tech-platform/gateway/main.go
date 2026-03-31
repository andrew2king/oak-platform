package main

import (
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"log"
)

func main() {
	// 加载配置
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: config file not found, using defaults")
	}

	// 设置默认配置
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.mode", "debug")

	// 创建Gin引擎
	gin.SetMode(viper.GetString("server.mode"))
	r := gin.Default()

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// API路由组
	api := r.Group("/api/v1")
	{
		// 网关管理接口
		api.GET("/routes", listRoutes)
		api.POST("/routes", createRoute)
		api.PUT("/routes/:id", updateRoute)
		api.DELETE("/routes/:id", deleteRoute)
	}

	// 启动服务
	port := viper.GetString("server.port")
	log.Printf("Gateway service starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func listRoutes(c *gin.Context) {
	c.JSON(200, gin.H{
		"code": 200,
		"data": []gin.H{},
	})
}

func createRoute(c *gin.Context) {
	c.JSON(200, gin.H{
		"code":    200,
		"message": "Route created",
	})
}

func updateRoute(c *gin.Context) {
	c.JSON(200, gin.H{
		"code":    200,
		"message": "Route updated",
	})
}

func deleteRoute(c *gin.Context) {
	c.JSON(200, gin.H{
		"code":    200,
		"message": "Route deleted",
	})
}