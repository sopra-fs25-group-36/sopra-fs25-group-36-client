# Stockico - Client Application

This repository contains the frontend client for Stockico, a competitive, fast-paced multiplayer game that simulates real-world stock trading. This application provides the user interface for players to register, log in, join game lobbies, participate in trading rounds, manage their portfolios, view stock charts, and compete on leaderboards. It communicates with the Stockico Backend Service to fetch game data and submit player actions.

## Introduction

*   **Project Goal:** To create an intuitive, responsive, and engaging user interface for the Stockico game, enabling players to easily navigate game features, make informed trading decisions, and enjoy a seamless multiplayer experience.
*   **Motivation:** To provide a visually appealing and user-friendly platform that complements the backend's functionality, making the Stockico game accessible and enjoyable. The interface aims to clearly present complex stock information and game state, allowing players to focus on strategy and competition.

## Technologies Used

*   **Next.js (with App Router):** React framework for building the user interface, handling routing, and enabling server-side rendering or static site generation capabilities.
*   **React:** JavaScript library for building component-based UIs.
*   **TypeScript:** Superset of JavaScript for static typing, improving code quality and maintainability.
*   **Tailwind CSS (Assumed, or specify):** Utility-first CSS framework for styling. (Please confirm or replace if you used something else like Styled Components, CSS Modules, etc.)
*   **Custom Hooks:** For reusable stateful logic (e.g., `useApi`, `useAuth`).
*   **Plotly.js (Implied by `plotly.js-dist.d.ts`):** For rendering charts and data visualizations.
*   **Deno / Node.js:** JavaScript runtimes for development and building.
*   **Nix & direnv:** For managing development environments and dependencies (as per your setup script).
*   **Axios (Likely, or Fetch API via `useApi`):** For making HTTP requests to the backend.

## High-level Components

The Stockico client application is built with Next.js and React, organized around the following key architectural components:

