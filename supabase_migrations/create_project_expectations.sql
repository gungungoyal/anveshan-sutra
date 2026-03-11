-- Create project_expectations table for CSR users
-- This table stores project requirements that CSR users define
-- to help filter and match NGO partners

CREATE TABLE IF NOT EXISTS project_expectations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    beneficiary_range TEXT NOT NULL,
    timeline_months TEXT NOT NULL,
    geography_type TEXT NOT NULL,
    geography_spread TEXT NOT NULL,
    reporting_intensity TEXT NOT NULL,
    on_ground_presence TEXT NOT NULL,
    program_nature TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE project_expectations ENABLE ROW LEVEL SECURITY;

-- Users can only read their own expectations
CREATE POLICY "Users can view own project expectations"
    ON project_expectations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own expectations
CREATE POLICY "Users can insert own project expectations"
    ON project_expectations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own expectations
CREATE POLICY "Users can update own project expectations"
    ON project_expectations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own expectations
CREATE POLICY "Users can delete own project expectations"
    ON project_expectations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_project_expectations_user_id ON project_expectations(user_id);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_project_expectations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_expectations_updated_at
    BEFORE UPDATE ON project_expectations
    FOR EACH ROW
    EXECUTE FUNCTION update_project_expectations_updated_at();
