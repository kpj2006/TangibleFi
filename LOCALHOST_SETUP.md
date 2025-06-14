# 🚀 TangibleFi Localhost Setup Guide

## ✅ **What's Already Done**

- ✅ Dependencies installed
- ✅ Development server starting
- ✅ Environment template created
- ✅ Smart contract integration ready
- ✅ IPFS integration ready

## 🔧 **Immediate Next Steps**

### 1. **Access Your Application**

Your app should be running at: **http://localhost:3000**

### 2. **Test Basic Functionality (Without Blockchain)**

You can immediately test:

- ✅ **Homepage**: http://localhost:3000
- ✅ **Dashboard**: http://localhost:3000/dashboard
- ✅ **Asset Creation**: http://localhost:3000/dashboard/assets/new
- ✅ **Admin Panel**: http://localhost:3000/admin

### 3. **For Full Blockchain Integration** (Optional for testing)

#### **Option A: Quick Test with Mock Data**

The app will work with mock data for initial testing. You can:

- Browse the interface
- Test the UI components
- See the asset creation flow
- View the admin dashboard

#### **Option B: Full Integration Setup**

**Step 1: Get IPFS Keys (Free)**

1. Go to https://pinata.cloud
2. Sign up for free account
3. Get API Key and Secret
4. Update `.env.local`:

```bash
NEXT_PUBLIC_PINATA_API_KEY=your_actual_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_actual_secret_key
```

**Step 2: Get RPC URLs (Free)**

1. Go to https://infura.io or https://alchemy.com
2. Sign up for free account
3. Create project and get endpoints
4. Update `.env.local`:

```bash
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_KEY
```

**Step 3: Deploy Smart Contracts (For Full Testing)**

```bash
# Navigate to foundry directory
cd src/foundry

# Install Foundry if not installed
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install

# Deploy to testnet (free)
forge script script/Deploy.s.sol:DeployScript --rpc-url https://rpc-mumbai.maticvigil.com --broadcast
```

## 🧪 **Testing Scenarios**

### **Immediate Testing (No Setup Required)**

1. **UI Testing**: Navigate through all pages
2. **Form Testing**: Fill out asset creation forms
3. **Admin Interface**: View admin dashboard
4. **Responsive Design**: Test on different screen sizes

### **With IPFS Setup**

1. **File Upload**: Upload images and documents
2. **Metadata Creation**: Generate NFT metadata
3. **IPFS Storage**: Verify files on Pinata dashboard

### **With Full Blockchain Setup**

1. **Wallet Connection**: Connect MetaMask
2. **Asset Tokenization**: Complete end-to-end flow
3. **NFT Minting**: Create actual NFTs
4. **Admin Approval**: Approve assets and mint NFTs

## 🔍 **What to Look For**

### **Homepage** (http://localhost:3000)

- Modern landing page with hero section
- Feature highlights
- Call-to-action buttons
- Responsive design

### **Dashboard** (http://localhost:3000/dashboard)

- Asset overview cards
- Portfolio statistics
- Navigation to asset creation
- User-friendly interface

### **Asset Creation** (http://localhost:3000/dashboard/assets/new)

- Multi-step form
- File upload areas
- Blockchain network selection
- Progress indicators
- Wallet connection status

### **Admin Panel** (http://localhost:3000/admin)

- Asset approval interface
- Real-time statistics
- Review workflow
- Admin controls

## 🚨 **Common Issues & Quick Fixes**

### **Issue: Page Not Loading**

- Check if server is running on port 3000
- Try refreshing the browser
- Check console for errors

### **Issue: Wallet Connection Errors**

- Install MetaMask browser extension
- Make sure you're on a supported network
- Check browser console for detailed errors

### **Issue: IPFS Upload Fails**

- Verify Pinata API keys in `.env.local`
- Check file size (should be under 100MB)
- Ensure internet connection

### **Issue: Database Errors**

- Check Supabase configuration
- Verify database tables exist
- Check network connectivity

## 🎯 **Quick Demo Flow**

1. **Start Here**: http://localhost:3000
2. **Explore Dashboard**: Click "Dashboard" or "Get Started"
3. **Create Asset**: Go to "Assets" → "Add New Asset"
4. **Fill Form**: Enter sample asset details
5. **Upload Files**: Add sample images/documents
6. **Submit**: See the integration in action
7. **Admin View**: Go to `/admin` to see admin interface

## 📞 **Need Help?**

If you encounter any issues:

1. Check the browser console (F12)
2. Look at the terminal output
3. Verify environment variables
4. Check network connectivity

## 🎉 **You're Ready!**

Your TangibleFi platform is now running locally with:

- ✅ Complete UI/UX
- ✅ Smart contract integration
- ✅ IPFS file storage
- ✅ Admin dashboard
- ✅ Multi-chain support
- ✅ Professional error handling

**Start exploring at: http://localhost:3000** 🚀
