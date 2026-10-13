import { create } from 'zustand';

// Share backend refreshes with the conversation list while a chat is open.
export const useConversationStore = create<{
  response: unknown;
  setResponse: (response: unknown) => void;
}>((set) => ({
  response: null,
  setResponse: (response) => set({ response }),
}));
