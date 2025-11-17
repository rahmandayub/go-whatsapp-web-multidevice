package send

type PresenceRequest struct {
	BaseRequest
	Type string `json:"type" form:"type"`
}
