// Universal Printing Service for All Printer Types
// Supports: Thermal, Laser, Inkjet, Label, Receipt, and Network printers

class UniversalPrintService {
  constructor() {
    this.printerCapabilities = {
      thermal: ['ESC/POS', 'ZPL', 'DPL', 'CPCL'],
      laser: ['PCL', 'PostScript', 'GDI'],
      inkjet: ['PCL', 'PostScript', 'GDI'],
      label: ['ZPL', 'DPL', 'CPCL', 'EPL'],
      receipt: ['ESC/POS', 'Star', 'Citizen'],
      network: ['IPP', 'LPR', 'Raw']
    };
    
    this.detectedPrinters = [];
    this.preferredPrinter = null;
    this.printHistory = [];
  }

  // Auto-detect available printers
  async detectPrinters() {
    const printers = [];
    
    try {
      // Method 1: Web Serial API (for direct connection printers)
      if ('serial' in navigator) {
        const ports = await navigator.serial.getPorts();
        ports.forEach(port => {
          printers.push({
            type: 'serial',
            connection: 'USB/Serial',
            port: port,
            capabilities: ['thermal', 'receipt']
          });
        });
      }

      // Method 2: Web USB API (for USB printers)
      if ('usb' in navigator) {
        const devices = await navigator.usb.getDevices();
        devices.forEach(device => {
          const printerType = this.identifyPrinterType(device);
          printers.push({
            type: 'usb',
            connection: 'USB',
            device: device,
            capabilities: [printerType],
            vendorId: device.vendorId,
            productId: device.productId
          });
        });
      }

      // Method 3: System printers (via browser print dialog)
      printers.push({
        type: 'system',
        connection: 'System Driver',
        capabilities: ['laser', 'inkjet', 'thermal', 'label'],
        description: 'Default system printer'
      });

      // Method 4: Network printers (if available)
      if ('networkInformation' in navigator) {
        printers.push({
          type: 'network',
          connection: 'Network',
          capabilities: ['laser', 'inkjet', 'thermal'],
          description: 'Network/WiFi printers'
        });
      }

      this.detectedPrinters = printers;
      return printers;
    } catch (error) {
      console.error('Error detecting printers:', error);
      // Fallback to system printer
      this.detectedPrinters = [{
        type: 'system',
        connection: 'System Driver',
        capabilities: ['universal'],
        description: 'Universal system printer'
      }];
      return this.detectedPrinters;
    }
  }

  // Identify printer type by vendor/product ID
  identifyPrinterType(device) {
    const thermalPrinters = [
      { vendor: 0x0471, product: 0x0055, name: 'XPrinter' },
      { vendor: 0x28e9, product: 0x0289, name: 'Generic Thermal' },
      { vendor: 0x04b8, product: 0x0202, name: 'Epson' },
      { vendor: 0x04b8, product: 0x0005, name: 'Epson TM' },
      { vendor: 0x0519, product: 0x0003, name: 'Citizen' },
      { vendor: 0x0856, product: 0x0001, name: 'Star' }
    ];

    const zebraPrinters = [
      { vendor: 0x0a5f, product: 0x0081, name: 'Zebra GK420d' },
      { vendor: 0x0a5f, product: 0x0084, name: 'Zebra ZD410' },
      { vendor: 0x0a5f, product: 0x0158, name: 'Zebra ZT410' }
    ];

    const laserPrinters = [
      { vendor: 0x03f0, product: 0x0000, name: 'HP LaserJet' },
      { vendor: 0x04a9, product: 0x0000, name: 'Canon' },
      { vendor: 0x04b8, product: 0x0000, name: 'Epson Laser' }
    ];

    // Check thermal printers
    if (thermalPrinters.some(p => p.vendor === device.vendorId)) {
      return 'thermal';
    }

    // Check Zebra printers
    if (zebraPrinters.some(p => p.vendor === device.vendorId)) {
      return 'label';
    }

    // Check laser printers
    if (laserPrinters.some(p => p.vendor === device.vendorId)) {
      return 'laser';
    }

    // Default to thermal for unknown devices
    return 'thermal';
  }

