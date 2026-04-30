ALTER TABLE onboarding_applications
ADD COLUMN kyc_status TEXT NOT NULL DEFAULT 'standard_review';

ALTER TABLE onboarding_applications
ADD COLUMN kyc_summary TEXT;

ALTER TABLE onboarding_applications
ADD COLUMN kyc_checks_json TEXT NOT NULL DEFAULT '[]';

ALTER TABLE onboarding_applications
ADD COLUMN review_reasons_json TEXT NOT NULL DEFAULT '[]';
