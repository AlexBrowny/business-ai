export const OPEN_CHAT_EVENT = "open-chat";
export const OPEN_QUIZ_EVENT = "open-quiz";

export const openChat = () => window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
export const openQuiz = () => window.dispatchEvent(new Event(OPEN_QUIZ_EVENT));
