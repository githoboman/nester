package handler

import (
	"net/http"

	"github.com/Suncrest-Labs/nester/internal/config"
	"github.com/Suncrest-Labs/nester/pkg/response"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(cfg *config.Config, health *HealthHandler) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   cfg.CORSMethods,
		AllowedHeaders:   cfg.CORSHeaders,
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.NotFound(func(w http.ResponseWriter, _ *http.Request) {
		response.Error(w, http.StatusNotFound, "not found")
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/healthz", health.Healthz)
		r.Get("/readyz", health.Readyz)
	})

	return r
}
