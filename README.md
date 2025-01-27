# Browser Tool

## About

Browser for AI Agents.

The vision for Browser use is to provide a browser for AI Agents to interact with the web while also allowing for the user to interact with the browser and have a live feed of agent actions similar to OpenAI's Operator.

## Features

- Initiate a browser session
- Interact with the browser
- Have a live feed sent through websockets

## Running Locally

### Prerequisites

- Python 3.8 or higher
- Node.js 16.x or higher
- pip
- npm

### Backend Setup

Navigate to backend directory

```bash
cd backend
```

Create and activate virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

#### On Windows use:

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Start the backend server

```bash
python app/main.py
```

### Frontend Setup

Navigate to frontend directory

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

## Vision

A Browser where AI agent can partner with the user to browse the web and perform tasks.

## Contributing

We love contributions! Feel free to open issues for bugs or feature requests. To contribute to the docs, check out the /docs (not created yet TODO: thoufic) folder.

## Citation

```bibtex
@software{browser_tool,
author = {[Thoufic]},
title = {Browser Tool},
year = {2025},
publisher = {GitHub},
url = {https://github.com/browser-use/browser-use}
}
```
