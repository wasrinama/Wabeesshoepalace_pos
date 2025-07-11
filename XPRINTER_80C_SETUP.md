# XPrinter 80C Setup Guide for POS System

## 📋 Overview
This guide will help you set up your XPrinter 80C thermal printer with the Wabees Shoe Palace POS system.

## 🔧 Hardware Setup

### 1. Printer Connection
- **USB Connection**: Connect the XPrinter 80C to your computer via USB cable
- **Power**: Ensure the printer is powered on (LED indicator should be green)
- **Paper**: Load 80mm thermal paper roll properly

### 2. Driver Installation
1. Download XPrinter 80C drivers from the manufacturer's website
2. Install the drivers following the setup wizard
3. Verify the printer appears in your system's printer list

## 🌐 Browser Configuration

### Chrome/Edge (Recommended)
1. **Enable Web Serial API**:
   - Go to `chrome://flags/` or `edge://flags/`
   - Search for "Serial"
   - Enable "Experimental Web Platform features"
   - Restart browser

2. **Enable Web USB API** (Optional):
   - Go to `chrome://flags/` or `edge://flags/`
   - Search for "WebUSB"
   - Enable "WebUSB API"
   - Restart browser

### Permissions
- Grant permission when prompted to access the serial port
- Select your XPrinter 80C from the device list

## 🖨️ Printer Settings

### Optimal Configuration
- **Baud Rate**: 9600
- **Data Bits**: 8
- **Parity**: None
- **Stop Bits**: 1
- **Flow Control**: None

### Paper Settings
- **Width**: 80mm
- **Type**: Thermal paper
- **Characters per line**: 42

## 🔍 Testing Your Setup

### 1. Print Test Receipt
1. Open the POS system
2. Add items to cart
3. Process a test sale
4. Click "Print" button
5. Your XPrinter 80C should print automatically

### 2. Test Cash Drawer (if connected)
1. Complete a cash sale
2. The cash drawer should open automatically
3. If not, manually test via the print dialog

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### ❌ "XPrinter 80C not found"
**Solutions**:
- Check USB connection
- Verify printer is powered on
- Reinstall printer drivers
- Try a different USB port
- Restart browser after enabling Web Serial API

#### ❌ "Could not connect to thermal printer"
**Solutions**:
- Grant browser permission for serial access
- Check if another application is using the printer
- Restart the printer
- Clear browser cache and refresh page

#### ❌ Poor print quality
**Solutions**:
- Check thermal paper quality
- Clean printer head
- Adjust print density settings
- Ensure proper paper loading

#### ❌ Paper jam or cutting issues
**Solutions**:
- Check paper path for obstructions
- Reload paper properly
- Clean paper sensors
- Check cutter mechanism

## 📱 Features Supported

### ✅ Receipt Printing
- Professional thermal receipts
- Store branding and contact info
- Itemized sales with discounts
- Payment details and change
- Custom footer messages

### ✅ Cash Drawer Control
- Automatic drawer opening on cash sales
- Manual drawer control
- Multiple drawer support

### ✅ Multiple Print Methods
1. **Direct USB/Serial**: Best performance
2. **Web Serial API**: Modern browser support
3. **Fallback Print**: Browser printing as backup

## 🔒 Security Notes
- Web Serial API requires HTTPS in production
- Only grant printer access to trusted websites
- Keep printer drivers updated

## 📞 Support

### Manufacturer Support
- **XPrinter**: Check manufacturer's website for latest drivers
- **Model**: 80C Series

### POS System Support
If you're still experiencing issues:
1. Check browser console for error messages
2. Try the fallback printing method
3. Contact technical support with error details

## 🎯 Pro Tips

### For Best Results:
- Use genuine XPrinter thermal paper
- Keep printer firmware updated
- Regular cleaning of printer head
- Test print after any system changes

### Performance Optimization:
- Close unnecessary browser tabs
- Ensure stable USB connection
- Keep printer drivers updated
- Use Chrome or Edge for best compatibility

---

## ✅ Quick Checklist

Before using your XPrinter 80C:
- [ ] Printer connected and powered on
- [ ] Drivers installed
- [ ] 80mm thermal paper loaded
- [ ] Web Serial API enabled in browser
- [ ] Browser permissions granted
- [ ] Test print successful

**Your XPrinter 80C is now ready for use with the POS system!** 🎉 