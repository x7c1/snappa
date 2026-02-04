/**
 * Identifies a window for layout history lookup and recording
 */
export interface WindowIdentifier {
  windowId: number;
  wmClass: string;
  title: string;
}
