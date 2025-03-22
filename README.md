# Hitster Online

Online version of Hitster.

## Install

Set up your project using your preferred package manager. Use the corresponding command to install the dependencies:

| Package Manager                                               | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |
| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |
| [pnpm](https://pnpm.io/installation)                          | `pnpm install` |
| [bun](https://bun.sh/#getting-started)                        | `bun install`  |

Set up app in spotify (see [Getting started](https://developer.spotify.com/documentation/web-api/tutorials/getting-started)). Set Redirect URI to where the app will run /login (example: http://localhost:3000/login)

Add a .env file and fill in variables (see .env.example)

## Usage

This section covers how to start the development server and build your project for production.

### Starting the Development Server

To start the development server with hot-reload, run the following command. The server will be accessible at [http://localhost:3000](http://localhost:3000)

```bash
yarn dev
```

(Repeat for npm, pnpm, and bun with respective commands.)


If the music doesn't start playing once the sound-card appears, make sure you have an open Spotify application (either in browser or as app) and try playing a random song there. Then click "next" on the right of the sound-card and hopefully a new song starts playing. (This is an issue with the Spotify API having to find a device to play the music on, so one must first make sure that there is a device (specifically an active device) running)


### Building for Production

To build your project for production, use:

```bash
yarn build
```

(Repeat for npm, pnpm, and bun with respective commands.)

Once the build process is completed, your application will be ready for deployment in a production environment.
