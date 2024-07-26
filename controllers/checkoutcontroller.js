// const Stripe = require("stripe");
// const { Order } = require("../models/Order");
// require("dotenv").config();
// const zlib = require('zlib');

// const stripe = Stripe(process.env.STRIPE_KEY);

// const createCheckoutSession = async (req, res) => {
//   try {
    
//   const { cartData, amount, userData } = req.body.data;
//   const compressedCartData = zlib.gzipSync(JSON.stringify(cartData)).toString('base64');
//     const customer = await stripe.customers.create({
//       metadata: {
//         userId: userData.userId,
//         cartData: compressedCartData,
//       },
//     });
//     const unitAmount = Math.round(amount.total * 100);


//     // Create a new checkout session
//     const session = await stripe.checkout.sessions.create({
//       line_items: [ 
//         { 
//           price_data: { 
//             currency: "usd",
//             product_data: { 
//               name: "Total Amount", 
//             }, 
//             unit_amount: unitAmount, 
//           }, 
//           quantity: 1,
//         }
//       ], 
//       payment_method_types: ["card"],
//       shipping_address_collection: {
//         allowed_countries: ["US"],
//       },
//       // shipping_options: shippingOptions,
//       phone_number_collection: {
//         enabled: true,
//       },
//       mode: "payment",
//       customer: customer.id,
//       success_url: `${process.env.CLIENT_URL}/checkout-success`,
//       cancel_url: `${process.env.CLIENT_URL}/checkout`,
//     });

//     // Send the URL of the checkout session to the client
//     res.send({ url: session.url });
//   } catch (error) {
//     console.error("Error creating checkout session:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// };


// const createOrder = async (customer, data) => {
//   try {
//     // Parse the compressed cartData from customer metadata
//     const compressedCartData = customer.metadata.cartData;
//     const decompressedCartData = zlib.gunzipSync(Buffer.from(compressedCartData, 'base64')).toString();

//     // Parse the decompressed cartData
//     const Items = JSON.parse(decompressedCartData);
//     console.log("Parsed cart items:", Items);

//     // Rest of your code remains the same...
//     const products = Items.map((item) => {
//       // Extract topping names from each topping object, or show "No description" if no toppings are available
//       const toppingNames = item.toppings.length > 0 ? item.toppings.map(topping => topping.text) : ["No description"];
//       return {
//           productId: item.id,
//           productName: item.name,
//           extraTopings: toppingNames.join(', '), // Join topping names into a string
//           quantity: item.qty,
//           imageUrl: item.img,
//       };
//   });  


//     console.log(products)

//     const newOrder = new Order({
//       userId: customer.metadata.userId,
//       customerId: data.customer,
//       paymentIntentId: data.payment_intent,
//       products,
//       subtotal: data.amount_subtotal / 100,
//       total: data.amount_total / 100,
//       shipping: data.customer_details,
//       payment_status: data.payment_status,
//       transactionId: data.payment_intent,
//     });

//     const savedOrder = await newOrder.save();
//     console.log("Processed Order:", savedOrder);
//   } catch (error) {
//     console.log(error);
//   }
// };


// const handleWebhook = async (req, res) => {
//   try {
//     let data;
//     let eventType;

//     let webhookSecret;
//     //webhookSecret = process.env.STRIPE_WEB_HOOK;

//     if (webhookSecret) {
//       let event;
//       let signature = req.headers["stripe-signature"];

//       try {
//         event = stripe.webhooks.constructEvent(
//           req.body,
//           signature,
//           webhookSecret
//         );
//       } catch (error) {
//         console.log(`⚠  Webhook signature verification failed:  ${error}`);
//         return res.sendStatus(400);
//       }
//       data = event.data.object;
//       eventType = event.type;
//     } else {
//       data = req.body.data.object;
//       eventType = req.body.type;
//     }

//     if (eventType === "checkout.session.completed") {
//       stripe.customers
//         .retrieve(data.customer)
//         .then(async (customer) => {
//           try {
//             await createOrder(customer, data);
//           } catch (error) {
//             console.log(error);
//           }
//         })
//         .catch((error) => console.log(error.message));
//     }

//     res.status(200).end();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       error: "Internal Server Error",
//       success: false,
//     });
//   }
// };