  // Universal receipt printing method
  async printReceipt(invoiceData, options = {}) {
    const printers = await this.detectPrinters();
    
    // Try printing methods in order of preference
    const printMethods = [
      { method: 'directThermal', priority: 1 },
      { method: 'directUSB', priority: 2 },
      { method: 'systemDriver', priority: 3 },
      { method: 'htmlFallback', priority: 4 }
    ];

    for (const method of printMethods) {
      try {
        const result = await this.tryPrintMethod(method.method, invoiceData, options);
        if (result.success) {
          this.logPrintSuccess(method.method, invoiceData);
          return result;
        }
      } catch (error) {
        console.warn(`Print method ${method.method} failed:`, error);
        continue;
      }
    }

    // If all methods fail, show manual options
    return this.showManualPrintOptions(invoiceData);
  }

  // Try specific print method
  async tryPrintMethod(method, invoiceData, options) {
    switch (method) {
      case 'directThermal':
        return await this.printDirectThermal(invoiceData, options);
      case 'directUSB':
        return await this.printDirectUSB(invoiceData, options);
      case 'systemDriver':
        return await this.printSystemDriver(invoiceData, options);
      case 'htmlFallback':
        return await this.printHTMLFallback(invoiceData, options);
      default:
        throw new Error(`Unknown print method: ${method}`);
    }
  }

