#!/bin/bash

# MedRoster Frontend Quick Start Guide

echo "════════════════════════════════════════════════════════════════"
echo "🏥 MEDROSTER FRONTEND - QUICK START GUIDE"
echo "════════════════════════════════════════════════════════════════"
echo ""

print_step() {
  echo "📍 STEP $1: $2"
  echo "─────────────────────────────────"
}

# Step 1
print_step "1" "Verify Backend is Running"
echo "✓ Your backend should be running on http://localhost:8000"
echo "✓ Check with: curl http://localhost:8000/"
echo "✓ You should see: Health check response"
echo ""

# Step 2
print_step "2" "Check Dependencies"
echo "✓ Node.js version:"
node --version
echo "✓ npm version:"
npm --version
echo ""

# Step 3
print_step "3" "Install Frontend Dependencies"
echo "Run:"
echo "  cd /Users/sunilganta/Documents/medroster-frontend"
echo "  npm install"
echo ""

# Step 4
print_step "4" "Verify Environment Configuration"
echo "✓ Check .env file:"
echo "  cat .env"
echo "✓ Should contain:"
echo "  REACT_APP_API_URL=http://localhost:8000"
echo ""

# Step 5
print_step "5" "Start Frontend Development Server"
echo "Run:"
echo "  cd /Users/sunilganta/Documents/medroster-frontend"
echo "  npm start"
echo ""
echo "✓ Application will open in browser at http://localhost:3000"
echo "✓ Or navigate manually to http://localhost:3000"
echo ""

# Step 6
print_step "6" "Login Credentials"
echo "Use existing test account:"
echo "  Email:    admin@hospital.com"
echo "  Password: testpass123"
echo "  Role:     admin"
echo ""
echo "Or register a new account"
echo ""

# Step 7
print_step "7" "Available Pages"
echo "✓ /login        - Login/Register page"
echo "✓ /register     - Registration page"
echo "✓ /dashboard    - Main dashboard (protected)"
echo "✓ /             - Redirects to dashboard"
echo ""

# Step 8
print_step "8" "Key Features"
echo "✓ User Authentication (JWT)"
echo "✓ Department Management"
echo "✓ Shift Management"
echo "✓ Staff Management"
echo "✓ Assignment Tracking"
echo "✓ Real-time Data Sync"
echo ""

# Features
echo "════════════════════════════════════════════════════════════════"
echo "📦 FRONTEND COMPONENTS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Created Components:"
echo "  • AuthPage       - Login & Registration"
echo "  • DashboardPage  - Main dashboard with statistics"
echo "  • Navbar         - Navigation with logout"
echo "  • PrivateRoute   - Protected route wrapper"
echo ""

echo "✅ API Integration:"
echo "  • Authentication endpoints"
echo "  • User management"
echo "  • Department CRUD"
echo "  • Shift management"
echo "  • Assignment tracking"
echo "  • AI features (ready to call)"
echo "  • Emergency features (ready to call)"
echo ""

echo "✅ State Management:"
echo "  • AuthContext for global auth state"
echo "  • Local component state for forms"
echo "  • localStorage for token persistence"
echo ""

# Debugging
echo "════════════════════════════════════════════════════════════════"
echo "🔧 TROUBLESHOOTING"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Issue: Port 3000 already in use"
echo "Solution: Kill process or use different port"
echo "  • MacOS/Linux: lsof -ti:3000 | xargs kill -9"
echo "  • Windows: netstat -ano | findstr :3000"
echo ""

echo "Issue: API calls returning 401/403"
echo "Solution: Check token in localStorage"
echo "  • Open DevTools → Application → Storage → localStorage"
echo "  • Look for 'access_token' key"
echo ""

echo "Issue: Backend not responding"
echo "Solution: Start backend server"
echo "  • cd /Users/sunilganta/Documents/medroster-ai"
echo "  • uvicorn app.main:app --reload --port 8000"
echo ""

# Next Steps
echo "════════════════════════════════════════════════════════════════"
echo "🚀 NEXT STEPS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Start Backend:"
echo "   cd /Users/sunilganta/Documents/medroster-ai"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "2. Start Frontend (in new terminal):"
echo "   cd /Users/sunilganta/Documents/medroster-frontend"
echo "   npm start"
echo ""
echo "3. Login at http://localhost:3000"
echo ""
echo "4. Explore features:"
echo "   • Create departments"
echo "   • Create shifts"
echo "   • View staff"
echo "   • Manage assignments"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ FRONTEND SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