// const getAllOrders = async (req, res) => {
//   try {
//       // const orderItems = await Order.find();
//       const orderItems = await Order.find().sort({ createdAt: -1 });

//        res.status(200).json({
//           message: "View Order Successfully",
//           successz: true,
//           data:{
//               order: orderItems,
//           }
//        })
//   } catch (error) {
//       console.log(error);
//       res.status(500).json({
//           error: "Internal Server Error",
//           success: false,
//       });
//   }
// };

// module.exports = { createCheckoutSession, createOrder, handleWebhook, getAllOrders};





const Stripe = require("stripe");
const { Order } = require("../models/Order");
require("dotenv").config();
const zlib = require('zlib');
const { sendNewOrder } = require('./sseController'); // Adjust the path as per your file structure

const stripe = Stripe(process.env.STRIPE_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { comboData, comboData2, comboData3, comboData4, cartData, amount, userData } = req.body.data;
    console.log("that is combodata1", comboData);
    console.log("that is combodata2", comboData2);
    console.log("that is combodata3", comboData3);
    console.log("that is combodata4", comboData4);

    const compressedCartData = zlib.gzipSync(JSON.stringify(cartData)).toString('base64');

    let customerMetadata = {
      userId: userData.userId,
      cartData: compressedCartData,
    };

    // Check if comboData1 is not empty
    if (comboData && Object.keys(comboData).length > 0) {
      const compressedComboData = zlib.gzipSync(JSON.stringify(comboData)).toString('base64');
      customerMetadata.comboData = compressedComboData;
    }

    // Check if comboData2 is not empty
    if (comboData2 && Object.keys(comboData2).length > 0) {
      const compressedComboData2 = zlib.gzipSync(JSON.stringify(comboData2)).toString('base64');
      customerMetadata.comboData2 = compressedComboData2;
    }

    // Check if comboData3 is not empty
    if (comboData3 && Object.keys(comboData3).length > 0) {
      const compressedComboData3 = zlib.gzipSync(JSON.stringify(comboData3)).toString('base64');
      customerMetadata.comboData3 = compressedComboData3;
    }

    // Check if comboData4 is not empty
    if (comboData4 && Object.keys(comboData4).length > 0) {
      const compressedComboData4 = zlib.gzipSync(JSON.stringify(comboData4)).toString('base64');
      customerMetadata.comboData4 = compressedComboData4;
    }

    const customer = await stripe.customers.create({
      metadata: customerMetadata,
    });

    const unitAmount = Math.round(amount.total * 100);

    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Total Amount",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        }
      ],
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      phone_number_collection: {
        enabled: true,
      },
      mode: "payment",
      customer: customer.id,
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    // Send the URL of the checkout session to the client
    res.send({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};



const createOrder = async (customer, data) => {
  try {
    // Decompress cartData from customer metadata
    const decompressedCartData = zlib.gunzipSync(Buffer.from(customer.metadata.cartData, 'base64')).toString();
    const Items = JSON.parse(decompressedCartData);

    // Map cart items
    const products = Items.map((item) => {
      const toppingNames = item.toppings.length > 0 ? item.toppings.map(topping => topping.text) : ["No description"];
      return {
        productId: item.id,
        productName: item.name,
        extraTopings: toppingNames.join(', '),
        quantity: item.qty,
        imageUrl: item.img,
      };
    });

    let combo = [];
    
    // Check if comboData1 exists in customer metadata
    if (customer.metadata.comboData) {
      const decompressedComboData = zlib.gunzipSync(Buffer.from(customer.metadata.comboData, 'base64')).toString();
      const comboItems = JSON.parse(decompressedComboData);
      combo.push({
        offerName: comboItems.offerName || "No offer name",
        pizzas: Array.isArray(comboItems.pizza) ? comboItems.pizza.map(pizza => ({
          title: pizza.title || "No title",
          toppings: Array.isArray(pizza.toppings) ? pizza.toppings.join(', ') : "No toppings",
        })) : [],
        addedItems: Array.isArray(comboItems.addedItems) ? comboItems.addedItems.join(', ') : "No added items",
        extraAdded: comboItems.extraAdded || "No extra added",
        totalAmount: comboItems.totalAmount || 0,
      });
    }

    // Check if comboData2 exists in customer metadata
    if (customer.metadata.comboData2) {
      const decompressedComboData2 = zlib.gunzipSync(Buffer.from(customer.metadata.comboData2, 'base64')).toString();
      const comboItems2 = JSON.parse(decompressedComboData2);
      combo.push({
        offerName: comboItems2.offerName || "No offer name",
        pizzas: Array.isArray(comboItems2.pizza) ? comboItems2.pizza.map(pizza => ({
          title: pizza.title || "No title",
          toppings: Array.isArray(pizza.toppings) ? pizza.toppings.join(', ') : "No toppings",
        })) : [],
        addedItems: Array.isArray(comboItems2.addedItems) ? comboItems2.addedItems.join(', ') : "No added items",
        extraAdded: comboItems2.extraAdded || "No extra added",
        totalAmount: comboItems2.totalAmount || 0,
      });
    }

    // Check if comboData3 exists in customer metadata
    if (customer.metadata.comboData3) {
      const decompressedComboData3 = zlib.gunzipSync(Buffer.from(customer.metadata.comboData3, 'base64')).toString();
      const comboItems3 = JSON.parse(decompressedComboData3);
      combo.push({
        offerName: comboItems3.offerName || "No offer name",
        pizzas: Array.isArray(comboItems3.pizza) ? comboItems3.pizza.map(pizza => ({
          title: pizza.title || "No title",
          toppings: Array.isArray(pizza.toppings) ? pizza.toppings.join(', ') : "No toppings",
        })) : [],
        addedItems: Array.isArray(comboItems3.addedItems) ? comboItems3.addedItems.join(', ') : "No added items",
        extraAdded: comboItems3.extraAdded || "No extra added",
        totalAmount: comboItems3.totalAmount || 0,
      });
    }

    // Check if comboData4 exists in customer metadata
    if (customer.metadata.comboData4) {
      const decompressedComboData4 = zlib.gunzipSync(Buffer.from(customer.metadata.comboData4, 'base64')).toString();
      const comboItems4 = JSON.parse(decompressedComboData4);
      combo.push({
        offerName: comboItems4.offerName || "No offer name",
        pizzas: Array.isArray(comboItems4.pizza) ? comboItems4.pizza.map(pizza => ({
          title: pizza.title || "No title",
          toppings: Array.isArray(pizza.toppings) ? pizza.toppings.join(', ') : "No toppings",
        })) : [],
        addedItems: Array.isArray(comboItems4.addedItems) ? comboItems4.addedItems.join(', ') : "No added items",
        extraAdded: comboItems4.extraAdded || "No extra added",
        totalAmount: comboItems4.totalAmount || 0,
      });
    }

    // Create and save a new order
    const newOrder = new Order({
      userId: customer.metadata.userId,
      customerId: data.customer,
      paymentIntentId: data.payment_intent,
      products,
      combo, // Will be an empty array if no comboData was provided
      subtotal: data.amount_subtotal / 100,
      total: data.amount_total / 100,
      shipping: data.customer_details,
      payment_status: data.payment_status,
      transactionId: data.payment_intent,
    });

    const savedOrder = await newOrder.save();
    console.log("Processed Order:", savedOrder);

    // Emit SSE event
    sendNewOrder(savedOrder);
  } catch (error) {
    console.log("Error in createOrder:", error);
  }
};





const handleWebhook = async (req, res) => {
  try {
    let data;
    let eventType;

    let webhookSecret;
    //webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (error) {
        console.log(`⚠  Webhook signature verification failed:  ${error}`);
        return res.sendStatus(400);
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }

    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            await createOrder(customer, data);
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => console.log(error.message));
    }

    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
      success: false,
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
      // const orderItems = await Order.find();
      const orderItems = await Order.find().sort({ createdAt: -1 });

       res.status(200).json({
          message: "View Order Successfully",
          success: true,
          data:{
              order: orderItems,
          }
       })
  } catch (error) {
      console.log(error);
      res.status(500).json({
          error: "Internal Server Error",
          success: false,
      });
  }
};

module.exports = { createCheckoutSession, createOrder, handleWebhook, getAllOrders};