export type TrackerType = "evergreen" | "seasonal";
export type RunStatus = "draft" | "reviewed" | "published";

export interface Category {
  id: number;
  name: string;
  slug: string;
  tracker_type: TrackerType;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface Run {
  id: number;
  category_id: number;
  run_date: string;
  period_label: string;
  tracker_type: TrackerType;
  status: RunStatus;
  summary: string | null;
  client_id: string | null;
  is_public: boolean;
  created_at: string;
}

export interface AgentResponse {
  id: number;
  run_id: number;
  agent_name: string;
  prompt_number: number;
  prompt_text: string;
  raw_response: string;
  created_at: string;
}

export interface BrandMention {
  id: number;
  run_id: number;
  agent_name: string;
  prompt_number: number;
  brand_name_raw: string;
  brand_name_normalized: string;
  mention_rank: number;
  is_top_3: boolean;
  is_first: boolean;
  mentioned: boolean;
  created_at: string;
}

export interface RunInsight {
  id: number;
  run_id: number;
  top_brands_summary: string | null;
  common_traits: string | null;
  cross_agent_differences: string | null;
  market_gaps: string | null;
  key_takeaway: string | null;
  audit_angle: string | null;
  reviewed_by_human: boolean;
  created_at: string;
}
