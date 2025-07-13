# Mysticord
This is a Discord bot that is added in dm and lets you meet people randomly.
This project was made as part of the Summer of Making, for the Converge which consists in making a bot.

To test the bot, go to the Discord [Mysticord](https://discord.gg/q8Ra9vWJAV).

The Discord will be down when the event manager contacts me.

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
