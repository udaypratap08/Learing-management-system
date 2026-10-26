import { Webhook } from "svix";
import User from "../models/User.js";
import { request, response } from "express";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import { clerkClient } from "@clerk/express";

// API Controller Function to manage clerk user with database.

export const clerkWebhooks = async (req, res) => {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      console.error("CLERK_WEBHOOK_SECRET is missing");
      return res.status(500).json({
        success: false,
        message: "Webhook secret is missing",
      });
    }

    const whook = new Webhook(secret);

    const event = whook.verify(req.body.toString("utf8"), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = event;

    if (type === "user.created" || type === "user.updated") {
      const email =
        data.email_addresses?.find(
          (item) => item.id === data.primary_email_address_id,
        )?.email_address || data.email_addresses?.[0]?.email_address;

      // User schema mein email required hai.
      if (!email) {
        console.error("No email found for Clerk user:", data.id);
        return res.status(400).json({
          success: false,
          message: "User email is missing",
        });
      }

      const userData = {
        email,
        name:
          [data.first_name, data.last_name].filter(Boolean).join(" ") ||
          data.username ||
          email,
        imageUrl: data.image_url || "",
         // Naye user ka default role
         ...(type === 'user.created' ? { role: 'student' } : {})
      };

      await User.findByIdAndUpdate(
        data.id,
        {
          $set: userData,
          $setOnInsert: { _id: data.id },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      // Sirf naye user ka role default student set karo.
      // Existing educator ka role change nahi hoga.
      if (type === "user.created") {
        const clerkUser = await clerkClient.users.getUser(data.id);

        if (!clerkUser.publicMetadata?.role) {
          await clerkClient.users.updateUserMetadata(data.id, {
            publicMetadata: {
              ...clerkUser.publicMetadata,
              role: "student",
            },
          });
        }
      }
    } else if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);

    return res.status(400).json({
      success: false,
      message: "Webhook verification or processing failed",
    });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event...

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId);

      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(
        purchaseData.courseId.toString(),
      );

      courseData.enrolledStudents.push(userData);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = "completed";
      await purchaseData.save();

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = "failed";
      await purchaseData.save();

      break;
    }
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({ received: true });
};
