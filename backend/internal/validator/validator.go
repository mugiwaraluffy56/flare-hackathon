package validator

import (
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

var (
	validate          *validator.Validate
	ethereumAddrRegex = regexp.MustCompile(`^0x[0-9a-fA-F]{40}$`)
	txHashRegex       = regexp.MustCompile(`^0x[0-9a-fA-F]{64}$`)
)

// Initialize sets up the validator with custom rules
func Initialize() error {
	validate = validator.New()

	// Register custom validators
	if err := validate.RegisterValidation("eth_address", validateEthAddress); err != nil {
		return err
	}

	if err := validate.RegisterValidation("tx_hash", validateTxHash); err != nil {
		return err
	}

	if err := validate.RegisterValidation("asset_type", validateAssetType); err != nil {
		return err
	}

	if err := validate.RegisterValidation("source_chain", validateSourceChain); err != nil {
		return err
	}

	return nil
}

// Validate validates a struct
func Validate(s interface{}) error {
	if validate == nil {
		Initialize()
	}
	return validate.Struct(s)
}

// Custom validation functions

func validateEthAddress(fl validator.FieldLevel) bool {
	address := fl.Field().String()
	return ethereumAddrRegex.MatchString(address)
}

func validateTxHash(fl validator.FieldLevel) bool {
	hash := fl.Field().String()
	return txHashRegex.MatchString(hash)
}

func validateAssetType(fl validator.FieldLevel) bool {
	assetType := strings.ToUpper(fl.Field().String())
	validAssets := map[string]bool{
		"BTC":  true,
		"ETH":  true,
		"XRP":  true,
		"FLR":  true,
		"DOGE": true,
		"LTC":  true,
		"USDT": true,
		"USDC": true,
		"DAI":  true,
		"WBTC": true,
		"WETH": true,
	}
	return validAssets[assetType]
}

func validateSourceChain(fl validator.FieldLevel) bool {
	chain := strings.ToLower(fl.Field().String())
	validChains := map[string]bool{
		"bitcoin":  true,
		"ethereum": true,
		"xrp":      true,
		"dogecoin": true,
		"litecoin": true,
		"flare":    true,
	}
	return validChains[chain]
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// FormatValidationErrors formats validator errors into a readable format
func FormatValidationErrors(err error) []ValidationError {
	var errors []ValidationError

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			errors = append(errors, ValidationError{
				Field:   e.Field(),
				Message: formatErrorMessage(e),
			})
		}
	}

	return errors
}

func formatErrorMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "This field is required"
	case "eth_address":
		return "Invalid Ethereum address format"
	case "tx_hash":
		return "Invalid transaction hash format"
	case "asset_type":
		return "Invalid asset type. Supported: BTC, ETH, XRP, FLR, DOGE, LTC, USDT, USDC, DAI, WBTC, WETH"
	case "source_chain":
		return "Invalid source chain. Supported: bitcoin, ethereum, xrp, dogecoin, litecoin, flare"
	case "min":
		return "Value is too small"
	case "max":
		return "Value is too large"
	case "gt":
		return "Value must be greater than " + e.Param()
	case "gte":
		return "Value must be greater than or equal to " + e.Param()
	default:
		return "Validation failed for " + e.Tag()
	}
}
