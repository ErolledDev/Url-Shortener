export interface ShortenedURL {
  originalUrl: string;
  shortUrl: string;
  shortId: string;
  username?: string;
  password?: string;
  createdAt: number;
  totalClicks: number;
  lastClickedAt?: number;
}

export interface EditURLFormData {
  username: string;
  password: string;
  newShortId?: string;
}