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
    VOICE_MESSAGE_NOT_LEVEL = ":x: | Voice messages are only available when you are on level 5.",
    ERROR_EXECUTING_COMMAND = ":x: | There was an error while executing this command!",

    CHAT_SESSION_STOP = "🚫 | Your contact has stopped the chat session.",
    CHAT_SESSION_STOP_SELF = "🚫 | You have stopped the chat session.",

    USERNAME_CHANGED = ":white_check_mark: | Your username has been successfully replaced by `",

    CONFIRM_REVEAL = "❓ | Are you sure you want to reveal your identity?",
    REVEAL = "❓ | Your contact asked if you wanted to reveal your identity. Would you like to reveal your identity?",
    REVEAL_SENT = ":white_check_mark: | The request has been sent to your contact.",
    REVEAL_IMPOSSIBLE = ":x: | I couldn't ask him.",
    REVEAL_IMPOSSIBLE_BIS = ":x: | I wasn't able to reveal your identity.",
    REVEALED = ":white_check_mark: | The identity of your contact is `",

    ASK_TTT = "❓ | Would you like to play tic-tac-toe with your contact?",
    IMPOSSIBLE_TTT = ":x: | It was impossible to send him the tic-tac-toe.",
    ACCEPTED_TTT = ":white_check_mark: | Your contact has accepted your tic-tac-toe game!",
    ACCEPTED_TTT_BIS = ":white_check_mark: | You've accepted a game of tic-tac-toe!",
    YOUR_TURN_TTT = "It's your turn.",
    OTHER_TURN_TTT = "It's the turn of your contact.",
    NOT_YOUR_TURN_TTT = ":x: | It's not your turn!",
    WON_TTT = ":tada: | You've won against your contact!",
    LOST_TTT = ":tired_face: | You have lost to your contact!",
    EQUALITY_TTT = ":tada: | Equality !",
}
