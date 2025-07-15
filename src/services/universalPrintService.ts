// Interface for invoice item data
interface InvoiceItem {
  name: string;
  quantity?: number;
  qty?: number;
  price?: number;
  sellingPrice?: number;
  originalPrice?: number;
  unitPrice?: number;
  discount?: number;
  itemDiscount?: number;
  discountAmount?: number;
  discountPerItem?: number;
  unitDiscount?: number;
  priceDiscount?: number;
  itemPriceDiscount?: number;
  subtotal?: number;
  total?: number;
}

// Interface for invoice data
interface InvoiceData {
  invoiceNumber?: string;
  customerName?: string;
  items?: InvoiceItem[];
  total?: number;
  grandTotal?: number;
  additionalDiscount?: number;
  extraDiscount?: number;
  discount?: number;
  orderDiscount?: number;
  amountPaid?: number;
  customerPaid?: number;
  paid?: number;
  paymentMethod?: string;
  cashier?: string;
  servedBy?: string;
  time?: string;
  date?: string | Date;
}

// Interface for print options
interface PrintOptions {
  paperSize?: string;
  fontSize?: string;
  fontFamily?: string;
  isDebugMode?: boolean;
}

// Interface for print service response
interface PrintServiceResponse {
  success: boolean;
  message: string;
  method?: string;
  error?: Error;
}

// Interface for print history record
interface PrintRecord {
  timestamp: string;
  invoiceNumber: string;
  method: string;
  total: number;
}

// Interface for default print settings
interface DefaultPrintSettings {
  paperSize: string;
  fontSize: string;
  fontFamily: string;
}

// Simple Print Service - Manual Printer Selection
// Works with any printer through browser print dialog
class SimplePrintService {
  private printHistory: PrintRecord[];
  private defaultSettings: DefaultPrintSettings;

  constructor() {
    this.printHistory = [];
    this.defaultSettings = {
      paperSize: '80mm', // For thermal printers
      fontSize: '12px',
      fontFamily: 'monospace'
    };
  }

  // Simple print method - uses browser print dialog
  async printReceipt(invoiceData: InvoiceData, options: PrintOptions = {}): Promise<PrintServiceResponse> {
    try {
      console.log('📄 Printing receipt for invoice:', invoiceData.invoiceNumber);
      console.log('🔍 FULL INVOICE DATA STRUCTURE:');
      console.log(JSON.stringify(invoiceData, null, 2));
      
      // Add debug section to receipt if in development
      const isDebugMode = window.location.hostname === 'localhost';
      
      // Create printable HTML content
      const printContent = this.generatePrintableHTML(invoiceData, { ...options, isDebugMode });
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow popups.');
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          
          // Close the print window after printing
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 100);
      };
      
      // Log successful print attempt
      this.logPrintSuccess('browser', invoiceData);
      
      return {
        success: true,
        message: 'Print dialog opened. Please select your printer manually.',
        method: 'browser'
      };
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      return {
        success: false,
        message: 'Failed to open print dialog: ' + (error instanceof Error ? error.message : 'Unknown error'),
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  // Generate HTML content for printing
  private generatePrintableHTML(invoiceData: InvoiceData, options: PrintOptions = {}): string {
    const { 
      paperSize = '80mm', 
      fontSize = '12px', 
      fontFamily = 'monospace', 
      isDebugMode = false 
    } = { ...this.defaultSettings, ...options };
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt - ${invoiceData.invoiceNumber || 'N/A'}</title>
    <style>
        @media print {
            @page {
                size: ${paperSize === '80mm' ? '80mm auto' : 'A4'};
                margin: 2mm;
            }
            body { margin: 0; }
        }
        
        body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: 1.2;
            color: #000;
            background: #fff;
            max-width: ${paperSize === '80mm' ? '76mm' : '210mm'};
            margin: 0 auto;
            padding: 2mm;
        }
        
        .receipt-header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
        }
        
        .store-logo {
            margin-bottom: 5px;
        }
        
        .logo-circle {
            width: 40px;
            height: 40px;
            border: 3px solid #2c5530;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 3px auto;
            background-color: #fff;
        }
        
        .logo-text {
            font-size: 20px;
            font-weight: bold;
            color: #2c5530;
            font-family: serif;
        }
        
        .logo-decoration {
            font-size: 8px;
            text-align: center;
            margin-bottom: 3px;
            color: #2c5530;
        }
        
