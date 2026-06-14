# ChronoMind: The Neuromorphic Future Simulation Engine
<sub>MEMBERS :</sub> 
- <sub>UTSAV MAKHIJA (25BCE10713)</sub> 
- <sub>NIHAAL SHARMA (25BCE10296)</sub> 
- <sub>VATS ABHINAV NAWIN KUMAR (25BAI10238)</sub> 
- <sub>ABHIGYAN PANDEY (25BAI10989)</sub> 
##
ChronoMind is a futuristic "Neuromorphic Future Simulation Engine" that allows users to explore millions of possible futures before making a decision. It simulates alternate realities using a brain-inspired neuromorphic architecture based on memory networks, associative reasoning, probabilistic branching, and adaptive learning.
##
## Features

- **Neuromorphic Memory Graph**: A NetworkX-based knowledge graph that stores concepts and their relationships.
- **Neural Activation Engine**: Spreads activation through the memory graph based on user input using Hebbian learning principles.
- **Timeline Generator**: Generates branching future timelines from activated memories using Monte Carlo sampling.
- **Probability Engine**: Scores and ranks future outcomes based on node weights, activation strength, and historical associations.
- **Future Comparison Tool**: Side-by-side comparison of different decision paths using D3.js radar charts.
- **Time Stone Mode**: A cinematic visualization of 14,000,605 simulated futures, revealing the most likely, top and rare outcomes.
- **Immersive UI**: Glassmorphic design, WebGL neural nebula backgrounds, and React Flow timeline visualizations.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS v4
- Vite
- React Flow (Node/Edge visualizations)
- Framer Motion (Animations)
- Three.js & WebGL (3D Portal and Shaders)
- D3.js (Radar Charts)

### Backend
- Python 3.11
- FastAPI
- NetworkX (Graph Engine)
- Uvicorn

## Running the Application

### Local Setup

#### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.

*Note: The backend API runs at [http://localhost:8000](http://localhost:8000), with interactive Swagger documentation available at [http://localhost:8000/docs](http://localhost:8000/docs).*

### Using Docker Compose
If you have Docker installed, you can run the following command in the root directory:
```bash
docker-compose up --build
```
## Project Structure

- `/backend`: Python FastAPI application containing the memory engine, timeline generator, and API endpoints.
- `/frontend`: React application containing the UI components, pages, and visualizations.
- `docker-compose.yml`: Docker composition for easy deployment.
