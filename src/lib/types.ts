export const CHALK_COLORS = ['#e8e0d4', '#d94040', '#e06080', '#e89040'] as const
export type ChalkColor = (typeof CHALK_COLORS)[number]
export type Tool = 'chalk' | 'eraser'
export type BoardMode = 'black' | 'white'
