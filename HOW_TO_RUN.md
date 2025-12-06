# 🚀 How to Run FACE Frontend

## Option 1: Run Frontend Only (Quick Test)

```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:3000**

> **Note**: The frontend will work in demo mode, but to see full functionality, you need the backend and AI engine running too.

---

## Option 2: Run Everything (Full Demo)

### Step 1: Start AI Engine (Terminal 1)

```bash
cd ai-engine
npm start
```

✅ AI Engine running on **http://localhost:3001**

### Step 2: Start Backend (Terminal 2)

```bash
cd backend
go run cmd/api/main.go
```

✅ Backend API running on **http://localhost:8080**

### Step 3: Start Frontend (Terminal 3)

```bash
cd frontend
npm run dev
```

✅ Frontend running on **http://localhost:3000**

---

## Option 3: Use the Automated Script

```bash
# From project root
./scripts/start-all.sh
```

This starts all three services automatically in the background!

To stop:
```bash
./scripts/stop-all.sh
```

---

## 🎯 Access the Application

Once running, open your browser to:

**http://localhost:3000**

You'll see:
- 🏠 **Dashboard** - View compliance checks
- 📝 **Submit Asset** - Submit new transactions
- 🔗 **Connect Wallet** - MetaMask integration

---

## 🔧 Troubleshooting

### Port already in use?

**Frontend (3000):**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Backend (8080):**
```bash
lsof -ti:8080 | xargs kill -9
```

**AI Engine (3001):**
```bash
lsof -ti:3001 | xargs kill -9
```

### Dependencies not installed?

```bash
cd frontend
npm install
```

### Build errors?

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📱 What You'll See

### 1. Landing Page
- Premium monochrome + red design
- "Connect Wallet" button
- Navigation to Dashboard and Submit Asset

### 2. After Connecting Wallet
- MetaMask popup
- Auto-switch to Coston2 network
- Your wallet address displayed

### 3. Dashboard
- Stats cards (Total, Approved, Rejected, Under Review)
- Transaction history table
- Real-time updates via WebSocket

### 4. Submit Asset Page
- Form to submit transactions
- Asset type selector
- Real-time risk score display
- Animated result cards

---

## 🎨 Features to Test

✅ **Wallet Connection** - Click "Connect Wallet"
✅ **Network Switching** - Auto-switch to Coston2
✅ **Asset Submission** - Fill form and submit
✅ **Real-time Updates** - Watch WebSocket updates
✅ **Animations** - Smooth Framer Motion effects
✅ **Responsive Design** - Resize browser window

---

## 🔥 Pro Tip

For the best demo experience:

1. **Start all services** using `./scripts/start-all.sh`
2. **Open browser** to http://localhost:3000
3. **Connect MetaMask** to Coston2
4. **Submit a test transaction**
5. **Watch the magic happen!** ✨

The entire flow takes **~2 seconds** from submission to result!

---

## 📊 Service URLs

| Service | URL | Status Check |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | Open in browser |
| Backend | http://localhost:8080 | http://localhost:8080/api/health |
| AI Engine | http://localhost:3001 | http://localhost:3001/health |

---

**Ready to wow the judges!** 🏆
