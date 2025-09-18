# Mysticord
This is a Discord bot that is added in dm and lets you meet people randomly.
This project was made for Summer of Making and Converge (YSWSs of HackClub).

To test the bot, go to the Discord [Mysticord](https://discord.gg/q8Ra9vWJAV).

<details>
    <summary>Click for an awesome information</summary>
    I did it mostly for blahaj :3
</details>

## Features
The project has multiple features, such as :
- Subscribe and unsubscribe from a list to get found by people
- Stop a discussion whenever you like
- Be able to change your username: by default “Anonymous”, you can change it with the command `/username <username>`. So you can use a fun nickname or reference :3
- Level system : The more you talk, the more levels you have, the more features you can use.
- Sending attachments (Only available from level 3 upwards)
- Native voice message integration (Only available from level 5 upwards)

### Commands
- `/help`: Displays the commands list
- `/perks`: Displays a list of benefits that you unlock as you progress through the level system
- `/rank`: Displays your current level
- `/register`: Registers you in the list of people people can meet
- `/reveal`: Ask the person you're talking to if they want to reveal their identity
- `/roll`: Find someone to talk to randomly
- `/stop`: Stop the discussion
- `/tictactoe`: Offer to play tic tac toe with the person you're talking to.
- `/unregister`: Remove you from the list of people people can meet.
- `/username`: Change your anonymously username

## Installation
### Prerequisites
- Bun
- A discord bot

### Installation
1. First, you need to clone the repository.
```sh
git clone https://github.com/oriionn/mysticord.git && cd mysticord
```
2. Secondly, you need to install the dependencies.
```sh
bun install
```
3. Thirdly, you need to copy the .env example and fill it in.
```sh
cp .env.example .env && nano .env
```
4. Finally, you can launch the bot
```sh
bun start
```
