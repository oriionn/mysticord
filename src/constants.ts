export enum Messages {
    ALREADY_REGISTERED = ":x: | You are already registered for the random meet.",
    NOT_REGISTERED = ":x: | You are not registered for the random meet.",
    REGISTERED = ":white_check_mark: | You are successfully registered for the random meet.",
    UNREGISTERED = ":white_check_mark: | You are successfully unregistered for the random meet.",
    CONFIRM_REGISTER = "⚠️ | **You have a chat session in progress.**\n❓ | Are you sure you want to unregister ?",
    REROLL_CONFIRM = "❓ | Are you sure you want to reroll?",
    NO_USER_AVAILABLE = ":x: | No user available for random meet",
    NO_CHAT_SESSIONS = ":x: | You don't have any chat sessions open. You can find someone using `/roll`.",

    USER_ROLL = ":white_check_mark: | You've just found someone at random! **Every message you send to the bot will now be transcribed for it.**",
    OTHER_USER_ROLL = "🎲 | **Hello! Someone's found you at random, let's talk!**",
    OTHER_USER_ROLL_WARNING = "⚠️ | **Every message you send to the bot will now be transcribed for it.**",
    ROLL_ERROR = ":x: | An error occurred during the roll, please try again.",

    MESSAGE_TOO_LONG = ":x: | Message too long, impossible to send to your contact.",
    MESSAGE_ERROR_OCCURED = ":x: | An error has occurred while sending to your contact, please try again.",

    CHAT_SESSION_STOP = "🚫 | Your contact has stopped the chat session.",
    CHAT_SESSION_STOP_SELF = "🚫 | You have stopped the chat session.",
}
