package config

import (
	"os"
	"strings"
	"time"
)

type Config struct {
	Port            string
	ShutdownTimeout time.Duration
	CORSOrigins     []string
	CORSMethods     []string
	CORSHeaders     []string
}

func Load() *Config {
	return &Config{
		Port:            getEnvOrDefault("PORT", "8080"),
		ShutdownTimeout: parseDurationOrDefault("SHUTDOWN_TIMEOUT", 15*time.Second),
		CORSOrigins:     parseCommaSeparated("CORS_ALLOWED_ORIGINS", "*"),
		CORSMethods:     parseCommaSeparated("CORS_ALLOWED_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS"),
		CORSHeaders:     parseCommaSeparated("CORS_ALLOWED_HEADERS", "Accept,Authorization,Content-Type,X-Request-ID"),
	}
}

func getEnvOrDefault(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func parseDurationOrDefault(key string, defaultVal time.Duration) time.Duration {
	if val := os.Getenv(key); val != "" {
		if d, err := time.ParseDuration(val); err == nil {
			return d
		}
	}
	return defaultVal
}

func parseCommaSeparated(key, defaultVal string) []string {
	val := getEnvOrDefault(key, defaultVal)
	var result []string
	for _, v := range strings.Split(val, ",") {
		if trimmed := strings.TrimSpace(v); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
