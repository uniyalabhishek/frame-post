type FrameStore = Map<string, string>;

export const frameStore: FrameStore = new Map();

export const generateFrameId = () =>
  Math.random().toString(36).substring(2, 15);
