# Bizco - Business Analytics Platform

A Next.js application providing data-driven business intelligence for product portfolio and market research analysis, featuring BCG Matrix analysis, market research tools, product prototyping, and niche marketing strategies.

![Theme Color](https://via.placeholder.com/15/5E63B6/5E63B6.png) **Theme Color:** #5E63B6

## Key Features

### Business Intelligence Dashboard
- **Modern Dashboard**: Responsive interface with intuitive navigation and at-a-glance metrics
- **Dark/Light Mode**: Seamless theme switching with user preference persistence
- **Interactive Charts**: Dynamic data visualization with hover effects and tooltips
- **Recent Activity Tracking**: Monitor and manage your uploaded data and analyses

### Analytics Tools
- **BCG Matrix Analysis**: Visualize product portfolio performance by market share vs. growth
- **Market Research**: Tools for analyzing both primary and secondary research data
- **Data Management**: Upload, organize, and analyze business data through intuitive interfaces
- **Visual Reports**: Generate comprehensive HTML reports with charts, insights, and key metrics

### Strategic Planning
- **Product Prototyping**: Develop and test product concepts before full investment
- **Niche Marketing**: Identify and target profitable market segments with personalized strategies
- **Strategic Campaigns**: Build marketing strategies based on customer behavior analysis
- **Competitive Analysis**: Analyze competitor positioning and identify market opportunities

### User Experience
- **Modern UI/UX**: Clean, intuitive interface with smooth transitions and animations
- **Responsive Design**: Fully adaptive layout for mobile, tablet, and desktop
- **Accessibility**: Optimized with proper contrast, font sizing, and focus management
- **Performance Optimized**: Fast loading times and smooth interactions

## Tech Stack

### Frontend
- **Framework**: Next.js 14
- **UI Components**: Shadcn UI (based on Radix UI)
- **Styling**: Tailwind CSS with custom theme
- **Charts**: Chart.js with react-chartjs-2
- **Animations**: CSS animations and transitions
- **Theme Management**: next-themes

### Backend
- **API Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Data Processing**: Python scripts for data analysis
- **Visualization**: Matplotlib for chart generation
- **Template Engine**: Jinja2 for report generation

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 12.x or higher
- Python 3.8+ (for data analysis scripts)
- pnpm (recommended) or npm

### Installation

#### Frontend Setup
1. **Clone the repository and install dependencies**
```bash
git clone https://github.com/yourusername/bizco-np.git
cd bizco-np

# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

2. **Create environment configuration**
Create a `.env.local` file in the project root:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. **Start the development server**
```bash
pnpm dev
# or
npm run dev
```

4. **Access the application**
Open [http://localhost:3000](http://localhost:3000) in your browser

#### Backend Setup

1. **Install Node.js dependencies**
```bash
cd backend
npm install
```

2. **Install Python dependencies for data analysis scripts**
```bash
pip install -r requirements.txt
```

3. **Configure database**
Create a `.env` file in the `/backend` directory:
```
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Configuration
PGUSER=postgres
PGHOST=localhost
PGDATABASE=bizco_np
PGPASSWORD=your_postgres_password_here
PGPORT=5432

# JWT Configuration
JWT_SECRET=bizco_np_secret_key_change_in_production
JWT_EXPIRATION=1d

# Logging
LOG_LEVEL=info
```

4. **Initialize the database**
```bash
node src/utils/initDb.js
```

5. **Start the backend server**
```bash
npm run dev
```

The API will be available at http://localhost:5000.

### Running Secondary API (Python)
Start the secondary API for data analysis:
```bash
cd backend
python secondary_api.py
```
This will run on http://localhost:8001.

## PostgreSQL Database Setup

1. **Install PostgreSQL**
   - Download from https://www.postgresql.org/download/
   - Set a password for the 'postgres' user during installation

2. **Create Database**
   - Using pgAdmin: Right-click on Databases > Create > Database... > Enter 'bizco_np'
   - Using command line: 
     ```
     psql -U postgres
     CREATE DATABASE bizco_np;
     \q
     ```

## Project Structure

```
bizco-np/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Dashboard pages and features
│   ├── login/              # Authentication pages
│   ├── register/           # User registration
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # UI components (buttons, cards, etc.)
│   └── theme-provider.tsx  # Theme provider component
├── public/                 # Static assets
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── backend/                # Backend API
│   ├── src/                # Node.js backend source
│   │   ├── controllers/    # API controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Express middleware
│   ├── secondary_api.py    # Python data analysis API
│   └── requirements.txt    # Python dependencies
└── temp/                   # Temporary files
    ├── output/             # Generated charts and reports
    └── uploads/            # Uploaded data files
```

## API Testing

Once the backend is running, you can test the API endpoints using tools like Postman or curl:

### Register a new user
```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Upload Business Data
```
POST http://localhost:5000/api/business-data
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [your_data_file.csv]
type: "company_profile"
```

## Available Scripts

### Frontend
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run linter

### Backend (Node.js)
- `npm start`: Run the server in production mode
- `npm run dev`: Run the server in development mode with nodemon

## Troubleshooting

### Database Issues
- Verify PostgreSQL is running using pgAdmin or system services
- Check that credentials in the `.env` file match your PostgreSQL setup
- Ensure there are no firewall restrictions blocking access to port 5432

### API Connection Issues
- Ensure both frontend and backend are running simultaneously
- Check that the backend is running on port 5000 and frontend on port 3000
- Verify there are no CORS issues by checking the browser's developer console

### Python Analysis Issues
- Ensure all required Python packages are installed
- Check if matplotlib is properly configured
- Verify file permissions for temp directories are set correctly

## User Interface Features

- **Modern Design**: Clean, professional interface with consistent styling
- **Responsive Layout**: Adapts seamlessly to different screen sizes
- **Interactive Elements**: Hover effects, transitions, and animations for better UX
- **Accessible Components**: Proper contrast ratios and keyboard navigation
- **Theme Options**: Light and dark mode with system preference detection
- **Data Visualizations**: Clear charts and graphs with consistent styling
- **Intuitive Navigation**: Logical structure with breadcrumbs and clear paths

## License

This project is licensed under the MIT License.

## Acknowledgements
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Chart.js](https://www.chartjs.org/)
- [Framer Motion](https://www.framer.com/motion/)