        .store-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 2px;
            color: #2c5530;
        }
        
        .store-subtitle {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
            color: #2c5530;
        }
        
        .store-tagline {
            font-size: 10px;
            font-style: italic;
            margin-bottom: 3px;
            color: #666;
        }
        
        .store-info {
            font-size: 10px;
            margin-bottom: 2px;
            color: #444;
        }
        
        .store-phone {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #000;
        }
        
        .invoice-info {
            margin: 10px 0;
            font-size: 11px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        
        .items-table th,
        .items-table td {
            text-align: left;
            padding: 2px;
            font-size: 10px;
            border-bottom: 1px dotted #ccc;
        }
        
        .items-table th {
            border-bottom: 1px solid #000;
            font-weight: bold;
        }
        
        .item-name {
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .total-section {
            border-top: 1px solid #000;
            margin-top: 10px;
            padding-top: 5px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 11px;
        }
        
        .grand-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            margin-top: 5px;
        }
        
        .balance-row {
            font-weight: bold;
            font-size: 12px;
            border-top: 1px dotted #000;
            padding-top: 3px;
            margin-top: 3px;
            color: #2c5530;
        }
        
        .receipt-footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
        }
        
        .thank-you {
            font-weight: bold;
            margin: 5px 0;
        }
        
        .footer-details {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dotted #000;
        }
        
        .footer-row {
            text-align: left;
            margin: 2px 0;
            font-size: 9px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="receipt-header">
        <div class="store-logo">
            <div class="logo-circle">
                <div class="logo-text">W</div>
            </div>
            <div class="logo-decoration">★ ═══════════════ ★</div>
        </div>
        <div class="store-name">Wabees</div>
        <div class="store-subtitle">Shoe Palace</div>
        <div class="store-tagline">Since 1992</div>
        <div class="store-info">Authentic Foot Wear</div>
        <div class="store-phone">📞 077-064-7338 | 075-886-0234</div>
    </div>
    
    ${invoiceData.customerName ? `
        <div class="customer-info">
            <div style="font-size: 11px; text-align: center; margin: 10px 0;">
                <strong>Customer: ${invoiceData.customerName}</strong>
            </div>
        </div>
    ` : ''}
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Product</th>
                <th>Qty</th>
                <th class="text-right">Actual Price</th>
                <th class="text-right">Discount</th>
                <th class="text-right">Total Price</th>
            </tr>
        </thead>
        <tbody>
            ${(invoiceData.items || []).map(item => {
                console.log('=== Processing Item ===');
                console.log('Full item data:', JSON.stringify(item, null, 2));
                
                // List ALL properties to find where discount might be hiding
                console.log('All item properties:', Object.keys(item));
                
                // Handle different price and discount property names
                const actualPrice = item.price || item.sellingPrice || item.originalPrice || item.unitPrice || 0;
                const quantity = item.quantity || item.qty || 1;
                
                // Try to find discount in ALL possible locations
                let discount = 0;
                let discountSource = 'none';
                
                // Check all possible discount properties
                if (item.discount && item.discount > 0) { discount = item.discount; discountSource = 'discount'; }
                else if (item.itemDiscount && item.itemDiscount > 0) { discount = item.itemDiscount; discountSource = 'itemDiscount'; }
                else if (item.discountAmount && item.discountAmount > 0) { discount = item.discountAmount; discountSource = 'discountAmount'; }
                else if (item.discountPerItem && item.discountPerItem > 0) { discount = item.discountPerItem; discountSource = 'discountPerItem'; }
                else if (item.unitDiscount && item.unitDiscount > 0) { discount = item.unitDiscount; discountSource = 'unitDiscount'; }
                else if (item.priceDiscount && item.priceDiscount > 0) { discount = item.priceDiscount; discountSource = 'priceDiscount'; }
                else if (item.itemPriceDiscount && item.itemPriceDiscount > 0) { discount = item.itemPriceDiscount; discountSource = 'itemPriceDiscount'; }
                
                // Check if there's a discounted price vs original price
                if (discount === 0 && item.originalPrice && item.price && item.originalPrice > item.price) {
                    discount = item.originalPrice - item.price;
                    discountSource = 'calculated from originalPrice vs price';
                }
                
                // Check if there's a total vs subtotal difference
                if (discount === 0 && item.subtotal && item.total && item.subtotal > item.total) {
                    discount = (item.subtotal - item.total) / quantity;
                    discountSource = 'calculated from subtotal vs total';
                }
                
                // Calculate the actual total price after discount
                const totalBeforeDiscount = actualPrice * quantity;
                const totalDiscountAmount = discount * quantity;
                const finalTotalPrice = totalBeforeDiscount - totalDiscountAmount;
                
                console.log('=== Item Calculation Results ===');
                console.log('- Name:', item.name);
                console.log('- Actual Price:', actualPrice);
                console.log('- Quantity:', quantity);
                console.log('- Discount found:', discount, '(source:', discountSource + ')');
                console.log('- Total before discount:', totalBeforeDiscount);
                console.log('- Total discount amount:', totalDiscountAmount);
                console.log('- Final total price:', finalTotalPrice);
                console.log('============================');
                
                return `
                <tr>
                    <td class="item-name">${item.name || 'Unknown Item'}</td>
                    <td class="text-center">${quantity}</td>
                    <td class="text-right">Rs. ${actualPrice.toFixed(2)}</td>
                    <td class="text-right">${discount > 0 ? 'Rs. ' + discount.toFixed(2) : ''}</td>
                    <td class="text-right">Rs. ${finalTotalPrice.toFixed(2)}</td>
                </tr>
                `;
            }).join('')}
        </tbody>
    </table>
    
    ${isDebugMode && invoiceData.items && invoiceData.items.length > 0 ? `
        <div style="border: 2px solid red; padding: 10px; margin: 10px 0; font-size: 8px; background: #f0f0f0;">
            <strong>DEBUG - First Item Data:</strong><br>
            <pre style="font-size: 7px; white-space: pre-wrap;">${JSON.stringify(invoiceData.items[0], null, 2)}</pre>
        </div>
    ` : ''}
    
    <div class="total-section">
        ${(() => {
            // Calculate totals using exact same logic as table
            const items = invoiceData.items || [];
            console.log('=== Calculating Totals ===');
            console.log('Full invoice data:', JSON.stringify(invoiceData, null, 2));
            
            let originalTotal = 0;
            let totalItemDiscounts = 0;
            let netTotal = 0;
            
            items.forEach(item => {
                const actualPrice = item.price || item.sellingPrice || item.originalPrice || item.unitPrice || 0;
                const quantity = item.quantity || item.qty || 1;
                
                // Same discount logic as table
                let discount = 0;
                if (item.discount) discount = item.discount;
                else if (item.itemDiscount) discount = item.itemDiscount;
                else if (item.discountAmount) discount = item.discountAmount;
                else if (item.discountPerItem) discount = item.discountPerItem;
                else if (item.unitDiscount) discount = item.unitDiscount;
                
                const totalBeforeDiscount = actualPrice * quantity;
                const totalDiscountAmount = discount * quantity;
                const finalTotalPrice = totalBeforeDiscount - totalDiscountAmount;
                
                originalTotal += totalBeforeDiscount;
                totalItemDiscounts += totalDiscountAmount;
                netTotal += finalTotalPrice;
            });
            
            // Look for additional discount in different places
            let additionalDiscount = 0;
            if (invoiceData.additionalDiscount) additionalDiscount = invoiceData.additionalDiscount;
            else if (invoiceData.extraDiscount) additionalDiscount = invoiceData.extraDiscount;
            else if (invoiceData.discount) additionalDiscount = invoiceData.discount;
            else if (invoiceData.orderDiscount) additionalDiscount = invoiceData.orderDiscount;
            
            const finalTotal = netTotal - additionalDiscount;
            const customerPaid = invoiceData.amountPaid || invoiceData.customerPaid || invoiceData.paid || 0;
            const balance = customerPaid - finalTotal;
            
            console.log('Totals calculation:');
            console.log('- Original Total:', originalTotal);
            console.log('- Item Discounts:', totalItemDiscounts);
            console.log('- Net after item discounts:', netTotal);
            console.log('- Additional Discount:', additionalDiscount);
            console.log('- Final Total:', finalTotal);
            console.log('- Customer Paid:', customerPaid);
            console.log('- Balance/Change:', balance);
            
            return `
                <div class="total-row">
                    <span>Total Price:</span>
                    <span>Rs. ${originalTotal.toFixed(2)}</span>
                </div>
                ${totalItemDiscounts > 0 ? `
                    <div class="total-row">
                        <span>Item Discounts:</span>
                        <span>- Rs. ${totalItemDiscounts.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Net Amount:</span>
                        <span>Rs. ${netTotal.toFixed(2)}</span>
                    </div>
                ` : ''}
                ${additionalDiscount > 0 ? `
                    <div class="total-row">
                        <span>Additional Discount:</span>
                        <span>- Rs. ${additionalDiscount.toFixed(2)}</span>
                    </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>TOTAL PRICE:</span>
                    <span>Rs. ${(invoiceData.total || invoiceData.grandTotal || finalTotal).toFixed(2)}</span>
                </div>
                ${customerPaid > 0 ? `
                    <div class="total-row">
                        <span>Customer Paid:</span>
                        <span>Rs. ${customerPaid.toFixed(2)}</span>
                    </div>
                    <div class="total-row balance-row">
                        <span>${balance >= 0 ? 'Change:' : 'Balance Due:'}</span>
                        <span>Rs. ${Math.abs(balance).toFixed(2)}</span>
                    </div>
                ` : ''}
                ${invoiceData.paymentMethod ? `
                    <div class="total-row">
                        <span>Payment Method:</span>
                        <span>${invoiceData.paymentMethod}</span>
                    </div>
                ` : ''}
            `;
        })()}
    </div>
    
    <div class="receipt-footer">
        <div class="thank-you">Thank You for Your Purchase!</div>
        <div>Please Come Again</div>
        <div style="margin-top: 10px; font-size: 9px;">
            Exchange within 7 days with receipt
        </div>
        
        <div class="footer-details">
            <div class="footer-row">
                <span>Cashier: ${invoiceData.cashier || invoiceData.servedBy || 'Staff'}</span>
            </div>
            <div class="footer-row">
                <span>Time: ${invoiceData.time || new Date().toLocaleTimeString()}</span>
            </div>
            <div class="footer-row">
                <span>Invoice: ${invoiceData.invoiceNumber || 'N/A'}</span>
            </div>
            <div class="footer-row">
                <span>Date: ${invoiceData.date ? new Date(invoiceData.date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Open cash drawer (simplified - just show alert)
  async openCashDrawer(): Promise<PrintServiceResponse> {
    try {
      console.log('💰 Opening cash drawer...');
      
      // Show a simple alert since we can't control hardware directly
      alert('Cash drawer should open now.\n\nIf your cash drawer doesn\'t open automatically, please open it manually.');
      
      return {
        success: true,
        message: 'Cash drawer open command sent'
      };
    } catch (error) {
      console.error('Error opening cash drawer:', error);
      return {
        success: false,
        message: 'Failed to open cash drawer: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  // Log successful prints
  private logPrintSuccess(method: string, invoiceData: InvoiceData): void {
    const printRecord: PrintRecord = {
      timestamp: new Date().toISOString(),
      invoiceNumber: invoiceData.invoiceNumber || 'N/A',
      method: method,
      total: invoiceData.total || invoiceData.grandTotal || 0
    };
    
    this.printHistory.push(printRecord);
    console.log('📝 Print logged:', printRecord);
  }

  // Get print history
  getPrintHistory(): PrintRecord[] {
    return this.printHistory;
  }

  // Clear print history
  clearPrintHistory(): void {
    this.printHistory = [];
    console.log('🗑️ Print history cleared');
  }

  // Method alias for compatibility - print invoice
  async printInvoice(invoiceData: InvoiceData, options?: PrintOptions): Promise<PrintServiceResponse> {
    return this.printReceipt(invoiceData, options);
  }

  // Method for printing barcode stickers
  async printBarcodeSticker(product: any): Promise<PrintServiceResponse> {
    try {
      const barcodeData: InvoiceData = {
        items: [{
          name: product.name || 'Unknown Product',
          price: product.price || product.sellingPrice || 0
        }],
        total: 0,
        invoiceNumber: product.barcode || product.sku || product._id || product.id || 'N/A'
      };
      
      console.log('🏷️ Printing barcode sticker for:', product.name);
      return this.printReceipt(barcodeData, { isDebugMode: true });
    } catch (error) {
      console.error('Error printing barcode sticker:', error);
      return {
        success: false,
        message: 'Failed to print barcode sticker: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }
}

// Export singleton instance (keeping same name for compatibility)
const universalPrintService = new SimplePrintService();
export default universalPrintService; 