import { RequestHandler } from "express";
import { z } from "zod";
import { Organization, SearchResult } from "@shared/api";
import { supabase } from "../lib/supabase";
import { mockOrganizations } from "../data/organizations";

const SubmitOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  type: z.enum(["NGO", "Foundation", "Incubator", "CSR", "Social Enterprise"]),
  website: z.string().url().optional().or(z.literal("")),
  headquarters: z.string().min(1, "Headquarters is required"),
  region: z.string().min(1, "Region is required"),
  focusAreas: z.array(z.string()).min(1, "At least one focus area is required"),
  mission: z.string().min(1, "Mission statement is required"),
  description: z.string().min(1, "Description is required"),
  fundingType: z.enum(["grant", "provider", "recipient", "mixed"]).default("mixed"),
  targetBeneficiaries: z.array(z.string()).default([]),
  partnerHistory: z.array(z.string()).default([]),
  projects: z.array(
    z.object({
      title: z.string(),
      year: z.number(),
      description: z.string(),
    }),
  ).default([]),
});

type SubmitOrganizationInput = z.infer<typeof SubmitOrganizationSchema>;

export const handleSubmitOrganization: RequestHandler = async (req, res) => {
  try {
    const validatedData = SubmitOrganizationSchema.parse(req.body);

    if (!supabase) {
      // Fallback to mock data if Supabase not configured
      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: validatedData.name,
        type: validatedData.type,
        website: validatedData.website || "",
        headquarters: validatedData.headquarters,
        region: validatedData.region,
        focusAreas: validatedData.focusAreas,
        mission: validatedData.mission,
        description: validatedData.description,
        verificationStatus: "verified",
        projects: validatedData.projects,
        fundingType: validatedData.fundingType,
        targetBeneficiaries: validatedData.targetBeneficiaries,
        partnerHistory: validatedData.partnerHistory,
        confidence: 85,
      };

      mockOrganizations.push(newOrg);

      const result: SearchResult = {
        ...newOrg,
        alignmentScore: 50,
      };

      return res.status(201).json(result);
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: validatedData.name,
        type: validatedData.type,
        website: validatedData.website || null,
        headquarters: validatedData.headquarters,
        region: validatedData.region,
        focusAreas: validatedData.focusAreas,
        mission: validatedData.mission,
        description: validatedData.description,
        verificationStatus: "verified",
        projects: validatedData.projects,
        fundingType: validatedData.fundingType,
        targetBeneficiaries: validatedData.targetBeneficiaries,
        partnerHistory: validatedData.partnerHistory,
        confidence: 85,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: "Failed to submit organization" });
    }

    const result: SearchResult = {
      ...data,
      alignmentScore: 50,
    };

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    console.error("Submit organization error:", error);
    res.status(500).json({ error: "Failed to submit organization" });
  }
};
