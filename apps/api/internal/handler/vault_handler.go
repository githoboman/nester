package handler

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"github.com/suncrestlabs/nester/apps/api/internal/domain/vault"
	"github.com/suncrestlabs/nester/apps/api/internal/service"
	logpkg "github.com/suncrestlabs/nester/apps/api/pkg/logger"
)

const maxRequestBodyBytes int64 = 1 << 20

type VaultHandler struct {
	service *service.VaultService
}

// ── Request / Response types ─────────────────────────────────────────────────

type createVaultRequest struct {
	UserID          string `json:"user_id"`
	ContractAddress string `json:"contract_address"`
	Currency        string `json:"currency"`
	Status          string `json:"status,omitempty"`
}

type updateVaultRequest struct {
	ContractAddress string `json:"contract_address,omitempty"`
	Status          string `json:"status,omitempty"`
}

type recordDepositRequest struct {
	Amount string `json:"amount"`
	TxHash string `json:"tx_hash,omitempty"`
}

type recordWithdrawalRequest struct {
	Amount string `json:"amount"`
	TxHash string `json:"tx_hash,omitempty"`
}

type allocationRequest struct {
	ID       string `json:"id,omitempty"`
	Protocol string `json:"protocol"`
	Amount   string `json:"amount"`
	APY      string `json:"apy"`
}

type updateAllocationsRequest struct {
	Allocations []allocationRequest `json:"allocations"`
}

type errorResponse struct {
	Error string `json:"error"`
}

// ── Constructor / registration ───────────────────────────────────────────────

func NewVaultHandler(service *service.VaultService) *VaultHandler {
	return &VaultHandler{service: service}
}

func (h *VaultHandler) Register(mux *http.ServeMux) {
	// Original endpoints
	mux.HandleFunc("POST /api/v1/vaults", h.createVault)
	mux.HandleFunc("GET /api/v1/vaults/{id}", h.getVault)
	mux.HandleFunc("GET /api/v1/vaults/{id}/allocations", h.getAllocations)
	mux.HandleFunc("GET /api/v1/users/{userId}/vaults", h.listUserVaults)

	// Newly wired endpoints (service methods already existed)
	mux.HandleFunc("POST /api/v1/vaults/{id}/deposits", h.recordDeposit)
	mux.HandleFunc("PUT /api/v1/vaults/{id}/allocations", h.updateAllocations)

	// New endpoints (service + handler)
	mux.HandleFunc("PUT /api/v1/vaults/{id}", h.updateVault)
	mux.HandleFunc("POST /api/v1/vaults/{id}/close", h.closeVault)
	mux.HandleFunc("POST /api/v1/vaults/{id}/pause", h.pauseVault)
	mux.HandleFunc("POST /api/v1/vaults/{id}/unpause", h.unpauseVault)
	mux.HandleFunc("POST /api/v1/vaults/{id}/withdrawals", h.recordWithdrawal)
	mux.HandleFunc("GET /api/v1/vaults/{id}/deposits", h.listDeposits)
	mux.HandleFunc("DELETE /api/v1/vaults/{id}", h.deleteVault)
}

// ── Original handlers ────────────────────────────────────────────────────────

func (h *VaultHandler) createVault(w http.ResponseWriter, r *http.Request) {
	var request createVaultRequest
	if err := decodeJSON(r, &request); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, err := uuid.Parse(request.UserID)
	if err != nil {
		writeError(w, http.StatusBadRequest, "user_id must be a valid UUID")
		return
	}

	if err := validateCurrencyCode(request.Currency); err != nil {
		writeError(w, http.StatusBadRequest, "invalid currency: "+err.Error())
		return
	}

	model, err := h.service.CreateVault(r.Context(), service.CreateVaultInput{
		UserID:          userID,
		ContractAddress: request.ContractAddress,
		Currency:        request.Currency,
		Status:          request.Status,
	})
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusCreated, model)
}

func (h *VaultHandler) getVault(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	model, err := h.service.GetVault(r.Context(), vaultID)
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

func (h *VaultHandler) listUserVaults(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(r.PathValue("userId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "user id must be a valid UUID")
		return
	}

	models, err := h.service.GetUserVaults(r.Context(), userID)
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, models)
}

func (h *VaultHandler) getAllocations(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	vault, err := h.service.GetVault(r.Context(), vaultID)
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, vault.Allocations)
}

// ── New handlers ─────────────────────────────────────────────────────────────

// POST /api/v1/vaults/{id}/deposits
func (h *VaultHandler) recordDeposit(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	var req recordDepositRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	amount, err := decimal.NewFromString(req.Amount)
	if err != nil {
		writeError(w, http.StatusBadRequest, "amount must be a valid decimal number")
		return
	}

	model, err := h.service.RecordDeposit(r.Context(), service.RecordDepositInput{
		VaultID: vaultID,
		Amount:  amount,
		TxHash:  strings.TrimSpace(req.TxHash),
	})
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

// GET /api/v1/vaults/{id}/deposits
func (h *VaultHandler) listDeposits(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	txns, err := h.service.ListDeposits(r.Context(), vaultID)
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, txns)
}

