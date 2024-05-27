const Subscription = require("../models/subscriptionModel");

/**
 * subscriptionController.js
 *
 * @description :: Server-side logic for managing subscriptions.
 */
module.exports = {
  subscribe: async (req, res) => {
    try {
      console.log("Subscription request received");
      const { subscription, userId } = req.body;

      console.log("User ID:", userId);
      console.log("Subscription:", subscription);

      let existingSubscription = await Subscription.findOne({ userId });

      if (existingSubscription) {
        console.log("Existing subscription found. Updating...");
        existingSubscription.subscription = subscription;
        await existingSubscription.save();
      } else {
        console.log("No existing subscription. Creating new...");
        const newSubscription = new Subscription({ userId, subscription });
        await newSubscription.save();
      }

      res.status(201).json({ message: "Subscription saved." });
    } catch (error) {
      console.error("Error saving subscription:", error);
      res.status(500).json({ message: "Failed to save subscription.", error });
    }
  },
};
