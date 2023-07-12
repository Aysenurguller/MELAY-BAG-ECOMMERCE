import express from "express";
import asyncHandler from "express-async-handler";
import { seller, admin, protect } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";
import Product from "./../Models/ProductModel.js";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const orderRouter = express.Router();

const emailTo = "gulleraysenur@gmail.com";

// CREATE ORDER
orderRouter.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
      return;
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createOrder = await order.save();

      res.status(201).json(createOrder);

      const doc = new PDFDocument();

      // Add invoice title and order number
      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Order Number: ${order._id}`, { align: "center" });
      doc.moveDown(1);

      // Add shipping address
      doc.fontSize(12).text("Shipping Address:");
      doc.fontSize(10).text(`Address: ${order.shippingAddress.address}`);
      doc.fontSize(10).text(`City: ${order.shippingAddress.city}`);
      doc.fontSize(10).text(`Postal Code: ${order.shippingAddress.postalCode}`);
      doc.fontSize(10).text(`Country: ${order.shippingAddress.country}`);
      doc.moveDown(1);

      // Add order items
      doc.fontSize(12).text("Order Details:");
      order.orderItems.forEach((item, index) => {
        doc.fontSize(10).text(`Product ${index + 1}: ${item.name}`);
        doc.fontSize(10).text(`Price: $${item.price}`);
        doc.fontSize(10).text(`Quantity: ${item.qty}`);
        doc.moveDown(0.5);
      });

      // Add total price
      doc.moveDown(1);
      doc
        .fontSize(12)
        .text(`Total Price: $${order.totalPrice}`, { align: "right" });
      doc.end();

      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "gecicikayithesap1@hotmail.com",
          pass: "@AwExeGadai7",
        },
      });

      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);

        if (product) {
          console.log(`Product found: ${product.name}`);
          console.log(`Old stock count: ${product.countInStock}`);

          await Product.updateOne(
            { _id: item.product },
            { $inc: { countInStock: -item.qty } }
          );

          console.log(`Stock count updated for product: ${product.name}`);

          // Fetch the updated product after the update
          const updatedProduct = await Product.findById(item.product);
          console.log(`New stock count: ${updatedProduct.countInStock}`);
        } else {
          console.log(`Product not found for item: ${item.name}`);
        }
      }

      const mailOptions = {
        from: "gecicikayithesap1@hotmail.com",
        to: emailTo,
        subject: "Order Confirmation and Invoice",
        html: `
        <h1>Thank you for your order!</h1>
        <p>Your invoice is attached.</p>
      `,
        attachments: [
          {
            filename: `${order._id}.pdf`,
            content: doc,
            contentType: "application/pdf",
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Email error:", error);
        }
        console.log("Email sent");
      });

      res.json(updatedOrder);
    }
  })
);

// ADMIN GET ALL ORDERS
orderRouter.get(
  "/all",
  protect,
  admin,
  seller,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);

// USER LOGIN ORDERS
orderRouter.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });
    res.json(order);
  })
);

// GET ORDER BY ID
orderRouter.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// GET ORDER Invoice BY OrderID
orderRouter.get(
  "/:id/invoice",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      // PDF faturasını oluşturun
      const doc = new PDFDocument();

      // Add invoice title and order number
      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Order Number: ${order._id}`, { align: "center" });
      doc.moveDown(1);

      // Add shipping address
      doc.fontSize(12).text("Shipping Address:");
      doc.fontSize(10).text(`Address: ${order.shippingAddress.address}`);
      doc.fontSize(10).text(`City: ${order.shippingAddress.city}`);
      doc.fontSize(10).text(`Postal Code: ${order.shippingAddress.postalCode}`);
      doc.fontSize(10).text(`Country: ${order.shippingAddress.country}`);
      doc.moveDown(1);

      // Add order items
      doc.fontSize(12).text("Order Details:");
      order.orderItems.forEach((item, index) => {
        doc.fontSize(10).text(`Product ${index + 1}: ${item.name}`);
        doc.fontSize(10).text(`Price: $${item.price}`);
        doc.fontSize(10).text(`Quantity: ${item.qty}`);
        doc.moveDown(0.5);
      });

      // Add total price
      doc.moveDown(1);
      doc
        .fontSize(12)
        .text(`Total Price: $${order.totalPrice}`, { align: "right" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="invoice.pdf"'
      );
      doc.pipe(res);
      doc.end();
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS PAID
orderRouter.put(
  "/:id/pay",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();

      // Reduce the stock quantity
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);

        if (product) {
          console.log(`Product found: ${product.name}`);
          console.log(`Old stock count: ${product.countInStock}`);

          await Product.updateOne(
            { _id: item.product },
            { $inc: { countInStock: -item.qty } }
          );

          console.log(`Stock count updated for product: ${product.name}`);

          // Fetch the updated product after the update
          const updatedProduct = await Product.findById(item.product);
          console.log(`New stock count: ${updatedProduct.countInStock}`);
        } else {
          console.log(`Product not found for item: ${item.name}`);
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS DELIVERED
orderRouter.put(
  "/:id/delivered",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS TRANSIT
orderRouter.put(
  "/:id/intransit",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isInTransit = true;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS RETURNED
orderRouter.put(
  "/:id/returned",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isReturned = true;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS REJECTED
orderRouter.put(
  "/:id/rejected",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isReturned = false;

      const updatedOrder = await order.save();

      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "melaybag@hotmail.com",
          pass: "finaldemo123",
        },
      });

      const mailOptions = {
        from: "melaybag@hotmail.com",
        to: emailTo,
        subject: "Order Return Confirmed",
        html: `
        <h1>Your order return has been rejected by the seller</h1>
      `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("e-mail  error:", error);
        }
        console.log("e-mail sent");
      });

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS ARCHIVED
orderRouter.put(
  "/:id/archived",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isArchived = true;

      const updatedOrder = await order.save();

      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "melaybag@hotmail.com",
          pass: "finaldemo123",
        },
      });

      const mailOptions = {
        from: "melaybag@hotmail.com",
        to: emailTo,
        subject: "Order Return Confirmed",
        html: `
        <h1>Your order return has been confirmed by the seller</h1>
        <p>Total returned value : ${order.totalPrice}</p>
      `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("e-mail  error:", error);
        }
        console.log("e-mail sent");
      });

      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);

        if (product) {
          console.log(`Product found: ${product.name}`);
          console.log(`Old stock count: ${product.countInStock}`);

          await Product.updateOne(
            { _id: item.product },
            { $inc: { countInStock: item.qty } }
          );

          console.log(`Stock count updated for product: ${product.name}`);

          // Fetch the updated product after the update
          const updatedProduct = await Product.findById(item.product);
          console.log(`New stock count: ${updatedProduct.countInStock}`);
        } else {
          console.log(`Product not found for item: ${item.name}`);
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

export default orderRouter;
