package handler

import (
	"net/http"
	"sync/atomic"

	"github.com/Suncrest-Labs/nester/pkg/response"
)

type HealthHandler struct {
	ready atomic.Bool
}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) SetReady(ready bool) {
	h.ready.Store(ready)
}

func (h *HealthHandler) Healthz(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *HealthHandler) Readyz(w http.ResponseWriter, _ *http.Request) {
	if !h.ready.Load() {
		response.JSON(w, http.StatusServiceUnavailable, map[string]string{"status": "unavailable"})
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