  // Direct thermal printing (ESC/POS commands)
  async printDirectThermal(invoiceData, options) {
    try {
      const escPosData = this.generateESCPOS(invoiceData, options);
      
      // Try Web Serial API first
      if ('serial' in navigator) {
        const port = await navigator.serial.requestPort({
          filters: [
            { usbVendorId: 0x0471, usbProductId: 0x0055 }, // XPrinter
            { usbVendorId: 0x28e9, usbProductId: 0x0289 }, // Generic thermal
            { usbVendorId: 0x04b8, usbProductId: 0x0202 }, // Epson
            { usbVendorId: 0x04b8, usbProductId: 0x0005 }, // Epson TM
            { usbVendorId: 0x0519, usbProductId: 0x0003 }, // Citizen
            { usbVendorId: 0x0856, usbProductId: 0x0001 }  // Star
          ]
        });

        await port.open({ 
          baudRate: 9600, 
          dataBits: 8, 
          parity: 'none', 
          stopBits: 1 
        });

        const writer = port.writable.getWriter();
        const data = new Uint8Array(escPosData.length);
        for (let i = 0; i < escPosData.length; i++) {
          data[i] = escPosData.charCodeAt(i);
        }

        await writer.write(data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        writer.releaseLock();
        await port.close();

        return { success: true, method: 'directThermal', message: 'Printed successfully on thermal printer' };
      }

      throw new Error('Web Serial API not available');
    } catch (error) {
      console.error('Direct thermal printing failed:', error);
      throw error;
    }
  }

  // Direct USB printing
  async printDirectUSB(invoiceData, options) {
    try {
      if (!('usb' in navigator)) {
        throw new Error('Web USB API not available');
      }

      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x0471, productId: 0x0055 }, // XPrinter
          { vendorId: 0x28e9, productId: 0x0289 }, // Generic thermal
          { vendorId: 0x04b8, productId: 0x0202 }, // Epson
          { vendorId: 0x0a5f }, // Zebra (any product)
          { vendorId: 0x0519 }, // Citizen
          { vendorId: 0x0856 }  // Star
        ]
      });

      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      const printerType = this.identifyPrinterType(device);
      let printData;

      if (printerType === 'label') {
        printData = this.generateZPL(invoiceData, options);
      } else {
        printData = this.generateESCPOS(invoiceData, options);
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(printData);
      
      await device.transferOut(1, data);
      await device.close();

      return { success: true, method: 'directUSB', message: 'Printed successfully via USB' };
    } catch (error) {
      console.error('Direct USB printing failed:', error);
      throw error;
    }
  }

  // System driver printing
  async printSystemDriver(invoiceData, options) {
    try {
      const printWindow = window.open('', '_blank');
      const receiptHTML = this.generateSystemDriverHTML(invoiceData, options);
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Wait for content to load
      await new Promise(resolve => {
        printWindow.onload = resolve;
      });
      
      printWindow.print();
      
      return { success: true, method: 'systemDriver', message: 'Sent to system printer' };
    } catch (error) {
      console.error('System driver printing failed:', error);
      throw error;
    }
  }

  // HTML fallback printing
  async printHTMLFallback(invoiceData, options) {
    try {
      const printWindow = window.open('', '_blank');
      const receiptHTML = this.generateUniversalHTML(invoiceData, options);
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
      
      return { success: true, method: 'htmlFallback', message: 'Universal HTML print' };
    } catch (error) {
      console.error('HTML fallback printing failed:', error);
      throw error;
    }
  }

  // Generate ESC/POS commands for thermal printers
  generateESCPOS(invoiceData, options = {}) {
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';
    const CR = '\x0D';
    
    let receipt = '';
    
    // Initialize printer
    receipt += ESC + '@';
    receipt += ESC + 't' + '\x03';
    receipt += ESC + 'R' + '\x00';
    
    // Header
    receipt += ESC + 'a' + '\x01'; // Center align
    receipt += ESC + '!' + '\x30'; // Double height & width
    receipt += (options.storeName || 'POS SYSTEM') + LF;
    receipt += ESC + '!' + '\x00'; // Normal size
    receipt += '================================' + LF;
    
    // Invoice details
    receipt += ESC + 'a' + '\x00'; // Left align
    receipt += `Invoice: ${invoiceData.id || invoiceData.invoiceNumber || 'N/A'}` + LF;
    receipt += `Date: ${invoiceData.date || new Date().toLocaleDateString()}` + LF;
    receipt += `Time: ${invoiceData.time || new Date().toLocaleTimeString()}` + LF;
    receipt += `Payment: ${invoiceData.paymentMethod || 'Cash'}` + LF;
    receipt += '================================' + LF;
    
    // Items
    receipt += ESC + '!' + '\x08'; // Bold
    receipt += 'ITEM                    QTY  PRICE' + LF;
    receipt += ESC + '!' + '\x00'; // Normal
    receipt += '--------------------------------' + LF;
    
    (invoiceData.items || []).forEach(item => {
      const itemName = (item.name || 'Item').length > 20 ? 
        (item.name || 'Item').substring(0, 17) + '...' : 
        (item.name || 'Item');
      const quantity = (item.quantity || 1).toString().padStart(3);
      const price = `${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`;
      
      receipt += itemName.padEnd(24) + quantity + '  ' + price + LF;
    });
    
    receipt += '================================' + LF;
    
    // Total
    receipt += ESC + '!' + '\x38'; // Double height & bold
    receipt += ESC + 'a' + '\x01'; // Center align
    receipt += `TOTAL: ${(invoiceData.total || 0).toFixed(2)}` + LF;
    receipt += ESC + '!' + '\x00'; // Normal size
    receipt += ESC + 'a' + '\x00'; // Left align
    
    // Footer
    receipt += '================================' + LF;
    receipt += ESC + 'a' + '\x01'; // Center align
    receipt += 'Thank you for your business!' + LF;
    receipt += LF + LF + LF;
    
    // Cut paper
    receipt += GS + 'V' + 'A' + '\x03';
    
    return receipt;
  }

  // Generate ZPL commands for label printers
  generateZPL(invoiceData, options = {}) {
    const barcode = invoiceData.barcode || invoiceData.id || Date.now().toString();
    const productName = (invoiceData.name || 'Product').substring(0, 25);
    const price = (invoiceData.price || invoiceData.total || 0).toFixed(2);
    
    return `
^XA
^LH0,0
^FO50,20^ADN,20,10^FD${productName}^FS
^FO50,50^BY2,3,50^BCN,50,Y,N,N^FD${barcode}^FS
^FO50,110^ADN,18,10^FD${barcode}^FS
^FO50,140^ADN,12,8^FD${price}^FS
^XZ
`;
  }

  // Generate system driver optimized HTML
  generateSystemDriverHTML(invoiceData, options = {}) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { size: auto; margin: 0.5in; }
            body { font-family: 'Courier New', monospace; font-size: 12px; }
            .receipt { width: 100%; max-width: 300px; margin: 0 auto; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 2px 0; }
            @media print {
              body { margin: 0; }
              .receipt { width: 100%; max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center bold">${options.storeName || 'POS SYSTEM'}</div>
            <div class="line"></div>
            <div>Invoice: ${invoiceData.id || invoiceData.invoiceNumber || 'N/A'}</div>
            <div>Date: ${invoiceData.date || new Date().toLocaleDateString()}</div>
            <div>Time: ${invoiceData.time || new Date().toLocaleTimeString()}</div>
            <div class="line"></div>
            
            ${(invoiceData.items || []).map(item => `
              <div class="item">
                <span>${item.name || 'Item'} (${item.quantity || 1})</span>
                <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div class="line"></div>
            <div class="center bold">TOTAL: ${(invoiceData.total || 0).toFixed(2)}</div>
            <div class="line"></div>
            <div class="center">Thank you for your business!</div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
  }

  // Generate universal HTML for all printer types
  generateUniversalHTML(invoiceData, options = {}) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { size: auto; margin: 0.5in; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 14px; 
              line-height: 1.4;
              margin: 0;
              padding: 20px;
            }
            .receipt { 
              width: 100%; 
              max-width: 400px; 
              margin: 0 auto; 
              border: 1px solid #ddd;
              padding: 20px;
              background: white;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .store-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .invoice-details { margin-bottom: 20px; }
            .items { margin-bottom: 20px; }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px;
              padding: 5px 0;
              border-bottom: 1px dotted #ccc;
            }
            .item-name { flex: 1; }
            .item-qty { width: 50px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .total { 
              font-size: 18px; 
              font-weight: bold; 
              text-align: center; 
              margin-top: 20px;
              padding: 10px;
              background: #f0f0f0;
              border: 2px solid #333;
            }
            .footer { text-align: center; margin-top: 20px; }
            .line { border-bottom: 1px solid #333; margin: 10px 0; }
            
            @media print {
              body { margin: 0; padding: 0; }
              .receipt { 
                width: 100%; 
                max-width: none; 
                border: none;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="store-name">${options.storeName || 'POS SYSTEM'}</div>
              <div>${options.storeAddress || ''}</div>
              <div>${options.storePhone || ''}</div>
            </div>
            
            <div class="line"></div>
            
            <div class="invoice-details">
              <div><strong>Invoice:</strong> ${invoiceData.id || invoiceData.invoiceNumber || 'N/A'}</div>
              <div><strong>Date:</strong> ${invoiceData.date || new Date().toLocaleDateString()}</div>
              <div><strong>Time:</strong> ${invoiceData.time || new Date().toLocaleTimeString()}</div>
              <div><strong>Payment:</strong> ${invoiceData.paymentMethod || 'Cash'}</div>
              ${invoiceData.cashierName ? `<div><strong>Cashier:</strong> ${invoiceData.cashierName}</div>` : ''}
            </div>
            
            <div class="line"></div>
            
            <div class="items">
              <div class="item" style="font-weight: bold; border-bottom: 2px solid #333;">
                <div class="item-name">ITEM</div>
                <div class="item-qty">QTY</div>
                <div class="item-price">PRICE</div>
              </div>
              
              ${(invoiceData.items || []).map(item => `
                <div class="item">
                  <div class="item-name">${item.name || 'Item'}</div>
                  <div class="item-qty">${item.quantity || 1}</div>
                  <div class="item-price">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="line"></div>
            
            ${invoiceData.subtotal ? `<div class="item"><div class="item-name">Subtotal:</div><div class="item-price">${invoiceData.subtotal.toFixed(2)}</div></div>` : ''}
            ${invoiceData.discount ? `<div class="item"><div class="item-name">Discount:</div><div class="item-price">-${invoiceData.discount.toFixed(2)}</div></div>` : ''}
            ${invoiceData.tax ? `<div class="item"><div class="item-name">Tax:</div><div class="item-price">${invoiceData.tax.toFixed(2)}</div></div>` : ''}
            
            <div class="total">
              TOTAL: ${(invoiceData.total || 0).toFixed(2)}
            </div>
            
            ${invoiceData.customerMoney ? `
              <div class="line"></div>
              <div class="item"><div class="item-name">Amount Paid:</div><div class="item-price">${invoiceData.customerMoney.toFixed(2)}</div></div>
              <div class="item"><div class="item-name">Change:</div><div class="item-price">${(invoiceData.balance || 0).toFixed(2)}</div></div>
            ` : ''}
            
            <div class="footer">
              <div class="line"></div>
              <div><strong>Thank you for your business!</strong></div>
              <div>Visit us again soon!</div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
  }

  // Show manual print options when all methods fail
  showManualPrintOptions(invoiceData) {
    const message = `
      Automatic printing failed. Please choose a manual option:
      
      1. Copy receipt data to clipboard
      2. Save as PDF
      3. Email receipt
      4. Try system printer
      
      Would you like to copy the receipt data to clipboard?
    `;
    
    if (window.confirm(message)) {
      this.copyReceiptToClipboard(invoiceData);
    }
    
    return { success: false, method: 'manual', message: 'Manual printing required' };
  }

  // Copy receipt data to clipboard
  async copyReceiptToClipboard(invoiceData) {
    const receiptText = this.generatePlainTextReceipt(invoiceData);
    
    try {
      await navigator.clipboard.writeText(receiptText);
      alert('Receipt data copied to clipboard! You can paste it into any text editor or email.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Show in popup for manual copy
      const popup = window.open('', '_blank');
      popup.document.write(`
        <html>
          <head><title>Receipt Data</title></head>
          <body>
            <h3>Receipt Data (Select All and Copy)</h3>
            <pre style="font-family: monospace; white-space: pre-wrap;">${receiptText}</pre>
          </body>
        </html>
      `);
    }
  }

  // Generate plain text receipt
  generatePlainTextReceipt(invoiceData) {
    let receipt = '';
    
    receipt += '================================\n';
    receipt += '         POS SYSTEM\n';
    receipt += '================================\n';
    receipt += `Invoice: ${invoiceData.id || invoiceData.invoiceNumber || 'N/A'}\n`;
    receipt += `Date: ${invoiceData.date || new Date().toLocaleDateString()}\n`;
    receipt += `Time: ${invoiceData.time || new Date().toLocaleTimeString()}\n`;
    receipt += `Payment: ${invoiceData.paymentMethod || 'Cash'}\n`;
    receipt += '================================\n';
    receipt += 'ITEM                    QTY  PRICE\n';
    receipt += '--------------------------------\n';
    
    (invoiceData.items || []).forEach(item => {
      const itemName = (item.name || 'Item').length > 20 ? 
        (item.name || 'Item').substring(0, 17) + '...' : 
        (item.name || 'Item');
      const quantity = (item.quantity || 1).toString().padStart(3);
      const price = ((item.price || 0) * (item.quantity || 1)).toFixed(2);
      
      receipt += itemName.padEnd(24) + quantity + '  ' + price + '\n';
    });
    
    receipt += '================================\n';
    receipt += `TOTAL: ${(invoiceData.total || 0).toFixed(2)}\n`;
    receipt += '================================\n';
    receipt += 'Thank you for your business!\n';
    receipt += '================================\n';
    
    return receipt;
  }

  // Log successful print
  logPrintSuccess(method, invoiceData) {
    this.printHistory.push({
      timestamp: new Date(),
      method: method,
      invoice: invoiceData.id || invoiceData.invoiceNumber,
      success: true
    });
    
    console.log(`Print successful: ${method} - Invoice ${invoiceData.id || invoiceData.invoiceNumber}`);
  }

  // Get print history
  getPrintHistory() {
    return this.printHistory;
  }

  // Cash drawer control (universal)
  async openCashDrawer() {
    try {
      // Try thermal printer cash drawer commands
      if ('serial' in navigator) {
        const ESC = '\x1B';
        const drawerCommand = ESC + 'p' + '\x00' + '\x19' + '\xFA';
        
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600, dataBits: 8, parity: 'none', stopBits: 1 });
        
        const writer = port.writable.getWriter();
        const data = new Uint8Array(drawerCommand.length);
        for (let i = 0; i < drawerCommand.length; i++) {
          data[i] = drawerCommand.charCodeAt(i);
        }
        
        await writer.write(data);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        writer.releaseLock();
        await port.close();
        
        return { success: true, message: 'Cash drawer opened' };
      } else {
        // Manual confirmation
        const opened = window.confirm('Please open the cash drawer manually. Click OK when done.');
        return { success: opened, message: opened ? 'Cash drawer opened manually' : 'Cash drawer not opened' };
      }
    } catch (error) {
      console.error('Cash drawer error:', error);
      const opened = window.confirm('Cannot open cash drawer automatically. Please open manually. Click OK when done.');
      return { success: opened, message: 'Manual cash drawer operation' };
    }
  }
}

// Export singleton instance
const universalPrintService = new UniversalPrintService();
export default universalPrintService; 