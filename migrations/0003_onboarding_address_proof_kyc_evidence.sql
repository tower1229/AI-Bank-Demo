ALTER TABLE onboarding_applications
ADD COLUMN address_proof_provided INTEGER NOT NULL DEFAULT 0;

ALTER TABLE onboarding_applications
ADD COLUMN address_proof_capture_method TEXT;

ALTER TABLE onboarding_applications
ADD COLUMN address_proof_type TEXT;

ALTER TABLE onboarding_applications
ADD COLUMN address_proof_holder_name TEXT;

ALTER TABLE onboarding_applications
ADD COLUMN address_proof_address TEXT;

ALTER TABLE onboarding_applications
ADD COLUMN address_proof_issue_date TEXT;

ALTER TABLE onboarding_applications
ADD COLUMN kyc_evidence_provided INTEGER NOT NULL DEFAULT 0;

ALTER TABLE onboarding_applications
ADD COLUMN kyc_evidence_capture_method TEXT;
