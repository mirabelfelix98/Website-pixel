export interface Website {
  id: string;
  name: string;
  destination_url: string;
  pixel_id: string;
  event_type: 'PageView' | 'ViewContent' | 'Lead' | 'Purchase' | 'Custom';
  tracking_mode: 'auto' | 'cta';
  cta_config: string; // JSON string
  status: 'active' | 'paused';
  views: number;
  created_at: string;
}

export interface CTAButton {
  label: string;
  url: string;
  event_type: string;
}
