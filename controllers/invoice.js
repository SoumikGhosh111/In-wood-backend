// const { Order } = require("../models/Order");
// const puppeteer = require('puppeteer');

// const generateInvoice = async (req, res) => {
//   const { orderId } = req.params;
//   try {

//     // Fetch order data from MongoDB for the specified order ID
//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).send('Order not found');
//     }

//     const creationTime = order.createdAt.toLocaleString('en-US', { timeZone: 'America/New_York' });

//     // Generate PDF invoice
//     const pdfBuffer = await generateInvoicePDF(order, creationTime);

//     // Send the PDF as response
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('Error generating invoice:', error);
//     res.status(500).send('Error generating invoice');
//   }
// };

// async function generateInvoicePDF(order, creationTime) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
  
//   // Generate HTML content for the invoice
//   const htmlContent = `
//     <style>
//       body {
//         font-family: Arial, sans-serif;
//         margin: 0;
//         padding: 0;
//         background-color: #f5f5f5;
//       }

//       .invoice {
//         max-width: 800px;
//         margin: 20px auto;
//         padding: 20px;
//         background-color: #fff;
//         border: 1px solid #ccc;
//         border-radius: 8px;
//         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//       }

//       .invoice h1 {
//         font-size: 24px;
//         margin-bottom: 20px;
//         margin-left: 36%;
//         color: #333;
//       }

//       .invoice h2 {
//         font-size: 18px;
//         margin-bottom: 10px;
//         color: #444;
//       }

//       .invoice p {
//         margin: 5px 0;
//         color: #555;
//       }

//       .invoice ul {
//         list-style-type: none;
//         padding: 0;
//         margin: 0;
//       }

//       .invoice ul li {
//         margin-bottom: 5px;
//         color: #666;
//       }

//       .section {

//         margin-top: 20px;
//       }

//       .section-title {
//         font-size: 16px;
//         margin-bottom: 10px;
//         color: #555;
//       }

//       .section-content {
//         margin-left: 20px;
//         color: #666;
//       }
      
//       .product {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 10px;
//       }

//       .product .details {
//         flex: 1;
//       }

//       .product .quantity {
//         font-weight: bold;
//         color: #333;
//         text-align: right;
//       }

//       .address-details {
//         text-align: right;
//       }
//     </style>
//     <div class="invoice">
//       <h1>Order Invoice</h1>
//       <div class="section">
//         <h2>Order ID: ${order._id}</h2>
//         <h2>Transaction ID: ${order.transactionId}</h2>
//         <p><b>Order Creation Time: </b> ${creationTime}</p>
//         <p><b>Payment Status: </b> ${order.payment_status}</p>
//         <p><b> Delivery Status:</b> ${order.delivery_status}</p>
//         <h2>Total: $${order.total.toFixed(2)}</h2>
//       </div>
//       <div class="address-details">
//         <h2>Shipping Address:</h2>
//         <ul class="section">
//           <li>Email: ${order.shipping.email}</li>
//           <li>Name:  ${order.shipping.name}</li>
//           <li>Address 1: ${order.shipping.address.line1}</li>
//           <li>Address 2: ${order.shipping.address.line2}</li>
//           <li>City: ${order.shipping.address.city}</li>
//           <li>Country: ${order.shipping.address.country}</li>
//           <li>Zip Code: ${order.shipping.address.postal_code}</li>
//           <li>State: ${order.shipping.address.state}</li>
//           <li>Phone: ${order.shipping.phone}</li>
//         </ul>
//       </div>
//       <div class="section">
//         <h2>Products:</h2>
//         ${order.products.map(product => `
//           <div class="product">
//             <div class="details">
//               <p>Name: ${product.productName}</p>
//               <p>Toppings: ${product.extraTopings}</p>
//             </div>
//             <div class="quantity">
//               <p>Quantity: ${product.quantity}</p>
//             </div>
//           </div>
//         `).join('')}
//       </div>
//     </div>
//   `;

//   await page.setContent(htmlContent);
  
//   // Generate PDF from HTML
//   const pdfBuffer = await page.pdf({ format: 'A4' });

//   await browser.close();

//   return pdfBuffer;
// }

// module.exports = { generateInvoice };


const { Order } = require("../models/Order");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (req, res) => {
  const { orderId } = req.params;
  try {
    // Fetch order data from MongoDB for the specified order ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send('Order not found');
    }

    const creationTime = order.createdAt.toLocaleString('en-US', { timeZone: 'America/New_York' });

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(order, creationTime);

    // Send the PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).send('Error generating invoice');
  }
};

async function generateInvoicePDF(order, creationTime) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Generate PDF content
    doc.fontSize(20).text('Order Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Transaction ID: ${order.transactionId}`);
    doc.text(`Order Creation Time: ${creationTime}`);
    doc.text(`Payment Status: ${order.payment_status}`);
    doc.text(`Delivery Status: ${order.delivery_status}`);
    doc.text(`Total: $${order.total.toFixed(2)}`);
    doc.moveDown();

    doc.text('Shipping Address:', { underline: true });
    doc.text(`Email: ${order.shipping.email}`);
    doc.text(`Name: ${order.shipping.name}`);
    doc.text(`Address 1: ${order.shipping.address.line1}`);
    doc.text(`Address 2: ${order.shipping.address.line2}`);
    doc.text(`City: ${order.shipping.address.city}`);
    doc.text(`Country: ${order.shipping.address.country}`);
    doc.text(`Zip Code: ${order.shipping.address.postal_code}`);
    doc.text(`State: ${order.shipping.address.state}`);
    doc.text(`Phone: ${order.shipping.phone}`);
    doc.moveDown();

    if (order.products && order.products.length > 0) {
      doc.text('Products:', { underline: true });
      order.products.forEach(product => {
        doc.text(`Name: ${product.productName}`);
        doc.text(`Toppings: ${product.extraTopings}`);
        doc.text(`Quantity: ${product.quantity}`);
        doc.moveDown();
      });
    }

    if (order.combo && order.combo.length > 0) {
      doc.text('Combo Items:', { underline: true });
      order.combo.forEach(combo => {
        doc.text(`Offer Name: ${combo.offerName}`);
        doc.text('Pizzas:');
        combo.pizzas.forEach(pizza => {
          doc.text(`  - Base: ${pizza.title}`);
          doc.text(`    Toppings: ${pizza.toppings}`);
        });
        doc.text(`Added Items: ${combo.addedItems}`);
        doc.text(`Extra Added: ${combo.extraAdded}`);
        doc.moveDown();
      });
    }

    doc.end();
  });
}

module.exports = { generateInvoice };