1.  **Routing & Page Structure (`app/` directory):**
    *   **Role:** Defines the different views (pages) of the application using the Next.js App Router. Each folder within `app/` typically corresponds to a URL segment, and `page.tsx` files within these folders render the content for that route.
    *   **Correlation:** Pages compose various UI Components and utilize Custom Hooks or Services to fetch data and manage state.
    *   **Main Files/Folders:**
        *   [`app/(auth)/login/page.tsx`](app/(auth)/login/page.tsx) & [`app/(auth)/register/page.tsx`](app/(auth)/register/page.tsx): Handles user authentication.
        *   [`app/lobby/[id]/page.tsx`](app/lobby/[id]/page.tsx): Displays the game lobby where players gather before a game starts.
        *   [`app/game/page.tsx`](app/game/page.tsx): The main game interface where trading occurs. (Or if it's dynamic, like `app/game/[gameId]/page.tsx`)
        *   [`app/game/transaction/symbol/[symbol]/page.tsx`](app/game/transaction/symbol/[symbol]/page.tsx): Page for viewing details and transacting a specific stock.
        *   [`app/leader_board/page.tsx`](app/leader_board/page.tsx): Shows the game or global leaderboard.

2.  **Reusable UI Components (`components/` directory):**
    *   **Role:** Encapsulate specific parts of the user interface, promoting reusability and modularity. These range from simple elements like buttons to more complex ones like charts or portfolio displays.
    *   **Correlation:** Assembled within Pages or other Components to build the complete user interface. They receive data via props and may use local state or context.
    *   **Main Files:**
        *   [`components/BarChart.tsx`](components/BarChart.tsx) & [`components/PieChart.tsx`](components/PieChart.tsx): For data visualization.
        *   [`components/Portfolio.tsx`](components/Portfolio.tsx): Displays the user's current stock holdings and cash.
        *   [`components/StockChart.tsx`](components/StockChart.tsx): Renders detailed charts for individual stocks.
        *   [`components/TransactionList.tsx`](components/TransactionList.tsx): Lists recent transactions.

3.  **API Communication & State Management (Custom Hooks & Services):**
    *   **Role:** Manages interaction with the backend API and handles application-wide or feature-specific state. Custom Hooks abstract complex logic and make it reusable across components.
    *   **Correlation:**
        *   `apiService.ts`: Centralizes logic for making HTTP requests to the backend.
        *   Custom Hooks (`hooks/`): Provide reactive state and functions to components. For example, `useApi.ts` likely wraps `apiService.ts` to provide data fetching capabilities, `useAuth.ts` manages authentication state, and `usePlayerState.ts` tracks the current player's game status.
    *   **Main Files:**
        *   [`api/apiService.ts`](api/apiService.ts): Core service for backend communication.
        *   [`hooks/useApi.ts`](hooks/useApi.ts): Hook for making API calls and managing loading/error states.
        *   [`hooks/useAuth.ts`](hooks/useAuth.ts): Manages user authentication status, login, and logout logic.
        *   [`hooks/usePlayerState.ts`](hooks/usePlayerState.ts): Manages and provides access to the current player's game-related data.

4.  **Type Definitions (`types/` directory):**
    *   **Role:** Defines TypeScript interfaces and types for data structures used throughout the application, ensuring type safety and improving developer understanding of data contracts (e.g., API responses, component props).
    *   **Correlation:** Used by all other components (Pages, UI Components, Hooks, Services) to define the shape of data.
    *   **Main Files:**
        *   [`types/user.ts`](types/user.ts), [`types/stock.ts`](types/stock.ts), [`types/game.ts`](types/game.ts) (assuming `lobby.ts`, `player.ts` contribute to a broader `game.ts` concept or similar).

## Launch & Deployment

These instructions will get you a copy of the Stockico client application up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Git:** For cloning the repository.
*   **WSL (for Windows users):** Windows Subsystem for Linux is highly recommended for a smoother development experience. If you are on Windows, follow the setup in the "Windows" section below first.
*   **Nix & direnv:** The project uses Nix for managing the development environment. The provided `setup.sh` script will attempt to install these for you.
*   **Stockico Backend Service:** The client application **requires the Stockico Backend Service to be running** and accessible (typically on `http://localhost:8080` or as configured) for full functionality.

### Windows Specific Setup (Run this first if you are on Windows)

If you are using Windows, you first need to install WSL (Windows-Subsystem-Linux). You might need to reboot your computer for the installation, therefore, save and close all your other work and programs.

1.  Download the following [powershell script](./windows.ps1)
    *(You might need to host this `windows.ps1` script in your repository or link to it from the original SoPra template if it's provided there).*
    <!-- ![downloadWindowsScript](https://github.com/user-attachments/assets/1ed16c0d-ed8a-42d5-a5d7-7bab1ac277ab) -->
    *(If you have the image, uncomment the line above. Otherwise, ensure `windows.ps1` is in your repo).*

2.  Open a new PowerShell terminal **with admin privileges**. Navigate to the directory where you downloaded `windows.ps1` and run:
    ```shell
    C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File .\windows.ps1
    ```
    Follow the on-screen instructions.

3.  If you experience any issues, try re-running the script. If problems persist, consult the SoPra OLAT forum or general WSL installation guides.

4.  After successful installation, open WSL/Ubuntu. You will be prompted to create a username and password for your Linux environment.

### Installation (macOS, Linux, and WSL after Windows Setup)

1.  **Open a new terminal** (macOS, Linux, or WSL/Ubuntu terminal). Ensure Git is installed:
    ```shell
    git --version
    ```
    If not installed, use your system's package manager (e.g., `brew install git` on macOS, `sudo apt-get install git` on Debian/Ubuntu).

2.  **Clone the repository:**
    ```shell
    git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_CLIENT_REPOSITORY_NAME.git
    cd YOUR_CLIENT_REPOSITORY_NAME
    ```

3.  **Run the setup script:**
    This script installs Nix, direnv, and project dependencies defined in `flake.nix`.
    ```shell
    source setup.sh
    ```
    This process may take several minutes. Please be patient. If it prompts you, allow `direnv` to load the environment.

4.  **Allow direnv (if needed):**
    If the setup script doesn't automatically do it, or if you open a new terminal in the project directory later, you might need to explicitly allow direnv:
    ```shell
    direnv allow
    ```
    This loads the development environment specified in `.envrc` and `flake.nix`.

### Troubleshooting the Installation

If the `setup.sh` script fails, refer to the detailed troubleshooting steps in the original SoPra template client README, which involve manually installing curl, Determinate Nix, and direnv. These steps are summarized [here in your original README](#troubleshooting-the-installation) (link to your existing section if it's kept separate, or integrate them).

### Running the Development Server

Once the installation is successful and `direnv` has loaded the environment:
1.  **Start the development server:**
    ```bash
    deno task dev
    ```
    Alternatively, if you prefer using npm scripts and they are configured in `package.json`:
    ```bash
    npm run dev
    ```
    This will start the Next.js development server, typically on [http://localhost:3000](http://localhost:3000). The application will automatically reload in your browser when you make changes to the code.

### Building for Production

To create an optimized production build of the application:
```bash
deno task build
# OR
npm run build
```
The output will usually be in the .next directory.

### Running the Production Build Locally

To serve the production build locally (after running `deno task build`):
```bash
deno task start
# OR
npm run start
```
This will typically serve the application on http://localhost:3000.

## Running the tests

### Linting and Formatting (Coding Style Tests)

*   **What these tests test and why:**
    These tools (like ESLint for linting and Prettier for formatting, often invoked via Deno tasks or npm scripts) check the codebase for syntactical errors, adherence to coding style guidelines, and potential bugs. This ensures code quality, readability, and consistency across the team.
*   **Commands:**
    *   To check for linting errors:
        ```bash
        deno task lint
        ```
        or, if using npm scripts:
        ```bash
        npm run lint
        ```
    *   To automatically format the entire codebase:
        ```bash
        deno task fmt
        ```
        or, if using npm scripts:
        ```bash
        npm run fmt
        ```
    It is highly recommended to run the formatter (e.g., `deno task fmt`) before committing any changes.

## Deployment (Vercel)

We deploy the Stockico client application using [Vercel](https://vercel.com), the platform created by the team behind Next.js. Vercel offers seamless integration with Next.js projects and automates the build and deployment process.

### Initial Setup (One-time)

1.  **Sign up/Log in to Vercel:** Create an account on Vercel or log in with your existing GitHub account.
2.  **Import Project:**
    *   From your Vercel dashboard, click "Add New..." > "Project".
    *   Select "Continue with GitHub" and authorize Vercel to access your repositories.
    *   Choose this client application's GitHub repository (e.g., `sopra-fs24-group-36-client`) and import it.
3.  **Configure Project Settings (if needed):**
    *   Vercel usually auto-detects Next.js projects and configures them correctly.
    *   **Framework Preset:** Should be "Next.js".
    *   **Build Command:** Vercel typically uses `next build` (or your `package.json` build script). If you use Deno tasks primarily, you might need to ensure your `package.json` has an equivalent `build` script (e.g., `"build": "deno task build"`), or configure the build command in Vercel.
    *   **Output Directory:** Should be `.next`.
    *   **Environment Variables:** This is crucial. You **must** configure the `NEXT_PUBLIC_API_URL` environment variable in your Vercel project settings. This variable should point to the **live URL of your deployed Stockico Backend Service**.
        *   Go to your project settings on Vercel > "Environment Variables".
        *   Add `NEXT_PUBLIC_API_URL` and set its value to your backend's production URL (e.g., `https://your-backend-service.onrender.com/api` or similar).

### Automatic Deployments

Once set up, Vercel provides automatic deployments:

*   **Production Deployments:** Every push to your `main` branch (or your designated production branch) will automatically trigger a new build and deploy it to your production URL on Vercel.
*   **Preview Deployments:** Every push to other branches or new Pull Requests will generate a unique preview URL. This allows you to test changes in a production-like environment before merging them into `main`.

You can monitor your deployments and access logs from your Vercel project dashboard.

### Releases & Promoting Deployments

While Vercel automates deployments from your Git branches, you can manage "releases" conceptually using Git tags and by promoting specific Vercel deployments.

1.  **Tagging in Git:** When you're ready for a release (e.g., after thoroughly testing a preview deployment):
    *   Ensure the `main` branch (or your release branch) is stable.
    *   Create an annotated Git tag following Semantic Versioning:
        ```bash
        git tag -a v1.0.0-client -m "Client Release v1.0.0: Initial UI for login, lobby, and basic trading."
        ```
        (Using a `-client` suffix can help distinguish client tags if your backend also has version tags in the same numerical sequence).
    *   Push the tag to your GitHub repository:
        ```bash
        git push origin v1.0.0-client
        ```
2.  **Vercel Deployments:**
    *   The push to `main` (if your tag is on `main`) would have already triggered a production deployment.
    *   You can view all deployments in your Vercel dashboard. Each deployment is associated with a Git commit.
    *   If needed, you can manually **promote** a specific past deployment (e.g., one corresponding to a Git tag commit) to be the current production deployment, or roll back to a previous one.
3.  **GitHub Releases (Optional but Recommended):**
    *   After pushing your Git tag, you can create a corresponding [Release on GitHub](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).
    *   Associate this GitHub Release with the Git tag you just created.
    *   Write release notes summarizing the changes, new features, and bug fixes in this version. This provides a good historical record.

## Illustrations: Main User Flows

1.  **Authentication (Login/Registration):**
    *   Users are presented with a login form. New users can navigate to a registration form to create an account.
    *   ![](public/imgs/Screenshot%202025-05-23%20210844.png) 
    *   Upon successful login/registration, users are redirected to the main application area (e.g., lobby or dashboard).
    *   ![](public/imgs/Screenshot%202025-05-23%20210855.png) 

2.  **Game Lobby Interaction:**
    *   After login, users can view available game lobbies or create a new one.
    *   ![](public/imgs/Screenshot%202025-05-23%20210941.png)
    *   They can join an existing lobby, see other players, and ready up for the game to start.
    *   ![](public/imgs/Screenshot%202025-05-23%20210956.png) 

3.  **In-Game Trading:**
    *   Once a game starts, users see their portfolio (cash, owned stocks), available stocks with current prices, and charts.
    *   ![](public/imgs/Screenshot%202025-05-23%20211041.png)
    *   They can select a stock to view more details (e.g., historical chart, company info).
    *   ![](public/imgs/Screenshot%202025-05-23%20213015.png) 
    *   Users can place buy or sell orders for stocks, subject to available funds and shares.

4.  **Viewing Leaderboard:**
    *   During or after a game, users can view a leaderboard showing player rankings based on portfolio value.
    *   ![](public/imgs/Screenshot%202025-05-23%20211001.png) ##TODOs

5.  **Endgame Screen:**
    * After finishing the game, users can see the end statistics.
    *   ![](public/imgs/Screenshot%202025-05-23%20211911.png)
    *   ![](public/imgs/Screenshot%202025-05-23%20211924.png)
    *   ![](public/imgs/Screenshot%202025-05-23%20211946.png)

## Roadmap

Top features new developers could contribute to the client application:

1.  **Enhanced Real-time UI Updates with WebSockets:** If the backend supports WebSockets for game events (stock prices, portfolio changes, leaderboard updates), integrate WebSocket client logic to update the UI instantly without requiring manual refreshes or polling, providing a more dynamic user experience.
2.  **Advanced Interactive Stock Charts:** Improve stock charting capabilities using a library like Plotly.js (which seems to be included) or others (e.g., Chart.js, Recharts, TradingView Lightweight Charts). Add features like different chart types (candlestick, line), time range selectors, and technical indicators.
3.  **User Profile Customization & Statistics Display:** Create a user profile page where players can view their overall game statistics (win rate, average profit, most traded stocks), manage account settings, and perhaps customize their avatar or theme preferences.

## Built With

*   [Next.js](https://nextjs.org/) - React Framework (using App Router).
*   [React](https://reactjs.org/) - JavaScript library for building user interfaces.
*   [TypeScript](https://www.typescriptlang.org/) - Statically typed JavaScript.
*   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework. *(Confirm or replace if you used something else, e.g., Ant Design styles, CSS Modules)*
*   [Plotly.js](https://plotly.com/javascript/) - JavaScript graphing library.
*   [Deno](https://deno.land/) / [Node.js](https://nodejs.org/) - JavaScript Runtimes for development and build.
*   [Nix](https://nixos.org/nix/) & [direnv](https://direnv.net/) - Development Environment Management.
*   Custom React Hooks for state management and API interaction.
*   Deployed on [Vercel](https://vercel.com).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, the process for submitting pull requests to us, and other guidelines for contributing to the Stockico client project.
*(Ensure you have a `CONTRIBUTING.MD` file in this client repository, similar to the one for the backend, but with links pointing to this client repository.)*

## Versioning

We use [Semantic Versioning (SemVer)](http://semver.org/) for versioning our client releases. For the versions available, see the [tags on this repository](https://github.com/YOUR_GITHUB_USERNAME/YOUR_CLIENT_REPOSITORY_NAME/tags).

## Authors

*   **SoPra FS24 Group 36** - *Development Team*
    *   [Shirley Lau](https://github.com/shirleyl1220)
    *   [SeungJu Paek](https://github.com/sing-git)
    *   [Jianwen Cao](https://github.com/JianwenCao)
    *   [Ilias Karagiannakis](https://github.com/LiakosKari)
    *   [Julius Landes](https://github.com/JuliusLhamo)

## License

This project is licensed under the **MIT License**.
See the [LICENSE.md](LICENSE.md) file for the full license text.

## Acknowledgments

*   Our gratitude to the **SoPra FS24 Teaching Team** at the University of Zurich for their guidance, support, and providing the initial project templates and framework.
*   Thanks to the **Vercel team** for Next.js, the Geist font, and their excellent deployment platform.
*   Appreciation for the open-source community and the creators of the many libraries and frameworks that made this project possible.