// PUT /api/v1/vaults/{id}/allocations
func (h *VaultHandler) updateAllocations(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	var req updateAllocationsRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	allocations := make([]vault.Allocation, 0, len(req.Allocations))
	for _, a := range req.Allocations {
		amount, err := decimal.NewFromString(a.Amount)
		if err != nil {
			writeError(w, http.StatusBadRequest, "allocation amount must be a valid decimal number")
			return
		}
		apy, err := decimal.NewFromString(a.APY)
		if err != nil {
			writeError(w, http.StatusBadRequest, "allocation apy must be a valid decimal number")
			return
		}

		alloc := vault.Allocation{
			Protocol: a.Protocol,
			Amount:   amount,
			APY:      apy,
		}
		if a.ID != "" {
			parsed, err := uuid.Parse(a.ID)
			if err != nil {
				writeError(w, http.StatusBadRequest, "allocation id must be a valid UUID")
				return
			}
			alloc.ID = parsed
		}
		allocations = append(allocations, alloc)
	}

	model, err := h.service.UpdateAllocations(r.Context(), service.UpdateAllocationsInput{
		VaultID:     vaultID,
		Allocations: allocations,
	})
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

// PUT /api/v1/vaults/{id}
func (h *VaultHandler) updateVault(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	var req updateVaultRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	model, err := h.service.UpdateVault(r.Context(), service.UpdateVaultInput{
		VaultID:         vaultID,
		ContractAddress: req.ContractAddress,
		Status:          req.Status,
	})
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

// POST /api/v1/vaults/{id}/close
func (h *VaultHandler) closeVault(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	// Optional ?force=true query parameter for admin force-close.
	force := r.URL.Query().Get("force") == "true"

	model, err := h.service.CloseVault(r.Context(), service.CloseVaultInput{
		VaultID: vaultID,
		Force:   force,
	})
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

// POST /api/v1/vaults/{id}/pause
func (h *VaultHandler) pauseVault(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	model, err := h.service.PauseVault(r.Context(), vaultID)
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

// POST /api/v1/vaults/{id}/unpause
func (h *VaultHandler) unpauseVault(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	model, err := h.service.UnpauseVault(r.Context(), vaultID)
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

// POST /api/v1/vaults/{id}/withdrawals
func (h *VaultHandler) recordWithdrawal(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	var req recordWithdrawalRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	amount, err := decimal.NewFromString(req.Amount)
	if err != nil {
		writeError(w, http.StatusBadRequest, "amount must be a valid decimal number")
		return
	}

	model, err := h.service.RecordWithdrawal(r.Context(), service.RecordWithdrawalInput{
		VaultID: vaultID,
		Amount:  amount,
		TxHash:  strings.TrimSpace(req.TxHash),
	})
	if err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	writeJSON(w, http.StatusOK, model)
}

// DELETE /api/v1/vaults/{id}
func (h *VaultHandler) deleteVault(w http.ResponseWriter, r *http.Request) {
	vaultID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "vault id must be a valid UUID")
		return
	}

	if err := h.service.DeleteVault(r.Context(), vaultID); err != nil {
		h.writeDomainError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ── Error mapping ─────────────────────────────────────────────────────────────

func (h *VaultHandler) writeDomainError(w http.ResponseWriter, r *http.Request, err error) {
	switch {
	case errors.Is(err, vault.ErrVaultNotFound):
		writeError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, vault.ErrUserNotFound):
		writeError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, vault.ErrInvalidVault),
		errors.Is(err, vault.ErrInvalidAmount),
		errors.Is(err, vault.ErrInvalidAllocation),
		errors.Is(err, vault.ErrInvalidTransition),
		errors.Is(err, vault.ErrVaultClosed),
		errors.Is(err, vault.ErrVaultNotActive),
		errors.Is(err, vault.ErrInsufficientBalance):
		writeError(w, http.StatusBadRequest, err.Error())
	default:
		logpkg.FromContext(r.Context()).Error("vault handler failed", "error", err.Error())
		writeError(w, http.StatusInternalServerError, "internal server error")
	}
}

// ── Shared helpers ───────────────────────────────────────────────────────────

func decodeJSON(r *http.Request, destination any) error {
	decoder := json.NewDecoder(io.LimitReader(r.Body, maxRequestBodyBytes))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}

	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return errors.New("request body must contain only one JSON object")
	}

	return nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}

// validateCurrencyCode verifies the currency code is valid (ISO 4217 or crypto token format)
func validateCurrencyCode(code string) error {
	code = strings.TrimSpace(code)
	if len(code) < 3 || len(code) > 4 {
		return errors.New("currency code must be 3-4 characters (e.g., USD, USDC)")
	}
	if !isAlpha(code) {
		return errors.New("currency code must contain only letters")
	}
	return nil
}

// isAlpha returns true if all characters in the string are alphabetic
func isAlpha(s string) bool {
	for _, ch := range s {
		if !(ch >= 'A' && ch <= 'Z') && !(ch >= 'a' && ch <= 'z') {
			return false
		}
	}
	return len(s) > 0
}